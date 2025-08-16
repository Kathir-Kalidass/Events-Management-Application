const fs = require('fs');
const path = require('path');

console.log('🔧 Comprehensive URL fix starting...');

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

  // Fix various malformed patterns
  const fixes = [
    // Fix: ${import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api' -> proper template literal
    {
      pattern: /\$\{import\.meta\.env\.VITE_API_BASE_URL \|\| 'http:\/\/localhost:4000\/api'/g,
      replacement: '${import.meta.env.VITE_API_BASE_URL || \'http://localhost:4000/api\'}'
    },
    // Fix incomplete patterns like: import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api'`;
    {
      pattern: /import\.meta\.env\.VITE_API_BASE_URL \|\| 'http:\/\/localhost:4000\/api'`/g,
      replacement: 'import.meta.env.VITE_API_BASE_URL || \'http://localhost:4000/api\''
    },
    // Fix: `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api'  (missing closing)
    {
      pattern: /`\$\{import\.meta\.env\.VITE_API_BASE_URL \|\| 'http:\/\/localhost:4000\/api'$/gm,
      replacement: '`${import.meta.env.VITE_API_BASE_URL || \'http://localhost:4000/api\'}`'
    },
    // Fix: const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api'  (missing closing)
    {
      pattern: /const API_BASE_URL = `\$\{import\.meta\.env\.VITE_API_BASE_URL \|\| 'http:\/\/localhost:4000\/api'$/gm,
      replacement: 'const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || \'http://localhost:4000/api\''
    },
    // Fix any remaining localhost hardcoded URLs in fallbacks
    {
      pattern: /'http:\/\/localhost:4000\/api'/g,
      replacement: '\'http://localhost:4000/api\''
    },
    // Fix malformed template literals with env vars
    {
      pattern: /\$\{import\.meta\.env\.VITE_API_BASE_URL \|\| import\.meta\.env\.VITE_BACKEND_URL \|\| 'http:\/\/localhost:4000\/api'/g,
      replacement: '${import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_BACKEND_URL || \'http://localhost:4000/api\'}'
    }
  ];

  for (const fix of fixes) {
    const newContent = updated.replace(fix.pattern, fix.replacement);
    if (newContent !== updated) {
      hasChanges = true;
      updated = newContent;
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

console.log(`\n✨ Comprehensive URL fixes complete!`);
console.log(`📊 Summary: ${fixedCount}/${files.length} files updated`);
console.log(`\n🎯 All URL patterns should now be properly formatted!`);
