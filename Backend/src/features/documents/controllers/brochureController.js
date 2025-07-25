import event from "../../../shared/models/eventModel.js";
import ConvenorCommittee from "../../../shared/models/convenorCommitteeModel.js";
import PDFDocument from "pdfkit";
import { isValidObjectId } from "mongoose";
import path from "path";
import fs from "fs";

// Generate and save brochure PDF to database
export const generateBrochurePDF = async (req, res) => {
  try {
    const programme = await event.findById(req.params.id);
    
    if (!programme) {
      return res.status(404).json({ message: "Programme not found" });
    }

    // Fetch organizing committee data
    let organizingCommittee = await ConvenorCommittee.find({ 
      isActive: true
    }).sort({ 
      roleCategory: 1, 
      role: 1,
      createdAt: -1 
    });
    
    // If no organizing committee members exist, create default ones
    if (organizingCommittee.length === 0) {

      const defaultMembers = [
        {
          name: "Vice-Chancellor",
          designation: "Vice-Chancellor",
          department: "Anna University",
          role: "Vice-Chancellor",
          roleCategory: "ADMINISTRATION",
          isDefault: true,
          isActive: true
        },
        {
          name: "Registrar",
          designation: "Registrar",
          department: "Anna University",
          role: "Registrar",
          roleCategory: "ADMINISTRATION",
          isDefault: true,
          isActive: true
        },
        {
          name: "Dean",
          designation: "Dean",
          department: "College of Engineering, Guindy",
          role: "Dean",
          roleCategory: "ACADEMIC",
          isDefault: true,
          isActive: true
        },
        {
          name: "Chairman",
          designation: "Chairman",
          department: "Convenor Committee",
          role: "Chairman",
          roleCategory: "ORGANIZING",
          isDefault: true,
          isActive: true
        }
      ];
      
      try {
        await ConvenorCommittee.insertMany(defaultMembers);

        // Fetch the newly created members
        organizingCommittee = await ConvenorCommittee.find({ isActive: true })
          .sort({ 
            roleCategory: 1, 
            role: 1,
            createdAt: -1 
          });

      } catch (error) {
        console.error("❌ Error creating default organizing committee members for brochure:", error);
      }
    }
    
    // Log the organizing committee members for debugging
    organizingCommittee.forEach(member => {
      console.log(`📋 Brochure Committee Member: ${member.role} - ${member.name} (${member.roleCategory})`);
    });

    // Create landscape PDF with optimized layout for maximum content per page
    const doc = new PDFDocument({ 
      layout: 'landscape',
      size: 'A4',
      margin: 10
    });
    
    const pageWidth = doc.page.width;   // 842 points in landscape
    const pageHeight = doc.page.height; // 595 points in landscape
    const margin = 10;
    const contentWidth = pageWidth - (2 * margin);
    const contentHeight = pageHeight - (2 * margin);
    
    // Three-column layout configuration
    const numColumns = 3;
    const columnGap = 15;
    const columnWidth = (contentWidth - (columnGap * (numColumns - 1))) / numColumns;
    
    let currentColumn = 0;
    let currentY = margin;
    let columnStartY = margin;
    const lineHeight = 5;
    const sectionSpacing = 6;
    const maxColumnHeight = contentHeight - 40; // Reserve space for footer

    // Collect PDF in buffer
    const buffers = [];
    doc.on("data", (chunk) => buffers.push(chunk));
    
    // Create a promise that resolves when PDF is complete
    const pdfPromise = new Promise((resolve, reject) => {
      doc.on("end", async () => {
        try {
          const pdfData = Buffer.concat(buffers);

          // Store PDF in MongoDB
          programme.brochurePDF = {
            data: pdfData,
            contentType: "application/pdf",
            fileName: `Brochure_${programme.title.replace(/\s+/g, "_")}.pdf`,
          };

          await programme.save();

          // Send PDF to browser
          res.setHeader("Content-Type", "application/pdf");
          res.setHeader(
            "Content-Disposition",
            `attachment; filename="${programme.brochurePDF.fileName}"`
          );
          res.send(pdfData);
          resolve();
        } catch (error) {
          console.error("Error in brochure PDF end handler:", error);
          reject(error);
        }
      });

      doc.on("error", (error) => {
        console.error("Brochure PDF generation error:", error);
        reject(error);
      });
    });

    // Helper function to get current column X position
    const getColumnX = (columnIndex = currentColumn) => {
      return margin + (columnIndex * (columnWidth + columnGap));
    };

    // Helper function to move to next column or page
    const moveToNextColumn = () => {
      currentColumn++;
      if (currentColumn >= numColumns) {
        // Move to next page
        doc.addPage();
        currentColumn = 0;
        currentY = margin;
        columnStartY = margin;
      } else {
        // Move to next column on same page
        currentY = columnStartY;
      }
    };

    // Helper function to check if content fits in current column
    const checkColumnSpace = (requiredHeight) => {
      if (currentY + requiredHeight > maxColumnHeight) {
        moveToNextColumn();
      }
    };

    // Enhanced text wrapping function for column layout
    const addWrappedText = (text, fontSize = 8, style = 'normal', isHeader = false) => {
      if (!text) return 0;
      
      doc.fontSize(fontSize);
      doc.font('Helvetica', style);
      
      const x = getColumnX();
      const maxWidth = columnWidth - 5; // Small padding
      
      const lines = doc.widthOfString(text) > maxWidth 
        ? text.split('\n').flatMap(line => {
            const words = line.split(' ');
            const wrappedLines = [];
            let currentLine = '';
            
            words.forEach(word => {
              const testLine = currentLine ? `${currentLine} ${word}` : word;
              if (doc.widthOfString(testLine) <= maxWidth) {
                currentLine = testLine;
              } else {
                if (currentLine) {
                  wrappedLines.push(currentLine);
                  currentLine = word;
                } else {
                  wrappedLines.push(word);
                }
              }
            });
            
            if (currentLine) {
              wrappedLines.push(currentLine);
            }
            
            return wrappedLines;
          })
        : [text];
      
      const textHeight = lines.length * lineHeight;
      
      // Check if content fits in current column
      checkColumnSpace(textHeight + (isHeader ? sectionSpacing : 2));
      
      // Add background for headers
      if (isHeader) {
        doc.rect(getColumnX(), currentY - 1, columnWidth, lineHeight + 2)
           .fillColor('#f0f0f0')
           .fill();
        doc.fillColor('black');
      }
      
      // Draw text
      lines.forEach((line, index) => {
        doc.text(line, getColumnX() + 2, currentY + (index * lineHeight));
      });
      
      currentY += textHeight + (isHeader ? sectionSpacing : 2);
      return textHeight;
    };

    // Helper function to add section with automatic column management
    const addSection = (title, content) => {
      // Add section header
      addWrappedText(title, 9, 'bold', true);
      
      // Add content
      if (Array.isArray(content)) {
        content.forEach(item => {
          if (typeof item === 'object' && item.header && item.text) {
            addWrappedText(`${item.header}: ${item.text}`, 8, 'normal');
          } else if (typeof item === 'string') {
            addWrappedText(item, 8, 'normal');
          }
        });
      } else if (typeof content === 'string') {
        addWrappedText(content, 8, 'normal');
      }
      
      currentY += sectionSpacing;
    };

    // Header with Anna University Logo and Title
    const addHeader = () => {
      // Anna University Header Background
      doc.rect(0, 0, pageWidth, 35).fillColor('#2962ff').fill();
      
      // Try to add Anna University logo
      try {
        const logoPath = path.join(process.cwd(), 'Backend', 'src', 'assets', 'logo', 'anna-university-logo.jpg');
        console.log(`🔍 Loading brochure logo from: ${logoPath}`);
        if (fs.existsSync(logoPath)) {
          // Add logo on the left side
          doc.image(logoPath, 15, 5, { width: 25, height: 25 });
          console.log(`✅ Brochure logo loaded successfully`);
        } else {
          console.error(`❌ Brochure logo file not found: ${logoPath}`);
        }
      } catch (error) {
        console.error('Error loading brochure logo:', error);
      }
      
      // Anna University Text (centered)
      doc.fillColor('white')
         .fontSize(16)
         .font('Helvetica-Bold')
         .text('ANNA UNIVERSITY', pageWidth / 2, 12, { align: 'center' });
      
      doc.fontSize(12)
         .font('Helvetica')
         .text('Chennai - 600 025', pageWidth / 2, 22, { align: 'center' });
      
      // Department text (right aligned)
      doc.fontSize(10)
         .text('DCSE & CCS', pageWidth - 80, 8);
      
      // Reset text color
      doc.fillColor('black');
      currentY = 45;
      
      // Event Title
      doc.fontSize(18)
         .font('Helvetica-Bold');
      const titleLines = programme.title.toUpperCase().split('\n');
      titleLines.forEach((line, index) => {
        doc.text(line, pageWidth / 2, currentY + (index * 8), { align: 'center' });
      });
      currentY += titleLines.length * 8 + sectionSpacing;
      
      // Event Type and Duration
      doc.fontSize(12)
         .font('Helvetica')
         .text(`${programme.type} | ${programme.duration}`, pageWidth / 2, currentY, { align: 'center' });
      currentY += lineHeight + sectionSpacing;
      
      // Dates
      const startDate = new Date(programme.startDate).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
      const endDate = new Date(programme.endDate).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
      
      doc.font('Helvetica-Bold')
         .text(`${startDate} - ${endDate}`, pageWidth / 2, currentY, { align: 'center' });
      currentY += lineHeight + sectionSpacing * 2;
      
      // Add a line separator
      doc.moveTo(margin, currentY)
         .lineTo(pageWidth - margin, currentY)
         .strokeColor('black')
         .stroke();
      currentY += sectionSpacing;
    };

    // Section header helper
    const addSectionHeader = (title) => {
      checkPageBreak(20);
      doc.rect(margin, currentY - 2, contentWidth, 10)
         .fillColor('#f0f0f0')
         .fill();
      
      doc.fontSize(12)
         .font('Helvetica-Bold')
         .fillColor('black')
         .text(title, margin + 3, currentY + 5);
      currentY += 12;
    };

    // Two-column layout helper
    const addTwoColumnSection = (leftContent, rightContent) => {
      const colWidth = (contentWidth - 10) / 2;
      const leftX = margin;
      const rightX = margin + colWidth + 10;
      const startY = currentY;
      
      // Left column
      currentY = startY;
      leftContent.forEach(item => {
        if (item.type === 'header') {
          doc.fontSize(10)
             .font('Helvetica-Bold')
             .text(item.text, leftX, currentY);
          currentY += lineHeight;
        } else {
          addWrappedText(item.text, leftX, currentY, colWidth, 9);
        }
      });
      
      const leftEndY = currentY;
      
      // Right column
      currentY = startY;
      rightContent.forEach(item => {
        if (item.type === 'header') {
          doc.fontSize(10)
             .font('Helvetica-Bold')
             .text(item.text, rightX, currentY);
          currentY += lineHeight;
        } else {
          addWrappedText(item.text, rightX, currentY, colWidth, 9);
        }
      });
      
      currentY = Math.max(leftEndY, currentY) + sectionSpacing;
    };

    // Start generating the brochure with landscape three-column layout
    addHeader();
    
    // Reset to column layout after header
    currentColumn = 0;
    currentY = 120; // Start below header
    columnStartY = currentY;

    // Event Overview Section
    addSection('EVENT OVERVIEW', [
      { header: 'OBJECTIVES', text: programme.objectives || 'To be announced' },
      { header: 'EXPECTED OUTCOMES', text: programme.outcomes || 'To be announced' }
    ]);

    // Event Information Section
    addSection('EVENT INFORMATION', [
      { header: 'VENUE', text: programme.venue },
      { header: 'MODE', text: programme.mode },
      { header: 'TARGET AUDIENCE', text: programme.targetAudience?.join(', ') || 'General Public' },
      { header: 'RESOURCE PERSONS', text: programme.resourcePersons?.join(', ') || 'To be announced' }
    ]);

    // Registration Information (if enabled)
    if (programme.registrationProcedure && programme.registrationProcedure.enabled) {
      const regContent = [];
      
      if (programme.registrationProcedure.instructions) {
        regContent.push(programme.registrationProcedure.instructions);
      }
      
      if (programme.registrationProcedure.deadline) {
        regContent.push({ 
          header: 'REGISTRATION DEADLINE', 
          text: new Date(programme.registrationProcedure.deadline).toLocaleDateString() 
        });
      }
      
      if (programme.registrationProcedure.participantLimit) {
        regContent.push({ 
          header: 'PARTICIPANT LIMIT', 
          text: programme.registrationProcedure.participantLimit 
        });
      }
      
      if (programme.registrationProcedure.selectionCriteria && 
          programme.registrationProcedure.selectionCriteria !== 'first come first served basis') {
        regContent.push({ 
          header: 'SELECTION CRITERIA', 
          text: programme.registrationProcedure.selectionCriteria 
        });
      }
      
      if (programme.registrationProcedure.confirmationDate) {
        regContent.push({ 
          header: 'CONFIRMATION DATE', 
          text: new Date(programme.registrationProcedure.confirmationDate).toLocaleDateString() 
        });
      }
      
      addSection('REGISTRATION INFORMATION', regContent);

      // Payment Details (if enabled)
      if (programme.registrationProcedure.paymentDetails && programme.registrationProcedure.paymentDetails.enabled) {
        addSection('PAYMENT DETAILS', [
          { header: 'ACCOUNT NAME', text: programme.registrationProcedure.paymentDetails.accountName },
          { header: 'ACCOUNT NUMBER', text: programme.registrationProcedure.paymentDetails.accountNumber },
          { header: 'IFSC CODE', text: programme.registrationProcedure.paymentDetails.ifscCode },
          { header: 'BANK', text: programme.registrationProcedure.paymentDetails.bankBranch }
        ]);
      }

      // Registration Form Fields (if enabled)
      if (programme.registrationProcedure.registrationForm && programme.registrationProcedure.registrationForm.enabled) {
        const formFields = [];
        if (programme.registrationProcedure.registrationForm.fields) {
          Object.entries(programme.registrationProcedure.registrationForm.fields).forEach(([fieldKey, fieldValue]) => {
            if (fieldKey === 'category' && fieldValue.enabled) {
              formFields.push('Category');
            } else if (typeof fieldValue === 'boolean' && fieldValue) {
              const fieldName = fieldKey.charAt(0).toUpperCase() + fieldKey.slice(1).replace(/([A-Z])/g, ' $1');
              formFields.push(fieldName);
            }
          });
        }
        
        if (formFields.length > 0) {
          addSection('REGISTRATION FORM FIELDS', formFields);
        }
        
        // Declaration
        const declarationText = `The information provided by me is true to the best of my knowledge. I agree to abide by the rules and regulations governing the ${programme.type}. If selected, I shall attend the course for the entire duration. I also undertake the responsibility to inform the coordinators in advance if in case I am unable to attend the course.`;
        addSection('DECLARATION', declarationText);
      }
    }

    // Organizing Committee section using column layout
    if (organizingCommittee.length > 0) {
      // Group by role category
      const groupedCommittee = organizingCommittee.reduce((acc, member) => {
        const category = member.roleCategory || 'COMMITTEE';
        if (!acc[category]) acc[category] = [];
        acc[category].push(member);
        return acc;
      }, {});

      // Define category display order and names
      const categoryOrder = {
        'PATRON': { name: 'PATRONS', order: 1 },
        'ADMINISTRATION': { name: 'ADMINISTRATION', order: 2 },
        'ACADEMIC': { name: 'ACADEMIC LEADERSHIP', order: 3 },
        'ORGANIZING': { name: 'ORGANIZING COMMITTEE', order: 4 },
        'COORDINATION': { name: 'COORDINATION COMMITTEE', order: 5 },
        'COMMITTEE': { name: 'COMMITTEE MEMBERS', order: 6 },
        'EXTERNAL': { name: 'EXTERNAL PARTICIPANTS', order: 7 }
      };

      // Sort categories by order and display each category
      const sortedCategories = Object.entries(groupedCommittee).sort(([catA], [catB]) => {
        const orderA = categoryOrder[catA]?.order || 999;
        const orderB = categoryOrder[catB]?.order || 999;
        return orderA - orderB;
      });

      sortedCategories.forEach(([category, members]) => {
        // Category header with proper name
        const categoryDisplayName = categoryOrder[category]?.name || category;
        
        // Sort members within category by role importance
        const roleOrder = [
          'Vice-Chancellor', 'Pro-Vice-Chancellor', 'Chief Patron', 'Patron', 'Co-Patron', 'Controller of Examinations', 'Finance Officer',
          'Dean', 'Associate Dean', 'Head of Department', 'Associate Head of Department',
          'Chairman', 'Vice-Chairman', 'Secretary', 'Joint Secretary', 'Treasurer', 'Convener', 'Co-Convener',
          'Coordinator', 'Co-Coordinator', 'Technical Coordinator', 'Program Coordinator', 'Registration Coordinator',
          'Member', 'Student Member', 'External Member'
        ];
        
        const sortedMembers = members.sort((a, b) => {
          const aIndex = roleOrder.indexOf(a.role);
          const bIndex = roleOrder.indexOf(b.role);
          
          if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
          if (aIndex !== -1) return -1;
          if (bIndex !== -1) return 1;
          return a.role.localeCompare(b.role);
        });
        
        // Create member list for this category
        const memberList = sortedMembers.map(member => {
          let memberText = `${member.role}: ${member.name}`;
          if (member.designation && member.designation !== member.role) {
            memberText += `, ${member.designation}`;
          }
          if (member.department) {
            memberText += `, ${member.department}`;
          }
          return memberText;
        });
        
        addSection(categoryDisplayName, memberList);
      });
    } else {
      addSection('ORGANIZING COMMITTEE', 'Organizing committee information will be updated soon.');
    }

    // Coordinators section
    if (programme.coordinators && programme.coordinators.length > 0) {
      const coordinatorList = programme.coordinators.map(coordinator => {
        return `Dr. ${coordinator.name}, ${coordinator.designation}${coordinator.department ? `, ${coordinator.department}` : ''}`;
      });
      addSection('PROGRAMME COORDINATORS', coordinatorList);
    }

    // Footer with contact information
    const addFooter = () => {
      const footerY = pageHeight - 25;
      doc.rect(0, footerY - 5, pageWidth, 30)
         .fillColor('#2962ff')
         .fill();
      
      // Try to add Anna University logo in footer
      try {
        const logoPath = path.join(process.cwd(), 'Backend', 'src', 'assets', 'logo', 'anna-university-logo.jpg');
        if (fs.existsSync(logoPath)) {
          // Add smaller logo in footer
          doc.image(logoPath, 15, footerY - 2, { width: 20, height: 20 });
        }
      } catch (error) {
        console.error('Error loading footer logo:', error);
      }
      
      doc.fillColor('white')
         .fontSize(8)
         .font('Helvetica')
         .text('For more information, visit: www.annauniv.edu', pageWidth / 2, footerY + 3, { align: 'center' });
      
      // Add contact information
      doc.fontSize(7)
         .text('Email: info@annauniv.edu | Phone: +91-44-2235-7120', pageWidth / 2, footerY + 12, { align: 'center' });
    };

    // Add footer to all pages
    const pageCount = doc.bufferedPageRange().count;
    for (let i = 0; i < pageCount; i++) {
      doc.switchToPage(i);
      addFooter();
    }

    // End the document to trigger the 'end' event
    doc.end();
    
    // Wait for the PDF to be processed
    await pdfPromise;
    
  } catch (error) {
    console.error("Brochure PDF generation error:", error);
    if (!res.headersSent) {
      res.status(500).json({
        message: "Error generating brochure PDF",
        error: error.message,
      });
    }
  }
};

