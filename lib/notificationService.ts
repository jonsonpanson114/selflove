import { NotificationSettings } from '../types/notification';

const urlBase64ToUint8Array = (base64String: string) => {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
};

export const subscribeToPushNotifications = async (settings?: NotificationSettings) => {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator) || !('PushManager' in window)) {
    console.warn('[Push] Browser does not support Push Notifications');
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    let subscription = await registration.pushManager.getSubscription();

    const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    if (!publicKey) {
      throw new Error('NEXT_PUBLIC_VAPID_PUBLIC_KEY is missing');
    }

    if (!subscription) {
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey)
      });
    }

    await sendSubscriptionToServer(subscription, settings);
    return subscription;
  } catch (error) {
    console.error('Subscription failed:', error);
    return null;
  }
};

const sendSubscriptionToServer = async (subscription: PushSubscription, settings?: NotificationSettings) => {
  const response = await fetch('/api/push-subscription', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      subscription: JSON.stringify(subscription),
      settings: settings ? {
        morningHour: settings.morning.hour,
        morningMinute: settings.morning.minute,
        morningEnabled: settings.morning.enabled,
        eveningHour: settings.evening.hour,
        eveningMinute: settings.evening.minute,
        eveningEnabled: settings.evening.enabled,
      } : undefined
    }),
  });

  if (!response.ok) {
    throw new Error('Server response error');
  }
};
