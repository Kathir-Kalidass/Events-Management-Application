import jsPDF from 'jspdf';

/**
 * Advanced Brochure Generator with Landscape Mode and Adjustable Components
 * Features:
 * - Portrait and Landscape orientations
 * - Customizable layouts and sections
 * - Advanced styling options
 * - Multiple templates
 * - Responsive content adjustment
 */

// Default configuration
const DEFAULT_CONFIG = {
  orientation: 'portrait', // 'portrait' or 'landscape'
  template: 'modern', // 'modern', 'classic', 'minimal', 'academic'
  colorScheme: 'anna-university', // 'anna-university', 'blue', 'green', 'purple', 'custom'
  includeImages: true,
  includeBranding: true,
  fontSize: 'medium', // 'small', 'medium', 'large'
  sections: {
    header: true,
    eventDetails: true,
    description: true,
    objectives: true,
    outcomes: true,
    coordinators: true,
    organizingCommittee: true,
    registrationInfo: true,
    paymentDetails: true,
    schedule: true,
    venue: true,
    contact: true,
    footer: true
  },
  customSections: [],
  margins: {
    top: 20,
    bottom: 20,
    left: 20,
    right: 20
  }
};

// Color schemes
const COLOR_SCHEMES = {
  'anna-university': {
    primary: [25, 118, 210], // Anna University Blue
    secondary: [66, 165, 245],
    accent: [255, 193, 7],
    text: [33, 33, 33],
    lightText: [117, 117, 117],
    background: [248, 249, 250],
    white: [255, 255, 255]
  },
  'blue': {
    primary: [41, 128, 185],
    secondary: [52, 152, 219],
    accent: [46, 204, 113],
    text: [44, 62, 80],
    lightText: [127, 140, 141],
    background: [236, 240, 241],
    white: [255, 255, 255]
  },
  'green': {
    primary: [39, 174, 96],
    secondary: [46, 204, 113],
    accent: [241, 196, 15],
    text: [44, 62, 80],
    lightText: [127, 140, 141],
    background: [236, 240, 241],
    white: [255, 255, 255]
  },
  'purple': {
    primary: [142, 68, 173],
    secondary: [155, 89, 182],
    accent: [230, 126, 34],
    text: [44, 62, 80],
    lightText: [127, 140, 141],
    background: [236, 240, 241],
    white: [255, 255, 255]
  }
};

// Font sizes
const FONT_SIZES = {
  small: {
    title: 18,
    subtitle: 14,
    heading: 12,
    subheading: 10,
    body: 8,
    caption: 7
  },
  medium: {
    title: 22,
    subtitle: 16,
    heading: 14,
    subheading: 12,
    body: 10,
    caption: 8
  },
  large: {
    title: 26,
    subtitle: 18,
    heading: 16,
    subheading: 14,
    body: 12,
    caption: 10
  }
};

/**
 * Main function to generate advanced brochure
 * @param {Object} event - Event data
 * @param {Object} config - Configuration options
 * @returns {jsPDF} PDF document
 */
export const generateAdvancedBrochure = async (event, config = {}) => {
  try {
    // Merge configuration with defaults
    const finalConfig = { ...DEFAULT_CONFIG, ...config };
    
    // Create PDF document with specified orientation
    const doc = new jsPDF(
      finalConfig.orientation,
      'mm',
      'a4'
    );
    
    // Get page dimensions
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    
    // Get color scheme and font sizes
    const colors = COLOR_SCHEMES[finalConfig.colorScheme] || COLOR_SCHEMES['anna-university'];
    const fonts = FONT_SIZES[finalConfig.fontSize];
    
    // Create brochure context
    const context = {
      doc,
      event,
      config: finalConfig,
      pageWidth,
      pageHeight,
      colors,
      fonts,
      currentY: finalConfig.margins.top,
      pageNumber: 1
    };
    
    // Generate brochure based on template
    switch (finalConfig.template) {
      case 'modern':
        await generateModernTemplate(context);
        break;
      case 'classic':
        await generateClassicTemplate(context);
        break;
      case 'minimal':
        await generateMinimalTemplate(context);
        break;
      case 'academic':
        await generateAcademicTemplate(context);
        break;
      default:
        await generateModernTemplate(context);
    }
    
    return doc;
    
  } catch (error) {
    console.error('Error generating advanced brochure:', error);
    throw error;
  }
};

/**
 * Modern template with clean design and professional layout
 */
async function generateModernTemplate(context) {
  const { doc, config, pageWidth, pageHeight, colors, fonts } = context;
  
  if (config.orientation === 'landscape') {
    await generateModernLandscape(context);
  } else {
    await generateModernPortrait(context);
  }
}

/**
 * Modern Portrait Layout
 */
