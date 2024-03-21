"use client";

import Image from "next/image";
import React, { useEffect, useRef, useState } from "react";
import activeAssistanIcon from "@/img/active.gif";
import inactiveAssistanIcon from "@/img/notactive.png";
// @ts-ignore
import { useFormStatus } from "react-dom";

export const mimeType = "audio/webm";
function Recorder({ uploadAudio }: { uploadAudio: (blob: Blob) => void }) {
  const { pending } = useFormStatus();
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const [permission, setPermission] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [recordingStatus, setRecordingStatus] = useState<
    "inactive" | "recording"
  >("inactive");
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);

  const getMicrophonePermission = async () => {
    if ("MediaRecorder" in window) {
      try {
        const streamData = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
        setPermission(true);
        setStream(streamData);
      } catch (error) {
        console.error(error);
        alert("You need to allow microphone access to use this feature");
      }
    } else {
      alert("Your browser does not support this feature");
    }
  };
  useEffect(() => {
    getMicrophonePermission();
  });

  const startRecording = async () => {
    if (stream === null || pending) return;

    setRecordingStatus("recording");

    const media = new MediaRecorder(stream, { mimeType });

    mediaRecorder.current = media;
    mediaRecorder.current.start();

    let localChunks: Blob[] = [];

    mediaRecorder.current.ondataavailable = (e) => {
      if (typeof e.data === "undefined") return;
      if (e.data.size === 0) return;

      localChunks.push(e.data);

      
    };
    setAudioChunks(localChunks);
  };

  const stopRecording = () => {
    if (mediaRecorder.current === null || pending) return;

    setRecordingStatus("inactive");

    //stops the recording instance
    mediaRecorder.current.stop();
    mediaRecorder.current.onstop = () => {
      const blob = new Blob(audioChunks, { type: mimeType });

      //if (blob.size === 0) return;

      console.log('blob', blob);

      uploadAudio(blob);

      setAudioChunks([]);
    };
  };
  
  return (
    <div className="flex items-center justify-center text-white">
      {!permission && (
        <button onClick={getMicrophonePermission}>Get Microphone</button>
      )}

      {pending && (
        <Image
          src={activeAssistanIcon}
          alt="Recorder"
          width={350}
          height={350}
          priority
          className="grayscale object-contain"
        />
      )}

      {permission && recordingStatus === "inactive" && !pending && (
        <Image
          src={activeAssistanIcon}
          alt="Not Recording"
          width={350}
          height={350}
          onClick={startRecording}
          priority={true}
          className="assistant cursor-pointer hover:scale-110 duration-150 transition-all ease-in-out object-contain"
        />
      )}

      {recordingStatus === "recording" && (
        <Image
          src={inactiveAssistanIcon}
          alt="Recording"
          width={350}
          height={350}
          onClick={stopRecording}
          priority={true}
          className="assistant cursor-pointer hover:scale-110 duration-150 transition-all ease-in-out object-contain"
        />
      )}
    </div>
  );
}

export default Recorder;