// Download existing brochure PDF from database
export const downloadBrochurePDF = async (req, res) => {
  try {
    const { eventId } = req.params;
    
    // Validate eventId
    if (!eventId || !isValidObjectId(eventId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid event ID provided"
      });
    }
    
    // Retrieve event with PDF data
    const result = await event.findById(eventId).select('brochurePDF');
    
    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Event not found"
      });
    }

    if (!result.brochurePDF || !result.brochurePDF.data) {
      return res.status(404).json({
        success: false,
        message: "No brochure PDF found for this event"
      });
    }

    // Extract PDF data
    const { data: pdfBuffer, contentType, fileName } = result.brochurePDF;
    
    // Validate PDF data
    if (!pdfBuffer || pdfBuffer.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Brochure PDF data is empty or corrupted"
      });
    }
    
    // Set response headers for PDF
    res.setHeader("Content-Type", contentType || "application/pdf");
    res.setHeader("Content-Length", pdfBuffer.length);
    res.setHeader("Content-Disposition", `inline; filename="${fileName || 'brochure.pdf'}"`);
    res.setHeader("Cache-Control", "private, max-age=3600");
    
    // Send PDF buffer to frontend
    res.send(pdfBuffer);
    
  } catch (error) {
    console.error("❌ Error downloading brochure PDF:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
    });
  }
};

// Save frontend-generated brochure PDF to database
export const saveBrochurePDF = async (req, res) => {
  try {
    const eventId = req.params.id;
    
    if (!eventId || !isValidObjectId(eventId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid event ID provided"
      });
    }

    const programme = await event.findById(eventId);
    
    if (!programme) {
      return res.status(404).json({ 
        success: false,
        message: "Programme not found" 
      });
    }

    // Check if brochure PDF file is provided
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No brochure PDF file provided"
      });
    }

    // Save the PDF to the database
    programme.brochurePDF = {
      data: req.file.buffer,
      contentType: req.file.mimetype,
      fileName: req.file.originalname || `Brochure_${programme.title.replace(/\s+/g, "_")}.pdf`,
    };

    await programme.save();

    res.status(200).json({
      success: true,
      message: "Brochure PDF saved successfully",
      fileName: programme.brochurePDF.fileName
    });
    
  } catch (error) {
    console.error("Error saving brochure PDF:", error);
    res.status(500).json({
      success: false,
      message: "Error saving brochure PDF",
      error: error.message,
    });
  }
};