async function generateModernPortrait(context) {
  const { doc, event, config, pageWidth, pageHeight, colors, fonts } = context;
  let currentY = config.margins.top;
  
  // Header Section
  if (config.sections.header) {
    currentY = addModernHeader(context, currentY);
  }
  
  // Two-column layout for portrait
  const columnWidth = (pageWidth - config.margins.left - config.margins.right - 10) / 2;
  const leftColumnX = config.margins.left;
  const rightColumnX = config.margins.left + columnWidth + 10;
  
  let leftColumnY = currentY;
  let rightColumnY = currentY;
  
  // Left Column
  if (config.sections.eventDetails) {
    leftColumnY = addEventDetailsCard(context, leftColumnX, leftColumnY, columnWidth);
  }
  
  if (config.sections.description && event.description) {
    leftColumnY = addDescriptionCard(context, leftColumnX, leftColumnY, columnWidth);
  }
  
  if (config.sections.objectives && event.objectives) {
    leftColumnY = addObjectivesCard(context, leftColumnX, leftColumnY, columnWidth);
  }
  
  if (config.sections.registrationInfo) {
    leftColumnY = addRegistrationCard(context, leftColumnX, leftColumnY, columnWidth);
  }
  
  // Right Column
  if (config.sections.coordinators && event.coordinators) {
    rightColumnY = addCoordinatorsCard(context, rightColumnX, rightColumnY, columnWidth);
  }
  
  if (config.sections.organizingCommittee && event.organizingCommittee) {
    rightColumnY = addOrganizingCommitteeCard(context, rightColumnX, rightColumnY, columnWidth);
  }
  
  if (config.sections.schedule && event.schedule) {
    rightColumnY = addScheduleCard(context, rightColumnX, rightColumnY, columnWidth);
  }
  
  if (config.sections.venue) {
    rightColumnY = addVenueCard(context, rightColumnX, rightColumnY, columnWidth);
  }
  
  // Full width sections
  currentY = Math.max(leftColumnY, rightColumnY) + 10;
  
  if (config.sections.paymentDetails && event.registrationProcedure?.paymentDetails?.enabled) {
    currentY = addPaymentDetailsCard(context, config.margins.left, currentY, pageWidth - config.margins.left - config.margins.right);
  }
  
  // Custom sections
  for (const customSection of config.customSections) {
    currentY = addCustomSection(context, config.margins.left, currentY, pageWidth - config.margins.left - config.margins.right, customSection);
  }
  
  // Footer
  if (config.sections.footer) {
    addModernFooter(context);
  }
}

/**
 * Modern Landscape Layout
 */
async function generateModernLandscape(context) {
  const { doc, event, config, pageWidth, pageHeight, colors, fonts } = context;
  let currentY = config.margins.top;
  
  // Header Section
  if (config.sections.header) {
    currentY = addModernHeaderLandscape(context, currentY);
  }
  
  // Three-column layout for landscape
  const columnWidth = (pageWidth - config.margins.left - config.margins.right - 20) / 3;
  const leftColumnX = config.margins.left;
  const centerColumnX = config.margins.left + columnWidth + 10;
  const rightColumnX = config.margins.left + (columnWidth * 2) + 20;
  
  let leftColumnY = currentY;
  let centerColumnY = currentY;
  let rightColumnY = currentY;
  
  // Left Column
  if (config.sections.eventDetails) {
    leftColumnY = addEventDetailsCard(context, leftColumnX, leftColumnY, columnWidth);
  }
  
  if (config.sections.description && event.description) {
    leftColumnY = addDescriptionCard(context, leftColumnX, leftColumnY, columnWidth);
  }
  
  if (config.sections.objectives && event.objectives) {
    leftColumnY = addObjectivesCard(context, leftColumnX, leftColumnY, columnWidth);
  }
  
  // Center Column
  if (config.sections.coordinators && event.coordinators) {
    centerColumnY = addCoordinatorsCard(context, centerColumnX, centerColumnY, columnWidth);
  }
  
  if (config.sections.organizingCommittee && event.organizingCommittee) {
    centerColumnY = addOrganizingCommitteeCard(context, centerColumnX, centerColumnY, columnWidth);
  }
  
  if (config.sections.schedule && event.schedule) {
    centerColumnY = addScheduleCard(context, centerColumnX, centerColumnY, columnWidth);
  }
  
  // Right Column
  if (config.sections.registrationInfo) {
    rightColumnY = addRegistrationCard(context, rightColumnX, rightColumnY, columnWidth);
  }
  
  if (config.sections.venue) {
    rightColumnY = addVenueCard(context, rightColumnX, rightColumnY, columnWidth);
  }
  
  if (config.sections.contact) {
    rightColumnY = addContactCard(context, rightColumnX, rightColumnY, columnWidth);
  }
  
  // Full width sections at bottom
  currentY = Math.max(leftColumnY, centerColumnY, rightColumnY) + 10;
  
  if (config.sections.paymentDetails && event.registrationProcedure?.paymentDetails?.enabled) {
    currentY = addPaymentDetailsCard(context, config.margins.left, currentY, pageWidth - config.margins.left - config.margins.right);
  }
  
  // Footer
  if (config.sections.footer) {
    addModernFooter(context);
  }
}

