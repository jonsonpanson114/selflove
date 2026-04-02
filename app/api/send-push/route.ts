<<<<<<< HEAD
import { NextResponse } from 'next/server';
import webpush from 'web-push';
import { getRandomMessage } from '@/lib/notificationMessages';

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
    console.error('VAPID initialization failed:', error);
  }
}

export async function POST(req: Request) {
  try {
    const { type, subscription } = await req.json();

    if (!subscription) {
      return NextResponse.json({ error: 'Subscription is missing' }, { status: 400 });
    }

    if (type !== 'morning' && type !== 'evening') {
      return NextResponse.json({ error: 'Invalid notification type' }, { status: 400 });
    }

    // 朝ならソラ、夜ならハル
    const character = type === 'morning' ? 'sora' : 'haru';
    const message = getRandomMessage(character as 'sora' | 'haru', type);

    const pushSubscription = typeof subscription === 'string' ? JSON.parse(subscription) : subscription;
    
    // URLパラメータを設定して、アプリを開いた際にメッセージを出せるようにする
    const notificationUrl = `/?character=${character}&time=${type}`;

    await webpush.sendNotification(
      pushSubscription,
      JSON.stringify({
        title: message.title,
        body: message.body,
        url: notificationUrl
      })
    );

    return NextResponse.json({ ok: true, character, message });
  } catch (error) {
    console.error('Send push failed:', error);
    return NextResponse.json({ error: 'Failed to send push' }, { status: 500 });
=======
import { NextRequest, NextResponse } from 'next/server';
import webpush from 'web-push';
import { getSubscriptions, removeSubscription } from '@/lib/pushStore';

// VAPID設定
const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '';
const privateKey = process.env.VAPID_PRIVATE_KEY || '';

if (publicKey && privateKey) {
  webpush.setVapidDetails(
    'mailto:selflove@example.com',
    publicKey,
    privateKey
  );
}

export async function POST(request: NextRequest) {
  // 認証チェック
  const authToken = request.headers.get('x-auth-token');
  const validToken = process.env.PUSH_AUTH_TOKEN;

  if (!validToken || authToken !== validToken) {
    console.warn('[API] Unauthorized push attempt');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { title, body } = await request.json();

    if (!title) {
      return NextResponse.json({ error: 'Missing title' }, { status: 400 });
    }

    const subscriptions = getSubscriptions();

    // 全購読者にプッシュ通知
    const results = await Promise.allSettled(
      subscriptions.map(async (sub) => {
        try {
          await webpush.sendNotification(
            sub as any,
            JSON.stringify({ title, body })
          );
          return { success: true, endpoint: sub.endpoint };
        } catch (error: any) {
          // 無効な購読を削除
          if (error.statusCode === 404 || error.statusCode === 410) {
            if (sub.endpoint) {
              removeSubscription(sub.endpoint);
            }
          }
          return { success: false, endpoint: sub.endpoint, error: error.message };
        }
      })
    );

    const successes = results.filter(r =>
      r.status === 'fulfilled' && r.value.success
    ).length;

    console.log(`[API] Push notification sent to ${successes}/${subscriptions.length} subscribers`);

    return NextResponse.json({
      ok: true,
      sent: successes,
      total: subscriptions.length
    });
  } catch (error) {
    console.error('[API] Push error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
>>>>>>> 9c28ec646ae94ca991f7dd4a35002bfb2cbcdda1
  }
}
