import {
  FunctionDeclarationSchemaType,
  HarmBlockThreshold,
  HarmCategory,
  VertexAI,
} from "@google-cloud/vertexai";

import { GoogleAuth } from "google-auth-library";
import fs from "node:fs";

var obj = JSON.parse(fs.readFileSync("key.json", "utf8"));

const auth = new GoogleAuth();
// TODO: Allow this to be passed in
const pid = "voice-to-image-422913";

const project = obj.quota_project_id;
const location = "us-central1";
// const textModel = 'gemini-1.0-pro';
// const visionModel = 'imagegeneration@006';
const visionModel = "gemini-1.0-pro-vision";
const vertexAI = new VertexAI({ project: project, location: location });

// Instantiate Gemini models
const generativeModel = vertexAI.getGenerativeModel({
  model: visionModel,
  // The following parameters are optional
  // They can also be passed to individual content generation requests
  // safetySettings: [{category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE}],
  // generationConfig: {maxOutputTokens: 256},
});

const generateContent = async (text) => {
  return await textToImage(text);
};

const textToImage = async (text) => {
  console.warn("making the API call for ", text);
  return fetch(
    `https://us-central1-aiplatform.googleapis.com/v1/projects/${pid}/locations/us-central1/publishers/google/models/imagegeneration@006:predict`,
    {
      method: "POST",
      body: JSON.stringify({
        instances: [
          {
            prompt: text,
          },
        ],
        parameters: {
          sampleCount: 1,
        },
      }),
      headers: {
        Authorization: "Bearer " + (await auth.getAccessToken()),
        "Content-Type": "application/json",
      },
    }
  )
    .then((response) => response.json())
    .then((responseJson) => {
      if (responseJson.predictions && responseJson.predictions.length) {
        const prediction = responseJson.predictions[0];
        const data = prediction.bytesBase64Encoded;
        var buf = Buffer.from(data, "base64");
        fs.writeFileSync("image.png", buf);
      } else {
        console.error("Failed to generate a viable response", responseJson);
      }
    })
    .catch((error) => {
      console.log("caught ", error);
    });
};

export default { generateContent };
