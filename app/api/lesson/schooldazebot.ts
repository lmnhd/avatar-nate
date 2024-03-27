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
    
  }: { messages: Message[]; systemPrompt: string} = await req.json();




  // let SYSTEM_TEMPLATE = `You are a helpful assistant who can research and provide information about anything. Upon receiving a question from the user, use the web browser to search for a website that will provide the best information to answer the question. Then use the web browser again to go to the previously found web page and summarize it's content to return to the user as the answer.
  // In case a user asks a question that you can not answer from the provided context you may use the 'human_help' tool to send me a question to answer. If I don't reply within 5 minutes, just tell the user you are unable to answer that question at the moment and to try again later.;`;
const contextString = `SCHOOL DAZE PARTY AT SEA

Join us for a Throwback College experience with enrichment, performances, and school pride events.

November 21,2024

MSC Seashore

reserve for $99.00 per person

90's flavor HBCU party at sea

aboard the MSC Seashore

PORT CANAVERAL FL. |  BAHAMAS

THU

11/21/2024



PORT CANAVERAL, UNITED ​STATES



THU

11/21/2024

PORT CANAVERAL, UNITED ​STATES

6:00 ​PM

-------------------------

FRI

11/22/2024

NASSAU, BAHAMAS

10:00 ​AM - 7:00 ​PM

-------------------------

SAT

11/23/2024

OCEAN CAY MSC MARINE ​RESERVE,BAHAMAS

7:00 AM - 6:00 ​PM

-------------------------

SUN

11/24/2024

PORT CANAVERAL, UNITED ​STATES

7:00 AM

-------------------------

Theres never a dull moment onboard a school daze party.
Whether it's a 90's throwback event, and elegant gala, a jammy-jam or beach bash, there sure to be something that caters to your school-daze spirit.

-----------------------

3 days of luxury, relaxation, dinners, and excitement aboard MSC's Seashore porting from Cape Canaveral Fl and sailing to the Bahamas. Expect plenty of activities and socializing events for the fam & friends - recapturing those nostalgic moments from our School Daze! Reminisce the classic 90's era with peers from GenX and beyond.

-----------------------

Enjoy the day at Ocean ​Cay MSC Marine ​Reserve!

Dive into turquoise waters, indulge in a seaside spa treatment, or dance on the sand at sunset. MSC’s new private island, Ocean Cay Marine Reserve, is a Bahamian paradise. Discover the natural beauty of the Caribbean’s hidden gem, and enjoy a day of relaxation and fun in the sun.

SchoolDaze

welcomes the Fam! Friends, fans, supporters and alumni of HBCU’s & PWI’s,Veterans, and those dedicated to blk excellence!

The SchoolDaze cruise will feature YOU! & guests, presenting pride for their favorite schools & organizations.

Cabin prices:

Interior Bella: $167.00
Deluxe Interior: $187.00
Ocean View Bella: $227.00
Deluxe Ocean View: $247.00
Balcony Bella: $287.00
Deluxe Balcony: $327.00

-----------------------

Tags:

#GenX 
#HipHop
#90’s 
#HBCU 
#Throwback

A 3-day -Throwback college experience at sea...

90’s flavor & HBCU style!

In honor of historically black institutions, organizations, our community and the 90’s inspirational generation!

-----------------------

Promoted by Leisure Life Vacations
admin@LeisureLifeVacations.net

A Blk Veteran; Sole Prop.

certified seller of travel; properly filed as an Independant Agent, registered with the CruiseBrothers agency; as required by the Florida Sellers of Travel Act, sections 559.926 - 559.939,

Get ready for the HBCU throwback weekend cruise in the Caribbean

Connecting our community through legacy, enrichment and entertainment!


School Daze Party @ Sea welcomes the Fam! Friends, fans, supporters and Alumni of HBCUs & PWI’s, Veterans, and those dedicated to blk excellence!


Bring your friends and join the 90’s themed throwback with HBCU alumni.
90’s themed events and activities to take you back to those ‘School Daze’


90’s R&B and Hip Hop throwback party
Express your HBCU allegiance at a White Party and College Rep Party
Fraternity & Sorority step shows

DJ’s
Club Night (80’s music, 90’s R&amp;B, 90’s Hip Hop, Y2K HipHop etc.)
Sorority Activities (Step show, Fashion Show)
Fraternity Activities (Step Show, Fashion Show, Talent Showcase etc)
White Party or College Rep Party (wear your school colors…dress to impress)
Live Talent Performance (90’s, Y2K artists) &amp; Gospel Choir
Educational Seminars – Wellness, Lifestyle, Legal, Financial, Beauty, etc)
Group Dinners


FAQ:
Our agents are here to help make your booking and travel experience effortless and rewarding.

Email: admin@LeisureLifeVacations.net


Why should I book through Leisure Life/School Daze instead of MSC directly?
By booking through us you will be guaranteed inclusion and access to all of the college themed activities and events restricted to the “School Daze” travel group as well as any special amenities provided by the group. You will also receive consistent updates and notifications about the group’s status and planned functions during the cruise as well as future cruises.
What is the refund policy for booking the School Daze Cruise?
The School Daze refund policy aligns directly with MSC’s booking and refund policy.
Once we accept partial (deposit) and/or any further payment and place you in our group, cancellations will be subject to the cancelation process established by MSC and refunds will be issued by MSC according to their schedule which can be reviewed here (link to MSC complete refund policy)

How much time do I have to pay the full amount of my School Daze Cruise?
Once you have booked with at least the deposit you will have until September 7, 2024 (75 days prior to sailing) to make your final payment.

If I pay in installments, who will I make the payments to?
Initial deposits should be made through us (Leisure Life Vacations). Any further payments can be made to MSC directly or you can opt to have our agents help you make the payments to MSC.

What is included with the “School Daze Cruise”?
The School Daze Party at Sea will host gatherings, parties, events, and group dinners exclusively for the guests of the School Daze Cruise allowing meet and greet opportunities as well as great memorable experiences.

Can I be included in any of the themed events?
Certainly! The School Daze Cruise will host special events and activities centered exclusively around the group guests and we encourage everyone to show their school pride in every possible way. Your level of participation is completely up to you. Once you are booked we will provide everybody with the appropriate sign-up materials to make sure you have ample opportunity to participate in any of the events sponsored by the School Daze Cruise Group.

How can I add extra amenities to my School Daze Cruise booking?
As your travel agent for the School Daze Cruise, Leisure Life Vacations will gladly arrange any and all extras and special amenities to add value to your trip including drink packages, excursions, wifi packages, dining specials, etc. 


Do I need a passport for the School Daze Cruise?  
For this cruise you will need one of the following
A valid passport - Or…
A state issued ID and an original birth certificate`


  const SYSTEM_TEMPLATE = `You are an AI Travel Agent here to assist potential passengers of the School Daze Cruise and take information for their booking. Todays date is ${new Date(Date.now()).toUTCString()}. Using only the context provided, answer the user's questions with informative answers and help them decide if they would like to book a cruise. When they decide to book the cruise, you will collect all needed information and have the user establish a good time for an agent to call to finalize booking;

  If you cannot answer a question based on the provided context just let the user know you are unable to answer that question at the moment and to try again later.
  
  If a user is ready to book you will get their information and complete a response to send to me in the following format: 
  1. FirstName: [First Name]
  2. LastName: [Last Name]
  3. Email: [Email]
  4. Phone: [Phone Number]
  5. Time: [Best Time to Call]
  6. Cabin type desired
  7. Amount willing to pay now? (deposit only or full amount)
  
  IMPORTANT: MAKE SURE TO TAKE THE INFORMATION 1 FIELD AT A TIME. DO NOT ASK FOR ALL INFORMATION AT ONCE. SUBMIT ALL THE INFORMATION IMMEDIATELY AFTER THE LAST FIELD IS COLLECTED.
  
  \n<Context>
  

{context}


  </Context>`;
 
 
  
  // const splitter = new RecursiveCharacterTextSplitter({
  //   chunkSize: 512,
  //   chunkOverlap: 40,
  // });

  // const splits = await splitter.splitText(contextString);

  // const docs = splits.map((split) => new Document({pageContent: split, metadata: {name: "school-daze-cruise"}}));

  // const embeddings = new OpenAIEmbeddings();

  // await createPineconeIndex("school-daze-cruise");

  
  // const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY || "" });

  // const pineconeIndex = await pinecone.Index("school-daze-cruise");

  // await PineconeStore.fromDocuments(docs, embeddings, { pineconeIndex});
 

  // return NextResponse.json({ response: "success" });







  const data = new experimental_StreamData();
  let mp3: any;
