#!/usr/bin/env node

/**
 * Script to replace all hardcoded URLs in the frontend with environment variables
 * This will replace all instances of 'http://10.5.12.1:4000' with proper environment variable usage
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const HARDCODED_URL = 'http://10.5.12.1:4000';
const HARDCODED_API_URL = 'http://10.5.12.1:4000/api';
const ENV_REPLACEMENT = "import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api'";
const ENV_BASE_REPLACEMENT = "import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000'";

// File extensions to process
const EXTENSIONS = ['.js', '.jsx', '.ts', '.tsx'];

// Directories to process (relative to Frontend folder)
const DIRECTORIES = ['src'];

// Replacement patterns
const REPLACEMENTS = [
  // API URLs with /api suffix
  {
    pattern: /['"`]http:\/\/10\.5\.12\.1:4000\/api['"`]/g,
    replacement: `\`\${${ENV_REPLACEMENT}}\``
  },
  // Base URLs without /api suffix  
  {
    pattern: /['"`]http:\/\/10\.5\.12\.1:4000['"`]/g,
    replacement: `\`\${${ENV_BASE_REPLACEMENT}}\``
  },
  // Template literal API URLs
  {
    pattern: /`http:\/\/10\.5\.12\.1:4000\/api([^`]*)`/g,
    replacement: (match, path) => `\`\${${ENV_REPLACEMENT}}${path}\``
  },
  // Template literal base URLs
  {
    pattern: /`http:\/\/10\.5\.12\.1:4000([^`]*)`/g,
    replacement: (match, path) => `\`\${${ENV_BASE_REPLACEMENT}}${path}\``
  },
  // Concatenated API URLs
  {
    pattern: /['"`]http:\/\/10\.5\.12\.1:4000\/api['"`]\s*\+/g,
    replacement: `\`\${${ENV_REPLACEMENT}}\` +`
  },
  // Variable assignments for API base
  {
    pattern: /(const\s+\w+\s*=\s*)['"`]http:\/\/10\.5\.12\.1:4000\/api['"`]/g,
    replacement: `$1${ENV_REPLACEMENT}`
  },
  // Variable assignments for base URL
  {
    pattern: /(const\s+\w+\s*=\s*)['"`]http:\/\/10\.5\.12\.1:4000['"`]/g,
    replacement: `$1${ENV_BASE_REPLACEMENT}`
  },
  // Object property assignments for baseURL
  {
    pattern: /(baseURL:\s*)['"`]http:\/\/10\.5\.12\.1:4000\/api['"`]/g,
    replacement: `$1${ENV_REPLACEMENT}`
  }
];

/**
 * Get all files recursively from a directory
 */
function getAllFiles(dirPath, arrayOfFiles = []) {
  const files = fs.readdirSync(dirPath);

  files.forEach(file => {
    const fullPath = path.join(dirPath, file);
    
    if (fs.statSync(fullPath).isDirectory()) {
      // Skip node_modules and other build directories
      if (!['node_modules', 'dist', 'build', '.git'].includes(file)) {
        arrayOfFiles = getAllFiles(fullPath, arrayOfFiles);
      }
    } else {
      // Only process files with specified extensions
      const ext = path.extname(file);
      if (EXTENSIONS.includes(ext)) {
        arrayOfFiles.push(fullPath);
      }
    }
  });

  return arrayOfFiles;
}

/**
 * Process a single file
 */
function processFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    let newContent = content;
    let hasChanges = false;

    // Apply all replacement patterns
    REPLACEMENTS.forEach(({ pattern, replacement }) => {
      const beforeReplace = newContent;
      
      if (typeof replacement === 'function') {
        newContent = newContent.replace(pattern, replacement);
      } else {
        newContent = newContent.replace(pattern, replacement);
      }
      
      if (beforeReplace !== newContent) {
        hasChanges = true;
      }
    });

    // Write back if changes were made
    if (hasChanges) {
      fs.writeFileSync(filePath, newContent, 'utf8');
      console.log(`✅ Updated: ${path.relative(process.cwd(), filePath)}`);
      return true;
    } else {
      return false;
    }
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    return false;
  }
}

/**
 * Main execution
 */
function main() {
  console.log('🔧 Starting hardcoded URL replacement...');
  console.log(`📁 Processing directories: ${DIRECTORIES.join(', ')}`);
  console.log(`🔗 Replacing: ${HARDCODED_URL}`);
  console.log(`🔗 Replacing: ${HARDCODED_API_URL}`);
  console.log('');

  let totalFiles = 0;
  let updatedFiles = 0;

  // Process each directory
  DIRECTORIES.forEach(dir => {
    const dirPath = path.join(__dirname, dir);
    
    if (!fs.existsSync(dirPath)) {
      console.warn(`⚠️  Directory not found: ${dirPath}`);
      return;
    }

    const files = getAllFiles(dirPath);
    console.log(`📂 Found ${files.length} files in ${dir}/`);

    files.forEach(filePath => {
      totalFiles++;
      if (processFile(filePath)) {
        updatedFiles++;
      }
    });
  });

  console.log('');
  console.log('✨ Replacement complete!');
  console.log(`📊 Summary: ${updatedFiles}/${totalFiles} files updated`);
  
  if (updatedFiles > 0) {
    console.log('');
    console.log('🎯 Next steps:');
    console.log('1. Review the changes in git diff');
    console.log('2. Test the application to ensure everything works');
    console.log('3. Make sure your .env file has the correct values:');
    console.log('   VITE_BACKEND_URL=http://localhost:4000');
    console.log('   VITE_API_BASE_URL=http://localhost:4000/api');
  }
}

// Run the script
main();
