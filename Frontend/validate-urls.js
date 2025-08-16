#!/usr/bin/env node

/**
 * Script to validate that all hardcoded URLs have been replaced
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Patterns to check for
const HARDCODED_PATTERNS = [
  /http:\/\/10\.5\.12\.1:4000/g,
  /http:\/\/localhost:4000(?!\$\{)/g,  // localhost without env variable
];

const EXTENSIONS = ['.js', '.jsx', '.ts', '.tsx'];

function getAllFiles(dirPath, arrayOfFiles = []) {
  const files = fs.readdirSync(dirPath);

  files.forEach(file => {
    const fullPath = path.join(dirPath, file);
    
    if (fs.statSync(fullPath).isDirectory()) {
      if (!['node_modules', 'dist', 'build', '.git'].includes(file)) {
        arrayOfFiles = getAllFiles(fullPath, arrayOfFiles);
      }
    } else {
      const ext = path.extname(file);
      if (EXTENSIONS.includes(ext)) {
        arrayOfFiles.push(fullPath);
      }
    }
  });

  return arrayOfFiles;
}

function checkFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const issues = [];

    HARDCODED_PATTERNS.forEach((pattern, index) => {
      const matches = [...content.matchAll(pattern)];
      if (matches.length > 0) {
        matches.forEach(match => {
          const lines = content.substring(0, match.index).split('\n');
          const lineNumber = lines.length;
          const lineContent = lines[lineNumber - 1].trim();
          
          issues.push({
            pattern: pattern.source,
            line: lineNumber,
            content: lineContent,
            match: match[0]
          });
        });
      }
    });

    return issues;
  } catch (error) {
    console.error(`Error reading ${filePath}:`, error.message);
    return [];
  }
}

function main() {
  console.log('🔍 Validating hardcoded URL replacement...');
  console.log('');

  const srcPath = path.join(__dirname, 'src');
  const files = getAllFiles(srcPath);
  
  let totalIssues = 0;
  let filesWithIssues = 0;

  files.forEach(filePath => {
    const issues = checkFile(filePath);
    
    if (issues.length > 0) {
      filesWithIssues++;
      const relativePath = path.relative(process.cwd(), filePath);
      console.log(`❌ ${relativePath}:`);
      
      issues.forEach(issue => {
        console.log(`   Line ${issue.line}: ${issue.match}`);
        console.log(`   Code: ${issue.content}`);
        totalIssues++;
      });
      console.log('');
    }
  });

  if (totalIssues === 0) {
    console.log('✅ No hardcoded URLs found! All URLs have been properly replaced.');
  } else {
    console.log(`⚠️  Found ${totalIssues} hardcoded URLs in ${filesWithIssues} files.`);
    console.log('Please review and fix the remaining issues manually.');
  }
  
  console.log(`📊 Checked ${files.length} files total.`);
}

main();
