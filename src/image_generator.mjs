import {
  FunctionDeclarationSchemaType,
  HarmBlockThreshold,
  HarmCategory,
  VertexAI,
} from "@google-cloud/vertexai";

const project = "voice-to-image-422913";
// const project = '106466503185';
const location = "us-central1";
// const textModel = "gemini-1.0-pro";
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
  const request = {
    contents: [
      {
        role: "user",
        parts: [{ instances: { prompt: text } }],
        // prompt: text
      },
    ],
  };
  return await generativeModel.generateContent(request);
};

const textToImage = async (text) => {
  // axios({
  //   method: 'post',
  //   headers: {
  //     Authorization: 'Bearer ' + await auth.getAccessToken(),
  //     'Content-Type': 'application/json'
  //   },
  //   url: `https://us-central1-aiplatform.googleapis.com/v1/projects/${pid}/locations/us-central1/publishers/google/models/imagegeneration@006:predict`,
  //   data: {
  //     "instances": [
  //       {
  //         "prompt": text
  //       }
  //     ],
  //     "parameters": {
  //       "sampleCount": 1
  //     }
  //   }
  // }).then(function (response) {
  //   console.warn('derp');
  //   // response.data.pipe(fs.createWriteStream('ada_lovelace.jpg'))
  // }).catch((err) => {
  //   console.error(err);
  // });
};

export default { generateContent };
