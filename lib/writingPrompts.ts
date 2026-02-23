export const writingPrompts: string[] = [
  "今日、少しだけ嬉しかったことは何ですか？",
  "最近、心に残っている誰かの言葉はありますか？",
  "今の自分に「お疲れさま」と言いたいことはありますか？",
  "今日、体が感じていることを教えてください。",
  "最近、避けてきたことがあるとしたら？",
  "今の気持ちを色に例えるとしたら、どんな色ですか？",
  "今日、誰かに感謝したいことはありますか？",
  "ここ最近で、ちょっとだけ頑張れたことは何ですか？",
  "今、一番自分に必要だと感じているものは何ですか？",
  "最近、自分らしいと感じた瞬間はありましたか？",
  "今日の空や天気は、どんな気持ちに似ていましたか？",
  "もし明日の自分に手紙を書くとしたら、何を伝えますか？",
  "最近、小さな楽しみを見つけましたか？",
  "今の自分を動物に例えるとしたら、どんな動物ですか？",
  "今日、誰かに話せなかったことはありますか？",
];

export function getRandomPromptIndex(): number {
  return Math.floor(Math.random() * writingPrompts.length);
}

export function getNextPromptIndex(current: number): number {
  return (current + 1) % writingPrompts.length;
}
