const axios = require('axios');
const cheerio = require('cheerio');

async function fetchData(url) {
  try {
    const response = await axios.get(url);
    const html = response.data;
    const $ = cheerio.load(html);

    let bossHtml = '';
    let miniBossHtml = '';

    const bossList = [];
    const miniBossList = [];

    const expRequired = [];

    $('.content-subtitle').each((index, element) => {
      const expReq = $(element).text().replace(/[\t\n]/g, '');
      expRequired.push(expReq);
    });

    $('.item-leveling').each((index, element) => {
      const itemLeveling = $(element).html().replace(/[\t\n]/g, '');
      if (index === 0) {
        bossHtml = itemLeveling;
      }
      if (index === 1) {
        miniBossHtml = itemLeveling;
      }
    });

    $('.level-row', bossHtml).each((index, element) => {
      const level = $(element).children('.level-col-1').text().replace(/[\t\n]/g, '');
      const bossElement = $(element).children('.level-col-2');
      const bossName = bossElement.find('p:first-child').text().replace(/[\t\n]/g, '');
      const bossLocation = bossElement.find('p:last-child').text().replace(/[\t\n]/g, '');
      const expElement = $(element).children('.level-col-3');
      const bossExp = expElement.find('p:last-child').text().replace(/[\t\n]/g, '').replace('(0 break)', '\b');

      if (index < 5) {
        bossList.push({
          level, bossName, bossLocation, bossExp,
        });
      }
    });

    $('.level-row', miniBossHtml).each((index, element) => {
      const level = $(element).children('.level-col-1').text().replace(/[\t\n]/g, '');
      const bossElement = $(element).children('.level-col-2');
      const bossName = bossElement.find('p:first-child').text().replace(/[\t\n]/g, '');
      const bossLocation = bossElement.find('p:last-child').text().replace(/[\t\n]/g, '');
      const bossExp = $(element).children('.level-col-3').text().replace(/[\t\n]/g, '');

      if (index < 5) {
        miniBossList.push({
          level, bossName, bossLocation, bossExp,
        });
      }
    });
    return [bossList, miniBossList, expRequired];
  } catch (error) {
    console.log(`${error} ini error`);
    return [];
  }
}

async function leveling(pesanIsiCommand) {
  try {
    const cari = pesanIsiCommand;
    const url = `https://coryn.club/leveling.php?lv=${cari}`;
    const [bossList, miniBossList, expRequired] = await fetchData(url);

    const maxResults = 5; // Batasan jumlah hasil yang ingin ditampilkan

    // Menampilkan hasil dari bossList
    let bossListString = '';
    bossListString += `_*List leveling ${pesanIsiCommand}* (${expRequired})_\n`;
    bossListString += '\n*BOSS LIST* _(0 break)_\n';

    await bossList.slice(0, maxResults).forEach((item) => {
      const level = item.level.trim();
      const boss = item.bossName.trim();
      const location = item.bossLocation.trim();
      const exp = item.bossExp.trim();

      bossListString += '--------------------------------------------------------------\n';
      bossListString += `*Boss*: ${boss} ${level}\n*Exp*: ${exp}\n`;
      bossListString += `*Location*: _${location}_\n`;
    });
    bossListString += '\n';
    // Menampilkan hasil dari miniBossList
    let miniBossListString = '';
    miniBossListString += '*MINI BOSS LIST*\n';

    await miniBossList.slice(0, maxResults).forEach((item) => {
      const level = item.level.trim();
      const boss = item.bossName.trim();
      const location = item.bossLocation.trim();
      const exp = item.bossExp.trim();

      miniBossListString += '--------------------------------------------------------------\n';
      miniBossListString += `*Boss*: ${boss} ${level}\n*Exp*: ${exp}\n`;
      miniBossListString += `*Location*: _${location}_\n`;
    });

    const resultString = bossListString + miniBossListString;
    // console.log(resultString);
    return resultString;
  } catch (e) {
    console.log(e);
    return e.message;
  }
}

module.exports = leveling;

// leveling('1'); // ini juga untuk test
