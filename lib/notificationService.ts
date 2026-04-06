import { NotificationSettings } from '../types/notification';

// VAPID公開鍵をUint8Arrayに変換
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

// プッシュ通知に購読する
export async function subscribeToPushNotifications(settings?: NotificationSettings): Promise<PushSubscription | null> {
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
        applicationServerKey: urlBase64ToUint8Array(publicKey) as BufferSource
      });
      console.log('[Push] New subscription created');
    } else {
      console.log('[Push] Existing subscription found');
    }

    // サーバーに購読情報を送信
    await sendSubscriptionToServer(subscription.toJSON() as any, settings);

    return subscription;
  } catch (error) {
    console.error('[Push] Subscription failed:', error);
    return null;
  }
}

// サーバーに購読情報を送信
async function sendSubscriptionToServer(subscription: PushSubscription, settings?: NotificationSettings): Promise<void> {
  try {
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

    console.log('[Push] Subscription saved to server');
  } catch (error) {
    console.error('[Push] Failed to save subscription:', error);
    throw error;
  }
}

// 通知権限をリクエスト
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) {
    console.warn('[Push] Notification API not available');
    return 'denied';
  }

  if (Notification.permission === 'granted') {
    return 'granted';
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission;
  }

  return 'denied';
}

// テスト通知を送信
export const testPushNotification = async (type: 'morning' | 'evening') => {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return null;

  try {
    const registration = await navigator.serviceWorker.ready;
    let subscription = await registration.pushManager.getSubscription();

    // 購読情報がない場合、自動的に購読を試みる（権限があることが前提）
    if (!subscription) {
      console.log('[Push] No subscription found, attempting auto-subscribe...');
      subscription = await subscribeToPushNotifications();
    }

    if (!subscription) {
      throw new Error('No active subscription found');
    }

    const response = await fetch('/api/send-push', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type,
        subscription: JSON.stringify(subscription.toJSON())

      }),
    });

    if (!response.ok) {
      throw new Error('Test push failed');
    }

    return await response.json();
  } catch (error) {
    console.error('Test push failed:', error);
    return null;
  }
};

