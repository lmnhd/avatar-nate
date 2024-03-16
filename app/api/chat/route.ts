import { StreamingTextResponse, LangChainStream, Message } from "ai";
import { ChatOpenAI, OpenAIEmbeddings } from "@langchain/openai";
import { AIMessage, HumanMessage } from "langchain/schema";
import { createStuffDocumentsChain } from "langchain/chains/combine_documents";
import { createRetrievalChain } from "langchain/chains/retrieval";
import { PromptTemplate } from "@langchain/core/prompts";
import { Document } from "langchain/document";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { HttpResponseOutputParser} from 'langchain/output_parsers'
import { CheerioWebBaseLoader } from "langchain/document_loaders/web/cheerio";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { RunnableSequence, RunnablePick} from '@langchain/core/runnables'

export const runtime = "edge";

export async function POST(req: Request) {
  const { messages } = await req.json();

  //const { stream, handlers } = LangChainStream();

  const llm = new ChatOpenAI({
    streaming: true,
  });

  const prompt = PromptTemplate.fromTemplate(
    `Answer the users questions about the following text. Context: {context} Question: {input}`
  );

  const loader = new CheerioWebBaseLoader(
    "https://cheerio.js.org/docs/basics/selecting"
  );

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


  const chain = await createStuffDocumentsChain({
    llm,
    prompt,
    outputParser: new StringOutputParser(),
  });
  const retrieverChain = await createRetrievalChain({
    retriever,
    combineDocsChain: chain,
  });

  const outputChain = RunnableSequence.from([
    retrieverChain,
    new RunnablePick({keys: "answer"}),
    new HttpResponseOutputParser()
  ])

  // const response = await retrieverChain.invoke({
  //   input: "What is this document about?"
  // })

 const stream = await outputChain.stream({
  input: "What is this document about?",

 })

 // console.log(response);

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
