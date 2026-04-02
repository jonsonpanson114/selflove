<<<<<<< HEAD
import { NotificationSettings } from '../types/notification';

const urlBase64ToUint8Array = (base64String: string) => {
=======
// VAPID公開鍵をUint8Arrayに変換
function urlBase64ToUint8Array(base64String: string): Uint8Array {
>>>>>>> 9c28ec646ae94ca991f7dd4a35002bfb2cbcdda1
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
<<<<<<< HEAD
};

export const subscribeToPushNotifications = async (settings?: NotificationSettings) => {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator) || !('PushManager' in window)) {
=======
}

// プッシュ通知に購読する
export async function subscribeToPushNotifications(): Promise<PushSubscription | null> {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
>>>>>>> 9c28ec646ae94ca991f7dd4a35002bfb2cbcdda1
    console.warn('[Push] Browser does not support Push Notifications');
    return null;
  }

  try {
<<<<<<< HEAD
    const registration = await navigator.serviceWorker.ready;
=======
    // Service Workerの準備
    const registration = await navigator.serviceWorker.ready;

    // 既存の購読を確認
>>>>>>> 9c28ec646ae94ca991f7dd4a35002bfb2cbcdda1
    let subscription = await registration.pushManager.getSubscription();

    const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    if (!publicKey) {
      throw new Error('NEXT_PUBLIC_VAPID_PUBLIC_KEY is missing');
    }

<<<<<<< HEAD
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

export const testPushNotification = async (type: 'morning' | 'evening') => {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return null;

  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();

    if (!subscription) {
      throw new Error('No active subscription found');
    }

    const response = await fetch('/api/send-push', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type,
        subscription: JSON.stringify(subscription)
      }),
    });

    return await response.json();
  } catch (error) {
    console.error('Test push failed:', error);
    return null;
  }
};
=======
    // 新規購読の作成
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
    await sendSubscriptionToServer(subscription);
    return subscription;
  } catch (error) {
    console.error('[Push] Subscription failed:', error);
    return null;
  }
}

// サーバーに購読情報を送信
async function sendSubscriptionToServer(subscription: PushSubscription): Promise<void> {
  try {
    const response = await fetch('/api/push-subscription', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        subscription: subscription.toJSON(),
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
>>>>>>> 9c28ec646ae94ca991f7dd4a35002bfb2cbcdda1
