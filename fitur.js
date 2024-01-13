const { chatAIhandler } = require('./fitur/chat_ai');
const leveling = require('./fitur/coryn');
const { stikerHandler } = require('./fitur/exif');
const download = require('./fitur/fb');
const cariBuff = require('./fitur/listbuff');
const {
  getNote, saveNote, getAllNote, deleteNote,
} = require('./fitur/notes');
const { ytmp3, ytmp4 } = require('./fitur/ytdl');
const { msgReply, msgReact } = require('./msg-formatter');

const fitur = [
  {
    cmd: /^[.](lvl|level|leveling)$/i,
    fun: leveling,
  },
  {
    cmd: /^[.](openai|ai)$/i,
    fun: chatAIhandler,
  },
  {
    cmd: /^[.]s$/i,
    fun: stikerHandler,
  },
  {
    cmd: /^[.]y3$/i,
    fun: ytmp3,
  },
  {
    cmd: /^[.]y4$/i,
    fun: ytmp4,
  },
  {
    cmd: /^[.]fb$/i,
    fun: download,
  },
  {
    cmd: /^[.]buff$/i,
    fun: cariBuff,
  },
  {
    cmd: /^[.]save$/i,
    fun: saveNote,
  },
  {
    cmd: /^[.]get$/i,
    fun: getNote,
  },
  {
    cmd: /^[.](getall|notes)$/i,
    fun: getAllNote,
  },
  {
    cmd: /^[.]delete$/i,
    fun: deleteNote,
  },
  // Tambahkan fitur lain jika diperlukan
];

// Fungsi untuk mencari fitur berdasarkan cmd dan menjalankan fungsi terkait
async function cariDanJalankanFitur(msgContext) {
  // console.log('ini fitur\n', msgContext);
  const msg = msgContext.pesanMasuk;
  const mainRegex = /\.\w*[^\s]/;
  const cmdMain = msg.match(mainRegex);
  const cmdNote = msg.startsWith('/');
  // console.log('cmdMain', cmdMain);
  try {
    if (cmdNote) {
      const nama = msg.slice(1);
      console.error('ini note', nama);
      msgReply(await getNote(msgContext, nama));
      return;
    }
    if (cmdMain) {
      const fiturDitemukan = fitur.find((x) => cmdMain[0]?.match(x.cmd));
      if (fiturDitemukan) {
        msgReact(msgContext.sock, msgContext.jid, msgContext.m, '⏳');
        const result = await fiturDitemukan.fun(msgContext);
        setTimeout(async () => {
          await msgReply(result);
        }, 2000);
      }
    } else {
      console.log(`Fitur dengan cmd '${cmdMain}' tidak ditemukan.`);
    }
  } catch (e) {
    console.log(e);
  }
}

module.exports = cariDanJalankanFitur;
