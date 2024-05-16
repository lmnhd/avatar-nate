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
  AgentAction,
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
import {
  AIMessage,
  HumanMessage,
  SystemMessage,
  FunctionMessage,
  BaseMessage,
} from "@langchain/core/messages";
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
import {
  SearchApi,
  WikipediaQueryRun,
  formatToOpenAIFunction,
} from "langchain/tools";
import { formatToOpenAIFunctionMessages } from "langchain/agents/format_scratchpad";

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
  RunnableLambda,
  RunnablePassthrough,
  RunnableWithMessageHistory,
} from "@langchain/core/runnables";
import { Tool, ToolParams } from "langchain/tools";
import {
  GmailSearch,
  GmailSendMessage,
  GmailGetMessage,
} from "langchain/tools/gmail";
import { Calculator } from "langchain/tools/calculator";
import { WebBrowser, getText, parseInputs } from "langchain/tools/webbrowser";
import { renderTextDescription } from "langchain/tools/render";
import { Tool as AITool } from "ai";
import { NextResponse } from "next/server";
import { GithubRepoLoader } from "langchain/document_loaders/web/github";
import * as parse from "pdf-parse";
import { PDFLoader } from "langchain/document_loaders/fs/pdf";
import { similarity } from "ml-distance";
import { Pinecone } from "@pinecone-database/pinecone";
import { PineconeStore } from "@langchain/pinecone";
import { convertDocsToString, getPineconeRetriever } from "../avatar/helpers";
import { BufferMemory } from "langchain/memory";
import hub, { pull } from "langchain/hub";

import z, { input } from "zod";
import {
  bingSearch,
  duckDuckGoZero,
  scrapeWebPage,
  scrapeWithProxy,
} from "@/lib/tool-functions";
import zodToJsonSchema from "zod-to-json-schema";
import {
  FunctionsAgentAction,
  OpenAIFunctionsAgentOutputParser,
} from "langchain/agents/openai/output_parser";
import { convertToOpenAIFunction } from "@langchain/core/utils/function_calling";
import { XMLOutputParser } from "@langchain/core/output_parsers";
import { XMLAgentOutputParser } from "langchain/agents/xml/output_parser";
import { ChainValues } from "langchain/schema";
import { ExaSearchResults } from "@langchain/exa";
import Exa from "exa-js";
import { ToolExecutor } from "@langchain/langgraph/prebuilt";
import { END, StateGraph } from "@langchain/langgraph";
import { ElevenLabsClient, play, stream as elStream } from "elevenlabs";
import { json } from "stream/consumers";

//export const runtime = "edge";

const webSite = "https://python.langchain.com/docs/get_started/introduction";
const webSite2 = "https://www.cruisebrothers.com/specials";
const webSite3 = "https://www.amazon.com/";

export async function POST(req: Request) {
  let response: ChainValues | string = { message: "Hello" };
  let result: any = "testing";
  const {
    messages,
    systemPrompt,
  }: { messages: Message[]; systemPrompt: string } = await req.json();

  const SYSTEM_TEMPLATE = `${systemPrompt}
  
  
  \n<Context>

  {context}

  </Context>`;
  

  // const test = await scrapeWebPage(webSite3);
  console.log(systemPrompt);
  //return NextResponse.json(response);

  const data = new experimental_StreamData();
  //let audio:any
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
      //data.append(audio);
      data.close();
    },
    experimental_streamData: true,
  });

  // RETRIEVER
  const INDEX_NAME = "avatar-embeddings-2";
  const retriever = await getPineconeRetriever(INDEX_NAME);

  // const test = convertDocsToString(await retriever.invoke("I am worried about next week?"));

  // console.log(test);

  // return new StreamingTextResponse(stream, {}, data);

  // TOOLS

  const tools = [
    // new DynamicTool({
    //   name: "the-source",
    //   description:
    //     "this tool provides the source of truth for the assistant's knowledge base.",
    //   func: async (input: string) =>
    //     convertDocsToString(await retriever.invoke(input)),
    //   //"Don't worry, be happy!",
    // }),
    new DynamicTool({
      name: "general-info-web-search",
      description:
        "use this for searching sites like wikipedia for historical information by entering a string search query.",
      func: async (input: string) => {
        return duckDuckGoZero(input);
        //return "Keep your chin up!";
      },
    }),
    new WebBrowser({
      model: new ChatOpenAI({ modelName: "gpt-3.5-turbo" }),
      embeddings: new OpenAIEmbeddings(),
    }),

    // new GmailSendMessage({
    //   credentials: { clientEmail:"Halimedetech@gmail.com", },
    // })

      new DynamicTool({
        name: "current-info-web-search",
        description:
          "use this to search the web for current news and information by entering a string search query.",
        func: async (input: string) => {
          return bingSearch(input);
          //return "There's always a silver lining!";
        },
      }),
  ];

  const chatHistory = messages.slice(0, -1).map((message) => {
    return message.role == "user"
      ? new HumanMessage(message.content)
      : new AIMessage(message.content);
  });

  const model = new ChatOpenAI({
    modelName: "gpt-3.5-turbo",
    temperature: 0,
    streaming: true,
    maxTokens: -1,
    verbose: true,
  });

  const modelWithFunctions = model.bind({
    functions: tools.map((tool) => convertToOpenAIFunction(tool)),
  });

  const MEMORY_KEY = "chat_history";
  const memoryPrompt = ChatPromptTemplate.fromMessages([
    ["system", SYSTEM_TEMPLATE],

    new MessagesPlaceholder(MEMORY_KEY),
    ["user", "{input}"],
    new MessagesPlaceholder("agent_scratchpad"),
  ]);

  // const testPrompt = await memoryPrompt.invoke({
  //   input: "I am worried about next week?",
  //   chat_history: chatHistory,
  //   context: "I am worried about next week?",
  //   agent_scratchpad: [],
  // });

  // console.log(testPrompt);

  // return NextResponse.json(testPrompt);

  const agentWithMemory = RunnableSequence.from([
    {
      input: (i) => i.input,
      agent_scratchpad: (i) => formatToOpenAIFunctionMessages(i.steps),
      chat_history: (i) => i.chat_history,
      context: async (i) =>
        convertDocsToString(await retriever.invoke(i.input)),
    },
    memoryPrompt,
    modelWithFunctions,
    new OpenAIFunctionsAgentOutputParser(),
  ]);

  const executorWithMemory = AgentExecutor.fromAgentAndTools({
    agent: agentWithMemory,
    tools,
    callbacks: [handlers],
    maxIterations: 3,
    verbose: true,
    returnIntermediateSteps: true,
  });

  response = executorWithMemory
    .invoke(
      {
        //input: `what is the web page 'https://cheerio.js.org/docs/intro' about?`,
        //input: "Hello",
        input: messages[messages.length - 1].content,

        chat_history: chatHistory,
      },
      { callbacks: [handlers] }
    )
    .catch(console.error);

  console.log(response);

  console.log(response);

  //return NextResponse.json(response);
  return new StreamingTextResponse(stream, {}, data);
}
