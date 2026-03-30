import { NextResponse } from 'next/server';
import webpush from 'web-push';
import { getRandomMessage } from '@/lib/notificationMessages';

const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '';
const privateKey = process.env.VAPID_PRIVATE_KEY || '';

if (publicKey && privateKey) {
  webpush.setVapidDetails(
    'mailto:jonso@example.com',
    publicKey,
    privateKey
  );
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
  }
}
