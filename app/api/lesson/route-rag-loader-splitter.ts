import fs from "fs";
import { StreamingTextResponse, LangChainStream, Message } from "ai";
import { ChatOpenAI, OpenAIEmbeddings } from "@langchain/openai";
import { AgentExecutor, createOpenAIFunctionsAgent } from "langchain/agents";
import {
  SystemMessagePromptTemplate,
  HumanMessagePromptTemplate,
} from "@langchain/core/prompts";
import { AIMessage, HumanMessage } from "@langchain/core/messages";
import { createStuffDocumentsChain } from "langchain/chains/combine_documents";
import { createRetrievalChain } from "langchain/chains/retrieval";
import { createRetrieverTool } from "langchain/tools/retriever";
import {
  ChatPromptTemplate,
  MessagesPlaceholder,
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
import { RunnableSequence, RunnablePick } from "@langchain/core/runnables";
import { NextResponse } from "next/server";
import { GithubRepoLoader } from 'langchain/document_loaders/web/github'
import * as parse from 'pdf-parse'
import { PDFLoader } from 'langchain/document_loaders/fs/pdf'
//export const runtime = "edge";

const webSite = "https://python.langchain.com/docs/get_started/introduction";
const webSite2 = "https://www.cruisebrothers.com/specials";

export async function POST(req: Request) {
  let response = { message: "Hello" };
  const { messages }: { messages: Message[] } = await req.json();

  // Loaders
//  const loader = new GithubRepoLoader(
//   "https://github.com/lmnhd/_node_ts_start/blob/main/package.json",
//   { recursive:  false
//     //, ignorePaths: ["*.md", "yarn.lock", "package-lock.json", "node_modules", "dist", "coverage", "docs", "test", "tests", "example", "examples", "samples", "sample", "samples", "sample", "public", "static", "build", "dist", "out", "lib", "esm", "cjs", "src", "bin", "test", "tests", "example", "examples", "samples", "sample", "samples", "sample", "public", "static", "build", "dist", "out", "lib", "esm", "cjs", "src", "bin", "test", "tests", "example", "examples", "samples", "sample", "samples", "sample", "public", "static", "build", "dist", "out", "lib", "esm", "cjs", "src", "bin", "test", "tests", "example", "examples", "samples", "sample", "samples", "sample", "public", "static", "build", "dist", "out", "lib", "esm", "cjs", "src", "bin", "test", "tests", "example", "examples", "samples", "sample", "samples", "sample", "public", "static", "build", "dist", "out", "lib", "esm", "cjs", "src", "bin", "test", "tests", "example", "examples", "samples", "sample", "samples", "sample", "public", "static", "build", "dist", "out", "lib", "esm", "cjs", "src", "bin", "test", "tests", "example", "examples", "samples", "sample", "samples", "sample", "public", "static", "build", "dist", "out", "lib", "esm", "cjs", "src", "bin", "test", "tests", "example", "examples", "samples", "sample", "samples", "sample", "public", "static", "build", "dist", "out", "lib", "esm", "cjs", "src", "bin", "test", "tests", "example", "examples", "samples", "sample", "samples", "sample", "public", "static", "build",]
//   }
//  )
// const docs = await loader.load();
// console.log(docs.slice(0,3))

const loader = new PDFLoader("./public/commandments.pdf")
const doc = await loader.load()
console.log(doc.slice(0,3))

// const loader = new GithubRepoLoader(
//   "https://github.com/lmnhd/subkitz",
//   { recursive: false}
// )
// const docs = await loader.load();

// console.log(docs.slice(0,3))

// text splitter
const splitter = new RecursiveCharacterTextSplitter({ chunkSize: 512, chunkOverlap: 64})
// const splitter = RecursiveCharacterTextSplitter.fromLanguage("js", { chunkSize: 32, chunkOverlap: 0})
const splitDocs = await splitter.splitDocuments(doc)
console.log(splitDocs.slice(0,3))

// const code = `function helloworld() {
//   console.log("Hello World")
// }
// // call the function
// helloworld();
// `;
// const chunks = await splitter.splitText(code)

// console.log(chunks)

 // return new StreamingTextResponse(stream)
  return NextResponse.json({ response });
}
