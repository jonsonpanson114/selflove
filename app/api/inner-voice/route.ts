import { GoogleGenerativeAI } from "@google/generative-ai";
import { innerVoiceSystemPrompt } from "@/lib/innerVoicePrompt";
import { NextRequest } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);

export async function POST(req: NextRequest) {
  const { userEntry } = await req.json();

  if (!userEntry || typeof userEntry !== "string") {
    return new Response("Missing userEntry", { status: 400 });
  }

  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    systemInstruction: innerVoiceSystemPrompt,
  });

  try {
    const result = await model.generateContentStream(userEntry);

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
  } catch (error) {
    console.error("Gemini API error in inner-voice:", error);
    return new Response("Failed to generate inner voice", { status: 500 });
  }
}
