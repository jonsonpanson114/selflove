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
    
    if (!settings.enabled && permission !== "granted") {
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
      alert("時刻の設定を保存し、通知をスケジュールしました。");
    } catch (error) {
      alert("同期に失敗しました。通知設定を「有効」にしてからお試しください。");
    } finally {
      setIsSaving(false);
    }
  };

  const [isTesting, setIsTesting] = useState<string | null>(null);

  const handleTest = async (type: "morning" | "evening") => {
    if (permission !== "granted") {
      alert("ブラウザの通知許可が必要です。設定から許可を出してください。");
      return;
    }
    
    setIsTesting(type);
    try {
      const result = await testPushNotification(type);
      if (result) {
        alert(`${type === "morning" ? "レン" : "陽菜"}からのテスト通知を送信しました。`);
      } else {
        alert("送信に失敗しました。ページを再読み込みして、「全体の通知スイッチ」が有効であることを確認してからもう一度お試しください。");
      }
    } catch (err) {
      alert("通信エラーが発生しました。");
    } finally {
      setIsTesting(null);
    }
  };


  if (!mounted || !settings) return null;

  return (
    <div
      style={{
        backgroundColor: "rgba(253, 250, 244, 0.05)",
        borderRadius: "20px",
        padding: "1.5rem",
        border: "1px solid rgba(253, 250, 244, 0.1)",
        color: "#FDFAF4",
        textAlign: "left",
        maxWidth: "400px",
        margin: "0 auto",
        boxShadow: "0 10px 30px rgba(0,0,0,0.1)"
      }}
    >
      <div style={{ marginBottom: "1.5rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h3 style={{ margin: 0, fontSize: "1rem", fontWeight: "bold", letterSpacing: "0.05em" }}>全体の通知スイッチ</h3>
          <p style={{ margin: "0.2rem 0 0", fontSize: "0.7rem", opacity: 0.5 }}>
            アプリからの通知を根源から切り替えます。
          </p>
        </div>
        <button
          onClick={handleToggleEnabled}
          style={{
            padding: "0.4rem 1rem",
            borderRadius: "20px",
            fontSize: "0.75rem",
            fontWeight: "bold",
            backgroundColor: settings.enabled ? "#4A6741" : "rgba(253, 250, 244, 0.1)",
            color: "#FDFAF4",
            border: "1px solid rgba(253, 250, 244, 0.2)",
            cursor: "pointer",
            transition: "all 0.2s"
          }}
        >
          {settings.enabled ? "通知：有効" : "通知：無効"}
        </button>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}>
        {/* Morning / Ren */}
        <div style={{ 
          padding: "1.2rem", 
          backgroundColor: settings.morning.enabled ? "rgba(74, 103, 65, 0.15)" : "rgba(253, 250, 244, 0.02)", 
          borderRadius: "16px",
          border: `1px solid ${settings.morning.enabled ? "rgba(74, 103, 65, 0.3)" : "rgba(253, 250, 244, 0.05)"}`,
          transition: "all 0.3s ease"
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
              <span style={{ fontSize: "1.4rem" }}>☀️</span>
              <div>
                <div style={{ fontWeight: "bold", fontSize: "0.9rem" }}>レン (朝の物語)</div>
                <div style={{ fontSize: "0.65rem", opacity: 0.5 }}>朝の更新をお知らせします。</div>
              </div>
            </div>
            <button
              onClick={() => handleUpdateSetting("morning", "enabled", !settings.morning.enabled)}
              style={{
                background: "none",
                border: "1px solid rgba(253, 250, 244, 0.3)",
                borderRadius: "4px",
                color: "#FDFAF4",
                padding: "0.2rem 0.6rem",
                fontSize: "0.7rem",
                cursor: "pointer",
                backgroundColor: settings.morning.enabled ? "rgba(253,250,244,0.1)" : "transparent"
              }}
            >
              {settings.morning.enabled ? "受け取る" : "受け取らない"}
            </button>
          </div>
          
          <div style={{ display: "flex", alignItems: "center", gap: "0.8rem", opacity: settings.morning.enabled ? 1 : 0.3 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
              <select
                disabled={!settings.morning.enabled}
                value={settings.morning.hour}
                onChange={(e) => handleUpdateSetting("morning", "hour", parseInt(e.target.value))}
                style={{ background: "#2A2A2A", color: "#FDFAF4", border: "1px solid #444", borderRadius: "6px", padding: "0.3rem 0.5rem", fontSize: "0.9rem" }}
              >
                {Array.from({ length: 24 }, (_, i) => (
                  <option key={i} value={i} style={{ color: "#333" }}>{i.toString().padStart(2, "0")}</option>
                ))}
              </select>
              <span style={{ fontSize: "0.9rem" }}>:</span>
              <select
                disabled={!settings.morning.enabled}
                value={settings.morning.minute}
                onChange={(e) => handleUpdateSetting("morning", "minute", parseInt(e.target.value))}
                style={{ background: "#2A2A2A", color: "#FDFAF4", border: "1px solid #444", borderRadius: "6px", padding: "0.3rem 0.5rem", fontSize: "0.9rem" }}
              >
                {[0, 15, 30, 45].map((m) => (
                  <option key={m} value={m} style={{ color: "#333" }}>{m.toString().padStart(2, "0")}</option>
                ))}
              </select>
            </div>
            <button
              onClick={() => handleTest("morning")}
              disabled={!!isTesting}
              style={{ 
                marginLeft: "auto", 
                fontSize: "0.7rem", 
                background: "none", 
                border: "1px solid rgba(253,250,244,0.2)", 
                color: "rgba(253,250,244,0.6)", 
                padding: "0.3rem 0.8rem", 
                borderRadius: "15px", 
                cursor: (isTesting === "morning") ? "wait" : "pointer",
                opacity: (isTesting === "morning") ? 0.5 : 1
              }}
            >
              {isTesting === "morning" ? "送信中..." : "テスト"}
            </button>

          </div>
        </div>

        {/* Evening / Hina */}
        <div style={{ 
          padding: "1.2rem", 
          backgroundColor: settings.evening.enabled ? "rgba(100, 80, 120, 0.15)" : "rgba(253, 250, 244, 0.02)", 
          borderRadius: "16px",
          border: `1px solid ${settings.evening.enabled ? "rgba(100, 80, 120, 0.3)" : "rgba(253, 250, 244, 0.05)"}`,
          transition: "all 0.3s ease"
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
              <span style={{ fontSize: "1.4rem" }}>🌙</span>
              <div>
                <div style={{ fontWeight: "bold", fontSize: "0.9rem" }}>陽菜 (夜の物語)</div>
                <div style={{ fontSize: "0.65rem", opacity: 0.5 }}>夜の更新をお知らせします。</div>
              </div>
            </div>
            <button
              onClick={() => handleUpdateSetting("evening", "enabled", !settings.evening.enabled)}
              style={{
                background: "none",
                border: "1px solid rgba(253, 250, 244, 0.3)",
                borderRadius: "4px",
                color: "#FDFAF4",
                padding: "0.2rem 0.6rem",
                fontSize: "0.7rem",
                cursor: "pointer",
                backgroundColor: settings.evening.enabled ? "rgba(253,250,244,0.1)" : "transparent"
              }}
            >
              {settings.evening.enabled ? "受け取る" : "受け取らない"}
            </button>
          </div>
          
          <div style={{ display: "flex", alignItems: "center", gap: "0.8rem", opacity: settings.evening.enabled ? 1 : 0.3 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
              <select
                disabled={!settings.evening.enabled}
                value={settings.evening.hour}
                onChange={(e) => handleUpdateSetting("evening", "hour", parseInt(e.target.value))}
                style={{ background: "#2A2A2A", color: "#FDFAF4", border: "1px solid #444", borderRadius: "6px", padding: "0.3rem 0.5rem", fontSize: "0.9rem" }}
              >
                {Array.from({ length: 24 }, (_, i) => (
                  <option key={i} value={i} style={{ color: "#333" }}>{i.toString().padStart(2, "0")}</option>
                ))}
              </select>
              <span style={{ fontSize: "0.9rem" }}>:</span>
              <select
                disabled={!settings.evening.enabled}
                value={settings.evening.minute}
                onChange={(e) => handleUpdateSetting("evening", "minute", parseInt(e.target.value))}
                style={{ background: "#2A2A2A", color: "#FDFAF4", border: "1px solid #444", borderRadius: "6px", padding: "0.3rem 0.5rem", fontSize: "0.9rem" }}
              >
                {[0, 15, 30, 45].map((m) => (
                  <option key={m} value={m} style={{ color: "#333" }}>{m.toString().padStart(2, "0")}</option>
                ))}
              </select>
            </div>
            <button
              onClick={() => handleTest("evening")}
              disabled={!!isTesting}
              style={{ 
                marginLeft: "auto", 
                fontSize: "0.7rem", 
                background: "none", 
                border: "1px solid rgba(253,250,244,0.2)", 
                color: "rgba(253,250,244,0.6)", 
                padding: "0.3rem 0.8rem", 
                borderRadius: "15px", 
                cursor: (isTesting === "evening") ? "wait" : "pointer",
                opacity: (isTesting === "evening") ? 0.5 : 1
              }}
            >
              {isTesting === "evening" ? "送信中..." : "テスト"}
            </button>

          </div>
        </div>

        <button
          onClick={handleSaveAndSync}
          disabled={isSaving || !settings.enabled}
          style={{
            backgroundColor: settings.enabled ? "#FDFAF4" : "rgba(253,250,244,0.1)",
            color: settings.enabled ? "#1A1A1A" : "rgba(253,250,244,0.3)",
            border: "none",
            padding: "1rem",
            borderRadius: "14px",
            fontWeight: "bold",
            fontSize: "0.9rem",
            cursor: (isSaving || !settings.enabled) ? "not-allowed" : "pointer",
            marginTop: "0.5rem",
            transition: "all 0.2s",
            boxShadow: settings.enabled ? "0 4px 15px rgba(0,0,0,0.2)" : "none"
          }}
        >
          {isSaving ? "同期中..." : "変更を確定してサーバーに送る"}
        </button>
        
        {!settings.enabled && (
          <p style={{ fontSize: "0.65rem", color: "#FF9F9F", textAlign: "center", margin: 0 }}>
            ※ 全体の通知スイッチが「無効」のため、通知は届きません。
          </p>
        )}
      </div>

      {permission === "denied" && (
        <div style={{ marginTop: "1rem", color: "#FF6B6B", fontSize: "0.7rem", textAlign: "center", lineHeight: "1.4" }}>
          通知がブラウザでブロックされています。設定から許可してください。
        </div>
      )}
    </div>
  );
}
