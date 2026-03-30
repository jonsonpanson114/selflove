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
