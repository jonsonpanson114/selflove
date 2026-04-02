"use client";

import React, { useState, useEffect } from "react";
import {
  subscribeToPushNotifications,
  requestNotificationPermission,
} from "@/lib/notificationService";

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
    const result = await requestNotificationPermission();
    setPermission(result);

    if (result === "granted") {
      // Subscribe to push notifications
      await subscribeToPushNotifications();
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


