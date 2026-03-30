async function test() {
  const res = await fetch('https://orbital-rosette.vercel.app/api/ren-story', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userEntry: 'テスト投稿です。' })
  });
  console.log('Status:', res.status);
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    process.stdout.write(decoder.decode(value));
  }
}
test().catch(console.error);
