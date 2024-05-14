import { AppContext } from "@/app/providers/context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Message } from "ai";
import { SettingsIcon, SpeakerIcon, Speech } from "lucide-react";
import { useContext } from "react";
import { ThemeToggle } from "./theme-toggle";
import { GearIcon } from "@radix-ui/react-icons";

function HeaderButtons() {
  const {
    displaySettings,
    setDisplaySettings,
    useSpeech,
    setUseSpeech,
    useVoice,
    setUseVoice,
    messages,
  }: {
    displaySettings: boolean;
    setDisplaySettings: React.Dispatch<React.SetStateAction<boolean>>;
    useSpeech: boolean;
    setUseSpeech: React.Dispatch<React.SetStateAction<boolean>>;
    useVoice: boolean;
    setUseVoice: React.Dispatch<React.SetStateAction<boolean>>;
    messages: Message[];
    setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  } = useContext(AppContext);
  return (
    <Popover>
      <PopoverTrigger asChild>
        <GearIcon
          scale={3}
          className="w-6 h-6 cursor-pointer"
          //className="p-2 m-2 rounded-full cursor-pointer bg-black/10 text-black transition-all ease-in-out duration-150 hover:bg-cyan-700 hover:text-white"
        />
      </PopoverTrigger>
      <PopoverContent className="w-80 bg-black/10 backdrop-blur-md">
        <div className="flex items-center justify-evenly">
          {useSpeech && (
            <SettingsIcon
              size={40}
              className="p-2 m-2 rounded-full cursor-pointer bg-cyan-600 text-black transition-all ease-in-out duration-150 hover:bg-cyan-700 hover:text-white"
              onClick={() => setDisplaySettings(!displaySettings)}
            />
          )}
         
          <Speech
            size={40}
            className={`p-2 m-2 rounded-full cursor-pointer ${
              useVoice ? "bg-blue-500/30" : "bg-blue-500"
            } text-black transition-all ease-in-out duration-150 hover:bg-cyan-700 hover:text-white`}
            onClick={() => setUseVoice(!useVoice)}
          />
          <SpeakerIcon
            size={40}
            className={`p-2 m-2 rounded-full cursor-pointer ${
              !useSpeech ? "bg-red-500/50 " : "bg-green-500/50"
            } text-black transition-all ease-in-out duration-150 hover:bg-cyan-700 hover:text-white`}
            onClick={() => setUseSpeech(!useSpeech)}
          />
          <ThemeToggle />
        </div>
        {/* {useSpeech && (
            <DropdownMenu>
              <DropdownMenuTrigger>Open</DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Profile</DropdownMenuItem>
                <DropdownMenuItem>Billing</DropdownMenuItem>
                <DropdownMenuItem>Team</DropdownMenuItem>
                <DropdownMenuItem>Subscription</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )} */}
      </PopoverContent>
    </Popover>
  );
}

export default HeaderButtons;
