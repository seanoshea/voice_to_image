import { GoogleAuth } from "google-auth-library";
import fs from "node:fs";

const obj = JSON.parse(fs.readFileSync("key.json", "utf8"));
const auth = new GoogleAuth();
const pid = obj.quota_project_id;
const location = "us-central1";
const visionModel = "imagegeneration@006";

const textToImage = async (text) => {
  if (!text || text.length === 0) {
    return;
  }
  return fetch(
    `https://us-central1-aiplatform.googleapis.com/v1/projects/${pid}/locations/${location}/publishers/google/models/${visionModel}:predict`,
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
        return prediction.bytesBase64Encoded;
      } else {
        console.error("Failed to generate a viable response", responseJson);
      }
    });
};

export default { textToImage };
