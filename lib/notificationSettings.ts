import { NotificationSettings } from "../types/notification";
export type { NotificationSettings };

const NOTIF_KEY = "selflove-notification-settings-v2";

const DEFAULT_SETTINGS: NotificationSettings = {
  enabled: false,
  morning: { enabled: true, hour: 8, minute: 0 },
  evening: { enabled: true, hour: 21, minute: 0 },
  permissionRequested: false,
};

export function getNotifSettings(): NotificationSettings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  try {
    const stored = localStorage.getItem(NOTIF_KEY);
    if (stored) return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
  } catch {
    // ignore
  }
  return DEFAULT_SETTINGS;
}

export function saveNotifSettings(settings: NotificationSettings): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(NOTIF_KEY, JSON.stringify(settings));
  } catch {
    // ignore
  }
}

/**
 * @deprecated Use Web Push instead for background notifications.
 * This is only kept for local immediate checks if needed.
 */
export function shouldShowNotification(
  settings: NotificationSettings,
  hasTodayEntry: boolean
): boolean {
  if (!settings.enabled || hasTodayEntry) return false;
  if (typeof window === "undefined") return false;
  
  const NotificationAPI = (window as any).Notification;
  if (!NotificationAPI) return false;
  if (NotificationAPI.permission !== "granted") return false;

  const now = new Date();
  
  // Morning check
  if (settings.morning.enabled) {
    const morningTime = new Date();
    morningTime.setHours(settings.morning.hour, settings.morning.minute, 0, 0);
    if (now >= morningTime && now.getHours() < 12) return true;
  }

  // Evening check
  if (settings.evening.enabled) {
    const eveningTime = new Date();
    eveningTime.setHours(settings.evening.hour, settings.evening.minute, 0, 0);
    if (now >= eveningTime && now.getHours() >= 12) return true;
  }

  return false;
}
