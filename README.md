# Voice to Image

A proof of concept node application which utilizes Vertex AI services to convert voice to images.

# Attribution

The overwhelming majority of the voice to text code (see `src/voice_listener.mjs`) was taken from https://cloud.google.com/speech-to-text/docs/transcribe-streaming-audio.

# Prerequistes

`npm run start` to get things going.

# key.json

You'll need to generate a `key.json` file to authenticate with VertexAI APIs. https://cloud.google.com/iam/docs/create-short-lived-credentials-direct for details. For reference, a `key.json` file should look a little like:

```
{
  "account": "",
  "client_id": "UUIDhur.apps.googleusercontent.com",
  "client_secret": "UUID",
  "quota_project_id": "voice-to-image-422913", // you will need to create a new project in the console and associate a billing account with it
  "refresh_token": "UUID",
  "type": "authorized_user",
  "universe_domain": "googleapis.com"
}
```

See https://stackoverflow.com/questions/70119129/refresh-token-gcp for some more details as well.

# Contributing

Suggestions and bug reports for the application are always welcome. Open an issue on github if you'd like to see an addition to the application or if you spot a bug.
