import CertificateGenerationService from '../services/certificateGenerationService.js';
import Certificate from '../models/certificateModel.js';
import Event from '../models/eventModel.js';
import User from '../models/userModel.js';

const certificateService = new CertificateGenerationService();

// Generate certificate from MongoDB data
export const generateCertificateFromDB = async (req, res) => {
  try {
    const { certificateId } = req.params;
    const { formats = ['pdf'] } = req.body;

    console.log(`Generating certificate for ID: ${certificateId}`);

    // Generate certificate using MongoDB data
    const result = await certificateService.generateCertificateFromDB(certificateId, formats);

    res.status(200).json({
      success: true,
      message: 'Certificate generated successfully',
      data: {
        certificateId: result.certificate.certificateId,
        participantName: result.certificate.participantName,
        eventTitle: result.certificate.eventTitle,
        pdfSize: result.pdfSize,
        imageSize: result.imageSize,
        status: result.certificate.status,
        generatedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error generating certificate:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate certificate',
      error: error.message
    });
  }
};

// Create new certificate record
export const createCertificate = async (req, res) => {
  try {
    const { participantId, eventId, skills = [] } = req.body;
    const issuedBy = req.user?.id || req.body.issuedBy;

    console.log(`Creating certificate for participant: ${participantId}, event: ${eventId}`);

    // Create certificate record
    const certificate = await certificateService.createCertificateRecord(
      participantId,
      eventId,
      issuedBy,
      { skills }
    );

    res.status(201).json({
      success: true,
      message: 'Certificate record created successfully',
      data: {
        certificateId: certificate.certificateId,
        participantName: certificate.participantName,
        eventTitle: certificate.eventTitle,
        status: certificate.status,
        createdAt: certificate.createdAt
      }
    });

  } catch (error) {
    console.error('Error creating certificate:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create certificate',
      error: error.message
    });
  }
};

// Generate and create certificate in one step
export const generateAndCreateCertificate = async (req, res) => {
  try {
    const { participantId, eventId, skills = [], formats = ['pdf'] } = req.body;
    const issuedBy = req.user?.id || req.body.issuedBy;

    console.log(`Creating and generating certificate for participant: ${participantId}, event: ${eventId}`);

    // Create certificate record
    const certificate = await certificateService.createCertificateRecord(
      participantId,
      eventId,
      issuedBy,
      { skills }
    );

    // Generate certificate
    const result = await certificateService.generateCertificateFromDB(certificate.certificateId, formats);

    res.status(201).json({
      success: true,
      message: 'Certificate created and generated successfully',
      data: {
        certificateId: result.certificate.certificateId,
        participantName: result.certificate.participantName,
        eventTitle: result.certificate.eventTitle,
        pdfSize: result.pdfSize,
        imageSize: result.imageSize,
        status: result.certificate.status,
        createdAt: result.certificate.createdAt,
        generatedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error creating and generating certificate:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create and generate certificate',
      error: error.message
    });
  }
};

// Download certificate PDF
export const downloadCertificatePDF = async (req, res) => {
  try {
    const { certificateId } = req.params;
    const userId = req.user?.id;

    console.log(`Downloading PDF for certificate: ${certificateId}`);

    const certificate = await Certificate.findOne({ certificateId });
    
    if (!certificate) {
      return res.status(404).json({
        success: false,
        message: 'Certificate not found'
      });
    }

    // Check if PDF buffer exists, if not generate it
    if (!certificate.certificateData.pdfBuffer) {
      console.log('PDF buffer not found, generating PDF...');
      
      try {
        // Generate PDF from existing image buffer or regenerate certificate
        const result = await certificateService.generateCertificateFromDB(certificateId, ['pdf']);
        
        if (!result.certificate.certificateData.pdfBuffer) {
          return res.status(404).json({
            success: false,
            message: 'Unable to generate PDF certificate'
          });
        }
      } catch (generateError) {
        console.error('Error generating PDF:', generateError);
        return res.status(500).json({
          success: false,
          message: 'Failed to generate PDF certificate',
          error: generateError.message
        });
      }
    }

    // Record download
    if (userId) {
      await certificate.recordDownload(userId, req.ip);
    }

    // Set appropriate headers for PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="certificate-${certificateId}.pdf"`);
    res.setHeader('Content-Length', certificate.certificateData.pdfBuffer.length);
    res.setHeader('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    res.setHeader('Expires', '-1');
    res.setHeader('Pragma', 'no-cache');
    
    res.send(certificate.certificateData.pdfBuffer);

  } catch (error) {
    console.error('Error downloading certificate PDF:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to download certificate',
      error: error.message
    });
  }
};

// Download certificate image
export const downloadCertificateImage = async (req, res) => {
  try {
    const { certificateId } = req.params;
    const userId = req.user?.id;

    console.log(`Downloading image for certificate: ${certificateId}`);

    const certificate = await Certificate.findOne({ certificateId });
    
    if (!certificate) {
      return res.status(404).json({
        success: false,
        message: 'Certificate not found'
      });
    }

    if (!certificate.certificateData.imageBuffer) {
      return res.status(404).json({
        success: false,
        message: 'Image not generated yet'
      });
    }

    // Record download
    if (userId) {
      await certificate.recordDownload(userId, req.ip);
    }

    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Content-Disposition', `attachment; filename="certificate-${certificateId}.png"`);
    res.setHeader('Content-Length', certificate.certificateData.imageBuffer.length);
    
    res.send(certificate.certificateData.imageBuffer);

  } catch (error) {
    console.error('Error downloading certificate image:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to download certificate image',
      error: error.message
    });
  }
};

