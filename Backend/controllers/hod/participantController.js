import asyncHandler from "express-async-handler";
import Participant from "../../models/participantModel.js";
import Event from "../../models/eventModel.js";
import ParticipantEvent from "../../models/ParticipantEventModel.js";
import User from "../../models/userModel.js";

// Debug endpoint to check data structure
export const debugParticipantData = asyncHandler(async (req, res) => {
  try {
    const { id: eventId } = req.params;
    
    console.log('Debug: Checking data for event:', eventId);
    
    // Check ParticipantEvent collection
    const participantEvents = await ParticipantEvent.find({ eventId }).limit(5);
    console.log('ParticipantEvent documents:', participantEvents);
    
    // Check if we can populate participantId
    const populatedEvents = await ParticipantEvent.find({ eventId })
      .populate('participantId')
      .limit(5);
    console.log('Populated ParticipantEvent documents:', populatedEvents);
    
    res.status(200).json({
      success: true,
      debug: {
        totalRegistrations: participantEvents.length,
        sampleRegistrations: participantEvents,
        populatedSample: populatedEvents
      }
    });
  } catch (error) {
    console.error('Debug error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get approved participants for a specific event (HOD view)
export const getApprovedEventParticipants = asyncHandler(async (req, res) => {
  try {
    const { id: eventId } = req.params;
    
    console.log('HOD fetching participants for event:', eventId);
    
    // Verify event exists
    const event = await Event.findById(eventId);
    if (!event) {
      console.log('Event not found:', eventId);
      return res.status(404).json({
        success: false,
        message: "Event not found"
      });
    }
    
    console.log('Event found:', event.title);
    
    // First, let's check all registrations for this event (for debugging)
    const allRegistrations = await ParticipantEvent.find({ eventId });
    console.log('Total registrations for this event (all statuses):', allRegistrations.length);
    
    // Log each registration's status
    allRegistrations.forEach((registration, index) => {
      console.log(`Registration ${index + 1}: participantId: ${registration.participantId}, approved: ${registration.approved}`);
    });
    
    // Find only approved participant registrations for this specific event
    const approvedRegistrations = await ParticipantEvent.find({
      eventId: eventId,
      approved: true
    })
    .populate('participantId', 'name email dateOfBirth department phone institution designation role')
    .populate('approvedBy', 'name')
    .populate('attendanceMarkedBy', 'name')
    .sort({ createdAt: -1 });
    
    console.log('Found approved registrations:', approvedRegistrations.length);
    
    // Format the response to match the expected structure
    const participants = approvedRegistrations.map(registration => {
      const participant = registration.participantId;
      if (participant) {
        return {
          _id: participant._id,
          name: participant.name,
          email: participant.email,
          dateOfBirth: participant.dateOfBirth,
          department: participant.department,
          phone: participant.phone,
          institution: participant.institution,
          designation: participant.designation,
          eventRegistration: {
            _id: registration._id,
            eventId: registration.eventId,
            approved: registration.approved,
            approvedBy: registration.approvedBy,
            approvedDate: registration.approvedDate,
            attended: registration.attended,
            attendanceMarkedBy: registration.attendanceMarkedBy,
            attendanceMarkedDate: registration.attendanceMarkedDate,
            registrationDate: registration.registrationDate,
            rejectionReason: registration.rejectionReason
          }
        };
      }
      return null;
    }).filter(Boolean);
    
    console.log('Formatted participants:', participants.length);
    
    res.status(200).json({
      success: true,
      event: {
        _id: event._id,
        title: event.title,
        startDate: event.startDate,
        endDate: event.endDate,
        status: event.status
      },
      participants: participants,
      totalCount: participants.length
    });
  } catch (error) {
    console.error('Error fetching approved event participants:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get statistics for approved participants in an event
export const getApprovedParticipantStats = asyncHandler(async (req, res) => {
  try {
    const { id: eventId } = req.params;
    
    // Verify event exists
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found"
      });
    }
    
    // Get all registrations for this event
    const allRegistrations = await ParticipantEvent.find({ eventId })
      .populate('participantId', 'department designation');
    
    let totalRegistered = allRegistrations.length;
    let totalApproved = 0;
    let totalAttended = 0;
    let totalPending = 0;
    let totalRejected = 0;
    
    // Count by department for approved participants
    const departmentStats = {};
    const designationStats = {};
    
    allRegistrations.forEach(registration => {
      if (registration.approved === true) {
        totalApproved++;
        
        if (registration.participantId) {
          // Count by department
          const dept = registration.participantId.department || 'Not Specified';
          departmentStats[dept] = (departmentStats[dept] || 0) + 1;
          
          // Count by designation
          const designation = registration.participantId.designation || 'Not Specified';
          designationStats[designation] = (designationStats[designation] || 0) + 1;
        }
        
        if (registration.attended) {
          totalAttended++;
        }
      } else if (registration.approved === false && registration.rejectionReason) {
        totalRejected++;
      } else {
        totalPending++;
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
        approvalRate: parseFloat(approvalRate),
        departmentBreakdown: departmentStats,
        designationBreakdown: designationStats
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Export approved participants for an event (HOD view)
export const exportApprovedParticipants = asyncHandler(async (req, res) => {
  try {
    const { id: eventId } = req.params;
    
    // Verify event exists
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found"
      });
    }
    
    // Find only approved participant events for this event using ParticipantEvent model
    const approvedParticipantEvents = await ParticipantEvent.find({
      eventId: eventId,
      approved: true
    })
    .populate('participantId', 'name email department role phone institution')
    .populate('approvedBy', 'name')
    .populate('attendanceMarkedBy', 'name')
    .sort({ createdAt: -1 });
    
    const ExcelJS = (await import('exceljs')).default;
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Approved Participants');
    
    // Add title and event info
    worksheet.mergeCells('A1:L1');
    worksheet.getCell('A1').value = `${event.title} - Approved Participants Export (HOD View)`;
    worksheet.getCell('A1').font = { bold: true, size: 14, color: { argb: 'FF2C3E50' } };
    worksheet.getCell('A1').alignment = { horizontal: 'center' };
    worksheet.getCell('A1').fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE8F4FD' }
    };
    
    // Add export info
    worksheet.mergeCells('A2:L2');
    worksheet.getCell('A2').value = `Exported on ${new Date().toLocaleDateString()} | Only Approved Participants`;
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
      'Approved By',
      'Approval Date',
      'Attended',
      'Attendance Marked By',
      'Attendance Date'
    ]);
    
    // Style header row
    headerRow.eachCell((cell) => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF28A745' } // Green for approved participants
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
      { width: 20 }, // Approved By
      { width: 18 }, // Approval Date
      { width: 10 }, // Attended
      { width: 25 }, // Attendance Marked By
      { width: 18 }  // Attendance Date
    ];
    
    // Add participant data
    approvedParticipantEvents.forEach((participantEvent, index) => {
      const participant = participantEvent.participantId;
      
      // Handle case where participant reference might be broken
      if (!participant) {
        console.warn(`Skipping orphaned approved participant event: ${participantEvent._id}`);
        return;
      }
      
      const row = worksheet.addRow([
        participant.name || 'N/A',
        participant.email || 'N/A',
        participant.department || 'N/A',
        participant.role || 'N/A',
        participant.phone || 'N/A',
        participant.institution || 'N/A',
        participantEvent.registrationDate ? new Date(participantEvent.registrationDate).toLocaleDateString() : 'N/A',
        participantEvent.approvedBy?.name || '',
        participantEvent.approvedDate ? new Date(participantEvent.approvedDate).toLocaleDateString() : '',
        participantEvent.attended ? 'Yes' : 'No',
        participantEvent.attendanceMarkedBy?.name || '',
        participantEvent.attendanceMarkedDate ? new Date(participantEvent.attendanceMarkedDate).toLocaleDateString() : ''
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
      
      // Color code attendance
      const attendedCell = row.getCell(10);
      if (participantEvent.attended) {
        attendedCell.font = { color: { argb: 'FF28A745' }, bold: true };
      } else {
        attendedCell.font = { color: { argb: 'FFDC3545' }, bold: true };
      }
    });
    
    // Add summary at the bottom
    const summaryStartRow = worksheet.rowCount + 2;
    worksheet.mergeCells(`A${summaryStartRow}:L${summaryStartRow}`);
    worksheet.getCell(`A${summaryStartRow}`).value = 'SUMMARY STATISTICS';
    worksheet.getCell(`A${summaryStartRow}`).font = { bold: true, size: 12 };
    worksheet.getCell(`A${summaryStartRow}`).alignment = { horizontal: 'center' };
    
    const totalApproved = approvedParticipantEvents.length;
    const attendedCount = approvedParticipantEvents.filter(pe => pe.attended === true).length;
    const attendanceRate = totalApproved > 0 ? Math.round((attendedCount / totalApproved) * 100) : 0;
    
    // Get department breakdown
    const departmentStats = {};
    approvedParticipantEvents.forEach(pe => {
      if (pe.participantId) {
        const dept = pe.participantId.department || 'Not Specified';
        departmentStats[dept] = (departmentStats[dept] || 0) + 1;
      }
    });
    
    const summaryData = [
      ['Total Approved Participants:', totalApproved],
      ['Attended:', attendedCount],
      ['Attendance Rate:', `${attendanceRate}%`],
      ['', ''], // Empty row
      ['Department Breakdown:', '']
    ];
    
    // Add department breakdown
    Object.entries(departmentStats).forEach(([dept, count]) => {
      summaryData.push([`${dept}:`, count]);
    });
    
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
      `attachment; filename=${event.title.replace(/[^a-zA-Z0-9]/g, '_')}_approved_participants_${new Date().toISOString().split('T')[0]}.xlsx`
    );
    
    // Write to response
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error('Error exporting approved participants:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});