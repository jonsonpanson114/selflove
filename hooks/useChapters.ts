"use client";

import { useState, useEffect, useCallback } from "react";

export interface Chapter {
  id: string;
  date: string; // ISO string
  userEntry: string;
  mood?: number; // 1-5
  innerVoice: string;
  haruStory: string; // ハル（会社員）の物語
  soraStory: string; // ソラ（シングルマザー）の物語
  chapterNumber: number;
  createdAt: number; // Unix timestamp
  relic?: string;
  relicDescription?: string;
}

const STORAGE_KEY = "selflove-chapters";

export function useChapters() {
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // データ移行ロジック: 旧キー名があれば新キー名にマッピング
        const migrated = parsed.map((c: any) => ({
          ...c,
          haruStory: c.haruStory || c.parallelStory || "",
          soraStory: c.soraStory || c.renStory || "",
        }));
        setChapters(migrated);
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

  // ハルの物語コンテキストを取得
  const getHaruStorySummary = (count: number = 3) => {
    if (chapters.length === 0) return "";
    const recent = [...chapters]
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, count)
      .reverse();

    return recent
      .map((c) => `第${c.chapterNumber}章:\n${c.haruStory}`)
      .join("\n\n---\n\n");
  };

  // ソラの物語コンテキストを取得
  const getSoraStorySummary = (count: number = 3) => {
    if (chapters.length === 0) return "";
    const recent = [...chapters]
      .sort((a, b) => b.createdAt - a.createdAt)
      .filter((c) => c.soraStory) // soraStoryが存在するものだけ
      .slice(0, count)
      .reverse();

    return recent
      .map((c) => `第${c.chapterNumber}章:\n${c.soraStory}`)
      .join("\n\n---\n\n");
  };

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

  const deleteChapter = useCallback((id: string) => {
    setChapters((prev) => {
      const updated = prev.filter((c) => c.id !== id);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
  }, []);

  return {
    chapters,
    saveChapter,
    deleteChapter,
    getHaruStorySummary,
    getSoraStorySummary,
    getNextChapterNumber,
    importChapters,
    loaded,
  };
}
