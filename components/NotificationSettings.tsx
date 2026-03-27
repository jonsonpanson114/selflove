"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function NotificationSettings() {
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [isPromptVisible, setIsPromptVisible] = useState(false);

  useEffect(() => {
    if ("Notification" in window) {
      setPermission(Notification.permission);
      // If permission is not denied but not granted, show a gentle prompt after a delay
      const timer = setTimeout(() => {
        if (Notification.permission === "default") {
          setIsPromptVisible(true);
        }
      }, 3000);
      return () => clearTimeout(timer);
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
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="fixed bottom-6 left-6 right-6 bg-white/10 backdrop-blur-xl border border-white/20 p-6 rounded-3xl shadow-2xl z-[100] max-w-sm mx-auto"
        >
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#4A6741] rounded-full flex items-center justify-center text-xl">
                🔔
              </div>
              <div className="flex-1">
                <h3 className="text-white font-medium text-sm">通知を受け取りますか？</h3>
                <p className="text-white/60 text-xs">夜の10時半に、レンや陽菜が新しい物語の準備をして呼びかけてくれます。</p>
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setIsPromptVisible(false)}
                className="px-4 py-2 text-white/50 text-xs hover:text-white transition-colors"
              >
                あとで
              </button>
              <button
                onClick={requestPermission}
                className="px-5 py-2 bg-white text-[#4A6741] rounded-full text-xs font-bold hover:bg-white/90 transition-all shadow-lg active:scale-95"
              >
                許可する
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
