const http = require('http');
const https = require('https');
const cheerio = require('cheerio');

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

                // Load HTML data into cheerio
                const $ = cheerio.load(data);

                // Selecting elements by class name
                const latestStoriesItems = $('.latest-stories__item');

                latestStoriesItems.each((index, element) => {
                    const a = $(element).find('a');
                    const href = a.attr('href');
                    const h3Content = a.find('h3').text().trim();
                    extractedData.push({ title: h3Content, link: href });
                });

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
