// import { OpenAI } from "openai";
// import { createAI, getMutableAIState, render } from "ai/rsc";
// import { ZodObject, z } from "zod";

// const flightInfoFunction = () => {
//     async function*({ flightNumber }) {
//         // An example of a function that fetches flight information from an external API.
//         async function getFlightInfo(flightNumber: string) {
//           return {
//             flightNumber,
//             departure: "New York",
//             arrival: "San Francisco",
//           };
//         }
//         // Show a spinner on the client while we wait for the response.
//         yield (<Spinner />);

//         // Fetch the flight information from an external API.
//         const flightInfo = await getFlightInfo(flightNumber);

//         // Update the final AI state.
//         aiState.done([
//           ...aiState.get(),
//           {
//             role: "function",
//             name: "get_flight_info",
//             // Content can be any string to provide context to the LLM in the rest of the conversation.
//             content: JSON.stringify(flightInfo),
//           },
//         ]);

//         // Return the flight card to the client.
//         return <FlightCard flightInfo={flightInfo} />;
// }
// function UITool(name:string, description:string, parameters: ZodObject<any>, render: any) {
//   return {
//     name: {
//       description:description,
//       parameters: parameters,
//       render: render,
//       },
//     }
   
//   };
// }

// function UITools() {
//   return <div>UITools</div>;
// }

// export default UITools;
