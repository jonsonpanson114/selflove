# Google Apps Script 通知スケジュール設定ガイド

## 📋 概要

Google Apps Scriptを使用して、毎日22:30に自動的にプッシュ通知を送信します。

## 🔧 手順

### ステップ1: 新しいGoogle Apps Scriptプロジェクトを作成

1. [Google Apps Script](https://script.google.com/) にアクセス
2. 「新しいプロジェクト」をクリック
3. プロジェクト名に「selflove-notifications」と入力

### ステップ2: スクリプトを貼り付け

以下のコードを`コード.gs`に貼り付け：

```javascript
// 設定
const CONFIG = {
  // Vercel APIエンドポイント
  API_ENDPOINT: 'https://your-project.vercel.app/api/send-push',

  // 認証トークン（環境変数と同じもの）
  AUTH_TOKEN: 'your-auth-token-here',

  // 通知時間 (22:30)
  NOTIFICATION_HOUR: 22,
  NOTIFICATION_MINUTE: 30
};

/**
 * 毎日22:30に実行される関数
 */
function sendDailyNotification() {
  const now = new Date();
  const hour = now.getHours();
  const minute = now.getMinutes();

  // 22:30±5分以内の場合のみ実行（重複実行防止）
  if (hour === CONFIG.NOTIFICATION_HOUR && Math.abs(minute - CONFIG.NOTIFICATION_MINUTE) <= 5) {
    const response = sendPushNotification(
      'selflove: 新しい物語',
      'レン「やれやれ、新しい物語を書き始めたよ。君の今日の話を聞かせてくれないか？」'
    );

    console.log('Notification sent:', response);
  } else {
    console.log('Not scheduled time yet. Current:', hour + ':' + minute);
  }
}

/**
 * プッシュ通知を送信
 */
function sendPushNotification(title, body) {
  try {
    const response = UrlFetchApp.fetch(CONFIG.API_ENDPOINT, {
      method: 'post',
      contentType: 'application/json',
      payload: JSON.stringify({
        title: title,
        body: body,
        authToken: CONFIG.AUTH_TOKEN
      }),
      muteHttpExceptions: true
    });

    const responseCode = response.getResponseCode();
    const responseBody = response.getContentText();

    if (responseCode === 200) {
      console.log('✅ Notification sent successfully');
      return { success: true, response: responseBody };
    } else {
      console.error('❌ Failed to send notification:', responseCode, responseBody);
      return { success: false, error: responseBody };
    }
  } catch (error) {
    console.error('❌ Error sending notification:', error);
    return { success: false, error: error.toString() };
  }
}

/**
 * 手動テスト用関数
 */
function testNotification() {
  return sendPushNotification(
    'selflove: テスト通知',
    'レン「これはテスト通知です」'
  );
}

/**
 * スプレッドシートにログを保存（オプション）
 */
function logNotification(result) {
  const sheet = SpreadsheetApp.openById('YOUR_SPREADSHEET_ID').getSheetByName('Notifications');
  sheet.appendRow([
    new Date(),
    result.success ? 'SUCCESS' : 'FAILED',
    JSON.stringify(result)
  ]);
}
```

### ステップ3: 環境変数の設定

1. Vercelプロジェクトの環境変数を確認
2. `.env.local`ファイルの内容を確認
3. GASコード内の`CONFIG`を更新：

```javascript
const CONFIG = {
  // あなたのVercelデプロイURLに変更
  API_ENDPOINT: 'https://your-project.vercel.app/api/send-push',

  // .env.localから認証トークンをコピー
  AUTH_TOKEN: 'your-auth-token-here', // 後で設定
};
```

### ステップ4: 認証トークンを追加

`.env.local`に認証トークンを追加：

```bash
# 既存の設定に追加
PUSH_AUTH_TOKEN=your-random-auth-token-here
```

### ステップ5: APIエンドポイントの認証追加

`app/api/send-push/route.ts`に認証チェックを追加：

```typescript
export async function POST(request: NextRequest) {
  // 認証チェック
  const authToken = request.headers.get('x-auth-token');
  const validToken = process.env.PUSH_AUTH_TOKEN;

  if (authToken !== validToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // 既存の処理...
}
```

### ステップ6: トリガーを設定

1. GASエディタの左側の「トリガー」アイコンをクリック
2. 「トリガーを追加」をクリック
3. 以下の設定：

- **実行する関数**: `sendDailyNotification`
- **イベントソース**: **時間主導型**
- **時間ベースのトリガーのタイプ**: **日付ベースのタイマー**
- **時刻**: **午後10時〜11時**

4. 「保存」をクリック

### ステップ7: テスト

1. GASエディタで`testNotification`関数を実行
2. 通知が届くことを確認
3. 22:30前後に自動通知が来るのを待つ

## 📱 アプリ側の更新

1. `.env.local`の変更をデプロイ
2. Vercelに再デプロイ
3. アプリを開いて通知権限を確認

## 🔍 トラブルシューティング

### 通知が来ない場合

1. **GASの実行ログを確認**: 「実行数」タブでエラーをチェック
2. **APIエンドポイントのURLを確認**: VercelのデプロイURLが正しいか
3. **認証トークンを確認**: GASとVercelで同じトークンを使っているか
4. **トリガーの設定を確認**: 時間が正しく設定されているか

### GASのエラー

- `UrlFetchApp failed`: APIエンドポイントが間違っている
- `Authorization failed`: 認証トークンが間違っている
- `No subscribers`: まだ誰も通知を購読していない

## 🎯 完了後のチェックリスト

- [ ] GASプロジェクトを作成
- [ ] APIエンドポイントを設定
- [ ] 認証トークンを環境変数に追加
- [ ] APIに認証チェックを実装
- [ ] GASトリガーを22:30に設定
- [ ] テスト通知で動作確認
- [ ] 本番環境にデプロイ
