/**
 * Rasterizes public/icons/soilmates-icon.svg into PNGs for PWA install,
 * apple-touch-icon, and surfaces that ignore SVG in the manifest.
 * Run: npm run icons:generate
 */
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const root = path.join(__dirname, "..");
const svgPath = path.join(root, "public", "icons", "soilmates-icon.svg");
const input = fs.readFileSync(svgPath);

async function main() {
  const out = async (name, size) => {
    const dest = path.join(root, "public", "icons", name);
    await sharp(input).resize(size, size).png().toFile(dest);
    console.log(`Wrote ${path.relative(root, dest)}`);
  };

  await out("soilmates-icon-192.png", 192);
  await out("soilmates-icon-512.png", 512);
  await out("apple-touch-icon.png", 180);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