/**
 * Add modern header for portrait mode
 */
function addModernHeader(context, startY) {
  const { doc, event, pageWidth, colors, fonts, config } = context;
  
  // Header background with gradient effect
  doc.setFillColor(colors.primary[0], colors.primary[1], colors.primary[2]);
  doc.rect(0, 0, pageWidth, 60, 'F');
  
  // Add subtle gradient effect
  doc.setFillColor(colors.secondary[0], colors.secondary[1], colors.secondary[2]);
  doc.rect(0, 50, pageWidth, 10, 'F');
  
  // University logos (placeholder positions)
  if (config.includeBranding) {
    // Anna University logo position
    doc.setFillColor(colors.white[0], colors.white[1], colors.white[2]);
    doc.circle(30, 30, 15, 'F');
    doc.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text('AU', 30, 32, { align: 'center' });
    
    // CEG logo position
    doc.setFillColor(colors.white[0], colors.white[1], colors.white[2]);
    doc.circle(pageWidth - 30, 30, 15, 'F');
    doc.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
    doc.text('CEG', pageWidth - 30, 32, { align: 'center' });
  }
  
  // University name
  doc.setTextColor(colors.white[0], colors.white[1], colors.white[2]);
  doc.setFontSize(fonts.subtitle);
  doc.setFont('helvetica', 'bold');
  doc.text('ANNA UNIVERSITY', pageWidth / 2, 20, { align: 'center' });
  
  // Department name
  doc.setFontSize(fonts.subheading);
  doc.setFont('helvetica', 'normal');
  doc.text('Department of Computer Science and Engineering', pageWidth / 2, 30, { align: 'center' });
  
  // Event title
  doc.setFontSize(fonts.heading);
  doc.setFont('helvetica', 'bold');
  const eventTitle = event.title || 'Event Title';
  doc.text(eventTitle.toUpperCase(), pageWidth / 2, 45, { align: 'center' });
  
  return 70;
}

/**
 * Add modern header for landscape mode
 */
function addModernHeaderLandscape(context, startY) {
  const { doc, event, pageWidth, colors, fonts, config } = context;
  
  // Header background
  doc.setFillColor(colors.primary[0], colors.primary[1], colors.primary[2]);
  doc.rect(0, 0, pageWidth, 50, 'F');
  
  // Add accent stripe
  doc.setFillColor(colors.accent[0], colors.accent[1], colors.accent[2]);
  doc.rect(0, 45, pageWidth, 5, 'F');
  
  // Left side - University info
  if (config.includeBranding) {
    doc.setFillColor(colors.white[0], colors.white[1], colors.white[2]);
    doc.circle(25, 25, 12, 'F');
    doc.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.text('AU', 25, 27, { align: 'center' });
  }
  
  doc.setTextColor(colors.white[0], colors.white[1], colors.white[2]);
  doc.setFontSize(fonts.subheading);
  doc.setFont('helvetica', 'bold');
  doc.text('ANNA UNIVERSITY', 45, 20);
  doc.setFontSize(fonts.body);
  doc.setFont('helvetica', 'normal');
  doc.text('Department of Computer Science and Engineering', 45, 30);
  
  // Center - Event title
  doc.setFontSize(fonts.title);
  doc.setFont('helvetica', 'bold');
  const eventTitle = event.title || 'Event Title';
  doc.text(eventTitle.toUpperCase(), pageWidth / 2, 25, { align: 'center' });
  
  // Right side - CEG logo
  if (config.includeBranding) {
    doc.setFillColor(colors.white[0], colors.white[1], colors.white[2]);
    doc.circle(pageWidth - 25, 25, 12, 'F');
    doc.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.text('CEG', pageWidth - 25, 27, { align: 'center' });
  }
  
  return 60;
}

/**
 * Add event details card
 */
function addEventDetailsCard(context, x, y, width) {
  const { doc, event, colors, fonts } = context;
  
  const cardHeight = 50;
  
  // Card background
  doc.setFillColor(colors.white[0], colors.white[1], colors.white[2]);
  doc.roundedRect(x, y, width, cardHeight, 3, 3, 'F');
  
  // Card border
  doc.setDrawColor(colors.primary[0], colors.primary[1], colors.primary[2]);
  doc.setLineWidth(0.5);
  doc.roundedRect(x, y, width, cardHeight, 3, 3, 'S');
  
  // Card header
  doc.setFillColor(colors.primary[0], colors.primary[1], colors.primary[2]);
  doc.roundedRect(x, y, width, 8, 3, 3, 'F');
  doc.rect(x, y + 5, width, 3, 'F');
  
  doc.setTextColor(colors.white[0], colors.white[1], colors.white[2]);
  doc.setFontSize(fonts.subheading);
  doc.setFont('helvetica', 'bold');
  doc.text('EVENT DETAILS', x + 3, y + 6);
  
  // Card content
  doc.setTextColor(colors.text[0], colors.text[1], colors.text[2]);
  doc.setFontSize(fonts.body);
  doc.setFont('helvetica', 'normal');
  
  let contentY = y + 15;
  const lineHeight = 4;
  
  // Event details
  const details = getEventDetailsText(event);
  const lines = doc.splitTextToSize(details, width - 6);
  
  lines.forEach((line, index) => {
    if (contentY < y + cardHeight - 3) {
      doc.text(line, x + 3, contentY);
      contentY += lineHeight;
    }
  });
  
  return y + cardHeight + 5;
}

