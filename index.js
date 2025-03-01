import textToImage from "./src/image_generator.mjs";
import startStream from "./src/voice_listener.mjs";
import fs from "node:fs";
import { exec } from "child_process";

/**
 * Handles the image response.
 *
 * @param {string} data - The image data in base64 format.
 * @param {string} phrase - The phrase used to generate the image data.
 * @returns {void}
 */
const handleImageResponse = (data, phrase) => {
  if (data) {
    // generate a new unique file name based on the date stamp
    var fileName = `image_${Date.now()}.png`;
    var buf = Buffer.from(data, "base64");
    if (buf && buf.length) {
      // ok - lets write to file and see if we can open the file
      fs.writeFileSync(fileName, buf);
      exec(`open ${fileName}`);
      // stop the stream
      startStream.stopStream();
      // quit the app
      process.exit(0);
    } else {
      console.warn(`Failed to generate image from data ${data}`);
    }
  } else if (phrase && phrase.length) {
    console.warn(`Failed to generate data from phrase ${phrase}`);
  }
};

// start listening for input first ...
startStream.startStream((phrase) => {
  // and then, once a phrase has been picked up by the mic ...
  textToImage.textToImage(phrase).then((data) => {
    // figure out how to interpret the results from VertexAI
    handleImageResponse(data, phrase);
  });
});

export { handleImageResponse };
