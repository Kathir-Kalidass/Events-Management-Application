import asyncHandler from "express-async-handler";
import Participant from "../../models/participantModel.js";
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
    
    // Find participants for this specific event
    const participants = await Participant.find({
      'eventRegistrations.eventId': eventId
    })
    .populate('eventRegistrations.eventId', 'title startDate endDate')
    .populate('eventRegistrations.approvedBy', 'name')
    .populate('createdBy', 'name')
    .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      event: {
        _id: event._id,
        title: event.title,
        startDate: event.startDate,
        endDate: event.endDate
      },
      participants: participants || [],
      totalCount: participants ? participants.length : 0
    });
  } catch (error) {
    console.error('Error fetching event participants:', error);
    res.status(200).json({
      success: true,
      event: null,
      participants: [],
      totalCount: 0,
      message: 'No participants found or error occurred'
    });
  }
});

// Add a single participant
export const addParticipant = asyncHandler(async (req, res) => {
  try {
    const { name, email, dateOfBirth, department, phone, institution, designation, eventId } = req.body;
    const coordinatorId = req.user._id;
    
    // Validate required fields
    if (!name || !email || !dateOfBirth || !eventId) {
      return res.status(400).json({
        success: false,
        message: "Name, email, date of birth, and event ID are required"
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
    
    // Check if participant already exists
    let participant = await Participant.findOne({ email });
    
    if (participant) {
      // Check if already registered for this event
      const existingRegistration = participant.eventRegistrations.find(
        reg => reg.eventId.toString() === eventId
      );
      
      if (existingRegistration) {
        return res.status(400).json({
          success: false,
          message: "Participant already registered for this event"
        });
      }
      
      // Add event registration to existing participant
      participant.eventRegistrations.push({
        eventId,
        registrationDate: new Date(),
        approved: false,
      });
      
      await participant.save();
    } else {
      // Create new participant
      const password = formatDOBAsPassword(dateOfBirth);
      
      participant = new Participant({
        name,
        email,
        dateOfBirth,
        department,
        phone,
        institution,
        designation: designation || 'UG Student',
        eventRegistrations: [{
          eventId,
          registrationDate: new Date(),
          approved: false,
        }],
        createdBy: coordinatorId,
        password,
      });
      
      await participant.save();
    }
    
    // Populate the response
    await participant.populate('eventRegistrations.eventId', 'title startDate endDate');
    await participant.populate('createdBy', 'name');
    
    res.status(201).json({
      success: true,
      message: "Participant added successfully",
      participant
    });
  } catch (error) {
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
    
    // Update approval status
    registration.approved = true;
    registration.approvedBy = coordinatorId;
    registration.approvedDate = new Date();
    
    await participant.save();
    
    // Populate the response
    await participant.populate('eventRegistrations.eventId', 'title startDate endDate');
    await participant.populate('eventRegistrations.approvedBy', 'name');
    
    res.status(200).json({
      success: true,
      message: "Participant approved successfully",
      participant
    });
  } catch (error) {
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
    
    // Verify coordinator owns this event
    const event = await Event.findOne({ _id: eventId, createdBy: coordinatorId });
    if (!event) {
      return res.status(403).json({
        success: false,
        message: "You don't have permission to approve participants for this event"
      });
    }
    
    // Update multiple participants
    const updateResult = await Participant.updateMany(
      {
        _id: { $in: participantIds },
        'eventRegistrations.eventId': eventId
      },
      {
        $set: {
          'eventRegistrations.$.approved': true,
          'eventRegistrations.$.approvedBy': coordinatorId,
          'eventRegistrations.$.approvedDate': new Date()
        }
      }
    );
    
    res.status(200).json({
      success: true,
      message: `${updateResult.modifiedCount} participants approved successfully`,
      modifiedCount: updateResult.modifiedCount
    });
  } catch (error) {
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
    
    // Process each row (skip header)
    for (let rowNumber = 2; rowNumber <= worksheet.rowCount; rowNumber++) {
      const row = worksheet.getRow(rowNumber);
      
      const name = row.getCell(1).value?.toString()?.trim();
      const email = row.getCell(2).value?.toString()?.trim();
      const dobValue = row.getCell(3).value;
      const department = row.getCell(4).value?.toString()?.trim();
      const phone = row.getCell(5).value?.toString()?.trim();
      const institution = row.getCell(6).value?.toString()?.trim();
      const designation = row.getCell(7).value?.toString()?.trim();
      
      // Validate required fields
      if (!name || !email || !dobValue) {
        errors.push(`Row ${rowNumber}: Name, email, and date of birth are required`);
        continue;
      }
      
      // Parse date of birth
      let dateOfBirth;
      if (dobValue instanceof Date) {
        dateOfBirth = dobValue;
      } else if (typeof dobValue === 'string') {
        dateOfBirth = new Date(dobValue);
        if (isNaN(dateOfBirth.getTime())) {
          errors.push(`Row ${rowNumber}: Invalid date format for date of birth`);
          continue;
        }
      } else {
        errors.push(`Row ${rowNumber}: Invalid date format for date of birth`);
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
        dateOfBirth,
        department: department || '',
        phone: phone || '',
        institution: institution || '',
        designation: designation || 'UG Student',
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
    const worksheet = workbook.addWorksheet('Participants');
    
    // Add headers
    worksheet.columns = [
      { header: 'Name*', key: 'name', width: 20 },
      { header: 'Email*', key: 'email', width: 25 },
      { header: 'Date of Birth* (DD/MM/YYYY)', key: 'dob', width: 25 },
      { header: 'Department', key: 'department', width: 20 },
      { header: 'Phone', key: 'phone', width: 15 },
      { header: 'Institution', key: 'institution', width: 25 },
      { header: 'Designation', key: 'designation', width: 20 },
    ];
    
    // Add sample data
    worksheet.addRow({
      name: 'John Doe',
      email: 'john.doe@example.com',
      dob: '15/01/1995',
      department: 'Computer Science',
      phone: '9876543210',
      institution: 'Anna University',
      designation: 'UG Student'
    });
    
    // Style the header row
    worksheet.getRow(1).eachCell((cell) => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF4472C4' }
      };
      cell.font = {
        color: { argb: 'FFFFFFFF' },
        bold: true
      };
    });
    
    // Set response headers
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      'attachment; filename=participants_template.xlsx'
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
    
    // Find participants for this event
    const participants = await Participant.find({
      'eventRegistrations.eventId': eventId
    }).populate('eventRegistrations.eventId', 'title');
    
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Participants');
    
    // Add headers
    worksheet.columns = [
      { header: 'Name', key: 'name', width: 20 },
      { header: 'Email', key: 'email', width: 25 },
      { header: 'Date of Birth', key: 'dob', width: 15 },
      { header: 'Department', key: 'department', width: 20 },
      { header: 'Phone', key: 'phone', width: 15 },
      { header: 'Institution', key: 'institution', width: 25 },
      { header: 'Designation', key: 'designation', width: 20 },
      { header: 'Registration Date', key: 'regDate', width: 20 },
      { header: 'Approved', key: 'approved', width: 10 },
      { header: 'Attended', key: 'attended', width: 10 },
    ];
    
    // Add participant data
    participants.forEach(participant => {
      const registration = participant.eventRegistrations.find(
        reg => reg.eventId._id.toString() === eventId
      );
      
      worksheet.addRow({
        name: participant.name,
        email: participant.email,
        dob: participant.dateOfBirth.toLocaleDateString(),
        department: participant.department,
        phone: participant.phone,
        institution: participant.institution,
        designation: participant.designation,
        regDate: registration.registrationDate.toLocaleDateString(),
        approved: registration.approved ? 'Yes' : 'No',
        attended: registration.attended ? 'Yes' : 'No',
      });
    });
    
    // Style the header row
    worksheet.getRow(1).eachCell((cell) => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF4472C4' }
      };
      cell.font = {
        color: { argb: 'FFFFFFFF' },
        bold: true
      };
    });
    
    // Set response headers
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=${event.title}_participants.xlsx`
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
