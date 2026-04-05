"use client";

import React, { useState, useEffect } from "react";
import {
  subscribeToPushNotifications,
  requestNotificationPermission,
  testPushNotification,
} from "@/lib/notificationService";
import { getNotifSettings, saveNotifSettings, NotificationSettings as SettingsType } from "@/lib/notificationSettings";

export default function NotificationSettings() {
  const [settings, setSettings] = useState<SettingsType | null>(null);
  const [permission, setPermission] = useState<string>("default");
  const [mounted, setMounted] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setMounted(true);
    setSettings(getNotifSettings());
    if ("Notification" in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const handleToggleEnabled = async () => {
    if (!settings) return;
    
    if (permission !== "granted") {
      const result = await requestNotificationPermission();
      setPermission(result);
      if (result !== "granted") return;
    }

    const newSettings = { ...settings, enabled: !settings.enabled };
    setSettings(newSettings);
    saveNotifSettings(newSettings);

    if (newSettings.enabled) {
      await subscribeToPushNotifications(newSettings);
    }
  };

  const handleUpdateSetting = (
    type: "morning" | "evening",
    key: "enabled" | "hour" | "minute",
    value: any
  ) => {
    if (!settings) return;
    const newSettings = {
      ...settings,
      [type]: { ...settings[type], [key]: value },
    };
    setSettings(newSettings);
    saveNotifSettings(newSettings);
  };

  const handleSaveAndSync = async () => {
    if (!settings) return;
    setIsSaving(true);
    try {
      await subscribeToPushNotifications(settings);
      alert("設定を保存し、サーバーと同期しました。");
    } catch (error) {
      alert("エラーが発生しました。");
    } finally {
      setIsSaving(false);
    }
  };

  const handleTest = async (type: "morning" | "evening") => {
    const result = await testPushNotification(type);
    if (result) {
      alert(`${type === "morning" ? "レン" : "陽菜"}からのテスト通知を送信しました。`);
    } else {
      alert("送信に失敗しました。購読が有効か確認してください。");
    }
  };

  if (!mounted || !settings) return null;

  return (
    <div
      style={{
        backgroundColor: "rgba(253, 250, 244, 0.05)",
        borderRadius: "12px",
        padding: "1.5rem",
        border: "1px solid rgba(253, 250, 244, 0.1)",
        color: "#FDFAF4",
      }}
    >
      <div style={{ marginBottom: "1.5rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h3 style={{ margin: 0, fontSize: "1.1rem" }}>通知設定</h3>
          <p style={{ margin: "0.2rem 0 0", fontSize: "0.8rem", opacity: 0.7 }}>
            物語の更新や、新しい「しるし」の通知を受け取ります。
          </p>
        </div>
        <button
          onClick={handleToggleEnabled}
          style={{
            backgroundColor: settings.enabled ? "#4A6741" : "rgba(253, 250, 244, 0.1)",
            color: "#FDFAF4",
            border: "none",
            padding: "0.5rem 1rem",
            borderRadius: "20px",
            fontSize: "0.85rem",
            cursor: "pointer",
            transition: "all 0.2s"
          }}
        >
          {settings.enabled ? "オン" : "オフ"}
        </button>
      </div>

      {settings.enabled && (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          {/* Morning / Ren */}
          <div style={{ padding: "1rem", backgroundColor: "rgba(253, 250, 244, 0.03)", borderRadius: "8px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <div style={{ fontWeight: "bold", fontSize: "0.95rem" }}>🌅 朝の通知 (レン)</div>
              <input
                type="checkbox"
                checked={settings.morning.enabled}
                onChange={(e) => handleUpdateSetting("morning", "enabled", e.target.checked)}
              />
            </div>
            {settings.morning.enabled && (
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.9rem" }}>
                <select
                  value={settings.morning.hour}
                  onChange={(e) => handleUpdateSetting("morning", "hour", parseInt(e.target.value))}
                  style={{ background: "#2A2A2A", color: "#FDFAF4", border: "1px solid #444", borderRadius: "4px", padding: "0.2rem" }}
                >
                  {Array.from({ length: 24 }, (_, i) => (
                    <option key={i} value={i}>{i.toString().padStart(2, "0")}</option>
                  ))}
                </select>
                <span>:</span>
                <select
                  value={settings.morning.minute}
                  onChange={(e) => handleUpdateSetting("morning", "minute", parseInt(e.target.value))}
                  style={{ background: "#2A2A2A", color: "#FDFAF4", border: "1px solid #444", borderRadius: "4px", padding: "0.2rem" }}
                >
                  {[0, 15, 30, 45].map((m) => (
                    <option key={m} value={m}>{m.toString().padStart(2, "0")}</option>
                  ))}
                </select>
                <button
                  onClick={() => handleTest("morning")}
                  style={{ marginLeft: "auto", fontSize: "0.75rem", background: "none", border: "1px solid rgba(253,250,244,0.3)", color: "#FDFAF4", padding: "0.2rem 0.6rem", borderRadius: "4px", cursor: "pointer" }}
                >
                  テスト送信助
                </button>
              </div>
            )}
          </div>

          {/* Evening / Hina */}
          <div style={{ padding: "1rem", backgroundColor: "rgba(253, 250, 244, 0.03)", borderRadius: "8px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <div style={{ fontWeight: "bold", fontSize: "0.95rem" }}>🌙 夜の通知 (陽菜)</div>
              <input
                type="checkbox"
                checked={settings.evening.enabled}
                onChange={(e) => handleUpdateSetting("evening", "enabled", e.target.checked)}
              />
            </div>
            {settings.evening.enabled && (
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.9rem" }}>
                <select
                  value={settings.evening.hour}
                  onChange={(e) => handleUpdateSetting("evening", "hour", parseInt(e.target.value))}
                  style={{ background: "#2A2A2A", color: "#FDFAF4", border: "1px solid #444", borderRadius: "4px", padding: "0.2rem" }}
                >
                  {Array.from({ length: 24 }, (_, i) => (
                    <option key={i} value={i}>{i.toString().padStart(2, "0")}</option>
                  ))}
                </select>
                <span>:</span>
                <select
                  value={settings.evening.minute}
                  onChange={(e) => handleUpdateSetting("evening", "minute", parseInt(e.target.value))}
                  style={{ background: "#2A2A2A", color: "#FDFAF4", border: "1px solid #444", borderRadius: "4px", padding: "0.2rem" }}
                >
                  {[0, 15, 30, 45].map((m) => (
                    <option key={m} value={m}>{m.toString().padStart(2, "0")}</option>
                  ))}
                </select>
                <button
                  onClick={() => handleTest("evening")}
                  style={{ marginLeft: "auto", fontSize: "0.75rem", background: "none", border: "1px solid rgba(253,250,244,0.3)", color: "#FDFAF4", padding: "0.2rem 0.6rem", borderRadius: "4px", cursor: "pointer" }}
                >
                  テスト送信
                </button>
              </div>
            )}
          </div>

          <button
            onClick={handleSaveAndSync}
            disabled={isSaving}
            style={{
              backgroundColor: "#FDFAF4",
              color: "#1A1A1A",
              border: "none",
              padding: "0.8rem",
              borderRadius: "8px",
              fontWeight: "bold",
              cursor: isSaving ? "not-allowed" : "pointer",
              marginTop: "0.5rem"
            }}
          >
            {isSaving ? "同期中..." : "サーバーに設定を保存する"}
          </button>
        </div>
      )}

      {permission === "denied" && (
        <div style={{ marginTop: "1rem", color: "#FF6B6B", fontSize: "0.8rem", textAlign: "center" }}>
          通知がブラウザ設定でブロックされています。設定から許可してください。
        </div>
      )}
    </div>
  );
}
