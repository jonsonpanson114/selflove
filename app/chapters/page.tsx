"use client";

import { useState } from "react";
import Link from "next/link";
import BookPage from "@/components/BookPage";
import ChapterCard from "@/components/ChapterCard";
import StoryTabs from "@/components/StoryTabs";
import InnerVoiceResponse from "@/components/InnerVoiceResponse";
import { useChapters, Chapter } from "@/hooks/useChapters";

export default function ChaptersPage() {
  const { chapters, loaded } = useChapters();
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null);

  const sortedChapters = [...chapters].reverse();

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
        <div style={{ width: "3rem" }} />
      </div>

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

              {/* Story tabs */}
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
                        text={selectedChapter.parallelStory}
                        isLoading={false}
                        label="陽菜の物語"
                        isStory={true}
                      />
                    ),
                  },
                ]}
              />
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
          textAlign: "center",
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
      </div>
    </BookPage>
  );
}
