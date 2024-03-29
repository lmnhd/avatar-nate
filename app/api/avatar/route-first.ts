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
  let result: any = "testing";
  const { messages, systemPrompt }: { messages: Message[], systemPrompt:string } = await req.json();

  console.log('systemPrompt =>', systemPrompt)



    const INDEX_NAME = "avatar-embeddings-1";

    const TEMPLATE_STRING = `${systemPrompt}

    <commandments-context>
    
    {context}
    
    </commandments-context>`

   // console.log("TEMPLATE_STRING", TEMPLATE_STRING)

   // return NextResponse.json(response);
   
// const SYSTEM_TEMPLATE = `You are a highly evolved AI robot with great wisdom and deep spiritual insights who has written a secret document that only you have access to called 'the commandments'. This document describes everything one needs to know to be able to get the most out of life and enjoy great happiness. Using the tool called 'the-commandments' find the closest answer to users questions, then quietly decide if this question is in a historical context or a current context, and use one of your search tools to research and retrieve information that supports your answer and include it along with citations of the source. Do not mention 'the commandments' by name but refer to it as 'the source' Keep final answers to a maximum of 3 paragraphs.`;
    const retriever = await getPineconeRetriever(INDEX_NAME);

    const prompt = ChatPromptTemplate.fromMessages([
      ["system", TEMPLATE_STRING],
      new MessagesPlaceholder("history"),
      [
        "human",
        "Now answer this question using the history and context above:\n{question}",
      ],
    ]);

    const documentRetrievalChain = RunnableSequence.from([
      (input) => input.question,
      retriever,
      convertDocsToString,
    ]);

   

    const model = new ChatOpenAI({
      modelName: "gpt-3.5-turbo-1106",
      temperature:0.8
    });
    const chatHistory = messages.slice(0, -1).map((message) => {
      return message.role == "user"
        ? new HumanMessage(message.content)
        : new AIMessage(message.content);
    });

    const retrievalChain = RunnableSequence.from([
      {
        context: documentRetrievalChain,
        question: (input: any) => input.question,
        history: (input) => input.history,
      },
      prompt,
      model,
      new StringOutputParser(),
    ]);

    const resp1 = await retrievalChain.stream({question: messages[messages.length - 1].content, history: chatHistory})
    console.log(resp1)



    return new StreamingTextResponse(resp1);
  //return NextResponse.json(answer);
}
