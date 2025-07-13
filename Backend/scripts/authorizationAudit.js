import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Authorization Audit Script
 * This script checks all controllers for proper authorization implementation
 */

const BACKEND_DIR = path.join(__dirname, '..');
const CONTROLLERS_DIR = path.join(BACKEND_DIR, 'controllers');

// Define role-based access patterns
const ROLE_PATTERNS = {
  participant: ['participant'],
  coordinator: ['coordinator', 'hod', 'admin'],
  hod: ['hod', 'admin'],
  admin: ['admin']
};

// Define sensitive operations that require authorization
const SENSITIVE_OPERATIONS = [
  'create', 'update', 'delete', 'approve', 'reject', 'submit', 'generate',
  'download', 'export', 'upload', 'mark', 'bulk', 'fix', 'sync'
];

function getAllFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      getAllFiles(filePath, fileList);
    } else if (file.endsWith('.js')) {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

function analyzeController(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const relativePath = path.relative(BACKEND_DIR, filePath);
  
  const analysis = {
    file: relativePath,
    functions: [],
    hasRoleChecks: false,
    hasAuthMiddleware: false,
    issues: []
  };
  
  // Check for role-based authorization patterns
  const roleCheckPatterns = [
    /req\.user\.role/g,
    /authorizeRoles/g,
    /authorizeEventCoordinator/g,
    /authorizeResourceOwnership/g,
    /authorizeParticipantSelfAccess/g
  ];
  
  analysis.hasRoleChecks = roleCheckPatterns.some(pattern => pattern.test(content));
  analysis.hasAuthMiddleware = /authMiddleware|req\.user/.test(content);
  
  // Extract function definitions
  const functionMatches = content.matchAll(/export\s+(?:const|function)\s+(\w+)|exports\.(\w+)\s*=/g);
  for (const match of functionMatches) {
    const functionName = match[1] || match[2];
    if (functionName) {
      analysis.functions.push(functionName);
      
      // Check if function performs sensitive operations
      const isSensitive = SENSITIVE_OPERATIONS.some(op => 
        functionName.toLowerCase().includes(op.toLowerCase())
      );
      
      if (isSensitive && !analysis.hasRoleChecks) {
        analysis.issues.push(`Function '${functionName}' performs sensitive operations but lacks role-based authorization`);
      }
    }
  }
  
  // Check for direct database operations without authorization
  const dbOperations = [
    'findByIdAndUpdate', 'findByIdAndDelete', 'deleteOne', 'deleteMany',
    'updateOne', 'updateMany', 'create', 'save'
  ];
  
  dbOperations.forEach(op => {
    const regex = new RegExp(`\\.${op}\\(`, 'g');
    if (regex.test(content) && !analysis.hasRoleChecks) {
      analysis.issues.push(`File contains '${op}' operations but lacks role-based authorization`);
    }
  });
  
  return analysis;
}

function generateReport() {
  console.log('🔍 Starting Authorization Audit...\n');
  
  const controllerFiles = getAllFiles(CONTROLLERS_DIR);
  const results = [];
  
  controllerFiles.forEach(file => {
    const analysis = analyzeController(file);
    results.push(analysis);
  });
  
  // Generate summary report
  console.log('📊 AUTHORIZATION AUDIT REPORT');
  console.log('=' .repeat(50));
  
  const totalFiles = results.length;
  const filesWithRoleChecks = results.filter(r => r.hasRoleChecks).length;
  const filesWithIssues = results.filter(r => r.issues.length > 0).length;
  
  console.log(`Total controller files: ${totalFiles}`);
  console.log(`Files with role checks: ${filesWithRoleChecks}`);
  console.log(`Files with authorization issues: ${filesWithIssues}`);
  console.log(`Authorization coverage: ${((filesWithRoleChecks / totalFiles) * 100).toFixed(1)}%\n`);
  
  // Detailed issues
  if (filesWithIssues > 0) {
    console.log('⚠️  AUTHORIZATION ISSUES FOUND:');
    console.log('-'.repeat(50));
    
    results.forEach(result => {
      if (result.issues.length > 0) {
        console.log(`\n📁 ${result.file}`);
        result.issues.forEach(issue => {
          console.log(`   ❌ ${issue}`);
        });
      }
    });
  }
  
  // Files without role checks
  const filesWithoutRoleChecks = results.filter(r => !r.hasRoleChecks);
  if (filesWithoutRoleChecks.length > 0) {
    console.log('\n📋 FILES WITHOUT ROLE-BASED AUTHORIZATION:');
    console.log('-'.repeat(50));
    
    filesWithoutRoleChecks.forEach(result => {
      console.log(`📁 ${result.file}`);
      if (result.functions.length > 0) {
        console.log(`   Functions: ${result.functions.join(', ')}`);
      }
    });
  }
  
  // Recommendations
  console.log('\n💡 RECOMMENDATIONS:');
  console.log('-'.repeat(50));
  console.log('1. Add role-based authorization middleware to all sensitive routes');
  console.log('2. Implement resource ownership checks for user-specific data');
  console.log('3. Use authorizeEventCoordinator for event-related operations');
  console.log('4. Add authorizeParticipantSelfAccess for participant data access');
  console.log('5. Ensure all database operations have proper authorization checks');
  
  console.log('\n✅ Audit completed!');
}

// Run the audit
generateReport();