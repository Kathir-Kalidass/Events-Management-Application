import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import mongoose from 'mongoose';
import Certificate from './models/certificateModel.js';
import ParticipantEvent from './models/ParticipantEventModel.js';
import User from './models/userModel.js';
import Event from './models/eventModel.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configure dotenv
dotenv.config({ path: join(__dirname, '.env') });

async function fixCertificates() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Find participant events with feedback given but missing certificate
    const participantEvents = await ParticipantEvent.find({ 
      feedbackGiven: true,
      $or: [
        { certificateGenerated: false },
        { certificateId: { $exists: false } },
        { certificateId: null },
        { certificateId: undefined }
      ]
    }).populate('participantId').populate('eventId');
    
    console.log(`\nFound ${participantEvents.length} participant events needing certificate generation`);

    for (const pe of participantEvents) {
      try {
        console.log(`\nGenerating certificate for ${pe.participantId.name} - ${pe.eventId.title}`);
        
        // Generate unique certificate ID
        const timestamp = Date.now();
        const random = Math.random().toString(36).substr(2, 9).toUpperCase();
        const certificateId = `CERT-${timestamp}-${random}`;

        // Create certificate record in the Certificate model
        const newCertificate = new Certificate({
          certificateId,
          participantId: pe.participantId._id,
          eventId: pe.eventId._id,
          participantName: pe.participantId.name,
          eventTitle: pe.eventId.title,
          eventDuration: pe.eventId.duration || "1 Day",
          eventDates: {
            startDate: pe.eventId.startDate,
            endDate: pe.eventId.endDate,
          },
          venue: pe.eventId.venue,
          mode: pe.eventId.mode,
          issuedBy: pe.participantId._id, // For feedback-generated certificates
          issuedDate: new Date(),
          template: {
            name: "cream-bordered-appreciation",
            path: "template/Cream Bordered Appreciation Certificate.png",
            dimensions: {
              width: 1200,
              height: 900,
            },
          },
          verification: {
            verificationUrl: `${process.env.FRONTEND_URL || 'http://localhost:5174'}/verify-certificate/${certificateId}`,
            digitalSignature: Buffer.from(certificateId).toString("base64"),
            verified: true,
          },
          status: "generated",
          skills: pe.eventId.skills || [],
          metadata: {
            generationTime: Date.now() - timestamp,
            generatedOn: process.env.NODE_ENV || "development",
            ipAddress: "127.0.0.1",
          },
        });

        // Add audit log entry
        newCertificate.auditLog.push({
          action: "created",
          performedBy: pe.participantId._id,
          details: "Certificate generated via fix script",
          ipAddress: "127.0.0.1",
          timestamp: new Date(),
        });

        await newCertificate.save();

        // Update ParticipantEvent with certificate info
        await ParticipantEvent.findByIdAndUpdate(pe._id, {
          certificateGenerated: true,
          certificateGeneratedDate: new Date(),
          certificateId: certificateId
        });

        console.log(`✅ Certificate generated: ${certificateId}`);
      } catch (error) {
        console.error(`❌ Error generating certificate for ${pe.participantId.name}:`, error.message);
      }
    }

    // Verify the fix
    const certificates = await Certificate.find({}).populate('participantId').populate('eventId');
    console.log(`\n✅ Total certificates now: ${certificates.length}`);
    certificates.forEach(cert => {
      console.log(`- ${cert.participantName} - ${cert.eventTitle} - ${cert.certificateId}`);
    });

    await mongoose.connection.close();
    console.log('\nDatabase connection closed');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

fixCertificates();