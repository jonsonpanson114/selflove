import { GoogleGenAI } from "@google/genai";
import { innerVoiceSystemPrompt } from "@/lib/innerVoicePrompt";
import { NextRequest } from "next/server";

const client = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY });

export async function POST(req: NextRequest) {
  const { userEntry } = await req.json();

  if (!userEntry || typeof userEntry !== "string") {
    return new Response("Missing userEntry", { status: 400 });
  }

  try {
    const result = await client.models.generateContentStream({
      model: "gemini-3-flash-preview",
      contents: [{ role: "user", parts: [{ text: userEntry }] }],
      config: {
        systemInstruction: innerVoiceSystemPrompt,
      },
    });

    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of result) {
            const text = chunk.text;
            if (text) {
              controller.enqueue(new TextEncoder().encode(text));
            }
          }
        } catch (streamError) {
          console.error("Stream reading error in inner-voice:", streamError);
          controller.enqueue(new TextEncoder().encode("\n[応答の生成中にエラーが発生しました。]"));
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
    console.error("Gemini API error in inner-voice:", error);
    return new Response(`Failed to generate inner voice: ${error.message}`, { status: 500 });
  }
}