/**
 * Add description card
 */
function addDescriptionCard(context, x, y, width) {
  const { doc, event, colors, fonts } = context;
  
  const cardHeight = 40;
  
  // Card background
  doc.setFillColor(colors.background[0], colors.background[1], colors.background[2]);
  doc.roundedRect(x, y, width, cardHeight, 3, 3, 'F');
  
  // Card header
  doc.setFillColor(colors.secondary[0], colors.secondary[1], colors.secondary[2]);
  doc.roundedRect(x, y, width, 8, 3, 3, 'F');
  doc.rect(x, y + 5, width, 3, 'F');
  
  doc.setTextColor(colors.white[0], colors.white[1], colors.white[2]);
  doc.setFontSize(fonts.subheading);
  doc.setFont('helvetica', 'bold');
  doc.text('DESCRIPTION', x + 3, y + 6);
  
  // Card content
  doc.setTextColor(colors.text[0], colors.text[1], colors.text[2]);
  doc.setFontSize(fonts.body);
  doc.setFont('helvetica', 'normal');
  
  const description = event.description || event.objectives || 'Event description will be updated soon.';
  const lines = doc.splitTextToSize(description, width - 6);
  
  let contentY = y + 15;
  lines.forEach((line, index) => {
    if (contentY < y + cardHeight - 3) {
      doc.text(line, x + 3, contentY);
      contentY += 4;
    }
  });
  
  return y + cardHeight + 5;
}

/**
 * Add objectives card
 */
function addObjectivesCard(context, x, y, width) {
  const { doc, event, colors, fonts } = context;
  
  const cardHeight = 35;
  
  // Card background
  doc.setFillColor(colors.white[0], colors.white[1], colors.white[2]);
  doc.roundedRect(x, y, width, cardHeight, 3, 3, 'F');
  
  // Card border
  doc.setDrawColor(colors.accent[0], colors.accent[1], colors.accent[2]);
  doc.setLineWidth(0.5);
  doc.roundedRect(x, y, width, cardHeight, 3, 3, 'S');
  
  // Card header
  doc.setFillColor(colors.accent[0], colors.accent[1], colors.accent[2]);
  doc.roundedRect(x, y, width, 8, 3, 3, 'F');
  doc.rect(x, y + 5, width, 3, 'F');
  
  doc.setTextColor(colors.white[0], colors.white[1], colors.white[2]);
  doc.setFontSize(fonts.subheading);
  doc.setFont('helvetica', 'bold');
  doc.text('OBJECTIVES', x + 3, y + 6);
  
  // Card content
  doc.setTextColor(colors.text[0], colors.text[1], colors.text[2]);
  doc.setFontSize(fonts.body);
  doc.setFont('helvetica', 'normal');
  
  const objectives = event.objectives || 'Objectives will be updated soon.';
  const lines = doc.splitTextToSize(objectives, width - 6);
  
  let contentY = y + 15;
  lines.forEach((line, index) => {
    if (contentY < y + cardHeight - 3) {
      doc.text(line, x + 3, contentY);
      contentY += 4;
    }
  });
  
  return y + cardHeight + 5;
}

/**
 * Add coordinators card
 */
