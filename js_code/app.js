const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');

const app = express();

app.get('/getTimeStories', async (req, res) => {
    try {
        const html = await fetchHTML();
        const data = parseHTML(html);

        res.json(data);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

async function fetchHTML() {
    try {
        const response = await axios.get('https://time.com');
        return response.data;
    } catch (error) {
        throw new Error('Error fetching HTML:', error);
    }
}

function parseHTML(html) {
    const $ = cheerio.load(html);
    const listItems = $(".latest-stories__item");
    const data = [];
    listItems.each((index, element) => {
        const h3Element = $(element).find("h3.latest-stories__item-headline");
        const aElement = $(element).find("a[href]");
        if (h3Element.length && aElement.length) {
            data.push({
                title: h3Element.text().trim(),
                link: aElement.attr("href")
            });
        }
    });
    return data;
}

const PORT = process.env.PORT || 5555;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
