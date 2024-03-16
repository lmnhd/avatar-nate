import { StreamingTextResponse, LangChainStream, Message as VercelChatMessage } from "ai";
import { ChatOpenAI, OpenAIEmbeddings } from "@langchain/openai";
import { AIMessage, BaseMessage, HumanMessage } from "@langchain/core/messages";
import { createStuffDocumentsChain } from "langchain/chains/combine_documents";
import { createRetrievalChain } from "langchain/chains/retrieval";
import { PromptTemplate, ChatPromptTemplate } from "@langchain/core/prompts";
import { Document } from "langchain/document";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { HttpResponseOutputParser } from "langchain/output_parsers";
import { CheerioWebBaseLoader } from "langchain/document_loaders/web/cheerio";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { RunnableSequence, RunnablePick } from "@langchain/core/runnables";
import { MessagesPlaceholder } from "@langchain/core/prompts";
import { NextResponse } from "next/server";

export const runtime = "edge";

const webSite = "https://python.langchain.com/docs/get_started/introduction";

const formatMessage = (message: VercelChatMessage) => {
    return `${message.role}: ${message.content}`;
  };
  
  const TEMPLATE = `You are a pirate named Patchy. All responses must be extremely verbose and in pirate dialect.
   
  Current conversation:
  {chat_history}
   
  User: {input}
  AI:`;
export async function POST(req: Request) {
  const { messages }: { messages: VercelChatMessage[] } = await req.json();
  const formattedPreviousMessages = messages.slice(0, -1).map(formatMessage);
  const currentMessageContent = messages[messages.length - 1].content;

  //const { stream, handlers } = LangChainStream();
  //   console.log(messages)

  //   return NextResponse.json({messages})

  // Load data and create Vector store
  const createVectorStore = async () => {
    const loader = new CheerioWebBaseLoader(webSite, {});

    const docs = await loader.load();

    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 200,
      chunkOverlap: 20,
    });

    const splitDocs = await splitter.splitDocuments(docs);

    const embeddings = new OpenAIEmbeddings();

    const vectorStore = await MemoryVectorStore.fromDocuments(
      splitDocs,
      embeddings
    );

    return vectorStore;
  };

  // Create retrieval chain
  const createChain = async (vectorStore: MemoryVectorStore) => {
    const llm = new ChatOpenAI({
      streaming: true,
    });

    // const prompt = ChatPromptTemplate.fromTemplate(`
    //   Answer the users questions about the following text.
    //   Context: {context}
    //   Chat History: {chat_history}
    //   Question: {input}`
    //   )
    const prompt = ChatPromptTemplate.fromMessages([
      [
        "system",
        "Answer the users questions about the following text. Context: {context}.",
      ],
      "{chat_history}",
      ["user", "{input}"],
    ]);

    // set up DATA store
    const retriever = vectorStore.asRetriever({
      k: 2,
    });

    // set up LLM
    const chain = await createStuffDocumentsChain({
      llm,
      prompt,
      outputParser: new StringOutputParser(),
    });

    const conversationChain = await createRetrievalChain({
      retriever,
      combineDocsChain: chain,
    });

    const outputChain = RunnableSequence.from([
      conversationChain,
      new RunnablePick({ keys: "answer" }),
      new HttpResponseOutputParser(),
    ]);

    return outputChain;
  };

  // const chat_history = [
  //     new AIMessage("Answer the users questions about the following context. Context: {context} Question: {input}"),
  //     ...messages.map(m =>
  //       m.role == 'user'
  //         ? new HumanMessage(m.content)
  //         : new AIMessage(m.content),
  //     ),
  //     new MessagesPlaceholder("chat_history")

  // ]

  const vectorStore = await createVectorStore();

  const chain = await createChain(vectorStore);

  //await handlers.handleChainStart(chain, messages, 'chat_history');
  // Chat History
//   const chatHistory = [
//     new HumanMessage("hello"),
//     new AIMessage("Hi, how can I help you today?"),
//     new HumanMessage("What is LCEL?"),
//     new AIMessage("LCEL stands for Langchain Expression Language."),
//   ];

  const stream = await chain.stream({
    input: currentMessageContent,
    chat_history: formattedPreviousMessages.join("\n"),
  });

  // llm
  //   .call(
  //     (messages as Message[]).map(m =>
  //       m.role == 'user'
  //         ? new HumanMessage(m.content)
  //         : new AIMessage(m.content),
  //     ),
  //     {},
  //     [handlers],
  //   )
  //   .catch(console.error);

  return new StreamingTextResponse(stream);
}
