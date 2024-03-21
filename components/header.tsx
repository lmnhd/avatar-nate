import { GemIcon, SettingsIcon } from "lucide-react";
import React, { useContext } from "react";
import { ThemeToggle } from "./theme-toggle";
import { AppContext } from "@/app/context";
import { Message } from "ai";
import { Speech, AudioWaveform, SpeakerIcon } from "lucide-react";
import VoiceSynthesizer from "./speech/voicesynthesizer";
import HeaderButtons from "./headerbuttons";

import { AIVoicePlatform } from "@/types";

function Header() {
  const {
    displaySettings,
    setDisplaySettings,
    useSpeech,
    setUseSpeech,
    useVoice,
    setUseVoice,
    messages,
    aiVoicePlatform,
    setAIVoicePlatform,
    isLoading,
    setSynth,
    synth,
    pitch,
    setPitch,
    rate,
    setRate,
    voice,
    setVoice,
    volume,
    setVolume,
  }: {
    displaySettings: boolean;
    setDisplaySettings: React.Dispatch<React.SetStateAction<boolean>>;
    useSpeech: boolean;
    setUseSpeech: React.Dispatch<React.SetStateAction<boolean>>;
    useVoice: boolean;
    setUseVoice: React.Dispatch<React.SetStateAction<boolean>>;
    messages: Message[];
    setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
    aiVoicePlatform: AIVoicePlatform;
    setAIVoicePlatform: React.Dispatch<React.SetStateAction<AIVoicePlatform>>;
    isLoading: boolean;
    setSynth: React.Dispatch<React.SetStateAction<SpeechSynthesis | null>>;
    synth: SpeechSynthesis | null;
    pitch: number;
    setPitch: React.Dispatch<React.SetStateAction<number>>;
    rate: number;
    setRate: React.Dispatch<React.SetStateAction<number>>;
    voice: SpeechSynthesisVoice | null;
    setVoice: React.Dispatch<React.SetStateAction<SpeechSynthesisVoice | null>>;
    volume: number;
    setVolume: React.Dispatch<React.SetStateAction<number>>;
  } = useContext(AppContext);
  return (
    <div className="z-50">
      <div className="fixed top-0 flex items-center justify-between w-full h-12 p-8 bg-white dark:bg-white/20 backdrop-blur-md">
        <p className="text-black">
          <GemIcon />
        </p>
        <HeaderButtons />
      </div>
      <div className=" w-full overflow-hidden bg-black rounded-t-3xl">
        <VoiceSynthesizer
          displaySettings={displaySettings}
          messages={messages}
          aiVoicePlatform={aiVoicePlatform}
          useSpeech={useSpeech}
          isLoading={isLoading}
          setAIVoicePlatform={setAIVoicePlatform}
          setSynth={setSynth}
          synth={synth}
          pitch={pitch}
          setPitch={setPitch}
          rate={rate}
          setRate={setRate}
          voice={voice}
          setVoice={setVoice}
          volume={volume}
          setVolume={setVolume}
        />
      </div>
    </div>
  );
}

export default Header;
