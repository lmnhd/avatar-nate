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
  FunctionMessage, BaseMessage
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
import { SearchApi, WikipediaQueryRun, formatToOpenAIFunction } from "langchain/tools";
import { formatToOpenAIFunctionMessages} from 'langchain/agents/format_scratchpad'

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


import z, { input } from "zod";
import { bingSearch, duckDuckGoZero, scrapeWebPage, scrapeWithProxy } from "@/lib/tool-functions";
import zodToJsonSchema from "zod-to-json-schema";
import { FunctionsAgentAction, OpenAIFunctionsAgentOutputParser } from "langchain/agents/openai/output_parser";
import { convertToOpenAIFunction } from "@langchain/core/utils/function_calling";
import { XMLOutputParser } from "@langchain/core/output_parsers";
import { XMLAgentOutputParser } from "langchain/agents/xml/output_parser";
import { ChainValues } from "langchain/schema";
import { ExaSearchResults } from "@langchain/exa";
import Exa from "exa-js";

import { ToolExecutor } from '@langchain/langgraph/prebuilt'
import { StateGraph, END} from '@langchain/langgraph'
import { RunnableLambda } from '@langchain/core/runnables'
import { channel } from "diagnostics_channel";

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
  const { stream , handlers } = LangChainStream({
    // onCompletion: (resp) => {
    //   data.append(JSON.stringify({response: resp})); // example
    //   data.close();
    // },
    onCompletion: (resp) => {
      console.log("onCompletion", resp);
    },
    // onStart: () => {
    //   console.log("onStart");
    //   // data.appendMessageAnnotation({ text: "onStart" });
    //   // data.append(JSON.stringify({ text2: "onStart" }));
    // },
    // onText: (resp) => {
    //   console.log("onText", resp);
    //   // data.appendMessageAnnotation({ text: "resp" });
    //   // data.append(JSON.stringify({ text2: "resp" }));
    // },

    // onToken: (resp) => {
    //   console.log("onToken", resp);
    //   // data.appendMessageAnnotation({ text: resp });
    //   // data.append(JSON.stringify({ text2: resp }));
    // },
    // onFinal: (resp) => {
    //   console.log("onFinal", resp);
    //   //data.appendMessageAnnotation({ text: "resp" });
    //   //data.append(JSON.stringify(resp));
    //   data.close();
    // },
    experimental_streamData: true,
  });

 
  const create_agent = async (llm: ChatOpenAI, tools:any[], system_prompt: string) => {
    const prompt = ChatPromptTemplate.fromMessages([
      ["system", system_prompt],
      new MessagesPlaceholder("messages"),
      new MessagesPlaceholder("agent_scratchpad"),
    ])
    const agent = await createOpenAIFunctionsAgent({llm, tools, prompt});
    const executor = AgentExecutor.fromAgentAndTools({
      agent,
      tools,
      
    })
    return executor;
  }

  const agent_node = async (state: Message[], agent: AgentExecutor, name: string) => {
    const result = await agent.invoke(state);
    return [result];
  }

  const members = [
    "lotto_manager",
    "coder"
  ]

  const system_prompt = "You are a supervisor tasked with managing a conversation between the following workers: {members}. Given the following user request, response with the worker to act next. Each worker will perform a task and response with their results and status. When finished, respond with FINISH."

  const options = [...members, "FINISH"]


  

  // const function_def = {
  //   name: "route",
  //   description: "Select the next role",
  //   parameters: {
  //     title: "routeSchema",
  //   }
  // }

//return NextResponse.json(response);

  //return NextResponse.json(response);
  return new StreamingTextResponse(stream, {}, data);
}
