#!/usr/bin/env node

/**
 * Certificate Regeneration Script
 * 
 * This script regenerates all existing certificates with updated HOD information
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

// Import models and services
import Certificate from '../src/shared/models/certificateModel.js';
import CertificateGenerationService from '../src/shared/services/certificateGenerationService.js';

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function connectToDatabase() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    log('✅ Connected to MongoDB', 'green');
  } catch (error) {
    log(`❌ Failed to connect to MongoDB: ${error.message}`, 'red');
    process.exit(1);
  }
}

async function regenerateAllCertificates() {
  try {
    log('\n🔄 Finding certificates to regenerate...', 'blue');
    
    // Find all certificates that have been generated
    const certificates = await Certificate.find({
      status: { $in: ['generated', 'issued'] }
    }).select('certificateId participantName eventTitle status');
    
    if (certificates.length === 0) {
      log('ℹ️  No certificates found to regenerate', 'yellow');
      return;
    }
    
    log(`📊 Found ${certificates.length} certificate(s) to regenerate`, 'green');
    
    const certificateService = new CertificateGenerationService();
    let successCount = 0;
    let errorCount = 0;
    
    for (let i = 0; i < certificates.length; i++) {
      const cert = certificates[i];
      try {
        log(`\n🔄 [${i + 1}/${certificates.length}] Regenerating certificate: ${cert.certificateId}`, 'cyan');
        log(`   Participant: ${cert.participantName}`, 'white');
        log(`   Event: ${cert.eventTitle}`, 'white');
        
        // Regenerate the certificate
        const result = await certificateService.generateCertificateFromDB(cert.certificateId, ['pdf', 'image']);
        
        if (result.certificate) {
          log(`   ✅ Successfully regenerated`, 'green');
          successCount++;
        } else {
          log(`   ⚠️  Regenerated with warnings`, 'yellow');
          successCount++;
        }
        
      } catch (error) {
        log(`   ❌ Failed to regenerate: ${error.message}`, 'red');
        errorCount++;
      }
    }
    
    log(`\n📈 Regeneration Summary:`, 'blue');
    log(`   ✅ Successful: ${successCount}`, 'green');
    log(`   ❌ Failed: ${errorCount}`, 'red');
    log(`   📊 Total: ${certificates.length}`, 'white');
    
    if (successCount > 0) {
      log(`\n🎉 Certificate regeneration completed! All certificates now use the updated HOD information.`, 'green');
    }
    
  } catch (error) {
    log(`❌ Error during certificate regeneration: ${error.message}`, 'red');
  }
}

async function main() {
  log(`${colors.bright}🔄 Certificate Regeneration Script${colors.reset}`);
  log('This script regenerates all certificates with updated HOD information\n');
  
  // Connect to database
  await connectToDatabase();
  
  // Regenerate certificates
  await regenerateAllCertificates();
  
  // Close database connection
  await mongoose.connection.close();
  log('\n✅ Database connection closed', 'green');
}

// Handle errors
process.on('unhandledRejection', (error) => {
  log(`❌ Unhandled rejection: ${error.message}`, 'red');
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  log(`❌ Uncaught exception: ${error.message}`, 'red');
  process.exit(1);
});

// Run the script
main().catch((error) => {
  log(`❌ Script failed: ${error.message}`, 'red');
  process.exit(1);
});