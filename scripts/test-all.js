async function test() {
  const routes = ['/api/inner-voice', '/api/parallel-story', '/api/ren-story'];
  for (const route of routes) {
    console.log(`Testing ${route}...`);
    const res = await fetch('https://orbital-rosette.vercel.app' + route, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userEntry: 'テスト投稿です。' })
      });
      console.log('Status:', res.status);
      const text = await res.text();
      console.log('Response:', text.substring(0, 200));
      console.log('---');
  }
}
test().catch(console.error);
