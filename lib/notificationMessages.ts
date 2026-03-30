export const notificationMessages = {
  sora: {
    morning: [
      { title: "おはよう", body: "ユウも起きたし、コーヒーを淹れたところ。今日の物語、少し書いてみない？" },
      { title: "朝の空", body: "ユウが空を見て、きれいだねって。君の今日という空も、記録に残してみないかな？" },
    ],
    evening: [
      { title: "夜の静寂", body: "家の中がやっと静かになった。君の今日という物語を、そっと残しておこう。" },
      { title: "やれやれ", body: "翻訳がようやく一行進んだ。君の今日という一ページも、書き終えてから眠らないかい？" },
    ]
  },
  haru: {
    morning: [
      { title: "おはよ！", body: "ねえ、もう朝だよ。猫に起こされた。昨日の続き、忘れてないよね？" },
      { title: "出勤前", body: "砂漠に水を撒くみたいに、物語も毎日続けないとね。準備はいいかな？" },
    ],
    evening: [
      { title: "お疲れ様", body: "ふー、やっと一日が終わったね。今日の伏線、ちゃんと回収できたかな？" },
      { title: "寝る前に", body: "寝る前にさ、今日の物語を書いてよ。じゃないと、明日が始められないだろ？" },
    ]
  }
};

export const getRandomMessage = (character: 'sora' | 'haru', time: 'morning' | 'evening') => {
  const messages = notificationMessages[character][time];
  return messages[Math.floor(Math.random() * messages.length)];
};
