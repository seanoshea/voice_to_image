import generateContent from "./src/image_generator.mjs";
import startStream from "./src/voice_listener.mjs";
import fs from "node:fs";
import { exec } from "child_process";

// start listening for input first ...
startStream.startStream((phrase) => {
  // and then, once a phrase has been picked up by the mic ...
  generateContent.generateContent(phrase).then((data) => {
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
  });
});
