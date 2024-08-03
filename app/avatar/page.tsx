"use client";

import { cn } from "@/lib/utils";
import { useChat } from "ai/react";
import { useContext, useEffect, useState } from "react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { useSpeechSynthesis } from "react-speech-kit";
import { JSONValue, Message } from "ai";
import { AppContext } from "../providers/context";
import Messages from "@/components/messages";
import SystemPrompt from "@/components/systemprompt";
import ChatTypeInput from "@/components/chattypeinput";
import VoiceComponent from "@/components/voicecomponent";
import LoadingOverlay from "@/components/loading-overlay";
import { IndexName, IndexNameEnum } from "@/app/api/avatar/route";

export default function Chat() {
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
    indexName,
    setIndexName,
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
    indexName: IndexName;
    setIndexName: React.Dispatch<React.SetStateAction<IndexName>>;
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

  const [backGroundWorking, setBackGroundWorking] = useState(false);

  // const [systemPrompt, setSystemPrompt] = useState(
  //   "You are a highly evolved AI robot with great wisdom and deep spiritual insights who has written a secret document that only you have access to called 'the commandments'. This document describes everything one needs to know to be able to get the most out of life and enjoy great happiness. Using the document as context without mentioning it's existence, answer the user's questions to the best of your ability using only the commandments, as if they are you own beliefs. Make your answers short and sweet with a touch of humor unless otherwise instructed!"

  useEffect(() => {
    setApi("api/avatar");
    // setApi('api/uploadavatar')
    setUseSpeech(true);
    setUseVoice(true);

    setSystemPrompt(
      `You are an evolved AI robot with great wisdom and deep spiritual insights. You have written a document which describes everything one needs to know to be able to get the most out of life and enjoy great happiness. Using the context below to find the closest answer to users questions, then quietly decide if this question is in a historical context or a current context, and use one of your search tools to research and retrieve information that supports your answer and include it along with citations of the source. Keep final answers to a maximum of 3 paragraphs.`
    );
    setIndexName(IndexNameEnum["avatar-nate-custom"])
  }, []);

  useEffect(() => {}, [transcript]);

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

  return (
    <div className="h-full scrollbar-hide ">
      <LoadingOverlay loading={backGroundWorking} loadingText="Please Wait..." />
      <SystemPrompt isLoading={backGroundWorking} setIsLoading={setBackGroundWorking} />
      <Select
              onValueChange={(value) => {
                console.log("Value: ", value);
                setIndexName(value as IndexName);
              }}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue  placeholder="Custom" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={IndexNameEnum["avatar-embeddings-2"]}>{'Original'}</SelectItem>
                  <SelectItem value={IndexNameEnum["avatar-nate-custom"]}>{'Custom'}</SelectItem>
                </SelectContent>
              </Select>

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
