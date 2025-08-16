#!/usr/bin/env node

/**
 * Script to fix template literal syntax errors in URL constructions
 * Fixes patterns like: `${...}`}/path to `${...}/path`
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

function fixTemplateStringErrors(content) {
  let fixed = content;
  let hasChanges = false;

  // Fix the main pattern: `${env}`}/path -> `${env}/path`
  const mainPattern = /`\$\{import\.meta\.env\.VITE_API_BASE_URL \|\| '[^']*'\}`\}\/([^`]+)`?/g;
  const beforeFix = fixed;
  fixed = fixed.replace(mainPattern, '`${import.meta.env.VITE_API_BASE_URL || \'http://localhost:4000/api\'}/$1`');
  
  if (beforeFix !== fixed) {
    hasChanges = true;
  }

  // Fix similar pattern with VITE_BACKEND_URL
  const backendPattern = /`\$\{import\.meta\.env\.VITE_BACKEND_URL \|\| '[^']*'\}`\}\/([^`]+)`?/g;
  const beforeBackendFix = fixed;
  fixed = fixed.replace(backendPattern, '`${import.meta.env.VITE_BACKEND_URL || \'http://localhost:4000\'}/$1`');
  
  if (beforeBackendFix !== fixed) {
    hasChanges = true;
  }

  // Fix any remaining double backtick issues
  const doubleBacktickPattern = /`\$\{([^}]+)\}`\}\/([^`]+)`?/g;
  const beforeDoubleBacktick = fixed;
  fixed = fixed.replace(doubleBacktickPattern, '`${$1}/$2`');
  
  if (beforeDoubleBacktick !== fixed) {
    hasChanges = true;
  }

  return { fixed, hasChanges };
}

function processFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const { fixed, hasChanges } = fixTemplateStringErrors(content);

    if (hasChanges) {
      fs.writeFileSync(filePath, fixed, 'utf8');
      console.log(`✅ Fixed: ${path.relative(process.cwd(), filePath)}`);
      return true;
    }

    return false;
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    return false;
  }
}

function main() {
  console.log('🔧 Fixing template literal syntax errors...');
  console.log('');

  const srcPath = path.join(__dirname, 'src');
  const files = getAllFiles(srcPath);
  
  let updatedFiles = 0;

  files.forEach(filePath => {
    if (processFile(filePath)) {
      updatedFiles++;
    }
  });

  console.log('');
  console.log('✨ Template literal fixes complete!');
  console.log(`📊 Summary: ${updatedFiles}/${files.length} files updated`);
  
  if (updatedFiles > 0) {
    console.log('');
    console.log('🎯 The syntax errors should now be resolved!');
    console.log('Try running your dev server again.');
  }
}

main();
