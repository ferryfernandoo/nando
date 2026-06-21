const fs = require('fs');
const content = fs.readFileSync('src/components/ChatBot.jsx', 'utf8');
const lines = content.split('\n');
let bracketCount = 0;
let parenCount = 0;
let braceCount = 0;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  for (let j = 0; j < line.length; j++) {
    if (line[j] === '[') bracketCount++;
    if (line[j] === ']') bracketCount--;
    if (line[j] === '(') parenCount++;
    if (line[j] === ')') parenCount--;
    if (line[j] === '{') braceCount++;
    if (line[j] === '}') braceCount--;
  }
  if (bracketCount < -5 || parenCount < -3 || braceCount < -3) {
    console.log(`Line ${i+1}: Brackets:${bracketCount}, Parens:${parenCount}, Braces:${braceCount}`);
    console.log(`Content: ${line.substring(0, 80)}`);
    break;
  }
}

console.log(`Final: Brackets:${bracketCount}, Parens:${parenCount}, Braces:${braceCount}`);
