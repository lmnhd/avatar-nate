import fs from "fs";
import {
  StreamingTextResponse,
  LangChainStream,
  Message,
  experimental_StreamData,
} from "ai";
import { ChatOpenAI, OpenAIEmbeddings } from "@langchain/openai";
import { ChatAnthropic } from "@langchain/anthropic";
import {
  AgentAction,
  AgentExecutor,
  AgentFinish,
  AgentStep,
  createOpenAIFunctionsAgent,
} from "langchain/agents";
import { DynamicTool, DynamicStructuredTool } from "@langchain/core/tools";
import { formatXml } from "langchain/agents/format_scratchpad/xml";
import {
  SystemMessagePromptTemplate,
  HumanMessagePromptTemplate,
} from "@langchain/core/prompts";
import {
  AIMessage,
  HumanMessage,
  SystemMessage,
  FunctionMessage, BaseMessage
} from "@langchain/core/messages";
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
import { SearchApi, WikipediaQueryRun, formatToOpenAIFunction } from "langchain/tools";
import { formatToOpenAIFunctionMessages} from 'langchain/agents/format_scratchpad'

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
import { Tool, ToolParams } from "langchain/tools";

import { renderTextDescription } from "langchain/tools/render";
import { Tool as AITool } from "ai";
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


import z, { input } from "zod";
import { bingSearch, duckDuckGoZero, scrapeWebPage, scrapeWithProxy } from "@/lib/tool-functions";
import zodToJsonSchema from "zod-to-json-schema";
import { FunctionsAgentAction, OpenAIFunctionsAgentOutputParser } from "langchain/agents/openai/output_parser";
import { convertToOpenAIFunction } from "@langchain/core/utils/function_calling";
import { XMLOutputParser } from "@langchain/core/output_parsers";
import { XMLAgentOutputParser } from "langchain/agents/xml/output_parser";
import { ChainValues } from "langchain/schema";
import { ExaSearchResults } from "@langchain/exa";
import Exa from "exa-js";

import { ToolExecutor } from '@langchain/langgraph/prebuilt'
import { StateGraph, END} from '@langchain/langgraph'
import { RunnableLambda } from '@langchain/core/runnables'
import { channel } from "diagnostics_channel";

//export const runtime = "edge";

const webSite = "https://python.langchain.com/docs/get_started/introduction";
const webSite2 = "https://www.cruisebrothers.com/specials";
const webSite3 = "https://www.amazon.com/";

