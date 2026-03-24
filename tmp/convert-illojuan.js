import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const inputPath = 'public/images/fighters/cards/illojuan.png';
const outputPath = 'public/images/fighters/cards/illojuan.webp';

async function convert() {
  try {
    console.log(`Converting ${inputPath} to ${outputPath}...`);
    await sharp(inputPath)
      .webp({ quality: 85 })
      .toFile(outputPath);
    console.log('Conversion successful!');
  } catch (err) {
    console.error('Error during conversion:', err);
    process.exit(1);
  }
}

convert();
