import fs from "fs";
import { StreamingTextResponse, LangChainStream, Message } from "ai";
import { ChatOpenAI, OpenAIEmbeddings } from "@langchain/openai";
import { AgentExecutor, createOpenAIFunctionsAgent } from "langchain/agents";
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
import { NextResponse } from "next/server";
import { GithubRepoLoader } from "langchain/document_loaders/web/github";
import * as parse from "pdf-parse";
import { PDFLoader } from "langchain/document_loaders/fs/pdf";
import { similarity } from "ml-distance";
import { Pinecone } from "@pinecone-database/pinecone";
import { PineconeStore } from "@langchain/pinecone";
import { convertDocsToString, getPineconeRetriever } from "./helpers";
import { BufferMemory } from "langchain/memory";

//export const runtime = "edge";

const webSite = "https://python.langchain.com/docs/get_started/introduction";
const webSite2 = "https://www.cruisebrothers.com/specials";

export async function POST(req: Request) {
  let response = { message: "Hello" };
  const { messages }: { messages: Message[] } = await req.json();

  const model = new ChatOpenAI({});

  const database = [
    {
      firstName: "John",
      lastName: "Smith",
      spouseName: "Mary",
      children: [
        {
          name: "Bobby",
          age: 12,
          interests: ["hockey", "drones", "Minecraft"],
        },
        {
          name: "Sally",
          age: 8,
          interests: ["ballet", "unicorns", "gymnastics"],
        },
        {
          name: "Billy",
          age: 4,
          interests: ["dinosaurs", "Minecraft"],
        },
      ],
      interests: ["golf", "tennis", "football"],
      job: "accountant",
    },
    {
      firstName: "Jane",
      lastName: "Doe",
      spouseName: "Harold",
      children: [
        {
          name: "Jill",
          age: 10,
          interests: ["baseball", "global warming", "karate"],
        },
        {
          name: "Timmy",
          age: 6,
          interests: ["Swimming", "Rock climbing", "movies"],
        },
      ],
      interests: ["gardening", "hiking", "fishing"],
      job: "teacher",
    },
  ];

  const stringifiedDatabase = database.map((record: any) =>
    JSON.stringify(record)
  );

  const vectorStore = await MemoryVectorStore.fromTexts(
    stringifiedDatabase,
    [{ id: 1 }, { id: 2 }],
    new OpenAIEmbeddings()
  );

  const serializeDocs = (docs: Document[]) =>
    docs.map((doc) => doc.pageContent).join("\n");

  const prompt =
    PromptTemplate.fromTemplate(`Tell me what can I talk about with {personName} to make it seem like I remember personal details about their life. What is their job? What are their interests? What is their spouse's name? What are their children's names, ages, and interests? Base the answers on the following context: 
{context}
`);

  const retriever = vectorStore.asRetriever();

  const chain = RunnableSequence.from([
    {
      context: retriever.pipe(serializeDocs),
      personName: new RunnablePassthrough(),
    },
    //(input) => input
    prompt,
    model,
    new StringOutputParser(),
  ]);

  const result1 = await chain.invoke("John Smith");
  //console.log(result1)

  const result2 = await chain.invoke("Jane Doe");

  return NextResponse.json(result1);
}