// Verify certificate
export const verifyCertificate = async (req, res) => {
  try {
    const { certificateId } = req.params;

    console.log(`Verifying certificate: ${certificateId}`);

    const certificate = await Certificate.verifyCertificate(certificateId);
    
    if (!certificate) {
      return res.status(404).json({
        success: false,
        message: 'Certificate not found or has been revoked'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Certificate verified successfully',
      data: {
        certificateId: certificate.certificateId,
        participantName: certificate.participantName,
        participantEmail: certificate.participantId.email,
        eventTitle: certificate.eventTitle,
        eventDates: certificate.eventDates,
        venue: certificate.venue,
        mode: certificate.mode,
        issuedDate: certificate.issuedDate,
        issuedBy: certificate.issuedBy.name,
        status: certificate.status,
        skills: certificate.skills,
        verified: certificate.verification.verified
      }
    });

  } catch (error) {
    console.error('Error verifying certificate:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify certificate',
      error: error.message
    });
  }
};

// Get certificates by participant
export const getCertificatesByParticipant = async (req, res) => {
  try {
    const { participantId } = req.params;

    console.log(`Getting certificates for participant: ${participantId}`);

    const certificates = await Certificate.findByParticipant(participantId);

    res.status(200).json({
      success: true,
      message: 'Certificates retrieved successfully',
      data: certificates.map(cert => ({
        certificateId: cert.certificateId,
        eventTitle: cert.eventTitle,
        eventDates: cert.eventDates,
        issuedDate: cert.issuedDate,
        status: cert.status,
        downloadCount: cert.downloadCount,
        lastDownloaded: cert.lastDownloaded
      }))
    });

  } catch (error) {
    console.error('Error getting certificates by participant:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve certificates',
      error: error.message
    });
  }
};

// Get certificates by event
export const getCertificatesByEvent = async (req, res) => {
  try {
    const { eventId } = req.params;

    console.log(`Getting certificates for event: ${eventId}`);

    const certificates = await Certificate.findByEvent(eventId);

    res.status(200).json({
      success: true,
      message: 'Certificates retrieved successfully',
      data: certificates.map(cert => ({
        certificateId: cert.certificateId,
        participantName: cert.participantName,
        participantEmail: cert.participantId.email,
        issuedDate: cert.issuedDate,
        status: cert.status,
        downloadCount: cert.downloadCount,
        lastDownloaded: cert.lastDownloaded
      }))
    });

  } catch (error) {
    console.error('Error getting certificates by event:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve certificates',
      error: error.message
    });
  }
};

