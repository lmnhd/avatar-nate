import axios from "axios";

// Define a function called textToSpeech that takes in a string called inputText as its argument.
export const textToSpeech = async (inputText: string) => {
  // Set the API key for ElevenLabs API.
  // Do not use directly. Use environment variables.
  const API_KEY = process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY;
  // Set the ID of the voice to be used.
  const VOICE_ID = "pNInz6obpgDQGcFmaJgB";

  // Set options for the API request.

  // Send the API request using Axios and wait for the response.
  // const speechDetails = await axios({
  //   method: 'POST',
  //   url: `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`,
  //   headers: {
  //     accept: 'audio/mpeg', // Set the expected response type to audio/mpeg.
  //     'content-type': 'application/json', // Set the content type to application/json.
  //     'xi-api-key': `${API_KEY}`, // Set the API key in the headers.
  //   },
  //   data: {
  //     text: inputText, // Pass in the inputText as the text to be converted to speech.
  //   },
  //   responseType: 'arraybuffer',
  // });
  // console.log("API_KEY", API_KEY);
  const speechDetails = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`,
    {
      headers: {
        accept: "audio/mpeg",
        'xi-api-key': `${API_KEY}`,
        "content-type": "application/json", // Set the content type to application
      },
      method: "POST",
      body: JSON.stringify({
        text: inputText,
      }),
    }
  );

  // Return the binary audio data received from the API response.
  return await speechDetails.arrayBuffer();
};

// Export the textToSpeech function as the default export of this module.
export default textToSpeech;
