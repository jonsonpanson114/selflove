import { NextRequest, NextResponse } from 'next/server';
import webpush from 'web-push';
import { getRandomMessage } from '@/lib/notificationMessages';
import { getSubscriptions, removeSubscription } from '@/lib/pushStore';

// VAPID設定 (引用符の除去ガード付き)
const publicKey = (process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '').replace(/['"]/g, '');
const privateKey = (process.env.VAPID_PRIVATE_KEY || '').replace(/['"]/g, '');

if (publicKey && privateKey) {
  try {
    webpush.setVapidDetails(
      'mailto:jonso@example.com',
      publicKey,
      privateKey
    );
  } catch (error) {
    console.error('[VAPID] Initialization failed:', error);
  }
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { type, subscription, title, body: messageBody } = body;

  // ケース1: フロントエンドからのテスト送信 (type & subscription がある場合)
  if (type && subscription) {
    try {
      const character = type === 'morning' ? 'sora' : 'haru';
      const message = getRandomMessage(character as 'sora' | 'haru', type);
      const pushSubscription = typeof subscription === 'string' ? JSON.parse(subscription) : subscription;
      
      await webpush.sendNotification(
        pushSubscription,
        JSON.stringify({
          title: message.title,
          body: message.body,
          url: `/?character=${character}&time=${type}`
        })
      );
      return NextResponse.json({ ok: true, character, message });
    } catch (error) {
      console.error('[API] Test push failed:', error);
      return NextResponse.json({ error: 'Test push failed' }, { status: 500 });
    }
  }

  // ケース2: GASからの一斉送信 (title & x-auth-token がある場合)
  const authToken = request.headers.get('x-auth-token');
  const validToken = process.env.PUSH_AUTH_TOKEN;

  if (!validToken || authToken !== validToken) {
    console.warn('[API] Unauthorized push attempt');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!title) {
    return NextResponse.json({ error: 'Missing title/type' }, { status: 400 });
  }

  try {
    const subscriptions = getSubscriptions();
    const results = await Promise.allSettled(
      subscriptions.map(async (sub) => {
        try {
          await webpush.sendNotification(
            sub as any,
            JSON.stringify({ title, body: messageBody })
          );
          return { success: true, endpoint: sub.endpoint };
        } catch (error: any) {
          if (error.statusCode === 404 || error.statusCode === 410) {
            if (sub.endpoint) removeSubscription(sub.endpoint);
          }
          return { success: false, endpoint: sub.endpoint, error: error.message };
        }
      })
    );

    const successes = results.filter(r => r.status === 'fulfilled' && (r.value as any).success).length;
    console.log(`[API] Broadcast sent to ${successes}/${subscriptions.length} subscribers`);

    return NextResponse.json({ ok: true, sent: successes, total: subscriptions.length });
  } catch (error) {
    console.error('[API] Broadcast error:', error);
    return NextResponse.json({ error: 'Broadcast failed' }, { status: 500 });
  }
}


