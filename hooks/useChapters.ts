"use client";

import { useState, useEffect, useCallback } from "react";

export interface Chapter {
  id: string;
  date: string;
  chapterNumber: number;
  userEntry: string;
  innerVoice: string;
  parallelStory: string;
  createdAt: number;
  mood?: number; // 1〜5
}

const STORAGE_KEY = "selflove-chapters";

export function useChapters() {
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setChapters(JSON.parse(stored));
      }
    } catch {
      // ignore
    }
    setLoaded(true);
  }, []);

  const saveChapter = useCallback(
    (chapter: Omit<Chapter, "id" | "createdAt" | "chapterNumber">) => {
      setChapters((prev) => {
        const newChapter: Chapter = {
          ...chapter,
          id: Date.now().toString(),
          createdAt: Date.now(),
          chapterNumber: prev.length + 1,
        };
        const updated = [...prev, newChapter];
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        } catch {
          // ignore
        }
        return updated;
      });
    },
    []
  );

  const getStorySummary = useCallback((): string => {
    const recent = chapters.slice(-4);
    if (recent.length === 0) return "";
    return recent
      .map(
        (c) =>
          `第${c.chapterNumber}章（${new Date(c.date).toLocaleDateString("ja-JP", { month: "long", day: "numeric" })}）:\n${c.parallelStory.slice(0, 120)}…`
      )
      .join("\n\n");
  }, [chapters]);

  const getNextChapterNumber = useCallback((): number => {
    return chapters.length + 1;
  }, [chapters]);

  const importChapters = useCallback((imported: Chapter[]) => {
    setChapters(imported);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(imported));
    } catch {
      // ignore
    }
  }, []);

  return { chapters, saveChapter, importChapters, getStorySummary, getNextChapterNumber, loaded };
}
