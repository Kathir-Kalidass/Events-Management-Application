import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import mongoose from 'mongoose';
import Certificate from './models/certificateModel.js';
import User from './models/userModel.js';
import Event from './models/eventModel.js';
import CertificateGenerationService from './services/certificateGenerationService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configure dotenv
dotenv.config({ path: join(__dirname, '.env') });

// Initialize certificate generation service
const certificateService = new CertificateGenerationService();

async function regenerateCertificates() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Find all existing certificates
    const certificates = await Certificate.find({})
      .populate('participantId')
      .populate('eventId');

    console.log(`\nFound ${certificates.length} certificates to regenerate`);

    for (const certificate of certificates) {
      try {
        console.log(`\nRegenerating certificate for ${certificate.participantName} - ${certificate.eventTitle}`);
        
        // Get HOD and coordinator information
        const hodUser = await User.findOne({ role: "hod" });
        const coordinatorUser = await User.findById(certificate.eventId.createdBy);

        // Prepare certificate data with enhanced information
        const certificateData = {
          participantName: certificate.participantName,
          eventTitle: certificate.eventTitle,
          eventDuration: certificate.eventDuration,
          eventDates: certificate.eventDates,
          venue: certificate.venue,
          mode: certificate.mode,
          issuedDate: certificate.issuedDate,
          certificateId: certificate.certificateId,
          skills: certificate.skills || [],
          hodName: hodUser?.name || process.env.DEPARTMENT_HEAD || "Dr. Department Head",
          coordinatorName: coordinatorUser?.name || "Program Coordinator"
        };

        // Generate new certificate with enhanced design
        const certificateResults = await certificateService.generateCertificate(certificateData, ['pdf', 'image']);

        // Update the certificate record with new data
        await Certificate.findByIdAndUpdate(certificate._id, {
          template: {
            name: "enhanced-university-certificate",
            path: "services/certificateGenerationService.js",
            dimensions: {
              width: 1200,
              height: 900,
            },
          },
          certificateData: {
            pdfBuffer: Buffer.from(certificateResults.pdfBuffer),
            imageBuffer: Buffer.from(certificateResults.imageBuffer),
            contentType: "application/pdf",
            fileName: `certificate-${certificate.certificateId}.pdf`,
            fileSize: certificateResults.pdfSize || certificateResults.imageSize,
          },
          'metadata.regeneratedOn': new Date(),
          'metadata.regeneratedWith': 'enhanced-template'
        });

        // Add audit log entry
        certificate.auditLog.push({
          action: "updated",
          performedBy: certificate.participantId._id,
          details: "Certificate regenerated with enhanced template",
          ipAddress: "127.0.0.1",
          timestamp: new Date(),
        });

        await certificate.save();

        console.log(`✅ Certificate regenerated: ${certificate.certificateId}`);
      } catch (error) {
        console.error(`❌ Error regenerating certificate for ${certificate.participantName}:`, error.message);
      }
    }

    // Verify the regeneration
    const updatedCertificates = await Certificate.find({});
    console.log(`\n✅ Total certificates regenerated: ${updatedCertificates.length}`);

    await mongoose.connection.close();
    console.log('\nDatabase connection closed');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

regenerateCertificates();