import generateContent from "./src/image_generator.mjs";
import startStream from "./src/voice_listener.mjs";

// start listening for input first ...
startStream.startStream((phrase) => {
  // and then, once a phrase has been picked up by the mic ...
  generateContent.generateContent(phrase).then((gemini) => {
    // see what Gemini has to say about it ...
    console.log('response', gemini.response.candidates[0].content);
  });
});
