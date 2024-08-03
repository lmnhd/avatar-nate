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
import {
  RunnableSequence,
  RunnablePick,
  RunnableMap,
} from "@langchain/core/runnables";
import { NextResponse } from "next/server";
import { GithubRepoLoader } from "langchain/document_loaders/web/github";
import * as parse from "pdf-parse";
import { PDFLoader } from "langchain/document_loaders/fs/pdf";
import { similarity } from "ml-distance";
import { Pinecone } from "@pinecone-database/pinecone";
import { createPineconeIndex } from "../avatar/helpers";
import { PineconeStore } from "@langchain/pinecone";
import { useToast } from "@/components/ui/use-toast";

//export const runtime = "edge";

const webSite = "https://python.langchain.com/docs/get_started/introduction";
const webSite2 = "https://www.cruisebrothers.com/specials";

export async function POST(req: Request) {
  let response = { message: "Hello" };

  const formData = await req.formData();
  const file = formData.getAll("files")[0];

  console.log("File: ", file);

  const INDEX_NAME = "avatar-nate-custom";

  const convertDocsToString = (docs: Document[]) => {
    return docs
      .map((doc) => {
        return `<doc>\n${doc.pageContent}\n</doc>`;
      })
      .join("\n");
  };

  const loader = new PDFLoader(file);

  const doc = await loader.load();
  //console.log(doc.slice(0,3))

  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 512,
    chunkOverlap: 64,
  });
  // const splitter = RecursiveCharacterTextSplitter.fromLanguage("js", { chunkSize: 32, chunkOverlap: 0})
  const splitDocs = await splitter.splitDocuments(doc);
  //console.log(splitDocs.slice(0,3))

  await createPineconeIndex(INDEX_NAME);

  //return NextResponse.json({ response });
  const embeddings = new OpenAIEmbeddings();

  const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY || "" });

  const pineconeIndex = pinecone.index(INDEX_NAME);

  
  //const retriever = await getPineconeRetriever(INDEX_NAME);

  console.log("Uploading Docs...", splitDocs.length); 

  await PineconeStore.fromDocuments(splitDocs, embeddings, {
    pineconeIndex,
    maxConcurrency: 5,
    namespace: "avatar-1",
  });

  // return new StreamingTextResponse(stream)
  return NextResponse.json({ response });
}
