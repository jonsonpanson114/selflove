export interface NotificationSettings {
  enabled: boolean;
  morning: {
    enabled: boolean;
    hour: number;
    minute: number;
  };
  evening: {
    enabled: boolean;
    hour: number;
    minute: number;
  };
  permissionRequested: boolean;
}

export interface PushSubscriptionData {
  subscription: string; // JSON string of PushSubscription
  settings: {
    morningHour: number;
    morningMinute: number;
    morningEnabled: boolean;
    eveningHour: number;
    eveningMinute: number;
    eveningEnabled: boolean;
  };
}
