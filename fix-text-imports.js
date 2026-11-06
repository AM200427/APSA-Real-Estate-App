// fix-text-imports.js
const fs = require('fs');
const path = require('path');

const screensDir = path.join(__dirname, 'src', 'screens');

if (!fs.existsSync(screensDir)) {
  console.error('❌ Folder not found:', screensDir);
  process.exit(1);
}

const files = fs.readdirSync(screensDir).filter((f) => f.endsWith('.js'));
let fixedCount = 0;
let skippedCount = 0;

files.forEach((file) => {
  const fullPath = path.join(screensDir, file);
  let content = fs.readFileSync(fullPath, 'utf8');

  if (!content.includes("from '../components/AccessibleText'")) {
    skippedCount++;
    return;
  }

  const original = content;
  const regex = /import\s*\{([^}]*?)\}\s*from\s*'react-native';/s;

  content = content.replace(regex, (match, imports) => {
    const items = imports
      .split(',')
      .map((i) => i.trim())
      .filter((i) => i && i !== 'Text');

    const newBlock = `import {\n  ${items.join(',\n  ')}\n} from 'react-native';`;
    return newBlock;
  });

  if (content !== original) {
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log('✅ Fixed:', file);
    fixedCount++;
  }
});

console.log(`\n🎉 Done. Fixed ${fixedCount} files. Skipped ${skippedCount} (no AccessibleText import).`);