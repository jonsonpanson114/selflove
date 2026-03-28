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
export async function subscribeToPushNotifications(): Promise<PushSubscription | null> {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    console.warn('[Push] Browser does not support Push Notifications');
    return null;
  }

  try {
    // Service Workerの準備
    const registration = await navigator.serviceWorker.ready;

    // 既存の購読を確認
    let subscription = await registration.pushManager.getSubscription();

    const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    if (!publicKey) {
      throw new Error('NEXT_PUBLIC_VAPID_PUBLIC_KEY is missing');
    }

    // 新規購読の作成
    if (!subscription) {
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey)
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
