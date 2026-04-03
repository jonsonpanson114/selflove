import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";
import { parallelStorySystemPrompt, buildParallelStoryUserMessage } from "@/lib/parallelStoryPrompt";

export async function POST(req: NextRequest) {
  try {
    const { userEntry, storySummary } = await req.json();

    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      console.error("GOOGLE_API_KEY is not defined");
      return NextResponse.json({ error: "API Key setup error" }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel(
      { 
        model: "gemini-3.1-flash-lite-preview",
        systemInstruction: parallelStorySystemPrompt
      },
      { apiVersion: "v1beta" }
    );

    const userMessage = buildParallelStoryUserMessage(userEntry || "", storySummary || "");
    const result = await model.generateContentStream(userMessage);

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of result.stream) {
            const text = chunk.text();
            if (text) {
              controller.enqueue(encoder.encode(text));
            }
          }
        } catch (err) {
          console.error("Stream reading error in hina-story:", err);
        } finally {
          controller.close();
        }
      },
    });

    return new NextResponse(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
      },
    });
  } catch (error) {
    console.error("Hina Story Error:", error);
    return NextResponse.json({ error: "Story generation failed" }, { status: 500 });
  }
}
