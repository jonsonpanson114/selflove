"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useRef, useEffect } from "react";

interface InnerVoiceResponseProps {
  text: string;
  isLoading: boolean;
  label?: string;
  isStory?: boolean;
}

export default function InnerVoiceResponse({
  text,
  isLoading,
  label,
  isStory = false,
}: InnerVoiceResponseProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isTtsLoading, setIsTtsLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // コンポーネントのアンマウント時やテキスト変更時に音声を停止・クリア
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
      }
    };
  }, [text]);

  const getVoiceType = () => {
    if (label?.includes("陽菜")) return "hina";
    if (label?.includes("レン")) return "ren";
    return "voice";
  };

  const handleTogglePlay = async () => {
    if (isPlaying && audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
      return;
    }

    if (!text) return;

    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.onended = () => setIsPlaying(false);
    }

    // すでに音声がロードされている場合はそれを再生
    if (audioRef.current.src && audioRef.current.src !== window.location.href) {
      audioRef.current.play();
      setIsPlaying(true);
      return;
    }

    // 音声がまだない場合はAPIから取得
    setIsTtsLoading(true);
    try {
      const response = await fetch("/api/tts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: text,
          voiceType: getVoiceType(),
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        console.error("TTS API Error:", err);
        alert("音声の生成に失敗しました。APIキー等の設定を確認してください。");
        return;
      }

      const data = await response.json();
      if (data.audioContent) {
        const audioSrc = `data:audio/mp3;base64,${data.audioContent}`;
        audioRef.current.src = audioSrc;
        audioRef.current.play();
        setIsPlaying(true);
      }
    } catch (error) {
      console.error("TTS Fetch Error:", error);
      alert("通信エラーが発生しました。");
    } finally {
      setIsTtsLoading(false);
    }
  };
  return (
    <div style={{ position: "relative" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.875rem" }}>
        {label && (
          <p
            style={{
              fontSize: "0.7rem",
              textTransform: "uppercase",
              letterSpacing: "0.12em",
              color: "var(--gold)",
              margin: 0,
              fontFamily: "inherit",
              opacity: 0.85,
            }}
          >
            {label}
          </p>
        )}
        
        {/* 音声読み上げボタン */}
        {text && !isLoading && (
          <button
            onClick={handleTogglePlay}
            disabled={isTtsLoading}
            style={{
              background: "none",
              border: "1px solid var(--border)",
              borderRadius: "16px",
              padding: "0.3rem 0.8rem",
              fontSize: "0.7rem",
              color: isPlaying ? "var(--sage)" : "var(--ink)",
              opacity: isTtsLoading ? 0.5 : 0.8,
              cursor: isTtsLoading ? "default" : "pointer",
              display: "flex",
              alignItems: "center",
              gap: "0.4rem",
              transition: "all 0.2s",
              backgroundColor: isPlaying ? "var(--sage-light)" : "transparent",
            }}
          >
            {isTtsLoading ? (
              <>⏳ 準備中...</>
            ) : isPlaying ? (
              <>⏸ 停止</>
            ) : (
              <>▶ 再生</>
            )}
          </button>
        )}
      </div>

      {isLoading && !text && (
        <p
          style={{
            fontSize: "0.85rem",
            color: "var(--ink)",
            opacity: 0.35,
            fontStyle: "italic",
            fontFamily: "Noto Serif JP, Georgia, serif",
          }}
        >
          …
        </p>
      )}

      <AnimatePresence>
        {text && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            {isStory ? (
              <div
                style={{
                  fontFamily: "Noto Serif JP, Georgia, serif",
                  fontSize: "0.95rem",
                  lineHeight: "2.1",
                  color: "var(--ink)",
                  whiteSpace: "pre-wrap",
                  letterSpacing: "0.03em",
                  maxHeight: "65vh",
                  overflowY: "auto",
                  paddingRight: "0.5rem",
                }}
              >
                {text}
              </div>
            ) : (
              <p
                style={{
                  fontFamily: "Noto Serif JP, Georgia, serif",
                  fontSize: "0.9rem",
                  lineHeight: "2.0",
                  color: "var(--sage)",
                  whiteSpace: "pre-wrap",
                  letterSpacing: "0.03em",
                }}
              >
                {text}
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
