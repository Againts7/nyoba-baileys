const ytdl = require('ytdl-core');
const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');
const { URL } = require('url');
// download mp3

const os = require('os');
const path = require('path');

async function ytmp3(link) {
  const urlObject = new URL(link);
  const id = urlObject.pathname.split('/').pop();
  const tempDir = os.tmpdir(); // Menggunakan direktori sementara
  const tempFilePath = path.join(tempDir, `${id}.mp3`);

  try {
    const toMp3 = ytdl(link, {
      filter: 'audioonly',
      quality: 'highestaudio',
    });
    await new Promise((resolve, reject) => {
      ffmpeg(toMp3)
        .audioBitrate(128)
        .save(tempFilePath)
        .on('end', () => {
          resolve(tempFilePath);
        })
        .on('error', (error) => {
          reject(error);
        });
    });
    return tempFilePath;
  } catch (e) {
    console.log(e);
    throw e;
  }
}

// download mp4

async function ytmp4(link) {
  const urlObject = new URL(link);
  const id = urlObject.pathname.split('/').pop();
  const tempDir = os.tmpdir(); // Menggunakan direktori sementara
  const tempFilePath = path.join(tempDir, `${id}.mp4`);

  try {
    const startTime = Date.now();
    const toMp4 = await new Promise((resolve, reject) => {
      ytdl(link, {
        quality: 18,
      })
        .pipe(fs.createWriteStream(tempFilePath))
        .on('finish', () => {
          const elapsedTime = (Date.now() - startTime) / 1000;
          console.log(elapsedTime);
          resolve(tempFilePath);
        })
        .on('error', (error) => {
          reject(error);
        });
    });

    return toMp4;
  } catch (e) {
    console.log(e);
    throw e;
  }
}

// await new Promise((resolve, reject) => {
//   fs.readdir(folderPath, (err, files) => {
//     if (err) reject(err);
//     if (files.length > 0) {
//       files.forEach((file) => {
//         const filePath = `${folderPath}/${file}`;
//         fs.unlink(filePath, (error) => {
//           if (error) reject(error);
//         });
//       });
//     }
//     resolve();
//   });
// });

// await new Promise((resolve, reject) => {
//   fs.readdir(folderPath, (err, files) => {
//     if (err) reject(err);
//     if (files.length > 0) {
//       files.forEach((file) => {
//         const filePath = `${folderPath}/${file}`;
//         fs.unlink(filePath, (error) => {
//           if (error) reject(error);
//         });
//       });
//     }
//     resolve();
//   });
// });
module.exports = { ytmp3, ytmp4 };
