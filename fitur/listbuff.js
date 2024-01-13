/* eslint-disable max-len */
const fs = require('fs');

const dataBuff = JSON.parse(fs.readFileSync('./fitur/tambahan/data-buff.json'));

const {
  atk, matk, watk, ampr, str,
  dex, int, agi, vit, cr, acc,
  mp, hp, minAggro, plusAggro,
  pRes, mRes, frac, dteDark, dteEarth,
  dteFire, dteWind, dteWater, dteLight,
  dteNetral,
} = dataBuff;

function ambilDataAcak(array) {
  const dataAcak = [];
  const arrayKlon = array.slice(); // Membuat salinan array agar tidak memodifikasi array asli
  const jumlahMaksimal = 3;

  const jumlahData = Math.min(jumlahMaksimal, array.length); // Menentukan jumlah data yang akan diambil

  for (let i = 0; i < jumlahData; i++) {
    const randomIndex = Math.floor(Math.random() * arrayKlon.length); // Menghasilkan indeks acak dari arrayKlon
    const data = arrayKlon.splice(randomIndex, 1)[0]; // Menghapus dan mengambil data acak dari arrayKlon
    dataAcak.push(data); // Menambahkan data acak ke dalam dataAcak
  }

  return dataAcak.join(' - ').trim();
}

function tambahBuff(arg, isPrem) { // .buff || add hp 1234567
  if (!isPrem) return 'anda tidak bisa';
  let result = '';
  const pisah = arg.split(/[,\s]+/);
  const jenisBuff = pisah[1];
  const buffYGinginDitambah = pisah.slice(2);
  console.log(`buff yg mau ditambah ${buffYGinginDitambah}`);
  const buffTambahHarusNumber = [];
  buffYGinginDitambah.forEach((potongan) => {
    try {
      if (potongan.trim() === '') {
        throw new Error('Empty or whitespace value is not allowed.');
      }
      const noBuff = parseInt(potongan, 10);
      if (Number.isNaN(noBuff)) {
        throw new Error(`'${potongan}' *bukan* angka.`);
      }
      if (noBuff.toString().length !== 7) {
        throw new Error(`'${potongan}' *harus* 7 digit`);
      }
      buffTambahHarusNumber.push(noBuff);
    } catch (e) {
      result += `${e.message}\n`;
    }
  });
  console.log(`ini jenis buff = ${jenisBuff}`);
  try {
    let isSuccess = true;
    if (buffYGinginDitambah.length !== 0 || jenisBuff.length > 0) {
      let tempatData;
      const dataUntukMasuk = buffTambahHarusNumber;
      console.log(`ini data yg akan di push: ${dataUntukMasuk}`);
      switch (jenisBuff.toLowerCase()) {
        case 'atk':
        case 'attack':
          tempatData = atk;
          break;
        case 'matk':
          tempatData = matk;
          break;
        case 'watk':
          tempatData = watk;
          break;
        case 'ampr':
          tempatData = ampr;
          break;
        case 'str':
          tempatData = str;
          break;
        case 'dex':
          tempatData = dex;
          break;
        case 'int':
          tempatData = int;
          break;
        case 'agi':
          tempatData = agi;
          break;
        case 'vit':
          tempatData = vit;
          break;
        case 'cr':
          tempatData = cr;
          break;
        case 'acc':
          tempatData = acc;
          break;
        case 'mp':
          tempatData = mp;
          break;
        case 'hp':
          tempatData = hp;
          break;
        case 'minAggro':
        case '-aggro':
        case '-agg': case 'aggro-': case 'agg-':
          tempatData = minAggro;
          break;
        case 'plusAggro':
        case '+aggro':
        case '+agg': case 'aggro+': case 'agg+':
          tempatData = plusAggro;
          break;
        case 'pres':
        case 'p.res':
          tempatData = pRes;
          break;
        case 'mres':
        case 'm.res':
          tempatData = mRes;
          break;
        case 'frac':
          tempatData = frac;
          break;
        case 'dtedark':
        case 'dte-dark':
        case 'dark':
          tempatData = dteDark;
          break;
        case 'dteearth':
        case 'dte-earth':
        case 'earth':
          tempatData = dteEarth;
          break;
        case 'dtefire':
        case 'dte-fire':
        case 'fire':
          tempatData = dteFire;
          break;
        case 'dtewind':
        case 'dte-wind':
        case 'wind':
          tempatData = dteWind;
          break;
        case 'dtewater':
        case 'dte-water':
        case 'water':
          tempatData = dteWater;
          break;
        case 'dtelight':
        case 'dte-light':
        case 'light':
          tempatData = dteLight;
          break;
        case 'dtenetral':
        case 'dte-netral':
        case 'netral':
          tempatData = dteNetral;
          break;
        default:
          isSuccess = false;
          console.log('Invalid stat name');
          result += `buff ${jenisBuff} belum atau tidak terdaftar\n`;
          break;
      }
      if (tempatData) {
        const newData = dataUntukMasuk.filter((item) => !tempatData.includes(item));
        const duplicateData = dataUntukMasuk.filter((item) => tempatData.includes(item));
        tempatData.push(...newData);
        if (duplicateData.length > 0) {
          result += `kode ini udah ada: ${duplicateData.join(', ')}\n`;
        }
        if (isSuccess && newData.length > 0) {
          fs.writeFileSync('./fitur/tambahan/data-buff.json', JSON.stringify(dataBuff, null, 2));
          result += `${newData.length} kode telah ditambahkan`;
        }
      }
    }
    console.log(`ini ada buff yg sesuai namanya: ${isSuccess}`);
    return result.trim();
  } catch (e) {
    console.log(e);
    return e;
  }
}

