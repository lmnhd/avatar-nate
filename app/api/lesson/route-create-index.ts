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
import { PineconeStore } from "@langchain/pinecone";
import { createPineconeIndex, getPineconeRetriever } from "./helpers";

//export const runtime = "edge";

const webSite = "https://python.langchain.com/docs/get_started/introduction";
const webSite2 = "https://www.cruisebrothers.com/specials";

export async function POST(req: Request) {
  let response = { message: "Hello" };
  const { messages }: { messages: Message[] } = await req.json();

  const INDEX_NAME = "avatar-embeddings-2";

  const convertDocsToString = (docs: Document[]) => {
    return docs
      .map((doc) => {
        return `<doc>\n${doc.pageContent}\n</doc>`;
      })
      .join("\n");
  };

  // const embeddings = new OpenAIEmbeddings()
  // //console.log(await embeddings.embedQuery("This is some example text"))
  // const vector1 = await embeddings.embedQuery("What are vectors useful for in machine learning?")
  // const vector3 = await embeddings.embedQuery("Why are vectors used instead of scalars?")
  // const vector2 = await embeddings.embedQuery("A group of parrots is called a pandemonium")
  // console.log(similarity.cosine(vector1, vector3))

  //return NextResponse.json({ response });
  const TEMPLATE_STRING = `You are and experienced researcher, expert at interpreting and answering questions based on provided sources. Using the provided context, answer the user's questions to the best of your ability using only the resources provided. Be verbose!

<context>

{context}

</context>

Now, answer this question using the above context:

{question}
`;
  const TEMPLATE_STRING2 = `You are an evolved and wise AI robot who has written a document called 'the commandments' that describes everything one needs to know to be able to get the most out of life and receive great happiness. Using the document as context, answer the user's questions to the best of your ability using only the commandments. Be verbose and uplifting!

<context>

{context}

</context>

Now, answer this question using the above context:

{question}
`;
  const answerGenerationPrompt = ChatPromptTemplate.fromTemplate(
    TEMPLATE_STRING2
  );

  const loader = new PDFLoader("./public/1Affirmations Avatar Nate 5.5.2024.pdf");

  const doc = await loader.load();
  //console.log(doc.slice(0,3))

  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 512,
    chunkOverlap: 64,
  });
  // const splitter = RecursiveCharacterTextSplitter.fromLanguage("js", { chunkSize: 32, chunkOverlap: 0})
  const splitDocs = await splitter.splitDocuments(doc);
  //console.log(splitDocs.slice(0,3))
  const embeddings = new OpenAIEmbeddings();

  const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY || "" });

  const pineconeIndex = pinecone.index(INDEX_NAME);
  //const retriever = await getPineconeRetriever(INDEX_NAME);

  await PineconeStore.fromDocuments(splitDocs, embeddings, {
    pineconeIndex,
    maxConcurrency: 5,
  });

  
  // return new StreamingTextResponse(stream)
  return NextResponse.json({ response });
}
