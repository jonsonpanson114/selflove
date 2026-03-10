import { GoogleGenerativeAI } from "@google/generative-ai";
import {
  parallelStorySystemPrompt,
  buildParallelStoryUserMessage,
} from "@/lib/parallelStoryPrompt";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  const { userEntry, storySummary } = await req.json();

  if (!userEntry || typeof userEntry !== "string") {
    return new Response("Missing userEntry", { status: 400 });
  }

  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    return new Response("API Key missing", { status: 500 });
  }

  const userMessage = buildParallelStoryUserMessage(
    userEntry,
    storySummary || ""
  );

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: "gemini-3-flash-preview",
    systemInstruction: parallelStorySystemPrompt,
  });

  try {
    const result = await model.generateContentStream(userMessage);

    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of result.stream) {
            const text = chunk.text();
            if (text) {
              controller.enqueue(new TextEncoder().encode(text));
            }
          }
        } catch (streamError) {
          console.error("Stream reading error in parallel-story:", streamError);
          controller.enqueue(new TextEncoder().encode("\n[物語の生成中にエラーが発生しました。]"));
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
  } catch (error: any) {
    console.error("Gemini API error in parallel-story:", error);
    return new Response(`Failed to generate story: ${error.message}`, { status: 500 });
  }
}
