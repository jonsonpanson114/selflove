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
