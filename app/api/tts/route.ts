import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { text, voiceType } = await req.json();

    if (!text) {
      return NextResponse.json({ error: "Text is required" }, { status: 400 });
    }

    // 環境変数からAPIキーを取得
    const apiKey = process.env.GOOGLE_TTS_API_KEY || process.env.GOOGLE_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "API key is not configured" },
        { status: 500 }
      );
    }

    // 声の種類を決定する
    // voiceType: 'voice' (内なる自分), 'hina' (陽菜), 'ren' (レン)
    let voiceName = "ja-JP-Neural2-B"; // デフォルト（女性/陽菜ベース）
    let pitch = 0;
    let speakingRate = 1.0;

    switch (voiceType) {
      case "voice": // 内なる自分の声（落ち着いた女性）
        voiceName = "ja-JP-Neural2-A";
        pitch = -1.0;
        speakingRate = 0.95;
        break;
      case "hina": // 陽菜の物語（明るく感情豊かな若い女性）
        voiceName = "ja-JP-Neural2-F"; // Fは少し高めで可愛らしい元気な声
        pitch = 3.0; // ピッチを上げてより可愛らしく
        speakingRate = 1.05;
        break;
      case "ren": // レンの物語（落ち着いて安心感のある若い男性）
        voiceName = "ja-JP-Neural2-C"; // Cは男性
        pitch = -2.0;
        speakingRate = 0.95;
        break;
      default:
        break;
    }

    // Google Cloud Text-to-Speech API にリクエストを送信
    const url = `https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`;
    
    const requestBody = {
      input: {
        text: text,
      },
      voice: {
        languageCode: "ja-JP",
        name: voiceName,
      },
      audioConfig: {
        audioEncoding: "MP3",
        pitch: pitch,
        speakingRate: speakingRate,
      },
    };

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("[TTS API Error]", errorData);
      return NextResponse.json(
        { error: "Failed to synthesize speech", details: errorData },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    // data.audioContent に Base64 エンコードされた音声データが含まれる
    return NextResponse.json({ audioContent: data.audioContent });

  } catch (error: any) {
    console.error("[TTS Route Error]", error);
    return NextResponse.json(
      { error: "Internal Server Error", message: error.message },
      { status: 500 }
    );
  }
}
