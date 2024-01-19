/* eslint-disable no-await-in-loop */
/* eslint-disable no-unused-vars */
// const sharp = require('sharp');

const ffmpeg = require('fluent-ffmpeg');

ffmpeg('C:/Users/ASUS/baileys/fitur/tambahan/VID-20240111-WA0006.mp4')
  .addOutputOption(['-pix_fmt yuva420p',
    '-vf scale=320x320:force_original_aspect_ratio=decrease,pad=320:320:(ow-iw)/2:(oh-ih)/2:color=0x00000000', '-loop 0', '-r 24'])
  .save('C:/Users/ASUS/baileys/fitur/tambahan/tes/tesff.webp')
  .on('end', () => {
    console.log('Conversion finished successfully');
  })
  .on('error', (err, stdout, stderr) => {
    console.error('Error:', err);
    console.error('ffmpeg stdout:', stdout);
    console.error('ffmpeg stderr:', stderr);
  });

// sharp('C:/Users/ASUS/baileys/fitur/tambahan/2.gif')
//   .toFormat('webp')
//   .toFile('C:/Users/ASUS/baileys/fitur/tambahan/2sharp.webp', (err, info) => {
//     if (err) {
//       console.error(err);
//     } else {
//       console.log(info);
//     }
//   });

// const WebP = require('node-webpmux');
// const fs = require('fs');

// async function b() {
//   const frames = [];

//   const files = fs.readdirSync('C:/Users/ASUS/baileys/fitur/tambahan/ret');
//   // files.sort()
//   console.log(files);
//   WebP.Image.initLib();
//   const img = await WebP.Image.getEmptyImage();
//   await img.load('C:/Users/ASUS/baileys/fitur/tambahan/2tes.webp');
//   await img.demux({ path: 'C:/Users/ASUS/baileys/fitur/tambahan/ret', prefix: '___' });

// for (const file of files) {
//   const imagePath = `C:/Users/ASUS/baileys/fitur/tambahan/ret/${file}`;

//   const img = await WebP.Image.getEmptyImage()

//   await img.load(imagePath);
//   // await img.setImageData( await img.getImageData(), { width: 320, height: 320 });
//   frames.push(await WebP.Image.generateFrame({ img }));
// }
// await WebP.Image.save('C:/Users/ASUS/baileys/fitur/tambahan/123.webp', { frames, width: 320, height: 320 });
// }

// b();

// async function a() {
//   WebP.Image.initLib();
//   const f = { frames: [] }; // Initialize f as an object with a frames property
//   const frames = await WebP.Image.getEmptyImage();
//   frames.convertToAnim();
//   for (let i = 0; i < 15; i++) {
//     const frame = await WebP.Image.generateFrame({ path: `C:/Users/ASUS/baileys/fitur/tambahan/ret/2tes_${i}.webp`, delay: 100 });
//     f.frames.push(frame);
//   }
//   // frames.setFrameData(0, frames, { width: 100, height: 100 });
//   frames.anim.frames = f.frames; // Assign frames.frames with the frames array
//   console.log(frames);
//   await WebP.Image.save('C:/Users/ASUS/baileys/fitur/tambahan/aduar.webp');
// }

// a();

// const fs = require('fs');
// const gifFrames = require('gif-frames');

// const inputFile = 'C:/Users/ASUS/baileys/fitur/tambahan/2.gif';
// const outputFolder = 'C:/Users/ASUS/baileys/fitur/tambahan/tes/';

// // Membaca file GIF dan mengekstrak frame
// (async () => {
//   try {
//     const frameData = await gifFrames({
//       url: inputFile, frames: '2-9', outputType: 'png', cumulative: true,
//     });

//     for (let index = 0; index < frameData.length; index++) {
//       const frame = frameData[index];
//       const outputFileName = `${outputFolder}/frame_${index}.png`;

//       // Menyimpan frame sebagai gambar PNG agar mendukung transparansi
//       await frame.getImage().pipe(fs.createWriteStream(outputFileName));
//     }

//     console.log('Extraction complete.');
//   } catch (err) {
//     console.error(err);
//   }
// })();

// sharp('C:/Users/ASUS/baileys/fitur/tambahan/2.gif', { animated: true })
//   .gif({ frameDuration: '1' }) // Set durasi frame (opsional)
//   .toFile('C:/Users/ASUS/baileys/fitur/tambahan/tes/frame_%d.png', (err, info) => {
//     if (err) {
//       console.error(err);
//     } else {
//       console.log('Masing-masing frame disimpan di folder /'output/'');
//     }
//   });
