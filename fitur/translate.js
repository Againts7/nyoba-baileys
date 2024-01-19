const { translate } = require('bing-translate-api');

const lang = {
  af: 'Afrikaans',
  sq: 'Albanian',
  am: 'Amharic',
  ar: 'Arabic',
  hy: 'Armenian',
  as: 'Assamese',
  az: 'Azerbaijani',
  bn: 'Bangla',
  ba: 'Bashkir',
  eu: 'Basque',
  bho: 'Bhojpuri',
  brx: 'Bodo',
  bs: 'Bosnian',
  bg: 'Bulgarian',
  yue: 'Cantonese (Traditional)',
  ca: 'Catalan',
  lzh: 'Chinese (Literary)',
  'zh-Hans': 'Chinese Simplified',
  'zh-Hant': 'Chinese Traditional',
  hr: 'Croatian',
  cs: 'Czech',
  da: 'Danish',
  prs: 'Dari',
  dv: 'Divehi',
  doi: 'Dogri',
  nl: 'Dutch',
  en: 'English',
  et: 'Estonian',
  fo: 'Faroese',
  fj: 'Fijian',
  fil: 'Filipino',
  fi: 'Finnish',
  fr: 'French',
  'fr-CA': 'French (Canada)',
  gl: 'Galician',
  lug: 'Ganda',
  ka: 'Georgian',
  de: 'German',
  el: 'Greek',
  gu: 'Gujarati',
  ht: 'Haitian Creole',
  ha: 'Hausa',
  he: 'Hebrew',
  hi: 'Hindi',
  mww: 'Hmong Daw',
  hu: 'Hungarian',
  is: 'Icelandic',
  ig: 'Igbo',
  id: 'Indonesian',
  ikt: 'Inuinnaqtun',
  iu: 'Inuktitut',
  'iu-Latn': 'Inuktitut (Latin)',
  ga: 'Irish',
  it: 'Italian',
  ja: 'Japanese',
  kn: 'Kannada',
  ks: 'Kashmiri',
  kk: 'Kazakh',
  km: 'Khmer',
  rw: 'Kinyarwanda',
  'tlh-Latn': 'Klingon (Latin)',
  gom: 'Konkani',
  ko: 'Korean',
  ku: 'Kurdish (Central)',
  kmr: 'Kurdish (Northern)',
  ky: 'Kyrgyz',
  lo: 'Lao',
  lv: 'Latvian',
  ln: 'Lingala',
  lt: 'Lithuanian',
  dsb: 'Lower Sorbian',
  mk: 'Macedonian',
  mai: 'Maithili',
  mg: 'Malagasy',
  ms: 'Malay',
  ml: 'Malayalam',
  mt: 'Maltese',
  mr: 'Marathi',
  'mn-Cyrl': 'Mongolian (Cyrillic)',
  'mn-Mong': 'Mongolian (Traditional)',
  my: 'Myanmar (Burmese)',
  mi: 'Māori',
  ne: 'Nepali',
  nb: 'Norwegian',
  nya: 'Nyanja',
  or: 'Odia',
  ps: 'Pashto',
  fa: 'Persian',
  pl: 'Polish',
  pt: 'Portuguese (Brazil)',
  'pt-PT': 'Portuguese (Portugal)',
  pa: 'Punjabi',
  otq: 'Querétaro Otomi',
  ro: 'Romanian',
  run: 'Rundi',
  ru: 'Russian',
  sm: 'Samoan',
  'sr-Cyrl': 'Serbian (Cyrillic)',
  'sr-Latn': 'Serbian (Latin)',
  st: 'Sesotho',
  nso: 'Sesotho sa Leboa',
  tn: 'Setswana',
  sn: 'Shona',
  sd: 'Sindhi',
  si: 'Sinhala',
  sk: 'Slovak',
  sl: 'Slovenian',
  so: 'Somali',
  es: 'Spanish',
  sw: 'Swahili',
  sv: 'Swedish',
  ty: 'Tahitian',
  ta: 'Tamil',
  tt: 'Tatar',
  te: 'Telugu',
  th: 'Thai',
  bo: 'Tibetan',
  ti: 'Tigrinya',
  to: 'Tongan',
  tr: 'Turkish',
  tk: 'Turkmen',
  uk: 'Ukrainian',
  hsb: 'Upper Sorbian',
  ur: 'Urdu',
  ug: 'Uyghur',
  uz: 'Uzbek (Latin)',
  vi: 'Vietnamese',
  cy: 'Welsh',
  xh: 'Xhosa',
  yo: 'Yoruba',
  yua: 'Yucatec Maya',
  zu: 'Zulu',
};

async function tr(msgContext) {
  // console.log('ini msg'.bgRed, msgContext);
  const { msg, isReply, repliedMsg } = msgContext;
  const hasil = msgContext;
  let terjemahan = 'null';
  if (msg.length < 1 && !isReply) {
    hasil.text = 'Untuk menerjemahkan gunakan:\n.tr ```<kode>``` *atau* ```<asal>-<tujuan>```\nContoh: .tr en-id (teks...)';
    hasil.type = 'text';
    return hasil;
  }
  const msgSplit = msg.split(' ');
  const bahasa = msgSplit[0];

  let bahasaAsli = null;
  let bahasaTujuan = bahasa;
  let teksUntukTerjemahkan = msgSplit.slice(1).join(' ');

  if (bahasa.includes('-')) [bahasaAsli, bahasaTujuan] = bahasa.split('-');
  console.log(bahasa, bahasaAsli, bahasaTujuan);
  if (!teksUntukTerjemahkan && isReply) teksUntukTerjemahkan = repliedMsg;

  console.log('ini text'.bgRed, teksUntukTerjemahkan, repliedMsg);

  if (!teksUntukTerjemahkan) {
    hasil.text = 'teks nya mana 😭';
    hasil.type = 'text';
    return hasil;
  }

  await translate(teksUntukTerjemahkan, bahasaAsli, bahasaTujuan).then((res) => {
    terjemahan = res.translation;
    // console.log(res);
  }).catch((err) => {
    console.log(err);
    terjemahan = err.message;
    if (err.message.includes('is not supported')) {
      const match = Object.keys(lang).filter((key) => lang[key].toLowerCase().includes(bahasa));
      if (match && bahasa > 2) terjemahan += `\nCoba: (${match})`;
      terjemahan += '\nUntuk bahasa yang didukung silahkan kunjungi: \nhttps://learn.microsoft.com/en-us/azure/ai-services/translator/language-support';
    }
  });
  hasil.text = terjemahan;
  hasil.type = 'text';
  return hasil;
}

// const { translate } = require('@vitalets/google-translate-api');
// const { HttpsProxyAgent } = require('https-proxy-agent');

// const translateExe = async (pesanIsiCommand) => {
//     const teksSplit = pesanIsiCommand.split(' '); // isi command di split lagi
//     const bahasaTujuan = teksSplit[0];
//     const teksUntukTerjemahkan = teksSplit.slice(1).join(' ');
//     const agent = new HttpsProxyAgent('https://111.225.152.37:8089');

//     console.log(`==== ini kode bahasa tujuan: ${bahasaTujuan}`);
//     console.log(`==== ini teks untuk diterjemahkan: ${teksUntukTerjemahkan}`);

//     async function terjemahkan(a, b, c) {
//         try {
//             const { text } = await translate(a, { to: b, fetchOptions: { c } });
//             return text;
//         } catch (e) {
//             return console.log(e);
//         }
//     }
//     return terjemahkan(teksUntukTerjemahkan, bahasaTujuan, agent);
// };

module.exports = tr;
