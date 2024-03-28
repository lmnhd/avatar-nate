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
import {
  AIMessage,
  HumanMessage,
  SystemMessage,
  FunctionMessage,
  BaseMessage,
} from "@langchain/core/messages";
import {
  ChatPromptTemplate,
  MessagesPlaceholder,
  PromptTemplate,
} from "@langchain/core/prompts";
import { formatToOpenAIFunctionMessages } from "langchain/agents/format_scratchpad";
import { RunnableSequence } from "@langchain/core/runnables";
import { NextResponse } from "next/server";
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
import { ChainValues } from "langchain/schema";
import { retrieveLyrics, searchLyrics } from "@/app/songlyrics";
import { Artist } from "@/app/songlyrics/page";
//export const runtime = "edge";

export async function POST(req: Request) {
  let response: ChainValues | string = { message: "Hello" };
  let result: any = "testing";
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

  if (artists.length === 0) {
    return NextResponse.json({
      message: "No artists provided",
    });
  }
  // console.log(artists, systemPrompt);

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

  const cleanText = (text: string) => {
    //const regex1 = "\(.*?\)";
    const regex1 = /\[.*?\]/;
    const regex2 = /\(.*?\)/;
    const cleanTitle = text.replace(regex1, "").replace(regex2, "");

    return cleanTitle;
  };

  // const cleanTextTest = cleanText("Control (Originally Performed By Janet Jackson) [Karaoke]");

  // console.log("cleanTextTest", cleanTextTest);

  // return NextResponse.json({ cleanTextTest });

  const getSongExampleLyrics = async (artists: Artist[]) => {
    let lyrics = [];
    for (let artist of artists) {
      if (artist.songs.length > 0) {
        for (let song of artist.songs) {
          let result = await searchLyrics(artist.name, song);
          const ly = await retrieveLyrics(result[0].link);
          if (ly.includes("We do not have the lyrics for")) {
            
          }else{
            lyrics.push(`Title:\n${song} \n\nLyrics:\n ${ly}`);
          }
          
        }
      } else {
        //get a random song
        if (!artist.name) {
          console.log("Could not find artist name", artist.name);
          return lyrics
        }
        let result = await getSongsForArtist(artist.name, 20);
        const randomNum = Math.floor(Math.random() * result.length - 1);
        if (!result[randomNum]) {
          console.log(
            "Could not find random song for artist",
           
            `result[randomNum] = ${randomNum}`
          );
          continue;
        }
        const ly = await retrieveLyrics(result[randomNum].link);
        console.log('ly', ly)
        if (ly == '' || ly.includes("We do not have the lyrics for")) {
          // return lyrics
        }else{
          console.log("Adding song", result[randomNum].name);
          lyrics.push(
            `Title: ${cleanText(
              result[randomNum].name
            )} \n\nLyrics: ${ly}`
          );
        }
       
      }
    }
    return lyrics;
  };

  const getSongsForArtist = async (artist: string, max_results: number = 3) => {
    let result = await searchLyrics(artist, "");
    if (result.length > max_results) {
      result = result.slice(0, max_results);
    }
    let songLinks: { name: string; link: string }[] = [];
    for (let i = 0; i < max_results; i++) {
      songLinks.push({
        name: result[i].title,
        link: result[i].link,
      });
    }

    return songLinks;
  };

  const lyrics = (await getSongExampleLyrics(artists)).join("**********\n\n");

  console.log(`lyrics: ${lyrics}`);

  return NextResponse.json(lyrics);

  if (lyrics === "") {
    return NextResponse.json({
      message:
        "Unable to research artist chosen. Please try again with a different artist.",
    });
  }
  // console.log(lyrics);

  // return NextResponse.json({ lyrics });

  let SYSTEM_TEMPLATE = `You are an AI genius songwriter that does not talk. You have been tasked with completing the lyrics for a song about {context}.
   you have written these songs so far...
   {songs}
   
   Now write and return the next song about {context}. 
   Format the song with [Title:] and [Lyrics:]
   ${
     keepItClean
       ? " IMPORTANT: THIS IS FOR RADIO SO KEEP IT CLEAN!"
       : "IF IT SELLS A MILLION COPIES YOU GET 1 MILLION DOLLARS!"
   }...
   
   
  `;
  const tools = [
    new DynamicTool({
      name: "general-info-web-search",
      description: "use this for general search.",
      func: async (input: string) => {
        return duckDuckGoZero(input);
      },
    }),
  ];
  const chatHistory = messages.slice(0, -1).map((message) => {
    return message.role == "user"
      ? new HumanMessage(message.content)
      : new AIMessage(message.content);
  });

  const model = new ChatOpenAI({
    modelName: "gpt-3.5-turbo",
    temperature: 0,
    streaming: true,
    maxTokens: 2500,
    verbose: true,
  });
  const modelWithFunctions = model.bind({
    functions: tools.map((tool) => convertToOpenAIFunction(tool)),
  });

  const MEMORY_KEY = "chat_history";
  const memoryPrompt = ChatPromptTemplate.fromMessages([
    ["system", SYSTEM_TEMPLATE],

    new MessagesPlaceholder(MEMORY_KEY),

    new MessagesPlaceholder("agent_scratchpad"),
  ]);

  const res = await memoryPrompt.format({
    chat_history: chatHistory,
    songs: lyrics,
    context: systemPrompt,
    agent_scratchpad: [],
    input: "",
  });

  console.log("res", res);
  return NextResponse.json(response);
  // context and songs
  const agentWithMemory = RunnableSequence.from([
    {
      input: (i) => i.input,
      agent_scratchpad: (i) => formatToOpenAIFunctionMessages(i.steps),
      chat_history: (i) => i.chat_history,
      context: () => messages[messages.length - 1].content,
      songs: () => lyrics,
    },

    memoryPrompt,
    modelWithFunctions,
    new OpenAIFunctionsAgentOutputParser(),
  ]);

  console.log("agentWithMemory", agentWithMemory);

  return NextResponse.json(response);

  const executorWithMemory = AgentExecutor.fromAgentAndTools({
    agent: agentWithMemory,
    tools,
    callbacks: [handlers],
    maxIterations: 3,
    verbose: true,
    returnIntermediateSteps: true,
  });

  response = executorWithMemory
    .invoke(
      {
        //input: `what is the web page 'https://cheerio.js.org/docs/intro' about?`,
        //input: "Hello",
        input: messages[messages.length - 1].content,

        chat_history: chatHistory,
      },
      { callbacks: [handlers] }
    )
    .catch(console.error);

  return NextResponse.json(response);
}
