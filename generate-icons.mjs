import sharp from "sharp";

const sizes = [
  ["apple-touch-icon.png", 180],
  ["icon-192.png", 192],
  ["icon-512.png", 512],
  ["favicon.png", 512],
  ["favicon-32x32.png", 32],
  ["favicon-16x16.png", 16],
];

for (const [file, size] of sizes) {
  await sharp("icon.svg")
    .resize(size, size)
    .png()
    .toFile(file);
  console.log(`✅ ${file} generado`);
}
