/**
<<<<<<< HEAD
 * Google Apps Script (GAS) 用プッシュ通知管理スクリプト
 * 
 * 役割:
 * 1. Webアプリからの購読情報 (PushSubscription) をスプレッドシートに保存
 * 2. 1分ごとのトリガーで実行され、各ユーザーの指定時間にVercel APIを叩いて通知を送信
 */

// --- 設定項目 ---
const AUTH_TOKEN = "selflove-2026-push-auth-token-secure"; // .env.local の GAS_AUTH_TOKEN と一致させる
const VERCEL_APP_URL = "https://orbital-rosette.vercel.app"; // 自身の Vercel URL
// ----------------

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    
    // 認証チェック
    if (data.auth_token !== AUTH_TOKEN) {
      return response({ error: "Unauthorized" }, 401);
    }
    
    if (data.action === "subscribe") {
      saveSubscription(data.subscription, data.settings);
      return response({ ok: true });
    }
    
    return response({ error: "Invalid action" }, 400);
  } catch (error) {
    return response({ error: error.toString() }, 500);
  }
}

function saveSubscription(subscriptionStr, settings) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName("Subscriptions");
  if (!sheet) {
    sheet = ss.insertSheet("Subscriptions");
    sheet.appendRow(["Endpoint", "SubscriptionJSON", "MorningEnabled", "MorningHour", "MorningMinute", "EveningEnabled", "EveningHour", "EveningMinute", "LastUpdated"]);
  }
  
  const data = sheet.getDataRange().getValues();
  const subObj = JSON.parse(subscriptionStr);
  const endpoint = subObj.endpoint;
  
  let rowIdx = -1;
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === endpoint) {
      rowIdx = i + 1;
      break;
    }
  }
  
  const now = new Date();
  const rowData = [
    endpoint, 
    subscriptionStr, 
    settings.morningEnabled, 
    settings.morningHour, 
    settings.morningMinute,
    settings.eveningEnabled, 
    settings.eveningHour, 
    settings.eveningMinute,
    now
  ];
  
  if (rowIdx > 0) {
    sheet.getRange(rowIdx, 1, 1, rowData.length).setValues([rowData]);
  } else {
    sheet.appendRow(rowData);
=======
 * Google Apps Script for selflove notifications
 * このファイルをGoogle Apps Scriptに貼り付けて使用してください
 */

// ====================
// 設定
// ====================
const CONFIG = {
  // VercelデプロイURL
  API_ENDPOINT: 'https://orbital-rosette.vercel.app/api/send-push',

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
    console.log('Sending evening notification...');

    const response = sendPushNotification(
      'selflove: 新しい物語',
      'レン「やれやれ、新しい物語を書き始めたよ。君の今日の話を聞かせてくれないか？」'
    );

    console.log('Evening notification result:', response);
  } else {
    console.log('Not scheduled time yet. Current:', hour + ':' + minute);
>>>>>>> 9c28ec646ae94ca991f7dd4a35002bfb2cbcdda1
  }
}

/**
<<<<<<< HEAD
 * 1分ごとのトリガーで実行する関数
 */
function checkAndSendNotifications() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName("Subscriptions");
  if (!sheet) return;
  
  const data = sheet.getDataRange().getValues();
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  
  Logger.log(`Checking notifications for ${currentHour}:${currentMinute}`);
  
  for (let i = 1; i < data.length; i++) {
    const [endpoint, subscription, mEnabled, mHour, mMin, eEnabled, eHour, eMin] = data[i];
    
    // 朝の通知チェック
    if (mEnabled && mHour == currentHour && mMin == currentMinute) {
      sendToVercel(subscription, "morning");
    }
    
    // 夜の通知チェック
    if (eEnabled && eHour == currentHour && eMin == currentMinute) {
      sendToVercel(subscription, "evening");
    }
  }
}

function sendToVercel(subscription, type) {
  const url = `${VERCEL_APP_URL}/api/send-push`;
  const options = {
    method: "post",
    contentType: "application/json",
    payload: JSON.stringify({
      type: type,
      subscription: subscription
    }),
    muteHttpExceptions: true
  };
  
  try {
    const response = UrlFetchApp.fetch(url, options);
    Logger.log(`Sent ${type} to ${url}. Status: ${response.getResponseCode()}`);
  } catch (e) {
    Logger.log(`Failed to send to ${url}: ${e}`);
  }
}

function response(obj, code = 200) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
=======
 * 毎朝7:00に実行される関数（トリガーで設定）
 */
function sendMorningNotification() {
  const now = new Date();
  const hour = now.getHours();
  const minute = now.getMinutes();

  // 7:00±5分以内の場合のみ実行（重複実行防止）
  if (hour === 7 && Math.abs(minute - 0) <= 5) {
    console.log('Sending morning notification...');

    const response = sendPushNotification(
      'selflove: おはよう',
      'レン「おはよう！新しい一日が始まるよ。今日も一緒に物語を紡ごう」'
    );

    console.log('Morning notification result:', response);
  } else {
    console.log('Not morning time yet. Current:', hour + ':' + minute);
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
 * 手動テスト用関数（夜）
 * GASエディタから直接実行してください
 */
function testNotification() {
  console.log('Sending evening test notification...');
  const result = sendPushNotification(
    'selflove: テスト通知（夜）',
    'レン「これは夜のテスト通知です」'
  );
  console.log('Test result:', result);
  return result;
}

/**
 * 朝のテスト通知
 */
function testMorningNotification() {
  console.log('Sending morning test notification...');
  const result = sendPushNotification(
    'selflove: テスト通知（朝）',
    'レン「おはよう！朝のテスト通知です」'
  );
  console.log('Test result:', result);
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
 * 朝7:00と夜22:30のトリガーを作成
 */
function createDailyTrigger() {
  // 既存のトリガーを削除
  deleteAllTriggers();

  // 朝7:00のトリガーを作成
  ScriptApp.newTrigger('sendMorningNotification')
    .timeBased()
    .everyDays(1)
    .atHour(7)
    .nearMinute(0)
    .create();

  console.log('Morning trigger created for 7:00');

  // 夜22:30のトリガーを作成
  ScriptApp.newTrigger('sendDailyNotification')
    .timeBased()
    .everyDays(1)
    .atHour(CONFIG.NOTIFICATION_HOUR)
    .nearMinute(CONFIG.NOTIFICATION_MINUTE)
    .create();

  console.log('Evening trigger created for ' + CONFIG.NOTIFICATION_HOUR + ':' + CONFIG.NOTIFICATION_MINUTE);
  console.log('Both triggers created successfully!');
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
>>>>>>> 9c28ec646ae94ca991f7dd4a35002bfb2cbcdda1
}
