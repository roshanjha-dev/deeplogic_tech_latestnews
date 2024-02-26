const http = require('http');
const https = require('https');

const server = http.createServer((req, res) => {
    if (req.url === '/getTimeStories' && req.method === 'GET') {
        https.get('https://time.com/', (response) => {
            let data = '';

            // A chunk of data has been received.
            response.on('data', (chunk) => {
                data += chunk;
            });

            // The whole response has been received.
            response.on('end', () => {
                const extractedData = [];

                // Emulating querySelector and innerHTML
                const div = document.createElement('div');
                div.innerHTML = data;

                // Selecting elements by tag name and class name
                const latestStoriesItems = div.getElementsByClassName('latest-stories__item');

                for (const item of latestStoriesItems) {
                    const a = item.querySelector('a');
                    const href = a.getAttribute('href');
                    const h3Content = a.querySelector('h3').textContent.trim();
                    extractedData.push({ title: h3Content, link: href });
                }

                const jsonResponse = JSON.stringify(extractedData);
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(jsonResponse);
            });
        }).on('error', (error) => {
            console.error(`Error fetching data: ${error}`);
            res.writeHead(500);
            res.end();
        });
    } else {
        res.writeHead(404);
        res.end();
    }
});

const port = 8080;
server.listen(port, () => {
    console.log(`Server is running on port: localhost:${port}`);
});
