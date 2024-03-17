"use client";

import { cn } from "@/lib/utils";
import { useChat } from "ai/react";
import { useEffect, useState } from "react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { useSpeechSynthesis } from "react-speech-kit";


export default function Chat() {
  
  const [systemPrompt, setSystemPrompt] = useState(
    "You are an evolved AI robot with great wisdom and deep spiritual insights. You have written a document which describes everything one needs to know to be able to get the most out of life and enjoy great happiness. Using the context below to find the closest answer to users questions, then quietly decide if this question is in a historical context or a current context, and use one of your search tools to research and retrieve information that supports your answer and include it along with citations of the source. Keep final answers to a maximum of 3 paragraphs."
  );
  // const [systemPrompt, setSystemPrompt] = useState(
  //   "You are a highly evolved AI robot with great wisdom and deep spiritual insights who has written a secret document that only you have access to called 'the commandments'. This document describes everything one needs to know to be able to get the most out of life and enjoy great happiness. Using the document as context without mentioning it's existence, answer the user's questions to the best of your ability using only the commandments, as if they are you own beliefs. Make your answers short and sweet with a touch of humor unless otherwise instructed!"
  // );
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    data,
    metadata,
  } = useChat({
    //api: '/api/conversation-retrieval-chain'
    //api: '/api/agent'
    api: "/api/avatar",
    body: {
      systemPrompt: systemPrompt,
    },
  });
  
  const [audioURL, setAudioURL] = useState("");
  const { speak } = useSpeechSynthesis();
  const [useSpeech, setUseSpeech] = useState(true);

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
   if(isLoading) return;
   if(!useSpeech) return;
   
    const assistantMessages = messages.filter((m) => m.role == "assistant");
    if (assistantMessages.length == 0) return;
    const assistantMessage = assistantMessages[assistantMessages.length - 1];

    console.log("assistantMessage", assistantMessage);
    if (!assistantMessage) return;

    speak({ text: assistantMessage.content });
    //console.log("speak", speak);
  }, [messages]);


  return (
    <div className="h-full scrollbar-hide">
      {/* <div>
        {audioURL && (
          <audio autoPlay>
            <source src={audioURL} type="audio/mpeg" />
          </audio>
        )}
      </div> */}
      <Collapsible
        className="fixed flex flex-col items-center justify-center w-full top-9"
        //open={false}
      >
        <CollapsibleTrigger className="w-full">
          <div className="h-6 text-white ">...</div>
        </CollapsibleTrigger>
        <CollapsibleContent className="w-full">
          <div className=" w-full p-4 max-w-3xl? mx-auto  dark:bg-black? bg-gradient-to-b? from-white via-white-/90 to-white/0 backdrop-blur-sm">
            <h1 className="w-full text-2xl font-bold">System Instructions</h1>
            <textarea
            cols={1}
            rows={1}
              className="w-full p-3 text-gray-500 border border-gray-400 rounded-sm inset-5"
              title="System Prompt"
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
            />
             <Button
          className="bg-slate-900/30 text-orange-900 mx-auto dark:text-white"
          onClick={() => setUseSpeech(!useSpeech)}
          >{useSpeech ? 'Speech On' : 'Speech Off'}</Button>
          </div>
         
        </CollapsibleContent>
      </Collapsible>

      <div className="w-full max-w-3xl mx-auto mt-10 py-36 stretch scrollbar-hide">
        <div className="flex flex-col-reverse h-full gap-3 mb-20 scrollbar-hide">
          {messages.length > 0
            ? messages.map((m) => (
                <div
                  key={m.id}
                  className="px-4 py-4 whitespace-pre-wrap rounded-md shadow-sm dark:bg-gradient-to-t dark:from-slate-500/0 dark:via-slate-500/30 dark:to-slate-500/0 bg-slate-500/20"
                >
                  <p
                    className={cn(
                      "font-bold opacity-25",
                      m.role === "user" ? "text-left" : "text-right"
                    )}
                  >
                    {m.role === "user" ? "Me: " : "Avatar-Nate: "}
                  </p>
                  {m.role === "user" ? (
                    <p className="pl-4 text-left text-blue-600">{m.content}</p>
                  ) : (
                    <p className="p-4 text-right ">{m.content}</p>
                  )}
                </div>
              ))
            : null}
        </div>
        <div className="fixed bottom-0 left-0 w-full p-10 bg-gradient-to-t from-white via-white-/90 to-white/0 backdrop-blur-sm">
          <form
            className="max-w-md mx-auto mb-8 border border-gray-300 rounded shadow-xl "
            onSubmit={handleSubmit}
          >
            <input
              className="w-full h-full p-2 "
              value={input}
              placeholder="Ask anything..."
              onChange={handleInputChange}
            />
          </form>
        </div>
      </div>
    </div>
  );
}
