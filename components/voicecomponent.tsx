"use client";

import React, { useContext, useEffect } from "react";
import Recorder from "./recorder";
import VoiceSynthesizer from "./speech/voicesynthesizer";
// @ts-ignore
import { useFormState } from "react-dom";
import transcribe from "@/actions/transcript";
import { Message } from "ai";
import { AppContext } from "@/app/providers/context";

const initialState = {
  response: "",
};

function VoiceComponent({
  handleVoiceSubmit,
  handleInputChange,
}: {
  handleVoiceSubmit: (e: string) => void;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  const fileRef = React.useRef<HTMLInputElement>(null);
  const submitButton = React.useRef<HTMLButtonElement>(null);
  const submitTextButton = React.useRef<HTMLButtonElement>(null);
  const transcriptTextInput = React.useRef<HTMLInputElement>(null);
  const [state, formAction] = useFormState(transcribe, initialState);

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
  }: {
    displaySettings: boolean;
    setDisplaySettings: React.Dispatch<React.SetStateAction<boolean>>;
    useSpeech: boolean;
    setUseSpeech: React.Dispatch<React.SetStateAction<boolean>>;
    useVoice: boolean;
    setUseVoice: React.Dispatch<React.SetStateAction<boolean>>;
    messages: Message[];
    transcript: string;
    setTranscript: React.Dispatch<React.SetStateAction<string>>;
  } = useContext(AppContext);

  const uploadAudio = (blob: Blob) => {
    const file = new File([blob], "audio.webm", { type: blob.type });

    // set the file as the value of the hidden file input field
    if (fileRef.current) {
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);
      fileRef.current.files = dataTransfer.files;

      //console.log("fileref", fileRef.current.files[0]);

      // simulate a click and submit the form
      if (submitButton.current) {
        submitButton.current.click();
      }
    }
  };
  useEffect(() => {
    if (state.response) {
      // transcriptTextInput.current!.value = state.response;

      console.log("state", state);
      handleVoiceSubmit(state.response);
      setTranscript(state.response);
    }
  }, [state]);

  // useEffect(() => {
  //   console.log("transcript-vc", transcript);
  //   if (submitTextButton.current) {
  //     submitTextButton.current?.click();
  //   }
  // }, [transcript]);

  return (
    <div>
      {/* Hidden Fields for voice transcript handler */}
      <form action={formAction} className="flex flex-col bg-black">
        <input 
        title="file" 
        type="file" 
        name="audio" 
        hidden 
        ref={fileRef} />
        <button title="submit" type="submit" ref={submitButton} />
        <div className="fixed left-0 bottom-0 w-full overflow-hidden bg-black rounded-t-3xl">
          {/* Recorder */}
          <Recorder uploadAudio={uploadAudio} />
          {/* <div>
            <VoiceSynthesizer displaySettings={displaySettings} messages={messages} />
          </div> */}
        </div>
      </form>

     
    </div>
  );
}

export default VoiceComponent;