export async function POST(req: Request) {
  let response: ChainValues | string = { message: "Hello" };
  let result: any = "testing";
  const {
    messages,
    systemPrompt,
  }: { messages: Message[]; systemPrompt: string } = await req.json();

  // const test = await scrapeWebPage(webSite3);
  // console.log(test);
  //return NextResponse.json(response);

  const data = new experimental_StreamData();

  // important: use LangChainStream from the AI SDK:
  const { stream , handlers } = LangChainStream({
    // onCompletion: (resp) => {
    //   data.append(JSON.stringify({response: resp})); // example
    //   data.close();
    // },
    onCompletion: (resp) => {
      console.log("onCompletion", resp);
    },
    // onStart: () => {
    //   console.log("onStart");
    //   // data.appendMessageAnnotation({ text: "onStart" });
    //   // data.append(JSON.stringify({ text2: "onStart" }));
    // },
    // onText: (resp) => {
    //   console.log("onText", resp);
    //   // data.appendMessageAnnotation({ text: "resp" });
    //   // data.append(JSON.stringify({ text2: "resp" }));
    // },

    // onToken: (resp) => {
    //   console.log("onToken", resp);
    //   // data.appendMessageAnnotation({ text: resp });
    //   // data.append(JSON.stringify({ text2: resp }));
    // },
    // onFinal: (resp) => {
    //   console.log("onFinal", resp);
    //   //data.appendMessageAnnotation({ text: "resp" });
    //   //data.append(JSON.stringify(resp));
    //   data.close();
    // },
    experimental_streamData: true,
  });

 
  const tools = [
    //new TavilySearchResults({ maxResults: 1}),
    new DynamicTool({
      name: "current-info-web-search",
      description: "use this to search the web for current news and information by entering a string search query.",
      func: async (input: string) => {
        
        return bingSearch(input,1);
      },
    }),
    new DynamicTool({
      name: "simple-math-tool",
      description: "use this to perform simple math operations",
      func: async (input: string) => {
        return eval(input);
      }
    })
  ];

  const toolExecutor = new ToolExecutor({tools});

  // const test = await tools[0].invoke("S&P 500 index closing price on the previous trading day", {})

  // console.log(test)

  // return NextResponse.json(test);



  const model = new ChatOpenAI({
    temperature: 0,
    streaming: true
  });

  const toolsASOpenAIFunctions = tools.map((tool) => convertToOpenAIFunction(tool));

  const agent = model.bind({
    functions: toolsASOpenAIFunctions,
    callbacks: [handlers],
  })

  const agentState = {
    messages: {
      value: (x: BaseMessage[], y:BaseMessage[]) => x.concat(y),
      default: () => [],
    }
  }

  // Define the function that determines whether to continue or not
  const shouldContinue = (state: { messages: Array<BaseMessage> }) => {
    const { messages } = state;
    const lastMessage = messages[messages.length - 1];
    // if there is no function call, then we finish
    if (
      !("function_call" in lastMessage.additional_kwargs) || !lastMessage.additional_kwargs.function_call
    ) {
      return "end";
    }
    // Otherwise if there is, we continue
    return "continue";
  };


  const _getAction = (state: {messages: Array<BaseMessage>}): AgentAction => {
    const { messages } = state;

    const lastMessage = messages[messages.length - 1];
    if (!lastMessage) {
      throw new Error("No messages found.");

    }
    if (!lastMessage.additional_kwargs.function_call) {
      throw new Error("No function call found.");
    }

    return {
      tool: lastMessage.additional_kwargs.function_call.name,
      toolInput: JSON.stringify(lastMessage.additional_kwargs.function_call.arguments),
      log: ""
    }
  }

  // Define the function that calls the model
  const callModel = async (state: { messages: Array<BaseMessage> }) => {
    const { messages } = state;
    const response = await agent.invoke(messages);

    // We return a list, because this will get added to the existing list
    return {
      messages: [response],
    };
  };

  const callTool = async (state: { messages: Array<BaseMessage> }) => {
    const action = _getAction(state);
    // We call the tool_executor and get back a response
    const response = await toolExecutor.invoke(action);
    // We use the response to create a function message
    const functionMessage = new FunctionMessage({
      content: response,
      name: action.tool,
    });
    // We return a list, because this will get added to the existing list
    return {
      messages: [functionMessage],
    };
  }

  // DEFINE THE STATE GRAPH

  const workFlow = new StateGraph({
    channels: agentState,
})

// Define the two nodes we will cycle between
workFlow.addNode("agent", new RunnableLambda( { func: callModel }))
workFlow.addNode("action", new RunnableLambda( { func: callTool }))

// Set the entrypoint as 'agent'
// This means that this node is the first one called
workFlow.setEntryPoint("agent");

// we now add a conditional edge
workFlow.addConditionalEdges(
  // First, we define the start node. We use 'agent'
  // This means these are the edges taken after the 'agent' node is called
  "agent",
  // Next, we pass in the function that will determine which node is called next.
  shouldContinue,
  // Finally we pass in a mapping
  // The keys are strings, and the values are other nodes.
  // END is a special node marking that the graph should finish
  // What will happen is we will call 'should_continue', and then the output of that
  // will be matched against the keys in this mapping.
  // Based on which one it matches, that node will then be called.
  {
    // if 'tools', then we call the tool node.
    continue: "action",
    // otherwise we finish.
    end: END
  }
)

workFlow.addEdge("action", "agent");


const app = workFlow.compile(); // Compile the graph

const message = "Where did the s&p index close yesterday? and what day was that?";
//const message = "What is the temperature in the third warmest city on earth?";
const inputs = {
  messages: [new HumanMessage(message)],
};
 response = await app.invoke(inputs);
// response = await model.invoke(message);
console.log(response)


//return NextResponse.json(response);

  //return NextResponse.json(response);
  return new StreamingTextResponse(stream, {}, data);
}
