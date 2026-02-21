"use client";

import { useState } from "react";
import Link from "next/link";
import BookPage from "@/components/BookPage";
import BreathingScene from "@/components/BreathingScene";
import { breathingScenes } from "@/lib/breathingScenes";

export default function BreathePage() {
  const [selectedSceneId, setSelectedSceneId] = useState(breathingScenes[0].id);
  const selectedScene =
    breathingScenes.find((s) => s.id === selectedSceneId) ?? breathingScenes[0];

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
          呼吸のシーン
        </p>
        <div style={{ width: "3rem" }} />
      </div>

      {/* Scene selector */}
      <div
        style={{
          display: "flex",
          gap: "0.5rem",
          marginBottom: "2rem",
          flexWrap: "wrap",
        }}
      >
        {breathingScenes.map((scene) => (
          <button
            key={scene.id}
            onClick={() => setSelectedSceneId(scene.id)}
            style={{
              padding: "0.45rem 1rem",
              fontSize: "0.78rem",
              fontFamily: "inherit",
              border: "1px solid",
              borderColor:
                selectedSceneId === scene.id ? "var(--sage)" : "var(--border)",
              borderRadius: "20px",
              backgroundColor:
                selectedSceneId === scene.id
                  ? "rgba(74, 103, 65, 0.09)"
                  : "transparent",
              color:
                selectedSceneId === scene.id ? "var(--sage)" : "var(--ink)",
              opacity: selectedSceneId === scene.id ? 1 : 0.5,
              cursor: "pointer",
              transition: "all 0.2s",
              letterSpacing: "0.03em",
            }}
          >
            {scene.title}
          </button>
        ))}
      </div>

      {/* Breathing scene */}
      <BreathingScene scene={selectedScene} />

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
