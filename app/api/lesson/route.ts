import OpenAI from "openai";
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
import { createPineconeIndex } from "./helpers";
import { retrieveLyrics, searchLyrics } from "@/app/songlyrics";

//export const runtime = "edge";

const webSite = "https://python.langchain.com/docs/get_started/introduction";
const webSite2 = "https://www.cruisebrothers.com/specials";
const webSite3 = "https://www.amazon.com/";

export async function POST(req: Request) {
  let response: ChainValues | string = { message: "Hello" };
  //let result: any = "testing";
  const {
    messages,
    systemPrompt,
  }: { messages: Message[]; systemPrompt: string } = await req.json();

  type Artist = {
    name: string;
    songs: string[];
  };
  const command = messages[messages.length - 1].content;

if(command === 'test1'){

  try {
    const url = "https://www.mldb.org/search?mq=Bon+Jovi&si=0&mm=0&ob=1";
    const url2 = "https://www.mldb.org/song-9186-get-ready.html";
    const test = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const text = await test.text();
    const test2 = await fetch(url2, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const text2 = await test2.text();

    const reply = `Test 1 url = ${url} Test 1 = ${text} Test 2 url = ${url2} Test 2 = ${text2}`

    console.log(reply);
    response = reply;
  } catch (error) {
    console.log(error);
    response = "Error";
  }
}

if(command === 'test2'){
  try {
    const url = "https://www.lyricsondemand.com/results.html?cx=partner-pub-1187925111528992%3A9654624337&cof=FORID%3A10&ie=UTF-8&q=Drake&sa.x=0&sa.y=0";
    const url2 = "https://www.lyricsondemand.com/d/drakelyrics/parismortonmusiclyrics.html";
    const test = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const text = await test.text();
    const test2 = await fetch(url2, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const text2 = await test2.text();

    const reply = `Test 1 url = ${url} Test 1 = ${text} Test 2 url = ${url2} Test 2 = ${text2}`

    console.log(reply);
    response = reply;
  } catch (error) {
    console.log(error);
    response = "Error";
  }
}


  return NextResponse.json(response);

  let SYSTEM_TEMPLATE = `You are a professional songwriter and have been tasked with completing the lyrics for a song about {context}.
   you have written these songs so far...
   {songs}
   
   Now write and ONLY return the next song about {context} formatted with [Title:] and [Lyrics:]...
   
   
  `;
  return NextResponse.json(response);
}
