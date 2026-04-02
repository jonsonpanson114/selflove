import { NextRequest, NextResponse } from 'next/server';
import { addSubscription, getSubscriptions } from '@/lib/pushStore';

export async function POST(request: NextRequest) {
  try {
    const { subscription, settings } = await request.json();

    if (!subscription) {
      return NextResponse.json({ error: 'Missing subscription' }, { status: 400 });
    }

    // 1. ローカルメモリストアに保存 (send-push API用)
    const subObj = typeof subscription === 'string' ? JSON.parse(subscription) : subscription;
    addSubscription(subObj);

    // 2. GASに転送 (スケジュール通知用)
    const gasUrl = process.env.GAS_URL;
    const gasAuthToken = process.env.GAS_AUTH_TOKEN;

    if (gasUrl) {
      try {
        await fetch(gasUrl, {
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
        console.log('[API] Subscription forwarded to GAS');
      } catch (gasError) {
        console.warn('[API] Failed to forward to GAS:', gasError);
        // GAS転送失敗でも、ローカル保存ができていればOKとする
      }
    }

    return NextResponse.json({
      ok: true,
      count: getSubscriptions().length
    });
  } catch (error) {
    console.error('[API] Subscription error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

// 購読情報を取得（テスト・デバッグ用）
export async function GET() {
  return NextResponse.json({
    subscriptions: getSubscriptions().map(s => ({ endpoint: s.endpoint }))
  });
}