function addCoordinatorsCard(context, x, y, width) {
  const { doc, event, colors, fonts } = context;
  
  const coordinators = event.coordinators || [];
  const cardHeight = Math.max(40, coordinators.length * 12 + 20);
  
  // Card background
  doc.setFillColor(colors.white[0], colors.white[1], colors.white[2]);
  doc.roundedRect(x, y, width, cardHeight, 3, 3, 'F');
  
  // Card border
  doc.setDrawColor(colors.primary[0], colors.primary[1], colors.primary[2]);
  doc.setLineWidth(0.5);
  doc.roundedRect(x, y, width, cardHeight, 3, 3, 'S');
  
  // Card header
  doc.setFillColor(colors.primary[0], colors.primary[1], colors.primary[2]);
  doc.roundedRect(x, y, width, 8, 3, 3, 'F');
  doc.rect(x, y + 5, width, 3, 'F');
  
  doc.setTextColor(colors.white[0], colors.white[1], colors.white[2]);
  doc.setFontSize(fonts.subheading);
  doc.setFont('helvetica', 'bold');
  doc.text('COORDINATORS', x + 3, y + 6);
  
  // Card content
  doc.setTextColor(colors.text[0], colors.text[1], colors.text[2]);
  doc.setFontSize(fonts.body);
  doc.setFont('helvetica', 'normal');
  
  let contentY = y + 15;
  
  coordinators.forEach((coordinator, index) => {
    if (contentY < y + cardHeight - 8) {
      // Coordinator name
      doc.setFont('helvetica', 'bold');
      doc.text(`${index + 1}. ${coordinator.name}`, x + 3, contentY);
      contentY += 4;
      
      // Coordinator details
      doc.setFont('helvetica', 'normal');
      if (coordinator.designation) {
        doc.text(`   ${coordinator.designation}`, x + 3, contentY);
        contentY += 3;
      }
      if (coordinator.department) {
        doc.text(`   ${coordinator.department}`, x + 3, contentY);
        contentY += 3;
      }
      contentY += 2;
    }
  });
  
  return y + cardHeight + 5;
}

/**
 * Add organizing committee card
 */
function addOrganizingCommitteeCard(context, x, y, width) {
  const { doc, event, colors, fonts } = context;
  
  const committee = event.organizingCommittee || [];
  const cardHeight = Math.max(35, committee.length * 8 + 20);
  
  // Card background
  doc.setFillColor(colors.background[0], colors.background[1], colors.background[2]);
  doc.roundedRect(x, y, width, cardHeight, 3, 3, 'F');
  
  // Card header
  doc.setFillColor(colors.secondary[0], colors.secondary[1], colors.secondary[2]);
  doc.roundedRect(x, y, width, 8, 3, 3, 'F');
  doc.rect(x, y + 5, width, 3, 'F');
  
  doc.setTextColor(colors.white[0], colors.white[1], colors.white[2]);
  doc.setFontSize(fonts.subheading);
  doc.setFont('helvetica', 'bold');
  doc.text('ORGANIZING COMMITTEE', x + 3, y + 6);
  
  // Card content
  doc.setTextColor(colors.text[0], colors.text[1], colors.text[2]);
  doc.setFontSize(fonts.body);
  doc.setFont('helvetica', 'normal');
  
  let contentY = y + 15;
  
  if (committee.length > 0) {
    committee.forEach((member, index) => {
      if (contentY < y + cardHeight - 3) {
        doc.text(`• ${member.name} - ${member.role}`, x + 3, contentY);
        contentY += 4;
      }
    });
  } else {
    doc.text('Organizing committee details will be updated soon.', x + 3, contentY);
  }
  
  return y + cardHeight + 5;
}

/**
 * Add registration card
 */
function addRegistrationCard(context, x, y, width) {
  const { doc, event, colors, fonts } = context;
  
  const cardHeight = 45;
  
  // Card background
  doc.setFillColor(colors.white[0], colors.white[1], colors.white[2]);
  doc.roundedRect(x, y, width, cardHeight, 3, 3, 'F');
  
  // Card border
  doc.setDrawColor(colors.accent[0], colors.accent[1], colors.accent[2]);
  doc.setLineWidth(0.5);
  doc.roundedRect(x, y, width, cardHeight, 3, 3, 'S');
  
  // Card header
  doc.setFillColor(colors.accent[0], colors.accent[1], colors.accent[2]);
  doc.roundedRect(x, y, width, 8, 3, 3, 'F');
  doc.rect(x, y + 5, width, 3, 'F');
  
  doc.setTextColor(colors.white[0], colors.white[1], colors.white[2]);
  doc.setFontSize(fonts.subheading);
  doc.setFont('helvetica', 'bold');
  doc.text('REGISTRATION', x + 3, y + 6);
  
  // Card content
  doc.setTextColor(colors.text[0], colors.text[1], colors.text[2]);
  doc.setFontSize(fonts.body);
  doc.setFont('helvetica', 'normal');
  
  let contentY = y + 15;
  
  const registrationInfo = getRegistrationInfo(event);
  const lines = doc.splitTextToSize(registrationInfo, width - 6);
  
  lines.forEach((line, index) => {
    if (contentY < y + cardHeight - 3) {
      doc.text(line, x + 3, contentY);
      contentY += 4;
    }
  });
  
  return y + cardHeight + 5;
}

/**
 * Add schedule card
 */
