import { StreamingTextResponse, LangChainStream, Message } from "ai";
import { ChatOpenAI, OpenAIEmbeddings } from "@langchain/openai";
import { AgentExecutor, createOpenAIFunctionsAgent } from "langchain/agents";
import {
  SystemMessagePromptTemplate,
  HumanMessagePromptTemplate,
} from "langchain/prompts";
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

export const runtime = "edge";

const webSite = "https://python.langchain.com/docs/get_started/introduction";
const webSite2 = "https://www.cruisebrothers.com/specials";

export async function POST(req: Request) {
  let response = { message: "Hello" };
  const { messages }: { messages: Message[] } = await req.json();

  const promptFromMessages = ChatPromptTemplate.fromMessages([
    SystemMessagePromptTemplate.fromTemplate(
      "You are an expert at picking company names."
    ),
    HumanMessagePromptTemplate.fromTemplate(
      "What are three good names for a company that makes {product}"
    ),
  ]);
  console.log(
    await promptFromMessages.formatMessages({
      product: "drum sets",
    })
  );

  //  const model = new ChatOpenAI({
  //   modelName: "gpt-3.5-turbo-1106",
  //  })

  //  const response = await model.invoke( [
  //   new HumanMessage("Tell me a joke about a drum set.")
  //  ])
  console.log(response);

  // return new StreamingTextResponse(response)
  return NextResponse.json({ response });
}
