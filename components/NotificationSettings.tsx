"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function NotificationSettings() {
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [isPromptVisible, setIsPromptVisible] = useState(false);

  useEffect(() => {
    if ("Notification" in window) {
      setPermission(Notification.permission);
      // FORCE VISIBLE for the user to see it now
      setIsPromptVisible(true);
      
      // Still keep the logic to auto-hide if already granted
      if (Notification.permission === "granted") {
        setIsPromptVisible(false);
        scheduleNotification();
      }
    }
  }, []);

  const requestPermission = async () => {
    if ("Notification" in window) {
      const result = await Notification.requestPermission();
      setPermission(result);
      if (result === "granted") {
        scheduleNotification();
        setIsPromptVisible(false);
      }
    }
  };

  const scheduleNotification = () => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.ready.then((registration) => {
        // Calculate the next occurrence of 10:30 PM (22:30)
        const now = new Date();
        const scheduledTime = new Date();
        scheduledTime.setHours(22, 30, 0, 0);

        if (scheduledTime <= now) {
          // If 10:30 PM already passed today, schedule for tomorrow
          scheduledTime.setDate(scheduledTime.getDate() + 1);
        }

        const delay = scheduledTime.getTime() - now.getTime();

        // Use setTimeout to trigger the notification effectively while the app is alive.
        // For true offline scheduling without the app open, we would need a server
        // or the experimental Notification Triggers API, but this is a solid start.
        setTimeout(() => {
          const options: NotificationOptions = {
            body: "レン「やれやれ、新しい物語を書き始めたよ。君の今日の話を聞かせてくれないか？」",
            icon: "/icons/icon-192.png",
            tag: "daily-reminder",
            requireInteraction: true,
          };
          // Cast to any to include 'vibrate' as it's not always in the NotificationOptions type definition
          (options as any).vibrate = [200, 100, 200];
          
          registration.showNotification("selflove: 新しい物語", options);
          // Re-schedule for the next day
          scheduleNotification();
        }, delay);
        
        console.log(`Notification scheduled in ${Math.round(delay / 1000 / 60)} minutes.`);
      });
    }
  };

  if (permission === "granted") return null;

  return (
    <AnimatePresence>
      {isPromptVisible && (
        <motion.div
          initial={{ opacity: 0, y: 100, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 100, scale: 0.9 }}
          style={{
            position: "fixed",
            bottom: "2rem",
            left: "1rem",
            right: "1rem",
            zIndex: 9999,
            maxWidth: "400px",
            margin: "0 auto",
            backgroundColor: "rgba(255, 255, 255, 0.95)",
            backdropFilter: "blur(20px)",
            borderRadius: "24px",
            padding: "1.5rem",
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0, 0, 0, 0.05)",
            border: "1px solid rgba(74, 103, 65, 0.1)",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              <div style={{
                width: "48px",
                height: "48px",
                backgroundColor: "#4A6741",
                borderRadius: "16px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1.5rem",
                boxShadow: "0 4px 12px rgba(74, 103, 65, 0.2)"
              }}>
                🔔
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ 
                  margin: 0, 
                  color: "#3D3328", 
                  fontSize: "1rem", 
                  fontWeight: 600,
                  letterSpacing: "-0.01em"
                }}>
                  夜の10時半に会いましょう
                </h3>
                <p style={{ 
                  margin: "0.25rem 0 0 0", 
                  color: "rgba(61, 51, 40, 0.6)", 
                  fontSize: "0.8rem",
                  lineHeight: "1.4"
                }}>
                  レンや陽菜が、新しい物語の準備をしてあなたを呼びかけてくれます。
                </p>
              </div>
            </div>
            
            <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end" }}>
              <button
                onClick={() => setIsPromptVisible(false)}
                style={{
                  padding: "0.75rem 1.25rem",
                  borderRadius: "14px",
                  fontSize: "0.85rem",
                  fontWeight: 500,
                  color: "rgba(61, 51, 40, 0.4)",
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  transition: "all 0.2s"
                }}
              >
                あとで
              </button>
              <button
                onClick={requestPermission}
                style={{
                  padding: "0.75rem 1.5rem",
                  borderRadius: "14px",
                  fontSize: "0.85rem",
                  fontWeight: 600,
                  color: "#FDFAF4",
                  backgroundColor: "#4A6741",
                  border: "none",
                  cursor: "pointer",
                  boxShadow: "0 4px 12px rgba(74, 103, 65, 0.2)",
                  transition: "all 0.2s"
                }}
              >
                通知をオンにする
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

