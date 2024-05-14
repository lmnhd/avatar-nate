import React, { useContext } from 'react'
import VoiceSynthesizer from './speech/voicesynthesizer';
import { AppContext } from '@/app/providers/context';
import { Message } from 'ai';

interface Props {
    handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
    input: string;
}
function ChatTypeInput({handleInputChange, handleSubmit, input}: Props) {
  const {
    displaySettings,
    messages
   
  }: {
    displaySettings: boolean;
    messages: Message[]
    
  } = useContext(AppContext);

  return (
    <div>
      <div className="fixed bottom-0 left-0 w-full p-10 bg-gradient-to-t from-white via-white-/90 to-white/0 backdrop-blur-sm dark:bg-gradient-to-t dark:from-black dark:via-white-/90 dark:to-white/0">
            <form
              className="max-w-md mx-auto mb-8 border border-gray-300 rounded shadow-xl "
              onSubmit={handleSubmit}
            >
              <input
                className="w-full h-full p-2 "
                value={input}
                placeholder="Ask anything..."
                onChange={handleInputChange}
              />
            </form>
      
          </div>
          {/* <div className=' w-full overflow-hidden bg-black rounded-t-3xl'>
            <VoiceSynthesizer displaySettings={displaySettings} messages={messages} />
          </div> */}
    </div>
        
  )
}

export default ChatTypeInput