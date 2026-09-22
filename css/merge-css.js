const fs = require('fs');
const path = require('path');

const cssDir = __dirname;

// 按注入顺序排列的所有自定义CSS文件
const files = [
  'reading-progress.css',
  'bg-overlay.css',
  'twikoo-pink.css',
  'cursor.css',
  'loading.css',
  'dark-pink.css',
  'dark-glass.css',
  '404-pink.css',
  'sidebar-pink.css',
  'footer-pink.css',
  'nav-pink.css',
  'search-pink.css',
  'toc-pink.css',
  'pagination-pink.css',
  'archive-pink.css',
  'runtime.css',
  'card-pink.css',
  'scrollbar-pink.css',
  'title-pink.css',
  'flink-pink.css',
  'categories-pink.css',
  'copyright-pink.css',
  'note-pink.css',
  'code-pink.css',
  'cover-pink.css',
  'about-pink.css',
  'rightside-pink.css',
  'meta-pink.css',
  'post-nav-pink.css',
  'selection-pink.css',
  'transition-pink.css',
  'encrypt-pink.css',
  'calendar-pink.css',
  'aplayer-pink.css',
  'gamebox-pink.css',
  'mobile-sidebar-pink.css'
];

let merged = `/*! Pink Theme Bundle — merged from ${files.length} CSS files */\n`;

for (const f of files) {
  const fp = path.join(cssDir, f);
  if (fs.existsSync(fp)) {
    merged += `\n/* === ${f} === */\n`;
    merged += fs.readFileSync(fp, 'utf8');
  } else {
    console.warn('Missing: ' + f);
  }
}

const outPath = path.join(cssDir, 'pink-bundle.css');
fs.writeFileSync(outPath, merged, 'utf8');
console.log(`Merged ${files.length} files → pink-bundle.css (${(Buffer.byteLength(merged,'utf8')/1024).toFixed(1)}KB)`);