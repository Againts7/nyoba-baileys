async function textify(msgContext) {
  const hasil = msgContext;

  try {
    const { extractTextFromImage } = await import('textifyimage');
    // Pada bagian ini, sebaiknya gunakan dynamic import untuk modul lain jika diperlukan.
    const { downloadMedia } = await import('../msg-formatter.js');

    const img = await downloadMedia(msgContext);
    console.log(img);

    await extractTextFromImage(img).then((data) => {
      console.log(data);
      hasil.text = data;
      hasil.type = 'text';
    }).catch((e) => {
      hasil.text = e.message;
      hasil.type = 'text';
      console.error(e);
    });
  } catch (error) {
    hasil.text = `Error: ${error.message}`;
    hasil.type = 'text';
    console.error(error);
  }

  return hasil;
}

module.exports = textify;
