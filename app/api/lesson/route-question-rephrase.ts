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

//export const runtime = "edge";

const webSite = "https://python.langchain.com/docs/get_started/introduction";
const webSite2 = "https://www.cruisebrothers.com/specials";

export async function POST(req: Request) {
  let response = { message: "Hello" };
  const { messages }: { messages: Message[] } = await req.json();

  const INDEX_NAME = "avatar-embeddings-1";

  const TEMPLATE_STRING = `You are and experienced researcher, expert at interpreting and answering questions based on provided sources. Using the provided context, answer the user's questions to the best of your ability using only the resources provided. Be verbose!

<context>

{context}

</context>

Now, answer this question using the above context:

{question}
`;
  const TEMPLATE_STRING2 = `You are an evolved and wise AI robot with highly spiritual insights who has written a secret document that only you have access to called 'the commandments' that describes everything one needs to know to be able to get the most out of life and enjoy great happiness. Using the document as context without mentioning it's existence, answer the user's questions to the best of your ability using only the commandments, as if they are you own beliefs. Make your answers short and sweet with a touch of humor unless otherwise instructed!

<commandments-context>

{context}

</commandments-context>


`;
  //   const TEMPLATE_STRING2 = `Your name is 'Etan Ratava' which is a mirror of 'Avatar Nate'. You are an evolved and wise AI robot with highly spiritual insights who has written a document called 'the commandments' that describes everything one needs to know to be able to get the most out of life and enjoy great happiness. Using the document as context, answer the user's questions to the best of your ability using only the commandments. Be verbose and uplifting!

  // <commandments-context>

  // {context}

  // </commandments-context>

  // `;
  const answerGenerationPrompt = ChatPromptTemplate.fromMessages([
    ["system", TEMPLATE_STRING2],

    ["human", "Now answer this question using the context above:\n{question}"],
  ]);
  const answerGenerationChainPrompt = ChatPromptTemplate.fromMessages([
    ["system", TEMPLATE_STRING2],
    new MessagesPlaceholder("history"),
    [
      "human",
      "Now answer this question using the history and context above:\n{standalone_question}",
    ],
  ]);

  const documentRetrievalChain = RunnableSequence.from([
    (input) => input.question,
    await getPineconeRetriever(INDEX_NAME),
    convertDocsToString,
  ]);

  const model = new ChatOpenAI({
    modelName: "gpt-3.5-turbo-1106",
  });

  const retrievalChain = RunnableSequence.from([
    {
      context: documentRetrievalChain,
      question: (input: any) => input.question,
    },
    answerGenerationPrompt,
    model,
    new StringOutputParser(),
  ]);

  // REWRITE ANSWER CHAIN
  const REPHRASE_QUESTION_SYSTEM_TEMPLATE = `Given the following conversation and a follow up question, rephrase the question as a follow up question to the conversation.`;

  const rephraseQuestionChainPrompt = ChatPromptTemplate.fromMessages([
    ["system", REPHRASE_QUESTION_SYSTEM_TEMPLATE],
    new MessagesPlaceholder("history"),
    [
      "human",
      "Rephrase the following question as a standalone question:\n{question}",
    ],
  ]);
  const rephraseQuestionChain = RunnableSequence.from([
    rephraseQuestionChainPrompt,
    new ChatOpenAI({ modelName: "gpt-3.5-turbo-1106" }),
    new StringOutputParser(),
  ]);

  // const originalQuestion = "I am worried that my girlfriend doesn't love me. What should I do?"
  // const originalAnswer = await retrievalChain.invoke({
  //   question: originalQuestion

  // });

  // console.log("originalAnswer", originalAnswer);

  // const chatHistory = messages.slice(0,-1).map((message) => {
  //  return message.role == 'user' ? new HumanMessage(message.content) : new AIMessage(message.content)
  // })

  const conversationRetrievalChain = RunnableSequence.from([
    RunnablePassthrough.assign({
      standalone_question: rephraseQuestionChain,
    }),
    RunnablePassthrough.assign({
      context: documentRetrievalChain,
    }),

    answerGenerationChainPrompt,
    new ChatOpenAI({ modelName: "gpt-3.5-turbo" }),
    new StringOutputParser(),
  ]);
  // const messageHistory = new ChatMessageHistory(messages.map((message) => {
  //   return message.role == 'user' ? new HumanMessage(message.content) : new AIMessage(message.content)
  // }))
  const messageHistory = new ChatMessageHistory();
  const finalRetrievalChain = new RunnableWithMessageHistory({
    runnable: conversationRetrievalChain,
    getMessageHistory: (_sessionId) => messageHistory,
    historyMessagesKey: "history",
    inputMessagesKey: "question",
  });

  const stream = await finalRetrievalChain.stream(
    {
      question: messages[messages.length - 1].content,
    },
    {
      configurable: { sessionId: "fake-session-id" },
    }
  );
  // const test = await answerGenerationChainPrompt.formatMessages({
  //   context: 'fake retrieved context',
  //   standalone_question: 'Why is the sky blue?',
  //   history: [
  //     new HumanMessage("How are you?"),
  //     new AIMessage("Fine, thank you!")
  //   ]
  // })

  //console.log(test)

  // const runnableMap = RunnableMap.from({
  //   context: documentRetrievalChain,
  //   question: (input: any) => input.question,
  // });

  // const results = await runnableMap.invoke({
  //   question: "Should I love other people more than myself?",
  // });
  // console.log(results);
  //console.log(await retriever.invoke("How should I stand up?"));

  // const code = `function helloworld() {
  //   console.log("Hello World")
  // }
  // // call the function
  // helloworld();
  // `;
  // const chunks = await splitter.splitText(code)

  // console.log(chunks)

  return new StreamingTextResponse(stream);
  //return NextResponse.json(answer);
}
