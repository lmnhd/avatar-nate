'use client';
import { BeatLoader } from "react-spinners";
// @ts-ignore
import { useFormStatus } from "react-dom";
function LoadingMessage() {
    const { pending } = useFormStatus();
  return (
    pending && (
        <p className="message ml-auto">
            <BeatLoader/>
        </p>
    )
  )
}

export default LoadingMessage