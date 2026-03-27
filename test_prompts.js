const http = require('http');

const userEntry = "今日は仕事で大きなミスをして上司にひどく怒られた。このままでいいのか不安になるし、家に帰っても全然疲れが取れない。";

function testApi(path) {
    return new Promise((resolve, reject) => {
        const data = JSON.stringify({ userEntry, storySummary: "" });
        const options = {
            hostname: 'localhost',
            port: 3002,
            path: path,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(data)
            }
        };

        const req = http.request(options, (res) => {
            let responseBody = '';
            res.on('data', (chunk) => {
                responseBody += chunk;
            });
            res.on('end', () => {
                console.log(`\n=== Response from ${path} ===\n`);
                console.log(responseBody);
                console.log(`\n=============================\n`);
                resolve();
            });
        });

        req.on('error', (error) => {
            console.error(error);
            reject(error);
        });

        req.write(data);
        req.end();
    });
}

async function runTests() {
    console.log("Testing Hina's Story...");
    await testApi('/api/parallel-story');
    
    console.log("Testing Ren's Story...");
    await testApi('/api/ren-story');
}

runTests();
