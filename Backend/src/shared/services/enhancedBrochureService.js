import PDFDocument from 'pdfkit';
import Event from '../models/eventModel.js';
import path from 'path';
import fs from 'fs';

export const generateEnhancedBrochure = async (eventId) => {
  try {
    const event = await Event.findById(eventId);
    
    if (!event) {
      throw new Error('Event not found');
    }

    const doc = new PDFDocument({ 
      margin: 15,
      size: 'A4',
      layout: 'portrait'
    });
    
    const pageWidth = doc.page.width;
    const pageHeight = doc.page.height;
    const margin = 15;
    const contentWidth = pageWidth - (2 * margin);
    
    let currentY = margin;
    const lineHeight = 6;
    const sectionSpacing = 8;

    // Collect PDF in buffer
    const buffers = [];
    doc.on('data', (chunk) => buffers.push(chunk));
    
    return new Promise((resolve, reject) => {
      doc.on('end', async () => {
        try {
          const pdfData = Buffer.concat(buffers);
          
          // Store PDF in MongoDB
          event.brochurePDF = {
            data: pdfData,
            contentType: 'application/pdf',
            fileName: `Enhanced_Brochure_${event.title.replace(/\s+/g, '_')}.pdf`,
          };

          await event.save();
          resolve(pdfData);
        } catch (error) {
          reject(error);
        }
      });

      doc.on('error', (error) => {
        reject(error);
      });

      // Helper functions
      const checkPageBreak = (requiredHeight) => {
        if (currentY + requiredHeight > pageHeight - margin) {
          doc.addPage();
          currentY = margin;
        }
      };

      const addWrappedText = (text, x, y, maxWidth, fontSize = 10, style = 'normal') => {
        doc.fontSize(fontSize);
        doc.font(`Helvetica${style === 'bold' ? '-Bold' : style === 'italic' ? '-Oblique' : ''}`);
        
        const lines = text.split('\n').flatMap(line => {
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
        });
        
        const textHeight = lines.length * lineHeight;
        checkPageBreak(textHeight + 5);
        
        lines.forEach((line, index) => {
          doc.text(line, x, y + (index * lineHeight));
        });
        
        currentY = y + textHeight;
        return textHeight;
      };

      // Header with Anna University branding
      const addHeader = () => {
        // Blue header background
        doc.rect(0, 0, pageWidth, 35).fillColor('#2962ff').fill();
        
        // Try to add logo
        try {
          const logoPath = path.join(process.cwd(), 'Frontend', 'public', 'anna-university-logo.jpg');
          if (fs.existsSync(logoPath)) {
            doc.image(logoPath, 15, 5, { width: 25, height: 25 });
          }
        } catch (error) {
          console.log('Logo not found, continuing without logo');
        }
        
        // University text
        doc.fillColor('white')
           .fontSize(16)
           .font('Helvetica-Bold')
           .text('ANNA UNIVERSITY', pageWidth / 2, 12, { align: 'center' });
        
        doc.fontSize(11)
           .font('Helvetica')
           .text('College of Engineering, Guindy', pageWidth / 2, 20, { align: 'center' });
        
        doc.fontSize(10)
           .text('Chennai - 600 025', pageWidth / 2, 28, { align: 'center' });
        
        // Reset color and position
        doc.fillColor('black');
        currentY = 45;
        
        // Event title
        doc.fontSize(18)
           .font('Helvetica-Bold');
        const titleLines = event.title.toUpperCase().split('\n');
        titleLines.forEach((line, index) => {
          doc.text(line, pageWidth / 2, currentY + (index * 8), { align: 'center' });
        });
        currentY += titleLines.length * 8 + sectionSpacing;
        
        // Organization info
        const orgText = event.organizingDepartments?.primary || 'Department of Computer Science and Engineering';
        doc.fontSize(11)
           .font('Helvetica')
           .text(`Organised by ${orgText}`, pageWidth / 2, currentY, { align: 'center' });
        currentY += lineHeight + sectionSpacing;
        
        // Event type and duration
        doc.fontSize(12)
           .text(`${event.type} | ${event.duration || '3 Days'}`, pageWidth / 2, currentY, { align: 'center' });
        currentY += lineHeight + sectionSpacing;
        
        // Dates
        const startDate = new Date(event.startDate).toLocaleDateString('en-IN', {
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        });
        const endDate = new Date(event.endDate).toLocaleDateString('en-IN', {
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        });
        
        doc.font('Helvetica-Bold')
           .text(`${startDate} - ${endDate}`, pageWidth / 2, currentY, { align: 'center' });
        currentY += lineHeight + sectionSpacing * 2;
        
        // Separator line
        doc.moveTo(margin, currentY)
           .lineTo(pageWidth - margin, currentY)
           .strokeColor('black')
           .stroke();
        currentY += sectionSpacing;
      };

      // Section header
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

      // Two-column layout
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

      // Generate content
      addHeader();

      // Event overview
      addSectionHeader('EVENT OVERVIEW');
      
      const description = event.description || 
        `This comprehensive ${event.type.toLowerCase()} addresses the growing demand for expertise in modern technology. The program bridges the gap between academic learning and industry requirements, providing participants with both theoretical understanding and practical competency.`;
      
      addWrappedText(description, margin, currentY, contentWidth, 10);
      currentY += sectionSpacing;

      // Objectives and outcomes
      const leftCol = [
        { type: 'header', text: 'OBJECTIVES:' },
        { type: 'content', text: event.objectives || 'To be announced' }
      ];
      
      const rightCol = [
        { type: 'header', text: 'EXPECTED OUTCOMES:' },
        { type: 'content', text: event.outcomes || 'To be announced' }
      ];
      
      addTwoColumnSection(leftCol, rightCol);

      // Event information
      addSectionHeader('EVENT INFORMATION');
      
      const eventInfoLeft = [
        { type: 'header', text: 'VENUE:' },
        { type: 'content', text: event.venue || 'Anna University Campus' },
        { type: 'header', text: 'MODE:' },
        { type: 'content', text: event.mode || 'Offline' }
      ];
      
      const eventInfoRight = [
        { type: 'header', text: 'TARGET AUDIENCE:' },
        { type: 'content', text: event.targetAudience?.join(', ') || 'Students and Professionals' },
        { type: 'header', text: 'RESOURCE PERSONS:' },
        { type: 'content', text: event.resourcePersons?.join(', ') || 'Industry Experts' }
      ];
      
      addTwoColumnSection(eventInfoLeft, eventInfoRight);

      // Registration information
      if (event.registrationProcedure?.enabled) {
        addSectionHeader('REGISTRATION INFORMATION');
        
        if (event.registrationProcedure.instructions) {
          addWrappedText(event.registrationProcedure.instructions, margin, currentY, contentWidth, 9);
          currentY += sectionSpacing;
        }
        
        const regLeft = [];
        const regRight = [];
        
        if (event.registrationProcedure.deadline) {
          regLeft.push(
            { type: 'header', text: 'DEADLINE:' },
            { type: 'content', text: new Date(event.registrationProcedure.deadline).toLocaleDateString() }
          );
        }
        
        if (event.registrationProcedure.participantLimit) {
          regLeft.push(
            { type: 'header', text: 'LIMIT:' },
            { type: 'content', text: event.registrationProcedure.participantLimit.toString() }
          );
        }
        
        if (event.registrationProcedure.selectionCriteria) {
          regRight.push(
            { type: 'header', text: 'SELECTION:' },
            { type: 'content', text: event.registrationProcedure.selectionCriteria }
          );
        }
        
        if (regLeft.length > 0 || regRight.length > 0) {
          addTwoColumnSection(regLeft, regRight);
        }
      }

      // Coordinators
      if (event.coordinators?.length > 0) {
        addSectionHeader('COORDINATORS');
        
        event.coordinators.forEach(coordinator => {
          const coordText = `${coordinator.name}\n${coordinator.designation || ''}${coordinator.department ? `\n${coordinator.department}` : ''}`;
          addWrappedText(coordText, margin, currentY, contentWidth, 9);
          currentY += sectionSpacing;
        });
      }

      // Contact information
      addSectionHeader('CONTACT INFORMATION');
      
      const contactLeft = [
        { type: 'header', text: 'ADDRESS:' },
        { type: 'content', text: 'Anna University\nChennai - 600 025\nTamil Nadu, India' },
        { type: 'header', text: 'PHONE:' },
        { type: 'content', text: '+91-44-2235-8661' }
      ];
      
      const contactRight = [
        { type: 'header', text: 'EMAIL:' },
        { type: 'content', text: 'info@annauniv.edu' },
        { type: 'header', text: 'WEBSITE:' },
        { type: 'content', text: 'www.annauniv.edu' }
      ];
      
      addTwoColumnSection(contactLeft, contactRight);

      // Footer
      const addFooter = () => {
        const footerY = pageHeight - 25;
        doc.rect(0, footerY - 5, pageWidth, 30)
           .fillColor('#2962ff')
           .fill();
        
        doc.fillColor('white')
           .fontSize(8)
           .font('Helvetica')
           .text('Anna University - Excellence in Technical Education', pageWidth / 2, footerY + 3, { align: 'center' });
        
        doc.fontSize(7)
           .text('Email: info@annauniv.edu | Phone: +91-44-2235-8661', pageWidth / 2, footerY + 12, { align: 'center' });
      };

      // Add footer to all pages
      const pageCount = doc.bufferedPageRange().count;
      for (let i = 0; i < pageCount; i++) {
        doc.switchToPage(i);
        addFooter();
      }

      // End document
      doc.end();
    });
  } catch (error) {
    console.error('Error generating enhanced brochure:', error);
    throw error;
  }
};