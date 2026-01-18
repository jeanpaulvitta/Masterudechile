// Script para verificar que no hay referencias a figma:asset
const fs = require('fs');
const path = require('path');

function searchInFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  if (content.includes('figma:asset')) {
    console.error(`❌ FOUND figma:asset in: ${filePath}`);
    return true;
  }
  return false;
}

function searchDirectory(dir) {
  let found = false;
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      if (!file.startsWith('.') && file !== 'node_modules') {
        found = searchDirectory(filePath) || found;
      }
    } else if (file.endsWith('.tsx') || file.endsWith('.ts') || file.endsWith('.jsx') || file.endsWith('.js')) {
      found = searchInFile(filePath) || found;
    }
  }
  
  return found;
}

console.log('🔍 Searching for figma:asset references...');
const foundIssues = searchDirectory('./src');

if (foundIssues) {
  console.error('\n❌ BUILD WILL FAIL: Found figma:asset references!');
  process.exit(1);
} else {
  console.log('\n✅ No figma:asset references found. Safe to deploy!');
  process.exit(0);
}
