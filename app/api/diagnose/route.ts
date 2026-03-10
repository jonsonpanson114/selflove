import { GoogleGenAI } from "@google/genai";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    return new Response("GOOGLE_API_KEY is missing in process.env", { status: 500 });
  }

  const client = new GoogleGenAI({ apiKey });

  try {
    const models = await client.models.list();
    const modelNames = models.map((m: any) => m.name);
    return new Response(JSON.stringify({ 
      status: "success", 
      modelNames,
      envKeyPresent: !!apiKey 
    }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ 
      status: "error", 
      message: error.message,
      stack: error.stack,
      envKeyPresent: !!apiKey 
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