// ==============================================//

function hapusBuff(apa, isPrem) {
  if (!isPrem) return 'anda tidak bisa';
  let result = '';
  const pisah = apa.split(' ');
  const jenisBuff = pisah[1];
  const dataMauDihapus = pisah.slice(2);
  const dataHapusVerif = [];
  dataMauDihapus.forEach((potongan) => {
    try {
      if (potongan.trim() === '') {
        throw new Error('Empty or whitespace value is not allowed.');
      }
      const noBuff = parseInt(potongan, 10);
      if (Number.isNaN(noBuff)) {
        throw new Error(`'${potongan}' *bukan* angka.`);
      }
      if (noBuff.toString().length !== 7) {
        throw new Error(`'${potongan}' *harus* 7 digit`);
      }
      dataHapusVerif.push(noBuff);
    } catch (e) {
      result += `${e.message}\n`;
    }
  });
  if (dataHapusVerif.length > 0 || jenisBuff.length > 0) {
    try {
      let adaCaseSesuai = true;
      let tempatData;
      switch (jenisBuff.toLowerCase()) {
        case 'atk':
        case 'attack':
          tempatData = atk;
          break;
        case 'matk':
          tempatData = matk;
          break;
        case 'watk':
          tempatData = watk;
          break;
        case 'ampr':
          tempatData = ampr;
          break;
        case 'str':
          tempatData = str;
          break;
        case 'dex':
          tempatData = dex;
          break;
        case 'int':
          tempatData = int;
          break;
        case 'agi':
          tempatData = agi;
          break;
        case 'vit':
          tempatData = vit;
          break;
        case 'cr':
          tempatData = cr;
          break;
        case 'acc':
          tempatData = acc;
          break;
        case 'mp':
          tempatData = mp;
          break;
        case 'hp':
          tempatData = hp;
          break;
        case 'minAggro':
        case '-aggro':
        case '-agg': case 'aggro-': case 'agg-':
          tempatData = minAggro;
          break;
        case 'plusAggro':
        case '+aggro':
        case '+agg': case 'aggro+': case 'agg+':
          tempatData = plusAggro;
          break;
        case 'pres':
        case 'p.res':
          tempatData = pRes;
          break;
        case 'mres':
        case 'm.res':
          tempatData = mRes;
          break;
        case 'frac':
          tempatData = frac;
          break;
        case 'dtedark':
        case 'dte-dark':
        case 'dark':
          tempatData = dteDark;
          break;
        case 'dteearth':
        case 'dte-earth':
        case 'earth':
          tempatData = dteEarth;
          break;
        case 'dtefire':
        case 'dte-fire':
        case 'fire':
          tempatData = dteFire;
          break;
        case 'dtewind':
        case 'dte-wind':
        case 'wind':
          tempatData = dteWind;
          break;
        case 'dtewater':
        case 'dte-water':
        case 'water':
          tempatData = dteWater;
          break;
        case 'dtelight':
        case 'dte-light':
        case 'light':
          tempatData = dteLight;
          break;
        case 'dtenetral':
        case 'dte-netral':
        case 'netral':
          tempatData = dteNetral;
          break;
        default:
          adaCaseSesuai = false;
          console.log('Invalid stat name');
          result += `buff ${jenisBuff} belum atau tidak terdaftar\n`;
          break;
      }
      if (tempatData) {
        const panjangArraySebelumDihapus = tempatData.length;
        const pilihDataKecualiYgDiHapus = tempatData.filter((item) => !dataHapusVerif.includes(item)); // pilih data yg g ada di aray
        const dataYgTidakAda = dataHapusVerif.filter((item) => !tempatData.includes(item));
        tempatData.splice(0, tempatData.length); // Menghapus semua data dalam tempatData
        tempatData.push(...pilihDataKecualiYgDiHapus); // Menambahkan data yang sesuai ke tempatData
        // console.log(`ini data setelah dihapus ${pilihDataKecualiYgDiHapus}`);
        // console.log(`ini jika tidak ada data: ${dataYgTidakAda}`);
        if (dataYgTidakAda.length > 0) {
          result += `kode ini tidak ada: ${dataYgTidakAda.join(', ')}\n`;
        }
        if (adaCaseSesuai && pilihDataKecualiYgDiHapus.length < panjangArraySebelumDihapus) {
          fs.writeFileSync('./fitur/tambahan/data-buff.json', JSON.stringify(dataBuff));
          result += `${panjangArraySebelumDihapus - pilihDataKecualiYgDiHapus.length} kode telah dihapus`;
        }
      }
    } catch (e) {
      console.log(e);
      result += `${e.message}\n`;
    }
  }
  return result.trim();
}

