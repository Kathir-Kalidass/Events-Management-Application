import jsPDF from 'jspdf';

// Clean and simple brochure generator
export const generateEventBrochure = async (event) => {
  try {
    // Create PDF document
    const doc = new jsPDF('portrait', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    
    // Colors
    const primaryColor = [41, 128, 185]; // Blue
    const textColor = [44, 62, 80]; // Dark gray
    const lightGray = [236, 240, 241]; // Light background
    
    // Add header
    addHeader(doc, event, pageWidth, primaryColor);
    
    // Add main content
    addMainContent(doc, event, pageWidth, pageHeight, primaryColor, textColor, lightGray);
    
    // Add footer
    addFooter(doc, pageWidth, pageHeight, primaryColor);
    
    return doc;
    
  } catch (error) {
    console.error('Error generating brochure:', error);
    throw error;
  }
};

// Header section
function addHeader(doc, event, pageWidth, primaryColor) {
  // Header background
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.rect(0, 0, pageWidth, 50, 'F');
  
  // University name
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('ANNA UNIVERSITY', pageWidth / 2, 20, { align: 'center' });
  
  // Event title
  doc.setFontSize(14);
  doc.setFont('helvetica', 'normal');
  const eventTitle = event.title || 'Event Title';
  doc.text(eventTitle.toUpperCase(), pageWidth / 2, 35, { align: 'center' });
}

// Main content section
function addMainContent(doc, event, pageWidth, pageHeight, primaryColor, textColor, lightGray) {
  const startY = 60;
  const margin = 20;
  const contentWidth = pageWidth - (2 * margin);
  
  doc.setTextColor(textColor[0], textColor[1], textColor[2]);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  
  let currentY = startY;
  
  // Event Details Section
  currentY = addSection(doc, 'EVENT DETAILS', getEventDetails(event), margin, currentY, contentWidth, primaryColor, lightGray);
  
  // Description Section
  if (event.description) {
    currentY = addSection(doc, 'DESCRIPTION', event.description, margin, currentY, contentWidth, primaryColor, lightGray);
  }
  
  // Coordinators Section
  if (event.coordinators && event.coordinators.length > 0) {
    const coordinatorText = getCoordinatorText(event.coordinators);
    currentY = addSection(doc, 'COORDINATORS', coordinatorText, margin, currentY, contentWidth, primaryColor, lightGray);
  }
  
  // Contact Section
  currentY = addSection(doc, 'CONTACT INFORMATION', getContactInfo(event), margin, currentY, contentWidth, primaryColor, lightGray);
}

// Add a content section
function addSection(doc, title, content, x, y, width, primaryColor, lightGray) {
  // Section header
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.rect(x, y, width, 8, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text(title, x + 3, y + 6);
  
  // Section content background
  const contentHeight = 25;
  doc.setFillColor(lightGray[0], lightGray[1], lightGray[2]);
  doc.rect(x, y + 8, width, contentHeight, 'F');
  
  // Section content
  doc.setTextColor(44, 62, 80);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  
  const lines = doc.splitTextToSize(content, width - 6);
  let contentY = y + 15;
  
  lines.forEach((line, index) => {
    if (contentY < y + 8 + contentHeight - 3) {
      doc.text(line, x + 3, contentY);
      contentY += 4;
    }
  });
  
  return y + 8 + contentHeight + 5; // Return next Y position
}

// Get event details text
function getEventDetails(event) {
  const details = [];
  
  if (event.startDate) {
    const startDate = new Date(event.startDate).toLocaleDateString('en-IN');
    const endDate = event.endDate ? new Date(event.endDate).toLocaleDateString('en-IN') : startDate;
    details.push(`Dates: ${startDate} - ${endDate}`);
  }
  
  if (event.venue) {
    details.push(`Venue: ${event.venue}`);
  }
  
  if (event.type) {
    details.push(`Type: ${event.type}`);
  }
  
  if (event.mode) {
    details.push(`Mode: ${event.mode}`);
  }
  
  return details.join('\n') || 'Event details will be updated soon.';
}

// Get coordinator text
function getCoordinatorText(coordinators) {
  return coordinators.map((coord, index) => {
    let text = `${index + 1}. ${coord.name}`;
    if (coord.designation) text += ` - ${coord.designation}`;
    if (coord.department) text += ` (${coord.department})`;
    if (coord.email) text += `\n   Email: ${coord.email}`;
    if (coord.phone) text += `\n   Phone: ${coord.phone}`;
    return text;
  }).join('\n\n');
}

// Get contact information
function getContactInfo(event) {
  let contact = 'Anna University\nCollege of Engineering, Guindy\nChennai - 600 025\n\n';
  contact += 'Website: www.annauniv.edu\n';
  contact += 'Email: info@annauniv.edu\n';
  contact += 'Phone: +91-44-2235-8000';
  
  return contact;
}

// Footer section
function addFooter(doc, pageWidth, pageHeight, primaryColor) {
  const footerY = pageHeight - 15;
  
  // Footer background
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.rect(0, footerY, pageWidth, 15, 'F');
  
  // Footer text
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text('Anna University - Excellence in Education', pageWidth / 2, footerY + 8, { align: 'center' });
}