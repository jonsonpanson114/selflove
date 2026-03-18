import { GoogleGenerativeAI, HarmBlockThreshold, HarmCategory } from "@google/generative-ai";
import {
    renStorySystemPrompt,
    buildRenStoryUserMessage,
} from "@/lib/renStoryPrompt";
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

        const userMessage = buildRenStoryUserMessage(
            userEntry,
            storySummary || ""
        );

        console.log(`[API ren-story] Starting generation with model gemini-3-flash-preview. API Key: ${apiKey.slice(0, 4)}...`);

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel(
            {
                model: "gemini-3.1-flash",
                systemInstruction: renStorySystemPrompt,
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
                let chunkCount = 0;
                let totalTextLength = 0;
                try {
                    for await (const chunk of result.stream) {
                        try {
                            const text = chunk.text();
                            if (text) {
                                chunkCount++;
                                totalTextLength += text.length;
                                controller.enqueue(new TextEncoder().encode(text));
                            }
                        } catch (chunkError: any) {
                            console.error(`[API ren-story] Chunk error (safety?): ${chunkError.message}`);
                        }
                    }
                    console.log(`[API ren-story] Completed. Chunks: ${chunkCount}, Total Length: ${totalTextLength}`);
                } catch (streamError: any) {
                    console.error(`[API ren-story] Stream reading error: ${streamError.message}`);
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
        console.error(`[API ren-story] Top-level error: ${error.message}`);
        return new Response(`Failed to generate ren story: ${error.message}`, { status: 500 });
    }
}
