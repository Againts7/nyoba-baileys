/* eslint-disable max-len */
/* eslint-disable no-unused-vars */
const {
  default: makeWASocket, DisconnectReason, BufferJSON,
  useMultiFileAuthState, downloadMediaMessage, MessageType, MessageOptions, Mimetype, downloadContentFromMessage, generateWAMessageFromContent,
} = require('@whiskeysockets/baileys');
const { Boom } = require('@hapi/boom');
const fs = require('fs');
const leveling = require('./fitur/coryn');
const { msgReply, msgReact, msgReplyMediaProcessing } = require('./msg-formatter');
const {
  buatStikerV, buatStikerG,
} = require('./fitur/exif');
const chatAIhandler = require('./fitur/chat_ai');
const { ytmp3, ytmp4 } = require('./fitur/ytdl');
const download = require('./fitur/fb');
const download2 = require('./fitur/fb1');
const cariBuff = require('./fitur/listbuff');
const premUser = require('./config');

async function connectToWhatsApp() {
  const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys');

  const sock = makeWASocket({
    auth: state,
    printQRInTerminal: true,
    defaultQueryTimeoutMs: undefined,
  });

  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect } = update;
    if (connection === 'close') {
      // eslint-disable-next-line max-len
      const shouldReconnect = (lastDisconnect.error = Boom)?.output?.statusCode !== DisconnectReason.loggedOut;
      console.log('connection closed due to ', lastDisconnect.error, ', reconnecting ', shouldReconnect);
      // reconnect if not logged out
      if (shouldReconnect) {
        connectToWhatsApp();
      }
    } else if (connection === 'open') {
      console.log('opened connection');
    }
  });

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('messages.upsert', async ({ messages, type }) => {
    const m = messages[0]; // @@@@@@@@@@@@@@@@@@@#######################
    const prefix = '.';
    if (type === 'notify' && !m.key.fromMe) {
      try {
        // dapatkan jid pengirim dan isi pesan
        const jid = m.key.remoteJid; // kalau grup, ada pembuat grup nya
        const tipePesan = Object.keys(m.message)[0];

        let pesanMasuk = '';

        // const isiPesanYgDiReply = m.message.extendedTextMessage.contextInfo.quotedMessage;
        // const konteks = m.message.extendedTextMessage.contextInfo;

        if (m.message.imageMessage && m.message.imageMessage.caption !== null) {
          pesanMasuk = m.message.imageMessage.caption; // ini kalau caption image
        } else if (m.message.extendedTextMessage
            && m.message.extendedTextMessage.text !== null) {
          pesanMasuk = m.message.extendedTextMessage.text; // ini via grup
        } else if (m.message.videoMessage && m.message.videoMessage.caption !== null) {
          pesanMasuk = m.message.videoMessage.caption; // ini kalau caption video
        } else {
          pesanMasuk = m.message.conversation; // berarti ini via pm
        }

        const pesanSplit = pesanMasuk.split(' ') || '';

        const pesanUntukCommand = pesanSplit[0]; // misal ".ai apa itu?", akan mengambil (.ai)
        const pesanIsiCommand = pesanSplit.slice(1).join(' '); // ini untuk mengambil teks sisanya (apa itu?)
        const apaPesanDiGrup = jid.includes('@g.us');
        const no = apaPesanDiGrup ? m.key.participant.split('@')[0] : m.key.remoteJid.split('@')[0];
        const isPrem = premUser.includes(no);
        console.log(isPrem);

        if (pesanMasuk.startsWith(prefix)) {
          let tipePesanReply = '';
          if (m.message.extendedTextMessage
            && ((m.message.extendedTextMessage.contextInfo !== undefined
              && m.message.extendedTextMessage.contextInfo !== null)
            && (m.message.extendedTextMessage.contextInfo.quotedMessage !== undefined
              || m.message.extendedTextMessage.contextInfo.quotedMessage !== null))) {
            console.log(typeof m.message.extendedTextMessage.contextInfo);
            const [tipePesanReplyKey] = Object.keys(m.message.extendedTextMessage.contextInfo.quotedMessage || {});
            tipePesanReply = tipePesanReplyKey || '';
            if (tipePesanReply === 'documentMessage' && tipePesanReply !== 'imageMessage') {
              const docReplyType = m.message.extendedTextMessage.contextInfo.quotedMessage.documentMessage.mimetype;
              if (docReplyType === 'image/jpeg' || docReplyType === 'video/mp4') {
                if (docReplyType === 'image/jpeg') {
                  tipePesanReply = 'imageMessage';
                }
                tipePesanReply = 'videoMessage';
              }
            }
          }

          console.log(`===== Pesan dari: ${m.pushName}, Nomor: +${no}`);
          console.log(`===== Kommand: ${pesanUntukCommand}\n===== Isi Pesan: ${pesanIsiCommand}`);
          let balas;
          let selesai = true;
          try {
            switch (pesanUntukCommand.slice(1)) {
              case 'lvling':
                if (pesanIsiCommand.length < 1) {
                  balas = { text: `${prefix}lvling (level)` };
                  return;
                }
                msgReact(sock, jid, m, '⏳');
                balas = { text: await leveling(pesanIsiCommand) };
                break;

              case 's':
                if ((tipePesan !== 'imageMessage' && tipePesan !== 'videoMessage') && (tipePesanReply !== 'videoMessage' && tipePesanReply !== 'imageMessage')) {
                  balas = { text: 'mana' };
                  return;
                }

                msgReact(sock, jid, m, '⏳');

                if (tipePesan === 'imageMessage' || tipePesan === 'videoMessage') {
                  console.log('ini udah masuk ke buat stiker gambar/video tanpa reply');
                  if (tipePesan === 'imageMessage') {
                    balas = { sticker: { url: `${await buatStikerG(sock, m)}` } };
                  }
                  balas = { sticker: { url: `${await buatStikerV(sock, m)}` } };
                }

                if (tipePesanReply === 'imageMessage' || tipePesanReply === 'videoMessage') {
                  if (tipePesanReply === 'imageMessage') {
                    balas = { sticker: { url: `${await buatStikerG(sock, await msgReplyMediaProcessing(m, apaPesanDiGrup))}` } };
                  }
                  balas = { sticker: { url: `${await buatStikerV(sock, await msgReplyMediaProcessing(m, apaPesanDiGrup))}` } };
                }

                break;

              case 'ai':
                if (pesanIsiCommand.length < 1) {
                  balas = { text: 'chat dengan AI' };
                  return;
                }
                msgReact(sock, jid, m, '⏳');
                balas = { text: await chatAIhandler(pesanIsiCommand) };
                break;

              case 'ytmp3':
                if (pesanIsiCommand.length < 1) {
                  balas = { text: 'donlot mp3 dari yutup' };
                  return;
                }
                msgReact(sock, jid, m, '⏳');
                // balas = { audio: { url: './download/audio/-0CBKfzMr4k.mp3' }, mimetype: 'audio/mpeg' };

                balas = { audio: { url: await ytmp3(pesanIsiCommand) }, mimetype: 'audio/mpeg' };
                break;

              case 'ytmp4':
                if (pesanIsiCommand.length < 1) {
                  balas = { text: 'donlot vidio dari yutup' };
                  return;
                }
                msgReact(sock, jid, m, '⏳');
                // balas = { video: fs.readFileSync('./download/video/AAKsX-uqinU.mp4') };
                balas = { video: fs.readFileSync(await ytmp4(pesanIsiCommand)) };
                break;

              case 'fb':
                if (pesanIsiCommand.length < 1) {
                  balas = { text: 'donlot vidio dari pesbuk' };
                  return;
                }
                msgReact(sock, jid, m, '⏳');
                balas = { video: fs.readFileSync(await download(pesanIsiCommand)) };
                break;
              case 'fb2':
                if (pesanIsiCommand.length < 1) {
                  balas = { text: 'donlot vidio dari pesbuk' };
                  return;
                }
                msgReact(sock, jid, m, '⏳');
                balas = { video: fs.readFileSync(await download2(pesanIsiCommand)) };
                break;

              case 'buff': case 'listbuff':
                if (pesanIsiCommand.length < 1) {
                  balas = { text: 'nyoba buat list buff' };
                  return;
                }
                balas = { text: cariBuff(pesanIsiCommand, isPrem) };
                break;

              default:
                // Default case if none of the above conditions match
                msgReact(sock, jid, m, '🔥');
                break;
            }
          } catch (e) {
            console.log(e);
            selesai = false;
            msgReact(sock, jid, m, '⚠️');
          } finally {
            console.log(balas);
            if (balas !== undefined) {
              msgReply(sock, jid, m, balas);
            }
            setTimeout(() => {
              if (selesai) {
                msgReact(sock, jid, m, '');
              }
            }, 2000);

            console.log('selesai');
          }
        }
      } catch (e) {
        console.log(e);
      }
    }
  });
}

connectToWhatsApp();
