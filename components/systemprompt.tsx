import React, { useContext } from "react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Button } from "./ui/button";
import { AppContext } from "@/app/context";
import { Message } from "ai";
function SystemPrompt() {
  const {
    systemPrompt,
    setSystemPrompt,
    showPrompt,
    setShowPrompt,
    displaySettings,
  }: {
    systemPrompt: string;
    setSystemPrompt: React.Dispatch<React.SetStateAction<string>>;
    showPrompt: boolean;
    setShowPrompt: React.Dispatch<React.SetStateAction<boolean>>;
    displaySettings: boolean;
  } = useContext(AppContext);
  return (
    <Collapsible
      className="fixed flex flex-col items-center justify-center w-screen border border-t-0 left-0  top-16"
      open={showPrompt && !displaySettings}
      //open={true}
      onOpenChange={(open) => setShowPrompt(open)}
    >
      <CollapsibleTrigger 
      className="w-full"
      >
        <div 
        className="h-6 text-white mx-auto  "
        >...</div>
      </CollapsibleTrigger>
      <CollapsibleContent 
      className="flex flex-col items-center justify-center w-screen lg:w-2/3? mx-auto"
      >
        <div className="p-4 w-full max-w-2xl mx-auto  dark:bg-black? bg-gradient-to-b from-white via-white-/90 to-white/0 backdrop-blur-sm">
          <h1 className="w-full text-2xl font-bold">System Instructions</h1>
          <input
            className="w-full p-3 text-gray-500 border border-gray-400 rounded-sm inset-5"
            title="System Prompt"
            value={systemPrompt}
            onChange={(e) => setSystemPrompt(e.target.value)}
          />
          {/* <Button
            className="bg-slate-900/30 text-orange-900 mx-auto dark:text-white"
            onClick={() => setUseSpeech(!useSpeech)}
          >
            {useSpeech ? "Speech On" : "Speech Off"}
          </Button> */}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

export default SystemPrompt;
