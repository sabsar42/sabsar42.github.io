// Crops the source portrait into the square assets the site uses.
// Usage: npm run photo   (reads ./shakib-absar.jpeg)
import sharp from "sharp";

const SRC = "shakib-absar.jpeg";
// Square region around the head in the 3024x4032 original.
const crop = { left: 824, top: 300, width: 2200, height: 2200 };

const base = () => sharp(SRC).rotate().extract(crop);

await base().resize(640, 640).jpeg({ quality: 86, mozjpeg: true }).toFile("public/me.jpg");

const circle = (size) =>
  Buffer.from(
    `<svg width="${size}" height="${size}"><circle cx="${size / 2}" cy="${size / 2}" r="${size / 2}" fill="#fff"/></svg>`,
  );

for (const [file, size] of [
  ["app/icon.png", 96],
  ["app/apple-icon.png", 180],
]) {
  await base()
    .resize(size, size)
    .composite([{ input: circle(size), blend: "dest-in" }])
    .png()
    .toFile(file);
}
console.log("photo assets written");
