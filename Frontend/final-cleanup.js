#!/usr/bin/env node

/**
 * Final cleanup script to fix the remaining actual hardcoded 10.5.12.1:4000 URLs
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Files that still need manual fixes for 10.5.12.1:4000
const FILES_TO_FIX = [
  'src/features/auth/RegisterForm.jsx',
  'src/features/auth/ForgotPasswordDummy.jsx', 
  'src/features/admin/PasswordResetRequestsAdmin.jsx',
  'src/features/events/coordinator/components/ProfileDialog.jsx',
  'src/features/events/coordinator/hooks/useClaimOperations.js',
  'src/features/events/coordinator/hooks/useEventOperations.js',
  'src/features/events/coordinator/hooks/useFormState.js',
  'src/features/events/hod/Components/EnhancedHODProfile.jsx',
  'src/features/events/hod/Components/NotificationCenter.jsx',
  'src/features/events/hod/dashboard.jsx',
  'src/shared/components/OrganizingCommitteeManager.jsx',
  'src/utils/profileTestUtils.js'
];

function fixFile(filePath) {
  try {
    const fullPath = path.join(__dirname, filePath);
    
    if (!fs.existsSync(fullPath)) {
      console.log(`⚠️  File not found: ${filePath}`);
      return false;
    }

    let content = fs.readFileSync(fullPath, 'utf8');
    const originalContent = content;

    // Replace all remaining 10.5.12.1:4000 URLs
    content = content.replace(
      /['"`]http:\/\/10\.5\.12\.1:4000\/api['"`]/g,
      '`${import.meta.env.VITE_API_BASE_URL || \'http://localhost:4000/api\'}`'
    );

    content = content.replace(
      /['"`]http:\/\/10\.5\.12\.1:4000['"`]/g,
      '`${import.meta.env.VITE_BACKEND_URL || \'http://localhost:4000\'}`'
    );

    // Fix template literals
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
      fs.writeFileSync(fullPath, content, 'utf8');
      console.log(`✅ Fixed: ${filePath}`);
      return true;
    }

    return false;
  } catch (error) {
    console.error(`❌ Error fixing ${filePath}:`, error.message);
    return false;
  }
}

function main() {
  console.log('🔧 Final cleanup of remaining hardcoded URLs...');
  console.log('');

  let fixedFiles = 0;

  FILES_TO_FIX.forEach(filePath => {
    if (fixFile(filePath)) {
      fixedFiles++;
    }
  });

  console.log('');
  console.log('✨ Final cleanup complete!');
  console.log(`📊 Fixed ${fixedFiles}/${FILES_TO_FIX.length} files`);
}

main();
