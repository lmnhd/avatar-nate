import { OpenAIEmbeddings } from "@langchain/openai";
import { PineconeStore } from "@langchain/pinecone";
import { Pinecone } from "@pinecone-database/pinecone";
import { Document } from "langchain/document";

export const convertDocsToString = (docs: Document[]) => {
  return docs
    .map((doc) => {
      return `<doc>\n${doc.pageContent}\n</doc>`;
    })
    .join("\n");
};

export const serializeDocs = (docs:Document[]) => docs.map((doc) => doc.pageContent).join('\n');


export const createPineconeIndex = async (index_name: string) => {
  let result: any = { status: 200 };

  const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY || "" });

  try {
    await pinecone.createIndex({
      name: index_name,
      dimension: 1536,
      metric: "cosine",
      spec: { serverless: { cloud: "aws", region: "us-west-2" } },
      suppressConflicts: true,
      waitUntilReady: true,
    });
  } catch (error: any) {
    console.log("error", error);
    result = { status: 500, error: error.message };
  }

  return result;
};

export const getPineconeRetriever = async (index_name: string) => {
  const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY || "" });
  const pineconeIndex = pinecone.index(index_name);
  const vectorStore = await PineconeStore.fromExistingIndex(
    new OpenAIEmbeddings(),
    {
      pineconeIndex,
    }
  );
  return vectorStore.asRetriever();
};
