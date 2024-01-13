const fs = require('fs');
const { tmpdir } = require('os');
const Crypto = require('crypto');
const ff = require('fluent-ffmpeg');
const webp = require('node-webpmux');
const path = require('path');
const { downloadMediaMessage } = require('@whiskeysockets/baileys');
const { msgReplyMediaProcessing } = require('../msg-formatter');

async function imageToWebp(media) {
  const tmpFileOut = path.join(
    tmpdir(),
    `${Crypto.randomBytes(6).readUIntLE(0, 6).toString(36)}.webp`, // kripto untuk random nama ternyata
  );
  const tmpFileIn = path.join(
    tmpdir(),
    `${Crypto.randomBytes(6).readUIntLE(0, 6).toString(36)}.jpg`,
  );
  fs.writeFileSync(tmpFileIn, media);
  await new Promise((resolve, reject) => {
    ff(tmpFileIn)
      .on('error', reject)
      .on('end', () => resolve(true))
      .addOutputOptions([
        '-vcodec',
        'libwebp',
        '-vf',
        "scale='min(320,iw)':min'(320,ih)':force_original_aspect_ratio=decrease,fps=15, pad=320:320:-1:-1:color=white@0.0, split [a][b]; [a] palettegen=reserve_transparent=on:transparency_color=ffffff [p]; [b][p] paletteuse",
      ])
      .toFormat('webp')
      .save(tmpFileOut);
  });
  const buff = fs.readFileSync(tmpFileOut);
  fs.unlinkSync(tmpFileOut);
  fs.unlinkSync(tmpFileIn);
  return buff;
}

async function videoToWebp(media) {
  const tmpFileOut = path.join(
    tmpdir(),
    `${Crypto.randomBytes(6).readUIntLE(0, 6).toString(36)}.webp`,
  );
  const tmpFileIn = path.join(
    tmpdir(),
    `${Crypto.randomBytes(6).readUIntLE(0, 6).toString(36)}.mp4`,
  );
  fs.writeFileSync(tmpFileIn, media);
  await new Promise((resolve, reject) => {
    ff(tmpFileIn)
      .on('error', reject)
      .on('end', () => resolve(true))
      .addOutputOptions([
        '-vcodec',
        'libwebp',
        '-vf',
        "scale='min(320,iw)':min'(320,ih)':force_original_aspect_ratio=decrease,fps=24, pad=320:320:-1:-1:color=white@0.0, split [a][b]; [a] palettegen=reserve_transparent=on:transparency_color=ffffff [p]; [b][p] paletteuse",
        '-loop',
        '0',
        '-ss',
        '00:00:00',
        '-t',
        '00:00:07',
        '-preset',
        'default',
        '-an',
        '-vsync',
        '0',
      ])
      .toFormat('webp')
      .save(tmpFileOut);
  });
  const buff = fs.readFileSync(tmpFileOut);
  fs.unlinkSync(tmpFileOut);
  fs.unlinkSync(tmpFileIn);
  return buff;
}

async function writeExifImg(media, metadata) {
  const wMedia = await imageToWebp(media);
  const tmpFileIn = path.join(
    tmpdir(),
    `${Crypto.randomBytes(6).readUIntLE(0, 6).toString(36)}.webp`,
  );
  const tmpFileOut = path.join(
    tmpdir(),
    `${Crypto.randomBytes(6).readUIntLE(0, 6).toString(36)}.webp`,
  );
  fs.writeFileSync(tmpFileIn, wMedia);
  if (metadata.packname || metadata.author) {
    const img = new webp.Image();
    const json = {
      'sticker-pack-id': 'https://github.com/DikaArdnt/Hisoka-Morou',
      'sticker-pack-name': metadata.packname,
      'sticker-pack-publisher': metadata.author,
      emojis: metadata.categories ? metadata.categories : [''],
    };
    const exifAttr = Buffer.from([
      0x49, 0x49, 0x2a, 0x00, 0x08, 0x00, 0x00, 0x00, 0x01, 0x00, 0x41, 0x57,
      0x07, 0x00, 0x00, 0x00, 0x00, 0x00, 0x16, 0x00, 0x00, 0x00,
    ]);
    const jsonBuff = Buffer.from(JSON.stringify(json), 'utf-8');
    const exif = Buffer.concat([exifAttr, jsonBuff]);
    exif.writeUIntLE(jsonBuff.length, 14, 4);
    await img.load(tmpFileIn);
    fs.unlinkSync(tmpFileIn);
    img.exif = exif;
    await img.save(tmpFileOut);
    return tmpFileOut;
  }
  return false;
}

