import { StreamingTextResponse, LangChainStream, Message } from "ai";
import { ChatOpenAI, OpenAIEmbeddings } from "@langchain/openai";
import { AgentExecutor, createOpenAIFunctionsAgent } from "langchain/agents";
import { AIMessage, HumanMessage } from "langchain/schema";
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
  const { messages }: { messages: Message[] } = await req.json();

  // Load data and create Vector store
  const loader = new CheerioWebBaseLoader(webSite2, {});

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

  const retriever = vectorStore.asRetriever({
    k: 2,
  });

  // Create Model and Prompt
  const model = new ChatOpenAI({
    modelName: "gpt-3.5-turbo-1106",
    temperature: 0.7,
    streaming: true,
  });

  const prompt = ChatPromptTemplate.fromMessages([
    ["system", "Your are a helpful assistant named Max."],
    new MessagesPlaceholder("chat_history"),
    ["human", "{input}"],

    new MessagesPlaceholder("agent_scratchpad"),
  ]);

  // Create and assign tools
  const searchTool = new TavilySearchResults();
  const retrieverTool = createRetrieverTool(retriever, {
    name: "retriever",
    description: "Use this tool to get information about a cruise.",
  });
  const tools = [searchTool, retrieverTool];

  // Create Agent
  const agent = await createOpenAIFunctionsAgent({
    llm: model,
    prompt,
    tools,
  })

  // Create Agent Executor
  const agentExecutor = new AgentExecutor({
    agent,
    tools,
  });

  const outputParser = new BytesOutputParser();
  
  
  // const outputChain = RunnableSequence.from([
  //   agentExecutor,
  //   new RunnablePick({ keys: "answer" }),
  //   new HttpResponseOutputParser(),
  // ]);

  // const chain = RunnableSequence.from([
  //   agentExecutor,
  //   new RunnablePick({keys: "messages"}),
  //   outputParser

  // ])

  const response = await agentExecutor.invoke({
    input: messages[messages.length - 1].content,
    chat_history: messages
      .slice(0, -1)
      .map((m) =>
        m.role == "user"
          ? new HumanMessage(m.content)
          : new AIMessage(m.content)
      ),
  });

  console.log(response.output)

  //return new StreamingTextResponse(response);
  return NextResponse.json(response.output);
}
