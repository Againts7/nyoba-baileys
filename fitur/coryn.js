const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');

const dataPilihanLvling = JSON.parse(fs.readFileSync('./fitur/tambahan/data-lvling.json', 'utf8'));
const popularBossName = dataPilihanLvling.dataBoss;
const popularMiniBossName = dataPilihanLvling.dataMini;

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

      if (index < 10) {
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

      if (index < 6) {
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

async function leveling(msgContext) {
  const { msg } = msgContext;
  const msgContex = msgContext;
  if (msg.length < 1) {
    msgContex.text = '.lvling (level)';
    msgContex.type = 'text';
    return msgContex;
  }
  try {
    const pisah = msg.toLowerCase().split(' ');
    if (msg.startsWith('add-boss') || msg.startsWith('add-mini')) {
      if (msg.startsWith('add-boss')) {
        popularBossName.push(pisah[1]);
        fs.writeFileSync('./fitur/tambahan/data-lvling.json', JSON.stringify(dataPilihanLvling));
        msgContex.text = 'udah';
        msgContex.type = 'text';
        return msgContex;
      }
      popularMiniBossName.push(pisah[1]);
      fs.writeFileSync('./fitur/tambahan/data-lvling.json', JSON.stringify(dataPilihanLvling));
      msgContex.text = 'udah';
      msgContex.type = 'text';
      return msgContex;
    }
    const lvl = pisah[0];
    const monsType = pisah[1];
    const url = `https://coryn.club/leveling.php?lv=${lvl}`;
    const [bossList, miniBossList, expRequired] = await fetchData(url);
    let bossListString = '';
    let miniBossListString = '';

    if (monsType === 'boss' || monsType === 'miniboss') {
      if (monsType === 'miniboss') {
        miniBossListString += `_*List MiniBoss for ${lvl}*_\n`;
        miniBossList.forEach((item) => {
          const level = item.level.trim();
          const boss = item.bossName.trim();
          const location = item.bossLocation.trim();
          const exp = item.bossExp.trim();

          miniBossListString += '--------------------------------------------------------------\n';
          miniBossListString += `*🔴*: ${boss} ${level}\n*✨*: ${exp}\n`;
          miniBossListString += `*📌*: _${location}_\n`;
        });
      }
      if (monsType === 'boss') {
        bossListString += `_*List Boss for ${lvl}*_\n`;
        bossList.slice(0, 7).forEach((item) => {
          const level = item.level.trim();
          const boss = item.bossName.trim();
          const location = item.bossLocation.trim();
          const exp = item.bossExp.trim();

          bossListString += '--------------------------------------------------------------\n';
          bossListString += `*🔴*: ${boss} ${level}\n*✨*: ${exp}\n`;
          bossListString += `*📌*: _${location}_\n`;
        });
      }
    }
    if (monsType === undefined) {
      const favoritBossArray = bossList.filter((boss) => popularBossName
        .some((name) => boss.bossName.toLowerCase().includes(name)));
      console.log(favoritBossArray);
      bossListString += `*Beberapa pilihan buat digebukin*\n*Leveling*: ${lvl} _(${expRequired})_\n`;
      bossListString += '\n*Ini Boss*\n';
      // Mencetak hasilnya
      if (favoritBossArray.length > 0) {
        favoritBossArray.forEach((item) => {
          const level = item.level.trim();
          const boss = item.bossName.trim();
          const location = item.bossLocation.trim();
          const exp = item.bossExp.trim();
          bossListString += '--------------------------------------------------------------\n';
          bossListString += `*🔴*: ${boss} ${level}\n*✨*: ${exp}\n`;
          bossListString += `*📌*: _${location}_\n`;
        });
      } else {
        bossListString += 'yntkts\n';
      }

      miniBossListString += '\n*Ini Miniboss*\n';
      const favoritMiniBossArray = miniBossList.filter((boss) => popularMiniBossName
        .some((name) => boss.bossName.toLowerCase().includes(name)));

      // Mencetak hasilnya
      if (favoritMiniBossArray.length > 0) {
        favoritMiniBossArray.forEach((item) => {
          const level = item.level.trim();
          const boss = item.bossName.trim();
          const location = item.bossLocation.trim();
          const exp = item.bossExp.trim();
          miniBossListString += '--------------------------------------------------------------\n';
          miniBossListString += `*🔴*: ${boss} ${level}\n*✨*: ${exp}\n`;
          miniBossListString += `*📌*: _${location}_\n`;
        });
      } else {
        miniBossListString += 'yntkts\n';
      }
    }
    console.log(bossList);
    const resultString = bossListString + miniBossListString;
    console.log(resultString);
    msgContex.text = resultString;
    msgContex.type = 'text';
    return msgContex;
    // const maxResults = 5; // Batasan jumlah hasil yang ingin ditampilkan

    // // Menampilkan hasil dari bossList
    // let bossListString = '';
    // bossListString += `_*List leveling ${msg}* (${expRequired})_\n`;
    // bossListString += '\n*BOSS LIST* _(0 break)_\n';

    // bossList.slice(0, maxResults).forEach((item) => {
    //   const level = item.level.trim();
    //   const boss = item.bossName.trim();
    //   const location = item.bossLocation.trim();
    //   const exp = item.bossExp.trim();

    //   bossListString += '--------------------------------------------------------------\n';
    //   bossListString += `*Boss*: ${boss} ${level}\n*Exp*: ${exp}\n`;
    //   bossListString += `*Location*: _${location}_\n`;
    // });
    // bossListString += '\n';
    // // Menampilkan hasil dari miniBossList
    // let miniBossListString = '';
    // miniBossListString += '*MINI BOSS LIST*\n';

    // await miniBossList.slice(0, maxResults).forEach((item) => {
    //   const level = item.level.trim();
    //   const boss = item.bossName.trim();
    //   const location = item.bossLocation.trim();
    //   const exp = item.bossExp.trim();

    //   miniBossListString += '--------------------------------------------------------------\n';
    //   miniBossListString += `*Boss*: ${boss} ${level}\n*Exp*: ${exp}\n`;
    //   miniBossListString += `*Location*: _${location}_\n`;
    // });
  } catch (e) {
    console.log(e);
    throw new Error(e.message);
  }
}

module.exports = leveling;

// leveling('1'); // ini juga untuk test