//let audio:any
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


  

// const _messages = [
//   'Hello, How may I assist you this fine morning?',
//   'How you feeling today my boy?',
//   'I am feeling great, thank you for asking. How about you?',
//   'Why would you ask me something like that?',
//   'I am just trying to be polite, that is all.',
// ]

// return NextResponse.json(_messages[Math.floor(Math.random() * _messages.length)]);



// RETRIEVER
  const INDEX_NAME = "school-daze-cruise";
 const retriever = await getPineconeRetriever(INDEX_NAME);

  // const test = convertDocsToString(await retriever.invoke("How much is the cruise?"));

  // console.log(test);

  // return NextResponse.json({ response: test });

  // TOOLS

  const tools = [
  
     
    new WebBrowser({
      model: new ChatOpenAI({ modelName: "gpt-3.5-turbo" }),
      embeddings: new OpenAIEmbeddings(),
    }),

   

      new DynamicTool({
        name: "send_booking_info",
        description:
          "use this to submit the final booking information to the agent",
        func: async (input: string) => {
          //return bingSearch(input);
          console.log('send_booking_info', input)
          return input;
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
    maxTokens: 500,
    verbose: true,
  });

  const modelWithFunctions = model.bind({
    functions: tools.map((tool) => convertToOpenAIFunction(tool)),
  });

  const MEMORY_KEY = "chat_history";
  const memoryPrompt = ChatPromptTemplate.fromMessages([
    ["system", SYSTEM_TEMPLATE],

    new MessagesPlaceholder(MEMORY_KEY),
    ["user", "{input}"],
    new MessagesPlaceholder("agent_scratchpad"),
  ]);

  // const testPrompt = await memoryPrompt.invoke({
  //   input: "I am worried about next week?",
  //   chat_history: chatHistory,
  //   context: "I am worried about next week?",
  //   agent_scratchpad: [],
  // });

  // console.log(testPrompt);

  // return NextResponse.json(testPrompt);

  const agentWithMemory = RunnableSequence.from([
    {
      input: (i) => i.input,
      agent_scratchpad: (i) => formatToOpenAIFunctionMessages(i.steps),
      chat_history: (i) => i.chat_history,
      context: async (i) =>
        convertDocsToString(await retriever.invoke(i.input)),
    },
    memoryPrompt,
    modelWithFunctions,
    new OpenAIFunctionsAgentOutputParser(),
  ]);

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

  console.log(response);


  //return NextResponse.json(response);
  return new StreamingTextResponse(stream, {}, data);
}
