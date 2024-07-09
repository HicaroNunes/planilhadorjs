const express = require('express');
const bodyParser = require('body-parser');
const puppeteer = require('puppeteer');

const app = express();
app.use(bodyParser.json());
app.use(express.static('public'));

async function scrape(url) {
    const browser = await puppeteer.launch({ headless: true }); // Use headless: false for debugging
    const page = await browser.newPage();
    
    try {
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });

        // Espera a div v3-modal-content carregar
        await page.waitForSelector('.v3-modal-content', { timeout: 10000 });

        const result = await page.evaluate(() => {
            const container = document.querySelector('.v3-modal-body');
            if (!container) {
                console.log('Elemento .v3-modal-body não encontrado');
                return {
                    title: 'Elemento não encontrado',
                    elementText: 'Elemento não encontrado',
                    dateText: 'Elemento não encontrado',
                    eventText: 'Elemento não encontrado'
                };
            }

            const betEvent = container.querySelector('.BetEvent');
            if (!betEvent) {
                console.log('Elemento .BetEvent não encontrado');
                return {
                    title: 'Elemento não encontrado',
                    elementText: 'Elemento não encontrado',
                    dateText: 'Elemento não encontrado',
                    eventText: 'Elemento não encontrado'
                };
            }
            
            const BetEventMarketInfo = container.querySelector('.BetEventMarketInfo');
            if (!BetEventMarketInfo) {
                console.log('Elemento .BetEventMarketInfo não encontrado');
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

            // Buscando unidade e formatando de moeda para unidade
            const uniElement = BetResultItem.querySelector('.BetResultValue');
            console.log('Event Element HTML:', uniElement?.outerHTML);
            const uniText = uniElement ? uniElement.innerText || 'Unidade não encontrada' : 'Unidade não encontrada';
            const valorNumerico = uniText.replace(/[^\d.-]/g, "");
            const uniText2 = Number(valorNumerico) / 100;
            const uniText3 = uniText2.toString().replace('.', ',');

            // Buscando a Entrada
            const entElement = BetEventMarketInfo.querySelector('.BetEventMarketName');
            console.log('Event Element HTML:', entElement?.outerHTML);
            const entText = entElement ? entElement.innerText || 'Odd não encontrada' : 'Odd não encontrada';

            const emt2Element = container.querySelectorAll('.BetEventName')[1];
            console.log('Event Element HTML:', emt2Element?.outerHTML);
            const ent2Text = emt2Element ? emt2Element.innerText || 'Evento não encontrado' : 'Evento não encontrado';

            //Puxando qual o modelo de entrada foi feita
            let tipoent;
            if (ent2Text.includes('Resultado Final')) {
                tipoent = 'Vencedor';
            } else if (ent2Text.includes('Rebotes')) {
                tipoent = 'Rebotes';
            } else if (ent2Text.includes('pontos')) {
                tipoent = 'Pontos';
            } else if (ent2Text.includes('Dupla Chance')) {
                tipoent = 'Dupla Chance';
            } else if (ent2Text.includes('Gols')) {
                tipoent = 'Gols';
            } else if (ent2Text.includes('Handicap')) {
                tipoent = 'Handicap';
            } else if (ent2Text.includes('Escanteios')) {
                tipoent = 'Escanteios';
            } else if (ent2Text.includes('Assistências')) {
                tipoent = 'Assistências';
            } else if (ent2Text.includes('Mapas')) {
                tipoent = 'Mapas';
            } else if (ent2Text.includes('Vencedor da partida')) {
                tipoent = 'Winner';
            } else if (ent2Text.includes('Meio tempo/Partida inteira')) {
                tipoent = 'HT-FT';
            } else if (ent2Text.includes('Empate Anula a Aposta')) {
                tipoent = 'DNB';
            } else if (ent2Text.includes('Vencedor do 1º tempo')) {
                tipoent = 'HT';
            } else {
                tipoent = 'Outro';
            }
            
            // Buscando a Odd
            const oddElement = BetEventMarketInfo.querySelector('.BetEventCoeficent');
            console.log('Event Element HTML:', oddElement?.outerHTML);
            const oddText = oddElement ? oddElement.innerText || 'Odd não encontrada' : 'Odd não encontrada';
            const oddText2 = oddText.replace('.', ',');

            // Buscando a data da entrada
            const dateEntElement = container.querySelector('.BetModalHeaderContainer__description');
            console.log('Event Element HTML:', dateEntElement?.outerHTML);
            const dateEntText = dateEntElement ? dateEntElement.innerText || 'Data não encontrada' : 'Data não encontrada';

            // Buscando a hora do jogo
            const horaElement = container.querySelectorAll('.BetEventData')[1];
            console.log('Event Element HTML:', horaElement?.outerHTML);
            const horaText = horaElement ? horaElement.innerText || 'Data não encontrada' : 'Data não encontrada';

            // Buscando o dia do jogo
            const dateElement = betEvent.querySelector('.BetEventData');
            console.log('Event Element HTML:', dateElement?.outerHTML);
            const dateText = dateElement ? dateElement.innerText || 'Data não encontrada' : 'Data não encontrada';
            let parts = dateText.split(" ");
            let dia = parts[0];
            let mesAbreviado = parts[1];
            let meses = {
                "jan": "01", "fev": "02", "mar": "03", "abr": "04", "mai": "05", "jun": "06",
                "jul": "07", "ago": "08", "set": "09", "out": "10", "nov": "11", "dez": "12"
            };
            let mes = meses[mesAbreviado.toLowerCase()];
            let dateText2 = `${dia}/${mes}`;
            
            // Buscando o confronto
            const eventElement = betEvent.querySelector('.BetEventRedirection');
            console.log('Event Element HTML:', eventElement?.outerHTML);
            const eventText = eventElement ? eventElement.innerText || 'Evento não encontrado' : 'Evento não encontrado';

            // Buscando a competição
            const compElement = container.querySelector('.BetslipContainer__competitionName');
            console.log('Event Element HTML:', compElement?.outerHTML);
            const compText = compElement ? compElement.innerText || 'Competição não encontrada' : 'Competição não encontrada';

            // Transformando a data no outro padrão
            const dataaposta = `${dateText} | ${horaText}`;

            return { oddText2, compText, dateText2, eventText, entText, ent2Text, uniText3, dateEntText, dataaposta, horaText, tipoent };
        });

        // Função para comparar as datas
        function compararDatas(dateEntText, dataaposta) {
            // Função para converter a data e hora do formato "02 jul 2024 | 12:40" para um objeto Date
            function converterParaDate(dataHora) {
                // Removendo a barra vertical e dividindo a string em partes de data e hora
                let [data, hora] = dataHora.split(' | ');
        
                // Mapeando os meses para seus valores numéricos
                let meses2 = {
                    'jan': 0, 'feb': 1, 'mar': 2, 'apr': 3, 'may': 4, 'jun': 5,
                    'jul': 6, 'aug': 7, 'sep': 8, 'oct': 9, 'nov': 10, 'dec': 11
                };
        
                // Extraindo dia, mês e ano
                let [dia2, mes2, ano2] = data.split(' ');
                dia2 = parseInt(dia2);
                mes2 = meses2[mes2.toLowerCase()];
                ano2 = parseInt(ano2);
        
                // Extraindo horas e minutos
                let [hora2, minuto2] = hora.split(':');
                hora2 = parseInt(hora2);
                minuto2 = parseInt(minuto2);
        
                // Criando um objeto Date
                return new Date(ano2, mes2, dia2, hora2, minuto2);
            }
        
            // Convertendo as strings de data e hora para objetos Date
            let dt1 = converterParaDate(dateEntText);
            let dt2 = converterParaDate(dataaposta);
        
            // Comparando as datas e horas
            const resultado = dt1 < dt2 ? 'PRÉ LIVE' : 'LIVE';
            return resultado;
        }

        // Adiciona o resultado da comparação ao objeto result
        result.situacao = compararDatas(result.dateEntText, result.dataaposta);

        await browser.close();
        return result;
    } catch (error) {
        console.error('Erro ao realizar scraping:', error);
        await browser.close();
        throw error;
    }
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
        console.error('Erro no endpoint /scrape:', error);
        res.status(500).json({ error: error.message });
    }
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
