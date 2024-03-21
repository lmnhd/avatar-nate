'use server'
// import {OpenAIWhisperAudio } from 'langchain/document_loaders/fs/openai_whisper_audio'
// import fs from 'fs';
import OpenAI from 'openai';


async function transcript(prevState: any, formData: FormData) {
    "use server";
    //console.log("PREVIOUS STATE", prevState);
    //console.log("FORM DATA", formData);
    const id = Math.random().toString(36);

    if (process.env.OPENAI_API_KEY === undefined) {
        return {
           
            response: 'Credentials not found',
        }
    }

    const file = formData.get("audio") as File;

    //console.log('>>', file);

    // return {
    //     sender: "",
    //     response: 'No audio file found',
    //     id: id
    // }

    if (!file || file.size === 0) {
        return {
            
            response: 'No audio file found',
        }
    }

   // console.log('>>', file);

    // const arrayBuffer = await file.arrayBuffer();
    // const audio = new Uint8Array(arrayBuffer);

    // --- get audio transcription from OpenAI ---
    console.log("== Transcribe Audio Sample ==");

    const openai = new OpenAI({apiKey: process.env.OPENAI_API_KEY});

    const transcription = await openai.audio.transcriptions.create({
        file: file,
        model: "whisper-1"
    })

   // console.log("Transcription: ", transcription.text)
    return {
        
        response: transcription.text,
       
    }
    

}

export default transcript;
