const express = require('express');
const bodyParser = require('body-parser');
const puppeteer = require('puppeteer');

const app = express();
app.use(bodyParser.json());
app.use(express.static('public'));

async function scrape(url) {
    const browser = await puppeteer.launch({ headless: true }); // Use headless: false for debugging
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle2' });

    // Espera a página carregar para buscar os elementos
    await page.waitForSelector('.v3-modal-body', { timeout: 5000 });

    const result = await page.evaluate(() => {
        const container = document.querySelector('.v3-modal-body');
        if (!container) {
            return {
                title: 'Elemento não encontrado',
                elementText: 'Elemento não encontrado',
                dateText: 'Elemento não encontrado',
                eventText: 'Elemento não encontrado'
            };
        }

        const betEvent = container.querySelector('.BetEvent');
        if (!betEvent) {
            return {
                title: 'Elemento não encontrado',
                elementText: 'Elemento não encontrado',
                dateText: 'Elemento não encontrado',
                eventText: 'Elemento não encontrado'
            };
        }
        const BetEventMarketInfo = container.querySelector('.BetEventMarketInfo');
        if (!BetEventMarketInfo) {
            return {
                title: 'Elemento não encontrado',
                elementText: 'Elemento não encontrado',
                dateText: 'Elemento não encontrado',
                eventText: 'Elemento não encontrado'
            };
        }
                const BetResultItems = container.querySelectorAll('.BetResultItem');
                const BetResultItem = BetResultItems[1]; // Seleciona o segundo elemento (índice 1)
                console.log('BetResultItem HTML:', BetResultItem.outerHTML);
                // Verifique se o BetResultItem foi encontrado antes de continuar
                if (!BetResultItem) {
                return {
                title: 'Elemento não encontrado',
                elementText: 'Elemento não encontrado',
                dateText: 'Elemento não encontrado',
                eventText: 'Elemento não encontrado'
            };
        }

        //Buscando unidade e formatando de moeda para unidade
        const uniElement = BetResultItem.querySelector('.BetResultValue');
        console.log('Event Element HTML:', uniElement?.outerHTML);

        const uniText = uniElement ? uniElement.innerText || 'Unidade não encontrada' : 'Unidade não encontrada';
        const valorNumerico = uniText.replace(/[^\d.-]/g, "");
        const uniText2 = Number(valorNumerico) / 100;
        //Buscando a Entrada
        const entElement = BetEventMarketInfo.querySelector('.BetEventMarketName');
        console.log('Event Element HTML:', entElement?.outerHTML);

        const entText = entElement ? entElement.innerText || 'Odd não encontrada' : 'Odd não encontrada'

        const emt2Element = container.querySelectorAll('.BetEventName')[1];
        console.log('Event Element HTML:', emt2Element?.outerHTML);

        const ent2Text = emt2Element ? emt2Element.innerText || 'Evento não encontrado' : 'Evento não encontrado';
        
        //Buscando a Odd
        const oddElement = BetEventMarketInfo.querySelector('.BetEventCoeficent');
        console.log('Event Element HTML:', oddElement?.outerHTML);

        const oddText = oddElement ? oddElement.innerText || 'Odd não encontrada' : 'Odd não encontrada'
        const oddText2 = oddText.replace('.', ',');
        //Buscando a data
        const dateElement = betEvent.querySelector('.BetEventData');
        console.log('Event Element HTML:', dateElement?.outerHTML);

        const dateText = dateElement ? dateElement.innerText || 'Data não encontrada' : 'Data não encontrada';
        let parts = dateText.split(" ");
        let dia = parts[0];
        let mesAbreviado = parts[1];
        let meses = {
            "jan": "01",
            "fev": "02",
            "mar": "03",
            "abr": "04",
            "mai": "05",
            "jun": "06",
            "jul": "07",
            "ago": "08",
            "set": "09",
            "out": "10",
            "nov": "11",
            "dez": "12"
        };
        let mes = meses[mesAbreviado.toLowerCase()];
        let dateText2 = `${dia}/${mes}`;
        //Buscando o confronto
        const eventElement = betEvent.querySelector('.BetEventRedirection');
        console.log('Event Element HTML:', eventElement?.outerHTML);

        const eventText = eventElement ? eventElement.innerText || 'Evento não encontrado' : 'Evento não encontrado';
        //Buscando a competição
        const compElement = container.querySelector('.BetslipContainer__competitionName');
        console.log('Event Element HTML:', compElement?.outerHTML);

        const compText = compElement ? compElement.innerText || 'Competição não encontrada' : 'Competição não encontrada';

        return { oddText2, compText, dateText2, eventText, entText, ent2Text, uniText2 };
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
