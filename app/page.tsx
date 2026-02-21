"use client";

import { useState } from "react";
import Link from "next/link";
import BookPage from "@/components/BookPage";
import StoryTabs from "@/components/StoryTabs";
import InnerVoiceResponse from "@/components/InnerVoiceResponse";
import { useChapters } from "@/hooks/useChapters";
import { getTodayAffirmation, getGreeting } from "@/lib/affirmations";

async function streamResponse(
  url: string,
  body: object,
  onChunk: (chunk: string) => void
): Promise<string> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok || !res.body) throw new Error("Stream failed");

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let full = "";

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    const chunk = decoder.decode(value, { stream: true });
    full += chunk;
    onChunk(chunk);
  }

  return full;
}

export default function Home() {
  const [entry, setEntry] = useState("");
  const [innerVoice, setInnerVoice] = useState("");
  const [story, setStory] = useState("");
  const [isLoadingVoice, setIsLoadingVoice] = useState(false);
  const [isLoadingStory, setIsLoadingStory] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedEntry, setSubmittedEntry] = useState("");
  const [error, setError] = useState("");

  const { saveChapter, getStorySummary, getNextChapterNumber, loaded } =
    useChapters();

  const today = new Date();
  const dateStr = today.toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "short",
  });
  const chapterNumber = loaded ? getNextChapterNumber() : "—";
  const affirmation = getTodayAffirmation();
  const greeting = getGreeting();
  const isLoading = isLoadingVoice || isLoadingStory;

  const handleSubmit = async () => {
    if (!entry.trim() || isLoading) return;

    const entryText = entry.trim();
    const now = new Date();
    const storySummary = getStorySummary();

    setIsLoadingVoice(true);
    setIsLoadingStory(true);
    setInnerVoice("");
    setStory("");
    setIsSubmitted(true);
    setSubmittedEntry(entryText);
    setError("");

    try {
      const [voiceResult, storyResult] = await Promise.all([
        streamResponse(
          "/api/inner-voice",
          { userEntry: entryText },
          (chunk) => setInnerVoice((prev) => prev + chunk)
        ),
        streamResponse(
          "/api/parallel-story",
          { userEntry: entryText, storySummary },
          (chunk) => setStory((prev) => prev + chunk)
        ),
      ]);

      setIsLoadingVoice(false);
      setIsLoadingStory(false);

      saveChapter({
        date: now.toISOString().split("T")[0],
        userEntry: entryText,
        innerVoice: voiceResult,
        parallelStory: storyResult,
      });
    } catch {
      setError("通信エラーが発生しました。もう一度試してください。");
      setIsLoadingVoice(false);
      setIsLoadingStory(false);
    }
  };

  const handleReset = () => {
    setIsSubmitted(false);
    setEntry("");
    setInnerVoice("");
    setStory("");
    setSubmittedEntry("");
    setError("");
  };

  return (
    <BookPage>
      {/* Header */}
      <div
        style={{
          marginBottom: "1.75rem",
          borderBottom: "1px solid var(--border)",
          paddingBottom: "1.25rem",
        }}
      >
        <p
          style={{
            fontSize: "0.7rem",
            color: "var(--gold)",
            letterSpacing: "0.1em",
            marginBottom: "0.5rem",
            opacity: 0.9,
          }}
        >
          {dateStr}　第{chapterNumber}章
        </p>
        <p
          className="serif"
          style={{
            fontSize: "1rem",
            lineHeight: "1.9",
            color: "var(--ink)",
            opacity: 0.78,
            letterSpacing: "0.02em",
            marginBottom: "0.5rem",
          }}
        >
          &ldquo;{affirmation}&rdquo;
        </p>
        <p
          style={{
            fontSize: "0.78rem",
            color: "var(--ink)",
            opacity: 0.38,
            letterSpacing: "0.01em",
          }}
        >
          {greeting}。今日はどんな一日でしたか？
        </p>
      </div>

      {/* Entry form */}
      {!isSubmitted && (
        <div style={{ marginBottom: "1.75rem" }}>
          <textarea
            value={entry}
            onChange={(e) => setEntry(e.target.value)}
            placeholder="ここに書いてください。どんな小さなことでも。"
            rows={7}
            style={{
              width: "100%",
              padding: "1rem 1.1rem",
              border: "1px solid var(--border)",
              borderRadius: "8px",
              backgroundColor: "var(--cream)",
              color: "var(--ink)",
              fontSize: "0.9rem",
              lineHeight: "1.9",
              fontFamily: "Noto Sans JP, sans-serif",
              outline: "none",
              marginBottom: "1rem",
              transition: "border-color 0.2s",
            }}
            onFocus={(e) =>
              (e.currentTarget.style.borderColor = "var(--sage)")
            }
            onBlur={(e) =>
              (e.currentTarget.style.borderColor = "var(--border)")
            }
          />
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <button
              onClick={handleSubmit}
              disabled={!entry.trim()}
              style={{
                padding: "0.6rem 1.6rem",
                backgroundColor: entry.trim() ? "var(--sage)" : "var(--border)",
                color: entry.trim() ? "var(--paper)" : "var(--ink)",
                border: "none",
                borderRadius: "6px",
                fontSize: "0.85rem",
                cursor: entry.trim() ? "pointer" : "default",
                fontFamily: "inherit",
                letterSpacing: "0.05em",
                transition: "all 0.2s",
                opacity: entry.trim() ? 1 : 0.5,
              }}
            >
              書き留める
            </button>
          </div>
        </div>
      )}

      {/* Submitted entry display */}
      {isSubmitted && (
        <div style={{ marginBottom: "1.75rem" }}>
          <p
            style={{
              fontSize: "0.83rem",
              color: "var(--ink)",
              lineHeight: "1.85",
              opacity: 0.55,
              fontStyle: "italic",
              borderLeft: "2px solid var(--border)",
              paddingLeft: "1rem",
              margin: 0,
              whiteSpace: "pre-wrap",
            }}
          >
            {submittedEntry}
          </p>
        </div>
      )}

      {/* Responses */}
      {isSubmitted && (
        <StoryTabs
          tabs={[
            {
              id: "voice",
              label: "あなたの話",
              content: (
                <InnerVoiceResponse
                  text={innerVoice}
                  isLoading={isLoadingVoice}
                  label="内なる自分より"
                />
              ),
            },
            {
              id: "story",
              label: "もうひとつの話",
              content: (
                <InnerVoiceResponse
                  text={story}
                  isLoading={isLoadingStory}
                  label="陽菜の物語"
                  isStory={true}
                />
              ),
            },
          ]}
        />
      )}

      {/* Error */}
      {error && (
        <p
          style={{
            color: "#a05040",
            fontSize: "0.8rem",
            marginTop: "1rem",
            fontFamily: "inherit",
          }}
        >
          {error}
        </p>
      )}

      {/* Write again link */}
      {isSubmitted && !isLoading && (
        <div style={{ marginTop: "1.25rem", textAlign: "center" }}>
          <button
            onClick={handleReset}
            style={{
              background: "none",
              border: "none",
              fontSize: "0.78rem",
              color: "var(--ink)",
              opacity: 0.35,
              cursor: "pointer",
              fontFamily: "inherit",
              letterSpacing: "0.03em",
            }}
          >
            もう一度書く
          </button>
        </div>
      )}

      {/* Bottom navigation */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          borderTop: "1px solid var(--border)",
          paddingTop: "1.25rem",
          marginTop: "2rem",
        }}
      >
        <Link
          href="/breathe"
          style={{
            fontSize: "0.8rem",
            color: "var(--sage)",
            textDecoration: "none",
            letterSpacing: "0.03em",
            opacity: 0.85,
          }}
        >
          呼吸のシーンへ →
        </Link>
        <Link
          href="/chapters"
          style={{
            fontSize: "0.8rem",
            color: "var(--ink)",
            opacity: 0.4,
            textDecoration: "none",
            letterSpacing: "0.03em",
          }}
        >
          過去の章へ →
        </Link>
      </div>
    </BookPage>
  );
}
