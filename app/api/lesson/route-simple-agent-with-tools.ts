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
import { AIMessage, HumanMessage, SystemMessage } from "@langchain/core/messages";
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
import { SearchApi, WikipediaQueryRun } from "langchain/tools";

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
import { ExaSearchResults } from "@langchain/exa";
import Exa from 'exa-js'

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

    console.log("api key", process.env.SEARCHAPI_API_KEY)

  // const tool = new WikipediaQueryRun({
  //   topKResults: 3,
  //   maxDocContentLength: 4000,
  // })
// const tool = new SearchApi( process.env.SEARCHAPI_API_KEY || '', {
//   engine: "google_news"
// })

const tool = new ExaSearchResults({
  client: new Exa(process.env.EXA_API_KEY || ''),
})
 const tools = [tool]

  // const res = await tool.call("Iran nuclear deal");

  // console.log(res)

  // return NextResponse.json(res);

  const prompt = await pull("hwchase17/openai-functions-agent") as ChatPromptTemplate;
 

  

  // const llm = new ChatAnthropic({
  //   temperature: 0.5,
  //   maxTokens: 500,
  // });
  const llm = new ChatOpenAI({})

  const agent = await createOpenAIFunctionsAgent({
    prompt,
    tools,
    llm,
   
  })
  const agentExecutor = new AgentExecutor({
    agent,
    tools
  })


  
  const message = [
    new SystemMessage("A user will input a year and you will get the superbowl champion for that year"),
    new HumanMessage("2023"),
  ]

   response = await agentExecutor.invoke({
    input: messages[messages.length - 1].content
   })

  return NextResponse.json(response);
  // return new StreamingTextResponse(stream, {}, data);
}
