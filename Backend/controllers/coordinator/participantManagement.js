import asyncHandler from "express-async-handler";
import Participant from "../../models/participantModel.js";
import ParticipantEvent from "../../models/ParticipantEventModel.js";
import Event from "../../models/eventModel.js";
import User from "../../models/userModel.js";
import mongoose from "mongoose";
import ExcelJS from "exceljs";

// Helper function to format DOB as password (DDMMYYYY)
const formatDOBAsPassword = (dob) => {
  const date = new Date(dob);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}${month}${year}`;
};

// Get all participants for a coordinator's events
export const getParticipants = asyncHandler(async (req, res) => {
  try {
    const coordinatorId = req.user._id;
    
    // Find events created by this coordinator
    const coordinatorEvents = await Event.find({ createdBy: coordinatorId }).select('_id title');
    const eventIds = coordinatorEvents.map(event => event._id);
    
    // Find participants registered for these events
    const participants = await Participant.find({
      'eventRegistrations.eventId': { $in: eventIds }
    })
    .populate('eventRegistrations.eventId', 'title startDate endDate')
    .populate('eventRegistrations.approvedBy', 'name')
    .populate('createdBy', 'name')
    .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      participants,
      totalCount: participants.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get participants for a specific event
export const getEventParticipants = asyncHandler(async (req, res) => {
  try {
    const { eventId } = req.params;
    
    // Verify event exists
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found"
      });
    }
    
    // Find participant events for this specific event using ParticipantEvent model
    const participantEvents = await ParticipantEvent.find({ eventId })
      .populate('participantId', 'name email department role')
      .populate('approvedBy', 'name')
      .populate('attendanceMarkedBy', 'name')
      .sort({ createdAt: -1 });
    
    // Track orphaned records for cleanup
    const orphanedRecords = [];
    
    // Transform the data to match the expected frontend format with robust error handling
    const participants = participantEvents
      .map(pe => {
        const participant = pe.participantId;
        
        // Handle case where participant reference is broken
        if (!participant) {
          console.warn(`⚠️ Orphaned ParticipantEvent found: ${pe._id} - participantId ${pe.participantId} not found`);
          orphanedRecords.push({
            participantEventId: pe._id,
            missingParticipantId: pe.participantId,
            eventId: pe.eventId
          });
          
          // Return null for orphaned records - they will be filtered out
          return null;
        }
        
        return {
          _id: participant._id,
          name: participant.name,
          email: participant.email,
          dateOfBirth: null, // User model doesn't have dateOfBirth
          department: participant.department,
          phone: null, // User model doesn't have phone
          institution: null, // User model doesn't have institution
          designation: participant.role, // Use role from User model
          eventRegistrations: [{
            eventId: { _id: pe.eventId },
            approved: pe.approved,
            attended: pe.attended,
            feedbackGiven: pe.feedbackGiven,
            certificateGenerated: pe.certificateGenerated,
            registrationDate: pe.registrationDate,
            approvedBy: pe.approvedBy,
            approvedDate: pe.approvedDate,
            attendanceMarkedBy: pe.attendanceMarkedBy,
            attendanceMarkedDate: pe.attendanceMarkedDate,
            rejectionReason: pe.rejectionReason
          }]
        };
      })
      .filter(participant => participant !== null); // Filter out orphaned records
    
    // Log orphaned records for monitoring
    if (orphanedRecords.length > 0) {
      console.error(`🚨 Found ${orphanedRecords.length} orphaned ParticipantEvent records for event ${eventId}:`, orphanedRecords);
      
      // Auto-cleanup orphaned records
      await ParticipantEvent.deleteMany({ 
        _id: { $in: orphanedRecords.map(r => r.participantEventId) } 
      });
      console.log(`🧹 Cleaned up ${orphanedRecords.length} orphaned records`);
    }
    
    console.log(`📊 Found ${participants.length} participants for event ${eventId} (${orphanedRecords.length} orphaned)`);
    
    res.status(200).json({
      success: true,
      event: {
        _id: event._id,
        title: event.title,
        startDate: event.startDate,
        endDate: event.endDate
      },
      participants: participants || [],
      totalCount: participants ? participants.length : 0,
      orphanedCount: orphanedRecords.length,
      warnings: orphanedRecords.length > 0 ? [`Found ${orphanedRecords.length} participants with missing user data`] : []
    });
  } catch (error) {
    console.error('Error fetching event participants:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching participants',
      error: error.message
    });
  }
});

// Add a single participant (enhanced with email-only option)
export const addParticipant = asyncHandler(async (req, res) => {
  try {
    const { email, eventId, name, dateOfBirth, department, phone, institution, designation } = req.body;
    const coordinatorId = req.user._id;
    
    // Validate required fields - only email and eventId are required now
    if (!email || !eventId) {
      return res.status(400).json({
        success: false,
        message: "Email and event ID are required"
      });
    }
    
    // Verify coordinator owns this event or is HOD/admin
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found"
      });
    }
    
    if (req.user.role === 'coordinator' && event.createdBy.toString() !== coordinatorId.toString()) {
      return res.status(403).json({
        success: false,
        message: "You don't have permission to add participants to this event"
      });
    }
    
    // Extract username from email (part before @)
    const username = email.split('@')[0];
    
    // Check if user already exists in User model
    let user = await User.findOne({ email });
    
    if (!user) {
      // Create new user with email as password initially
      user = new User({
        name: name || username, // Use provided name or username from email
        email: email,
        password: email, // Password is email initially
        role: 'participant',
        department: department || '',
        phone: phone || '',
        institution: institution || '',
        designation: designation || 'Student'
      });
      
      await user.save();
    }
    
    // Check if already registered for this event in ParticipantEvent model
    const existingParticipantEvent = await ParticipantEvent.findOne({
      participantId: user._id,
      eventId: eventId
    });
    
    if (existingParticipantEvent) {
      return res.status(400).json({
        success: false,
        message: "Participant already registered for this event"
      });
    }
    
    // Create new ParticipantEvent record with approved status
    const participantEvent = new ParticipantEvent({
      participantId: user._id,
      eventId: eventId,
      registrationDate: new Date(),
      approved: true, // Auto-approve participants added by coordinator
      approvedBy: coordinatorId,
      approvedDate: new Date(),
      attended: false,
      feedbackGiven: false,
      certificateGenerated: false
    });
    
    await participantEvent.save();
    
    // Populate the response
    await participantEvent.populate('participantId', 'name email department role');
    await participantEvent.populate('eventId', 'title startDate endDate');
    await participantEvent.populate('approvedBy', 'name');
    
    res.status(201).json({
      success: true,
      message: "Participant added and approved successfully",
      participantEvent,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        department: user.department,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Error adding participant:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Add multiple participants via email list
export const addMultipleParticipants = asyncHandler(async (req, res) => {
  try {
    const { emails, eventId } = req.body;
    const coordinatorId = req.user._id;
    
    // Validate required fields
    if (!emails || !Array.isArray(emails) || emails.length === 0 || !eventId) {
      return res.status(400).json({
        success: false,
        message: "Emails array and event ID are required"
      });
    }
    
    // Verify coordinator owns this event or is HOD/admin
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found"
      });
    }
    
    if (req.user.role === 'coordinator' && event.createdBy.toString() !== coordinatorId.toString()) {
      return res.status(403).json({
        success: false,
        message: "You don't have permission to add participants to this event"
      });
    }
    
    const results = {
      added: 0,
      skipped: 0,
      errors: []
    };
    
    const addedParticipants = [];
    
    for (const email of emails) {
      try {
        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email.trim())) {
          results.errors.push(`Invalid email format: ${email}`);
          continue;
        }
        
        const cleanEmail = email.trim().toLowerCase();
        const username = cleanEmail.split('@')[0];
        
        // Check if user already exists
        let user = await User.findOne({ email: cleanEmail });
        
        if (!user) {
          // Create new user
          user = new User({
            name: username,
            email: cleanEmail,
            password: cleanEmail, // Password is email initially
            role: 'participant',
            department: '',
            phone: '',
            institution: '',
            designation: 'Student'
          });
          
          await user.save();
        }
        
        // Check if already registered for this event
        const existingParticipantEvent = await ParticipantEvent.findOne({
          participantId: user._id,
          eventId: eventId
        });
        
        if (existingParticipantEvent) {
          results.skipped++;
          continue;
        }
        
        // Create new ParticipantEvent record
        const participantEvent = new ParticipantEvent({
          participantId: user._id,
          eventId: eventId,
          registrationDate: new Date(),
          approved: true, // Auto-approve participants added by coordinator
          approvedBy: coordinatorId,
          approvedDate: new Date(),
          attended: false,
          feedbackGiven: false,
          certificateGenerated: false
        });
        
        await participantEvent.save();
        
        addedParticipants.push({
          userId: user._id,
          name: user.name,
          email: user.email
        });
        
        results.added++;
      } catch (error) {
        results.errors.push(`Error processing ${email}: ${error.message}`);
      }
    }
    
    res.status(200).json({
      success: true,
      message: `Processed ${emails.length} emails. Added: ${results.added}, Skipped: ${results.skipped}, Errors: ${results.errors.length}`,
      results,
      addedParticipants
    });
  } catch (error) {
    console.error('Error adding multiple participants:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Approve participant registration
export const approveParticipant = asyncHandler(async (req, res) => {
  try {
    const { participantId, eventId } = req.body;
    const coordinatorId = req.user._id;
    
    // Verify coordinator owns this event
    const event = await Event.findOne({ _id: eventId, createdBy: coordinatorId });
    if (!event) {
      return res.status(403).json({
        success: false,
        message: "You don't have permission to approve participants for this event"
      });
    }
    
    // Find and update ParticipantEvent
    const participantEvent = await ParticipantEvent.findOne({ 
      participantId, 
      eventId 
    });
    
    if (!participantEvent) {
      return res.status(404).json({
        success: false,
        message: "Participant not registered for this event"
      });
    }
    
    // Update approval status
    participantEvent.approved = true;
    participantEvent.approvedBy = coordinatorId;
    participantEvent.approvedDate = new Date();
    
    await participantEvent.save();
    
    res.status(200).json({
      success: true,
      message: "Participant approved successfully",
      participantEvent
    });
  } catch (error) {
    console.error('Error approving participant:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Bulk approve participants
export const bulkApproveParticipants = asyncHandler(async (req, res) => {
  try {
    const { participantIds, eventId } = req.body;
    const coordinatorId = req.user._id;
    
    console.log('Bulk approve request:', { participantIds, eventId, coordinatorId });
    
    // Verify coordinator owns this event
    const event = await Event.findOne({ _id: eventId, createdBy: coordinatorId });
    if (!event) {
      return res.status(403).json({
        success: false,
        message: "You don't have permission to approve participants for this event"
      });
    }
    
    // Update multiple ParticipantEvents
    const updateResult = await ParticipantEvent.updateMany(
      {
        participantId: { $in: participantIds },
        eventId: eventId
      },
      {
        $set: {
          approved: true,
          approvedBy: coordinatorId,
          approvedDate: new Date()
        }
      }
    );
    
    console.log('Bulk approve result:', updateResult);
    
    res.status(200).json({
      success: true,
      message: `${updateResult.modifiedCount} participants approved successfully`,
      modifiedCount: updateResult.modifiedCount
    });
  } catch (error) {
    console.error('Error in bulk approve:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Upload participants via CSV/Excel
export const uploadParticipants = asyncHandler(async (req, res) => {
  try {
    const { eventId } = req.body;
    const coordinatorId = req.user._id;
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded"
      });
    }
    
    // Verify coordinator owns this event
    const event = await Event.findOne({ _id: eventId, createdBy: coordinatorId });
    if (!event) {
      return res.status(403).json({
        success: false,
        message: "You don't have permission to add participants to this event"
      });
    }
    
    // Parse Excel file
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(req.file.buffer);
    const worksheet = workbook.getWorksheet(1);
    
    const participants = [];
    const errors = [];
    
    // Process each row (skip header) - Handle flexible column structure
    for (let rowNumber = 2; rowNumber <= worksheet.rowCount; rowNumber++) {
      const row = worksheet.getRow(rowNumber);
      
      // Get values from first two columns (required)
      const name = row.getCell(1).value?.toString()?.trim();
      const email = row.getCell(2).value?.toString()?.trim();
      
      // Get optional values from additional columns if they exist
      const department = row.getCell(3)?.value?.toString()?.trim() || '';
      const phone = row.getCell(4)?.value?.toString()?.trim() || '';
      const institution = row.getCell(5)?.value?.toString()?.trim() || '';
      const designation = row.getCell(6)?.value?.toString()?.trim() || '';
      
      // Skip empty rows
      if (!name && !email) {
        continue;
      }
      
      // Validate required fields - only name and email are required
      if (!name || !email) {
        errors.push(`Row ${rowNumber}: Name and email are required`);
        continue;
      }
      
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        errors.push(`Row ${rowNumber}: Invalid email format`);
        continue;
      }
      
      participants.push({
        name,
        email,
        department: department || '',
        phone: phone || '',
        institution: institution || 'Anna University',
        designation: designation || 'Student',
      });
    }
    
    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Validation errors found",
        errors
      });
    }
    
    // Process participants
    const results = {
      added: 0,
      updated: 0,
      skipped: 0,
      errors: []
    };
    
    for (const participantData of participants) {
      try {
        // Check if participant already exists
        let participant = await Participant.findOne({ email: participantData.email });
        
        if (participant) {
          // Check if already registered for this event
          const existingRegistration = participant.eventRegistrations.find(
            reg => reg.eventId.toString() === eventId
          );
          
          if (existingRegistration) {
            results.skipped++;
            continue;
          }
          
          // Add event registration to existing participant
          participant.eventRegistrations.push({
            eventId,
            registrationDate: new Date(),
            approved: false,
          });
          
          await participant.save();
          results.updated++;
        } else {
          // Create new participant
          const password = formatDOBAsPassword(participantData.dateOfBirth);
          
          participant = new Participant({
            ...participantData,
            eventRegistrations: [{
              eventId,
              registrationDate: new Date(),
              approved: false,
            }],
            createdBy: coordinatorId,
            password,
          });
          
          await participant.save();
          results.added++;
        }
      } catch (error) {
        results.errors.push(`Error processing ${participantData.email}: ${error.message}`);
      }
    }
    
    res.status(200).json({
      success: true,
      message: "Participants processed successfully",
      results
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Generate participants template
export const generateTemplate = asyncHandler(async (req, res) => {
  try {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Participants Template');
    
    // Add title and instructions
    worksheet.mergeCells('A1:G1');
    worksheet.getCell('A1').value = 'PARTICIPANT UPLOAD TEMPLATE - EVENTS MANAGEMENT SYSTEM';
    worksheet.getCell('A1').font = { bold: true, size: 14, color: { argb: 'FF2C3E50' } };
    worksheet.getCell('A1').alignment = { horizontal: 'center', vertical: 'middle' };
    worksheet.getCell('A1').fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE8F4FD' }
    };
    
    // Add instructions
    worksheet.mergeCells('A2:G2');
    worksheet.getCell('A2').value = 'Instructions: Fields marked with * are required. Please follow the format exactly as shown in the sample data.';
    worksheet.getCell('A2').font = { italic: true, size: 10, color: { argb: 'FF7F8C8D' } };
    worksheet.getCell('A2').alignment = { horizontal: 'center', wrapText: true };
    
    // Add empty row
    worksheet.addRow([]);
    
    // Add headers with required field indicators - Only Name and Email are required
    const headers = [
      { header: 'Full Name*', key: 'name', width: 30, required: true },
      { header: 'Email Address*', key: 'email', width: 35, required: true },
    ];
    
    // Set column headers
    headers.forEach((col, index) => {
      const cell = worksheet.getCell(4, index + 1);
      cell.value = col.header;
      cell.font = { 
        bold: true, 
        color: { argb: 'FFFFFFFF' },
        size: 11
      };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: col.required ? 'FFE74C3C' : 'FF3498DB' }
      };
      cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
      worksheet.getColumn(index + 1).width = col.width;
    });
    
    // Add sample data with multiple examples
    const sampleData = [
      {
        name: 'Dr. John Doe',
        email: 'john.doe@university.edu'
      },
      {
        name: 'Ms. Jane Smith',
        email: 'jane.smith@student.edu'
      },
      {
        name: 'Mr. Raj Kumar',
        email: 'raj.kumar@company.com'
      },
      {
        name: 'Prof. Sarah Wilson',
        email: 'sarah.wilson@college.edu'
      },
      {
        name: 'Alex Johnson',
        email: 'alex.johnson@gmail.com'
      }
    ];
    
    // Add sample data rows
    sampleData.forEach((data, rowIndex) => {
      const row = worksheet.addRow(data);
      row.eachCell((cell, colNumber) => {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
        
        // Alternate row colors
        if (rowIndex % 2 === 0) {
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFF8F9FA' }
          };
        }
      });
    });
    
    // Add validation notes
    const notesStartRow = worksheet.rowCount + 2;
    worksheet.mergeCells(`A${notesStartRow}:G${notesStartRow}`);
    worksheet.getCell(`A${notesStartRow}`).value = 'VALIDATION NOTES:';
    worksheet.getCell(`A${notesStartRow}`).font = { bold: true, size: 12, color: { argb: 'FF2C3E50' } };
    
    const validationNotes = [
      '• Name: Full name with salutation (Dr., Mr., Ms., etc.) - REQUIRED',
      '• Email: Must be a valid email format (example@domain.com) - REQUIRED',
      '• Extended format: You can add Department, Phone, Institution, Designation columns',
      '• Flexible processing: System handles any additional columns gracefully',
      '• Login credentials: Email address is used as both username and initial password',
      '• All participants are auto-approved when added by coordinators'
    ];
    
    validationNotes.forEach((note, index) => {
      const noteRow = notesStartRow + index + 1;
      worksheet.mergeCells(`A${noteRow}:G${noteRow}`);
      worksheet.getCell(`A${noteRow}`).value = note;
      worksheet.getCell(`A${noteRow}`).font = { size: 10, color: { argb: 'FF34495E' } };
    });
    
    // Add footer
    const footerRow = worksheet.rowCount + 2;
    worksheet.mergeCells(`A${footerRow}:G${footerRow}`);
    worksheet.getCell(`A${footerRow}`).value = `Template generated on ${new Date().toLocaleDateString()} | Events Management System`;
    worksheet.getCell(`A${footerRow}`).font = { italic: true, size: 9, color: { argb: 'FF95A5A6' } };
    worksheet.getCell(`A${footerRow}`).alignment = { horizontal: 'center' };
    
    // Set row heights
    worksheet.getRow(1).height = 25;
    worksheet.getRow(2).height = 20;
    worksheet.getRow(4).height = 30;
    
    // Freeze header rows
    worksheet.views = [
      { state: 'frozen', xSplit: 0, ySplit: 4 }
    ];
    
    // Set response headers
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      'attachment; filename=participants_template_enhanced.xlsx'
    );
    
    // Write to response
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Update participant details
export const updateParticipant = asyncHandler(async (req, res) => {
  try {
    const { participantId } = req.params;
    const { name, email, dateOfBirth, department, phone, institution, designation } = req.body;
    const coordinatorId = req.user._id;
    
    const participant = await Participant.findById(participantId);
    if (!participant) {
      return res.status(404).json({
        success: false,
        message: "Participant not found"
      });
    }
    
    // Check if coordinator has permission (created the participant or manages the event)
    const hasPermission = participant.createdBy.toString() === coordinatorId.toString() ||
      participant.eventRegistrations.some(async (reg) => {
        const event = await Event.findById(reg.eventId);
        return event && event.createdBy.toString() === coordinatorId.toString();
      });
    
    if (!hasPermission) {
      return res.status(403).json({
        success: false,
        message: "You don't have permission to update this participant"
      });
    }
    
    // Update fields
    if (name) participant.name = name;
    if (email) participant.email = email;
    if (dateOfBirth) {
      participant.dateOfBirth = dateOfBirth;
      participant.password = formatDOBAsPassword(dateOfBirth);
    }
    if (department) participant.department = department;
    if (phone) participant.phone = phone;
    if (institution) participant.institution = institution;
    if (designation) participant.designation = designation;
    
    await participant.save();
    
    // Populate the response
    await participant.populate('eventRegistrations.eventId', 'title startDate endDate');
    await participant.populate('eventRegistrations.approvedBy', 'name');
    await participant.populate('createdBy', 'name');
    
    res.status(200).json({
      success: true,
      message: "Participant updated successfully",
      participant
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Delete participant
export const deleteParticipant = asyncHandler(async (req, res) => {
  try {
    const { participantId } = req.params;
    const { eventId } = req.body;
    const coordinatorId = req.user._id;
    
    // Verify coordinator owns this event
    const event = await Event.findOne({ _id: eventId, createdBy: coordinatorId });
    if (!event) {
      return res.status(403).json({
        success: false,
        message: "You don't have permission to remove participants from this event"
      });
    }
    
    const participant = await Participant.findById(participantId);
    if (!participant) {
      return res.status(404).json({
        success: false,
        message: "Participant not found"
      });
    }
    
    // Remove the specific event registration
    participant.eventRegistrations = participant.eventRegistrations.filter(
      reg => reg.eventId.toString() !== eventId
    );
    
    // If no more event registrations, delete the participant entirely
    if (participant.eventRegistrations.length === 0) {
      await Participant.findByIdAndDelete(participantId);
    } else {
      await participant.save();
    }
    
    res.status(200).json({
      success: true,
      message: "Participant removed successfully"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Mark attendance for a participant
export const markAttendance = asyncHandler(async (req, res) => {
  try {
    const { participantId, eventId, attended } = req.body;
    const coordinatorId = req.user._id;
    
    // Verify coordinator owns this event
    const event = await Event.findOne({ _id: eventId, createdBy: coordinatorId });
    if (!event) {
      return res.status(403).json({
        success: false,
        message: "You don't have permission to mark attendance for this event"
      });
    }
    
    // Find and update ParticipantEvent
    const participantEvent = await ParticipantEvent.findOne({ 
      participantId, 
      eventId 
    });
    
    if (!participantEvent) {
      return res.status(404).json({
        success: false,
        message: "Participant not registered for this event"
      });
    }
    
    // Check if participant is approved
    if (!participantEvent.approved) {
      return res.status(400).json({
        success: false,
        message: "Cannot mark attendance for unapproved participant"
      });
    }
    
    // Update attendance
    participantEvent.attended = attended;
    participantEvent.attendanceMarkedBy = coordinatorId;
    participantEvent.attendanceMarkedDate = new Date();
    
    await participantEvent.save();
    
    res.status(200).json({
      success: true,
      message: `Attendance ${attended ? 'marked' : 'unmarked'} successfully`,
      participantEvent
    });
  } catch (error) {
    console.error('Error marking attendance:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Bulk mark attendance
export const bulkMarkAttendance = asyncHandler(async (req, res) => {
  try {
    const { participantIds, eventId, attended } = req.body;
    const coordinatorId = req.user._id;
    
    // Verify coordinator owns this event
    const event = await Event.findOne({ _id: eventId, createdBy: coordinatorId });
    if (!event) {
      return res.status(403).json({
        success: false,
        message: "You don't have permission to mark attendance for this event"
      });
    }
    
    // Update multiple ParticipantEvents (only approved ones)
    const updateResult = await ParticipantEvent.updateMany(
      {
        participantId: { $in: participantIds },
        eventId: eventId,
        approved: true
      },
      {
        $set: {
          attended: attended,
          attendanceMarkedBy: coordinatorId,
          attendanceMarkedDate: new Date()
        }
      }
    );
    
    res.status(200).json({
      success: true,
      message: `Attendance ${attended ? 'marked' : 'unmarked'} for ${updateResult.modifiedCount} participants`,
      modifiedCount: updateResult.modifiedCount
    });
  } catch (error) {
    console.error('Error in bulk mark attendance:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Reject participant registration
export const rejectParticipant = asyncHandler(async (req, res) => {
  try {
    const { participantId, eventId, rejectionReason } = req.body;
    const coordinatorId = req.user._id;
    
    // Verify coordinator owns this event
    const event = await Event.findOne({ _id: eventId, createdBy: coordinatorId });
    if (!event) {
      return res.status(403).json({
        success: false,
        message: "You don't have permission to reject participants for this event"
      });
    }
    
    // Find and update participant
    const participant = await Participant.findById(participantId);
    if (!participant) {
      return res.status(404).json({
        success: false,
        message: "Participant not found"
      });
    }
    
    // Find the specific event registration
    const registration = participant.eventRegistrations.find(
      reg => reg.eventId.toString() === eventId
    );
    
    if (!registration) {
      return res.status(404).json({
        success: false,
        message: "Participant not registered for this event"
      });
    }
    
    // Update rejection status
    registration.approved = false;
    registration.rejectionReason = rejectionReason || 'Registration rejected by coordinator';
    registration.approvedBy = coordinatorId;
    registration.approvedDate = new Date();
    
    await participant.save();
    
    // Populate the response
    await participant.populate('eventRegistrations.eventId', 'title startDate endDate');
    await participant.populate('eventRegistrations.approvedBy', 'name');
    
    res.status(200).json({
      success: true,
      message: "Participant registration rejected",
      participant
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get attendance statistics for an event
export const getAttendanceStats = asyncHandler(async (req, res) => {
  try {
    const { eventId } = req.params;
    const coordinatorId = req.user._id;
    
    // Verify coordinator owns this event
    const event = await Event.findOne({ _id: eventId, createdBy: coordinatorId });
    if (!event) {
      return res.status(403).json({
        success: false,
        message: "You don't have permission to view attendance for this event"
      });
    }
    
    // Get all participants for this event
    const participants = await Participant.find({
      'eventRegistrations.eventId': eventId
    });
    
    let totalRegistered = 0;
    let totalApproved = 0;
    let totalAttended = 0;
    let totalPending = 0;
    let totalRejected = 0;
    
    participants.forEach(participant => {
      const registration = participant.eventRegistrations.find(
        reg => reg.eventId.toString() === eventId
      );
      
      if (registration) {
        totalRegistered++;
        
        if (registration.approved === true) {
          totalApproved++;
          if (registration.attended) {
            totalAttended++;
          }
        } else if (registration.approved === false && registration.rejectionReason) {
          totalRejected++;
        } else {
          totalPending++;
        }
      }
    });
    
    const attendanceRate = totalApproved > 0 ? ((totalAttended / totalApproved) * 100).toFixed(2) : 0;
    const approvalRate = totalRegistered > 0 ? ((totalApproved / totalRegistered) * 100).toFixed(2) : 0;
    
    res.status(200).json({
      success: true,
      stats: {
        totalRegistered,
        totalApproved,
        totalAttended,
        totalPending,
        totalRejected,
        attendanceRate: parseFloat(attendanceRate),
        approvalRate: parseFloat(approvalRate)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Export participants for an event
export const exportParticipants = asyncHandler(async (req, res) => {
  try {
    const { eventId } = req.params;
    const coordinatorId = req.user._id;
    
    // Verify coordinator owns this event
    const event = await Event.findOne({ _id: eventId, createdBy: coordinatorId });
    if (!event) {
      return res.status(403).json({
        success: false,
        message: "You don't have permission to export participants for this event"
      });
    }
    
    // Find participant events for this event using the new ParticipantEvent model
    const participantEvents = await ParticipantEvent.find({ eventId })
      .populate('participantId', 'name email department role phone institution')
      .populate('approvedBy', 'name')
      .populate('attendanceMarkedBy', 'name')
      .sort({ createdAt: -1 });
    
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Participants');
    
    // Add title and event info
    worksheet.mergeCells('A1:N1');
    worksheet.getCell('A1').value = `${event.title} - Participants Export`;
    worksheet.getCell('A1').font = { bold: true, size: 14, color: { argb: 'FF2C3E50' } };
    worksheet.getCell('A1').alignment = { horizontal: 'center' };
    worksheet.getCell('A1').fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE8F4FD' }
    };
    
    // Add export info
    worksheet.mergeCells('A2:N2');
    worksheet.getCell('A2').value = `Exported on ${new Date().toLocaleDateString()} by ${req.user.name}`;
    worksheet.getCell('A2').font = { italic: true, size: 10 };
    worksheet.getCell('A2').alignment = { horizontal: 'center' };
    
    // Add empty row
    worksheet.addRow([]);
    
    // Add headers
    const headerRow = worksheet.addRow([
      'Name',
      'Email', 
      'Department',
      'Role/Designation',
      'Phone',
      'Institution',
      'Registration Date',
      'Status',
      'Approved By',
      'Approval Date',
      'Attended',
      'Attendance Marked By',
      'Attendance Date',
      'Rejection Reason'
    ]);
    
    // Style header row
    headerRow.eachCell((cell) => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF4472C4' }
      };
      cell.font = {
        color: { argb: 'FFFFFFFF' },
        bold: true
      };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
    });
    
    // Set column widths
    worksheet.columns = [
      { width: 25 }, // Name
      { width: 30 }, // Email
      { width: 20 }, // Department
      { width: 20 }, // Role/Designation
      { width: 15 }, // Phone
      { width: 25 }, // Institution
      { width: 18 }, // Registration Date
      { width: 12 }, // Status
      { width: 20 }, // Approved By
      { width: 18 }, // Approval Date
      { width: 10 }, // Attended
      { width: 25 }, // Attendance Marked By
      { width: 18 }, // Attendance Date
      { width: 30 }  // Rejection Reason
    ];
    
    // Add participant data
    participantEvents.forEach((participantEvent, index) => {
      const participant = participantEvent.participantId;
      
      // Handle case where participant reference might be broken
      if (!participant) {
        console.warn(`Skipping orphaned participant event: ${participantEvent._id}`);
        return;
      }
      
      let status = 'Pending';
      if (participantEvent.approved === true) {
        status = 'Approved';
      } else if (participantEvent.approved === false && participantEvent.rejectionReason) {
        status = 'Rejected';
      }
      
      const row = worksheet.addRow([
        participant.name || 'N/A',
        participant.email || 'N/A',
        participant.department || 'N/A',
        participant.role || 'N/A',
        participant.phone || 'N/A',
        participant.institution || 'N/A',
        participantEvent.registrationDate ? new Date(participantEvent.registrationDate).toLocaleDateString() : 'N/A',
        status,
        participantEvent.approvedBy?.name || '',
        participantEvent.approvedDate ? new Date(participantEvent.approvedDate).toLocaleDateString() : '',
        participantEvent.attended ? 'Yes' : 'No',
        participantEvent.attendanceMarkedBy?.name || '',
        participantEvent.attendanceMarkedDate ? new Date(participantEvent.attendanceMarkedDate).toLocaleDateString() : '',
        participantEvent.rejectionReason || ''
      ]);
      
      // Add borders to data rows
      row.eachCell((cell) => {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
        
        // Alternate row colors
        if (index % 2 === 0) {
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFF8F9FA' }
          };
        }
      });
      
      // Color code status
      const statusCell = row.getCell(8);
      if (status === 'Approved') {
        statusCell.font = { color: { argb: 'FF28A745' }, bold: true };
      } else if (status === 'Rejected') {
        statusCell.font = { color: { argb: 'FFDC3545' }, bold: true };
      } else {
        statusCell.font = { color: { argb: 'FFFFC107' }, bold: true };
      }
    });
    
    // Add summary at the bottom
    const summaryStartRow = worksheet.rowCount + 2;
    worksheet.mergeCells(`A${summaryStartRow}:N${summaryStartRow}`);
    worksheet.getCell(`A${summaryStartRow}`).value = 'SUMMARY STATISTICS';
    worksheet.getCell(`A${summaryStartRow}`).font = { bold: true, size: 12 };
    worksheet.getCell(`A${summaryStartRow}`).alignment = { horizontal: 'center' };
    
    const totalParticipants = participantEvents.length;
    const approvedCount = participantEvents.filter(pe => pe.approved === true).length;
    const rejectedCount = participantEvents.filter(pe => pe.approved === false && pe.rejectionReason).length;
    const pendingCount = participantEvents.filter(pe => pe.approved !== true && !pe.rejectionReason).length;
    const attendedCount = participantEvents.filter(pe => pe.attended === true).length;
    
    const summaryData = [
      ['Total Participants:', totalParticipants],
      ['Approved:', approvedCount],
      ['Rejected:', rejectedCount],
      ['Pending:', pendingCount],
      ['Attended:', attendedCount],
      ['Attendance Rate:', approvedCount > 0 ? `${Math.round((attendedCount / approvedCount) * 100)}%` : '0%']
    ];
    
    summaryData.forEach(([label, value]) => {
      const row = worksheet.addRow(['', '', label, value]);
      row.getCell(3).font = { bold: true };
      row.getCell(4).font = { bold: true, color: { argb: 'FF2C3E50' } };
    });
    
    // Set response headers
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=${event.title.replace(/[^a-zA-Z0-9]/g, '_')}_participants_${new Date().toISOString().split('T')[0]}.xlsx`
    );
    
    // Write to response
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error('Error exporting participants:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});
