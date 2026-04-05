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
    
    // オフからオンにする時だけ権限を確認
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
      alert("設定を保存し、サーバーと同期しました。");
    } catch (error) {
      alert("エラーが発生しました。購読を有効にしてください。");
    } finally {
      setIsSaving(false);
    }
  };

  const handleTest = async (type: "morning" | "evening") => {
    if (permission !== "granted") {
      alert("通知の許可が必要です。");
      return;
    }
    const result = await testPushNotification(type);
    if (result) {
      alert(`${type === "morning" ? "レン" : "陽菜"}からのテスト通知を送信しました。`);
    } else {
      alert("送信に失敗しました。通知を「オン」にしてからお試しください。");
    }
  };

  if (!mounted || !settings) return null;

  return (
    <div
      style={{
        backgroundColor: "rgba(253, 250, 244, 0.05)",
        borderRadius: "16px",
        padding: "1.5rem",
        border: "1px solid rgba(253, 250, 244, 0.1)",
        color: "#FDFAF4",
        textAlign: "left",
        maxWidth: "400px",
        margin: "0 auto"
      }}
    >
      <div style={{ marginBottom: "1.5rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h3 style={{ margin: 0, fontSize: "1.1rem", letterSpacing: "0.05em" }}>通知の予定</h3>
          <p style={{ margin: "0.2rem 0 0", fontSize: "0.75rem", opacity: 0.6 }}>
            物語が更新された時に、二人が呼びかけてくれます。
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <span style={{ fontSize: "0.7rem", opacity: settings.enabled ? 1 : 0.4 }}>{settings.enabled ? "有効" : "無効"}</span>
          <button
            onClick={handleToggleEnabled}
            style={{
              width: "44px",
              height: "24px",
              borderRadius: "12px",
              backgroundColor: settings.enabled ? "#4A6741" : "rgba(253, 250, 244, 0.2)",
              border: "none",
              position: "relative",
              cursor: "pointer",
              transition: "all 0.3s ease"
            }}
          >
            <div style={{
              width: "18px",
              height: "18px",
              backgroundColor: "#FDFAF4",
              borderRadius: "50%",
              position: "absolute",
              top: "3px",
              left: settings.enabled ? "23px" : "3px",
              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
            }} />
          </button>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        {/* Morning / Ren */}
        <div style={{ 
          padding: "1rem", 
          backgroundColor: "rgba(253, 250, 244, 0.03)", 
          borderRadius: "12px",
          border: "1px solid rgba(253, 250, 244, 0.05)"
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.8rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <span style={{ fontSize: "1.2rem" }}>🌅</span>
              <span style={{ fontWeight: "bold", fontSize: "0.9rem" }}>朝の通知 (レン)</span>
            </div>
            <input
              type="checkbox"
              checked={settings.morning.enabled}
              onChange={(e) => handleUpdateSetting("morning", "enabled", e.target.checked)}
              style={{ accentColor: "#4A6741" }}
            />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.8rem", fontSize: "0.9rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
              <select
                value={settings.morning.hour}
                onChange={(e) => handleUpdateSetting("morning", "hour", parseInt(e.target.value))}
                style={{ background: "rgba(253,250,244,0.1)", color: "#FDFAF4", border: "none", borderRadius: "4px", padding: "0.3rem 0.5rem" }}
              >
                {Array.from({ length: 24 }, (_, i) => (
                  <option key={i} value={i} style={{ color: "#333" }}>{i.toString().padStart(2, "0")}</option>
                ))}
              </select>
              <span>:</span>
              <select
                value={settings.morning.minute}
                onChange={(e) => handleUpdateSetting("morning", "minute", parseInt(e.target.value))}
                style={{ background: "rgba(253,250,244,0.1)", color: "#FDFAF4", border: "none", borderRadius: "4px", padding: "0.3rem 0.5rem" }}
              >
                {[0, 15, 30, 45].map((m) => (
                  <option key={m} value={m} style={{ color: "#333" }}>{m.toString().padStart(2, "0")}</option>
                ))}
              </select>
            </div>
            <button
              onClick={() => handleTest("morning")}
              style={{ 
                marginLeft: "auto", 
                fontSize: "0.7rem", 
                background: "none", 
                border: "1px solid rgba(253,250,244,0.2)", 
                color: "rgba(253,250,244,0.6)", 
                padding: "0.3rem 0.7rem", 
                borderRadius: "15px", 
                cursor: "pointer",
                transition: "all 0.2s"
              }}
              onMouseOver={(e) => (e.currentTarget.style.borderColor = "rgba(253,250,244,0.5)")}
              onMouseOut={(e) => (e.currentTarget.style.borderColor = "rgba(253,250,244,0.2)")}
            >
              テスト送信
            </button>
          </div>
        </div>

        {/* Evening / Hina */}
        <div style={{ 
          padding: "1rem", 
          backgroundColor: "rgba(253, 250, 244, 0.03)", 
          borderRadius: "12px",
          border: "1px solid rgba(253, 250, 244, 0.05)"
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.8rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <span style={{ fontSize: "1.2rem" }}>🌙</span>
              <span style={{ fontWeight: "bold", fontSize: "0.9rem" }}>夜の通知 (陽菜)</span>
            </div>
            <input
              type="checkbox"
              checked={settings.evening.enabled}
              onChange={(e) => handleUpdateSetting("evening", "enabled", e.target.checked)}
              style={{ accentColor: "#4A6741" }}
            />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.8rem", fontSize: "0.9rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
              <select
                value={settings.evening.hour}
                onChange={(e) => handleUpdateSetting("evening", "hour", parseInt(e.target.value))}
                style={{ background: "rgba(253,250,244,0.1)", color: "#FDFAF4", border: "none", borderRadius: "4px", padding: "0.3rem 0.5rem" }}
              >
                {Array.from({ length: 24 }, (_, i) => (
                  <option key={i} value={i} style={{ color: "#333" }}>{i.toString().padStart(2, "0")}</option>
                ))}
              </select>
              <span>:</span>
              <select
                value={settings.evening.minute}
                onChange={(e) => handleUpdateSetting("evening", "minute", parseInt(e.target.value))}
                style={{ background: "rgba(253,250,244,0.1)", color: "#FDFAF4", border: "none", borderRadius: "4px", padding: "0.3rem 0.5rem" }}
              >
                {[0, 15, 30, 45].map((m) => (
                  <option key={m} value={m} style={{ color: "#333" }}>{m.toString().padStart(2, "0")}</option>
                ))}
              </select>
            </div>
            <button
              onClick={() => handleTest("evening")}
              style={{ 
                marginLeft: "auto", 
                fontSize: "0.7rem", 
                background: "none", 
                border: "1px solid rgba(253,250,244,0.2)", 
                color: "rgba(253,250,244,0.6)", 
                padding: "0.3rem 0.7rem", 
                borderRadius: "15px", 
                cursor: "pointer",
                transition: "all 0.2s"
              }}
              onMouseOver={(e) => (e.currentTarget.style.borderColor = "rgba(253,250,244,0.5)")}
              onMouseOut={(e) => (e.currentTarget.style.borderColor = "rgba(253,250,244,0.2)")}
            >
              テスト送信
            </button>
          </div>
        </div>

        <button
          onClick={handleSaveAndSync}
          disabled={isSaving || !settings.enabled}
          style={{
            backgroundColor: settings.enabled ? "#FDFAF4" : "rgba(253,250,244,0.2)",
            color: settings.enabled ? "#1A1A1A" : "rgba(253,250,244,0.4)",
            border: "none",
            padding: "0.9rem",
            borderRadius: "12px",
            fontWeight: "bold",
            fontSize: "0.9rem",
            cursor: (isSaving || !settings.enabled) ? "not-allowed" : "pointer",
            marginTop: "0.5rem",
            transition: "all 0.2s"
          }}
        >
          {isSaving ? "同期中..." : "サーバーに設定を適用する"}
        </button>
      </div>

      {permission === "denied" && (
        <div style={{ marginTop: "1rem", color: "#FF6B6B", fontSize: "0.75rem", textAlign: "center", lineHeight: "1.4" }}>
          通知がブラウザ設定でブロックされています。<br />
          ブラウザの設定から許可を出してください。
        </div>
      )}
    </div>
  );
}
