import React, { useContext, useRef } from "react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Button } from "./ui/button";
import { AppContext } from "@/app/providers/context";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { Message } from "ai";
import { getFetchUrl } from "../lib/getFetchUrl";
import { set } from "zod";

function SystemPrompt({
  isLoading,
  setIsLoading,
}: {
  isLoading: boolean;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
}) {
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
  //const { toast } = useToast();

  const fileInput = useRef<HTMLInputElement>(null);
  const [pdf, setPdf] = React.useState<File | null>(null);
  return (
    <Collapsible
      className="fixed flex flex-col items-center justify-center w-screen border border-t-0 left-0 top-16"
      open={showPrompt && !displaySettings}
      //open={true}
      onOpenChange={(open) => setShowPrompt(open)}
    >
      <CollapsibleTrigger className="w-full">
        <div className="h-6 dark:text-white mx-auto  ">...</div>
      </CollapsibleTrigger>
      <CollapsibleContent className="flex flex-col items-center justify-center w-screen lg:w-2/3? mx-auto">
        <Tabs defaultValue="system" className="w-full">
          <TabsList>
            <TabsTrigger value="system">Sytem</TabsTrigger>
            <TabsTrigger value="data">Data</TabsTrigger>
          </TabsList>
          <TabsContent value="system">
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
          </TabsContent>
          <TabsContent value="data">
            <div>
              <form
                className={`flex items-center justify-between w-full h-96 bg-gradient-to-b from-white via-white/20 to-white/0 backdrop-blur-sm dark:bg-black? px-6`}
                action={async (fd) => {
                  console.log("Data clicked: ", fd);
                  // fd.append("files", fileInput.current!.files[0]);

                  // var requestOptions = {method: 'POST', body: fd };

                  // const response = await fetch("/api/uploadavatar", requestOptions);
                  // const result = await response.text();
                  // console.log(result);
                }}
              >
                <input
                  ref={fileInput}
                  title="newFile"
                  name="newFile"
                  type="file"
                  className="w-3/4"
                  onChange={(e) => {
                    if (e.target.files) {
                      console.log(e.target.files[0]);
                      setPdf(e.target.files[0]);
                    }
                  }}
                />
                {pdf !== null && (
                  <Button
                    type={"submit"}
                    variant={"secondary"}
                    className="w-1/4"
                    onClick={async () => {
                      console.log("PDF: ", pdf);
                      if (!pdf || pdf.type !== "application/pdf") {
                        window.alert("Please select a PDF file to upload");
                        return;
                      }
                      setIsLoading(true);

                      //return;
                      let result: any = {}
                      var fd = new FormData();
                      fd.append("files", pdf!);
                      console.log("Files: ", fd);

                      var requestOptions = { method: "POST", body: fd };
                      const url = getFetchUrl("/api/uploadavatar");

                      console.log("Fetching URL: ", url);

                      try {
                        const response = await fetch(url, {
                          method: "POST",
                          headers: {
                            contentType: "multipart/form-data",
                          },
                          body: fd,
                        });
                        result = await response.json();
                        console.log("Result: ", result);
                       
                      } catch (error) {
                        console.error("Error: ", error);
                      }

                      setShowPrompt(false);
                      setIsLoading(false);
                      setPdf(null);

                      console.log("PDF UPLOAD COMPLETE")
                      window.alert("PDF UPLOAD COMPLETE");
                    }}
                  >
                    Upload
                  </Button>
                )}
              </form>
            </div>
          </TabsContent>
        </Tabs>
      </CollapsibleContent>
    </Collapsible>
  );
}

export default SystemPrompt;
