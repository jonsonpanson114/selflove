<<<<<<< HEAD
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { subscription, settings } = await req.json();

    const gasUrl = process.env.GAS_URL;
    const gasAuthToken = process.env.GAS_AUTH_TOKEN;

    if (!gasUrl) {
      console.error('GAS_URL is missing');
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    const response = await fetch(gasUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        auth_token: gasAuthToken,
        app_name: 'selflove',
        action: 'subscribe',
        subscription: subscription,
        settings: settings,
      }),
    });

    if (!response.ok) {
      throw new Error(`GAS response error: ${response.statusText}`);
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Push subscription failed:', error);
    return NextResponse.json({ error: 'Failed to subscribe' }, { status: 500 });
  }
}
=======
import { NextRequest, NextResponse } from 'next/server';
import webpush from 'web-push';
import { addSubscription, getSubscriptions } from '@/lib/pushStore';

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
    const { subscription } = await request.json();

    if (!subscription) {
      return NextResponse.json({ error: 'Missing subscription' }, { status: 400 });
    }

    // 購読情報を保存
    addSubscription(subscription);

    return NextResponse.json({
      ok: true,
      count: getSubscriptions().length
    });
  } catch (error) {
    console.error('[API] Subscription error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

// 購読情報を取得（テスト用）
export async function GET() {
  return NextResponse.json({
    subscriptions: getSubscriptions().map(s => ({ endpoint: s.endpoint }))
  });
}
>>>>>>> 9c28ec646ae94ca991f7dd4a35002bfb2cbcdda1
