import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";
import { renStorySystemPrompt, buildRenStoryUserMessage } from "@/lib/renStoryPrompt";

export async function POST(req: NextRequest) {
  try {
    const { userEntry, storySummary } = await req.json();

    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      console.error("GOOGLE_API_KEY is not defined");
      return NextResponse.json({ error: "API Key setup error" }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    // 最新最強の Gemini 3.1 Flash Lite Preview を使用
    const model = genAI.getGenerativeModel(
      { 
        model: "gemini-3.1-flash-lite-preview", 
        systemInstruction: renStorySystemPrompt 
      },
      { apiVersion: "v1beta" }
    );

    const baseUserMessage = buildRenStoryUserMessage(userEntry || "", storySummary || "");
    // プロンプトの最後に強力な指示を追加
    const userMessage = `${baseUserMessage}\n\n【最重要指示】村上春樹独特の「僕」の文体を120%意識してください。簡潔な一文、都会的な孤独、具体的な細部、そして日常の中の奇妙な比喩を駆使してください。`;

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
          console.error("Stream reading error in ren-story:", err);
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
    console.error("Ren Story Error:", error);
    return NextResponse.json({ error: "Story generation failed" }, { status: 500 });
  }
}
