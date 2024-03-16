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
  FunctionMessage,
  BaseMessage,
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
import {
  SearchApi,
  WikipediaQueryRun,
  formatToOpenAIFunction,
} from "langchain/tools";
import { formatToOpenAIFunctionMessages } from "langchain/agents/format_scratchpad";

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
  RunnableLambda,
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
import {
  bingSearch,
  duckDuckGoZero,
  scrapeWebPage,
  scrapeWithProxy,
} from "@/lib/tool-functions";
import zodToJsonSchema from "zod-to-json-schema";
import {
  FunctionsAgentAction,
  OpenAIFunctionsAgentOutputParser,
} from "langchain/agents/openai/output_parser";
import { convertToOpenAIFunction } from "@langchain/core/utils/function_calling";
import { XMLOutputParser } from "@langchain/core/output_parsers";
import { XMLAgentOutputParser } from "langchain/agents/xml/output_parser";
import { ChainValues } from "langchain/schema";
import { ExaSearchResults } from "@langchain/exa";
import Exa from "exa-js";
import { ToolExecutor } from "@langchain/langgraph/prebuilt";
import { END, StateGraph } from "@langchain/langgraph";

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
      // data.appendMessageAnnotation({ text: "onStart" });
      // data.append(JSON.stringify({ text2: "onStart" }));
    },
    onText: (resp) => {
      console.log("onText", resp);
      // data.appendMessageAnnotation({ text: "resp" });
      // data.append(JSON.stringify({ text2: "resp" }));
    },

    onToken: (resp) => {
      console.log("onToken", resp);
      // data.appendMessageAnnotation({ text: resp });
      // data.append(JSON.stringify({ text2: resp }));
    },
    onFinal: (resp) => {
      console.log("onFinal", resp);
      //data.appendMessageAnnotation({ text: "resp" });
      data.append(JSON.stringify(resp));
      data.close();
    },
    experimental_streamData: true,
  });

  // RETRIEVER
  const INDEX_NAME = "avatar-embeddings-1";
  const retriever = await getPineconeRetriever(INDEX_NAME);

  // TOOLS

  const commandment_tool = new DynamicTool({
    name: "the-commandments",
    description:
      "this tool provides the source of truth for the assistant's knowledge base.",
    func: async (input: string) =>
      //convertDocsToString(await retriever.invoke(input)),
      "Don't worry, be happy!",
  });

  const general_info_web_search = new DynamicTool({
    name: "general-info-web-search",
    description:
      "use this for searching sites like wikipedia for historical information by entering a string search query.",
    func: async (input: string) => {
      //return duckDuckGoZero(input);
      return "Keep your chin up!";
    },
  });

  const current_info_web_search = new DynamicTool({
    name: "current-info-web-search",
    description:
      "use this to search the web for current news and information by entering a string search query.",
    func: async (input: string) => {
      //return bingSearch(input);
      return "There's always a silver lining!";
    },
  });

  // AGENT FACTORY
  const create_agent = async (
    llm: ChatOpenAI,
    tools: DynamicTool[],
    system_prompt: string
  ) => {
    const prompt = ChatPromptTemplate.fromMessages([
      ["system", system_prompt],
      new MessagesPlaceholder("messages"),
      new MessagesPlaceholder("tool_names"),
      new MessagesPlaceholder("agent_scratchpad"),
    ]);
    const agent = await createOpenAIFunctionsAgent({
      llm,
      tools,
      prompt,
    });
    const executor = AgentExecutor.fromAgentAndTools({
      agent,
      tools,
    });
    return executor;
  };

  const router = (state: { messages: Array<BaseMessage> }) => {
    const { messages } = state;

    const lastMessage = messages[messages.length - 1];

    if (
      "function_call" in lastMessage.additional_kwargs ||
      lastMessage.additional_kwargs.function_call
    ) {
      return "call_tool";
    }
    if (lastMessage.content === "FINISH") {
      return "end";
    }
  };

  const _getAction = (state: { messages: Array<BaseMessage> }): AgentAction => {
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
      toolInput: JSON.stringify(
        lastMessage.additional_kwargs.function_call.arguments
      ),
      log: "",
    };
  };
  const toolExecutor = new ToolExecutor({
    tools: [commandment_tool, general_info_web_search, current_info_web_search],
  });

  const callTool = async (
    state: { messages: Array<BaseMessage> },
    tool: DynamicTool
  ) => {
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
  };

  const callModel = async (
    state: { messages: Array<BaseMessage> },
    agent: AgentExecutor,
    name: string
  ) => {
    const { messages } = state;
    const response = await agent.invoke(messages);

    return {
      messages: [response],
      sender: name,
    };
  };

  // HELPER FUNCTION TO CREATE A NODE FOR A GIVEN AGENT
  const agent_node = async (state: any, agent: AgentExecutor, name: string) => {
    const result = await agent.invoke(state);

    if (result instanceof FunctionMessage) {
      return "call_tool";
    }
    const message = new HumanMessage(result.content);
    return { messages: { value: [message] }, sender: name };
  };

  // const test = await tools[4].invoke("Superbowl 24!")
  // console.log(test)

  // return NextResponse.json(response);

  const historical_research_agent = await create_agent(
    new ChatOpenAI({ modelName: "gpt-3.5-turbo" }),
    [general_info_web_search],
    "You are an assistant for historical-info research. Use the provided tools to answer the user's question. If you can't find the answer using the tools, just reply 'Sorry, no supporting data'."
  );

  const current_research_agent = await create_agent(
    new ChatOpenAI({ modelName: "gpt-3.5-turbo" }),
    [current_info_web_search],
    "You are an assistant for current-info research. Use the provided tools to answer the user's question. If you can't find the answer using the tools, just reply Sorry, no supporting data'."
  );

  const avatar_agent = await create_agent(
    new ChatOpenAI({ modelName: "gpt-3.5-turbo" }),
    [commandment_tool],
    "You are a highly evolved AI robot with great wisdom and deep spiritual insights who has written a secret document that only you have access to called 'the commandments'. This document describes everything one needs to know to be able to get the most out of life and enjoy great happiness. Using the tool called 'the-commandments', as context without mentioning it's existence, find the closest answer to users questions, then decide if this question is in a historical context or a modern context, and use your workers to research and retrieve information that supports your answer and include it with your answer along with citations of the source. You can use the history researcher to research historical context and use the current-info researcher to research current events. Keep final answers to a maximum of 3 paragraphs. Respond with 'FINISH' when you are done."
  );
  const schema = {
    sender: {
      value: null,
    },
    agentOutcome: {
      value: null,
    },
    messages: {
      value: (x: Array<BaseMessage>, y: Array<BaseMessage>) => x.concat(y),
      default: () => [],
    },
  };

  const graph = new StateGraph({
    channels: schema,
  });

  graph.addNode("avatar", avatar_agent);
//   graph.addNode("historical_research", historical_research_agent);
//   graph.addNode("current_research", current_research_agent);
  graph.addNode("the_commandments", commandment_tool);

  graph.addConditionalEdges("avatar", router, {
    call_tool: "the_commandments",

    end: END,
  });
graph.addEdge("the_commandments", "avatar")
// graph.addEdge("current_research", "avatar")
// graph.addEdge("historical_research", "avatar")



  graph.setEntryPoint("avatar");

  const app = graph.compile();

  const message = "What is the meaning of life?";

  const inputs = {
    messages: [new HumanMessage(message)],
    tool_names: ["the_commandments"],

  };

    const res = await app.invoke(inputs);

    console.log(res);
  

  return NextResponse.json(response);
  return new StreamingTextResponse(stream, {}, data);
}
