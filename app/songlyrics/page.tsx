"use client";
import { ChatRequestOptions, JSONValue } from "ai";
import { Message } from "postcss";
import React, { useContext, useEffect } from "react";
import { AppContext } from "../providers/context";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

// const formSchema = z.object({
//   artists: z.array(z.string()),

//   systemPrompt: z.string(),
// });

export type Artist = {
  name: string;
  songs: string[];
};
const Wrapper = ({
    children,
    label,
    textAlign,
  }: {
    children: React.ReactNode;
    label: string;
    textAlign?: 'left' | 'right';
  }) => (
    <div className={cn(`p-4 border-[1px] border-gray-100 inset-3 dark:border-cyan-400/30 rounded-sm flex flex-col items-start space-y-3  `, textAlign === 'right' ? 'items-end border-r-0 border-b-0' : 'text-left border-l-0 border-t-0')}>
      <Label>{label}</Label>
      {children}
    </div>
  );
function SongWriterPage() {
  const [artists, setArtists] = React.useState<Artist[]>([
    { name: "", songs: [] },
    { name: "", songs: [] },
    { name: "", songs: [] },
  ]);
  const [lyrics, setLyrics] = React.useState<string[]>([]);
  const [keepItClean, setKeepItClean] = React.useState<boolean>(true);
  const [dilemma, setDilemma] = React.useState<string>("");
  const [canSubmit, setCanSubmit] = React.useState<boolean>(false);
  const placeHolder = "Im feeling a bit lonely, but I am happy to be free";

  const {
    messages,
    api,
    setApi,
    input,
    setInput,
    data,
    handleInputChange,
    handleSubmit,
    isLoading,
    metadata,
    append,
    systemPrompt,
    setSystemPrompt,
  }: {
    messages: Message[];
    input: string;
    setInput:  React.Dispatch<React.SetStateAction<string>>;
    handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleSubmit: (
      e: React.FormEvent<HTMLFormElement>,
      chatRequestOptions?: ChatRequestOptions | undefined
    ) => void;
    isLoading: boolean;
    data: JSONValue[];
    metadata: Object | undefined;
    api: string;
    setApi: React.Dispatch<React.SetStateAction<string>>;
    append: (message: Message) => Promise<string | null | undefined>;
    setSystemPrompt: React.Dispatch<React.SetStateAction<string>>;
    systemPrompt: string;
  } = useContext(AppContext);
  const separateSongNames = (songNames: string) => {
    if(songNames.charAt(songNames.length - 1) === ",") {
        songNames = songNames.slice(0, -1);
    }
    return songNames.split(",").map((song) => song.trim());
  };

  const setArtistSongs = (value: string, artistIndex: number) => {
    const songs = separateSongNames(value);
    const newArtists = artists.map((artist, index) => {
      if (index === artistIndex) {
        return { ...artist, songs: songs };
      }
      return artist;
    });
    setArtists(newArtists);
  };

  const setArtistName = (e: React.ChangeEvent<HTMLInputElement>, artistIndex: number) => {
    const value = e.target.value;
    const newArtists = artists.map((artist, index) => {
      if (index === artistIndex) {
        return { ...artist, name: value };
      }
      return artist;
    });
    setArtists(newArtists);
  };
  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    // e.preventDefault();
    console.log("submitting", artists, dilemma, keepItClean)
    if (artists.length === 0 || dilemma === "") {
      return;
    }
    const validArtists = artists.filter((artist) => artist.name !== "");
    
    handleSubmit(e, {

      options: {
        body: {
          artists: validArtists,
          systemPrompt: dilemma,
          keepItClean: keepItClean,
        },
      },
    });
    // const lyrics = await fetch("/api/songwriter", {
    //   method: "POST",
    //   headers: {
    //     "Content-Type": "application/json",
    //   },
    //   body: JSON.stringify({
    //     messages: [],
    //     artists: artists,
    //     systemPrompt: dilemma,
    //   }),
    // });
    // const data = await lyrics.json();
  };
  useEffect(() => {
    if (artists.length > 0 && dilemma !== "") {
      setCanSubmit(true);
      setInput(dilemma);
    }
    console.log("artists", artists);
  }, [dilemma, artists]);
  useEffect(() => {
    setApi("api/songwriter");
  }, []);

  

  return (
    <div className="text-black dark:text-cyan-100 max-w-lg mx-auto">
      {messages.length == 0 && <form onSubmit={submit} className="flex flex-col gap-3">
        <h1>Name some influential music artists. Optionally, add 1 or more songs for each artist.</h1>
        {artists.map((artist, index) => (
          <Wrapper
          key={index}
            label={`Artist ${index + 1}`}
            children={
              <div className="w-full space-y-2 ">
                <Input 
                type="text" 
                value={artist.name} 
                onChange={(e) => setArtistName(e, index)} 
                placeholder="Name of Artist, Band, or Group"
                />
                {artists[index].name !== '' && <div className="flex items-center justify-center gap-4">
                  <Label>Songs</Label>
                  <Input
                    type="text"
                    placeholder="Song 1, Song 2, Song 3 (or leave blank for random)"
                    //value={artist.songs.join(", ")}
                    onChange={(e) => setArtistSongs(e.target.value, index)}
                  />
                </div>}
              </div>
            }
          />
        ))}
        <h1>What is the issue you want to write about?</h1>
        <Wrapper
          label="Dilemma"
          children={
            <Input
              placeholder={placeHolder}
              value={dilemma}
              onChange={(e) => setDilemma(e.target.value)}
            />
          }
        />

        <div className="p-4 flex items-center justify-center">
          <Label>Keep it clean</Label>
          <input
            className="h-6 w-6 mx-10"
            title="clean"
            type="checkbox"
            checked={keepItClean}
            onChange={(e) => setKeepItClean(!keepItClean)}
          />
        </div>

        <Button disabled={!canSubmit} type="submit">Submit</Button>
      </form>}

      <div className="flex flex-col gap-4">
        {messages.map((message, index) => (
            <div key={index}>
                <Wrapper label={message.role == 'user' ? 'Human' : 'Assistant'}
                textAlign={message.role == 'user' ? 'right' : 'left'}>
                
                    <p>{message.content}</p>
                </Wrapper>
            </div>
        ))}
      </div>
    </div>
  );
}

export default SongWriterPage;
