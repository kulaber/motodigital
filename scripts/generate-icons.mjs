import sharp from 'sharp';
import { writeFileSync } from 'fs';
import { join } from 'path';

const PUBLIC = join(import.meta.dirname, '..', 'public');

const SVG_FULL = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">
<rect width="256" height="256" fill="#0190A1"/>
<path fill="#F4F2EC" d="M128,34.4L44.2,68.8l9.9,98.5l49.3,54.2v-44.3L128,192l24.6-14.8v44.3l49.3-54.2l9.9-98.5L128,34.4z M186,142.5l-58,33.8l-58-33.8V84.3l40.6-16.4v40.3l17.4,10.1l17.4-10.1V67.9L186,84.3V142.5z"/>
</svg>`;

async function generate() {
  const svgBuffer = Buffer.from(SVG_FULL);

  // apple-touch-icon 180x180
  await sharp(svgBuffer)
    .resize(180, 180)
    .png()
    .toFile(join(PUBLIC, 'apple-touch-icon.png'));
  console.log('✓ apple-touch-icon.png (180×180)');

  // icon-192.png
  await sharp(svgBuffer)
    .resize(192, 192)
    .png()
    .toFile(join(PUBLIC, 'icon-192.png'));
  console.log('✓ icon-192.png (192×192)');

  // icon-512.png
  await sharp(svgBuffer)
    .resize(512, 512)
    .png()
    .toFile(join(PUBLIC, 'icon-512.png'));
  console.log('✓ icon-512.png (512×512)');

  // icon-maskable.png (512x512 with ~15% padding)
  // Logo area = 512 * 0.70 = ~358px, centered on teal background
  const maskableLogoSize = 358;
  const maskableLogo = await sharp(svgBuffer)
    .resize(maskableLogoSize, maskableLogoSize)
    .png()
    .toBuffer();

  await sharp({
    create: {
      width: 512,
      height: 512,
      channels: 4,
      background: { r: 1, g: 144, b: 161, alpha: 1 }, // #0190A1
    },
  })
    .composite([{
      input: maskableLogo,
      gravity: 'centre',
    }])
    .png()
    .toFile(join(PUBLIC, 'icon-maskable.png'));
  console.log('✓ icon-maskable.png (512×512, maskable)');

  // og-image.jpg (1200x630, logo centered on teal background)
  const ogLogoSize = 360;
  const ogLogo = await sharp(svgBuffer)
    .resize(ogLogoSize, ogLogoSize)
    .png()
    .toBuffer();

  await sharp({
    create: {
      width: 1200,
      height: 630,
      channels: 3,
      background: { r: 1, g: 144, b: 161 }, // #0190A1
    },
  })
    .composite([{
      input: ogLogo,
      gravity: 'centre',
    }])
    .jpeg({ quality: 85 })
    .toFile(join(PUBLIC, 'og-image.jpg'));
  console.log('✓ og-image.jpg (1200×630)');

  // favicon.ico (32x32 PNG wrapped as ICO)
  const png16 = await sharp(svgBuffer).resize(16, 16).png().toBuffer();
  const png32 = await sharp(svgBuffer).resize(32, 32).png().toBuffer();

  // Build a multi-image ICO file
  const ico = buildIco([png16, png32]);
  writeFileSync(join(PUBLIC, 'favicon.ico'), ico);
  console.log('✓ favicon.ico (16×16 + 32×32)');

  console.log('\nAll icons generated in /public/');
}

// Minimal ICO builder for PNG entries
function buildIco(pngBuffers) {
  const numImages = pngBuffers.length;
  const headerSize = 6;
  const dirEntrySize = 16;
  const dataOffset = headerSize + dirEntrySize * numImages;

  // ICO header
  const header = Buffer.alloc(headerSize);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type: 1 = ICO
  header.writeUInt16LE(numImages, 4);

  const dirEntries = [];
  const sizes = [16, 32];
  let currentOffset = dataOffset;

  for (let i = 0; i < numImages; i++) {
    const entry = Buffer.alloc(dirEntrySize);
    const size = sizes[i];
    entry.writeUInt8(size === 256 ? 0 : size, 0); // width
    entry.writeUInt8(size === 256 ? 0 : size, 1); // height
    entry.writeUInt8(0, 2);  // color palette
    entry.writeUInt8(0, 3);  // reserved
    entry.writeUInt16LE(1, 4);  // color planes
    entry.writeUInt16LE(32, 6); // bits per pixel
    entry.writeUInt32LE(pngBuffers[i].length, 8);  // size of PNG data
    entry.writeUInt32LE(currentOffset, 12); // offset
    dirEntries.push(entry);
    currentOffset += pngBuffers[i].length;
  }

  return Buffer.concat([header, ...dirEntries, ...pngBuffers]);
}

generate().catch(console.error);
