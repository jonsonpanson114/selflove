type Character = 'ren' | 'hina';
type NotificationType = 'morning' | 'evening';

interface Message {
  title: string;
  body: string;
}

const messages: Record<Character, Record<NotificationType, Message[]>> = {
  ren: {
    morning: [
      { title: "レン: おはよう", body: "新しい一日が始まるよ。今日も君のペースで、ゆっくり歩き出そう。" },
      { title: "レン: 朝の挨拶", body: "おはよう。太陽の光が君を優しく包むように祈っているよ。" },
      { title: "レン: 行ってらっしゃい", body: "何があっても、応援しているからね。自分を大切に過ごして。" }
    ],
    evening: [
      { title: "レン: お疲れ様", body: "今日一日、本当によく頑張ったね。今は全部忘れて、ゆっくり休んで。" },
      { title: "レン: 夜のひととき", body: "静かな夜。今日はお前のために、穏やかな時間を過ごしてほしいな。" }
    ]
  },
  hina: {
    morning: [
      { title: "陽菜: おはよう", body: "朝だよ！無理しすぎなくて大丈夫。まずは深呼吸から始めよう。" },
      { title: "陽菜: 朝のメッセージ", body: "おはよう。今日もあなたの味方でいるわ。自分を責めないでね。" }
    ],
    evening: [
      { title: "陽菜: おやすみ", body: "一日お疲れ様。今は心も体も解放して、深い眠りにつけるといいわね。" },
      { title: "陽菜: 夜の静けさ", body: "どんな一日だったとしても、あなたはあなたのままで素晴らしい。それを忘れないで。" },
      { title: "陽菜: ゆっくり休んで", body: "また明日、新しいページを捲りましょう。おやすみなさい。" }
    ]
  }
};

export function getRandomMessage(character: Character, type: NotificationType): Message {
  const charMessages = messages[character] ? messages[character][type] : null;
  if (!charMessages) {
    // フォールバック
    return { title: "SelfLove", body: "新しい物語が待っています。" };
  }
  const index = Math.floor(Math.random() * charMessages.length);
  return charMessages[index];
}
