const fs = require('fs');
const { downloadMedia, generateRandomString, msgReplyMediaProcessing } = require('../msg-formatter');

const dataPath = (jid) => `./fitur/tambahan/notes/${jid}/`;
const cekKeberadaanData = async (jid) => {
  const folderPath = dataPath(jid);
  try {
    // Mengecek keberadaan folder
    if (!fs.existsSync(folderPath)) {
      // Jika folder belum ada, maka buat folder
      fs.mkdirSync(folderPath, { recursive: true });
    }
    if (!fs.existsSync(`${folderPath}media/`)) {
      fs.mkdirSync(`${folderPath}media/`, { recursive: true });
    }
    fs.access(`${dataPath(jid)}data.json`, fs.constants.F_OK, (err) => {
      if (err) {
        fs.writeFileSync(`${dataPath(jid)}data.json`, '[]');
      }
    });
    setTimeout(() => {}, 1000);
  } catch (err) {
    console.log(err);
  }
};

async function saveNote(msgContext) {
  // console.log('ini msg\n', msgContext);
  const {
    jid, m, msg, repliedMsg, msgType, repliedMsgType,
    isGroup, mimetype, isReply, hasMedia, tanggal, filename,
  } = msgContext;
  const msgContex = msgContext;
  // console.log('ini', msg);
  if (msg.length < 1 && !isReply) {
    msgContex.text = 'buat menyimpan apa\n.save "nama" konten';
    msgContex.type = 'text';
    return msgContex;
  }
  const sesuaikan = msg.split(/["']/);
  console.log('ini adalah sesuaikan: ==============\n', sesuaikan, '\n==============');
  const namaUntukNote = sesuaikan[1];
  let text = sesuaikan.slice(2).join().trim();
  console.log('ini pesan reply', repliedMsg);

  let mediaType = '';
  let url = '';
  let proses = '0';

  if (text.length < 1) {
    text = repliedMsg.trim();
  }
  if (text.startsWith('-t') && isReply) text = '';
  console.log('ini konten\n', text);

  try {
    const regex = /(image|video|audio|document)/;
    const mime = {
      imageMessage: 'imageMessage',
      videoMessage: 'videoMessage',
      audioMessage: 'audioMessage',
      documentMessage: 'documentMessage',
    };

    await cekKeberadaanData(jid);
    const existingData = fs.readFileSync(`${dataPath(jid)}data.json`, 'utf8');
    const dataArray = JSON.parse(existingData);

    const isNamaUdahAda = dataArray.find((data) => data.nama === namaUntukNote);
    if (isNamaUdahAda) {
      msgContex.text = 'Nama sudah ada';
      msgContex.type = 'text';
      return msgContex;
    }

    if (hasMedia && !isReply) {
      proses = 'lagi';
      const format = mimetype.split('/')[1];
      // console.log('ini format langsung', format);
      url = `${dataPath(jid)}media/${generateRandomString(5)}_${tanggal}.${format}`;
      const media = await downloadMedia(msgContext);
      const a = msgType.match(regex)[0];
      console.log('ini a', a);
      mediaType = a;
      // console.log('ini media', media);
      fs.writeFile(url, media, (err) => {
        if (err) {
          console.error('Gagal menulis file:', err);
        } else {
          console.log('File berhasil ditulis:', url);
        }
      });
      proses = 'udah';
    }

    if (isReply && hasMedia) { // ini untuk repli
      const type = repliedMsgType;
      proses = 'lagi';
      if (mime[type]) {
        const mimety = m.message?.extendedTextMessage?.contextInfo
          ?.quotedMessage?.[mime[type]].mimetype;
        console.log('ini mimety', mimety);
        const format = mimetype.split('/')[1];
        console.log('format', format);
        const msgsementara = msgContext;
        msgsementara.m = msgReplyMediaProcessing(m, isGroup);
        const media = await downloadMedia(msgsementara);
        url = `${dataPath(jid)}media/${generateRandomString(10)}.${format}`;
        const tipe = type.match(regex)[0];
        mediaType = tipe;
        console.log(url);
        fs.writeFileSync(url, media);
        proses = 'udah';
      }
      if (isGroup) {
        proses = 'udah';
        console.log(true);
      }
    }
    const last = url.split('/');
    let fileName = last[last.length - 1];

    if (filename) fileName = filename;

    const data = {
      nama: namaUntukNote,
      konten: text,
      filename: fileName,
      mediaType,
      url,
      mimetype,
    };

    // console.log('data ===='.bgBlue, data);
    if (!data.konten && (!data.mediaType || !data.url) && proses !== 'udah') {
      msgContex.text = 'tidak ada';
      msgContex.type = 'text';
      return msgContex;
    }

    if (data.konten && (!data.mediaType || !data.url)) {
      data.mediaType = 'text';
    }
    console.log('ini proses', proses);
    if (proses === 'udah' || !hasMedia) {
      dataArray.push(data);

      const dataJSON = JSON.stringify(dataArray, null, 2);
      fs.writeFileSync(`${dataPath(jid)}data.json`, dataJSON, 'utf8');
      msgContex.text = 'Data telah ditambahkan';
      msgContex.type = 'text';
      return msgContex;
    }
    msgContex.text = 'Ada yang salah 😫';
    msgContex.type = 'text';
    return msgContex;
  } catch (err) {
    console.log('Terjadi kesalahan:', err);
    msgContex.text = `Terjadi kesalahan: ${err}`;
    msgContex.type = 'text';
    return msgContex;
  }
}

async function getNote(msgContext, nama) {
  const { jid, msg } = msgContext;
  const final = msgContext;
  if (!nama && !msg) {
    final.text = 'get <nama>';
    final.type = 'text';
    return final;
  }
  const namaNote = nama || msg;
  try {
    cekKeberadaanData(jid);
    const existingData = fs.readFileSync(`${dataPath(jid)}data.json`, 'utf8');
    const dataArray = JSON.parse(existingData);

    const dataYangDiminta = dataArray.find((data) => data.nama === namaNote);

    if (dataYangDiminta?.konten && (!dataYangDiminta?.mediaType || !dataYangDiminta?.url)) {
      dataYangDiminta.mediaType = 'text';
    }

    if (dataYangDiminta) {
      final.url = dataYangDiminta.url;
      final.text = dataYangDiminta.konten;
      final.type = dataYangDiminta.mediaType;
      final.mimetype = dataYangDiminta.mimetype;
      final.filename = dataYangDiminta.filename;
      return final;
    }
    if (!dataYangDiminta) {
      final.text = 'Data tidak ditemukan';
      final.type = 'text';
      return final;
    }
    final.text = 'Terjadi kesalahan 123';
    final.type = 'text';
    return final;
  } catch (err) {
    console.log('Terjadi kesalahan:', err);
    final.text = 'Terjadi kesalahan';
    final.type = 'text';
    return final;
  }
}

async function getAllNote(msgContext) {
  const { jid } = msgContext;
  const final = msgContext;
  try {
    let dataFinal = `List catatan untuk ${jid}\n`;
    cekKeberadaanData(jid);
    const existingData = fs.readFileSync(`${dataPath(jid)}data.json`, 'utf8');
    const dataArray = JSON.parse(existingData);

    if (dataArray.length < 1) {
      final.text = 'Tidak ada data';
      final.type = 'text';
      return final;
    }
    const allNote = dataArray.map((data) => `- \`\`\`${data.nama}\`\`\``).join('\n');
    dataFinal += allNote;
    dataFinal += '\n\nUntuk melihat note gunakan: \n/<nama note>';
    final.text = dataFinal;
    final.type = 'text';
    return final;
  } catch (err) {
    console.error('Terjadi kesalahan:', err);
    final.text = 'Terjadi kesalahan';
    final.type = 'text';
    return final;
  }
}

async function deleteNote(msgContext) {
  const { jid, msg } = msgContext;
  const final = msgContext;
  try {
    await cekKeberadaanData(jid);
    // const existingData = fs.readFileSync(`${dataPath(jid)}data.json`, 'utf8');
    const data1 = fs.readFileSync(`${dataPath(jid)}data.json`, 'utf8');
    const dataArray = JSON.parse(data1);

    const indexDataYangDiminta = dataArray.findIndex((data) => data.nama === msg);
    if (dataArray.length < 1) {
      final.text = 'data masih kosong';
      final.type = 'text';
      return final;
    }

    if (indexDataYangDiminta !== -1) {
      dataArray.splice(indexDataYangDiminta, 1);
      const dataJSON = JSON.stringify(dataArray, null, 2);
      fs.writeFileSync(`${dataPath(jid)}data.json`, dataJSON, 'utf8');
      final.text = 'Data telah dihapus';
      final.type = 'text';
      return final;
    }
    final.text = 'Data tidak ditemukan';
    final.type = 'text';
    return final;
  } catch (err) {
    console.error('Terjadi kesalahan:', err);
    final.text = 'Terjadi kesalahan';
    final.type = 'text';
    return final;
  }
}

module.exports = {
  saveNote,
  getNote,
  getAllNote,
  deleteNote,
};
