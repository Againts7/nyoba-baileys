/* eslint-disable no-unused-vars */
const fbInfoVideo = require('fb-info-video');
const axios = require('axios');
const fs = require('fs');
const getFBInfo = require('@xaviabot/fb-downloader');

async function getLink(url) {
  try {
    let link = url;
    let linkVideo = '';
    let id = '';

    if (url.startsWith('hd')) {
      const [_, iniLing] = url.split(' ');
      link = iniLing;
      const result = await getFBInfo(link);
      linkVideo = await result.hd;
      id = await result.title;
    } else {
      const result = await getFBInfo(link);
      linkVideo = await result.sd;
      id = await result.title;
    }

    return { linkVideo, id };
  } catch (e) {
    console.log(e.code);
    throw e;
  }
}

// async function getLink(url) {
//   try {
//     const info = await fbInfoVideo.getInfo(url);
//     const link = info.video.url_video;
//     const ID = info.author.id;
//     return { link, ID };
//   } catch (err) {
//     console.log(err);
//     throw err;
//   }
// }

const os = require('os');
const path = require('path');

async function download(linkFB) {
  const { linkVideo, id } = await getLink(linkFB);
  const tempDir = os.tmpdir(); // Menggunakan direktori sementara
  const tempFilePath = path.join(tempDir, `${id}.mp4`);

  const file = fs.createWriteStream(tempFilePath);

  return axios({
    method: 'get',
    url: linkVideo,
    responseType: 'stream',
  }).then((response) => new Promise((resolve, reject) => {
    response.data.pipe(file);
    let error = null;
    file.on('error', (err) => {
      error = err;
      file.close();
      reject(err);
    });
    file.on('close', () => {
      if (!error) {
        resolve(tempFilePath);
      }
    });
  }));
}

// const folderPath = './download/video';
// await new Promise((resolve, reject) => {
//   fs.readdir(folderPath, (err, files) => {
//     if (err) reject(err);
//     if (files.length > 3) {
//       files.forEach((obj) => {
//         const filePath = `${folderPath}/${obj}`;
//         fs.unlink(filePath, (error) => {
//           if (error) reject(error);
//         });
//       });
//     }
//     resolve();
//   });
// });

// const link = 'https://fb.watch/k_QVTKM6nl';

// download(link);

module.exports = download;
