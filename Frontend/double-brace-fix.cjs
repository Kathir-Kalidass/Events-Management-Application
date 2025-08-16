const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing double brace template literals...');

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

  // Fix the double brace issue: `${...}}/path` -> `${...}/path`
  const doubleCloseBracePattern = /\$\{import\.meta\.env\.VITE_API_BASE_URL \|\| [^}]+\}\}/g;
  const newContent = updated.replace(doubleCloseBracePattern, (match) => {
    return match.replace('}}', '}');
  });
  
  if (newContent !== updated) {
    hasChanges = true;
    updated = newContent;
  }

  // Also fix any instances where there might be extra quotes or syntax issues
  const patterns = [
    // Pattern: Fix `${...}'}/path` -> `${...}/path`
    {
      pattern: /`\$\{import\.meta\.env\.VITE_API_BASE_URL \|\| [^}]+\}'\}/g,
      replacement: (match) => match.replace("'}", "}")
    },
    // Pattern: Fix incomplete axios calls with axios.get("... -> axios.get(`...
    {
      pattern: /axios\.(get|post|put|delete|patch)\("http:\/\/localhost:4000/g,
      replacement: 'axios.$1(`${import.meta.env.VITE_API_BASE_URL || \'http://localhost:4000/api\'}'
    },
    // Pattern: Fix incomplete fetch calls with fetch("... -> fetch(`...
    {
      pattern: /fetch\("http:\/\/localhost:4000/g,
      replacement: 'fetch(`${import.meta.env.VITE_API_BASE_URL || \'http://localhost:4000/api\'}'
    }
  ];

  for (const fix of patterns) {
    const result = updated.replace(fix.pattern, fix.replacement);
    if (result !== updated) {
      hasChanges = true;
      updated = result;
    }
  }

  if (hasChanges) {
    fs.writeFileSync(filePath, updated);
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

console.log(`\n✨ Double brace fixes complete!`);
console.log(`📊 Summary: ${fixedCount}/${files.length} files updated`);

if (fixedCount > 0) {
  console.log(`\n🎯 Template literals should now be properly formed!`);
}
