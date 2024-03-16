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


export default function Chat() {
  const { messages, input, handleInputChange, handleSubmit } = useChat({
    //api: '/api/conversation-retrieval-chain'
    //api: '/api/agent'
    api: "/api/lesson",
    body: {
      systemPrompt: "You are a helpful assistant",
    },
  });
  const [systemPrompt, setSystemPrompt] = useState(
    "You are a helpful assistant"
  );
 
  

  return (
    <div className="h-full scrollbar-hide">
      <Collapsible className="fixed flex flex-col items-center justify-center w-full top-9"
      //open={false}
      >
        <CollapsibleTrigger className="w-full">
        <div className="h-6 text-white ">
          ...
          </div>
          </CollapsibleTrigger>
        <CollapsibleContent className="w-full">
          <div className=" w-full p-4 max-w-3xl? mx-auto  dark:bg-black? bg-gradient-to-b from-white via-white-/90 to-white/0 backdrop-blur-sm">
            <h1 className="w-full text-2xl font-bold">System Instructions</h1>
            <input
              className="w-full p-3 text-gray-500 border border-gray-400 rounded-sm inset-5"
              title="System Prompt"
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
            />
          </div>
        </CollapsibleContent>
      </Collapsible>

      <div className="w-full max-w-3xl mx-auto mt-10 py-36 stretch scrollbar-hide">
       

        <div className="flex flex-col-reverse h-full gap-3 mb-20 scrollbar-hide">
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
