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
      console.log('Failed to load logo');
      resolve(null);
    };
    img.src = src;
  });
};

export const generateEventBrochure = async (event) => {
  try {
    const doc = new jsPDF('p', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    const margin = 15;
    const contentWidth = pageWidth - (2 * margin);
    
    let currentY = margin;
    const lineHeight = 4.5;
    const sectionSpacing = 6;

    // Load Anna University logo
    const logoBase64 = await loadImageAsBase64('/anna-university-logo.jpg');

    // Helper function to add a new page if needed
    const checkPageBreak = (requiredHeight) => {
      if (currentY + requiredHeight > pageHeight - margin) {
        doc.addPage();
        currentY = margin;
      }
    };

    // Helper function to add text with proper wrapping
    const addWrappedText = (text, x, y, maxWidth, fontSize = 11, style = 'normal') => {
      doc.setFontSize(fontSize);
      doc.setFont('helvetica', style);
      
      const lines = doc.splitTextToSize(text, maxWidth);
      const textHeight = lines.length * lineHeight;
      
      checkPageBreak(textHeight + 3);
      
      doc.text(lines, x, currentY);
      currentY += textHeight;
      return textHeight;
    };

    // Header with Anna University Logo and Title
    const addHeader = () => {
      // Anna University Header
      doc.setFillColor(41, 98, 255); // Blue background
      doc.rect(0, 0, pageWidth, 35, 'F');
      
      // Add Anna University logo if available
      if (logoBase64) {
        try {
          doc.addImage(logoBase64, 'JPEG', 15, 5, 25, 25);
        } catch (error) {
          console.log('Error adding logo to PDF:', error);
        }
      }
      
      // Anna University Text (centered)
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('ANNA UNIVERSITY', pageWidth / 2, 12, { align: 'center' });
      
      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      doc.text('College of Engineering, Guindy', pageWidth / 2, 20, { align: 'center' });
      doc.text('Chennai - 600 025', pageWidth / 2, 28, { align: 'center' });
      
      // Reset text color
      doc.setTextColor(0, 0, 0);
      currentY = 45;
      
      // Event Title
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      const titleLines = doc.splitTextToSize(event.title.toUpperCase(), contentWidth);
      doc.text(titleLines, pageWidth / 2, currentY, { align: 'center' });
      currentY += titleLines.length * 8 + sectionSpacing;
      
      // Dynamic organization text
      const primaryDept = event.organizingDepartments?.primary || "Department of Computer Science and Engineering";
      const associativeDepts = event.organizingDepartments?.associative || [];
      
      let organizationText = '';
      if (associativeDepts.length > 0) {
        organizationText = `Organised jointly by ${primaryDept}`;
        associativeDepts.forEach(dept => {
          organizationText += ` and ${dept}`;
        });
      } else {
        organizationText = `Organised by ${primaryDept}`;
      }
      
      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      doc.text(organizationText, pageWidth / 2, currentY, { align: 'center' });
      currentY += lineHeight + sectionSpacing;
      
      // Event Type and Duration
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      
      // Enhance duration display with intelligent formatting
      const enhancedDuration = event.duration || generateSmartDuration(event);
      doc.text(`${event.type} | ${enhancedDuration}`, pageWidth / 2, currentY, { align: 'center' });
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
      
      doc.setFont('helvetica', 'bold');
      doc.text(`${startDate} - ${endDate}`, pageWidth / 2, currentY, { align: 'center' });
      currentY += lineHeight + sectionSpacing * 2;
      
      // Add a line separator
      doc.setDrawColor(0, 0, 0);
      doc.line(margin, currentY, pageWidth - margin, currentY);
      currentY += sectionSpacing;
    };

    // Section header helper
    const addSectionHeader = (title) => {
      checkPageBreak(15);
      doc.setFillColor(240, 240, 240);
      doc.rect(margin, currentY - 2, contentWidth, 8, 'F');
      
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 0, 0);
      doc.text(title, margin + 3, currentY + 4);
      currentY += 10;
    };

    // Two-column layout helper
    const addTwoColumnSection = (leftContent, rightContent) => {
      const colWidth = (contentWidth - 8) / 2;
      const leftX = margin;
      const rightX = margin + colWidth + 8;
      const startY = currentY;
      
      // Left column
      currentY = startY;
      leftContent.forEach(item => {
        if (item.type === 'header') {
          doc.setFontSize(10);
          doc.setFont('helvetica', 'bold');
          doc.text(item.text, leftX, currentY);
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
          doc.setFontSize(10);
          doc.setFont('helvetica', 'bold');
          doc.text(item.text, rightX, currentY);
          currentY += lineHeight;
        } else {
          addWrappedText(item.text, rightX, currentY, colWidth, 9);
        }
      });
      
      currentY = Math.max(leftEndY, currentY) + 4;
    };

    // Generate intelligent duration if not provided
    function generateSmartDuration(event) {
      const title = event.title?.toLowerCase() || '';
      const type = event.type?.toLowerCase() || '';
      
      if (type.includes('workshop')) {
        if (title.includes('intensive') || title.includes('bootcamp')) {
          return '5 Days (40 Hours)';
        } else if (title.includes('intro') || title.includes('basic')) {
          return '2 Days (16 Hours)';
        } else {
          return '3 Days (24 Hours)';
        }
      } else if (type.includes('training') || type.includes('course')) {
        if (title.includes('advanced') || title.includes('professional')) {
          return '7 Days (56 Hours)';
        } else if (title.includes('certification')) {
          return '10 Days (80 Hours)';
        } else {
          return '5 Days (40 Hours)';
        }
      } else if (type.includes('seminar') || type.includes('conference')) {
        return '1 Day (8 Hours)';
      } else {
        return '3 Days (24 Hours)';
      }
    }

    // Generate intelligent target audience if not provided
    const generateSmartTargetAudience = (event) => {
      const title = event.title?.toLowerCase() || '';
      const type = event.type?.toLowerCase() || '';
      
      if (event.targetAudience && event.targetAudience.length > 0) {
        return event.targetAudience.join(', ');
      }
      
      // AI-based target audience generation
      let audience = [];
      
      if (title.includes('ai') || title.includes('machine learning') || title.includes('data science')) {
        audience = ['Software Engineers', 'Data Scientists', 'AI Researchers', 'Graduate Students in CS/IT', 'Working Professionals in Tech'];
      } else if (title.includes('web') || title.includes('frontend') || title.includes('backend')) {
        audience = ['Web Developers', 'Software Engineers', 'CS/IT Students', 'UI/UX Designers', 'Aspiring Full-Stack Developers'];
      } else if (title.includes('cyber') || title.includes('security')) {
        audience = ['IT Security Professionals', 'Network Administrators', 'Ethical Hackers', 'Cybersecurity Students', 'IT Managers'];
      } else if (title.includes('cloud') || title.includes('devops')) {
        audience = ['DevOps Engineers', 'Cloud Architects', 'System Administrators', 'Software Engineers', 'IT Infrastructure Professionals'];
      } else if (title.includes('mobile') || title.includes('app')) {
        audience = ['Mobile App Developers', 'Software Engineers', 'CS/IT Students', 'Startup Founders', 'UI/UX Designers'];
      } else if (title.includes('blockchain')) {
        audience = ['Blockchain Developers', 'Software Engineers', 'Fintech Professionals', 'Cryptocurrency Enthusiasts', 'Startup Founders'];
      } else if (title.includes('iot') || title.includes('embedded')) {
        audience = ['IoT Engineers', 'Embedded Systems Developers', 'Electronics Engineers', 'Hardware Engineers', 'Industrial Automation Professionals'];
      } else {
        // Generic audience based on type
        if (type.includes('workshop')) {
          audience = ['Students', 'Working Professionals', 'Researchers', 'Industry Practitioners'];
        } else if (type.includes('training') || type.includes('course')) {
          audience = ['Graduate Students', 'Working Professionals', 'Faculty Members', 'Industry Professionals', 'Researchers'];
        } else {
          audience = ['Students', 'Faculty', 'Industry Professionals', 'Researchers', 'Technology Enthusiasts'];
        }
      }
      
      return audience.join(', ');
    };

    // Generate intelligent resource persons if not provided
    const generateSmartResourcePersons = (event) => {
      if (event.resourcePersons && event.resourcePersons.length > 0) {
        return event.resourcePersons.join(', ');
      }
      
      const title = event.title?.toLowerCase() || '';
      
      if (title.includes('ai') || title.includes('machine learning')) {
        return 'Industry AI/ML Experts, Research Scientists, Senior Data Scientists from leading tech companies';
      } else if (title.includes('data science') || title.includes('analytics')) {
        return 'Senior Data Scientists, Analytics Managers, Business Intelligence Experts from top organizations';
      } else if (title.includes('web') || title.includes('full stack')) {
        return 'Senior Full-Stack Developers, Tech Leads, Solution Architects from product companies';
      } else if (title.includes('cyber') || title.includes('security')) {
        return 'Cybersecurity Experts, Ethical Hackers, Security Architects from leading security firms';
      } else if (title.includes('cloud') || title.includes('devops')) {
        return 'Cloud Architects, DevOps Engineers, Site Reliability Engineers from major cloud providers';
      } else if (title.includes('mobile')) {
        return 'Senior Mobile App Developers, Mobile Architects, Product Managers from top app companies';
      } else if (title.includes('blockchain')) {
        return 'Blockchain Architects, Smart Contract Developers, DeFi Experts from blockchain companies';
      } else if (title.includes('iot')) {
        return 'IoT Solution Architects, Embedded Systems Engineers, Industrial IoT Experts';
      } else {
        return 'Industry Experts, Academic Researchers, Senior Practitioners, Technology Leaders';
      }
    };

    // Generate intelligent venue if not provided
    const generateSmartVenue = (event) => {
      if (event.venue) return event.venue;
      
      const mode = event.mode?.toLowerCase() || '';
      const type = event.type?.toLowerCase() || '';
      
      if (mode.includes('online')) {
        return 'Online Platform (Microsoft Teams/Zoom)';
      } else if (mode.includes('hybrid')) {
        return 'Anna University Campus & Online Platform';
      } else {
        if (type.includes('lab') || type.includes('hands-on')) {
          return 'Computer Science Laboratory, Anna University';
        } else if (type.includes('seminar') || type.includes('conference')) {
          return 'Main Auditorium, Anna University';
        } else {
          return 'Seminar Hall, Department of CSE, Anna University';
        }
      }
    };

    // Start generating the brochure
    addHeader();

    // Enhanced Event Details Section with AI-generated content
    addSectionHeader(`ABOUT THE ${event.type?.toUpperCase() || 'COURSE'}`);
    
    // Advanced AI-Enhanced course description based on event data
    const generateAdvancedDescription = (event) => {
      const title = event.title || 'Course';
      const type = event.type || 'training program';
      const duration = event.duration || 'multi-day';
      const objectives = event.objectives || '';
      const outcomes = event.outcomes || '';
      const targetAudience = event.targetAudience || [];
      const mode = event.mode || 'offline';
      
      // Extract key topics/domains from title for better context
      const titleLower = title.toLowerCase();
      let domain = 'technology';
      let focusArea = 'practical skills';
      let industryRelevance = 'current industry standards';
      let technicalDepth = 'foundational to advanced';
      
      // AI logic to determine domain and focus based on title keywords
      if (titleLower.includes('ai') || titleLower.includes('artificial intelligence') || titleLower.includes('machine learning') || titleLower.includes('ml')) {
        domain = 'Artificial Intelligence and Machine Learning';
        focusArea = 'AI/ML algorithms, neural networks, and data-driven decision making';
        industryRelevance = 'the rapidly evolving AI industry and its applications across sectors';
        technicalDepth = 'theoretical foundations to hands-on implementation';
      } else if (titleLower.includes('data') || titleLower.includes('analytics') || titleLower.includes('science')) {
        domain = 'Data Science and Analytics';
        focusArea = 'data analysis, statistical modeling, and insights generation';
        industryRelevance = 'data-driven organizations and business intelligence';
        technicalDepth = 'statistical concepts to advanced analytics tools';
      } else if (titleLower.includes('web') || titleLower.includes('frontend') || titleLower.includes('backend') || titleLower.includes('full stack')) {
        domain = 'Web Development and Software Engineering';
        focusArea = 'modern web technologies, frameworks, and development practices';
        industryRelevance = 'the dynamic web development industry and software engineering practices';
        technicalDepth = 'basic programming to full-stack development';
      } else if (titleLower.includes('cyber') || titleLower.includes('security') || titleLower.includes('ethical hacking')) {
        domain = 'Cybersecurity and Information Security';
        focusArea = 'security protocols, threat assessment, and protective measures';
        industryRelevance = 'the critical cybersecurity landscape and digital protection needs';
        technicalDepth = 'security fundamentals to advanced penetration testing';
      } else if (titleLower.includes('cloud') || titleLower.includes('aws') || titleLower.includes('azure') || titleLower.includes('devops')) {
        domain = 'Cloud Computing and DevOps';
        focusArea = 'cloud infrastructure, deployment strategies, and scalable solutions';
        industryRelevance = 'cloud-first organizations and modern deployment practices';
        technicalDepth = 'cloud basics to enterprise-level architecture';
      } else if (titleLower.includes('mobile') || titleLower.includes('android') || titleLower.includes('ios') || titleLower.includes('app')) {
        domain = 'Mobile Application Development';
        focusArea = 'mobile app design, development, and deployment across platforms';
        industryRelevance = 'the mobile-first digital ecosystem and app economy';
        technicalDepth = 'mobile development fundamentals to advanced app architecture';
      } else if (titleLower.includes('blockchain') || titleLower.includes('crypto') || titleLower.includes('smart contract')) {
        domain = 'Blockchain Technology and Distributed Systems';
        focusArea = 'distributed ledger technology, smart contracts, and decentralized applications';
        industryRelevance = 'emerging blockchain applications and decentralized finance';
        technicalDepth = 'blockchain concepts to dApp development';
      } else if (titleLower.includes('iot') || titleLower.includes('internet of things') || titleLower.includes('embedded')) {
        domain = 'Internet of Things (IoT) and Embedded Systems';
        focusArea = 'connected devices, sensor networks, and embedded programming';
        industryRelevance = 'the IoT ecosystem and Industry 4.0 transformation';
        technicalDepth = 'basic electronics to complex IoT solutions';
      }
      
      // Determine learning approach based on mode and duration
      const learningApproach = mode === 'online' ? 
        'interactive online sessions with hands-on virtual labs and collaborative projects' :
        'classroom instruction combined with practical laboratory sessions and industry case studies';
      
      // Generate audience-specific content
      const audienceContext = targetAudience.length > 0 ? 
        `Specifically designed for ${targetAudience.join(', ').toLowerCase()}, this program` :
        'This comprehensive program';
      
      // Use provided objectives and outcomes if available, otherwise generate contextual ones
      const smartObjectives = objectives || 
        `• Build a strong foundation in ${domain.toLowerCase()} principles and methodologies
• Develop ${focusArea}
• Master industry-standard tools and technologies relevant to ${domain.toLowerCase()}
• Apply theoretical knowledge to solve real-world problems and challenges`;
      
      const smartOutcomes = outcomes ||
        `• Proficiency in ${domain.toLowerCase()} concepts and practical applications
• Ability to implement solutions using current industry tools and frameworks
• Enhanced problem-solving skills and analytical thinking capabilities
• Industry-ready knowledge and hands-on experience with real-world projects`;
      
      // Main description with intelligent context
      return `${audienceContext} addresses the growing demand for expertise in ${domain}. The course bridges the gap between academic learning and industry requirements, focusing on ${focusArea}.

In today's rapidly evolving technological landscape, professionals need to stay current with ${industryRelevance}. This ${duration} ${type} provides comprehensive coverage from ${technicalDepth}, ensuring participants gain both theoretical understanding and practical competency.

The curriculum emphasizes ${learningApproach}, enabling participants to immediately apply their learning in professional environments.

KEY LEARNING OBJECTIVES:
${smartObjectives}

EXPECTED LEARNING OUTCOMES:
${smartOutcomes}

WHY CHOOSE THIS PROGRAM:
• Industry-relevant curriculum designed by academic and industry experts
• Hands-on learning approach with real-world project implementations
• Access to latest tools, technologies, and industry best practices
• Networking opportunities with peers and industry professionals
• Certificate of completion from Anna University, a premier institution
• Post-training support and guidance for continued learning

This program is ideal for professionals looking to enhance their career prospects, students seeking to supplement their academic knowledge with practical skills, and organizations aiming to upskill their workforce in emerging technologies.`;
    };
    
    const enhancedDescription = generateAdvancedDescription(event);
    
    // Parse and format the enhanced description
    const formatEnhancedText = (text) => {
      const paragraphs = text.split('\n\n');
      
      paragraphs.forEach(paragraph => {
        if (paragraph.trim() === '') return;
        
        // Check if this is a header line (all caps or starts with specific keywords)
        if (paragraph.match(/^[A-Z\s:]+$/) || paragraph.startsWith('KEY LEARNING') || paragraph.startsWith('EXPECTED LEARNING') || paragraph.startsWith('WHY CHOOSE')) {
          addWrappedText(paragraph, margin, currentY, contentWidth, 10, 'bold');
          currentY += 2;
        } else {
          addWrappedText(paragraph, margin, currentY, contentWidth, 9);
          currentY += 3;
        }
      });
    };
    
    formatEnhancedText(enhancedDescription);
    currentY += 4;

    // Event Information
    addSectionHeader('EVENT INFORMATION');
    
    const eventInfoLeft = [
      { type: 'header', text: 'VENUE:' },
      { type: 'content', text: generateSmartVenue(event) },
      { type: 'header', text: 'MODE:' },
      { type: 'content', text: event.mode || 'Offline' }
    ];
    
    const eventInfoRight = [
      { type: 'header', text: 'TARGET AUDIENCE:' },
      { type: 'content', text: generateSmartTargetAudience(event) },
      { type: 'header', text: 'RESOURCE PERSONS:' },
      { type: 'content', text: generateSmartResourcePersons(event) }
    ];
    
    addTwoColumnSection(eventInfoLeft, eventInfoRight);

    // About Anna University Section
    addSectionHeader('ABOUT THE UNIVERSITY');
    
    const aboutAnnaUnivText = `Anna University was established on 4th September, 1978 as a unitary type of University named after Late Dr.C.N.Annadurai, former Chief Minister of Tamil Nadu. It offers higher education in Engineering, Technology, Architecture and Applied Sciences relevant to current and projected societal needs.

The University integrates four well-known technical institutions in Chennai:
• College of Engineering (CEG) (Established in 1794)
• Alagappa College of Technology (ACT) (Established in 1944)
• Madras Institute of Technology (MIT) (Established in 1949)
• School of Architecture & Planning (SAP) (Established in 1957)`;
    
    addWrappedText(aboutAnnaUnivText, margin, currentY, contentWidth, 9);
    currentY += 4;

    // About Department Section
    addSectionHeader('ABOUT THE DEPARTMENT');
    
    const aboutDeptText = `The Department of Computer Science and Engineering aligns its goals towards providing quality education and improving competence among students, living up to its motto, 'Progress Through Knowledge'. 

The Department imparts world-class training and research platforms to students with state-of-the-art computing facilities. Students are exposed to various opportunities such as in-plant training, internships, and workshops during their course of study, preparing them for the technical world beyond academics.`;
    
    addWrappedText(aboutDeptText, margin, currentY, contentWidth, 9);
    currentY += 4;

    // Registration Procedure (if enabled)
    if (event.registrationProcedure && event.registrationProcedure.enabled) {
      addSectionHeader('REGISTRATION INFORMATION');
      
      // Registration Instructions
      if (event.registrationProcedure.instructions) {
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text('Registration Instructions:', margin, currentY);
        currentY += lineHeight;
        
        addWrappedText(event.registrationProcedure.instructions, margin, currentY, contentWidth, 9);
        currentY += sectionSpacing;
      }
      
      // Registration Details in two columns
      const regInfoLeft = [];
      const regInfoRight = [];
      
      // Registration Method
      if (event.registrationProcedure.submissionMethod) {
        regInfoLeft.push(
          { type: 'header', text: 'REGISTRATION METHOD:' },
          { type: 'content', text: event.registrationProcedure.submissionMethod.toUpperCase() }
        );
      }
      
      // Registration Deadline
      if (event.registrationProcedure.deadline) {
        regInfoLeft.push(
          { type: 'header', text: 'REGISTRATION DEADLINE:' },
          { type: 'content', text: new Date(event.registrationProcedure.deadline).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
          }) }
        );
      }
      
      // Participant Limit
      if (event.registrationProcedure.participantLimit) {
        regInfoLeft.push(
          { type: 'header', text: 'PARTICIPANT LIMIT:' },
          { type: 'content', text: event.registrationProcedure.participantLimit.toString() }
        );
      }
      
      // Selection Criteria
      if (event.registrationProcedure.selectionCriteria) {
        regInfoRight.push(
          { type: 'header', text: 'SELECTION CRITERIA:' },
          { type: 'content', text: event.registrationProcedure.selectionCriteria }
        );
      }
      
      // Confirmation Date
      if (event.registrationProcedure.confirmationDate) {
        regInfoRight.push(
          { type: 'header', text: 'CONFIRMATION DATE:' },
          { type: 'content', text: new Date(event.registrationProcedure.confirmationDate).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
          }) }
        );
      }
      
      // Confirmation Method
      if (event.registrationProcedure.confirmationMethod) {
        regInfoRight.push(
          { type: 'header', text: 'CONFIRMATION METHOD:' },
          { type: 'content', text: event.registrationProcedure.confirmationMethod.toUpperCase() }
        );
      }
      
      if (regInfoLeft.length > 0 || regInfoRight.length > 0) {
        addTwoColumnSection(regInfoLeft, regInfoRight);
      }
      
      // Additional Notes
      if (event.registrationProcedure.additionalNotes) {
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text('Additional Instructions:', margin, currentY);
        currentY += lineHeight;
        
        addWrappedText(event.registrationProcedure.additionalNotes, margin, currentY, contentWidth, 9);
        currentY += sectionSpacing;
      }

      // Certificate Requirements (if enabled)
      if (event.registrationProcedure.certificateRequirements && event.registrationProcedure.certificateRequirements.enabled) {
        addSectionHeader('CERTIFICATE REQUIREMENTS');
        
        if (event.registrationProcedure.certificateRequirements.attendanceRequired) {
          addWrappedText('• Minimum attendance required for certificate eligibility', margin, currentY, contentWidth, 9);
          currentY += lineHeight;
        }
        
        const evaluation = event.registrationProcedure.certificateRequirements.evaluation;
        if (evaluation) {
          let evalText = 'Evaluation Criteria:\n';
          
          if (evaluation.quiz && evaluation.quiz.enabled) {
            evalText += `• Quiz: ${evaluation.quiz.percentage}%\n`;
          }
          if (evaluation.assignment && evaluation.assignment.enabled) {
            evalText += `• Assignment: ${evaluation.assignment.percentage}%\n`;
          }
          if (evaluation.labWork && evaluation.labWork.enabled) {
            evalText += `• Lab Work: ${evaluation.labWork.percentage}%\n`;
          }
          if (evaluation.finalTest && evaluation.finalTest.enabled) {
            evalText += `• Final Test: ${evaluation.finalTest.percentage}%\n`;
          }
          
          if (evalText !== 'Evaluation Criteria:\n') {
            addWrappedText(evalText, margin, currentY, contentWidth, 9);
            currentY += sectionSpacing;
          }
        }
      }

      // Payment Details (if enabled)
      if (event.registrationProcedure.paymentDetails && event.registrationProcedure.paymentDetails.enabled) {
        addSectionHeader('PAYMENT DETAILS');
        
        const paymentLeft = [
          { type: 'header', text: 'ACCOUNT NAME:' },
          { type: 'content', text: event.registrationProcedure.paymentDetails.accountName || 'DIRECTOR, CSRC' },
          { type: 'header', text: 'ACCOUNT NUMBER:' },
          { type: 'content', text: event.registrationProcedure.paymentDetails.accountNumber || '37614464781' },
          { type: 'header', text: 'ACCOUNT TYPE:' },
          { type: 'content', text: event.registrationProcedure.paymentDetails.accountType || 'SAVINGS' }
        ];
        
        const paymentRight = [
          { type: 'header', text: 'IFSC CODE:' },
          { type: 'content', text: event.registrationProcedure.paymentDetails.ifscCode || 'SBIN0006463' },
          { type: 'header', text: 'BANK & BRANCH:' },
          { type: 'content', text: event.registrationProcedure.paymentDetails.bankBranch || 'State Bank of India, Anna University' }
        ];
        
        addTwoColumnSection(paymentLeft, paymentRight);
        
        // Additional Payment Information
        if (event.registrationProcedure.paymentDetails.additionalPaymentInfo) {
          doc.setFontSize(10);
          doc.setFont('helvetica', 'bold');
          doc.text('Additional Payment Information:', margin, currentY);
          currentY += lineHeight;
          
          addWrappedText(event.registrationProcedure.paymentDetails.additionalPaymentInfo, margin, currentY, contentWidth, 9);
          currentY += sectionSpacing;
        }
      }

      // Registration Form (if enabled)
      if (event.registrationProcedure.registrationForm && event.registrationProcedure.registrationForm.enabled) {
        // Check if we need a new page for the registration form
        checkPageBreak(200);
        
        addSectionHeader('REGISTRATION FORM');
        
        // Form title
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text(`REGISTRATION FORM FOR ${event.type.toUpperCase()}`, pageWidth / 2, currentY, { align: 'center' });
        currentY += lineHeight * 1.5;
        
        doc.setFontSize(11);
        doc.text(`"${event.title}"`, pageWidth / 2, currentY, { align: 'center' });
        currentY += lineHeight * 1.5;
        
        // Dynamic form fields based on event configuration
        const fields = event.registrationProcedure.registrationForm.fields;
        const fieldHeight = 15;
        
        if (fields) {
          // Name field
          if (fields.name) {
            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            doc.text('Name:', margin, currentY);
            doc.line(margin + 25, currentY + 1, pageWidth - margin, currentY + 1);
            currentY += fieldHeight;
          }
          
          // Age & DOB field
          if (fields.ageAndDob) {
            doc.text('Age & DOB:', margin, currentY);
            doc.line(margin + 45, currentY + 1, pageWidth - margin, currentY + 1);
            currentY += fieldHeight;
          }
          
          // Qualification field
          if (fields.qualification) {
            doc.text('Qualification:', margin, currentY);
            doc.line(margin + 50, currentY + 1, pageWidth - margin, currentY + 1);
            currentY += fieldHeight;
          }
          
          // Institution field
          if (fields.institution) {
            doc.text('Institution:', margin, currentY);
            doc.line(margin + 45, currentY + 1, pageWidth - margin, currentY + 1);
            currentY += fieldHeight;
          }
          
          // Category selection (if enabled)
          if (fields.category && fields.category.enabled) {
            doc.text('Pick the one that best describes you:', margin, currentY);
            currentY += lineHeight + 3;
            
            // Get category options from event configuration or use defaults
            const categoryOptions = fields.category.options || [
              'Student from a Non-Government School',
              'Student of / who has just passed Class XII from a Government School*',
              'A programming enthusiast'
            ];
            
            categoryOptions.forEach((option) => {
              // Checkbox
              doc.rect(margin + 5, currentY - 2, 3, 3);
              doc.text(option, margin + 15, currentY);
              currentY += lineHeight;
            });
            currentY += 5;
          }
          
          // Address field
          if (fields.address) {
            doc.text('Address for Communication:', margin, currentY);
            currentY += lineHeight;
            // Multiple lines for address
            for (let i = 0; i < 3; i++) {
              doc.line(margin, currentY + 1, pageWidth - margin, currentY + 1);
              currentY += fieldHeight - 3;
            }
            currentY += 5;
          }
          
          // Email field
          if (fields.email) {
            doc.text('Email:', margin, currentY);
            doc.line(margin + 25, currentY + 1, pageWidth - margin, currentY + 1);
            currentY += fieldHeight;
          }
          
          // Mobile field
          if (fields.mobile) {
            doc.text('Mobile No.:', margin, currentY);
            doc.line(margin + 45, currentY + 1, pageWidth - margin, currentY + 1);
            currentY += fieldHeight;
          }
          
          // Custom fields (if any)
          if (event.registrationProcedure.registrationForm.customFields) {
            event.registrationProcedure.registrationForm.customFields.forEach(field => {
              doc.text(`${field.fieldName}:`, margin, currentY);
              doc.line(margin + 60, currentY + 1, pageWidth - margin, currentY + 1);
              currentY += fieldHeight;
            });
          }
        }
        
        currentY += sectionSpacing;
        
        // Additional Requirements (dynamic)
        if (event.registrationProcedure.registrationForm.additionalRequirements) {
          doc.setFontSize(9);
          doc.setFont('helvetica', 'italic');
          addWrappedText(event.registrationProcedure.registrationForm.additionalRequirements, margin, currentY, contentWidth, 9);
          currentY += sectionSpacing;
        }
        
        // Declaration section
        checkPageBreak(80);
        
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.text('DECLARATION', margin, currentY);
        currentY += lineHeight + 3;
        
        // Dynamic declaration text based on event type
        const declarationText = `The information provided by me is true to the best of my knowledge. I agree to abide by the rules and regulations governing the ${event.type}. If selected, I shall attend the course for the entire duration. I also undertake the responsibility to inform the coordinators in advance if in case I am unable to attend the course.`;
        
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        addWrappedText(declarationText, margin, currentY, contentWidth, 10);
        currentY += sectionSpacing + 10;
        
        // Signature section
        const sigY = currentY;
        doc.setFontSize(10);
        
        // Date and Place on same line
        doc.text('Date:', margin, sigY);
        doc.line(margin + 25, sigY + 1, margin + 100, sigY + 1);
        
        doc.text('Place:', margin + 120, sigY);
        doc.line(margin + 145, sigY + 1, pageWidth - margin, sigY + 1);
        
        // Signature
        doc.text('Signature of the Applicant:', margin, sigY + 20);
        doc.line(margin + 80, sigY + 21, pageWidth - margin, sigY + 21);
        
        currentY = sigY + 35;
        
        // Note for printout/photocopy (dynamic based on submission method)
        if (event.registrationProcedure.submissionMethod === 'physical' || 
            event.registrationProcedure.submissionMethod === 'email') {
          doc.setFontSize(9);
          doc.setFont('helvetica', 'italic');
          doc.text('Note: Applicant may use printout or photocopy of the above format/page', margin, currentY);
          currentY += lineHeight;
        }
      }
    }

    // Organizing Committee section (dynamic from database)
    if (event.organizingCommittee && event.organizingCommittee.length > 0) {
      addSectionHeader('ORGANIZING COMMITTEE');
      
      // Two-column layout for organizing committee
      const colWidth = (contentWidth - 10) / 2;
      const leftX = margin;
      const rightX = margin + colWidth + 10;
      const startY = currentY;
      
      // Helper function to add committee member in a column
      const addCommitteeMemberInColumn = (title, member, x, isInLeftColumn) => {
        if (member) {
          doc.setFontSize(9);
          doc.setFont('helvetica', 'bold');
          doc.text(title, x, currentY);
          
          if (isInLeftColumn) {
            leftColumnY = currentY + 4;
          } else {
            rightColumnY = currentY + 4;
          }
          
          doc.setFontSize(8);
          doc.setFont('helvetica', 'bold');
          
          const memberY = isInLeftColumn ? leftColumnY : rightColumnY;
          doc.text(member.name, x + 2, memberY);
          
          let nextY = memberY + 3;
          if (member.designation) {
            doc.setFont('helvetica', 'normal');
            doc.text(member.designation, x + 2, nextY);
            nextY += 3;
          }
          
          if (member.department) {
            doc.text(member.department, x + 2, nextY);
            nextY += 3;
          }
          
          if (isInLeftColumn) {
            leftColumnY = nextY + 4;
          } else {
            rightColumnY = nextY + 4;
          }
        }
      };
      
      // Find members by role
      const chairman = event.organizingCommittee.find(member => member.role === 'Chairman');
      const convenor = event.organizingCommittee.find(member => member.role === 'Convenor' || member.role === 'Head of Department');
      const chiefPatron = event.organizingCommittee.find(member => member.role === 'Chief Patron');
      const patron = event.organizingCommittee.find(member => member.role === 'Patron');
      const secretary = event.organizingCommittee.find(member => member.role === 'Secretary');
      const members = event.organizingCommittee.filter(member => member.role === 'Member');
      
      // Track Y positions for both columns
      let leftColumnY = startY;
      let rightColumnY = startY;
      
      // Left Column
      currentY = leftColumnY;
      addCommitteeMemberInColumn('Convenor', convenor || chairman, leftX, true);
      
      if (chiefPatron) {
        currentY = leftColumnY;
        addCommitteeMemberInColumn('Chief Patron', chiefPatron, leftX, true);
      }
      
      if (secretary) {
        currentY = leftColumnY;
        addCommitteeMemberInColumn('Secretary', secretary, leftX, true);
      }
      
      // Right Column
      currentY = rightColumnY;
      if (patron) {
        addCommitteeMemberInColumn('Patron', patron, rightX, false);
      }
      
      if (chairman && !convenor) {
        currentY = rightColumnY;
        addCommitteeMemberInColumn('Chairman', chairman, rightX, false);
      }
      
      // Add members in right column
      members.forEach((member, index) => {
        currentY = rightColumnY;
        addCommitteeMemberInColumn(`Member ${index + 1}`, member, rightX, false);
      });
      
      // Set currentY to the maximum of both columns
      currentY = Math.max(leftColumnY, rightColumnY) + 3;
      
      // Co-ordinators (full width, below both columns)
      if (event.coordinators && event.coordinators.length > 0) {
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.text('Co-ordinators:', margin, currentY);
        currentY += 4;
        
        // Display coordinators in two columns as well
        const coordStartY = currentY;
        let coordLeftY = coordStartY;
        let coordRightY = coordStartY;
        
        event.coordinators.forEach((coordinator, index) => {
          const isLeftColumn = index % 2 === 0;
          const x = isLeftColumn ? leftX : rightX;
          const coordY = isLeftColumn ? coordLeftY : coordRightY;
          
          doc.setFontSize(8);
          doc.setFont('helvetica', 'bold');
          doc.text(`${index + 1}. ${coordinator.name}`, x + 2, coordY);
          
          let nextY = coordY + 3;
          if (coordinator.designation) {
            doc.setFont('helvetica', 'normal');
            doc.text(`   ${coordinator.designation}`, x + 2, nextY);
            nextY += 3;
          }
          
          if (coordinator.department) {
            doc.text(`   ${coordinator.department}`, x + 2, nextY);
            nextY += 3;
          }
          
          if (isLeftColumn) {
            coordLeftY = nextY + 2;
          } else {
            coordRightY = nextY + 2;
          }
        });
        
        currentY = Math.max(coordLeftY, coordRightY);
      }
      
      currentY += 4;
    } else {
      // Fallback: Show only coordinators if organizing committee data is not available
      if (event.coordinators && event.coordinators.length > 0) {
        addSectionHeader('COORDINATORS');
        
        event.coordinators.forEach((coordinator, index) => {
          doc.setFontSize(10);
          doc.setFont('helvetica', 'bold');
          doc.text(`${index + 1}. ${coordinator.name}`, margin, currentY);
          currentY += 7;
          
          if (coordinator.designation) {
            doc.setFontSize(9);
            doc.setFont('helvetica', 'normal');
            doc.text(`   ${coordinator.designation}`, margin, currentY);
            currentY += 7;
          }
          
          if (coordinator.department) {
            doc.text(`   ${coordinator.department}`, margin, currentY);
            currentY += 7;
          }
          
          doc.text('   CEG, Anna University, Chennai', margin, currentY);
          currentY += 9;
        });
      }
    }

    // Contact Information Section
    addSectionHeader('CONTACT INFORMATION');
    
    const contactLeft = [
      { type: 'header', text: 'ADDRESS:' },
      { type: 'content', text: 'Anna University\nSardar Patel Road, Guindy\nChennai - 600 025\nTamil Nadu, India' },
      { type: 'header', text: 'PHONE:' },
      { type: 'content', text: '+91-44-2235 8661' }
    ];
    
    const contactRight = [
      { type: 'header', text: 'EMAIL:' },
      { type: 'content', text: 'info@annauniv.edu' },
      { type: 'header', text: 'WEBSITE:' },
      { type: 'content', text: 'www.annauniv.edu' }
    ];
    
    // Add coordinator contact if available
    if (event.coordinators && event.coordinators.length > 0) {
      contactRight.push(
        { type: 'header', text: 'COORDINATOR CONTACT:' },
        { type: 'content', text: 'For queries, please contact the coordinators mentioned above.' }
      );
    }
    
    addTwoColumnSection(contactLeft, contactRight);

    // Footer with contact information
    const addFooter = () => {
      const footerY = pageHeight - 25;
      doc.setFillColor(41, 98, 255);
      doc.rect(0, footerY - 5, pageWidth, 30, 'F');
      
      // Add Anna University logo in footer if available
      if (logoBase64) {
        try {
          doc.addImage(logoBase64, 'JPEG', 15, footerY - 2, 20, 20);
        } catch (error) {
          console.log('Error adding footer logo:', error);
        }
      }
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.text('For more information, visit: www.annauniv.edu', pageWidth / 2, footerY + 3, { align: 'center' });
      
      // Add contact information
      doc.setFontSize(7);
      doc.text('Email: info@annauniv.edu | Phone: +91-44-2235-7120', pageWidth / 2, footerY + 12, { align: 'center' });
    };

    // Add footer to all pages
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      addFooter();
    }

    return doc;
  } catch (error) {
    console.error('Error generating brochure:', error);
    throw error;
  }
};

