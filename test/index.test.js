import { describe, expect, test, jest } from "@jest/globals";
import { handleImageResponse } from "../index";

import fs from "node:fs";

describe("handleImageResponse", () => {
  describe("handleImageResponse", () => {
    const phrase = "test phrase";
    test("should write image data to file and open it", () => {
      const data = "image data";
      const phrase = "test phrase";
      const fsWriteFileSyncMock = jest.spyOn(fs, "writeFileSync");

      handleImageResponse(data, phrase);

      expect(fsWriteFileSyncMock).toHaveBeenCalledWith(
        expect.stringContaining("image_"),
        Buffer.from(data, "base64")
      );
      expect(execMock).toHaveBeenCalledWith(expect.stringContaining("image_"));
      expect(startStream.stopStream).toHaveBeenCalled();
      expect(process.exit).toHaveBeenCalledWith(0);
    });

    test("should log a warning if image data is missing", () => {
      const phrase = "test phrase";
      console.warn = jest.fn();

      handleImageResponse(null, phrase);

      expect(console.warn).toHaveBeenCalledWith(
        `Failed to generate data from phrase ${phrase}`
      );
    });

    test("should log a warning if phrase is missing", () => {
      const data = "image data";
      console.warn = jest.fn();

      handleImageResponse(data, "");

      expect(console.warn).toHaveBeenCalledWith(
        `Failed to generate image from data ${data}`
      );
    });
  });
});

test("should log a warning if image data is missing", () => {
  const phrase = "test phrase";
  console.warn = jest.fn();

  handleImageResponse(null, phrase);

  expect(console.warn).toHaveBeenCalledWith(
    `Failed to generate data from phrase ${phrase}`
  );
});

test("should log a warning if phrase is missing", () => {
  const data = "image data";
  console.warn = jest.fn();

  handleImageResponse(data, "");

  expect(console.warn).toHaveBeenCalledWith(
    `Failed to generate image from data ${data}`
  );
});
