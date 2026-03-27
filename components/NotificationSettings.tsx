"use client";

import React, { useState, useEffect } from "react";

export default function NotificationSettings() {
  const [permission, setPermission] = useState<string>("default");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if ("Notification" in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = async () => {
    if ("Notification" in window) {
      const result = await Notification.requestPermission();
      setPermission(result);
      if (result === "granted") {
        scheduleNotification();
      }
    }
  };

  const scheduleNotification = () => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.ready.then((registration) => {
        const now = new Date();
        const scheduledTime = new Date();
        scheduledTime.setHours(22, 30, 0, 0);

        if (scheduledTime <= now) {
          scheduledTime.setDate(scheduledTime.getDate() + 1);
        }

        const delay = scheduledTime.getTime() - now.getTime();

        setTimeout(() => {
          const options = {
            body: "レン「やれやれ、新しい物語を書き始めたよ。君の今日の話を聞かせてくれないか？」",
            icon: "/icons/icon-192.png",
            tag: "daily-reminder",
            requireInteraction: true,
            vibrate: [200, 100, 200]
          };
          registration.showNotification("selflove: 新しい物語", options);
          scheduleNotification();
        }, delay);
      });
    }
  };

  if (!mounted || permission === "granted") return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 99999,
        backgroundColor: "#4A6741",
        color: "#FDFAF4",
        padding: "1rem",
        textAlign: "center",
        boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "0.5rem"
      }}
    >
      <div style={{ fontSize: "0.9rem", fontWeight: "bold" }}>
        🔔 夜10時半の通知をオンにしますか？
      </div>
      <div style={{ fontSize: "0.75rem", opacity: 0.9, marginBottom: "0.25rem" }}>
        レンや陽菜が新しい物語の準備をして呼びかけてくれます。
      </div>
      <div style={{ display: "flex", gap: "1rem" }}>
        <button
          onClick={() => setMounted(false)}
          style={{
            background: "none",
            border: "1px solid rgba(253, 250, 244, 0.4)",
            color: "inherit",
            padding: "0.4rem 1rem",
            borderRadius: "4px",
            fontSize: "0.8rem",
            cursor: "pointer"
          }}
        >
          あとで
        </button>
        <button
          onClick={requestPermission}
          style={{
            background: "#FDFAF4",
            border: "none",
            color: "#4A6741",
            padding: "0.4rem 1.2rem",
            borderRadius: "4px",
            fontSize: "0.8rem",
            fontWeight: "bold",
            cursor: "pointer",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
          }}
        >
          オンにする
        </button>
      </div>
    </div>
  );
}


