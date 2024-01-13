const { downloadMediaMessage } = require('@whiskeysockets/baileys');
const crypto = require('crypto');
// eslint-disable-next-line no-unused-vars
const colors = require('colors');

function msgReact(sock, jid, m, text) {
  sock.sendMessage(
    jid,
    {
      react: {
        text,
        key: m.key,
      },
    },
  );
}

function msgReply(msgContext) {
  // console.log('ini msg repli kontek\n', msgContext);
  const {
    sock, jid, m, text, type, url, mimetype, filename,
  } = msgContext;
  try {
    let balas;
    if (type === 'text') {
      balas = { text };
    }
    if (type === 'image') {
      if (text) {
        balas = { image: { url }, caption: text };
      } else {
        balas = { image: { url } };
      }
    }
    if (type === 'video') {
      if (text) {
        balas = { video: { url }, caption: text };
      } else {
        balas = { video: { url } };
      }
    }
    if (type === 'audio') {
      if (text) {
        balas = { document: { url }, caption: text, mimetype: 'audio/mpeg' };
      } else {
        balas = { audio: { url }, mimetype: 'audio/mpeg' };
      }
    }
    if (type === 'sticker') {
      balas = { sticker: { url } };
    }
    if (type === 'document') {
      if (text) {
        balas = {
          document: { url }, caption: text, mimetype, fileName: filename,
        };
      } else {
        balas = { document: { url }, mimetype, fileName: filename };
      }
    }

    console.log('Ini balas:\n', `Tipe: ${type}\n`, `Teks: ${(balas.text?.length > 70 ? `${balas.text.substring(0, 75)}.....` : balas.text) || url}`);
    // console.log(balas);
    sock.sendMessage(
      jid,
      balas,
      { quoted: m },
    );
    setTimeout(() => {
      msgReact(sock, jid, m, '');
    }, 2000);
    console.log('\n####### (selesai) #######\n'.random.italic, '\n========================================================================'.america);
  } catch (e) {
    msgReact(sock, jid, m, '⚠️');
    console.log(e);
  }
}

function msgReplyMediaProcessing(m, isGroup) {
  const konteks = [];
  konteks.push(m.message.extendedTextMessage.contextInfo);
  const hasil = konteks.map((msg) => ({
    key: {
      remoteJid: isGroup ? m.key.remoteJid : msg.participant,
      fromMe: false,
      id: msg.stanzaId,
      participant: isGroup ? msg.participant : undefined,
    },
    message: msg.quotedMessage,
  }));
  return hasil[0];
}

async function downloadMedia(msgContext) {
  const { sock, m } = msgContext;
  return downloadMediaMessage(
    m,
    'buffer',
    { },
    {
      reuploadRequest: sock.updateMediaMessage,
    },
  );
}

function generateRandomString(length) {
  const randomString = crypto.randomBytes(Math.ceil(length / 2))
    .toString('hex') // Mengonversi byte ke string hexadecimal
    .slice(0, length); // Mengambil panjang string yang diinginkan

  return randomString;
}

async function isAdmin(infoGroup, no) {
  const memberGrup = infoGroup?.participants;
  const match = memberGrup.find((data) => typeof data.id === 'string' && data.id.includes(no));
  if (match && (match.admin === 'admin' || match.admin === 'superadmin')) return true;
  return false;
}

function spasi(text) {
  return ' '.repeat(process.stdout.columns - text.length) + text;
}

module.exports = {
  msgReact, msgReply, msgReplyMediaProcessing, downloadMedia, generateRandomString, isAdmin, spasi,
};
