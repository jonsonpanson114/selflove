"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import BookPage from "@/components/BookPage";
import StoryTabs from "@/components/StoryTabs";
import InnerVoiceResponse from "@/components/InnerVoiceResponse";
import { NotificationSettingsUI } from "@/components/NotificationSettingsUI";
import { useChapters } from "@/hooks/useChapters";
import { getTodayAffirmation, getGreeting } from "@/lib/affirmations";
import {
  writingPrompts,
  getRandomPromptIndex,
  getNextPromptIndex,
} from "@/lib/writingPrompts";
import {
  getNotifSettings,
  shouldShowNotification,
} from "@/lib/notificationSettings";

const MOOD_OPTIONS = [
  { value: 1, emoji: "😔", label: "辛い" },
  { value: 2, emoji: "😐", label: "普通" },
  { value: 3, emoji: "🙂", label: "良い" },
  { value: 4, emoji: "😊", label: "とても良い" },
  { value: 5, emoji: "✨", label: "最高" },
];

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
  const [mood, setMood] = useState<number | null>(null);
  const [innerVoice, setInnerVoice] = useState("");
  const [haruStory, setHaruStory] = useState("");
  const [soraStory, setSoraStory] = useState("");
  const [isLoadingVoice, setIsLoadingVoice] = useState(false);
  const [isLoadingHaruStory, setIsLoadingHaruStory] = useState(false);
  const [isLoadingSoraStory, setIsLoadingSoraStory] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedEntry, setSubmittedEntry] = useState("");
  const [submittedMood, setSubmittedMood] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [promptIndex, setPromptIndex] = useState(0); // Server uses 0
  const [mounted, setMounted] = useState(false);
  const [showNotificationSettings, setShowNotificationSettings] = useState(false);

  const { chapters, saveChapter, getHaruStorySummary, getSoraStorySummary, getNextChapterNumber, loaded } =
    useChapters();

  // 1. Initial mounting and prompt initialization
  useEffect(() => {
    setMounted(true);
    setPromptIndex(getRandomPromptIndex());
  }, []);

  // 2. Notification handling - only after mount and data loaded
  useEffect(() => {
    if (!mounted || !loaded) return;
    
    const todayStr = new Date().toISOString().split("T")[0];
    const hasTodayEntry = chapters.some((c) => c.date === todayStr);
    const settings = getNotifSettings();
    
    if (shouldShowNotification(settings, hasTodayEntry)) {
      try {
        const NotificationAPI = (window as any).Notification;
        if (NotificationAPI && NotificationAPI.permission === "granted") {
          new NotificationAPI("selflove", {
            body: "今日の一ページを書いてみませんか？",
            icon: "/icons/icon-192.png",
          });
        }
      } catch (err) {
        console.warn("Notification failed:", err);
      }
    }
  }, [mounted, loaded, chapters]);

  const today = new Date();
  // Ensure these are stable during SSR/initial hydration
  const dateStr = mounted ? today.toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "short",
  }) : "";
  const chapterNumber = (mounted && loaded) ? getNextChapterNumber() : "—";
  const affirmation = mounted ? getTodayAffirmation() : "";
  const greeting = mounted ? getGreeting() : "";
  const isLoading = isLoadingVoice || isLoadingHaruStory || isLoadingSoraStory;

  const handleSubmit = async () => {
    if (!entry.trim() || isLoading) return;

    const entryText = entry.trim();
    const now = new Date();
    const haruStorySummary = getHaruStorySummary();
    const soraStorySummary = getSoraStorySummary();

    setIsLoadingVoice(true);
    setIsLoadingHaruStory(true);
    setIsLoadingSoraStory(true);
    setInnerVoice("");
    setHaruStory("");
    setSoraStory("");
    setIsSubmitted(true);
    setSubmittedEntry(entryText);
    setSubmittedMood(mood);
    setError("");

    try {
      // 個別に実行して、1つが失敗しても他は続行
      const [voiceResult, haruStoryResult, soraStoryResult] = await Promise.allSettled([
        streamResponse(
          "/api/inner-voice",
          { userEntry: entryText },
          (chunk) => setInnerVoice((prev) => prev + chunk)
        ),
        streamResponse(
          "/api/haru-story",
          { userEntry: entryText, storySummary: haruStorySummary },
          (chunk) => setHaruStory((prev) => prev + chunk)
        ),
        streamResponse(
          "/api/sora-story",
          { userEntry: entryText, storySummary: soraStorySummary },
          (chunk) => setSoraStory((prev) => prev + chunk)
        ),
      ]);

      // 成功したものを取り出す
      const voiceData = voiceResult.status === "fulfilled" ? voiceResult.value : "";
      const haruData = haruStoryResult.status === "fulfilled" ? haruStoryResult.value : "";
      const soraData = soraStoryResult.status === "fulfilled" ? soraStoryResult.value : "";

      // 失敗があればエラー表示
      const failedItems = [];
      if (voiceResult.status === "rejected") failedItems.push("内なる自分の声");
      if (haruStoryResult.status === "rejected") failedItems.push("Haruの物語");
      if (soraStoryResult.status === "rejected") failedItems.push("Soraの物語");

      setIsLoadingVoice(false);
      setIsLoadingHaruStory(false);
      setIsLoadingSoraStory(false);

      // 少なくとも1つ成功していれば保存
      if (voiceData || haruData || soraData) {
        saveChapter({
          date: now.toISOString().split("T")[0],
          userEntry: entryText,
          innerVoice: voiceData || "（生成に失敗しました）",
          haruStory: haruData || "（生成に失敗しました）",
          soraStory: soraData || "",
          mood: mood ?? undefined,
        });
      }

      if (failedItems.length > 0) {
        // rejectedの場合はReasonからメッセージ取得を試みる
        const errorMsgs = [];
        if (voiceResult.status === "rejected") errorMsgs.push(`内なる自分の声 (${voiceResult.reason?.message || "不明なエラー"})`);
        if (haruStoryResult.status === "rejected") errorMsgs.push(`Haruの物語 (${haruStoryResult.reason?.message || "不明なエラー"})`);
        if (soraStoryResult.status === "rejected") errorMsgs.push(`Soraの物語 (${soraStoryResult.reason?.message || "不明なエラー"})`);

        setError(`${errorMsgs.join("、")} の生成に失敗しました。`);
      }
    } catch (e) {
      setError("通信エラーが発生しました。もう一度試してください。");
      setIsLoadingVoice(false);
      setIsLoadingHaruStory(false);
      setIsLoadingSoraStory(false);
    }
  };

  const handleReset = () => {
    setIsSubmitted(false);
    setEntry("");
    setMood(null);
    setInnerVoice("");
    setHaruStory("");
    setSoraStory("");
    setSubmittedEntry("");
    setSubmittedMood(null);
    setError("");
    setPromptIndex(getRandomPromptIndex());
  };

  return (
    <BookPage isPulsing={isLoading}>
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
          {/* Mood selector */}
          <div style={{ marginBottom: "1rem" }}>
            <p
              style={{
                fontSize: "0.72rem",
                color: "var(--ink)",
                opacity: 0.4,
                letterSpacing: "0.05em",
                marginBottom: "0.5rem",
              }}
            >
              今の気分は？
            </p>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              {MOOD_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() =>
                    setMood(mood === option.value ? null : option.value)
                  }
                  title={option.label}
                  style={{
                    fontSize: "1.5rem",
                    lineHeight: 1,
                    padding: "0.3rem",
                    background: "none",
                    border: "2px solid",
                    borderColor:
                      mood === option.value ? "var(--sage)" : "transparent",
                    borderRadius: "8px",
                    cursor: "pointer",
                    opacity: mood === null || mood === option.value ? 1 : 0.35,
                    transition: "all 0.15s",
                    backgroundColor:
                      mood === option.value
                        ? "var(--sage-light)"
                        : "transparent",
                  }}
                >
                  {option.emoji}
                </button>
              ))}
            </div>
          </div>

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
              marginBottom: "0.6rem",
              transition: "border-color 0.2s",
            }}
            onFocus={(e) =>
              (e.currentTarget.style.borderColor = "var(--sage)")
            }
            onBlur={(e) =>
              (e.currentTarget.style.borderColor = "var(--border)")
            }
          />

          {/* Writing prompt hint */}
          {!entry && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                marginBottom: "1rem",
                opacity: 0.5,
              }}
            >
              <p
                style={{
                  fontSize: "0.75rem",
                  color: "var(--ink)",
                  fontStyle: "italic",
                  letterSpacing: "0.01em",
                  lineHeight: "1.6",
                  margin: 0,
                  flex: 1,
                }}
              >
                ヒント: {writingPrompts[promptIndex]}
              </p>
              <button
                onClick={() => setPromptIndex(getNextPromptIndex(promptIndex))}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "0.7rem",
                  color: "var(--ink)",
                  cursor: "pointer",
                  fontFamily: "inherit",
                  letterSpacing: "0.03em",
                  whiteSpace: "nowrap",
                  padding: "0.2rem 0",
                  flexShrink: 0,
                }}
              >
                別のヒント
              </button>
            </div>
          )}

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
          {submittedMood !== null && (
            <p
              style={{
                fontSize: "1.3rem",
                marginBottom: "0.5rem",
                lineHeight: 1,
              }}
            >
              {MOOD_OPTIONS.find((o) => o.value === submittedMood)?.emoji}
            </p>
          )}
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
                  text={haruStory}
                  isLoading={isLoadingHaruStory}
                  label="Haruの物語"
                  isStory={true}
                />
              ),
            },
            {
              id: "sora-story",
              label: "遠い星の話",
              content: (
                <InnerVoiceResponse
                  text={soraStory}
                  isLoading={isLoadingSoraStory}
                  label="Soraの物語"
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
          href="/garden"
          style={{
            fontSize: "0.8rem",
            color: "var(--ink)",
            opacity: 0.4,
            textDecoration: "none",
            letterSpacing: "0.03em",
          }}
        >
          心の庭へ →
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

      {/* Notification Settings */}
      <div style={{ marginTop: "3rem", textAlign: "center" }}>
        <button
          onClick={() => setShowNotificationSettings(!showNotificationSettings)}
          style={{
            background: "none",
            border: "1px solid var(--border)",
            borderRadius: "20px",
            fontSize: "0.7rem",
            color: "var(--ink)",
            opacity: 0.5,
            cursor: "pointer",
            fontFamily: "inherit",
            letterSpacing: "0.05em",
            padding: "0.4rem 1rem",
            transition: "all 0.2s",
          }}
        >
          {showNotificationSettings ? "設定を閉じる" : "通知設定を開く"}
        </button>
        
        {showNotificationSettings && (
          <div style={{ marginTop: "1.5rem" }}>
            <NotificationSettingsUI />
          </div>
        )}
      </div>
    </BookPage>
  );
}
