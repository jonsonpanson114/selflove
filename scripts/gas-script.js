/**
 * Google Apps Script (GAS) 用プッシュ通知管理スクリプト
 * 
 * 役割:
 * 1. Webアプリからの購読情報 (PushSubscription) をスプレッドシートに保存
 * 2. 1分ごとのトリガーで実行され、各ユーザーの指定時間にVercel APIを叩いて通知を送信
 */

// --- 設定項目 ---
// .env.local の GAS_AUTH_TOKEN と一致させる
const AUTH_TOKEN = "selflove-2026-push-auth-token-secure";
// 自身の Vercel URL
const VERCEL_APP_URL = "https://orbital-rosette.vercel.app";
// send-push API への認証トークン (Vercelの PUSH_AUTH_TOKEN と一致させる)
const PUSH_API_TOKEN = "selflove-2026-push-auth-token-secure";
// ----------------

/**
 * Webアプリからのリクエストを受け取る (doPost)
 */
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

/**
 * 購読情報をスプレッドシートに保存
 */
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
  }
}

/**
 * 1分ごとのトリガーで実行し、通知を送るべきユーザーをチェック
 */
function checkAndSendNotifications() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName("Subscriptions");
  if (!sheet) return;
  
  const data = sheet.getDataRange().getValues();
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  
  console.log(`Checking notifications for ${currentHour}:${currentMinute}`);
  
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

/**
 * Vercel の API を叩いてプッシュ通知を送信
 */
function sendToVercel(subscription, type) {
  const url = `${VERCEL_APP_URL}/api/send-push`;
  const options = {
    method: "post",
    contentType: "application/json",
    headers: {
      "x-auth-token": PUSH_API_TOKEN
    },
    payload: JSON.stringify({
      type: type,
      subscription: subscription
    }),
    muteHttpExceptions: true
  };
  
  try {
    const response = UrlFetchApp.fetch(url, options);
    console.log(`Sent ${type} to ${url}. Status: ${response.getResponseCode()}`);
  } catch (e) {
    console.error(`Failed to send to ${url}: ${e}`);
  }
}

/**
 * JSON レスポンスを生成
 */
function response(obj, code = 200) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * 初期設定用：1分ごとのトリガーを作成
 */
function setupTrigger() {
  // 既存のトリガーを削除
  const triggers = ScriptApp.getProjectTriggers();
  triggers.forEach(t => ScriptApp.deleteTrigger(t));
  
  // 新しいトリガーを作成
  ScriptApp.newTrigger('checkAndSendNotifications')
    .timeBased()
    .everyMinutes(1)
    .create();
  
  console.log("Trigger created successfully.");
}
