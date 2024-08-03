"use client"

import { useEffect, useState } from "react";

export default function TextStream({ inputText, delay, className}: { inputText: string, delay?:number, className?: string }) {
  const [text, setText] = useState<string>('');
  const [textArray, setTextArray] = useState<string[]>(inputText.split(""));
  const [initialized, setInitialized] = useState<boolean>(false);

  const [currentText, setCurrentText] = useState('');

  const [currentIndex, setCurrentIndex] = useState(-1);
  //const {globalMessages} = useGlobalStore()



  useEffect(() => {
    //setCurrentIndex(0);
    //console.log('Text Effect CurrentIndex: ', currentIndex);

    if (currentIndex < inputText.length) {
      const timeout = setTimeout(() => {
        setCurrentText(prevText => prevText + inputText[currentIndex]);
        setCurrentIndex(prevIndex => prevIndex + 1);
      }, delay || 1);

      //setCurrentIndex(0)
  
      return () => clearTimeout(timeout);
    }
  }, [currentIndex]);

  useEffect(() => {
    //console.log('Text Effect InputText: ', inputText);
    setCurrentText('');
    setCurrentIndex(0);
  }, [inputText]);
  
  return <p
  className={className ? className : ''}
  >{currentText}</p>;
}