// Update certificate status
export const updateCertificateStatus = async (req, res) => {
  try {
    const { certificateId } = req.params;
    const { status, reason } = req.body;
    const userId = req.user?.id;

    console.log(`Updating certificate status: ${certificateId} to ${status}`);

    const certificate = await Certificate.findOne({ certificateId });
    
    if (!certificate) {
      return res.status(404).json({
        success: false,
        message: 'Certificate not found'
      });
    }

    certificate.status = status;
    
    // Add audit log
    await certificate.addAuditLog(
      status === 'revoked' ? 'revoked' : 'updated',
      userId,
      reason || `Status updated to ${status}`,
      req.ip
    );

    await certificate.save();

    res.status(200).json({
      success: true,
      message: 'Certificate status updated successfully',
      data: {
        certificateId: certificate.certificateId,
        status: certificate.status,
        updatedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error updating certificate status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update certificate status',
      error: error.message
    });
  }
};

// Get certificate statistics
export const getCertificateStats = async (req, res) => {
  try {
    const stats = await Certificate.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const totalDownloads = await Certificate.aggregate([
      {
        $group: {
          _id: null,
          totalDownloads: { $sum: '$downloadCount' }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      message: 'Certificate statistics retrieved successfully',
      data: {
        statusBreakdown: stats,
        totalDownloads: totalDownloads[0]?.totalDownloads || 0,
        generatedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error getting certificate statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve certificate statistics',
      error: error.message
    });
  }
};

// Preview certificate (for student portal viewing)
export const previewCertificate = async (req, res) => {
  try {
    const { certificateId } = req.params;
    const userId = req.user?.id;

    console.log(`Previewing certificate: ${certificateId}`);

    const certificate = await Certificate.findOne({ certificateId })
      .populate('participantId', 'name email')
      .populate('eventId', 'title startDate endDate venue mode')
      .populate('issuedBy', 'name email');
    
    if (!certificate) {
      return res.status(404).json({
        success: false,
        message: 'Certificate not found'
      });
    }

    // Check if user has permission to view this certificate
    if (userId && certificate.participantId._id.toString() !== userId) {
      // Allow admins and coordinators to view any certificate
      const user = await User.findById(userId);
      if (!user || !['admin', 'coordinator', 'hod'].includes(user.role)) {
        return res.status(403).json({
          success: false,
          message: 'You do not have permission to view this certificate'
        });
      }
    }

    // Return certificate data for preview (without buffer data)
    res.status(200).json({
      success: true,
      message: 'Certificate preview retrieved successfully',
      data: {
        certificateId: certificate.certificateId,
        participantName: certificate.participantName,
        participantEmail: certificate.participantId.email,
        eventTitle: certificate.eventTitle,
        eventDates: certificate.eventDates,
        venue: certificate.venue,
        mode: certificate.mode,
        issuedDate: certificate.issuedDate,
        issuedBy: certificate.issuedBy.name,
        status: certificate.status,
        skills: certificate.skills,
        template: certificate.template,
        verification: {
          verificationUrl: certificate.verification.verificationUrl,
          verified: certificate.verification.verified
        },
        downloadCount: certificate.downloadCount,
        lastDownloaded: certificate.lastDownloaded,
        hasImageBuffer: !!certificate.certificateData?.imageBuffer,
        hasPdfBuffer: !!certificate.certificateData?.pdfBuffer
      }
    });

  } catch (error) {
    console.error('Error previewing certificate:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to preview certificate',
      error: error.message
    });
  }
};

// Get certificate image for preview (base64 encoded for student portal)
export const getCertificateImagePreview = async (req, res) => {
  try {
    const { certificateId } = req.params;
    const userId = req.user?.id;

    console.log(`Getting image preview for certificate: ${certificateId}`);

    const certificate = await Certificate.findOne({ certificateId })
      .populate('participantId', '_id');
    
    if (!certificate) {
      return res.status(404).json({
        success: false,
        message: 'Certificate not found'
      });
    }

    // Check if user has permission to view this certificate
    if (userId && certificate.participantId._id.toString() !== userId) {
      const user = await User.findById(userId);
      if (!user || !['admin', 'coordinator', 'hod'].includes(user.role)) {
        return res.status(403).json({
          success: false,
          message: 'You do not have permission to view this certificate'
        });
      }
    }

    // Check if image buffer exists, if not generate it
    if (!certificate.certificateData?.imageBuffer) {
      console.log('Image buffer not found, generating image...');
      
      try {
        const result = await certificateService.generateCertificateFromDB(certificateId, ['image']);
        
        if (!result.certificate.certificateData.imageBuffer) {
          return res.status(404).json({
            success: false,
            message: 'Unable to generate certificate image'
          });
        }
      } catch (generateError) {
        console.error('Error generating image:', generateError);
        return res.status(500).json({
          success: false,
          message: 'Failed to generate certificate image',
          error: generateError.message
        });
      }
    }

    // Convert buffer to base64 for preview
    const base64Image = certificate.certificateData.imageBuffer.toString('base64');
    const imageDataUrl = `data:image/png;base64,${base64Image}`;

    res.status(200).json({
      success: true,
      message: 'Certificate image preview retrieved successfully',
      data: {
        certificateId: certificate.certificateId,
        imageDataUrl: imageDataUrl,
        contentType: 'image/png',
        size: certificate.certificateData.imageBuffer.length
      }
    });

  } catch (error) {
    console.error('Error getting certificate image preview:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get certificate image preview',
      error: error.message
    });
  }
};

// Bulk certificate operations for buffer management
export const bulkCertificateOperations = async (req, res) => {
  try {
    const { operation, certificateIds, formats = ['pdf', 'image'] } = req.body;
    const userId = req.user?.id;

    console.log(`Performing bulk operation: ${operation} on ${certificateIds.length} certificates`);

    if (!['regenerate', 'cleanup', 'verify'].includes(operation)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid operation. Supported operations: regenerate, cleanup, verify'
      });
    }

    const results = [];
    const errors = [];

    for (const certificateId of certificateIds) {
      try {
        const certificate = await Certificate.findOne({ certificateId });
        
        if (!certificate) {
          errors.push({ certificateId, error: 'Certificate not found' });
          continue;
        }

        switch (operation) {
          case 'regenerate':
            const result = await certificateService.generateCertificateFromDB(certificateId, formats);
            results.push({
              certificateId,
              status: 'regenerated',
              pdfSize: result.pdfSize,
              imageSize: result.imageSize
            });
            break;

          case 'cleanup':
            // Clear buffer data to free up storage
            certificate.certificateData.pdfBuffer = undefined;
            certificate.certificateData.imageBuffer = undefined;
            await certificate.save();
            
            await certificate.addAuditLog('updated', userId, 'Buffer data cleaned up', req.ip);
            
            results.push({
              certificateId,
              status: 'cleaned'
            });
            break;

          case 'verify':
            const isValid = await Certificate.verifyCertificate(certificateId);
            results.push({
              certificateId,
              status: 'verified',
              valid: !!isValid
            });
            break;
        }
      } catch (error) {
        errors.push({ certificateId, error: error.message });
      }
    }

    res.status(200).json({
      success: true,
      message: `Bulk ${operation} operation completed`,
      data: {
        processed: results.length,
        errors: errors.length,
        results,
        errors
      }
    });

  } catch (error) {
    console.error('Error in bulk certificate operations:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to perform bulk operation',
      error: error.message
    });
  }
};

