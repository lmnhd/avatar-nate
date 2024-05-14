import OpenAI from "openai";
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
import {
  GmailSearch,
  GmailSendMessage,
  GmailGetMessage,
} from "langchain/tools/gmail";
import { Calculator } from "langchain/tools/calculator";
import { WebBrowser, getText, parseInputs } from "langchain/tools/webbrowser";
import { renderTextDescription } from "langchain/tools/render";
import { Tool as AITool } from "ai";
import { NextResponse } from "next/server";
import { GithubRepoLoader } from "langchain/document_loaders/web/github";
import * as parse from "pdf-parse";
import { PDFLoader } from "langchain/document_loaders/fs/pdf";
import { similarity } from "ml-distance";
import { Pinecone } from "@pinecone-database/pinecone";
import { PineconeStore } from "@langchain/pinecone";
import { convertDocsToString, getPineconeRetriever } from "../avatar/helpers";
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
import { ElevenLabsClient, play, stream as elStream } from "elevenlabs";
import { json } from "stream/consumers";
import { createPineconeIndex } from "./helpers";
import {
  retrieveLyrics,
  searchLyrics,
} from "@/app/songlyrics/songlyricsdotcom";
import {
  LyricsResult,
  getQuickLyrics,
  getRandomSongs,
  searchForSongs,
} from "@/app/songlyrics/mldb";
import { removeBracketText } from "@/lib/utils";

//export const runtime = "edge";

const webSite = "https://python.langchain.com/docs/get_started/introduction";
const webSite2 = "https://www.cruisebrothers.com/specials";
const webSite3 = "https://www.amazon.com/";

type Artist = {
  name: string;
  songs: string[];
};
const data = new experimental_StreamData();
export async function POST(req: Request) {
  let response: ChainValues | string = { message: "Hello" };
  //let result: any = "testing";
  const {
    messages,
    systemPrompt,
    artists,
    keepItClean,
  }: {
    messages: Message[];
    systemPrompt: string;
    artists: Artist[];
    keepItClean: boolean;
  } = await req.json();

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
      //data.append(audio);
      data.close();
    },
    experimental_streamData: true,
  });

  const _artists:Artist[] = [
    { name: "Cher", songs: [] },
    // { name: "Ed Sheeran", songs: ["Shape of You", "Perfect", "Thinking Out Loud"] },
     { name: "Beyonce", songs: [] },
  ]

  async function writeSongLyrics(artists: Artist[]) {
    const lyricSheetArray: LyricsResult[] = [];
   for (let i = 0; i < artists.length; i++) {
      const artist = artists[i];
      if (artist.songs.length > 0) {
        const songs = artist.songs;
        for (let i = 0; i < songs.length; i++) {
          const song = songs[i];
          const lyrics = await getQuickLyrics(artist.name, song);
          if (lyrics && lyrics.lyrics !== "") {
            lyricSheetArray.push({
              name: removeBracketText(lyrics.name),
              lyrics: lyrics.lyrics,
              artist: lyrics.artist,
            });
          }
          await new Promise((resolve) => setTimeout(resolve, 3000));
        }
      } else {
        const lyrics = await getRandomSongs(artist.name, 1);
        if (lyrics.length > 0) {
          lyricSheetArray.push(lyrics[0]);
        }
      }
    };

    if (lyricSheetArray.length === 0) {
      return "research failed, try with different params/artists/songs";
    }
    return lyricSheetArray.map((lyric) => {
      return `[Title: ${lyric.name}]\n[Lyrics: ${lyric.lyrics}]`;
    }).join("\n\n");
  }

  const songSheet = await writeSongLyrics(_artists);
  // if (songSheet === "research failed, try with different params/artists/songs") {
  //   response = songSheet;
  //   return NextResponse.json(response);
  // }
  console.log("songSheet", songSheet);

  return NextResponse.json(songSheet);

  let SYSTEM_TEMPLATE = `You are a professional songwriter and have been tasked with completing the lyrics for a song about {context}.
you have written these songs so far...
{songs}

Now write and ONLY return the next song about {context} formatted with [Title:] and [Lyrics:]...


`;
const chatHistory = messages.slice(0, -1).map((message) => {
  return message.role == "user"
    ? new HumanMessage(message.content)
    : new AIMessage(message.content);
});
const MEMORY_KEY = "chat_history";
const memoryPrompt = ChatPromptTemplate.fromMessages([
  ["system", SYSTEM_TEMPLATE],

  new MessagesPlaceholder(MEMORY_KEY),

 // new MessagesPlaceholder("agent_scratchpad"),
]);
const res = await memoryPrompt.format({
  chat_history: chatHistory,
  songs: songSheet,
  context: systemPrompt,
  // agent_scratchpad: [],
  input: "",
});
  const model = new ChatOpenAI({
    callbacks: [handlers],
    modelName: "gpt-3.5-turbo",
    maxTokens: 200,
    temperature: 0.5,
    topP: 1,
    streaming: true,
  });
console.log("res", res);
  return NextResponse.json(response);
}
