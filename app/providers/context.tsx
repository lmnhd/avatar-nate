// Context for app
import React, { createContext, useContext, useReducer, useState } from "react";
import { Message } from "ai";
import { useChat } from "ai/react";

import { Howl, Howler} from "howler";
import { AudioURL, IndexName } from "@/types";

import { AIVoicePlatform } from "@/types";


type State = {
  messages: Message[];
  displaySettings: boolean;
};

type Action = {
  type: string;
  payload: any;
};



const reducer = (state: State, action: Action) => {
  switch (action.type) {
    case "ADD_MESSAGE":
      return {
        ...state,
        messages: [action.payload, ...state.messages],
      };
    case "TOGGLE_SETTINGS":
      console.log("action", action);
      return {
        ...state,
        displaySettings: !state.displaySettings,
      };
    default:
      return state;
  }
};

export const AppContext = createContext<any>({});

// export const useAppContext = () => useContext(AppContext);

export default function AppProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  //   const [state, dispatch] = useReducer(reducer, {
  //     messages: [],
  //     displaySettings: false,
  //   });
  const [displaySettings, setDisplaySettings] = useState(false);

  const [synth, setSynth] = useState<SpeechSynthesis | null>(null);
  const [pitch, setPitch] = useState(1);
  const [rate, setRate] = useState(1);
  const [volume, setVolume] = useState(1);
  const [voice, setVoice] = useState<SpeechSynthesisVoice | null>(null);

  const [extrasOBJ, setExtrasOBJ] = useState<any>(null)

  const [audioURLs, setAudioURLs] = useState<AudioURL[]>([]);
  const [useVoice, setUseVoice] = useState(false);
  const [useSpeech, setUseSpeech] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [showPrompt, setShowPrompt] = useState(false);
  const [systemPrompt, setSystemPrompt] = useState(
    "You are a helpful assistant"
  );
  const [indexName, setIndexName] = useState<IndexName>("avatar-nate-custom");
  const [api, setApi] = useState("api/lesson");
  const [aiVoicePlatform, setAIVoicePlatform] = useState<AIVoicePlatform>(
    "standard"
  );
  const {
    messages,
    input,
    setInput,
    handleInputChange,
    handleSubmit,
    isLoading,
    data,
    metadata,
    append,
    
  } = useChat({
    //api: '/api/conversation-retrieval-chain'
    //api: '/api/agent'
    api: `/${api}`,
    body: {
      systemPrompt: systemPrompt,
      indexName,
      extrasOBJ
    },
  });

  const stopTalking = () => {
    if (!synth) return;
    synth.cancel();
  };

  const playMessageByID = (id: string) => {
    if (!synth) return;
    if (!useSpeech) return;
    
    if (synth.speaking) {synth.cancel(); return;}

    const text = messages.find((m) => m.id === id)?.content;

    const wordsTosay = new SpeechSynthesisUtterance(text);

    wordsTosay.voice = voice;
    wordsTosay.pitch = pitch;
    wordsTosay.rate = rate;
    wordsTosay.volume = volume;

    synth.speak(wordsTosay);
  };

  let sound:any

  const playAudio = (url: string) => {
    if (sound){sound.stop(); sound = null; return}
     sound = new Howl({
      src: [url],
      xhr:{headers:{
        "Access-Control-Allow-Origin": "*"
      
      }}
    });

    sound.play();
    
  }

  //console.log('useVoice', useVoice)
  return (
    <AppContext.Provider
      value={{
        displaySettings,
        setDisplaySettings,
        messages,
        input,
        setInput,
        handleInputChange,
        handleSubmit,
        isLoading,
        data,
        metadata,
        useVoice,
        setUseVoice,
        useSpeech,
        setUseSpeech,
        transcript,
        setTranscript,
        systemPrompt,
        setSystemPrompt,
        api,
        setApi,
        append,
        showPrompt,
        setShowPrompt,
        aiVoicePlatform,
        setAIVoicePlatform,
        synth,
        setSynth,
        pitch,
        setPitch,
        rate,
        setRate,
        volume,
        setVolume,
        voice,
        setVoice,
        stopTalking,
        playMessageByID,
        playAudio,
        audioURLs,
        setAudioURLs,
        indexName,
        setIndexName,
        setExtrasOBJ,
        extrasOBJ

      }}
    >
      {children}
    </AppContext.Provider>
  );
}