async function writeExifVid(media, metadata) {
  const wMedia = await videoToWebp(media);
  const tmpFileIn = path.join(
    tmpdir(),
    `${Crypto.randomBytes(6).readUIntLE(0, 6).toString(36)}.webp`,
  );
  const tmpFileOut = path.join(
    tmpdir(),
    `${Crypto.randomBytes(6).readUIntLE(0, 6).toString(36)}.webp`,
  );
  fs.writeFileSync(tmpFileIn, wMedia);
  if (metadata.packname || metadata.author) {
    const img = new webp.Image();
    const json = {
      'sticker-pack-id': 'https://dikode-team.com',
      'sticker-pack-name': metadata.packname,
      'sticker-pack-publisher': metadata.author,
      emojis: metadata.categories ? metadata.categories : [''],
    };
    const exifAttr = Buffer.from([
      0x49, 0x49, 0x2a, 0x00, 0x08, 0x00, 0x00, 0x00, 0x01, 0x00, 0x41, 0x57,
      0x07, 0x00, 0x00, 0x00, 0x00, 0x00, 0x16, 0x00, 0x00, 0x00,
    ]);
    const jsonBuff = Buffer.from(JSON.stringify(json), 'utf-8');
    const exif = Buffer.concat([exifAttr, jsonBuff]);

    exif.writeUIntLE(jsonBuff.length, 14, 4);
    await img.load(tmpFileIn);
    fs.unlinkSync(tmpFileIn);
    img.exif = exif;
    await img.save(tmpFileOut);
    return tmpFileOut;
  }
  return false;
}

async function buatStikerG(sock, m) {
  try {
    const metadata = {
      packname: 'idk',
      author: 'idk',
    };
    const buffer = await downloadMediaMessage(
      m,
      'buffer',
      { },
      {
        reuploadRequest: sock.updateMediaMessage,
      },
    );
    const jadi = await writeExifImg(buffer, metadata);
    return jadi;
  } catch (e) {
    return e;
  }
}

async function buatStikerV(sock, m) {
  try {
    const metadata = {
      packname: 'idk',
      author: 'idk',
    };
    const buffer = await downloadMediaMessage(
      m,
      'buffer',
      { },
      {
        reuploadRequest: sock.updateMediaMessage,
      },
    );
    const jadi = await writeExifVid(buffer, metadata);
    return jadi;
  } catch (e) {
    return e;
  }
}

async function stikerHandler(msgContext) {
  const {
    sock, m, isGroup,
  } = msgContext;
  const msgContex = msgContext;
  try {
    if (msgContext.repliedMsgType === 'conversation') {
      msgContex.text = 'cuma bisa gambar sama vidio xixixi';
      msgContex.type = 'text';
      return msgContex;
    }
    if (msgContext.repliedMsgType === 'stickerMessage') {
      msgContex.text = 'itu udah jadi stiker';
      msgContex.type = 'text';
      return msgContex;
    }
    if ((msgContext.msgType !== 'imageMessage' && msgContext.msgType !== 'videoMessage') && (msgContext.repliedMsgType !== 'videoMessage' && msgContext.repliedMsgType !== 'imageMessage')) {
      msgContex.text = 'mana';
      msgContex.type = 'text';
      return msgContex;
    }

    // console.log(msgContext.msgType || msgContext.repliedMsgType);

    if (msgContext.msgType === 'imageMessage' || msgContext.msgType === 'videoMessage' || msgContext.msgType === 'documentMessage') {
      console.log('ini udah masuk ke buat stiker gambar/video tanpa reply');
      if (msgContext.msgType === 'imageMessage') {
        msgContex.url = `${await buatStikerG(sock, m)}`;
      }
      msgContex.url = `${await buatStikerV(sock, m)}`;
    }

    if (msgContext.repliedMsgType === 'imageMessage' || msgContext.repliedMsgType === 'videoMessage') {
      if (msgContext.repliedMsgType === 'imageMessage') {
        msgContex.url = `${await buatStikerG(sock, await msgReplyMediaProcessing(m, isGroup))}`;
      }
      msgContex.url = `${await buatStikerV(sock, await msgReplyMediaProcessing(m, isGroup))}`;
    }
    msgContex.type = 'sticker';
    return msgContex;
  } catch (e) {
    console.log(e);
    msgContex.text = e;
    msgContex.type = 'text';
    return msgContex;
  }
}

module.exports = {
  imageToWebp, videoToWebp, writeExifImg, writeExifVid, buatStikerG, buatStikerV, stikerHandler,
};
