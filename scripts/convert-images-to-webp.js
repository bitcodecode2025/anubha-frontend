/**
 * Image Conversion Script
 * Converts all PNG/JPG images in /public to WebP format
 * 
 * Usage: node scripts/convert-images-to-webp.js
 * 
 * Requires: npm install sharp --save-dev
 */

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, '..', 'public');
const convertedImages = [];

async function convertToWebP(filePath, outputPath) {
  try {
    await sharp(filePath)
      .webp({ quality: 85, effort: 6 })
      .toFile(outputPath);
    
    const originalSize = fs.statSync(filePath).size;
    const newSize = fs.statSync(outputPath).size;
    const savings = ((1 - newSize / originalSize) * 100).toFixed(1);
    
    convertedImages.push({
      original: path.relative(publicDir, filePath),
      converted: path.relative(publicDir, outputPath),
      originalSize: (originalSize / 1024).toFixed(2) + ' KB',
      newSize: (newSize / 1024).toFixed(2) + ' KB',
      savings: savings + '%'
    });
    
    console.log(`✅ Converted: ${path.relative(publicDir, filePath)} → ${path.relative(publicDir, outputPath)} (saved ${savings}%)`);
  } catch (error) {
    console.error(`❌ Error converting ${filePath}:`, error.message);
  }
}

async function processDirectory(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    
    if (entry.isDirectory()) {
      await processDirectory(fullPath);
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name).toLowerCase();
      
      // Convert PNG and JPG to WebP
      if (ext === '.png' || ext === '.jpg' || ext === '.jpeg') {
        const baseName = path.basename(entry.name, ext);
        const outputPath = path.join(dir, `${baseName}.webp`);
        
        // Skip if WebP already exists
        if (!fs.existsSync(outputPath)) {
          await convertToWebP(fullPath, outputPath);
        } else {
          console.log(`⏭️  Skipped: ${path.relative(publicDir, outputPath)} already exists`);
        }
      }
    }
  }
}

async function main() {
  console.log('🖼️  Starting image conversion to WebP...\n');
  
  try {
    await processDirectory(publicDir);
    
    console.log('\n📊 Conversion Summary:');
    console.log('='.repeat(80));
    console.log(`Total images converted: ${convertedImages.length}`);
    
    if (convertedImages.length > 0) {
      console.log('\nConverted Images:');
      convertedImages.forEach(img => {
        console.log(`  ${img.original}`);
        console.log(`    → ${img.converted}`);
        console.log(`    Size: ${img.originalSize} → ${img.newSize} (saved ${img.savings})`);
        console.log('');
      });
      
      const totalOriginalSize = convertedImages.reduce((sum, img) => 
        sum + parseFloat(img.originalSize), 0
      );
      const totalNewSize = convertedImages.reduce((sum, img) => 
        sum + parseFloat(img.newSize), 0
      );
      const totalSavings = ((1 - totalNewSize / totalOriginalSize) * 100).toFixed(1);
      
      console.log('Overall Statistics:');
      console.log(`  Total original size: ${totalOriginalSize.toFixed(2)} KB`);
      console.log(`  Total new size: ${totalNewSize.toFixed(2)} KB`);
      console.log(`  Total savings: ${totalSavings}%`);
    }
    
    console.log('\n✅ Conversion complete!');
    console.log('\n⚠️  Next steps:');
    console.log('  1. Update image references in code to use .webp extensions');
    console.log('  2. Replace <img> tags with Next.js <Image> components');
    console.log('  3. Test that all images load correctly');
    
  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  }
}

main();

