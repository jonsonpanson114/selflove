"use client";

import { Chapter } from "@/hooks/useChapters";

interface ChapterCardProps {
  chapter: Chapter;
  isSelected: boolean;
  onClick: () => void;
}

export default function ChapterCard({
  chapter,
  isSelected,
  onClick,
}: ChapterCardProps) {
  const date = new Date(chapter.date);
  const dateStr = date.toLocaleDateString("ja-JP", {
    month: "long",
    day: "numeric",
    weekday: "short",
  });

  return (
    <button
      onClick={onClick}
      style={{
        width: "100%",
        textAlign: "left",
        padding: "1rem 1.25rem",
        backgroundColor: isSelected ? "var(--sage-light)" : "transparent",
        border: "1px solid",
        borderColor: isSelected ? "var(--sage)" : "var(--border)",
        borderRadius: "8px",
        cursor: "pointer",
        transition: "all 0.2s",
        marginBottom: "0.75rem",
        display: "block",
      }}
      onMouseEnter={(e) => {
        if (!isSelected) {
          (e.currentTarget as HTMLButtonElement).style.backgroundColor =
            "rgba(74, 103, 65, 0.04)";
        }
      }}
      onMouseLeave={(e) => {
        if (!isSelected) {
          (e.currentTarget as HTMLButtonElement).style.backgroundColor =
            "transparent";
        }
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          marginBottom: "0.375rem",
        }}
      >
        <span
          style={{
            fontSize: "0.75rem",
            color: "var(--gold)",
            fontFamily: "Noto Serif JP, Georgia, serif",
            letterSpacing: "0.05em",
          }}
        >
          第{chapter.chapterNumber}章
        </span>
        <span
          style={{
            fontSize: "0.72rem",
            color: "var(--ink)",
            opacity: 0.45,
          }}
        >
          {dateStr}
        </span>
      </div>
      <p
        className="line-clamp-2"
        style={{
          fontSize: "0.82rem",
          color: "var(--ink)",
          opacity: 0.65,
          lineHeight: "1.6",
          margin: 0,
        }}
      >
        {chapter.userEntry}
      </p>
    </button>
  );
}


