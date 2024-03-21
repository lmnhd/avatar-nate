"use client";
import React, { useContext, useEffect } from "react";
import { pollyGetVoiceURI, pollyGetVoiceURIFaster, whisperGetVoiceURI } from "@/lib/voices";
import { AppContext } from "@/app/context";
import { AIVoicePlatform, PollyVoices, WhisperVoices } from "@/types";
import { AudioURL } from "@/types";


export default function AIVoiceSynth({text, platform, shouldPlay, whisperName, pollyName,messageID }: {text: string, platform: AIVoicePlatform, shouldPlay: boolean, whisperName: string, pollyName: string, messageID:string}) {
  const [audioSource, setAudioSource] = React.useState<string>("");
  const { audioURLs, setAudioURLs }:{ audioURLs: AudioURL[], setAudioURLs: React.Dispatch<React.SetStateAction<AudioURL[]>> } = useContext(AppContext);

  useEffect(() => {
    
    const speakText = async () => {
      console.log("speakText", `text = ${text}`, `shouldPlay = ${shouldPlay}`, `platform = ${platform}`, whisperName, pollyName);

      if (!text || !shouldPlay) return;
      console.log("speakText");
      let voiceUri: string = "";
      if (platform === 'whisper') {
        voiceUri = await whisperGetVoiceURI(text, whisperName as WhisperVoices) as string;
      } else if (platform === 'polly') {
        voiceUri = await pollyGetVoiceURIFaster(text, pollyName as PollyVoices) as string;

        //await new Promise((resolve, reject) => { setTimeout(() => resolve(''), 5000) })
      } else if (platform === 'elevenLabs') {
        //voiceUri = await elevenLabsGetVoiceURI(text) as string;
      
      }
      // voiceUri = 'https://s3stackstack-voicesbucketcde2e728-zpld4elu8d2l.s3.us-east-1.amazonaws.com/5290239e-400b-46b4-88ee-bc0a6ca62a00.mp3'
      if(!voiceUri) return;
      setAudioURLs([...audioURLs, {messageID: messageID, url: voiceUri}]);
      console.log("voiceUri", voiceUri);
      setAudioSource(voiceUri);
    };

    speakText();
  
  }, [text]);

  return <audio src={audioSource} id="audioPlayback" controls autoPlay hidden />;
}
