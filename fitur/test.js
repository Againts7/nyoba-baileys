const a = {
  level: 30,
  time: '2024-01-19T01:05:40.139Z',
  pid: 2296,
  hostname: 'ASUS',
  class: 'baileys',
  node: {
    username: '6287860438924',
    passive: true,
    userAgent: {
      platform: 'MACOS', appVersion: { primary: 2, secondary: 2329, tertiary: 9 }, mcc: '000', mnc: '000', osVersion: '0.1', manufacturer: '', device: 'Desktop', osBuildNumber: '0.1', releaseChannel: 'RELEASE', localeLanguageIso6391: 'en', localeCountryIso31661Alpha2: 'US',
    },
    connectType: 'WIFI_UNKNOWN',
    connectReason: 'USER_ACTIVATED',
    device: 3,
  },
  msg: 'logging in...',
};

// Tanggal dan waktu awal dalam format UTC
const utcTimeString = a.time;
const utcDate = new Date(utcTimeString);

// Objek options untuk konfigurasi format tanggal dan waktu
const options = {
  weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric', timeZoneName: 'short', timeZone: 'Asia/Jakarta',
};

// Buat objek Intl.DateTimeFormat dengan opsi di atas
const dateTimeFormat = new Intl.DateTimeFormat('id-ID', options);

// Ubah tanggal dan waktu UTC ke format lokal dengan bahasa Indonesia
const localTimeString = dateTimeFormat.format(utcDate);

console.log(localTimeString);
