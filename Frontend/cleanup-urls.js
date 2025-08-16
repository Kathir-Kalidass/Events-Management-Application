#!/usr/bin/env node

/**
 * Advanced script to clean up and properly replace hardcoded URLs
 * This fixes issues from the previous script and handles edge cases
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

function processFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let originalContent = content;

    // Fix nested environment variables first
    content = content.replace(
      /\$\{import\.meta\.env\.VITE_API_BASE_URL \|\| `\$\{import\.meta\.env\.VITE_API_BASE_URL \|\| '[^']*'\}/g,
      '${import.meta.env.VITE_API_BASE_URL || \'http://localhost:4000/api\'}'
    );

    // Fix malformed environment variable expressions
    content = content.replace(
      /import\.meta\.env\.VITE_API_BASE_URL \|\| `\$\{import\.meta\.env\.VITE_API_BASE_URL \|\| '[^']*'\}/g,
      'import.meta.env.VITE_API_BASE_URL || \'http://localhost:4000/api\''
    );

    // Replace remaining 10.5.12.1:4000/api patterns
    content = content.replace(
      /['"`]http:\/\/10\.5\.12\.1:4000\/api['"`]/g,
      '`${import.meta.env.VITE_API_BASE_URL || \'http://localhost:4000/api\'}`'
    );

    // Replace remaining 10.5.12.1:4000 patterns (without /api)
    content = content.replace(
      /['"`]http:\/\/10\.5\.12\.1:4000['"`]/g,
      '`${import.meta.env.VITE_BACKEND_URL || \'http://localhost:4000\'}`'
    );

    // Clean up const declarations with proper fallbacks
    content = content.replace(
      /(const\s+\w+\s*=\s*)['"`]http:\/\/10\.5\.12\.1:4000\/api['"`]/g,
      '$1import.meta.env.VITE_API_BASE_URL || \'http://localhost:4000/api\''
    );

    content = content.replace(
      /(const\s+\w+\s*=\s*)['"`]http:\/\/10\.5\.12\.1:4000['"`]/g,
      '$1import.meta.env.VITE_BACKEND_URL || \'http://localhost:4000\''
    );

    // Fix baseURL in axios configs
    content = content.replace(
      /(baseURL:\s*)['"`]http:\/\/10\.5\.12\.1:4000\/api['"`]/g,
      '$1import.meta.env.VITE_API_BASE_URL || \'http://localhost:4000/api\''
    );

    // Clean up any remaining localhost fallbacks that are outside environment variables
    content = content.replace(
      /\|\|\s*['"`]http:\/\/localhost:4000\/api['"`]/g,
      '|| \'http://localhost:4000/api\''
    );

    content = content.replace(
      /\|\|\s*['"`]http:\/\/localhost:4000['"`]/g,
      '|| \'http://localhost:4000\''
    );

    // Fix template literals with 10.5.12.1
    content = content.replace(
      /`http:\/\/10\.5\.12\.1:4000\/api([^`]*)`/g,
      '`${import.meta.env.VITE_API_BASE_URL || \'http://localhost:4000/api\'}$1`'
    );

    content = content.replace(
      /`http:\/\/10\.5\.12\.1:4000([^`]*)`/g,
      '`${import.meta.env.VITE_BACKEND_URL || \'http://localhost:4000\'}$1`'
    );

    // Write back if changes were made
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8');
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
  console.log('🔧 Cleaning up hardcoded URLs...');
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
  console.log('✨ Cleanup complete!');
  console.log(`📊 Summary: ${updatedFiles}/${files.length} files updated`);
}

main();
