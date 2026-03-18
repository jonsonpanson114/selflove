import { GoogleGenerativeAI, HarmBlockThreshold, HarmCategory } from "@google/generative-ai";
import {
  parallelStorySystemPrompt,
  buildParallelStoryUserMessage,
} from "@/lib/parallelStoryPrompt";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { userEntry, storySummary } = await req.json();

    if (!userEntry || typeof userEntry !== "string") {
      return new Response("Missing userEntry", { status: 400 });
    }

    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      console.error("GOOGLE_API_KEY is not defined in environment variables");
      return new Response("API Key setup error", { status: 500 });
    }

    const userMessage = buildParallelStoryUserMessage(
      userEntry,
      storySummary || ""
    );

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel(
      {
        model: "gemini-3.1-flash",
        systemInstruction: parallelStorySystemPrompt,
        safetySettings: [
          { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
          { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
          { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
          { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
        ],
      },
      { apiVersion: "v1beta" }
    );

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
        } catch (streamError: any) {
          console.error("Stream reading error in parallel-story:", streamError);
          const msg = streamError.message?.includes("SAFETY") 
            ? "\n[安全フィルターにより内容が制限されました。]" 
            : "\n[物語の生成中にエラーが発生しました。]";
          controller.enqueue(new TextEncoder().encode(msg));
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
