"use client";
import React, { useEffect } from "react";

import { pollyGetVoiceURI, whisperGetVoiceURI } from "@/lib/voices";
import AIVoiceSynth from "@/components/speech/ai-voice-synth";
import { PollyVoicesEnum, WhisperVoicesEnum } from "@/types";
const initialState = {
  response: "",
};
export default function Page() {
  const [audioSource, setAudioSource] = React.useState<string>("");
  const [text, setText] = React.useState<string>("hello");
  const [tempText, setTempText] = React.useState<string>("hello");
  const [pollyVoice, setPollyVoice] = React.useState<string>("Joanna");
  const [whisperVoice, setWhisperVoice] = React.useState<string>("alloy");
  const [aiPlatform, setAiPlatform] = React.useState<string>("whisper");

  // const speakText = async () => {
  //   console.log("speakText");
  //   const voiceUri = await whisperGetVoiceURI("It's very good to meet you.") as string;

  //   console.log("voiceUri", voiceUri);
  //   setAudioSource(voiceUri);
  // };

  useEffect(() => {}, []);
  return (
    <div className="mt-32 p-10 flex flex-col items-center">
      <input
        type="text"
        title="text"
        value={tempText}
        onChange={(e) => setTempText(e.target.value)}
      />
      <AIVoiceSynth
        text={text}
        platform="polly"
        shouldPlay={true}
        whisperName={whisperVoice}
        pollyName={pollyVoice}
        messageID="test"
        
      />
      <button onClick={() => setText(tempText)}>Set Text</button>
      <button onClick={() => setAiPlatform("polly")}>Set Polly</button>
      <button onClick={() => setAiPlatform("whisper")}>Set Whisper</button>
      <label>Whisper</label>
      <select title="whisper" onChange={(e) => setWhisperVoice(e.target.value)}>
        {Object.keys(WhisperVoicesEnum).map((voice) => {
          return <option value={voice}>{voice}</option>;
        })}
      </select>
      <label>Polly</label>
      <select title="polly" onChange={(e) => setPollyVoice(e.target.value)}>
        {Object.keys(PollyVoicesEnum).map((voice) => {
          return <option value={voice}>{voice}</option>;
        })}
      </select>
    </div>
  );
}
