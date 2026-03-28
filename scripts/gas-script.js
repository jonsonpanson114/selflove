/**
 * Google Apps Script for selflove notifications
 * このファイルをGoogle Apps Scriptに貼り付けて使用してください
 */

// ====================
// 設定
// ====================
const CONFIG = {
  // あなたのVercelデプロイURLに変更してください
  API_ENDPOINT: 'https://your-project.vercel.app/api/send-push',

  // .env.localのPUSH_AUTH_TOKENと同じ値を設定
  AUTH_TOKEN: 'selflove-2026-push-auth-token-secure',

  // 通知時間
  NOTIFICATION_HOUR: 22,
  NOTIFICATION_MINUTE: 30
};

// ====================
// 主要関数
// ====================

/**
 * 毎日22:30に実行される関数（トリガーで設定）
 */
function sendDailyNotification() {
  const now = new Date();
  const hour = now.getHours();
  const minute = now.getMinutes();

  // 22:30±5分以内の場合のみ実行（重複実行防止）
  if (hour === CONFIG.NOTIFICATION_HOUR && Math.abs(minute - CONFIG.NOTIFICATION_MINUTE) <= 5) {
    console.log('Sending scheduled notification...');

    const response = sendPushNotification(
      'selflove: 新しい物語',
      'レン「やれやれ、新しい物語を書き始めたよ。君の今日の話を聞かせてくれないか？」'
    );

    console.log('Notification result:', response);
  } else {
    console.log('Not scheduled time yet. Current:', hour + ':' + minute);
  }
}

/**
 * プッシュ通知を送信する関数
 */
function sendPushNotification(title, body) {
  try {
    const response = UrlFetchApp.fetch(CONFIG.API_ENDPOINT, {
      method: 'post',
      contentType: 'application/json',
      headers: {
        'x-auth-token': CONFIG.AUTH_TOKEN
      },
      payload: JSON.stringify({
        title: title,
        body: body
      }),
      muteHttpExceptions: true
    });

    const responseCode = response.getResponseCode();
    const responseBody = response.getContentText();

    if (responseCode === 200) {
      console.log('✅ Notification sent successfully');
      console.log('Response:', responseBody);
      return { success: true, response: responseBody };
    } else {
      console.error('❌ Failed to send notification');
      console.error('Status:', responseCode);
      console.error('Body:', responseBody);
      return { success: false, error: responseBody };
    }
  } catch (error) {
    console.error('❌ Error sending notification:', error);
    return { success: false, error: error.toString() };
  }
}

// ====================
// テスト・デバッグ関数
// ====================

/**
 * 手動テスト用関数
 * GASエディタから直接実行してください
 */
function testNotification() {
  console.log('Sending test notification...');
  const result = sendPushNotification(
    'selflove: テスト通知',
    'レン「これはテスト通知です。通知が届いているかな？」'
  );
  console.log('Test result:', result);
  return result;
}

/**
 * 朝のテスト通知（7:00）
 */
function testMorningNotification() {
  const result = sendPushNotification(
    'selflove: おはよう',
    'レン「おはよう！新しい一日が始まるよ」'
  );
  return result;
}

/**
 * 設定確認用関数
 */
function checkConfig() {
  console.log('Current Configuration:');
  console.log('API Endpoint:', CONFIG.API_ENDPOINT);
  console.log('Auth Token:', CONFIG.AUTH_TOKEN ? 'Set' : 'NOT SET');
  console.log('Notification Time:', CONFIG.NOTIFICATION_HOUR + ':' + CONFIG.NOTIFICATION_MINUTE);
  return CONFIG;
}

// ====================
// トリガー管理関数
// ====================

/**
 * トリガーを一括削除
 */
function deleteAllTriggers() {
  const triggers = ScriptApp.getProjectTriggers();
  triggers.forEach(trigger => {
    ScriptApp.deleteTrigger(trigger);
  });
  console.log('Deleted ' + triggers.length + ' triggers');
}

/**
 * 22:30のトリガーを作成
 */
function createDailyTrigger() {
  // 既存のトリガーを削除
  deleteAllTriggers();

  // 新しいトリガーを作成
  ScriptApp.newTrigger('sendDailyNotification')
    .timeBased()
    .everyDays(1)
    .atHour(CONFIG.NOTIFICATION_HOUR)
    .nearMinute(CONFIG.NOTIFICATION_MINUTE)
    .create();

  console.log('Daily trigger created for ' + CONFIG.NOTIFICATION_HOUR + ':' + CONFIG.NOTIFICATION_MINUTE);
}

/**
 * トリガー状況を確認
 */
function listTriggers() {
  const triggers = ScriptApp.getProjectTriggers();
  console.log('Current triggers:');
  if (triggers.length === 0) {
    console.log('No triggers found');
  } else {
    triggers.forEach((trigger, index) => {
      console.log((index + 1) + ': ' + trigger.getHandlerFunction());
      console.log('   Type: ' + trigger.getTriggerSource());
      console.log('   ID: ' + trigger.getUniqueId());
    });
  }
  return triggers;
}
