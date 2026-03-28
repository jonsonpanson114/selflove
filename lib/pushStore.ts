// 購読情報を共有する簡易ストア
// 本番ではRedisやデータベースを使用

let subscriptions: PushSubscriptionJSON[] = [];

export function addSubscription(subscription: PushSubscriptionJSON): void {
  const existingIndex = subscriptions.findIndex(
    sub => sub.endpoint === subscription.endpoint
  );

  if (existingIndex === -1) {
    subscriptions.push(subscription);
    console.log('[Store] New subscription added, total:', subscriptions.length);
  } else {
    subscriptions[existingIndex] = subscription;
    console.log('[Store] Subscription updated');
  }
}

export function removeSubscription(endpoint: string): void {
  subscriptions = subscriptions.filter(sub => sub.endpoint !== endpoint);
  console.log('[Store] Subscription removed, remaining:', subscriptions.length);
}

export function getSubscriptions(): PushSubscriptionJSON[] {
  return subscriptions;
}

export function getSubscriptionCount(): number {
  return subscriptions.length;
}
