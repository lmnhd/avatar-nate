"use client";
import { AppContext } from "@/app/providers/context";
import { AIVoicePlatform, PollyVoicesEnum, WhisperVoicesEnum } from "@/types";
import { Message } from "ai";
import React, { useContext, useEffect, useState } from "react";
import AIVoiceSynth from "./ai-voice-synth";
import StandardSpeechSettings from "./standard-settings";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type State = {
  response?: string | null;
};
interface Props {
  messages: Message[];
  displaySettings: boolean;
  useSpeech: boolean;
  aiVoicePlatform: AIVoicePlatform;
  setAIVoicePlatform: (platform: AIVoicePlatform) => void;
  isLoading: boolean;
  synth: SpeechSynthesis | null;
  setSynth: React.Dispatch<React.SetStateAction<SpeechSynthesis | null>>;
  pitch: number;
  setPitch: React.Dispatch<React.SetStateAction<number>>;
  rate: number;
  setRate: React.Dispatch<React.SetStateAction<number>>;
  volume: number;
  setVolume: React.Dispatch<React.SetStateAction<number>>;
  voice: SpeechSynthesisVoice | null;
  setVoice: React.Dispatch<React.SetStateAction<SpeechSynthesisVoice | null>>;
}

function VoiceSynthesizer({
  displaySettings,
  aiVoicePlatform,
  setAIVoicePlatform,
  isLoading,
  messages,
  useSpeech,
  setSynth,
  synth,
  pitch,
  setPitch,
  rate,
  setRate,
  volume,
  setVolume,
  voice,
  setVoice
}: Props) {
  const [text, setText] = useState<string>("");

  const [pollyVoice, setPollyVoice] = useState<PollyVoicesEnum>(
    PollyVoicesEnum.Joanna
  );
  const [whisperVoice, setWhisperVoice] = useState<WhisperVoicesEnum>(
    WhisperVoicesEnum.alloy
  );

  const [messageID, setMessageID] = useState<string>("");

  const myClass =
    "flex-1 bg-cyan-500 text-white border border-gray-300 text-sm rounded-lg focus:ring-purple-500 block w-fit p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:focus:ring-purple-500 dark:focus:border-purple-500";

  const handleVoiceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (aiVoicePlatform === "standard") {
      const voice = window.speechSynthesis
        .getVoices()
        .find((v) => v.name === e.target.value);
      if (voice) {
        setVoice(voice);
      }
    } else if (aiVoicePlatform === "polly") {
      setPollyVoice(e.target.value as PollyVoicesEnum);
    } else if (aiVoicePlatform === "whisper") {
      setWhisperVoice(e.target.value as WhisperVoicesEnum);
    }
  };

  const handlePitchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPitch(parseFloat(e.target.value));
  };

  const handleRateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRate(parseFloat(e.target.value));
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVolume(parseFloat(e.target.value));
  };

  const handleStandardVoice = (content: string) => {
    if (!synth) return;
    if (!useSpeech) return;
    // if (!voice) return;
    if (aiVoicePlatform !== "standard") return;

    const wordsTosay = new SpeechSynthesisUtterance(content);

    wordsTosay.voice = voice;
    wordsTosay.pitch = pitch;
    wordsTosay.rate = rate;
    wordsTosay.volume = volume;

    synth.speak(wordsTosay);

    return () => {
      synth.cancel();
    };
  };

  useEffect(() => {
    if (!window || !window.speechSynthesis) return;
    setSynth(window.speechSynthesis);
  }, []);

  useEffect(() => {
    console.log(`voicesynthesizer useeffect # ${Math.random() * 13}`, messages);
    if (!messages.length || !useSpeech || isLoading) return;
    const lastMessage = messages[messages.length - 1];
    if (!(lastMessage.role === "assistant")) return;

    const assistantMessages = messages.filter((m) => m.role == "assistant");
    if (assistantMessages.length == 0) return;
    const assistantMessage = assistantMessages[assistantMessages.length - 1];

    //console.log("assistantMessage", assistantMessage);
    if (!assistantMessage) return;

    console.log("MESSAGES GETTING THROUGH =>", assistantMessage.content);

    //trigger both methods - components will decide if they should run
    console.log("voice model = ", aiVoicePlatform);
    if (aiVoicePlatform === "standard") {
      console.log("standard voice model");
      handleStandardVoice(assistantMessage.content);
    } else {
      console.log("AI voice model");
      setMessageID(assistantMessage.id);
      setText(assistantMessage.content);
    }
  }, [messages]);

  //console.log("displaySettings", displaySettings);
  return (
    <div
      className="fixed flex flex-col items-center w-full justify-center top-24 opacity-90 backdrop-blur-lg"
      //className="flex flex-col items-center justify-center text-white "
    >
      {/*Not Visible */}
      <AIVoiceSynth
        platform={aiVoicePlatform}
        text={text}
        shouldPlay={useSpeech}
        pollyName={pollyVoice}
        whisperName={whisperVoice}
        messageID={messageID}
      />
      {displaySettings && useSpeech && (
        <Select
          onValueChange={(val) => {
            setAIVoicePlatform(val as AIVoicePlatform);
          }}
        >
          <SelectTrigger className="w-[180px] bg-cyan-700">
            <SelectValue placeholder="Voice Model" />
          </SelectTrigger>
          <SelectContent className="bg-cyan-300 text-cyan-900">
            <SelectItem value="standard">Browser</SelectItem>
            <SelectItem value="whisper">Whisper</SelectItem>
            <SelectItem value="polly">Polly</SelectItem>
          </SelectContent>
        </Select>
      )}

      {aiVoicePlatform == "standard" && displaySettings && useSpeech && (
        <>
          <StandardSpeechSettings
            handlePitchChange={handlePitchChange}
            handleRateChange={handleRateChange}
            handleVolumeChange={handleVolumeChange}
            pitch={pitch}
            rate={rate}
            volume={volume}
            text={text}
          />
        </>

        /* AI speech settings*/
      )}

      {displaySettings && aiVoicePlatform === "standard" && useSpeech && (
        <div className="w-fit mx-auto ">
          <p className="text-xs text-gray-500 p-2">Voice:</p>
          <select
            name="voices"
            value={voice?.name || ""}
            title="voices"
            className={myClass}
            onChange={handleVoiceChange}
          >
            {window.speechSynthesis.getVoices().map((voice) => (
              <option key={voice.name} value={voice.name} className="">
                {voice.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {displaySettings && aiVoicePlatform === "polly" && useSpeech && (
        <div className="w-fit mx-auto ">
          <p className="text-xs text-gray-500 p-2">Voice:</p>
          <select
            name="voices"
            value={pollyVoice}
            title="voices"
            className={myClass}
            onChange={handleVoiceChange}
          >
            {Object.keys(PollyVoicesEnum).map((voice, i) => (
              <option
                key={voice}
                // selected={voice == pollyVoice}
                value={voice}
                className="w-full"
              >
                {`Amazon Polly Voice - ${i + 1} ${voice}`}
              </option>
            ))}
          </select>
        </div>
      )}
      {displaySettings && aiVoicePlatform === "whisper" && (
        <div className="w-fit mx-auto ">
          <p className="text-xs text-gray-500 p-2">Voice:</p>
          <select
            name="voices"
            value={whisperVoice}
            title="voices"
            className={myClass}
            onChange={handleVoiceChange}
          >
            {Object.keys(WhisperVoicesEnum).map((voice, i) => (
              <option
                key={voice}
                //selected={voice == whisperVoice}
                value={voice}
                className="w-full"
              >
                {`OpenAI Whisper Voice ${i + 1} ${voice}`}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}

export default VoiceSynthesizer;
