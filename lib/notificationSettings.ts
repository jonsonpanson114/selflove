export interface NotificationSettings {
  enabled: boolean;
  time: string; // "HH:MM" format, e.g. "21:00"
}

const NOTIF_KEY = "selflove-notification-settings";

const DEFAULT_SETTINGS: NotificationSettings = {
  enabled: false,
  time: "21:00",
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
  try {
    localStorage.setItem(NOTIF_KEY, JSON.stringify(settings));
  } catch {
    // ignore
  }
}

export function shouldShowNotification(
  settings: NotificationSettings,
  hasTodayEntry: boolean
): boolean {
  if (!settings.enabled || hasTodayEntry) return false;
  if (typeof Notification === "undefined") return false;
  if (Notification.permission !== "granted") return false;

  const now = new Date();
  const [h, m] = settings.time.split(":").map(Number);
  const reminderTime = new Date();
  reminderTime.setHours(h, m, 0, 0);

  return now >= reminderTime;
}
