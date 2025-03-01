const encoding = "LINEAR16";
const sampleRateHertz = 16000;
const languageCode = "en-US";
const streamingLimit = 10000; // ms - set to low number for demo purposes

import chalk from "chalk";
import { Writable } from "stream";
import recorder from "node-record-lpcm16";

// Imports the Google Cloud client library
// Currently, only v1p1beta1 contains result-end-time
import { v1p1beta1 as speech } from "@google-cloud/speech";

const client = new speech.SpeechClient();

const config = {
  encoding,
  sampleRateHertz,
  languageCode,
};

const request = {
  config,
  interimResults: true,
};

let recognizeStream = null;
let restartCounter = 0;
let audioInput = [];
let lastAudioInput = [];
let resultEndTime = 0;
let isFinalEndTime = 0;
let finalRequestEndTime = 0;
let newStream = true;
let bridgingOffset = 0;
let lastTranscriptWasFinal = false;
let cb;

const startStream = (callback) => {
  cb = callback;
  // Clear current audioInput
  audioInput = [];
  // Initiate (Reinitiate) a recognize stream
  recognizeStream = client
    .streamingRecognize(request)
    .on("error", (err) => {
      if (err.code === 11) {
        // restartStream();
      } else {
        console.error("API request error " + err);
      }
    })
    .on("data", speechCallback);

  // Restart stream when streamingLimit expires
  setTimeout(restartStream, streamingLimit);
};

const speechCallback = (stream) => {
  // Convert API result end time from seconds + nanoseconds to milliseconds
  resultEndTime =
    stream.results[0].resultEndTime.seconds * 1000 +
    Math.round(stream.results[0].resultEndTime.nanos / 1000000);

  // Calculate correct time based on offset from audio sent twice
  const correctedTime =
    resultEndTime - bridgingOffset + streamingLimit * restartCounter;

  process.stdout.clearLine();
  process.stdout.cursorTo(0);
  let stdoutText = "";
  if (stream.results[0] && stream.results[0].alternatives[0]) {
    stdoutText =
      correctedTime + ": " + stream.results[0].alternatives[0].transcript;
  }

  if (stream.results[0].isFinal) {
    if (
      stream.results[0] &&
      stream.results[0].alternatives[0].transcript &&
      stream.results[0].alternatives[0].transcript.length
    ) {
      process.stdout.write(chalk.green(`${stdoutText}\n`));
      cb(stream.results[0].alternatives[0].transcript);
    }
    isFinalEndTime = resultEndTime;
    lastTranscriptWasFinal = true;
  } else {
    // Make sure transcript does not exceed console character length
    if (stdoutText.length > process.stdout.columns) {
      stdoutText = stdoutText.substring(0, process.stdout.columns - 4) + "...";
    }
    process.stdout.write(chalk.red(`${stdoutText}`));

    lastTranscriptWasFinal = false;
  }
};

const audioInputStreamTransform = new Writable({
  write(chunk, encoding, next) {
    if (newStream && lastAudioInput.length !== 0) {
      // Approximate math to calculate time of chunks
      const chunkTime = streamingLimit / lastAudioInput.length;
      if (chunkTime !== 0) {
        if (bridgingOffset < 0) {
          bridgingOffset = 0;
        }
        if (bridgingOffset > finalRequestEndTime) {
          bridgingOffset = finalRequestEndTime;
        }
        const chunksFromMS = Math.floor(
          (finalRequestEndTime - bridgingOffset) / chunkTime
        );
        bridgingOffset = Math.floor(
          (lastAudioInput.length - chunksFromMS) * chunkTime
        );

        for (let i = chunksFromMS; i < lastAudioInput.length; i++) {
          recognizeStream.write(lastAudioInput[i]);
        }
      }
      newStream = false;
    }

    audioInput.push(chunk);

    if (recognizeStream) {
      recognizeStream.write(chunk);
    }

    next();
  },

  final() {
    if (recognizeStream) {
      recognizeStream.end();
    }
  },
});

const restartStream = () => {
  if (recognizeStream) {
    recognizeStream.end();
    recognizeStream.removeListener("data", speechCallback);
    recognizeStream = null;
  }
  if (resultEndTime > 0) {
    finalRequestEndTime = isFinalEndTime;
  }
  resultEndTime = 0;

  lastAudioInput = [];
  lastAudioInput = audioInput;

  restartCounter++;

  if (!lastTranscriptWasFinal) {
    process.stdout.write("\n");
  }

  newStream = true;

  startStream(cb);
};

const stopStream = () => {
  if (recognizeStream) {
    recognizeStream.end();
    recognizeStream.removeListener("data", speechCallback);
    recognizeStream = null;
  }
  if (recording) {
    recording.stop();
  }
};

// Start recording and send the microphone input to the Speech API
const recording = recorder.record({
  sampleRateHertz: sampleRateHertz,
  threshold: 0, // Silence threshold
  silence: 1000,
  keepSilence: true,
  recordProgram: "rec", // Try also 'arecord' or 'sox'
});

recording
  .stream()
  .pipe(audioInputStreamTransform)
  .on("error", (err) => {
    console.error("Audio recording error " + err);
  });

console.log("");
console.log("Listening, press Ctrl+C to stop.");
console.log("");

export default { startStream, stopStream };
