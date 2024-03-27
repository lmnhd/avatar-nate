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
import {promptGuide} from '@/app/prompts/openai-prompt-guide'



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
    
  }: { messages: Message[]; systemPrompt: string} = await req.json();

  // let SYSTEM_TEMPLATE = `You are a helpful assistant who can research and provide information about anything. Upon receiving a question from the user, use the web browser to search for a website that will provide the best information to answer the question. Then use the web browser again to go to the previously found web page and summarize it's content to return to the user as the answer.`;

// Read text from local file
const text = promptGuide()

const template = `"""{text}
------------------
------------------
------------------
Based on the above instructions, help me write a good prompt template.
This template should be a python f-string. It can take in any number of variables depending on my objective.

Return your answer in the following format: 
'''prompt...'''

This is my objective: 

{objective}
"""`

const prompt = PromptTemplate.fromTemplate(template)

const chain = prompt.pipe(new ChatOpenAI()).pipe(new StringOutputParser())

  console.log(response);

  const task = "answer a question based on context provided, and ONLY that context"

  response = chain.invoke({objective: task, text: text})


  return NextResponse.json(response);
 
}
