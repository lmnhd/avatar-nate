"use client";

import { cn } from "@/lib/utils";
import { useChat } from "ai/react";
import { useContext, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import textToSpeech from "./texttospeech";

import ChatTypeInput from "@/components/chattypeinput";
import VoiceComponent from "@/components/voicecomponent";
import Messages from "@/components/messages";
import { stat } from "fs";
import { AppContext } from "./providers/context";
import SystemPrompt from "@/components/systemprompt";
import { JSONValue, Message } from "ai";
import { getFetchUrl } from "@/lib/getFetchUrl";
import VoiceSynthesizer from "@/components/speech/voicesynthesizer";

export default function Chat() {
  // const [displaySettings, setDisplaySettings] = useState(false);
  const [audioURL, setAudioURL] = useState("");
  // const { speak } = useSpeechSynthesis();

  const {
    displaySettings,
    setDisplaySettings,
    useSpeech,
    setUseSpeech,
    useVoice,
    setUseVoice,
    transcript,
    setTranscript,
    messages,
    api,
    setApi,
    input,
    data,
    handleInputChange,
    handleSubmit,
    isLoading,
    metadata,
    append,
    showPrompt,
    setShowPrompt,
    systemPrompt,
    setSystemPrompt,
  }: {
    displaySettings: boolean;
    setDisplaySettings: React.Dispatch<React.SetStateAction<boolean>>;
    useSpeech: boolean;
    setUseSpeech: React.Dispatch<React.SetStateAction<boolean>>;
    useVoice: boolean;
    setUseVoice: React.Dispatch<React.SetStateAction<boolean>>;
    transcript: string;
    setTranscript: React.Dispatch<React.SetStateAction<string>>;
    messages: Message[];
    input: string;
    handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
    isLoading: boolean;
    data: JSONValue[];
    metadata: Object | undefined;
    api: string;
    setApi: React.Dispatch<React.SetStateAction<string>>;
    append: (message: Message) => Promise<string | null | undefined>;
    showPrompt: boolean;
    setShowPrompt: React.Dispatch<React.SetStateAction<boolean>>;
    setSystemPrompt: React.Dispatch<React.SetStateAction<string>>;
    systemPrompt: string;
  } = useContext(AppContext);

  // Define a state variable to hold the audio URL

  // Define a function to fetch the audio data and set the URL state variable
  const handleAudioFetch = async () => {
    console.log("messages", messages);
    const assistantMessages = messages.filter((m) => m.role == "assistant");
    if (assistantMessages.length == 0) return;
    const assistantMessage = assistantMessages[assistantMessages.length - 1];

    console.log("assistantMessage", assistantMessage);
    if (!assistantMessage) return;
  };

  useEffect(() => {
    setApi("api/lesson");
    setUseSpeech(true);
    setUseVoice(false);

    setSystemPrompt("You are a helpful assistant");
  }, []);
  useEffect(() => {
    if (isLoading) return;
    if (!useSpeech) return;

    const assistantMessages = messages.filter((m) => m.role == "assistant");
    if (assistantMessages.length == 0) return;
    const assistantMessage = assistantMessages[assistantMessages.length - 1];

    console.log("assistantMessage", assistantMessage);
    if (!assistantMessage) return;
  }, [messages]);

  const voiceChatMessage = async (text: string) => {
    const msg = await append({
      content: text,
      role: "user",
      id: Math.random()
        .toString(36)
        .substring(7),
    });

    console.log("msg", msg);
  };

  //console.log("data", metadata, data, messages, input);

  return (
    <div className="h-full scrollbar-hide ">
      <SystemPrompt />
      <div>
        {displaySettings && <div className="h-48" />}
        <Messages messages={messages} />
        <div>
          {!useVoice && (
            <ChatTypeInput
              handleInputChange={handleInputChange}
              handleSubmit={handleSubmit}
              input={input}
            />
          )}

          {useVoice && (
            <VoiceComponent
              handleInputChange={handleInputChange}
              handleVoiceSubmit={voiceChatMessage}
            />
          )}
        </div>
      </div>
    </div>
  );
}
