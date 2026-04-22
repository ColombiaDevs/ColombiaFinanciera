import sharp from "sharp";
import fs from "fs";
import path from "path";

const inputDir = "./src/assets/images/articles";

async function optimize() {
  if (!fs.existsSync(inputDir)) {
    console.log(`Directory not found: ${inputDir}`);
    return;
  }

  const files = fs.readdirSync(inputDir);

  for (const file of files) {
    const inputPath = path.join(inputDir, file);

    if (!file.match(/\.(png|jpg|jpeg)$/i)) {
      continue;
    }

    const outputPath = inputPath.replace(/\.(png|jpg|jpeg)$/i, ".webp");
    const outputFileName = path.basename(outputPath);

    await sharp(inputPath)
      .resize({ width: 1200, withoutEnlargement: true })
      .webp({ quality: 80 })
      .toFile(outputPath);

    console.log(`Optimized: ${file} -> ${outputFileName}`);
  }
}

optimize().catch((error) => {
  console.error(error);
  process.exit(1);
});
