export interface BreathingScene {
  id: string;
  title: string;
  setting: string;
  phases: {
    inhale: string;
    hold: string;
    exhale: string;
    holdAfter: string;
  };
  closing: string;
}

export const breathingScenes: BreathingScene[] = [
  {
    id: "forest",
    title: "森の中で",
    setting:
      "あなたは静かな森の中にいます。木漏れ日が足元にこぼれ、どこかで小鳥が鳴いています。風が葉を揺らすたびに、緑の香りが漂ってきます。",
    phases: {
      inhale: "ゆっくりと、息を吸い込んでください。森の冷たい空気が、あなたの体の奥まで満ちていきます。",
      hold: "止めて。今、あなたはここにいます。静かな森があなたを包んでいます。",
      exhale: "ゆっくりと、吐き出してください。重さが少しずつ、地面に溶けていきます。",
      holdAfter: "静かに待って。次の息を感じています。木々があなたとともにいます。",
    },
    closing:
      "セッションが終わりました。あなたは少し軽くなった気がします。森の静けさを、心の中に持ち帰ってください。",
  },
  {
    id: "ocean",
    title: "海のほとりで",
    setting:
      "あなたは波打ち際に座っています。海は穏やかで、波が規則正しく砂浜に打ち寄せます。潮の香りが鼻をくすぐり、遠くに水平線が広がっています。",
    phases: {
      inhale: "波が寄せるように、息をゆっくり吸い込んでください。海の空気が、胸を満たします。",
      hold: "止めて。波が頂点に達しています。あなたはここにいます。",
      exhale: "波が引くように、ゆっくりと吐き出してください。心の重さが、沖へと流れていきます。",
      holdAfter: "静かに待って。次の波を感じています。",
    },
    closing:
      "セッションが終わりました。海の静けさが、あなたの中に残っています。今日も、自分をいたわってください。",
  },
  {
    id: "morning",
    title: "朝靄の中で",
    setting:
      "夜明けの光が、靄を通してやわらかく降り注いでいます。あなたは静かな場所に座っています。世界がまだ目覚める前の、清らかな時間です。",
    phases: {
      inhale: "新しい朝の空気を、ゆっくりと吸い込んでください。光が体の中に入ってくるようです。",
      hold: "止めて。今日という日が始まっています。ここに、あなたがいます。",
      exhale: "昨日の重さを、そっと吐き出してください。靄の中に消えていきます。",
      holdAfter: "静かに待って。新しい息の準備をしています。",
    },
    closing:
      "セッションが終わりました。今日一日を、少しやさしく始めることができます。あなたは十分です。",
  },
];

export function getRandomScene(): BreathingScene {
  return breathingScenes[Math.floor(Math.random() * breathingScenes.length)];
}