//  =================================================  //

function cariBuff(msgContext) {
  const apa = msgContext.msg;
  const isPrem = msgContext.isprem;
  const msgContex = msgContext;
  if (apa.startsWith('add')) {
    return tambahBuff(apa, isPrem);
  }
  if (apa.startsWith('del')) {
    return hapusBuff(apa, isPrem);
  }
  let result = '';
  try {
    let dataYGdiinginkan;
    switch (apa) {
      case 'atk': case 'attack':
        dataYGdiinginkan = ambilDataAcak(atk);
        break;
      case 'matk':
        dataYGdiinginkan = ambilDataAcak(matk);
        break;
      case 'watk':
        dataYGdiinginkan = ambilDataAcak(watk);
        break;
      case 'ampr':
        dataYGdiinginkan = ambilDataAcak(ampr);
        break;
      case 'str':
        dataYGdiinginkan = ambilDataAcak(str);
        break;
      case 'dex':
        dataYGdiinginkan = ambilDataAcak(dex);
        break;
      case 'int':
        dataYGdiinginkan = ambilDataAcak(int);
        break;
      case 'agi':
        dataYGdiinginkan = ambilDataAcak(agi);
        break;
      case 'vit':
        dataYGdiinginkan = ambilDataAcak(vit);
        break;
      case 'cr':
        dataYGdiinginkan = ambilDataAcak(cr);
        break;
      case 'acc':
        dataYGdiinginkan = ambilDataAcak(acc);
        break;
      case 'mp':
        dataYGdiinginkan = ambilDataAcak(mp);
        break;
      case 'hp':
        dataYGdiinginkan = ambilDataAcak(hp);
        break;
      case 'minAggro': case '-aggro': case '-agg': case 'aggro-': case 'agg-':
        dataYGdiinginkan = ambilDataAcak(minAggro);
        break;
      case 'plusAggro': case '+aggro': case '+agg': case 'aggro+': case 'agg+':
        dataYGdiinginkan = ambilDataAcak(plusAggro);
        break;
      case 'pres': case 'p.res':
        dataYGdiinginkan = ambilDataAcak(pRes);
        break;
      case 'mres': case 'm.res':
        dataYGdiinginkan = ambilDataAcak(mRes);
        break;
      case 'frac':
        dataYGdiinginkan = ambilDataAcak(frac);
        break;
      case 'dtedark': case 'dte-dark': case 'dark':
        dataYGdiinginkan = ambilDataAcak(dteDark);
        break;
      case 'dteearth': case 'dte-earth': case 'earth':
        dataYGdiinginkan = ambilDataAcak(dteEarth);
        break;
      case 'dtefire': case 'dte-fire': case 'fire':
        dataYGdiinginkan = ambilDataAcak(dteFire);
        break;
      case 'dtewind': case 'dte-wind': case 'wind':
        dataYGdiinginkan = ambilDataAcak(dteWind);
        break;
      case 'dtewater': case 'dte-water': case 'water':
        dataYGdiinginkan = ambilDataAcak(dteWater);
        break;
      case 'dtelight': case 'dte-light': case 'light':
        dataYGdiinginkan = ambilDataAcak(dteLight);
        break;
      case 'dtenetral': case 'dte-netral': case 'netral':
        dataYGdiinginkan = ambilDataAcak(dteNetral);
        break;
      case 'dps':
        dataYGdiinginkan = `WEAPON ATK\n${ambilDataAcak(watk)}\nATK\n${ambilDataAcak(atk)}\nMATK\n${ambilDataAcak(matk)}\nAMPR\n${ambilDataAcak(ampr)}\nCRITICAL RATE\n${ambilDataAcak(cr)}\nMAX HP\n${ambilDataAcak(hp)}\nMAX MP\n${ambilDataAcak(mp)}\n-AGGRO\n${ambilDataAcak(minAggro)}`;
        break;
      case 'tank':
        dataYGdiinginkan = `+AGGRO\n${ambilDataAcak(plusAggro)}\nPHYSICAL RESIST\n${ambilDataAcak(pRes)}\nMAGICAL RESIST\n${ambilDataAcak(mRes)}\nFRACTIONAL BARRIER\n${ambilDataAcak(frac)}\nAMPR\n${ambilDataAcak(ampr)}\nMAX MP\n${ambilDataAcak(mp)}`;
        break;
      case 'dte':
        dataYGdiinginkan = `DTE WATER\n${ambilDataAcak(dteWater)}\nDTE FIRE\n${ambilDataAcak(dteFire)}\nDTE EARTH\n${ambilDataAcak(dteEarth)}\nDTE WIND\n${ambilDataAcak(dteWind)}\nDTE LIGHT\n${ambilDataAcak(dteLight)}\nDTE DARK\n${ambilDataAcak(dteDark)}\nDTE NETRAL\n${ambilDataAcak(dteNetral)}`;
        break;
      case 'stat':
        dataYGdiinginkan = `STR\n${ambilDataAcak(str)}\nINT\n${ambilDataAcak(int)}\nVIT\n${ambilDataAcak(vit)}\nAGI\n${ambilDataAcak(agi)}\nDEX\n${ambilDataAcak(dex)}`;
        break;

      default:
        console.log('Invalid stat name');
        msgContex.text = `g ada buff ${apa}`;
        msgContex.type = 'text';
        return msgContex;
    }
    console.log(dataYGdiinginkan);
    if (dataYGdiinginkan === undefined || dataYGdiinginkan.length === 0) {
      msgContex.text = 'g ada, tambahin\n.buff add (jenisbuff) (kode)';
      msgContex.type = 'text';
      return msgContex;
    }
    if (dataYGdiinginkan.length > 0) {
      result += `silahkan buff ${apa}-nya\n${dataYGdiinginkan}`;
    }
    msgContex.text = result.trim();
    msgContex.type = 'text';
    return msgContex;
  } catch (e) {
    console.log(e);
    return e;
  }
}

// console.log(cariBuff('hp', true));

module.exports = cariBuff;
