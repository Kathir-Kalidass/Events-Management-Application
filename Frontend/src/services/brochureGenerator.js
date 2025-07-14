import jsPDF from 'jspdf';

// Helper function to load image as base64
const loadImageAsBase64 = (src) => {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = function() {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = this.width;
      canvas.height = this.height;
      ctx.drawImage(this, 0, 0);
      const dataURL = canvas.toDataURL('image/jpeg');
      resolve(dataURL);
    };
    img.onerror = function() {
      console.warn('Failed to load image:', src);
      resolve(null);
    };
    img.src = src;
  });
};

export const generateEventBrochure = async (event) => {
  try {
    // Create landscape PDF with A4 dimensions
    const doc = new jsPDF('l', 'mm', 'a4'); // 'l' for landscape
    const pageWidth = doc.internal.pageSize.width; // 297mm in landscape
    const pageHeight = doc.internal.pageSize.height; // 210mm in landscape
    const margin = 15;
    const contentWidth = pageWidth - (2 * margin);
    
    let currentY = margin;
    const lineHeight = 6; // Increased for better readability
    const sectionSpacing = 10; // Increased spacing
    const headerFontSize = 16; // High font size for headers
    const contentFontSize = 12; // High font size for content
    const titleFontSize = 20; // Very high font size for title

    // Load Anna University logo from backend
    const logoBase64 = await loadImageAsBase64('http://localhost:5050/api/logo/anna-university-logo.jpg');

    // Determine number of partitions based on available content
    const availableFields = getAvailableFields(event);
    const numPartitions = availableFields.length <= 4 ? 2 : 3;
    
    // Calculate partition widths
    const partitionGap = 20;
    const partitionWidth = (contentWidth - (partitionGap * (numPartitions - 1))) / numPartitions;

    // Helper function to check available fields
    function getAvailableFields(event) {
      const fields = [];
      
      // Always include basic event info
      fields.push('eventInfo');
      
      // Check for optional fields
      if (event.objectives || event.outcomes) fields.push('objectives');
      if (event.targetAudience?.length > 0 || event.resourcePersons?.length > 0) fields.push('audience');
      if (event.registrationProcedure?.enabled) fields.push('registration');
      if (event.organizingCommittee?.length > 0 || event.coordinators?.length > 0) fields.push('committee');
      if (event.syllabus || event.topics || event.modules) fields.push('syllabus');
      
      return fields;
    }

    // Helper function to add a new page if needed
    const checkPageBreak = (requiredHeight) => {
      if (currentY + requiredHeight > pageHeight - margin - 30) { // Leave space for footer
        doc.addPage();
        currentY = margin;
        addHeader(); // Re-add header on new page
      }
    };

    // Helper function to add text with proper wrapping
    const addWrappedText = (text, x, y, maxWidth, fontSize = contentFontSize, style = 'normal', color = [0, 0, 0]) => {
      doc.setFontSize(fontSize);
      doc.setFont('helvetica', style);
      doc.setTextColor(color[0], color[1], color[2]);
      
      const lines = doc.splitTextToSize(text, maxWidth);
      const textHeight = lines.length * lineHeight;
      
      doc.text(lines, x, y);
      return textHeight;
    };

    // Enhanced header with beautiful design
    const addHeader = () => {
      // Gradient-like header background
      doc.setFillColor(25, 118, 210); // Material Blue
      doc.rect(0, 0, pageWidth, 50, 'F');
      
      // Add decorative elements
      doc.setFillColor(33, 150, 243); // Lighter blue
      doc.rect(0, 45, pageWidth, 5, 'F');
      
      // Add Anna University logo if available
      if (logoBase64) {
        try {
          doc.addImage(logoBase64, 'JPEG', 20, 8, 35, 35);
        } catch (error) {
          console.warn('Failed to add logo:', error);
        }
      }
      
      // Anna University Text (centered)
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(22);
      doc.setFont('helvetica', 'bold');
      doc.text('ANNA UNIVERSITY', pageWidth / 2, 18, { align: 'center' });
      
      doc.setFontSize(14);
      doc.setFont('helvetica', 'normal');
      doc.text('College of Engineering, Guindy, Chennai - 600 025', pageWidth / 2, 30, { align: 'center' });
      
      // Event Title with enhanced styling
      currentY = 65;
      doc.setTextColor(25, 118, 210);
      doc.setFontSize(titleFontSize);
      doc.setFont('helvetica', 'bold');
      const titleLines = doc.splitTextToSize(event.title.toUpperCase(), contentWidth - 40);
      doc.text(titleLines, pageWidth / 2, currentY, { align: 'center' });
      currentY += titleLines.length * 10 + 5;
      
      // Event type and dates with styling
      doc.setFontSize(14);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 100, 100);
      
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
      
      const eventTypeText = `${event.type || 'Training Program'} | ${startDate} - ${endDate}`;
      doc.text(eventTypeText, pageWidth / 2, currentY, { align: 'center' });
      currentY += 15;
      
      // Decorative line
      doc.setDrawColor(25, 118, 210);
      doc.setLineWidth(2);
      doc.line(margin + 50, currentY, pageWidth - margin - 50, currentY);
      currentY += 20;
    };

    // Enhanced section header with beautiful styling
    const addSectionHeader = (title, x, width) => {
      // Background for section header
      doc.setFillColor(240, 248, 255); // Light blue background
      doc.rect(x - 5, currentY - 8, width + 10, 20, 'F');
      
      // Border for section header
      doc.setDrawColor(25, 118, 210);
      doc.setLineWidth(1);
      doc.rect(x - 5, currentY - 8, width + 10, 20);
      
      doc.setFontSize(headerFontSize);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(25, 118, 210);
      doc.text(title, x, currentY + 5);
      
      return 25; // Return height used
    };

    // Generate intelligent content based on event data
    const generateEnhancedDescription = (event) => {
      const title = event.title || 'Course';
      const type = event.type || 'training program';
      const objectives = event.objectives || '';
      const outcomes = event.outcomes || '';
      
      // AI-enhanced description based on title keywords
      const titleLower = title.toLowerCase();
      let domain = 'technology';
      let focusArea = 'practical skills';
      
      if (titleLower.includes('ai') || titleLower.includes('machine learning')) {
        domain = 'Artificial Intelligence and Machine Learning';
        focusArea = 'AI/ML algorithms and data-driven solutions';
      } else if (titleLower.includes('data') || titleLower.includes('analytics')) {
        domain = 'Data Science and Analytics';
        focusArea = 'data analysis and insights generation';
      } else if (titleLower.includes('web') || titleLower.includes('development')) {
        domain = 'Web Development';
        focusArea = 'modern web technologies and frameworks';
      } else if (titleLower.includes('cyber') || titleLower.includes('security')) {
        domain = 'Cybersecurity';
        focusArea = 'security protocols and threat assessment';
      } else if (titleLower.includes('cloud') || titleLower.includes('devops')) {
        domain = 'Cloud Computing and DevOps';
        focusArea = 'cloud infrastructure and deployment';
      }
      
      return `This comprehensive ${type} focuses on ${focusArea} in the field of ${domain}. 

Designed for professionals and students seeking to enhance their expertise, this program bridges the gap between academic knowledge and industry requirements.

Key highlights include hands-on learning, industry-relevant curriculum, and practical project implementation.`;
    };

    // Start generating the brochure
    addHeader();

    // Calculate partition positions
    const partitionPositions = [];
    for (let i = 0; i < numPartitions; i++) {
      partitionPositions.push(margin + (i * (partitionWidth + partitionGap)));
    }

    const startY = currentY;
    let maxPartitionHeight = 0;

    // Partition 1: Event Information and Description
    let partitionY = startY;
    const headerHeight1 = addSectionHeader('ABOUT THE PROGRAM', partitionPositions[0], partitionWidth);
    partitionY += headerHeight1;
    
    const description = generateEnhancedDescription(event);
    const descHeight = addWrappedText(description, partitionPositions[0], partitionY, partitionWidth, contentFontSize);
    partitionY += descHeight + 15;
    
    // Event details
    const eventDetails = [
      `Venue: ${event.venue || 'Anna University Campus'}`,
      `Mode: ${event.mode || 'Offline'}`,
      `Duration: ${event.duration || generateSmartDuration(event)}`,
      `Type: ${event.type || 'Training Program'}`
    ];
    
    eventDetails.forEach(detail => {
      const detailHeight = addWrappedText(detail, partitionPositions[0], partitionY, partitionWidth, contentFontSize, 'normal', [60, 60, 60]);
      partitionY += detailHeight + 3;
    });
    
    maxPartitionHeight = Math.max(maxPartitionHeight, partitionY - startY);

    // Partition 2: Objectives/Outcomes or Target Audience
    partitionY = startY;
    if (availableFields.includes('objectives')) {
      const headerHeight2 = addSectionHeader('OBJECTIVES & OUTCOMES', partitionPositions[1], partitionWidth);
      partitionY += headerHeight2;
      
      if (event.objectives) {
        const objHeight = addWrappedText(`Objectives:\n${event.objectives}`, partitionPositions[1], partitionY, partitionWidth, contentFontSize);
        partitionY += objHeight + 10;
      }
      
      if (event.outcomes) {
        const outHeight = addWrappedText(`Expected Outcomes:\n${event.outcomes}`, partitionPositions[1], partitionY, partitionWidth, contentFontSize);
        partitionY += outHeight;
      }
    } else if (availableFields.includes('audience')) {
      const headerHeight2 = addSectionHeader('TARGET AUDIENCE', partitionPositions[1], partitionWidth);
      partitionY += headerHeight2;
      
      const targetAudience = generateSmartTargetAudience(event);
      const audHeight = addWrappedText(targetAudience, partitionPositions[1], partitionY, partitionWidth, contentFontSize);
      partitionY += audHeight + 10;
      
      if (event.resourcePersons?.length > 0) {
        const resHeight = addWrappedText(`Resource Persons:\n${event.resourcePersons.join(', ')}`, partitionPositions[1], partitionY, partitionWidth, contentFontSize);
        partitionY += resHeight;
      }
    }
    
    maxPartitionHeight = Math.max(maxPartitionHeight, partitionY - startY);

    // Partition 3: Registration/Committee (only if 3 partitions)
    if (numPartitions === 3) {
      partitionY = startY;
      
      if (availableFields.includes('registration')) {
        const headerHeight3 = addSectionHeader('REGISTRATION INFO', partitionPositions[2], partitionWidth);
        partitionY += headerHeight3;
        
        const regInfo = generateRegistrationInfo(event);
        const regHeight = addWrappedText(regInfo, partitionPositions[2], partitionY, partitionWidth, contentFontSize);
        partitionY += regHeight + 10;
      }
      
      if (availableFields.includes('committee')) {
        const headerHeight3 = addSectionHeader('COORDINATORS', partitionPositions[2], partitionWidth);
        partitionY += headerHeight3;
        
        const coordInfo = generateCoordinatorInfo(event);
        const coordHeight = addWrappedText(coordInfo, partitionPositions[2], partitionY, partitionWidth, contentFontSize);
        partitionY += coordHeight;
      }
      
      maxPartitionHeight = Math.max(maxPartitionHeight, partitionY - startY);
    } else {
      // For 2 partitions, add registration/committee info below
      currentY = startY + maxPartitionHeight + 20;
      
      if (availableFields.includes('registration')) {
        const headerHeight = addSectionHeader('REGISTRATION INFORMATION', margin, contentWidth);
        currentY += headerHeight;
        
        const regInfo = generateRegistrationInfo(event);
        const regHeight = addWrappedText(regInfo, margin, currentY, contentWidth, contentFontSize);
        currentY += regHeight + 15;
      }
      
      if (availableFields.includes('committee')) {
        const headerHeight = addSectionHeader('ORGANIZING COMMITTEE', margin, contentWidth);
        currentY += headerHeight;
        
        const coordInfo = generateCoordinatorInfo(event);
        const coordHeight = addWrappedText(coordInfo, margin, currentY, contentWidth, contentFontSize);
        currentY += coordHeight + 15;
      }
    }

    // Update currentY for footer placement
    currentY = Math.max(currentY, startY + maxPartitionHeight + 30);

    // Helper functions for content generation
    function generateSmartDuration(event) {
      const title = event.title?.toLowerCase() || '';
      const type = event.type?.toLowerCase() || '';
      
      if (type.includes('workshop')) {
        return title.includes('intensive') ? '5 Days (40 Hours)' : '3 Days (24 Hours)';
      } else if (type.includes('training')) {
        return title.includes('advanced') ? '7 Days (56 Hours)' : '5 Days (40 Hours)';
      }
      return '3 Days (24 Hours)';
    }

    function generateSmartTargetAudience(event) {
      if (event.targetAudience?.length > 0) {
        return event.targetAudience.join(', ');
      }
      
      const title = event.title?.toLowerCase() || '';
      
      if (title.includes('ai') || title.includes('machine learning')) {
        return 'Software Engineers, Data Scientists, AI Researchers, Graduate Students, Tech Professionals';
      } else if (title.includes('web') || title.includes('development')) {
        return 'Web Developers, Software Engineers, CS Students, UI/UX Designers, Tech Enthusiasts';
      } else if (title.includes('data') || title.includes('analytics')) {
        return 'Data Analysts, Business Analysts, Data Scientists, Researchers, Graduate Students';
      }
      
      return 'Students, Faculty, Industry Professionals, Researchers, Technology Enthusiasts';
    }

    function generateRegistrationInfo(event) {
      let info = '';
      
      if (event.registrationProcedure?.enabled) {
        if (event.registrationProcedure.deadline) {
          const deadline = new Date(event.registrationProcedure.deadline).toLocaleDateString('en-IN');
          info += `Registration Deadline: ${deadline}\n`;
        }
        
        if (event.registrationProcedure.participantLimit) {
          info += `Participant Limit: ${event.registrationProcedure.participantLimit}\n`;
        }
        
        if (event.registrationProcedure.submissionMethod) {
          info += `Registration Method: ${event.registrationProcedure.submissionMethod.toUpperCase()}\n`;
        }
        
        if (event.registrationProcedure.instructions) {
          info += `\nInstructions: ${event.registrationProcedure.instructions}`;
        }
      } else {
        info = 'Registration details will be announced soon. Please contact coordinators for more information.';
      }
      
      return info;
    }

    function generateCoordinatorInfo(event) {
    let info = '';
    
    // Show coordinators first
    if (event.coordinators?.length > 0) {
    event.coordinators.forEach((coordinator, index) => {
    info += `${index + 1}. ${coordinator.name}\n`;
    if (coordinator.designation) {
    info += `   ${coordinator.designation}\n`;
    }
    if (coordinator.department) {
    info += `   ${coordinator.department}\n`;
    }
    info += '\n';
    });
    }
    
    // Show organizing committee if available and enabled
    if (event.organizingCommittee?.length > 0 && 
    event.committeeDisplaySettings?.showInBrochure !== false) {
    
    info += '\n' + (event.committeeDisplaySettings?.customTitle || 'ORGANIZING COMMITTEE') + '\n';
    info += '-'.repeat(25) + '\n';
    
    // Group by category if enabled
    if (event.committeeDisplaySettings?.groupByCategory) {
    const groupedCommittee = {};
    
    event.organizingCommittee.forEach(item => {
    const member = item.member || item;
    const category = member.roleCategory || 'COMMITTEE';
    
    if (!groupedCommittee[category]) {
    groupedCommittee[category] = [];
    }
    
    groupedCommittee[category].push({
    name: item.customName || member.name,
    designation: item.customDesignation || member.designation,
    department: item.customDepartment || member.department,
    role: member.role
    });
    });
    
    // Display by category order
    const categoryOrder = ['PATRON', 'ADMINISTRATION', 'ACADEMIC', 'ORGANIZING', 'COORDINATION', 'COMMITTEE', 'EXTERNAL'];
    
    categoryOrder.forEach(category => {
    if (groupedCommittee[category]?.length > 0) {
    info += `\n${category}:\n`;
    groupedCommittee[category].forEach(member => {
    info += `${member.role}: ${member.name}\n`;
    if (member.designation && event.committeeDisplaySettings?.showDepartments) {
    info += `${member.designation}\n`;
    }
    if (member.department && event.committeeDisplaySettings?.showDepartments) {
    info += `${member.department}\n`;
    }
    info += '\n';
    });
    }
    });
    } else {
    // Simple list without grouping
    event.organizingCommittee
    .sort((a, b) => (a.order || 0) - (b.order || 0))
    .forEach(item => {
    const member = item.member || item;
    const name = item.customName || member.name;
    const designation = item.customDesignation || member.designation;
    const department = item.customDepartment || member.department;
    
    info += `${member.role}: ${name}\n`;
    if (designation && event.committeeDisplaySettings?.showDepartments) {
    info += `${designation}\n`;
    }
    if (department && event.committeeDisplaySettings?.showDepartments) {
    info += `${department}\n`;
    }
    info += '\n';
    });
    }
    }
    
    // Add organizing departments
    if (event.organizingDepartments?.primary) {
    info += `\n${event.organizingDepartments.primary}\n`;
    if (event.organizingDepartments.associative?.length > 0) {
    event.organizingDepartments.associative.forEach(dept => {
    info += `${dept}\n`;
    });
    }
    }
    
    // Add contact information
    info += '\nFor more information: www.annauniv.edu | Email: info@annauniv.edu';
    
    return info;
    }

    // Enhanced footer with university information
    const addFooter = () => {
      const footerY = pageHeight - 35;
      
      // Footer background
      doc.setFillColor(25, 118, 210);
      doc.rect(0, footerY, pageWidth, 35, 'F');
      
      // Add small logo in footer
      if (logoBase64) {
        try {
          doc.addImage(logoBase64, 'JPEG', 20, footerY + 5, 25, 25);
        } catch (error) {
          console.warn('Failed to add footer logo:', error);
        }
      }
      
      // Footer text
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('ANNA UNIVERSITY', pageWidth / 2, footerY + 12, { align: 'center' });
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text('For more information: www.annauniv.edu | Email: info@annauniv.edu', pageWidth / 2, footerY + 22, { align: 'center' });
    };

    // Add footer to all pages
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      addFooter();
    }

    return doc;
  } catch (error) {
    console.error('Error generating enhanced brochure:', error);
    throw error;
  }
};