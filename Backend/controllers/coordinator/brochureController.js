import event from "../../models/eventModel.js";
import ConvenorCommittee from "../../models/convenorCommitteeModel.js";
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

    const doc = new PDFDocument({ margin: 15 });
    const pageWidth = doc.page.width;
    const pageHeight = doc.page.height;
    const margin = 15;
    const contentWidth = pageWidth - (2 * margin);
    
    let currentY = margin;
    const lineHeight = 6;
    const sectionSpacing = 8;

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

    // Helper function to add a new page if needed
    const checkPageBreak = (requiredHeight) => {
      if (currentY + requiredHeight > pageHeight - margin) {
        doc.addPage();
        currentY = margin;
      }
    };

    // Helper function to add text with proper wrapping
    const addWrappedText = (text, x, y, maxWidth, fontSize = 10, style = 'normal') => {
      doc.fontSize(fontSize);
      doc.font('Helvetica', style);
      
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
      
      checkPageBreak(textHeight + 5);
      
      lines.forEach((line, index) => {
        doc.text(line, x, y + (index * lineHeight));
      });
      
      currentY = y + textHeight;
      return textHeight;
    };

    // Header with Anna University Logo and Title
    const addHeader = () => {
      // Anna University Header Background
      doc.rect(0, 0, pageWidth, 35).fillColor('#2962ff').fill();
      
      // Try to add Anna University logo
      try {
        const logoPath = path.join(process.cwd(), 'Frontend', 'public', 'anna-university-logo.jpg');
        if (fs.existsSync(logoPath)) {
          // Add logo on the left side
          doc.image(logoPath, 15, 5, { width: 25, height: 25 });
        }
      } catch (error) {

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

    // Start generating the brochure
    addHeader();

    // Event Details Section
    addSectionHeader('EVENT OVERVIEW');
    
    // Objectives and Outcomes in two columns
    const leftCol = [
      { type: 'header', text: 'OBJECTIVES:' },
      { type: 'content', text: programme.objectives || 'To be announced' }
    ];
    
    const rightCol = [
      { type: 'header', text: 'EXPECTED OUTCOMES:' },
      { type: 'content', text: programme.outcomes || 'To be announced' }
    ];
    
    addTwoColumnSection(leftCol, rightCol);

    // Event Information
    addSectionHeader('EVENT INFORMATION');
    
    const eventInfoLeft = [
      { type: 'header', text: 'VENUE:' },
      { type: 'content', text: programme.venue },
      { type: 'header', text: 'MODE:' },
      { type: 'content', text: programme.mode }
    ];
    
    const eventInfoRight = [
      { type: 'header', text: 'TARGET AUDIENCE:' },
      { type: 'content', text: programme.targetAudience?.join(', ') || 'General Public' },
      { type: 'header', text: 'RESOURCE PERSONS:' },
      { type: 'content', text: programme.resourcePersons?.join(', ') || 'To be announced' }
    ];
    
    addTwoColumnSection(eventInfoLeft, eventInfoRight);

    // Registration Procedure (if enabled)
    if (programme.registrationProcedure && programme.registrationProcedure.enabled) {
      addSectionHeader('REGISTRATION INFORMATION');
      
      if (programme.registrationProcedure.instructions) {
        addWrappedText(programme.registrationProcedure.instructions, margin, currentY, contentWidth, 9);
        currentY += sectionSpacing;
      }
      
      const regInfoLeft = [];
      const regInfoRight = [];
      
      if (programme.registrationProcedure.deadline) {
        regInfoLeft.push(
          { type: 'header', text: 'REGISTRATION DEADLINE:' },
          { type: 'content', text: new Date(programme.registrationProcedure.deadline).toLocaleDateString() }
        );
      }
      
      if (programme.registrationProcedure.participantLimit) {
        regInfoLeft.push(
          { type: 'header', text: 'PARTICIPANT LIMIT:' },
          { type: 'content', text: programme.registrationProcedure.participantLimit }
        );
      }
      
      if (programme.registrationProcedure.selectionCriteria && 
          programme.registrationProcedure.selectionCriteria !== 'first come first served basis') {
        regInfoRight.push(
          { type: 'header', text: 'SELECTION CRITERIA:' },
          { type: 'content', text: programme.registrationProcedure.selectionCriteria }
        );
      }
      
      if (programme.registrationProcedure.confirmationDate) {
        regInfoRight.push(
          { type: 'header', text: 'CONFIRMATION DATE:' },
          { type: 'content', text: new Date(programme.registrationProcedure.confirmationDate).toLocaleDateString() }
        );
      }
      
      if (regInfoLeft.length > 0 || regInfoRight.length > 0) {
        addTwoColumnSection(regInfoLeft, regInfoRight);
      }

      // Payment Details (if enabled)
      if (programme.registrationProcedure.paymentDetails && programme.registrationProcedure.paymentDetails.enabled) {
        addSectionHeader('PAYMENT DETAILS');
        
        const paymentLeft = [
          { type: 'header', text: 'ACCOUNT NAME:' },
          { type: 'content', text: programme.registrationProcedure.paymentDetails.accountName },
          { type: 'header', text: 'ACCOUNT NUMBER:' },
          { type: 'content', text: programme.registrationProcedure.paymentDetails.accountNumber }
        ];
        
        const paymentRight = [
          { type: 'header', text: 'IFSC CODE:' },
          { type: 'content', text: programme.registrationProcedure.paymentDetails.ifscCode },
          { type: 'header', text: 'BANK:' },
          { type: 'content', text: programme.registrationProcedure.paymentDetails.bankBranch }
        ];
        
        addTwoColumnSection(paymentLeft, paymentRight);
      }

      // Registration Form (if enabled)
      if (programme.registrationProcedure.registrationForm && programme.registrationProcedure.registrationForm.enabled) {
        // Check if we need a new page for the registration form
        checkPageBreak(150);
        
        addSectionHeader('REGISTRATION FORM');
        
        // Form fields
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
          // Create form layout
          const formStartY = currentY;
          const fieldHeight = 12;
          const fieldsPerColumn = 6;
          const colWidth = contentWidth / 2 - 5;
          
          formFields.forEach((field, index) => {
            const col = Math.floor(index / fieldsPerColumn);
            const row = index % fieldsPerColumn;
            const x = margin + (col * (colWidth + 10));
            const y = formStartY + (row * fieldHeight);
            
            // Field label
            doc.fontSize(9)
               .font('Helvetica')
               .text(`${field}:`, x, y);
            
            // Field line
            doc.moveTo(x + 30, y + 1)
               .lineTo(x + colWidth, y + 1)
               .stroke();
          });
          
          currentY = formStartY + Math.ceil(formFields.length / 2) * fieldHeight + sectionSpacing;
        }
        
        // Declaration
        checkPageBreak(60);
        
        doc.fontSize(10)
           .font('Helvetica-Bold')
           .text('DECLARATION', margin, currentY);
        currentY += lineHeight + 2;
        
        const declarationText = `The information provided by me is true to the best of my knowledge. I agree to abide by the rules and regulations governing the ${programme.type}. If selected, I shall attend the course for the entire duration. I also undertake the responsibility to inform the coordinators in advance if in case I am unable to attend the course.`;
        
        addWrappedText(declarationText, margin, currentY, contentWidth, 9);
        currentY += sectionSpacing;
        
        // Signature section
        const sigY = currentY + 10;
        doc.fontSize(9)
           .font('Helvetica');
        
        // Date and Place
        doc.text('Date:', margin, sigY);
        doc.moveTo(margin + 20, sigY + 1)
           .lineTo(margin + 80, sigY + 1)
           .stroke();
        
        doc.text('Place:', margin + 100, sigY);
        doc.moveTo(margin + 125, sigY + 1)
           .lineTo(margin + 180, sigY + 1)
           .stroke();
        
        // Signature
        doc.text('Signature of the Applicant:', margin, sigY + 20);
        doc.moveTo(margin + 60, sigY + 21)
           .lineTo(margin + 150, sigY + 21)
           .stroke();
        
        currentY = sigY + 30;
      }
    }

    // Organizing Committee section
    if (organizingCommittee.length > 0) {
      addSectionHeader('ORGANIZING COMMITTEE');
      
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
        doc.fontSize(10)
           .font('Helvetica-Bold')
           .text(`${categoryDisplayName}:`, margin, currentY);
        currentY += lineHeight;
        
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
        
        // Members in this category
        sortedMembers.forEach((member) => {
          let memberText = `${member.role}: ${member.name}`;
          if (member.designation && member.designation !== member.role) {
            memberText += `, ${member.designation}`;
          }
          if (member.department) {
            memberText += `, ${member.department}`;
          }

          addWrappedText(memberText, margin + 10, currentY, contentWidth - 10, 9);
          currentY += 2; // Small spacing between members
        });
        currentY += sectionSpacing;
      });
    } else {

      addSectionHeader('ORGANIZING COMMITTEE');
      addWrappedText('Organizing committee information will be updated soon.', margin, currentY, contentWidth, 9);
      currentY += sectionSpacing;
    }

    // Coordinators section
    if (programme.coordinators && programme.coordinators.length > 0) {
      addSectionHeader('PROGRAMME COORDINATORS');
      
      programme.coordinators.forEach(coordinator => {
        const coordText = `Dr. ${coordinator.name}\n${coordinator.designation}${coordinator.department ? `\n${coordinator.department}` : ''}`;
        addWrappedText(coordText, margin, currentY, contentWidth, 9);
        currentY += sectionSpacing;
      });
    }

    // Footer with contact information
    const addFooter = () => {
      const footerY = pageHeight - 25;
      doc.rect(0, footerY - 5, pageWidth, 30)
         .fillColor('#2962ff')
         .fill();
      
      // Try to add Anna University logo in footer
      try {
        const logoPath = path.join(process.cwd(), 'Frontend', 'public', 'anna-university-logo.jpg');
        if (fs.existsSync(logoPath)) {
          // Add smaller logo in footer
          doc.image(logoPath, 15, footerY - 2, { width: 20, height: 20 });
        }
      } catch (error) {

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
