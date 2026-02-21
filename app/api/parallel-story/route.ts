import Anthropic from "@anthropic-ai/sdk";
import {
  parallelStorySystemPrompt,
  buildParallelStoryUserMessage,
} from "@/lib/parallelStoryPrompt";
import { NextRequest } from "next/server";

const anthropic = new Anthropic();

export async function POST(req: NextRequest) {
  const { userEntry, storySummary } = await req.json();

  if (!userEntry || typeof userEntry !== "string") {
    return new Response("Missing userEntry", { status: 400 });
  }

  const userMessage = buildParallelStoryUserMessage(
    userEntry,
    storySummary || ""
  );

  const stream = anthropic.messages.stream({
    model: "claude-sonnet-4-6",
    max_tokens: 1200,
    system: parallelStorySystemPrompt,
    messages: [
      {
        role: "user",
        content: userMessage,
      },
    ],
  });

  const readable = new ReadableStream({
    async start(controller) {
      try {
        for await (const event of stream) {
          if (
            event.type === "content_block_delta" &&
            event.delta.type === "text_delta"
          ) {
            controller.enqueue(new TextEncoder().encode(event.delta.text));
          }
        }
      } finally {
        controller.close();
      }
    },
  });

  return new Response(readable, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache",
    },
  });
}
