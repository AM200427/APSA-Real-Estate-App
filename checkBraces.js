const fs = require('fs');

const text = fs.readFileSync('App.js', 'utf8');

// Strip line comments, strings, and template literals (crude but effective)
let clean = text
  .replace(/\/\/.*/g, '')
  .replace(/'(?:\\.|[^'\\])*'/g, "''")
  .replace(/"(?:\\.|[^"\\])*"/g, '""')
  .replace(/`(?:\\.|[^`\\])*`/g, '``');

let depth = 0;
let line = 1;
let minDepth = 0;
let minLine = 0;

for (const ch of clean) {
  if (ch === '\n') line++;
  else if (ch === '{') depth++;
  else if (ch === '}') {
    depth--;
    if (depth < minDepth) {
      minDepth = depth;
      minLine = line;
    }
  }
}

console.log('Final brace depth (should be 0):', depth, 'at line', line);
console.log('Lowest depth ever reached:', minDepth, 'around line', minLine);