function addScheduleCard(context, x, y, width) {
  const { doc, event, colors, fonts } = context;
  
  const schedule = event.schedule || [];
  const cardHeight = Math.max(35, schedule.length * 6 + 20);
  
  // Card background
  doc.setFillColor(colors.white[0], colors.white[1], colors.white[2]);
  doc.roundedRect(x, y, width, cardHeight, 3, 3, 'F');
  
  // Card border
  doc.setDrawColor(colors.secondary[0], colors.secondary[1], colors.secondary[2]);
  doc.setLineWidth(0.5);
  doc.roundedRect(x, y, width, cardHeight, 3, 3, 'S');
  
  // Card header
  doc.setFillColor(colors.secondary[0], colors.secondary[1], colors.secondary[2]);
  doc.roundedRect(x, y, width, 8, 3, 3, 'F');
  doc.rect(x, y + 5, width, 3, 'F');
  
  doc.setTextColor(colors.white[0], colors.white[1], colors.white[2]);
  doc.setFontSize(fonts.subheading);
  doc.setFont('helvetica', 'bold');
  doc.text('SCHEDULE', x + 3, y + 6);
  
  // Card content
  doc.setTextColor(colors.text[0], colors.text[1], colors.text[2]);
  doc.setFontSize(fonts.body);
  doc.setFont('helvetica', 'normal');
  
  let contentY = y + 15;
  
  if (schedule.length > 0) {
    schedule.forEach((item, index) => {
      if (contentY < y + cardHeight - 3) {
        doc.text(`${item.time} - ${item.activity}`, x + 3, contentY);
        contentY += 4;
      }
    });
  } else {
    doc.text('Schedule will be updated soon.', x + 3, contentY);
  }
  
  return y + cardHeight + 5;
}

/**
 * Add venue card
 */
function addVenueCard(context, x, y, width) {
  const { doc, event, colors, fonts } = context;
  
  const cardHeight = 30;
  
  // Card background
  doc.setFillColor(colors.background[0], colors.background[1], colors.background[2]);
  doc.roundedRect(x, y, width, cardHeight, 3, 3, 'F');
  
  // Card header
  doc.setFillColor(colors.primary[0], colors.primary[1], colors.primary[2]);
  doc.roundedRect(x, y, width, 8, 3, 3, 'F');
  doc.rect(x, y + 5, width, 3, 'F');
  
  doc.setTextColor(colors.white[0], colors.white[1], colors.white[2]);
  doc.setFontSize(fonts.subheading);
  doc.setFont('helvetica', 'bold');
  doc.text('VENUE', x + 3, y + 6);
  
  // Card content
  doc.setTextColor(colors.text[0], colors.text[1], colors.text[2]);
  doc.setFontSize(fonts.body);
  doc.setFont('helvetica', 'normal');
  
  const venueInfo = getVenueInfo(event);
  const lines = doc.splitTextToSize(venueInfo, width - 6);
  
  let contentY = y + 15;
  lines.forEach((line, index) => {
    if (contentY < y + cardHeight - 3) {
      doc.text(line, x + 3, contentY);
      contentY += 4;
    }
  });
  
  return y + cardHeight + 5;
}

/**
 * Add contact card
 */
function addContactCard(context, x, y, width) {
  const { doc, event, colors, fonts } = context;
  
  const cardHeight = 40;
  
  // Card background
  doc.setFillColor(colors.white[0], colors.white[1], colors.white[2]);
  doc.roundedRect(x, y, width, cardHeight, 3, 3, 'F');
  
  // Card border
  doc.setDrawColor(colors.primary[0], colors.primary[1], colors.primary[2]);
  doc.setLineWidth(0.5);
  doc.roundedRect(x, y, width, cardHeight, 3, 3, 'S');
  
  // Card header
  doc.setFillColor(colors.primary[0], colors.primary[1], colors.primary[2]);
  doc.roundedRect(x, y, width, 8, 3, 3, 'F');
  doc.rect(x, y + 5, width, 3, 'F');
  
  doc.setTextColor(colors.white[0], colors.white[1], colors.white[2]);
  doc.setFontSize(fonts.subheading);
  doc.setFont('helvetica', 'bold');
  doc.text('CONTACT', x + 3, y + 6);
  
  // Card content
  doc.setTextColor(colors.text[0], colors.text[1], colors.text[2]);
  doc.setFontSize(fonts.body);
  doc.setFont('helvetica', 'normal');
  
  const contactInfo = getContactInfo(event);
  const lines = doc.splitTextToSize(contactInfo, width - 6);
  
  let contentY = y + 15;
  lines.forEach((line, index) => {
    if (contentY < y + cardHeight - 3) {
      doc.text(line, x + 3, contentY);
      contentY += 4;
    }
  });
  
  return y + cardHeight + 5;
}

/**
 * Add payment details card (full width)
 */
