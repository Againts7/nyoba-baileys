// function checkToramNews() {
//   const url = 'https://id.toram.jp/information/?type_code=all';
//   axios.get(url)
//     .then((response) => {
//       const dataHtml = response.data;
//       const $ = cheerio.load(dataHtml);
//       const listNews = $('.news_border');

//       listNews.each((index, element) => {
//         const news = $(element).text().replace(/(\n+|\t+| {5,})/g, '');
//         const link = $(element).find('a').attr('href').split('=')
//           .pop();
//         console.log(index + 1, news); // .text().replace(/\n/g, ''));
//         console.log(index + 1, link);
//       });
//     })
//     .catch((error) => {
//       console.error(error);
//     });
// }

const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');

function dataSelector(name, html) {
  const $ = cheerio.load(html);
  return $(name).text();
}

function getNewsDetails() {
  // const url = `https://id.toram.jp/information/detail/?information_id=${code}`;
  const url = fs.readFileSync('./fitur/toram.html', 'utf8', (err, data) => {
    if (err) {
      console.log(err.message);
    }
  });
  // axios.get(url)
  //   .then((response) => {
  //     const html = response.data;
  //     const $ = cheerio.load(html);
  //     console.log($.text());
  //   });
  const $ = cheerio.load(url);
  $('script').remove();
  $('#twitter-widget-0').remove();
  $('.btn_back_area').remove();
  $('div').find('a[href="#top"]').parent().remove();
  $('div[align="center"]').find('img').parent().remove();
  const dataRaw = $('.newsBox').text().trim().replace(/\n+/g, '\n')
    .replace(/ {2,}/g, '')
    .replace(/\n{2,}/g, '\n')
    .split('\n'); // .replace(/\n+/g, '\n').replace(/(<br\s*\/?>\s*)+/g, '');

  // Fungsi untuk mengenali kategori 'Periode Event'
  function isPeriodeEvent(teks) {
    return teks.includes('Mulai : ') || teks.includes('Selesai : ');
  }

  // Fungsi untuk mengenali detail bos dengan format 'LvXX NamaBos(Lokasi)'
  function isBosDetail(teks) {
    return /^Lv\d+\s.+\(.+\)$/.test(teks);
  }

  // Kategori: Informasi Tanggal dan Judul Acara
  const kategori1 = dataRaw.filter((teks) => /^\d{4}-\d{2}-\d{2}$/.test(teks));

  // Kategori: Periode Event
  const periodeEventIndex = dataRaw.findIndex(isPeriodeEvent);
  const kategori3 = dataRaw.slice(periodeEventIndex, periodeEventIndex + 2);

  // Kategori: Detail BOS Berikut
  const kategori4 = dataRaw.filter(isBosDetail);

  // Kategori: Informasi Lainnya
  const kategori5 = dataRaw.filter((teks) => teks.startsWith('*'));

  // Kategori: Deskripsi Acara (Bukan termasuk kategori lain)
  const kategori2 = dataRaw.filter(
    (teks) => !kategori1.includes(teks) && !kategori3.includes(teks)
    && !kategori4.includes(teks) && !kategori5.includes(teks) && !teks.includes('Periode Event')
    && !teks.includes('Berlaku untuk') && !teks.includes('PERHATIAN'),
  );

  // Hasil pengelompokkan array ke dalam kategori
  console.log('Kategori: Informasi Tanggal dan Judul Acara');
  console.log(kategori1);
  console.log('----------------------');

  console.log('Kategori: Deskripsi Acara');
  console.log(kategori2);
  console.log('----------------------');

  console.log('Kategori: Periode Event');
  console.log(kategori3);
  console.log('----------------------');

  console.log('Kategori: Detail BOS Berikut');
  console.log(kategori4);
  console.log('----------------------');

  console.log('Kategori: Informasi Lainnya');
  console.log(kategori5);
  console.log('----------------------');

  // console.log(dataRaw);
  // const s = cheerio.load(dataRaw);
  // const date = s('time[datetime]').text();
  // const title = s('.news_title').text();
  // const info = s(dataRaw).not('.news_title, .subtitle').text();
  // const period = s('.subtitle:contains("Periode Event")').nextUntil('br').text();
  // const content = s('.subtitle').text();
  // console.log(`tanngal${date}`);
  // console.log(`judul${title}`);
  // console.log(`info${info}`);
  // console.log(`kapan${period}`);
  // console.log(`apa aja${content}`);
}

getNewsDetails();
