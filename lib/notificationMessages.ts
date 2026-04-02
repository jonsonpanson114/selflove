type Character = 'sora' | 'haru';
type NotificationType = 'morning' | 'evening';

interface Message {
  title: string;
  body: string;
}

const messages: Record<Character, Record<NotificationType, Message[]>> = {
  sora: {
    morning: [
      { title: "ソラ: おはよう", body: "新しい朝が来ました。今日という日を、あなたらしく大切に過ごせますように。" },
      { title: "ソラ: 朝の挨拶", body: "おはようございます。温かい飲み物でも飲んで、ゆっくり一日を始めませんか？" },
      { title: "ソラ: 行ってらっしゃい", body: "今日も一日、あなたが心穏やかに過ごせるよう、遠い星から応援しています。" }
    ],
    evening: [
      { title: "ソラ: お疲れ様", body: "今日一日、本当にお疲れ様でした。今は自分をいたわって、ゆっくり休んでくださいね。" },
      { title: "ソラ: 夜のひととき", body: "夜も更けてきました。明日への不安は一度手放して、今の静けさを感じてみましょう。" }
    ]
  },
  haru: {
    morning: [
      { title: "ハル: おはよう", body: "無理しすぎなくて大丈夫だよ。まずは深呼吸して、自分のペースで歩き出そう。" },
      { title: "ハル: 朝だよ", body: "今日も君の味方でいるよ。何があっても、自分を責めないでいてね。" }
    ],
    evening: [
      { title: "ハル: おやすみ", body: "今日も一日頑張ったね。今は全部忘れて、深い眠りにつこう。おやすみなさい。" },
      { title: "ハル: 夜のメッセージ", body: "どんな一日だったとしても、君は君のままで素晴らしい。それを忘れないで。" },
      { title: "ハル: ゆっくり休んで", body: "また明日、新しい物語を紡ごう。今は目を閉じて、心を静める時間だよ。" }
    ]
  }
};

export function getRandomMessage(character: Character, type: NotificationType): Message {
  const charMessages = messages[character][type];
  const index = Math.floor(Math.random() * charMessages.length);
  return charMessages[index];
}
