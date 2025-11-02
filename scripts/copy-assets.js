const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.join(__dirname, '..');
const SRC_DIR = path.join(ROOT_DIR, 'src');
const DIST_DIR = path.join(ROOT_DIR, 'dist');

console.log('📋 Copying non-TypeScript assets to dist...\n');

const preferencesSource = path.join(SRC_DIR, 'context', 'Preferences');
const preferencesDestDir = path.join(DIST_DIR, 'context');
const preferencesDest = path.join(preferencesDestDir, 'Preferences');

try {
  if (!fs.existsSync(preferencesDestDir)) {
    fs.mkdirSync(preferencesDestDir, { recursive: true });
  }
  
  if (fs.existsSync(preferencesSource)) {
    fs.copyFileSync(preferencesSource, preferencesDest);
    console.log('✅ Copied: src/context/Preferences → dist/context/Preferences');
  } else {
    console.warn('⚠️  Warning: Preferences file not found at:', preferencesSource);
  }
} catch (error) {
  console.error('❌ Error copying Preferences file:', error.message);
  process.exit(1);
}

console.log('\n✨ Assets copied successfully!\n');
