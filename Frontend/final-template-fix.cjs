const fs = require('fs');
const path = require('path');

console.log('🔧 Final template literal fix starting...');

function findJsJsxFiles(dir) {
  let files = [];
  const items = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const item of items) {
    if (item.isDirectory() && !item.name.startsWith('.') && item.name !== 'node_modules') {
      files = files.concat(findJsJsxFiles(path.join(dir, item.name)));
    } else if (item.isFile() && (item.name.endsWith('.js') || item.name.endsWith('.jsx'))) {
      files.push(path.join(dir, item.name));
    }
  }
  
  return files;
}

function fixFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  let updated = content;
  let hasChanges = false;

  // Split content into lines for easier processing
  const lines = updated.split('\n');
  const fixedLines = lines.map((line, index) => {
    let fixedLine = line;
    
    // Pattern 1: Fix incomplete template literals like: `${import.meta.env.VITE_API_BASE_URL || '
    // This appears at the end of lines, missing the closing part
    if (line.includes('`${import.meta.env.VITE_API_BASE_URL || \'') && 
        !line.includes('\'}`') && 
        line.trim().endsWith('\'')) {
      // Find where the incomplete part starts and complete it
      fixedLine = line.replace(
        /`\$\{import\.meta\.env\.VITE_API_BASE_URL \|\| '([^']*)'$/,
        '`${import.meta.env.VITE_API_BASE_URL || \'$1\'}' + 
        (line.includes('/api') ? '' : '/api') + '`'
      );
      if (fixedLine !== line) {
        hasChanges = true;
        console.log(`  Line ${index + 1}: Fixed incomplete template literal`);
      }
    }
    
    // Pattern 2: Fix lines that end with just the variable definition
    if (line.includes('import.meta.env.VITE_API_BASE_URL || \'http://localhost:4000') && 
        !line.includes('\'}`') && line.trim().endsWith('\'')) {
      if (line.includes('const API_BASE_URL = ')) {
        // For const declarations, don't use template literal
        fixedLine = line.replace(
          /const API_BASE_URL = import\.meta\.env\.VITE_API_BASE_URL \|\| '([^']*)'/,
          'const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || \'$1\''
        );
      } else if (line.includes('baseURL: ')) {
        // For baseURL property
        fixedLine = line.replace(
          /baseURL: import\.meta\.env\.VITE_API_BASE_URL \|\| '([^']*)'/,
          'baseURL: import.meta.env.VITE_API_BASE_URL || \'$1\''
        );
      } else if (line.includes('const API_BASE = ')) {
        // For API_BASE constants
        fixedLine = line.replace(
          /const API_BASE = import\.meta\.env\.VITE_API_BASE_URL \|\| '([^']*)'/,
          'const API_BASE = import.meta.env.VITE_API_BASE_URL || \'$1\''
        );
      }
      if (fixedLine !== line) {
        hasChanges = true;
        console.log(`  Line ${index + 1}: Fixed const declaration`);
      }
    }
    
    // Pattern 3: Fix malformed const API_BASE_URL with template literal syntax
    if (line.includes('const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL || \'')) {
      fixedLine = line.replace(
        /const API_BASE_URL = `\$\{import\.meta\.env\.VITE_API_BASE_URL \|\| '([^']*)'/,
        'const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || \'$1\''
      );
      if (fixedLine !== line) {
        hasChanges = true;
        console.log(`  Line ${index + 1}: Fixed const API_BASE_URL template literal`);
      }
    }
    
    return fixedLine;
  });
  
  if (hasChanges) {
    const newContent = fixedLines.join('\n');
    fs.writeFileSync(filePath, newContent);
    console.log(`✅ Fixed: ${path.relative(process.cwd(), filePath)}`);
    return true;
  }
  
  return false;
}

const srcDir = path.join(process.cwd(), 'src');
const files = findJsJsxFiles(srcDir);

let fixedCount = 0;

files.forEach(file => {
  if (fixFile(file)) {
    fixedCount++;
  }
});

console.log(`\n✨ Final template literal fixes complete!`);
console.log(`📊 Summary: ${fixedCount}/${files.length} files updated`);

if (fixedCount > 0) {
  console.log(`\n🎯 Now run the dev server to check for any remaining issues!`);
} else {
  console.log(`\n✅ No template literal issues found!`);
}
