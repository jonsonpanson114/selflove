"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import BookPage from "@/components/BookPage";
import ChapterCard from "@/components/ChapterCard";
import StoryTabs from "@/components/StoryTabs";
import InnerVoiceResponse from "@/components/InnerVoiceResponse";
import { useChapters, Chapter } from "@/hooks/useChapters";

const MOOD_EMOJI: Record<number, string> = {
  1: "😔",
  2: "😐",
  3: "🙂",
  4: "😊",
  5: "✨",
};

export default function ChaptersPage() {
  const { chapters, importChapters, deleteChapter, loaded } = useChapters();
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null);
  const [importError, setImportError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sortedChapters = [...chapters].reverse();

  const handleExport = () => {
    const json = JSON.stringify(chapters, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `selflove-chapters-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportError("");
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const parsed = JSON.parse(ev.target?.result as string);
        if (!Array.isArray(parsed)) throw new Error("Invalid format");
        importChapters(parsed as Chapter[]);
        setSelectedChapter(null);
      } catch {
        setImportError("ファイルの形式が正しくありません。");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  return (
    <BookPage>
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "1.75rem",
          borderBottom: "1px solid var(--border)",
          paddingBottom: "1.25rem",
        }}
      >
        <Link
          href="/"
          style={{
            fontSize: "0.78rem",
            color: "var(--ink)",
            opacity: 0.4,
            textDecoration: "none",
            letterSpacing: "0.03em",
          }}
        >
          ← 戻る
        </Link>
        <p
          className="serif"
          style={{
            fontSize: "0.9rem",
            color: "var(--ink)",
            opacity: 0.65,
            letterSpacing: "0.05em",
          }}
        >
          過去の章
        </p>
        {/* Export / Import */}
        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
          <button
            onClick={handleExport}
            disabled={chapters.length === 0}
            title="JSONでエクスポート"
            style={{
              background: "none",
              border: "none",
              fontSize: "0.72rem",
              color: "var(--ink)",
              opacity: chapters.length === 0 ? 0.2 : 0.45,
              cursor: chapters.length === 0 ? "default" : "pointer",
              fontFamily: "inherit",
              letterSpacing: "0.03em",
              padding: "0.2rem 0.4rem",
            }}
          >
            保存
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            title="JSONからインポート"
            style={{
              background: "none",
              border: "none",
              fontSize: "0.72rem",
              color: "var(--ink)",
              opacity: 0.45,
              cursor: "pointer",
              fontFamily: "inherit",
              letterSpacing: "0.03em",
              padding: "0.2rem 0.4rem",
            }}
          >
            読込
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleImport}
            style={{ display: "none" }}
          />
        </div>
      </div>

      {importError && (
        <p
          style={{
            color: "#a05040",
            fontSize: "0.78rem",
            marginBottom: "1rem",
          }}
        >
          {importError}
        </p>
      )}

      {/* Empty state */}
      {loaded && chapters.length === 0 && (
        <div style={{ textAlign: "center", padding: "3rem 0" }}>
          <p
            className="serif"
            style={{
              fontSize: "0.9rem",
              color: "var(--ink)",
              opacity: 0.4,
              lineHeight: "2",
              letterSpacing: "0.03em",
            }}
          >
            まだ物語は始まっていません。
            <br />
            今日の一ページを書いてみてください。
          </p>
          <div style={{ marginTop: "1.5rem" }}>
            <Link
              href="/"
              style={{
                fontSize: "0.82rem",
                color: "var(--sage)",
                textDecoration: "none",
                letterSpacing: "0.03em",
              }}
            >
              最初の章を書く →
            </Link>
          </div>
        </div>
      )}

      {/* Chapter list */}
      {loaded && chapters.length > 0 && (
        <>
          <div style={{ marginBottom: selectedChapter ? "1.75rem" : 0 }}>
            {sortedChapters.map((chapter) => (
              <ChapterCard
                key={chapter.id}
                chapter={chapter}
                isSelected={selectedChapter?.id === chapter.id}
                onClick={() =>
                  setSelectedChapter(
                    selectedChapter?.id === chapter.id ? null : chapter
                  )
                }
              />
            ))}
          </div>

          {/* Selected chapter content */}
          {selectedChapter && (
            <div
              style={{
                borderTop: "1px solid var(--border)",
                paddingTop: "1.5rem",
              }}
            >
              {/* Mood */}
              {selectedChapter.mood !== undefined && (
                <p
                  style={{
                    fontSize: "1.3rem",
                    marginBottom: "0.5rem",
                    lineHeight: 1,
                  }}
                >
                  {MOOD_EMOJI[selectedChapter.mood]}
                </p>
              )}

              {/* User entry */}
              <p
                style={{
                  fontSize: "0.83rem",
                  color: "var(--ink)",
                  lineHeight: "1.85",
                  opacity: 0.55,
                  fontStyle: "italic",
                  borderLeft: "2px solid var(--border)",
                  paddingLeft: "1rem",
                  marginBottom: "1.75rem",
                  whiteSpace: "pre-wrap",
                }}
              >
                {selectedChapter.userEntry}
              </p>

              <StoryTabs
                tabs={[
                  {
                    id: "voice",
                    label: "あなたの話",
                    content: (
                      <InnerVoiceResponse
                        text={selectedChapter.innerVoice}
                        isLoading={false}
                        label="内なる自分より"
                      />
                    ),
                  },
                  {
                    id: "story",
                    label: "もうひとつの話",
                    content: (
                      <InnerVoiceResponse
                        text={selectedChapter.haruStory}
                        isLoading={false}
                        label="Haruの物語"
                        isStory={true}
                      />
                    ),
                  },
                  ...(selectedChapter.soraStory
                    ? [
                      {
                        id: "sora-story",
                        label: "遠い星の話",
                        content: (
                          <InnerVoiceResponse
                            text={selectedChapter.soraStory}
                            isLoading={false}
                            label="Soraの物語"
                            isStory={true}
                          />
                        ),
                      },
                    ]
                    : []),
                ]}
              />

              {/* Delete Button */}
              <div
                style={{
                  marginTop: "2rem",
                  display: "flex",
                  justifyContent: "center",
                }}
              >
                <button
                  onClick={() => {
                    if (confirm("この章を完全に削除しますか？\nこの操作は取り消せません。")) {
                      deleteChapter(selectedChapter.id);
                      setSelectedChapter(null);
                    }
                  }}
                  style={{
                    background: "none",
                    border: "1px solid #a05040",
                    color: "#a05040",
                    padding: "0.4rem 1rem",
                    borderRadius: "4px",
                    fontSize: "0.75rem",
                    cursor: "pointer",
                    opacity: 0.6,
                    fontFamily: "inherit",
                    letterSpacing: "0.05em",
                  }}
                >
                  この章を削除する
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Bottom nav */}
      <div
        style={{
          borderTop: "1px solid var(--border)",
          paddingTop: "1.25rem",
          marginTop: "2rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Link
          href="/"
          style={{
            fontSize: "0.78rem",
            color: "var(--ink)",
            opacity: 0.35,
            textDecoration: "none",
            letterSpacing: "0.03em",
          }}
        >
          今日の章へ戻る
        </Link>
        <Link
          href="/stats"
          style={{
            fontSize: "0.78rem",
            color: "var(--sage)",
            opacity: 0.7,
            textDecoration: "none",
            letterSpacing: "0.03em",
          }}
        >
          統計 →
        </Link>
      </div>
    </BookPage>
  );
}
