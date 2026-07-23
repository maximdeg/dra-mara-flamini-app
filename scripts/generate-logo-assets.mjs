// One-off asset generator for the brand logo.
//
// The masters under public/logos/ are the full "faces + arch + wordmark"
// lockup, several megabytes each, and none is a square/icon crop. This script
// derives the small, web-ready images the app actually serves:
//
//   public/logos/mark-icon.png   Square faces+arch crop (brown) — header mark.
//   public/logos/footer-logo.png Right-sized full lockup (brown) — footer.
//   app/icon.png                 512px square icon — browser favicon (Next
//                                emits <link rel="icon"> from this file).
//   app/apple-icon.png           180px square icon — apple-touch-icon.
//
// Uses sharp, which ships with Next.js — no extra dependency. Run manually
// after changing the source art:
//
//   npm run logo:assets
//
// The heavy masters stay in public/logos/ as source-of-truth; nothing at
// runtime should reference them directly.

import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import sharp from "sharp";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const logos = join(root, "public", "logos");
const app = join(root, "app");

// Brown line-art master (matches --brand-dark). Square-ish, ~1481x1484.
const master = join(logos, "logo marron.jpg");

// The faces+arch sit in the upper portion of the lockup; the wordmark is
// below (its divider rule is ~row 965). The emblem spans x 175..1305 and
// y ~10..855, so this square box centers on it with a little padding and
// stops short of the text. Tuned to the 1481x1484 brown master; re-check
// (scripts probe the row/column darkness) if the master changes.
const cropFacesArch = {
  left: 290,
  top: 8,
  width: 900,
  height: 900,
};

async function makeIconFrom(sourceBuffer, size, outPath) {
  await sharp(sourceBuffer)
    .resize(size, size, { fit: "contain", background: { r: 255, g: 255, b: 255, alpha: 0 } })
    .png({ compressionLevel: 9 })
    .toFile(outPath);
  console.log(`  ${outPath.replace(root, ".")} (${size}x${size})`);
}

async function main() {
  console.log("Generating logo assets from", master.replace(root, "."));

  // Crop the emblem once, then downscale to each target size.
  const emblem = await sharp(master).extract(cropFacesArch).png().toBuffer();

  // Header mark (rendered ~40px, 2x for retina).
  await makeIconFrom(emblem, 256, join(logos, "mark-icon.png"));
  // Favicon + apple-touch, via Next's app-dir icon convention.
  await makeIconFrom(emblem, 512, join(app, "icon.png"));
  await makeIconFrom(emblem, 180, join(app, "apple-icon.png"));

  // Footer logo: the full lockup, right-sized and compressed.
  const footerOut = join(logos, "footer-logo.png");
  await sharp(master)
    .resize(480, null, { withoutEnlargement: true })
    .png({ compressionLevel: 9 })
    .toFile(footerOut);
  console.log(`  ${footerOut.replace(root, ".")} (width 480)`);

  console.log("Done.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
