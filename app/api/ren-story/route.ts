import { GoogleGenAI } from "@google/genai";
import {
    renStorySystemPrompt,
    buildRenStoryUserMessage,
} from "@/lib/renStoryPrompt";
import { NextRequest } from "next/server";

const client = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY });

export async function POST(req: NextRequest) {
    const { userEntry, storySummary } = await req.json();

    if (!userEntry || typeof userEntry !== "string") {
        return new Response("Missing userEntry", { status: 400 });
    }

    const userMessage = buildRenStoryUserMessage(
        userEntry,
        storySummary || ""
    );

    try {
        const result = await client.models.generateContentStream({
            model: "gemini-3-flash-preview",
            system_instruction: renStorySystemPrompt,
            contents: [{ role: "user", parts: [{ text: userMessage }] }],
            config: {
                safety_settings: [
                    {
                        category: "HARM_CATEGORY_HARASSMENT",
                        threshold: "BLOCK_NONE",
                    },
                    {
                        category: "HARM_CATEGORY_HATE_SPEECH",
                        threshold: "BLOCK_NONE",
                    },
                    {
                        category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
                        threshold: "BLOCK_NONE",
                    },
                    {
                        category: "HARM_CATEGORY_DANGEROUS_CONTENT",
                        threshold: "BLOCK_NONE",
                    },
                ],
            },
        });

        const readable = new ReadableStream({
            async start(controller) {
                try {
                    for await (const chunk of result.stream) {
                        try {
                            const text = chunk.text();
                            if (text) {
                                controller.enqueue(new TextEncoder().encode(text));
                            }
                        } catch (chunkError: any) {
                            console.error("Chunk error (safety?):", chunkError.message);
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
    } catch (error: any) {
        console.error("Gemini API error in ren-story:", error);
        return new Response(`Failed to generate ren story: ${error.message}`, { status: 500 });
    }
}
