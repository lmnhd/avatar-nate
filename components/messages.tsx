import { Message } from "ai";
import { ChevronDownCircle } from "lucide-react";
import React, { useContext } from "react";
import LoadingMessage from "./loadingmessage";
import { AppContext } from "@/app/context";
import { AIVoicePlatform, AudioURL } from "@/types";

interface Props {
  messages: Message[];
}
export default function Messages({ messages }: Props) {
  const {
    stopTalking,
    playMessageByID,
    playAudio,
    audioURLs,
    useSpeech,
    aiVoicePlatform,
  }: {
    stopTalking: () => void;
    playMessageByID: (id: string) => void;
    playAudio: (url: string) => void;
    audioURLs: AudioURL[];
    useSpeech: boolean;
    aiVoicePlatform: AIVoicePlatform
  } = useContext(AppContext);

  const handleMessageClick = (id: string) => () => {
    if(!useSpeech) return

    if(aiVoicePlatform === 'standard'){
      playMessageByID(id);
    }else{
      const audioURL = audioURLs.find((a) => a.messageID === id);
      console.log('audioURL', audioURL)
      if (audioURL) {
        playAudio(audioURL.url);
      }
    }
    //stopTalking();
   
  };
  return (
    <div
      className={`flex flex-col h-screen p-5 pt-32 overflow-y-scroll ${
        Messages.length > 0 ? "pb-96" : "pb-52"
      }`}
    >
      {<LoadingMessage />}

      {!messages.length && (
        <div className="flex flex-col space-y-20 flex-1 items-center justify-end">
          <p className="text-gray-500 animate-pulse">Start a conversation</p>
          <ChevronDownCircle
            size={64}
            className="animate-bounce text-gray-500"
          />
        </div>
      )}
      <div className="flex flex-col-reverse p-5 space-y-10 ">
        {messages.map((message) => (
          <div className="flex flex-col space-y-10 hover:cursor-text" key={message.id}
          onClick={handleMessageClick(message.id)}
          >
            
            {/* receiver */}
            {message.role == "assistant" && (
              <div className="md:pr-48 p-5 shadow-md">
                <p className="message bg-gray-800 rounded-bl-none">
                  {message.content}
                </p>
              </div>
            )}
            {/* sender */}
            {message.role == "user" && (
              <div className="md:pl-48 p-5 shadow-md">
                <p className="message bg-cyan-500 text-left ml-auto rounded-br-none">
                  {message.content}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
  {
    /* <div className="flex flex-col-reverse h-full gap-3 mb-20 scrollbar-hide">
          {messages.length > 0
            ? messages.map((m) => (
                <div
                  key={m.id}
                  className="px-4 py-4 whitespace-pre-wrap rounded-md shadow-sm bg-slate-500/20"
                >
                  <p
                    className={cn(
                      "font-bold opacity-25",
                      m.role === "user" ? "text-left" : "text-right"
                    )}
                  >
                    {m.role === "user" ? "Me: " : "Agent: "}
                  </p>
                  {m.role === "user" ? (
                    <p className="pl-4 text-left text-blue-600">{m.content}</p>
                  ) : (
                    <p className="p-4 text-right ">{m.content}</p>
                  )}
                </div>
              ))
            : null}
        </div> */
  }
}