function addPaymentDetailsCard(context, x, y, width) {
  const { doc, event, colors, fonts } = context;
  
  const cardHeight = 35;
  
  // Card background
  doc.setFillColor(colors.white[0], colors.white[1], colors.white[2]);
  doc.roundedRect(x, y, width, cardHeight, 3, 3, 'F');
  
  // Card border
  doc.setDrawColor(colors.accent[0], colors.accent[1], colors.accent[2]);
  doc.setLineWidth(1);
  doc.roundedRect(x, y, width, cardHeight, 3, 3, 'S');
  
  // Card header
  doc.setFillColor(colors.accent[0], colors.accent[1], colors.accent[2]);
  doc.roundedRect(x, y, width, 10, 3, 3, 'F');
  doc.rect(x, y + 7, width, 3, 'F');
  
  doc.setTextColor(colors.white[0], colors.white[1], colors.white[2]);
  doc.setFontSize(fonts.heading);
  doc.setFont('helvetica', 'bold');
  doc.text('PAYMENT DETAILS', x + 5, y + 7);
  
  // Card content
  doc.setTextColor(colors.text[0], colors.text[1], colors.text[2]);
  doc.setFontSize(fonts.body);
  doc.setFont('helvetica', 'normal');
  
  const paymentInfo = getPaymentInfo(event);
  const lines = doc.splitTextToSize(paymentInfo, width - 10);
  
  let contentY = y + 18;
  lines.forEach((line, index) => {
    if (contentY < y + cardHeight - 3) {
      doc.text(line, x + 5, contentY);
      contentY += 4;
    }
  });
  
  return y + cardHeight + 5;
}

/**
 * Add custom section
 */
function addCustomSection(context, x, y, width, customSection) {
  const { doc, colors, fonts } = context;
  
  const cardHeight = customSection.height || 30;
  
  // Card background
  doc.setFillColor(colors.white[0], colors.white[1], colors.white[2]);
  doc.roundedRect(x, y, width, cardHeight, 3, 3, 'F');
  
  // Card border
  doc.setDrawColor(colors.primary[0], colors.primary[1], colors.primary[2]);
  doc.setLineWidth(0.5);
  doc.roundedRect(x, y, width, cardHeight, 3, 3, 'S');
  
  // Card header
  doc.setFillColor(colors.primary[0], colors.primary[1], colors.primary[2]);
  doc.roundedRect(x, y, width, 8, 3, 3, 'F');
  doc.rect(x, y + 5, width, 3, 'F');
  
  doc.setTextColor(colors.white[0], colors.white[1], colors.white[2]);
  doc.setFontSize(fonts.subheading);
  doc.setFont('helvetica', 'bold');
  doc.text(customSection.title.toUpperCase(), x + 3, y + 6);
  
  // Card content
  doc.setTextColor(colors.text[0], colors.text[1], colors.text[2]);
  doc.setFontSize(fonts.body);
  doc.setFont('helvetica', 'normal');
  
  const lines = doc.splitTextToSize(customSection.content, width - 6);
  
  let contentY = y + 15;
  lines.forEach((line, index) => {
    if (contentY < y + cardHeight - 3) {
      doc.text(line, x + 3, contentY);
      contentY += 4;
    }
  });
  
  return y + cardHeight + 5;
}

/**
 * Add modern footer
 */
function addModernFooter(context) {
  const { doc, pageWidth, pageHeight, colors, fonts, config } = context;
  
  const footerHeight = 20;
  const footerY = pageHeight - footerHeight;
  
  // Footer background
  doc.setFillColor(colors.primary[0], colors.primary[1], colors.primary[2]);
  doc.rect(0, footerY, pageWidth, footerHeight, 'F');
  
  // Footer accent
  doc.setFillColor(colors.accent[0], colors.accent[1], colors.accent[2]);
  doc.rect(0, footerY, pageWidth, 3, 'F');
  
  // Footer text
  doc.setTextColor(colors.white[0], colors.white[1], colors.white[2]);
  doc.setFontSize(fonts.caption);
  doc.setFont('helvetica', 'normal');
  
  // Left side
  doc.text('Anna University - Excellence in Education', config.margins.left, footerY + 12);
  
  // Right side
  doc.text('www.annauniv.edu', pageWidth - config.margins.right, footerY + 12, { align: 'right' });
  
  // Center
  doc.text('Department of Computer Science and Engineering', pageWidth / 2, footerY + 12, { align: 'center' });
}

/**
 * Classic template with traditional academic layout
 */
async function generateClassicTemplate(context) {
  // Implementation for classic template
  // Similar structure but with more traditional styling
  await generateModernTemplate(context); // Fallback to modern for now
}

/**
 * Minimal template with clean, simple design
 */
async function generateMinimalTemplate(context) {
  // Implementation for minimal template
  // Simplified layout with minimal styling
  await generateModernTemplate(context); // Fallback to modern for now
}

/**
 * Academic template with formal academic styling
 */
async function generateAcademicTemplate(context) {
  // Implementation for academic template
  // Formal academic layout with traditional elements
  await generateModernTemplate(context); // Fallback to modern for now
}

// Helper functions

