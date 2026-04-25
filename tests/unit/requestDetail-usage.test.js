import { describe, expect, it } from "vitest";
import { extractUsageFromResponse } from "../../open-sse/handlers/chatCore/requestDetail.js";

describe("extractUsageFromResponse", () => {
  it("extracts cached tokens from OpenAI Responses usage", () => {
    const usage = extractUsageFromResponse({
      usage: {
        input_tokens: 1000,
        output_tokens: 50,
        input_tokens_details: { cached_tokens: 250 },
      },
    });

    expect(usage).toEqual({
      prompt_tokens: 1000,
      completion_tokens: 50,
      cache_read_input_tokens: 250,
      cache_creation_input_tokens: undefined,
    });
  });

  it("extracts cached tokens from Gemini usage metadata", () => {
    const usage = extractUsageFromResponse({
      usageMetadata: {
        promptTokenCount: 2000,
        candidatesTokenCount: 100,
        cachedContentTokenCount: 800,
        thoughtsTokenCount: 25,
      },
    });

    expect(usage).toEqual({
      prompt_tokens: 2000,
      completion_tokens: 100,
      cached_tokens: 800,
      reasoning_tokens: 25,
    });
  });
});
