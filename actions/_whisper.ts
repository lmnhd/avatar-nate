"use server";
import fs from "fs";
import path from "path";
import OpenAI from "openai";
import { revalidatePath } from "next/cache";

async function whisper(prevState: any, formData: FormData) {
  "use server";
  console.log("PREVIOUS STATE", prevState);

  //revalidatePath('/playground')
  //return { response: "Hello, World!" };
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  const text = formData.get("text") as string;

  // const mp3 = await openai.audio.speech.create({
  //   model: "tts-1",
  //   voice: "alloy",
  //   input: "Today",
  // });
  
  //const buffer = Buffer.from(await mp3.arrayBuffer());
return new Response('Hello, World!');
  // return {
  //   response:  text,
  // };
  
}

export default whisper;