function getEventDetailsText(event) {
  const details = [];
  
  if (event.startDate) {
    const startDate = new Date(event.startDate).toLocaleDateString('en-IN');
    const endDate = event.endDate ? new Date(event.endDate).toLocaleDateString('en-IN') : startDate;
    details.push(`📅 Date: ${startDate}${endDate !== startDate ? ' - ' + endDate : ''}`);
  }
  
  if (event.venue) {
    details.push(`📍 Venue: ${event.venue}`);
  }
  
  if (event.type) {
    details.push(`🎯 Type: ${event.type}`);
  }
  
  if (event.mode) {
    details.push(`💻 Mode: ${event.mode}`);
  }
  
  if (event.duration) {
    details.push(`⏱️ Duration: ${event.duration}`);
  }
  
  if (event.targetAudience && event.targetAudience.length > 0) {
    details.push(`👥 Target Audience: ${event.targetAudience.join(', ')}`);
  }
  
  return details.join('\n') || 'Event details will be updated soon.';
}

function getRegistrationInfo(event) {
  const regInfo = [];
  
  if (event.registrationProcedure?.enabled) {
    const reg = event.registrationProcedure;
    
    if (reg.deadline) {
      regInfo.push(`📅 Deadline: ${new Date(reg.deadline).toLocaleDateString('en-IN')}`);
    }
    
    if (reg.participantLimit) {
      regInfo.push(`👥 Limit: ${reg.participantLimit} participants`);
    }
    
    if (reg.submissionMethod) {
      regInfo.push(`📧 Method: ${reg.submissionMethod}`);
    }
    
    if (reg.selectionCriteria) {
      regInfo.push(`✅ Selection: ${reg.selectionCriteria}`);
    }
    
    if (reg.instructions) {
      regInfo.push(`📝 Instructions: ${reg.instructions}`);
    }
  } else {
    regInfo.push('Registration details will be updated soon.');
  }
  
  return regInfo.join('\n');
}

function getVenueInfo(event) {
  const venueInfo = [];
  
  if (event.venue) {
    venueInfo.push(`📍 ${event.venue}`);
  }
  
  venueInfo.push('🏛️ College of Engineering Guindy');
  venueInfo.push('🏫 Anna University, Chennai');
  
  if (event.mode === 'Online') {
    venueInfo.push('💻 Online Platform');
    venueInfo.push('🔗 Link will be shared separately');
  }
  
  return venueInfo.join('\n');
}

function getContactInfo(event) {
  const contact = [];
  
  contact.push('📧 Email: dcse@annauniv.edu');
  contact.push('📞 Phone: +91-44-2235-8000');
  contact.push('🌐 Website: www.annauniv.edu');
  contact.push('📍 Address: College of Engineering Guindy');
  contact.push('   Anna University, Chennai - 600 025');
  
  return contact.join('\n');
}

function getPaymentInfo(event) {
  const paymentInfo = [];
  
  if (event.registrationProcedure?.paymentDetails?.enabled) {
    const payment = event.registrationProcedure.paymentDetails;
    
    paymentInfo.push('💳 PAYMENT DETAILS:');
    paymentInfo.push(`Account Name: ${payment.accountName || 'DIRECTOR, CSRC'}`);
    paymentInfo.push(`Account Number: ${payment.accountNumber || '37614464781'}`);
    paymentInfo.push(`Account Type: ${payment.accountType || 'SAVINGS'}`);
    paymentInfo.push(`Bank: ${payment.bankBranch || 'State Bank of India, Anna University'}`);
    paymentInfo.push(`IFSC Code: ${payment.ifscCode || 'SBIN0006463'}`);
    
    if (payment.additionalPaymentInfo) {
      paymentInfo.push(`Note: ${payment.additionalPaymentInfo}`);
    }
  } else {
    paymentInfo.push('Payment details will be updated if applicable.');
  }
  
  return paymentInfo.join('\n');
}

// Export additional utility functions
export const BrochureTemplates = {
  MODERN: 'modern',
  CLASSIC: 'classic',
  MINIMAL: 'minimal',
  ACADEMIC: 'academic'
};

export const BrochureOrientations = {
  PORTRAIT: 'portrait',
  LANDSCAPE: 'landscape'
};

export const BrochureColorSchemes = {
  ANNA_UNIVERSITY: 'anna-university',
  BLUE: 'blue',
  GREEN: 'green',
  PURPLE: 'purple'
};

export const BrochureFontSizes = {
  SMALL: 'small',
  MEDIUM: 'medium',
  LARGE: 'large'
};

// Preset configurations
export const BrochurePresets = {
  DEFAULT: DEFAULT_CONFIG,
  LANDSCAPE_MODERN: {
    ...DEFAULT_CONFIG,
    orientation: 'landscape',
    template: 'modern'
  },
  MINIMAL_PORTRAIT: {
    ...DEFAULT_CONFIG,
    template: 'minimal',
    fontSize: 'small'
  },
  ACADEMIC_FORMAL: {
    ...DEFAULT_CONFIG,
    template: 'academic',
    colorScheme: 'blue',
    fontSize: 'medium'
  }
};