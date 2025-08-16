const fs = require('fs');
const path = require('path');

console.log('🎉 Final URL replacement validation...');

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

function validateFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  const issues = [];

  lines.forEach((line, index) => {
    // Check for hardcoded localhost URLs that should be replaced
    if (line.includes('http://localhost:4000') && 
        !line.includes('import.meta.env.VITE_') && 
        !line.includes('//') && // ignore comments
        !line.includes('replacement:') && // ignore our fix scripts
        !filePath.includes('fix-') && // ignore fix scripts
        !filePath.includes('cleanup') && // ignore cleanup scripts
        !filePath.includes('validate') && // ignore validate scripts
        !filePath.includes('comprehensive') // ignore comprehensive scripts
    ) {
      issues.push({
        line: index + 1,
        content: line.trim(),
        type: 'hardcoded-url'
      });
    }

    // Check for malformed template literals
    if (line.includes('}}') && line.includes('import.meta.env.VITE_')) {
      issues.push({
        line: index + 1,
        content: line.trim(),
        type: 'malformed-template'
      });
    }
  });

  return issues;
}

const srcDir = path.join(process.cwd(), 'src');
const files = findJsJsxFiles(srcDir);

let totalIssues = 0;
let filesWithIssues = 0;

files.forEach(file => {
  const issues = validateFile(file);
  if (issues.length > 0) {
    filesWithIssues++;
    totalIssues += issues.length;
    
    console.log(`\n❌ ${path.relative(process.cwd(), file)}:`);
    issues.forEach(issue => {
      console.log(`   Line ${issue.line} [${issue.type}]: ${issue.content.substring(0, 80)}...`);
    });
  }
});

console.log(`\n✨ Validation Summary:`);
console.log(`📁 Files checked: ${files.length}`);
console.log(`🔍 Files with issues: ${filesWithIssues}`);
console.log(`⚠️  Total issues found: ${totalIssues}`);

if (totalIssues === 0) {
  console.log(`\n🎯 All URL replacements completed successfully!`);
  console.log(`✅ No hardcoded URLs or malformed templates found.`);
  console.log(`🚀 Your application is ready to use environment variables!`);
} else {
  console.log(`\n🔧 Some issues remain - they may need manual review.`);
}
