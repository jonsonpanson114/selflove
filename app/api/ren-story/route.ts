import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
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

    console.log("Ren Story Request - userEntry length:", userEntry.length, "storySummary length:", (storySummary || "").length);

    try {
        const model = genAI.getGenerativeModel({
            model: "gemini-2.0-flash",
            systemInstruction: renStorySystemPrompt,
            safetySettings: [
                {
                    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
                    threshold: HarmBlockThreshold.BLOCK_NONE,
                },
                {
                    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
                    threshold: HarmBlockThreshold.BLOCK_NONE,
                },
                {
                    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
                    threshold: HarmBlockThreshold.BLOCK_NONE,
                },
                {
                    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
                    threshold: HarmBlockThreshold.BLOCK_NONE,
                },
            ],
        });

        const result = await model.generateContentStream(userMessage);

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
                            // もし安全フィルターで止まった場合は、そこまでの内容で終わるかメッセージを出す
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
        console.error("Error Details:", error.message, error.stack);
        return new Response(`Failed to generate ren story: ${error.message}`, { status: 500 });
    }
}
