import fs from "fs";
import {
  StreamingTextResponse,
  LangChainStream,
  Message,
  experimental_StreamData,
} from "ai";
import { ChatOpenAI, OpenAIEmbeddings } from "@langchain/openai";
import { ChatAnthropic } from "@langchain/anthropic";
import {
  AgentExecutor,
  AgentFinish,
  AgentStep,
  createOpenAIFunctionsAgent,
} from "langchain/agents";
import { DynamicTool, DynamicStructuredTool } from "@langchain/core/tools";
import { formatXml } from "langchain/agents/format_scratchpad/xml";
import {
  SystemMessagePromptTemplate,
  HumanMessagePromptTemplate,
} from "@langchain/core/prompts";
import { AIMessage, HumanMessage } from "@langchain/core/messages";
import { ChatMessageHistory } from "langchain/stores/message/in_memory";
import { createStuffDocumentsChain } from "langchain/chains/combine_documents";
import { createRetrievalChain } from "langchain/chains/retrieval";
import { createRetrieverTool } from "langchain/tools/retriever";
import {
  ChatPromptTemplate,
  MessagesPlaceholder,
  PromptTemplate,
} from "@langchain/core/prompts";
import {
  TavilySearchAPIRetrieverFields,
  TavilySearchResults,
} from "@langchain/community/tools/tavily_search";
import { Document } from "langchain/document";
import {
  StringOutputParser,
  BytesOutputParser,
} from "@langchain/core/output_parsers";
import { HttpResponseOutputParser } from "langchain/output_parsers";
import { CheerioWebBaseLoader } from "langchain/document_loaders/web/cheerio";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import {
  RunnableSequence,
  RunnablePick,
  RunnableMap,
  RunnablePassthrough,
  RunnableWithMessageHistory,
} from "@langchain/core/runnables";
import { Tool, ToolParams } from "langchain/tools";
import { renderTextDescription } from "langchain/tools/render";
import { Tool as AITool } from "ai";
import { NextResponse } from "next/server";
import { GithubRepoLoader } from "langchain/document_loaders/web/github";
import * as parse from "pdf-parse";
import { PDFLoader } from "langchain/document_loaders/fs/pdf";
import { similarity } from "ml-distance";
import { Pinecone } from "@pinecone-database/pinecone";
import { PineconeStore } from "@langchain/pinecone";
import { convertDocsToString, getPineconeRetriever } from "./helpers";
import { BufferMemory } from "langchain/memory";
import hub, { pull } from "langchain/hub";
import { FunctionMessage, BaseMessage } from "@langchain/core/messages";

import z, { input } from "zod";
import { scrapeWebPage, scrapeWithProxy } from "@/lib/tool-functions";
import zodToJsonSchema from "zod-to-json-schema";
import { FunctionsAgentAction } from "langchain/dist/agents/openai_functions/output_parser";
import { convertToOpenAIFunction } from "@langchain/core/utils/function_calling";
import { XMLOutputParser } from "@langchain/core/output_parsers";
import { XMLAgentOutputParser} from "langchain/agents/xml/output_parser"
import { ChainValues } from "langchain/schema";

//export const runtime = "edge";

const webSite = "https://python.langchain.com/docs/get_started/introduction";
const webSite2 = "https://www.cruisebrothers.com/specials";
const webSite3 = "https://www.amazon.com/";

export async function POST(req: Request) {
  let response: ChainValues = { message: "Hello" };
  let result: any = "testing";
  const {
    messages,
    systemPrompt,
  }: { messages: Message[]; systemPrompt: string } = await req.json();

  // const test = await scrapeWebPage(webSite3);
  // console.log(test);
  //return NextResponse.json(response);

  const data = new experimental_StreamData();

  // important: use LangChainStream from the AI SDK:
  const { stream, handlers } = LangChainStream({
    // onCompletion: (resp) => {
    //   data.append(JSON.stringify({response: resp})); // example
    //   data.close();
    // },
    onCompletion: (resp) => {
      console.log("onCompletion", resp);
    },
    onStart: () => {
      console.log("onStart");
      // data.appendMessageAnnotation({ text: "onStart" });
      // data.append(JSON.stringify({ text2: "onStart" }));
    },
    onText: (resp) => {
      console.log("onText", resp);
      // data.appendMessageAnnotation({ text: "resp" });
      // data.append(JSON.stringify({ text2: "resp" }));
    },

    onToken: (resp) => {
      console.log("onToken", resp);
      // data.appendMessageAnnotation({ text: resp });
      // data.append(JSON.stringify({ text2: resp }));
    },
    onFinal: (resp) => {
      console.log("onFinal", resp);
      //data.appendMessageAnnotation({ text: "resp" });
      data.append(JSON.stringify(resp));
      data.close();
    },
    experimental_streamData: true,
  });

  const model = new ChatAnthropic({
    temperature: 0,
  }).bind({
    stop: ["</tool_input>", "</final_answer>"],
  });

  class SearchTool extends Tool {
    static lc_name() {
      return "SearchTool";
    }

    name = "search-tool";

    description = "This too performs a search about things and whatnot.";

    constructor(config?: ToolParams) {
      super(config);
    }

    async _call(_: string) {
      return "32 degrees";
    }
  }

  const tools = [new SearchTool()];

  const template = `You are a helpful assistant. Help the user answer any questions.
  
  You have access to the following tools🧮 
  
  {tools}
  
  In order to use a tool, you can use <tool></tool> and <tool_input></tool_input> tags. \
You will then get back a response in the form <observation></observation>
For example, if you have a tool called 'search' that could run a google search, in order to search for the weather in SF you would respond:

<tool>search</tool><tool_input>weather in SF</tool_input>
<observation>64 degrees</observation>

When you are done, respond with a final answer between <final_answer></final_answer>. For example:

<final_answer>The weather in SF is 64 degrees</final_answer>

Begin!

Question: {input}`;

  const prompt = ChatPromptTemplate.fromMessages([
    ["human", template],
    ["ai", "{agent_scratchpad}"],
  ]);

  const outputParser = new XMLAgentOutputParser();

  const runnableAgent = RunnableSequence.from([
    {
      input: (i: { input: string; tools: Tool[]; steps: AgentStep[] }) =>
        i.input,
      tools: (i: { input: string; tools: Tool[]; steps: AgentStep[] }) =>
        renderTextDescription(i.tools),
      agent_scratchpad: (i: {
        input: string;
        tools: Tool[];
        steps: AgentStep[];
      }) => formatXml(i.steps),
    },
    prompt,
    model,
    outputParser,
  ]);

  const executor = AgentExecutor.fromAgentAndTools({
    agent: runnableAgent,
    tools,
  });

  console.log("Loaded executor");

  const input = "What is the weather in SF?";
  console.log(`Calling executor with input: ${input}`);
  response = await executor.invoke({ input, tools });

  return NextResponse.json(response);
  // return new StreamingTextResponse(stream, {}, data);
}
