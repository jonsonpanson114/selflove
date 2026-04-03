import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

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
      { model: "gemini-3.1-flash-lite-preview" },
      { apiVersion: "v1beta" }
    );

    const prompt = `あなたは「レン」という名のキャラクターです。
ユーザーが書いた日記に対して、優しく、思慮深く、そして「自分を大切に」と諭すような物語を紡いでください。

## ユーザーの日記
${userEntry}

## これまでの物語のあらすじ
${storySummary || "物語の始まり"}

## 制約事項
- 日本語で記述すること。
- 改行を適切に入れ、読みやすくすること。
- 100文字〜200文字程度の短い一節にすること。
- 一人称は「私」または「僕」とし、落ち着いたトーンで話すこと。
- ユーザーに対して共感しつつ、少しの勇気を与えるような結びにする。`;

    const result = await model.generateContentStream(prompt);
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
