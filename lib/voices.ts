"use server";

import { PollyVoices, WhisperVoices } from "@/types";
import {
  PollyClient,
  SynthesizeSpeechCommand,
  SynthesizeSpeechInput,
  StartSpeechSynthesisTaskInput,
  StartSpeechSynthesisTaskCommand,
} from "@aws-sdk/client-polly";
import {
  S3Client,
  PutObjectCommand,
  PutObjectCommandInput,
} from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import { PutObjectRequest } from "aws-sdk/clients/s3";
import { randomUUID } from "crypto";
import OpenAI from "openai";



// AWS.config.region = 'us-east-1';
// AWS.config.credentials = new AWS.CognitoIdentityCredentials({
//     IdentityId: process.env.AWS_IDENTITY_POOL_ID as string,
// });
export async function pollyGetVoiceURIFaster(text: string, voice: PollyVoices = 'Amy') {
    console.log("playVoice", process.env.AWS_ACCESS_KEY_ID);

    try {
        const client = new PollyClient({
            region: "us-east-1",
            credentials: {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
            secretAccessKey: process.env.AWS_SECRET_ACCESS as string,
            },
        });
        const input: SynthesizeSpeechInput = {
            OutputFormat: "mp3",
            Text: text,
            VoiceId: voice,
            Engine: "neural",
            LanguageCode: "en-US",
        };
        
        const command = new SynthesizeSpeechCommand(input);
        const response = await client.send(command);
        return await storeVoiceToS3(response.AudioStream) as string;
    } catch (error) {
        console.log(error)
        return ''
    }

    return ''
    //return 'test'
   
    //return response.AudioStream;
    
}
export async function pollyGetVoiceURI(text: string, voice: PollyVoices = 'Amy') {
  console.log("playVoice", process.env.AWS_ACCESS_KEY_ID);
  //return 'test'
  const client = new PollyClient({
    region: "us-east-1",
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
      secretAccessKey: process.env.AWS_SECRET_ACCESS as string,
    },
  });
  const input: StartSpeechSynthesisTaskInput = {
    OutputFormat: "mp3",
    Text: text,
    VoiceId: voice,
    Engine: "neural",
    LanguageCode: "en-US",
    OutputS3BucketName: "s3stackstack-voicesbucketcde2e728-zpld4elu8d2l",

  };

  const command = new StartSpeechSynthesisTaskCommand(input);
  const response = await client.send(command);
  console.log(response);
 
  return response?.SynthesisTask?.OutputUri;
}

export async function whisperGetVoiceURI(text: string, voice: WhisperVoices = 'alloy') {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const mp3 = await openai.audio.speech.create({
    model: "tts-1",
    voice: voice,
    input: text,

  });
  const buffer = Buffer.from(await mp3.arrayBuffer());
  const uri = await storeVoiceToS3(buffer);
  return uri;
}

export const storeVoiceToS3 = async (voice: any) => {
  const client = new S3Client({
    region: "us-east-1",
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
      secretAccessKey: process.env.AWS_SECRET_ACCESS as string,
    },
  });
  try {
    const response = new Upload({
      client,
      params: {
        Bucket: "s3stackstack-voicesbucketcde2e728-zpld4elu8d2l",
        Key: randomUUID().toString() + ".mp3",
        Body: voice,
        // expires 3 days from now
        Expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      },
    });
    response.on('httpUploadProgress', (progress) => {
        console.log(`Uploaded ${progress.loaded} of ${progress.total} bytes`);
    })
    const result = await response.done();
    console.log(result);
    return result.Location;
  } catch (error) {console.log(error)}
  
  
};
