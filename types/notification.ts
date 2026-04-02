export interface NotificationTime {
  enabled: boolean;
  hour: number;
  minute: number;
}

export interface NotificationSettings {
  enabled: boolean;
  morning: NotificationTime;
  evening: NotificationTime;
  permissionRequested: boolean;
}
