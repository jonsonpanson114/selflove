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
            removeSubscription(sub.endpoint);
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
  }
}
