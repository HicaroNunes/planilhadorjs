const express = require('express');
const bodyParser = require('body-parser');
const puppeteer = require('puppeteer');

const app = express();
app.use(bodyParser.json());
app.use(express.static('public'));

async function scrape(url) {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(url);

    const result = await page.evaluate(() => {
        const title = document.querySelector('title')?.innerText || 'Nenhum título encontrado';
        const elementText = document.querySelector('div.some-class')?.innerText || 'Elemento não encontrado';
        const dateElement = document.querySelector('.BetEventData');
        const dateText = dateElement ? dateElement.querySelector('span')?.innerText || 'Data não encontrada' : 'Data não encontrada';
        
        return { title, elementText, dateText };
    });

    await browser.close();
    return result;
}

app.post('/scrape', async (req, res) => {
    const url = req.body.url;
    if (!url) {
        return res.status(400).json({ error: 'URL é necessária' });
    }

    try {
        const result = await scrape(url);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
