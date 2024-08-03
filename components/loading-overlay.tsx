import React from "react";
//import { motion } from 'framer-motion';
import TextStream from "./text-stream";

export default function LoadingOverlay({loading, loadingText}:{loading: boolean, loadingText: string}) {
  return (
    <div>
      {loading && (
        <div
        //   initial={{ x: 100, opacity: 0 }}
        //   animate={{ x: 0, opacity: 1 }}
         // transition={{ type: "spring", stiffness: 100 }}
          className="bg-gradient-to-br from-black/90 to-violet-800/20 mix-blend-color? blur-xl? backdrop-blur-md z-30 flex items-center justify-center fixed bg-fixed? opacity-100 bottom-0 left-0 w-screen h-screen transition-all ease-in-out duration-300"
        >
          <TextStream
            className="z-50 text-violet-200 text-2xl"
            inputText={loadingText}
            delay={20}
          />
        </div>
      )}
    </div>
  );
}
