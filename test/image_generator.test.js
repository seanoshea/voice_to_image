import { describe, expect, jest } from "@jest/globals";

import * as imageGenerator from "../src/image_generator.mjs";

describe("textToImage", () => {
  const textToImage = imageGenerator.default.textToImage;
  const mockedSuccessfulResponse = {
    predictions: [
      {
        bytesBase64Encoded: "base64-encoded-bytes",
      },
    ],
  };
  beforeEach(() => {
    jest.spyOn(global, "fetch").mockResolvedValue({
      json: jest.fn().mockResolvedValue(mockedSuccessfulResponse),
    });
  });
  afterEach(() => {
    global.fetch.mockRestore();
  });

  it("should return base64 encoded bytes when given a non-empty text", async () => {
    const text = "Hello, world!";
    const result = await textToImage(text);
    expect(result).toBeDefined();
    expect(typeof result).toBe("string");
    expect(result.length).toBeGreaterThan(0);
  });

  it("should return undefined when given an empty text", async () => {
    const text = "";
    const result = await textToImage(text);
    expect(result).toBeUndefined();
  });

  it("should handle API response with predictions", async () => {
    const text = "Hello, world!";

    const result = await textToImage(text);

    expect(result).toBe(
      mockedSuccessfulResponse.predictions[0].bytesBase64Encoded
    );
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining(
        "/publishers/google/models/imagegeneration@006:predict"
      ),
      expect.objectContaining({
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
        headers: expect.objectContaining({
          Authorization: expect.stringContaining("Bearer"),
          "Content-Type": "application/json",
        }),
      })
    );
  });
  describe("textToImage and empty sets in the response", () => {
    const mockResponse = {
      predictions: [],
    };
    beforeEach(() => {
      jest.spyOn(console, "error").mockImplementation();
    });

    it("should handle API response without predictions", async () => {
      const text = "Hello, world!";

      jest.spyOn(global, "fetch").mockResolvedValue({
        json: jest.fn().mockResolvedValue(mockResponse),
      });

      const result = await textToImage(text);

      expect(result).toBeUndefined();
      expect(console.error).toHaveBeenCalledWith(
        "Failed to generate a viable response",
        mockResponse
      );
    });
  });
});
