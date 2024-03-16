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
  const { messages }: { messages: Message[] } = await req.json();

    const INDEX_NAME = "avatar-embeddings-1";

    const TEMPLATE_STRING = `You are a friendly robot. Be nice and answer all questions cordially.

    <context>

    {context}

    </context>

    Now, answer this question using the above context:

    {question}`;

    const vectorStore = new MemoryVectorStore(new OpenAIEmbeddings());
    await vectorStore.addDocuments([
      {
        pageContent:
          "The sky is blue because of the way the atmosphere scatters sunlight. The short-wavelength blue and violet are scattered by the air molecules and other particles in the atmosphere. ",
        metadata: {},
      },
      {
          pageContent: "The color of the sky varies with the conditions of the atmosphere. On days when the sky is clear, the sky is blue. On days when the sky is cloudy, the sky is gray. At sunrise and sunset, the sky is red. The sky is black at night.",
          metadata: {}
      }
    ]);

    const retriever = vectorStore.asRetriever();

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

    const resp1 = await retrievalChain.invoke({question: messages[messages.length - 1].content, history: chatHistory})
    console.log(resp1)

    return NextResponse.json({ response: resp1 });



    const messageHistory = new ChatMessageHistory(
      chatHistory
    );

    const finalRetrievalChain = new RunnableWithMessageHistory({
      runnable: retrievalChain,
      getMessageHistory: (_sessionId) => messageHistory,
      historyMessagesKey: "history",
      inputMessagesKey: "question",
    });

    const stream = await finalRetrievalChain.stream(
      {
        question: messages[messages.length - 1].content,
        history: chatHistory
      },
      {
        configurable: { sessionId: "fake-session-id" },
      }
    );

  

  // const demoResponse = await chain.stream({input: "What is my name?"})

  //   return new StreamingTextResponse(demoResponse);
  //return NextResponse.json(answer);
}
