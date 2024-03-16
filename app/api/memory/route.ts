import { StreamingTextResponse, LangChainStream, Message } from "ai";
import { ChatOpenAI, OpenAIEmbeddings } from "@langchain/openai";
import { AgentExecutor, createOpenAIFunctionsAgent } from "langchain/agents";
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

// Memory Imports
import { BufferMemory} from "langchain/memory";
import { ConversationChain } from 'langchain/chains'

export const runtime = "edge";

const webSite = "https://python.langchain.com/docs/get_started/introduction";
const webSite2 = "https://www.cruisebrothers.com/specials";

export async function POST(req: Request) {
  const { messages }: { messages: Message[] } = await req.json();

  const model = new ChatOpenAI({
    modelName: "gpt-3.5-turbo",
    temperature: 0.5,
  });

  const prompt = ChatPromptTemplate.fromTemplate(`
  You are an AI assistant.
  History: {history}
  {input}
  `);

  const memory = new BufferMemory({
    memoryKey: 'history'
  })

  // LCEL
  const chain = new ConversationChain({
    llm: model,
    prompt,
    memory,
    
  })

  // const outputChain = RunnableSequence.from([
  //   chain,
  //   new RunnablePick({keys: "messages"}),
  //   new RunnablePick({keys: "content"}),
  //   new RunnablePick({keys: "answer"}),
  //   new BytesOutputParser()

  // ])
    
  
  
  const inputs = {
    input: "Hello there.",
  };
  //const stream = await outputChain.stream(inputs);

  //return new StreamingTextResponse(stream);
  //return NextResponse.json(response.output);
}
