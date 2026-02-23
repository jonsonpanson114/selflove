"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import BookPage from "@/components/BookPage";
import { useChapters } from "@/hooks/useChapters";
import {
  getNotifSettings,
  saveNotifSettings,
  NotificationSettings,
} from "@/lib/notificationSettings";

const MOOD_EMOJI: Record<number, string> = {
  1: "😔",
  2: "😐",
  3: "🙂",
  4: "😊",
  5: "✨",
};

const MOOD_COLOR: Record<number, string> = {
  1: "#c08070",
  2: "#9090a0",
  3: "#7aaa70",
  4: "#4A6741",
  5: "#c4a96a",
};

function calcStreak(dates: string[]): number {
  const unique = [...new Set(dates)].sort().reverse();
  if (unique.length === 0) return 0;
  const today = new Date().toISOString().split("T")[0];
  // Start from today or yesterday if today not present
  let current = new Date(today);
  let streak = 0;
  for (const d of unique) {
    const expected = current.toISOString().split("T")[0];
    if (d === expected) {
      streak++;
      current.setDate(current.getDate() - 1);
    } else if (d < expected) {
      break;
    }
  }
  return streak;
}

export default function StatsPage() {
  const { chapters, loaded } = useChapters();
  const [notifSettings, setNotifSettings] = useState<NotificationSettings>({
    enabled: false,
    time: "21:00",
  });
  const [notifPermission, setNotifPermission] = useState<NotificationPermission | "unsupported">("default");

  useEffect(() => {
    setNotifSettings(getNotifSettings());
    if (typeof Notification !== "undefined") {
      setNotifPermission(Notification.permission);
    } else {
      setNotifPermission("unsupported");
    }
  }, []);

  const handleRequestPermission = async () => {
    if (typeof Notification === "undefined") return;
    const result = await Notification.requestPermission();
    setNotifPermission(result);
    if (result === "granted") {
      const updated = { ...notifSettings, enabled: true };
      setNotifSettings(updated);
      saveNotifSettings(updated);
    }
  };

  const handleToggleNotif = (enabled: boolean) => {
    const updated = { ...notifSettings, enabled };
    setNotifSettings(updated);
    saveNotifSettings(updated);
  };

  const handleTimeChange = (time: string) => {
    const updated = { ...notifSettings, time };
    setNotifSettings(updated);
    saveNotifSettings(updated);
  };

  // Stats calculations
  const totalChapters = chapters.length;
  const dates = chapters.map((c) => c.date);
  const streak = calcStreak(dates);

  const today = new Date();
  const thisMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;
  const thisMonthCount = chapters.filter((c) => c.date.startsWith(thisMonth)).length;

  // Monthly calendar
  const year = today.getFullYear();
  const month = today.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay(); // 0=Sun
  const entryByDate: Record<string, number | undefined> = {};
  chapters.forEach((c) => {
    entryByDate[c.date] = c.mood;
  });

  // Mood trend: last 20 chapters
  const recentChapters = [...chapters].slice(-20);

  const sectionTitle = (text: string) => (
    <p
      style={{
        fontSize: "0.68rem",
        color: "var(--gold)",
        letterSpacing: "0.12em",
        marginBottom: "0.75rem",
        opacity: 0.85,
      }}
    >
      {text}
    </p>
  );

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
          href="/chapters"
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
          振り返り
        </p>
        <div style={{ width: "3rem" }} />
      </div>

      {!loaded && (
        <p style={{ opacity: 0.4, fontSize: "0.85rem" }}>読み込み中…</p>
      )}

      {loaded && (
        <>
          {/* Summary stats */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: "0.75rem",
              marginBottom: "2rem",
            }}
          >
            {[
              { label: "総章数", value: totalChapters, unit: "章" },
              { label: "連続記録", value: streak, unit: "日" },
              { label: "今月", value: thisMonthCount, unit: "章" },
            ].map(({ label, value, unit }) => (
              <div
                key={label}
                style={{
                  backgroundColor: "var(--cream)",
                  border: "1px solid var(--border)",
                  borderRadius: "10px",
                  padding: "0.85rem 0.5rem",
                  textAlign: "center",
                }}
              >
                <p
                  style={{
                    fontSize: "1.6rem",
                    fontWeight: 300,
                    color: "var(--sage)",
                    lineHeight: 1,
                    marginBottom: "0.3rem",
                    fontFamily: "Noto Serif JP, serif",
                  }}
                >
                  {value}
                  <span
                    style={{ fontSize: "0.75rem", opacity: 0.6, marginLeft: "0.1rem" }}
                  >
                    {unit}
                  </span>
                </p>
                <p
                  style={{
                    fontSize: "0.65rem",
                    color: "var(--ink)",
                    opacity: 0.45,
                    letterSpacing: "0.05em",
                  }}
                >
                  {label}
                </p>
              </div>
            ))}
          </div>

          {/* Monthly calendar */}
          <div style={{ marginBottom: "2rem" }}>
            {sectionTitle(
              `${today.getFullYear()}年${today.getMonth() + 1}月`
            )}
            {/* Day of week header */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(7, 1fr)",
                gap: "2px",
                marginBottom: "4px",
              }}
            >
              {["日", "月", "火", "水", "木", "金", "土"].map((d) => (
                <div
                  key={d}
                  style={{
                    textAlign: "center",
                    fontSize: "0.6rem",
                    color: "var(--ink)",
                    opacity: 0.3,
                    letterSpacing: "0.05em",
                  }}
                >
                  {d}
                </div>
              ))}
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(7, 1fr)",
                gap: "3px",
              }}
            >
              {/* Empty cells before first day */}
              {Array.from({ length: firstDayOfWeek }).map((_, i) => (
                <div key={`empty-${i}`} />
              ))}
              {/* Day cells */}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const dateKey = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                const moodVal = entryByDate[dateKey];
                const hasEntry = dateKey in entryByDate;
                const isToday = day === today.getDate();
                return (
                  <div
                    key={day}
                    style={{
                      aspectRatio: "1",
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "0.62rem",
                      backgroundColor: hasEntry
                        ? moodVal
                          ? MOOD_COLOR[moodVal]
                          : "var(--sage)"
                        : "transparent",
                      color: hasEntry ? "white" : "var(--ink)",
                      opacity: hasEntry ? 0.85 : isToday ? 0.6 : 0.25,
                      border: isToday ? "1.5px solid var(--sage)" : "none",
                      fontWeight: isToday ? 600 : 400,
                    }}
                  >
                    {day}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Mood trend */}
          {recentChapters.some((c) => c.mood !== undefined) && (
            <div style={{ marginBottom: "2rem" }}>
              {sectionTitle("気分の推移")}
              <div
                style={{
                  display: "flex",
                  gap: "4px",
                  alignItems: "flex-end",
                  height: "48px",
                }}
              >
                {recentChapters.map((c, i) => (
                  <div
                    key={c.id}
                    title={
                      c.mood ? MOOD_EMOJI[c.mood] : "記録なし"
                    }
                    style={{
                      flex: 1,
                      borderRadius: "3px 3px 0 0",
                      backgroundColor:
                        c.mood ? MOOD_COLOR[c.mood] : "var(--border)",
                      height: c.mood ? `${(c.mood / 5) * 100}%` : "10%",
                      opacity: 0.75,
                      transition: "height 0.3s",
                    }}
                  />
                ))}
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginTop: "4px",
                  fontSize: "0.6rem",
                  color: "var(--ink)",
                  opacity: 0.3,
                }}
              >
                <span>← 過去</span>
                <span>最近 →</span>
              </div>
            </div>
          )}

          {/* Notification settings */}
          <div
            style={{
              borderTop: "1px solid var(--border)",
              paddingTop: "1.5rem",
              marginBottom: "1.5rem",
            }}
          >
            {sectionTitle("リマインダー設定")}

            {notifPermission === "unsupported" && (
              <p
                style={{
                  fontSize: "0.78rem",
                  color: "var(--ink)",
                  opacity: 0.4,
                }}
              >
                このブラウザは通知をサポートしていません。
              </p>
            )}

            {notifPermission !== "unsupported" && (
              <>
                {notifPermission !== "granted" && (
                  <div style={{ marginBottom: "1rem" }}>
                    <p
                      style={{
                        fontSize: "0.78rem",
                        color: "var(--ink)",
                        opacity: 0.5,
                        marginBottom: "0.75rem",
                        lineHeight: "1.7",
                      }}
                    >
                      アプリを開いたとき、まだ書いていない場合に
                      <br />
                      通知でお知らせします。
                    </p>
                    <button
                      onClick={handleRequestPermission}
                      style={{
                        padding: "0.5rem 1.2rem",
                        backgroundColor: "var(--sage)",
                        color: "var(--paper)",
                        border: "none",
                        borderRadius: "6px",
                        fontSize: "0.8rem",
                        cursor: "pointer",
                        fontFamily: "inherit",
                        letterSpacing: "0.03em",
                      }}
                    >
                      通知を許可する
                    </button>
                  </div>
                )}

                {notifPermission === "granted" && (
                  <div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        marginBottom: "0.75rem",
                      }}
                    >
                      <p
                        style={{
                          fontSize: "0.82rem",
                          color: "var(--ink)",
                          opacity: 0.65,
                        }}
                      >
                        リマインダーを有効にする
                      </p>
                      <button
                        onClick={() => handleToggleNotif(!notifSettings.enabled)}
                        style={{
                          width: "44px",
                          height: "24px",
                          borderRadius: "12px",
                          border: "none",
                          backgroundColor: notifSettings.enabled
                            ? "var(--sage)"
                            : "var(--border)",
                          cursor: "pointer",
                          position: "relative",
                          transition: "background-color 0.2s",
                          flexShrink: 0,
                        }}
                      >
                        <span
                          style={{
                            position: "absolute",
                            top: "2px",
                            left: notifSettings.enabled ? "22px" : "2px",
                            width: "20px",
                            height: "20px",
                            borderRadius: "50%",
                            backgroundColor: "white",
                            transition: "left 0.2s",
                          }}
                        />
                      </button>
                    </div>

                    {notifSettings.enabled && (
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.75rem",
                        }}
                      >
                        <p
                          style={{
                            fontSize: "0.82rem",
                            color: "var(--ink)",
                            opacity: 0.55,
                          }}
                        >
                          通知時刻
                        </p>
                        <input
                          type="time"
                          value={notifSettings.time}
                          onChange={(e) => handleTimeChange(e.target.value)}
                          style={{
                            padding: "0.3rem 0.6rem",
                            border: "1px solid var(--border)",
                            borderRadius: "6px",
                            backgroundColor: "var(--cream)",
                            color: "var(--ink)",
                            fontSize: "0.85rem",
                            fontFamily: "inherit",
                            outline: "none",
                          }}
                        />
                      </div>
                    )}
                  </div>
                )}

                {notifPermission === "denied" && (
                  <p
                    style={{
                      fontSize: "0.78rem",
                      color: "var(--ink)",
                      opacity: 0.4,
                      lineHeight: "1.7",
                    }}
                  >
                    通知がブロックされています。
                    <br />
                    ブラウザの設定から許可してください。
                  </p>
                )}
              </>
            )}
          </div>
        </>
      )}

      {/* Bottom nav */}
      <div
        style={{
          borderTop: "1px solid var(--border)",
          paddingTop: "1.25rem",
          marginTop: "1rem",
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
