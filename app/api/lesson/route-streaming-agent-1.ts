import fs from "fs";
import {
  StreamingTextResponse,
  LangChainStream,
  Message,
  experimental_StreamData,
} from "ai";
import { ChatOpenAI, OpenAIEmbeddings } from "@langchain/openai";
import {
  AgentExecutor,
  AgentFinish,
  AgentStep,
  createOpenAIFunctionsAgent,
} from "langchain/agents";
import { DynamicTool, DynamicStructuredTool } from "@langchain/core/tools";
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
import hub, { pull } from "langchain/hub";
import { FunctionMessage, BaseMessage } from "langchain/schema";

import z from "zod";
import { scrapeWebPage, scrapeWithProxy } from "@/lib/tool-functions";
import zodToJsonSchema from "zod-to-json-schema";
import { FunctionsAgentAction } from "langchain/dist/agents/openai_functions/output_parser";
import { convertToOpenAIFunction } from "@langchain/core/utils/function_calling";

//export const runtime = "edge";

const webSite = "https://python.langchain.com/docs/get_started/introduction";
const webSite2 = "https://www.cruisebrothers.com/specials";
const webSite3 = "https://www.amazon.com/";

export async function POST(req: Request) {
  let response = { message: "Hello" };
  let result: any = "testing";

  const { messages }: { messages: Message[] } = await req.json();

  // const test = await scrapeWebPage(webSite3);

  // console.log(test);

  // return NextResponse.json(response);

  const data = new experimental_StreamData();

  // important: use LangChainStream from the AI SDK:
  const { stream, handlers } = LangChainStream({
    // onCompletion: (resp) => {
    //   data.append(JSON.stringify({response: resp})); // example
    //   data.close();
    // },
    onCompletion: (resp) => {
      console.log("onCompletion", resp);
    },
    onStart: () => {
      console.log("onStart");
      data.appendMessageAnnotation({ text: "onStart" });
      data.append(JSON.stringify({ text2: "onStart" }));
    },
    onText: (resp) => {
      //console.log("onText", resp);
      data.appendMessageAnnotation({ text: "resp" });
      data.append(JSON.stringify({ text2: "resp" }));
    },

    onToken: (resp) => {
      //console.log("onToken", resp);
      data.appendMessageAnnotation({ text: resp });
      data.append(JSON.stringify({ text2: resp }));
    },
    onFinal: (resp) => {
      console.log("onFinal", resp);
      // data.appendMessageAnnotation({ text: "resp" });
      data.append(JSON.stringify(resp));
      data.close();
    },
    experimental_streamData: true,
  });

  const model = new ChatOpenAI({
    modelName: "gpt-3.5-turbo",
    temperature: 0.5,
    streaming: true,
    //maxTokens: 500
  });

  const tools = [
    // new DynamicTool({
    //   name: "FOO",
    //  description: "Call this to get the value of foo. input should be an empty string",
    //  func: async () => "baz",
    // }),
    new DynamicStructuredTool({
      name: "random-number-generator",
      description: "generates a random number between two input numbers",
      schema: z.object({
        low: z.number().describe("The lower bound of the generated number"),
        high: z.number().describe("The upper bound of the generated number"),
      }),
      func: async ({ low, high }) =>
        Math.floor(Math.random() * (high - low) + low).toString(), // Outputs still must be strings
    }),
    new DynamicStructuredTool({
      name: "general-web-scraper",
      description: "gets the text from a website",
      schema: z.object({
        url: z.string().describe("The url of the web page to scrape"),
        // selector: z
        //   .string()
        //   .describe(
        //     "Optional: The selector to use to get the text from the page i.e. 'html'"
        //   ),
      }),
      func: async ({ url }) => scrapeWebPage(url),
    }),
  ];



  const prompt = await pull<ChatPromptTemplate>(
    "hwchase17/openai-functions-agent"
  );
 
  const agent = await createOpenAIFunctionsAgent({
    llm: model,
    tools,
    prompt
   })
  const agentExecutor = new AgentExecutor({
    agent,
    tools,
    //verbose: true,
    maxIterations: 10,
  });

  agentExecutor
    .invoke(
      {
        //input: `what is the web page 'https://cheerio.js.org/docs/intro' about?`,
        //input: 'hello'
        // input: messages[messages.length - 1].content,
        input: 'What is a random number between 1 and 10?',
      },
      { callbacks: [handlers] }
    )
    .catch(console.error);

  //return NextResponse.json({result: "hello"});
  return new StreamingTextResponse(stream, {}, data);
}
