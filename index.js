/* eslint-disable prefer-template */
/* eslint-disable max-len */
const {
  default: makeWASocket, DisconnectReason,
  useMultiFileAuthState,
} = require('@whiskeysockets/baileys');
const { Boom } = require('@hapi/boom');
// eslint-disable-next-line no-unused-vars
const colors = require('colors');
const {
  msgReply, isAdmin, getWaktu,
} = require('./msg-formatter');
const premUser = require('./config');
const cariDanJalankanFitur = require('./fitur');

async function connectToWhatsApp() {
  const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys');

  const sock = makeWASocket({
    auth: state,
    printQRInTerminal: true,
    defaultQueryTimeoutMs: undefined,
  });

  // console.log('ini sock'.bgWhite, sock.ev.on);

  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect } = update;
    // console.log(`ini updt ${update}`.bgBlue);
    if (connection === 'close') {
      // eslint-disable-next-line max-len
      const shouldReconnect = (lastDisconnect.error = Boom)?.output?.statusCode !== DisconnectReason.loggedOut;
      console.log('connection closed due to '.bgRed, lastDisconnect.error, ', reconnecting '.bgYellow, shouldReconnect);
      // reconnect if not logged out
      if (shouldReconnect) {
        console.log('aieuo'.random);
        connectToWhatsApp();
      }
    } else if (connection === 'open') {
      console.log('opened connection'.bgGreen);
    }
  });

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('messages.upsert', async ({ messages, type }) => {
    const m = messages[0]; // @@@@@@@@@@@@@@@@@@@#######################
    const prefix = '.';
    const forgetnote = '/';
    // console.log(`ini tipe: ${type}`);
    // if ((type === 'notify') && m.key.fromMe) {
    //   const jid = m.key.remoteJid;
    //   sock.sendMessage(jid, { sticker: { url: 'C:\\Users\\ASUS\\baileys\\fitur\\tambahan\\2.gif' } });
    //   return;
    // }
    if ((type === 'notify' || type === 'append') && !m.key.fromMe) {
      try {
        const { waktu, tanggal } = getWaktu();

        // dapatkan jid pengirim dan isi pesan
        const jid = m.key.remoteJid; // kalau grup, ada pembuat grup nya

        let pesanMasuk = '';

        if (!pesanMasuk) {
          const chatViaPM = m.message?.conversation;
          const chatViaGroup = m.message?.extendedTextMessage?.text; // ini kalau chat nya di waktu
          const imageWithCaption = m.message?.imageMessage?.caption;
          const videoWithCaption = m.message?.videoMessage?.caption;
          const documentWithCaption = m.message?.documentWithCaptionMessage?.message?.documentMessage?.caption;
          pesanMasuk = chatViaPM || chatViaGroup || imageWithCaption || videoWithCaption || documentWithCaption;
        }

        let isiPesanReply = '';
        const isQuotedMsg = m.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        // console.log('ini quoted'.bgRed, m.message?.extendedTextMessage?.contextInfo);

        if (isQuotedMsg) {
          const quotedwithlink = isQuotedMsg?.extendedTextMessage?.text;
          const quotedMsg = isQuotedMsg?.conversation;
          const quotedImageMsg = isQuotedMsg?.imageMessage?.caption;
          const quotedVideoMsg = isQuotedMsg?.videoMessage?.caption;
          const quotedDocMsg = isQuotedMsg?.documentMessage?.caption || isQuotedMsg?.documentWithCaptionMessage?.message?.documentMessage?.caption;
          isiPesanReply = quotedMsg || quotedImageMsg || quotedVideoMsg || quotedDocMsg || quotedwithlink;
        }

        // ini pemisah
        const tipePesan = Object.keys(m?.message)[0];
        let mediaMimetype;
        // conversation = grup & pm (text only)
        if (tipePesan !== 'conversation') {
          const mimetypeAudio = m.message?.audioMessage?.mimetype;
          const mimetypeImage = m.message?.imageMessage?.mimetype;
          const mimetypeVideo = m.message?.videoMessage?.mimetype;
          const mimetypeDoc = m.message?.documentMessage?.mimetype || m.message?.documentWithCaptionMessage?.message?.documentMessage?.mimetype;
          mediaMimetype = mimetypeAudio || mimetypeImage || mimetypeVideo || mimetypeDoc;
        }
        const docName = m.message?.documentMessage?.fileName || m.message?.documentWithCaptionMessage?.message?.documentMessage?.fileName;

        // console.log('ini mimetype: ', mediaMimetype);

        // extendedTextMessage = chat reply atau di waktu bisa digrup kalau.text
        const tipePesanReply = Object.keys(m.message?.extendedTextMessage?.contextInfo?.quotedMessage || {})[0];
        let quotedMediaMimetype;

        if (tipePesanReply !== 'conversation') {
          const quotedImageMimetype = isQuotedMsg?.imageMessage?.mimetype;
          const quotedAudioMimetype = isQuotedMsg?.audioMessage?.mimetype;
          const quotedVideoMimetype = isQuotedMsg?.videoMessage?.mimetype;
          const quotedDocMimetype = isQuotedMsg?.documentMessage?.mimetype || isQuotedMsg?.documentWithCaptionMessage?.message?.documentMessage?.mimetype;
          quotedMediaMimetype = quotedAudioMimetype || quotedImageMimetype || quotedVideoMimetype || quotedDocMimetype;
        }
        const quotedDocName = isQuotedMsg?.documentMessage?.fileName || isQuotedMsg?.documentWithCaptionMessage?.message?.documentMessage?.fileName;

        // console.log('ini reply mimetype', quotedMediaMimetype);
        // const tipePesan = fitMimetype[mimetypeDoc] ? fitMimetype[mimetypeDoc] : Object.keys(m?.message)[0];

        // console.log('ini m.messge: '.bgRed, m?.message);

        // const tipePesanReply = (Object.keys(m.message?.extendedTextMessage?.contextInfo?.quotedMessage || {})[0] === 'documentWithCaptionMessage' || Object.keys(m.message?.extendedTextMessage?.contextInfo?.quotedMessage || {})[0] === 'documentMessage') ? fitMimetype[quotedDocMimetype] : Object.keys(m.message?.extendedTextMessage?.contextInfo?.quotedMessage || {})[0];
        // console.log(mimetypeDoc ? `ini mimetype dokumen sebelum diubah: ${mimetypeDoc}\n` : '', quotedDocMimetype ? `ini mimetype dokumen yg di reply sebelum diubah: ${quotedDocMimetype}\n` : '');
        // ini pemisah

        const pesanSplit = pesanMasuk?.split(' ') || '';

        const cmd = pesanSplit[0]; // misal ".ai apa itu?", akan mengambil (.ai)
        const pesanIsiCommand = pesanSplit ? pesanSplit?.slice(1).join(' ') : ''; // ini untuk mengambil teks sisanya (apa itu?)
        const isGroup = jid.includes('@g.us');
        const no = isGroup ? m.key.participant.split('@')[0] : m.key.remoteJid.split('@')[0];
        const isPrem = premUser.includes(no);
        const isReply = !!tipePesanReply;
        const isDoc = !!docName || !!quotedDocName;
        const hasMedia = !!mediaMimetype || !!quotedMediaMimetype;
        const mimetype = mediaMimetype || quotedMediaMimetype;
        const filename = docName || quotedDocName;

        // console.log('apakah reply? ', isReply, 'apakah dokumen', isDoc);

        // console.log('Pesan masuk: '.bgRed, pesanMasuk || tipePesan, '\n========================================================================'.america);
        const infoGroup = isGroup ? await sock.groupMetadata(jid) : null;
        // const foto = await sock.profilePictureUrl(jid);
        const namaGrup = infoGroup?.subject.yellow || null;
        // const memberGrup = infoGroup?.participant || null;

        const msgContext = {
          sock,
          jid,
          m,
          waktu,
          tanggal,
          no,
          isGroup,
          isPrem,
          isReply,
          hasMedia,
          isDoc,
          filename,
          mimetype,
          pesanMasuk,
          msg: pesanIsiCommand,
          msgType: tipePesan,
          repliedMsg: isiPesanReply,
          repliedMsgType: tipePesanReply,
        };

        // console.log('apakah admin: ', await isAdmin(infoGroup, no));

        if (pesanMasuk?.startsWith(prefix) || pesanMasuk?.startsWith(forgetnote)) {
          const pembatasIsiPesan = (pesan) => {
            if (pesan.length > 75) {
              return `${pesan.substring(0, 75)} ... ${pesan.length - 75} lainnya`;
            }
            return pesan;
          };

          const via = `${isGroup ? `Grup => ${namaGrup}, Apakah admin: ${(await isAdmin(infoGroup, no))}` : 'Pesan pribadi'.random}`;
          const RplyMsgTyp = tipePesanReply ? '| Tipe pesan reply : ' + `${tipePesanReply} `.grey : '';
          const rplymsg = isiPesanReply ? `\n===== Isi Pesan Reply: ${pembatasIsiPesan(isiPesanReply)}\n` : '\n';

          console.log(` ${waktu} `.random.bgWhite, ` ${tanggal} `.rainbow.bgYellow);
          console.log((`===== Pesan dari: ${m.pushName.blue}, Nomor: +${no.red} | Melalui: ${via}`).green);
          console.log((tipePesan ? `===== Tipe pesan: ${tipePesan}`.magenta : ''), RplyMsgTyp, '| Ada media?:', hasMedia ? `${hasMedia}`.yellow + ' | Mimetype: ' + `${mimetype}`.america : hasMedia);
          console.log(`===== Kommand: ${cmd.bgRed} `);
          console.log(pesanIsiCommand ? `===== Isi Pesan: ${pembatasIsiPesan(pesanIsiCommand)}`.rainbow : '', rplymsg.cyan);

          try {
            // console.log('ini msg index\n', msgContext);
            await cariDanJalankanFitur(msgContext);
          } catch (e) {
            console.log(e);
            if (e.code.length > 1) {
              msgReply(sock, jid, m, { text: e.code });
            }
          }
        }
      } catch (e) {
        console.log(e);
      }
    }
  });
}

connectToWhatsApp();