// Get buffer storage statistics
export const getBufferStorageStats = async (req, res) => {
  try {
    console.log('Getting buffer storage statistics...');

    const stats = await Certificate.aggregate([
      {
        $group: {
          _id: null,
          totalCertificates: { $sum: 1 },
          certificatesWithPdf: {
            $sum: {
              $cond: [{ $ne: ['$certificateData.pdfBuffer', null] }, 1, 0]
            }
          },
          certificatesWithImage: {
            $sum: {
              $cond: [{ $ne: ['$certificateData.imageBuffer', null] }, 1, 0]
            }
          },
          totalPdfSize: {
            $sum: {
              $cond: [
                { $ne: ['$certificateData.pdfBuffer', null] },
                { $bsonSize: '$certificateData.pdfBuffer' },
                0
              ]
            }
          },
          totalImageSize: {
            $sum: {
              $cond: [
                { $ne: ['$certificateData.imageBuffer', null] },
                { $bsonSize: '$certificateData.imageBuffer' },
                0
              ]
            }
          }
        }
      }
    ]);

    const storageStats = stats[0] || {
      totalCertificates: 0,
      certificatesWithPdf: 0,
      certificatesWithImage: 0,
      totalPdfSize: 0,
      totalImageSize: 0
    };

    // Calculate storage efficiency
    const totalStorageUsed = storageStats.totalPdfSize + storageStats.totalImageSize;
    const averagePdfSize = storageStats.certificatesWithPdf > 0 
      ? storageStats.totalPdfSize / storageStats.certificatesWithPdf 
      : 0;
    const averageImageSize = storageStats.certificatesWithImage > 0 
      ? storageStats.totalImageSize / storageStats.certificatesWithImage 
      : 0;

    res.status(200).json({
      success: true,
      message: 'Buffer storage statistics retrieved successfully',
      data: {
        ...storageStats,
        totalStorageUsed,
        averagePdfSize: Math.round(averagePdfSize),
        averageImageSize: Math.round(averageImageSize),
        storageEfficiency: {
          pdfCoverage: storageStats.totalCertificates > 0 
            ? (storageStats.certificatesWithPdf / storageStats.totalCertificates * 100).toFixed(2) + '%'
            : '0%',
          imageCoverage: storageStats.totalCertificates > 0 
            ? (storageStats.certificatesWithImage / storageStats.totalCertificates * 100).toFixed(2) + '%'
            : '0%'
        },
        generatedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error getting buffer storage statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve buffer storage statistics',
      error: error.message
    });
  }
};