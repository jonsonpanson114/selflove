import { GoogleGenerativeAI } from "@google/generative-ai";
import {
    renStorySystemPrompt,
    buildRenStoryUserMessage,
} from "@/lib/renStoryPrompt";
import { NextRequest } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);

export async function POST(req: NextRequest) {
    const { userEntry, storySummary } = await req.json();

    if (!userEntry || typeof userEntry !== "string") {
        return new Response("Missing userEntry", { status: 400 });
    }

    const userMessage = buildRenStoryUserMessage(
        userEntry,
        storySummary || ""
    );

    const model = genAI.getGenerativeModel({
        model: "gemini-1.5-flash",
        systemInstruction: renStorySystemPrompt,
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
                    console.error("Stream reading error in ren-story:", streamError);
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
    } catch (error) {
        console.error("Gemini API error in ren-story:", error);
        return new Response("Failed to generate ren story", { status: 500 });
    }
}
