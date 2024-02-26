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

                // Find latest stories items manually
                let latestStoriesIndex = data.indexOf('<li class="latest-stories__item">');
                while (latestStoriesIndex !== -1) {
                    const endIndex = data.indexOf('</li>', latestStoriesIndex);
                    const latestStoriesHtml = data.slice(latestStoriesIndex, endIndex);

                    // const startulIndex = latestStoriesHtml.indexOf('<ul>');

                    // const endulIndex = latestStoriesHtml.indexOf('</ul>', startulIndex);
                    // const latestStories2 = latestStoriesHtml.slice(startulIndex, endulIndex);

                    // Extract links and titles manually
                    let linkIndex = latestStoriesHtml.indexOf('<a href="');
                    if (linkIndex !== -1) {
                        const startHrefIndex = linkIndex + '<a href="'.length;
                        const endHrefIndex = latestStoriesHtml.indexOf('"', startHrefIndex);
                        const href = latestStoriesHtml.slice(startHrefIndex, endHrefIndex);

                        const startTitleIndex = latestStoriesHtml.indexOf('<h3 class="latest-stories__item-headline">') 
                                                                            + '<h3 class="latest-stories__item-headline">'.length;
                        const endTitleIndex = latestStoriesHtml.indexOf('</h3>', startTitleIndex);
                        const head = latestStoriesHtml.slice(startTitleIndex, endTitleIndex).trim();

                        extractedData.push({ title: head, link: href });

                        // linkIndex = data.indexOf('<a href="', endTitleIndex);
                    }
                    latestStoriesIndex = data.indexOf('<li class="latest-stories__item">', endIndex);
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
