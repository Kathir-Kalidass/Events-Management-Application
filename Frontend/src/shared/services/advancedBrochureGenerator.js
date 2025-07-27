import jsPDF from 'jspdf';
import { usersAPI } from './api.js';

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

export const generateEventBrochure = async (event, layoutType = 'landscape') => {
  try {
    // Force landscape orientation for optimized layout
    const doc = new jsPDF('l', 'mm', 'a4'); // Always landscape
    const pageWidth = doc.internal.pageSize.width; // 297mm
    const pageHeight = doc.internal.pageSize.height; // 210mm
    const margin = 15;
    const contentWidth = pageWidth - (2 * margin);
    
    let currentY = margin;
    const lineHeight = 4.2;
    const sectionSpacing = 6;

    // Enhanced color palette with better contrast
    const colors = {
      primary: [25, 118, 210],      // Modern blue
      secondary: [63, 81, 181],     // Indigo
      accent: [255, 193, 7],        // Amber
      success: [76, 175, 80],       // Green
      text: [33, 33, 33],           // Dark gray
      lightText: [255, 255, 255],   // White text for dark backgrounds
      lightGray: [248, 249, 250],   // Very light background
      mediumGray: [233, 236, 239],  // Medium gray for borders
      white: [255, 255, 255],       // White
      gradient1: [26, 35, 126],     // Deep blue
      gradient2: [63, 81, 181],     // Lighter blue
      cardBg: [252, 253, 254],      // Card background
      headerBg: [240, 242, 247]     // Header background
    };

    // Load Anna University logo and CEG logo
    const logoBase64 = await loadImageAsBase64('/anna-university-logo.jpg');
    const cegLogoBase64 = await loadImageAsBase64('/CEG_logo.png');

    // Helper function to add a new page if needed
    const checkPageBreak = (requiredHeight) => {
      if (currentY + requiredHeight > pageHeight - margin - 20) { // Reserve space for footer
        doc.addPage();
        currentY = margin;
        return true;
      }
      return false;
    };

    // Enhanced text helper with better typography and overflow protection
    const addWrappedText = (text, x, y, maxWidth, fontSize = 10, style = 'normal', align = 'left', color = colors.text) => {
      doc.setFontSize(fontSize);
      doc.setFont('helvetica', style);
      doc.setTextColor(color[0], color[1], color[2]);
      
      // Ensure maxWidth is reasonable and prevent overflow with better padding
      const safeMaxWidth = Math.max(maxWidth - 8, 15); // Increased padding to 8mm, minimum 15mm width
      const lines = doc.splitTextToSize(text, safeMaxWidth);
      const textHeight = lines.length * (lineHeight * 0.9); // Slightly tighter line spacing
      
      // Add more padding to prevent text from touching borders
      const paddedX = x + 3;
      const paddedMaxWidth = maxWidth - 6;
      
      if (align === 'center') {
        doc.text(lines, paddedX + paddedMaxWidth/2, currentY, { align: 'center' });
      } else if (align === 'right') {
        doc.text(lines, paddedX + paddedMaxWidth, currentY, { align: 'right' });
      } else {
        doc.text(lines, paddedX, currentY);
      }
      currentY += textHeight;
      return textHeight;
    };

    // Add gradient background helper
    const addGradientBackground = (x, y, width, height, color1, color2) => {
      // Create gradient effect with multiple rectangles
      const steps = 20;
      const stepHeight = height / steps;
      
      for (let i = 0; i < steps; i++) {
        const ratio = i / steps;
        const r = Math.round(color1[0] + (color2[0] - color1[0]) * ratio);
        const g = Math.round(color1[1] + (color2[1] - color1[1]) * ratio);
        const b = Math.round(color1[2] + (color2[2] - color1[2]) * ratio);
        
        doc.setFillColor(r, g, b);
        doc.rect(x, y + (i * stepHeight), width, stepHeight, 'F');
      }
    };

    // Enhanced card/box helper with better design and contrast
    const addCard = (x, y, width, height, title, content, bgColor = colors.cardBg, borderColor = colors.primary) => {
      // Card shadow effect (subtle)
      doc.setFillColor(220, 220, 220, 0.3);
      doc.rect(x + 0.5, y + 0.5, width, height, 'F');
      
      // Card background with better contrast
      doc.setFillColor(bgColor[0], bgColor[1], bgColor[2]);
      doc.rect(x, y, width, height, 'F');
      
      // Card border with softer color
      doc.setDrawColor(colors.mediumGray[0], colors.mediumGray[1], colors.mediumGray[2]);
      doc.setLineWidth(0.3);
      doc.rect(x, y, width, height, 'S');
      
      // Title bar with better contrast
      if (title) {
        // Use a lighter header background for better readability
        doc.setFillColor(colors.headerBg[0], colors.headerBg[1], colors.headerBg[2]);
        doc.rect(x, y, width, 10, 'F');
        
        // Add a subtle border under the header
        doc.setDrawColor(borderColor[0], borderColor[1], borderColor[2]);
        doc.setLineWidth(0.5);
        doc.line(x, y + 10, x + width, y + 10);
        
        // Title text with dark color for better contrast
        doc.setTextColor(colors.text[0], colors.text[1], colors.text[2]);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        
        // Center the title text and ensure it fits
        const titleWidth = doc.getTextWidth(title);
        const titleX = x + (width - titleWidth) / 2;
        doc.text(title, titleX, y + 6.5);
      }
      
      return { 
        contentX: x + 4, 
        contentY: y + (title ? 14 : 4), 
        contentWidth: width - 8 
      };
    };

    // Icon helper (simple geometric shapes)
    const addIcon = (x, y, type, size = 4, color = colors.primary) => {
      doc.setFillColor(color[0], color[1], color[2]);
      doc.setDrawColor(color[0], color[1], color[2]);
      
      switch (type) {
        case 'calendar':
          doc.rect(x, y, size, size, 'F');
          doc.setFillColor(255, 255, 255);
          doc.rect(x + 0.5, y + 1, size - 1, 1, 'F');
          break;
        case 'location':
          doc.circle(x + size/2, y + size/2, size/2, 'F');
          break;
        case 'users':
          doc.circle(x + 1, y + 1, 1, 'F');
          doc.circle(x + size - 1, y + 1, 1, 'F');
          doc.rect(x, y + 2, size, size - 2, 'F');
          break;
        case 'info':
          doc.circle(x + size/2, y + size/2, size/2, 'F');
          doc.setFillColor(255, 255, 255);
          doc.text('i', x + size/2 - 0.5, y + size/2 + 1);
          break;
        default:
          doc.rect(x, y, size, size, 'F');
      }
    };

    // Enhanced three-column layout with dynamic card heights
    const addThreeColumnSection = (leftContent, centerContent, rightContent) => {
      const colWidth = (contentWidth - 20) / 3;
      const leftX = margin;
      const centerX = margin + colWidth + 10;
      const rightX = margin + (colWidth * 2) + 20;
      const startY = currentY;
      
      // Calculate required heights for each column based on content
      const calculateContentHeight = (content) => {
        let totalHeight = 0;
        content.forEach((item, index) => {
          if (item.type === 'header') {
            totalHeight += 14; // Header height (10mm header + 4mm padding)
          } else if (item.type === 'content' || index > 0) {
            // Calculate text height
            doc.setFontSize(9);
            const safeMaxWidth = Math.max(colWidth - 16, 15);
            const lines = doc.splitTextToSize(item.text, safeMaxWidth);
            const textHeight = lines.length * (lineHeight * 0.9);
            totalHeight += textHeight + 1.5; // Add spacing
          }
        });
        return Math.max(totalHeight + 8, 35); // Minimum height of 35mm
      };
      
      const leftHeight = leftContent.length > 0 ? calculateContentHeight(leftContent) : 35;
      const centerHeight = centerContent.length > 0 ? calculateContentHeight(centerContent) : 35;
      const rightHeight = rightContent.length > 0 ? calculateContentHeight(rightContent) : 35;
      
      // Use the maximum height for all cards to maintain alignment
      const maxCardHeight = Math.max(leftHeight, centerHeight, rightHeight);
      
      // Left column card
      if (leftContent.length > 0) {
        const leftCard = addCard(leftX, startY, colWidth, maxCardHeight, 
          leftContent[0].type === 'header' ? leftContent[0].text : null, 
          null, colors.cardBg, colors.primary);
        
        let tempY = leftCard.contentY;
        leftContent.forEach((item, index) => {
          if (item.type === 'content' || index > 0) {
            currentY = tempY;
            addWrappedText(item.text, leftCard.contentX, tempY, leftCard.contentWidth, 9, 'normal', 'left', colors.text);
            tempY = currentY + 1.5;
          }
        });
      }
      
      // Center column card
      if (centerContent.length > 0) {
        const centerCard = addCard(centerX, startY, colWidth, maxCardHeight, 
          centerContent[0].type === 'header' ? centerContent[0].text : null, 
          null, colors.cardBg, colors.secondary);
        
        let tempY = centerCard.contentY;
        centerContent.forEach((item, index) => {
          if (item.type === 'content' || index > 0) {
            currentY = tempY;
            addWrappedText(item.text, centerCard.contentX, tempY, centerCard.contentWidth, 9, 'normal', 'left', colors.text);
            tempY = currentY + 1.5;
          }
        });
      }
      
      // Right column card
      if (rightContent.length > 0) {
        const rightCard = addCard(rightX, startY, colWidth, maxCardHeight, 
          rightContent[0].type === 'header' ? rightContent[0].text : null, 
          null, colors.cardBg, colors.success);
        
        let tempY = rightCard.contentY;
        rightContent.forEach((item, index) => {
          if (item.type === 'content' || index > 0) {
            currentY = tempY;
            addWrappedText(item.text, rightCard.contentX, tempY, rightCard.contentWidth, 9, 'normal', 'left', colors.text);
            tempY = currentY + 1.5;
          }
        });
      }
      
      currentY = startY + maxCardHeight + 8;
    };

    // Enhanced two-column layout with dynamic card heights
    const addTwoColumnSection = (leftContent, rightContent) => {
      const colWidth = (contentWidth - 12) / 2;
      const leftX = margin;
      const rightX = margin + colWidth + 12;
      const startY = currentY;
      
      // Calculate required heights for each column based on content
      const calculateContentHeight = (content) => {
        let totalHeight = 0;
        content.forEach((item, index) => {
          if (item.type === 'header') {
            totalHeight += 14; // Header height (10mm header + 4mm padding)
          } else if (item.type === 'content' || index > 0) {
            // Calculate text height
            doc.setFontSize(9);
            const safeMaxWidth = Math.max(colWidth - 16, 15);
            const lines = doc.splitTextToSize(item.text, safeMaxWidth);
            const textHeight = lines.length * (lineHeight * 0.9);
            totalHeight += textHeight + 1.5; // Add spacing
          }
        });
        return Math.max(totalHeight + 8, 30); // Minimum height of 30mm
      };
      
      const leftHeight = leftContent.length > 0 ? calculateContentHeight(leftContent) : 30;
      const rightHeight = rightContent.length > 0 ? calculateContentHeight(rightContent) : 30;
      
      // Use the maximum height for both cards to maintain alignment
      const maxCardHeight = Math.max(leftHeight, rightHeight);
      
      // Left column card
      if (leftContent.length > 0) {
        const leftCard = addCard(leftX, startY, colWidth, maxCardHeight, 
          leftContent[0].type === 'header' ? leftContent[0].text : null, 
          null, colors.cardBg, colors.primary);
        
        let tempY = leftCard.contentY;
        leftContent.forEach((item, index) => {
          if (item.type === 'content' || index > 0) {
            currentY = tempY;
            addWrappedText(item.text, leftCard.contentX, tempY, leftCard.contentWidth, 9, 'normal', 'left', colors.text);
            tempY = currentY + 1.5;
          }
        });
      }
      
      // Right column card
      if (rightContent.length > 0) {
        const rightCard = addCard(rightX, startY, colWidth, maxCardHeight, 
          rightContent[0].type === 'header' ? rightContent[0].text : null, 
          null, colors.cardBg, colors.secondary);
        
        let tempY = rightCard.contentY;
        rightContent.forEach((item, index) => {
          if (item.type === 'content' || index > 0) {
            currentY = tempY;
            addWrappedText(item.text, rightCard.contentX, tempY, rightCard.contentWidth, 9, 'normal', 'left', colors.text);
            tempY = currentY + 1.5;
          }
        });
      }
      
      currentY = startY + maxCardHeight + 8;
    };

    // Enhanced section header with modern styling
    const addSectionHeader = (title, fontSize = 11) => {
      checkPageBreak(15);
      
      // Modern gradient header
      addGradientBackground(margin - 2, currentY - 2, contentWidth + 4, 10, colors.primary, colors.secondary);
      
      // Add icon based on section title
      let iconType = 'info';
      if (title.toLowerCase().includes('registration')) iconType = 'users';
      else if (title.toLowerCase().includes('contact')) iconType = 'location';
      else if (title.toLowerCase().includes('committee')) iconType = 'users';
      
      addIcon(margin + 2, currentY, iconType, 4, colors.white);
      
      doc.setFontSize(fontSize);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(255, 255, 255);
      doc.text(title, margin + 10, currentY + 4);
      
      currentY += 12;
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
          audience = ['Faculty', 'Students', 'Working Professionals', 'Researchers', 'Industry Practitioners'];
        } else if (type.includes('training') || type.includes('course')) {
          audience = ['Faculty', 'Graduate Students', 'Working Professionals', 'Industry Professionals', 'Researchers'];
        } else {
          audience = ['Faculty', 'Students', 'Industry Professionals', 'Researchers', 'Technology Enthusiasts'];
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
        return 'Dr. Smith, Industry Experts, Academic Researchers, Senior Practitioners, Technology Leaders';
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
      
      // Main description with intelligent context - Concise version
      return `${audienceContext} addresses the growing demand for expertise in ${domain}. This ${duration} ${type} bridges academic learning with industry requirements, focusing on ${focusArea}.

The curriculum emphasizes ${learningApproach}, ensuring participants gain both theoretical understanding and practical competency.

KEY LEARNING OBJECTIVES:
• Build strong foundation in ${domain.toLowerCase()} principles
• Develop practical skills and hands-on experience
• Master industry-standard tools and technologies
• Apply knowledge to solve real-world challenges

EXPECTED LEARNING OUTCOMES:
• Proficiency in ${domain.toLowerCase()} concepts and applications
• Enhanced problem-solving and analytical thinking
• Industry-ready knowledge with practical experience
• Certificate of completion from Anna University

This program is ideal for professionals seeking to enhance their skills and stay current with industry standards.`;
    };

    // PAGE 1: ENHANCED MODERN LANDSCAPE LAYOUT
    const createOptimizedLandscapePage = async () => {
      // Modern gradient header with enhanced styling
      addGradientBackground(0, 0, pageWidth, 35, colors.gradient1, colors.gradient2);
      
      // Add decorative elements
      doc.setFillColor(255, 255, 255, 0.1);
      doc.circle(pageWidth - 30, 10, 15, 'F');
      doc.circle(30, 25, 10, 'F');
      
      // Add Anna University logo with enhanced positioning (top left)
      if (logoBase64) {
        try {
          doc.addImage(logoBase64, 'JPEG', 20, 5, 25, 25);
        } catch (error) {
          console.log('Error adding Anna University logo to PDF:', error);
        }
      }
      
      // Add CEG logo to top right
      if (cegLogoBase64) {
        try {
          doc.addImage(cegLogoBase64, 'PNG', pageWidth - 45, 5, 25, 25);
        } catch (error) {
          console.log('Error adding CEG logo to PDF:', error);
        }
      }
      
      // Enhanced university header with better typography
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text('ANNA UNIVERSITY', pageWidth / 2, 14, { align: 'center' });
      
      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      doc.text('College of Engineering, Guindy, Chennai - 600 025', pageWidth / 2, 24, { align: 'center' });
      
      // Add a subtle separator line
      doc.setDrawColor(255, 255, 255, 0.3);
      doc.setLineWidth(0.5);
      doc.line(margin, 32, pageWidth - margin, 32);
      
      doc.setTextColor(colors.text[0], colors.text[1], colors.text[2]);
      currentY = 42;
      
      // Enhanced event title with modern styling
      checkPageBreak(15);
      
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
      addWrappedText(event.title.toUpperCase(), margin, currentY, contentWidth, 20, 'bold', 'center', colors.primary);
      currentY += 3;
      
      // Organization and Type with enhanced styling
      let organizingText = "Department of Computer Science and Engineering";
      
      // Debug logging for organizing departments
      console.log('=== ORGANIZING DEPARTMENTS DEBUG ===');
      console.log('Full event.organizingDepartments:', JSON.stringify(event.organizingDepartments, null, 2));
      
      if (event.organizingDepartments) {
        const primary = event.organizingDepartments.primary || "Department of Computer Science and Engineering";
        console.log('Primary department:', primary);
        
        // Check multiple possible field names for associations
        const associations = event.organizingDepartments.associations || 
                           event.organizingDepartments.associative || 
                           event.organizingDepartments.associated || 
                           event.organizingDepartments.associatedDepartments || 
                           [];
        
        console.log('Found associations:', associations);
        console.log('Associations length:', associations.length);
        
        if (associations && associations.length > 0) {
          // Show primary department and associations
          organizingText = `${primary} in association with ${associations.join(', ')}`;
          console.log('Final organizing text with associations:', organizingText);
        } else {
          organizingText = primary;
          console.log('Final organizing text (primary only):', organizingText);
        }
      } else {
        console.log('No organizingDepartments found, using default');
      }
      
      console.log('=== END ORGANIZING DEPARTMENTS DEBUG ===');
      
      const enhancedDuration = event.duration || generateSmartDuration(event);
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(colors.text[0], colors.text[1], colors.text[2]); // Ensure dark text color
      addWrappedText(`Organised by ${organizingText}`, margin, currentY, contentWidth, 10, 'normal', 'center', colors.text);
      currentY += 2;
      
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      addWrappedText(`${event.type} | ${enhancedDuration}`, margin, currentY, contentWidth, 12, 'bold', 'center');
      currentY += 1;
      
      // Dates and Venue - Compact
      const startDate = new Date(event.startDate).toLocaleDateString('en-IN', {
        day: 'numeric', month: 'short', year: 'numeric'
      });
      const endDate = new Date(event.endDate).toLocaleDateString('en-IN', {
        day: 'numeric', month: 'short', year: 'numeric'
      });
      
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      addWrappedText(`${startDate} - ${endDate}`, margin, currentY, contentWidth, 14, 'bold', 'center');
      currentY += 4;
      
      const venue = generateSmartVenue(event);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      addWrappedText(`Venue: ${venue}`, margin, currentY, contentWidth, 9, 'normal', 'center');
      currentY += 8;
      
      // Three-column main content layout
      const aboutContent = [
        { type: 'header', text: `ABOUT THE ${event.type?.toUpperCase() || 'COURSE'}` },
        { type: 'content', text: generateAdvancedDescription(event).substring(0, 800) + '...' }
      ];
      
      // Generate registration fee information for event info
      let registrationFeeInfo = '';
      const incomeSources = event.incomeSource || event.budgetBreakdown?.income || [];
      
      if (incomeSources && incomeSources.length > 0) {
        registrationFeeInfo = '\n\nREGISTRATION FEE:\n';
        incomeSources.forEach((source, index) => {
          if (source.perParticipant || source.perParticipantAmount) {
            const amount = source.perParticipant || source.perParticipantAmount;
            const category = source.category || `Category ${index + 1}`;
            registrationFeeInfo += `${category}:  ${amount}/-\n`;
          }
        });
      }
      
      const eventInfoContent = [
        { type: 'header', text: 'EVENT INFORMATION' },
        { type: 'content', text: `TARGET AUDIENCE:\n${generateSmartTargetAudience(event)}\n\nRESOURCE PERSONS:\n${generateSmartResourcePersons(event)}\n\nMODE: ${event.mode || 'Offline'}${registrationFeeInfo}` }
      ];
      
      const universityContent = [
        { type: 'header', text: 'ABOUT ANNA UNIVERSITY' },
        { type: 'content', text: `Anna University was established on 4th September, 1978, named after Late Dr.C.N.Annadurai, former Chief Minister of Tamil Nadu.\n\nThe University integrates four prestigious institutions:\n• College of Engineering (CEG) - 1794\n• Alagappa College of Technology (ACT) - 1944\n• Madras Institute of Technology (MIT) - 1949\n• School of Architecture & Planning (SAP) - 1957` },
        { type: 'header', text: 'ABOUT THE DEPARTMENT' },
        { type: 'content', text: `The Department of Computer Science and Engineering aligns its goals towards providing quality education and improving competence among students, living up to its motto 'Progress Through Knowledge'.\n\nCEG has always taken education beyond the classroom to help students understand the reality of the technical world. The Department provides world-class training, research platforms, and state-of-the-art computing facilities.\n\nStudents are exposed to various opportunities including industrial training, internships, and workshops during their course of study.` }
      ];
      
      addThreeColumnSection(aboutContent, eventInfoContent, universityContent);
      
      // Registration and Payment section (if enabled)
      console.log('=== REGISTRATION & PAYMENT DEBUG ===');
      console.log('registrationProcedure:', JSON.stringify(event.registrationProcedure, null, 2));
      console.log('registrationForm enabled:', event.registrationProcedure?.registrationForm?.enabled);
      console.log('paymentDetails enabled:', event.registrationProcedure?.paymentDetails?.enabled);
      // Additional debug info
      console.log('registrationProcedure object:', event.registrationProcedure);
      console.log('registrationForm object:', event.registrationProcedure?.registrationForm);
      console.log('paymentDetails object:', event.registrationProcedure?.paymentDetails);
      console.log('typeof registrationForm.enabled:', typeof event.registrationProcedure?.registrationForm?.enabled);
      console.log('typeof paymentDetails.enabled:', typeof event.registrationProcedure?.paymentDetails?.enabled);
      // Check if registration procedure exists and is enabled, AND either form or payment is explicitly enabled
      const isRegistrationProcedureEnabled = event.registrationProcedure?.enabled === true;
      const isRegistrationFormEnabled = event.registrationProcedure?.registrationForm?.enabled === true;
      const isPaymentDetailsEnabled = event.registrationProcedure?.paymentDetails?.enabled === true;
      
      console.log('isRegistrationProcedureEnabled:', isRegistrationProcedureEnabled);
      console.log('isRegistrationFormEnabled:', isRegistrationFormEnabled);
      console.log('isPaymentDetailsEnabled:', isPaymentDetailsEnabled);
      
      if (event.registrationProcedure && isRegistrationProcedureEnabled && (isRegistrationFormEnabled || isPaymentDetailsEnabled)) {
        console.log('Showing registration/payment section');
        currentY += 4;
        addSectionHeader('REGISTRATION & PAYMENT INFORMATION', 9);
        
        const regContent = [];
        const paymentContent = [];
        
        // Registration info - only if explicitly enabled
        if (isRegistrationFormEnabled) {
          console.log('Adding registration content');
          regContent.push(
            { type: 'header', text: 'REGISTRATION PROCEDURE' },
            { type: 'content', text: `Registration can be done using photocopy of the form. Filled-in form should be sent by email.\n\nParticipant Limit: ${event.registrationProcedure.participantLimit || '60'}\nSelection: First come first served basis\n\nCertificates will be issued to participants who attend the course in full.` }
          );
        }
        
        // Payment info - only if explicitly enabled
        if (isPaymentDetailsEnabled) {
          console.log('Adding payment content');
          // Get registration fee from event income sources
          let registrationFee = '₹ 2,500/-'; // Default fallback
          
          // Check both possible field names for income sources
          const incomeSources = event.incomeSource || event.budgetBreakdown?.income || [];
          console.log('Income sources:', incomeSources);
          
          if (incomeSources && incomeSources.length > 0) {
            // Find the first income source that has participant fee information
            const feeSource = incomeSources.find(source => 
              (source.perParticipant && source.perParticipant > 0) ||
              (source.perParticipantAmount && source.perParticipantAmount > 0)
            );
            
            if (feeSource) {
              const amount = feeSource.perParticipant || feeSource.perParticipantAmount;
              registrationFee = `₹ ${amount}/-`;
              
             /* // Add GST information if available
              const gstPercentage = feeSource.gstPercentage;
              if (gstPercentage && gstPercentage > 0) {
                const gstAmount = (amount * gstPercentage) / 100;
                const totalWithGst = amount + gstAmount;
                registrationFee = `₹ ${amount}/- + GST (${gstPercentage}%) = ₹ ${totalWithGst.toFixed(0)}/-`;
              }*/
            }
          }
          
          paymentContent.push(
            { type: 'header', text: 'PAYMENT DETAILS' },
            { type: 'content', text: `Registration Fee: ${registrationFee}\n\nAccount Name: DIRECTOR, CSRC\nAccount No: 37614464781\nIFSC Code: SBIN0006463\nBank: State Bank of India\nBranch: Anna University` }
          );
        }
        
        if (regContent.length > 0 && paymentContent.length > 0) {
          addTwoColumnSection(regContent, paymentContent);
        } else if (regContent.length > 0) {
          addTwoColumnSection(regContent, []);
        } else if (paymentContent.length > 0) {
          addTwoColumnSection([], paymentContent);
        }
      } else {
        console.log('NOT showing registration/payment section - conditions not met');
      }
      console.log('=== END REGISTRATION & PAYMENT DEBUG ===');
      
      // Organizing Committee - Compact Three-Column Layout
      currentY += 4;
      addSectionHeader('ORGANIZING COMMITTEE', 9);
      
      // Get HOD information from User model via API
      let hodInfo = 'Dr. V. Mary Anita Rajam\nProfessor and Head, Department of CSE'; // Default fallback
      
      // Debug logging to see what data is available
      console.log('Event data for HOD lookup:', {
        organizingDepartments: event.organizingDepartments,
        coordinators: event.coordinators,
        eventKeys: Object.keys(event)
      });
      
      // Try to fetch HOD from User model first
      try {
        console.log('Fetching HOD from User model...');
        const hodResponse = await usersAPI.getActiveHOD();
        if (hodResponse && hodResponse.name) {
          console.log('Found HOD in User model:', hodResponse);
          hodInfo = `${hodResponse.name}\n${hodResponse.designation || 'Professor and Head, Department of CSE'}`;
        } else {
          console.log('No active HOD found in User model');
        }
      } catch (error) {
        console.log('Error fetching HOD from User model:', error);
        
        // Fallback to event data if API call fails
        // Try to get HOD from organizing departments
        if (event.organizingDepartments?.hod) {
          console.log('Found HOD in organizingDepartments:', event.organizingDepartments.hod);
          const hod = event.organizingDepartments.hod;
          hodInfo = `${hod.name}\n${hod.designation || 'Professor and Head, Department of CSE'}`;
        } 
        // Try to get HOD from coordinators (look for someone with HOD designation)
        else if (event.coordinators && event.coordinators.length > 0) {
          console.log('Searching coordinators for HOD:', event.coordinators);
          const hodCoordinator = event.coordinators.find(coord => 
            coord.designation && (
              coord.designation.toLowerCase().includes('head') || 
              coord.designation.toLowerCase().includes('hod') ||
              coord.designation.toLowerCase().includes('professor and head')
            )
          );
          
          if (hodCoordinator) {
            console.log('Found HOD in coordinators:', hodCoordinator);
            hodInfo = `${hodCoordinator.name}\n${hodCoordinator.designation}`;
          } else {
            console.log('No HOD found in coordinators');
          }
        }
      }
      
      console.log('Final HOD info:', hodInfo);
      
      // Split committee information into three columns for better space utilization
      const committeeLeft = [
        { type: 'header', text: 'UNIVERSITY HIERARCHY' },
        { type: 'content', text: `Chief Patron:\nDr. R. Velraj\nVice-Chancellor, Anna University\n\nPatron:\nDr. J. Kumar\nRegistrar, Anna University` }
      ];
      
      const committeeCenter = [
        { type: 'header', text: 'LEADERSHIP' },
        { type: 'content', text: `Dean:\nDr. S. Raghavan\nDean, College of Engineering, Guindy\n\nConvenor:\n${hodInfo}` }
      ];
      
      const coordinatorsText = event.coordinators && event.coordinators.length > 0 
        ? event.coordinators.map((coord, index) => `${index + 1}. ${coord.name}\n   ${coord.designation || 'Associate Professor/CSE'}`).join('\n\n')
        : `1. Dr. Dejey\n   Associate Professor/CSE\n\n2. Dr. P. Mohamed Fathimal\n   Assistant Professor/CSE`;
      
      const committeeRight = [
        { type: 'header', text: 'COORDINATORS' },
        { type: 'content', text: coordinatorsText + '\n\nCEG, Anna University, Chennai' }
      ];
      
      addThreeColumnSection(committeeLeft, committeeCenter, committeeRight);
      
      // Contact Information - Compact Three-Column Layout
      currentY += 4;
      addSectionHeader('CONTACT INFORMATION', 9);
      
      const contactLeft = [
        { type: 'header', text: 'UNIVERSITY ADDRESS' },
        { type: 'content', text: `Anna University\nSardar Patel Road, Guindy\nChennai - 600 025\nTamil Nadu, India\n\nPhone: +91-44-2235 8661\nEmail: info@annauniv.edu\nWebsite: www.annauniv.edu` }
      ];
      
      const contactCenter = [
        { type: 'header', text: 'DEPARTMENT CONTACT' },
        { type: 'content', text: `Department of Computer Science and Engineering\nCollege of Engineering, Guindy\nAnna University\nChennai – 600 025\n\nPhone: 044-22358802\nFax: 044-22350397` }
      ];
      
      const contactRight = [
        { type: 'header', text: 'COURSE COORDINATORS' },
        { type: 'content', text: `Mobile: 9442063892\nMobile: 9943897935\n\nE-mail:\n${event.coordinatorEmail || 'eventsindcseau@gmail.com'}\n\nFor queries contact:\nDepartment Office` }
      ];
      
      addThreeColumnSection(contactLeft, contactCenter, contactRight);
      
      // Add registration form on second page if enabled
      if (event.registrationProcedure && event.registrationProcedure.enabled === true && event.registrationProcedure.registrationForm && event.registrationProcedure.registrationForm.enabled === true) {
        doc.addPage();
        currentY = margin;
        
        // Compact header for registration form page
        doc.setFillColor(41, 98, 255);
        doc.rect(0, 0, pageWidth, 25, 'F');
        
        if (logoBase64) {
          try {
            doc.addImage(logoBase64, 'JPEG', 15, 3, 19, 19);
          } catch (error) {
            console.log('Error adding logo to PDF:', error);
          }
        }
        
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('REGISTRATION FORM', pageWidth / 2, 15, { align: 'center' });
        
        doc.setTextColor(0, 0, 0);
        currentY = 35;
        
        // Form title
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        addWrappedText(`REGISTRATION FORM FOR ${event.type.toUpperCase()}`, margin, currentY, contentWidth, 16, 'bold', 'center');
        currentY += 4;
        
        doc.setFontSize(14);
        doc.setFont('helvetica', 'normal');
        addWrappedText(`"${event.title}"`, margin, currentY, contentWidth, 14, 'normal', 'center');
        currentY += 8;
        
        // Two-column form layout for landscape
        const formColWidth = (contentWidth - 16) / 2;
        const formLeftX = margin;
        const formRightX = margin + formColWidth + 16;
        
        // Form fields in two columns
        const fieldHeight = 12;
        let leftY = currentY;
        let rightY = currentY;
        
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        
        // Left column fields
        doc.text('Name:', formLeftX, leftY);
        doc.line(formLeftX + 25, leftY + 1, formLeftX + formColWidth, leftY + 1);
        leftY += fieldHeight;
        
        doc.text('Age & DOB:', formLeftX, leftY);
        doc.line(formLeftX + 35, leftY + 1, formLeftX + formColWidth, leftY + 1);
        leftY += fieldHeight;
        
        doc.text('Qualification:', formLeftX, leftY);
        doc.line(formLeftX + 40, leftY + 1, formLeftX + formColWidth, leftY + 1);
        leftY += fieldHeight;
        
        doc.text('Institution:', formLeftX, leftY);
        doc.line(formLeftX + 35, leftY + 1, formLeftX + formColWidth, leftY + 1);
        leftY += fieldHeight;
        
        doc.text('Address:', formLeftX, leftY);
        doc.line(formLeftX + 30, leftY + 1, formLeftX + formColWidth, leftY + 1);
        leftY += 8;
        doc.line(formLeftX, leftY + 1, formLeftX + formColWidth, leftY + 1);
        leftY += 8;
        doc.line(formLeftX, leftY + 1, formLeftX + formColWidth, leftY + 1);
        leftY += fieldHeight;
        
        // Right column fields
        doc.text('Email:', formRightX, rightY);
        doc.line(formRightX + 25, rightY + 1, formRightX + formColWidth, rightY + 1);
        rightY += fieldHeight;
        
        doc.text('Mobile No.:', formRightX, rightY);
        doc.line(formRightX + 35, rightY + 1, formRightX + formColWidth, rightY + 1);
        rightY += fieldHeight;
        
        doc.text('Organization:', formRightX, rightY);
        doc.line(formRightX + 40, rightY + 1, formRightX + formColWidth, rightY + 1);
        rightY += fieldHeight;
        
        doc.text('Designation:', formRightX, rightY);
        doc.line(formRightX + 40, rightY + 1, formRightX + formColWidth, rightY + 1);
        rightY += fieldHeight;
        
        doc.text('Experience:', formRightX, rightY);
        doc.line(formRightX + 35, rightY + 1, formRightX + formColWidth, rightY + 1);
        rightY += fieldHeight;
        
        currentY = Math.max(leftY, rightY) + 8;
        
        // Declaration section
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        addWrappedText('DECLARATION', margin, currentY, contentWidth, 11, 'bold');
        currentY += 4;
        
        const declarationText = `The information provided by me is true to the best of my knowledge. I agree to abide by the rules and regulations governing the ${event.type}. If selected, I shall attend the course for the entire duration. I also undertake the responsibility to inform the coordinators in advance if in case I am unable to attend the course.`;
        
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        addWrappedText(declarationText, margin, currentY, contentWidth, 9);
        currentY += 8;
        
        // Signature section in two columns
        const sigLeftX = margin;
        const sigRightX = margin + (contentWidth / 2) + 8;
        
        doc.setFontSize(10);
        doc.text('Date:', sigLeftX, currentY);
        doc.line(sigLeftX + 25, currentY + 1, sigLeftX + 100, currentY + 1);
        
        doc.text('Place:', sigLeftX, currentY + 15);
        doc.line(sigLeftX + 25, currentY + 16, sigLeftX + 100, currentY + 16);
        
        doc.text('Signature of the Applicant:', sigRightX, currentY);
        doc.line(sigRightX, currentY + 15, sigRightX + 120, currentY + 15);
        
        currentY += 25;
        
        // Note
        doc.setFontSize(8);
        doc.setFont('helvetica', 'italic');
        addWrappedText('Note: Applicant may use printout or photocopy of the above format/page', margin, currentY, contentWidth, 8, 'italic', 'center');
      }
    };

    // Enhanced footer with modern design
    const addFooter = (pageNum) => {
      const footerY = pageHeight - 25;
      
      // Modern gradient footer
      addGradientBackground(0, footerY, pageWidth, 25, colors.gradient2, colors.gradient1);
      
      // Add decorative elements
      doc.setFillColor(255, 255, 255, 0.1);
      doc.circle(20, footerY + 12, 8, 'F');
      doc.circle(pageWidth - 20, footerY + 12, 6, 'F');
      
      // Add logo in footer
      if (logoBase64) {
        try {
          doc.addImage(logoBase64, 'JPEG', 15, footerY + 3, 18, 18);
        } catch (error) {
          console.log('Error adding footer logo:', error);
        }
      }
      
      // Footer content with better typography
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text('ANNA UNIVERSITY', pageWidth / 2, footerY + 8, { align: 'center' });
      
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.text('For more information, visit: www.annauniv.edu', pageWidth / 2, footerY + 14, { align: 'center' });
      
      doc.setFontSize(7);
      doc.text('Email: info@annauniv.edu | Phone: +91-44-2235-7120', pageWidth / 2, footerY + 18, { align: 'center' });
      doc.text(`Event Contact: ${event.coordinatorEmail || 'eventsindcseau@gmail.com'}`, pageWidth / 2, footerY + 22, { align: 'center' });
      
      // Add page number with modern styling
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.text(`Page ${pageNum}`, pageWidth - 25, footerY + 12);
    };

    // Generate optimized landscape layout - single page with all content
    await createOptimizedLandscapePage();

    // Add footers to all pages except the first page
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 2; i <= pageCount; i++) {
      doc.setPage(i);
      addFooter(i);
    }

    return doc;

  } catch (error) {
    console.error('Error generating brochure:', error);
    throw error;
  }
};