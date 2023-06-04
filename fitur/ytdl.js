const ytdl = require('ytdl-core');
const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');
const { URL } = require('url');
// download mp3

async function ytmp3(link) {
  const urlObject = new URL(link);
  const id = urlObject.pathname.split('/').pop();
  const folderPath = './download/audio';

  try {
    await new Promise((resolve, reject) => {
      fs.readdir(folderPath, (err, files) => {
        if (err) reject(err);
        if (files.length > 0) {
          files.forEach((file) => {
            const filePath = `${folderPath}/${file}`;
            fs.unlink(filePath, (error) => {
              if (error) reject(error);
            });
          });
        }
        resolve();
      });
    });

    const toMp3 = ytdl(link, {
      filter: 'audioonly',
      quality: 'highestaudio',
    });
    const outputPath = await new Promise((resolve, reject) => {
      ffmpeg(toMp3)
        .audioBitrate(128)
        .save(`${folderPath}/${id}.mp3`)
        .on('end', () => {
          resolve(`${folderPath}/${id}.mp3`);
        })
        .on('error', (error) => {
          reject(error);
        });
    });
    return outputPath;
  } catch (e) {
    return e;
  }
}

// download mp4

async function ytmp4(link) {
  const folderPath = './download/video';
  const urlObject = new URL(link);
  const id = urlObject.pathname.split('/').pop();
  try {
    await new Promise((resolve, reject) => {
      fs.readdir(folderPath, (err, files) => {
        if (err) reject(err);
        if (files.length > 0) {
          files.forEach((file) => {
            const filePath = `${folderPath}/${file}`;
            fs.unlink(filePath, (error) => {
              if (error) reject(error);
            });
          });
        }
        resolve();
      });
    });

    const startTime = Date.now();
    const toMp4 = await new Promise((resolve, reject) => {
      let progress = 0;
      ytdl(link, {
        quality: 18,
      })
        .pipe(fs.createWriteStream(`${folderPath}/${id}.mp4`))
        .on('data', (chunk) => {
          progress += chunk.length;
          const percentage = Math.round((progress / ytdl.headers['content-length']) * 100);
          const elapsedTime = (Date.now() - startTime) / 1000; // Waktu yang telah berlalu dalam detik
          process.stdout.clearLine(); // Menghapus baris sebelumnya
          process.stdout.cursorTo(0); // Kembali ke awal baris
          process.stdout.write(`Progress: ${percentage}% | Elapsed Time: ${elapsedTime}s`);
        })
        .on('finish', () => {
          const elapsedTime = (Date.now() - startTime) / 1000;
          console.log(elapsedTime);
          resolve(`${folderPath}/${id}.mp4`);
        })
        .on('error', (error) => {
          reject(error);
        });
    });

    return toMp4;
  } catch (e) {
    console.log(e);
    return e;
  }
}

module.exports = { ytmp3, ytmp4 };
