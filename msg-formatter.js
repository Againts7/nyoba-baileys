function msgReply(sock, jid, m, text) {
  sock.sendMessage(
    jid,
    text,
    { quoted: m },
  );
}

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

function msgReplyMediaProcessing(m, apaPesanDiGrup) {
  const konteks = [];
  konteks.push(m.message.extendedTextMessage.contextInfo);
  const hasil = konteks.map((msg) => ({
    key: {
      remoteJid: apaPesanDiGrup ? m.key.remoteJid : msg.participant,
      fromMe: false,
      id: msg.stanzaId,
      participant: apaPesanDiGrup ? msg.participant : undefined,
    },
    message: msg.quotedMessage,
  }));
  return hasil[0];
}

module.exports = { msgReact, msgReply, msgReplyMediaProcessing };
