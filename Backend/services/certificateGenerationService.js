import puppeteer from 'puppeteer';
import QRCode from 'qrcode';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class CertificateGenerationService {
  constructor() {
    this.templatesDir = path.join(__dirname, '../templates');
    this.outputDir = path.join(__dirname, '../generated-certificates');
    
    // Ensure directories exist
    this.ensureDirectories();
  }

  ensureDirectories() {
    if (!fs.existsSync(this.templatesDir)) {
      fs.mkdirSync(this.templatesDir, { recursive: true });
    }
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
  }

  // Generate QR Code for certificate verification
  async generateQRCode(certificateId) {
    try {
      const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:5174'}/verify-certificate/${certificateId}`;
      const qrCodeDataURL = await QRCode.toDataURL(verificationUrl, {
        type: 'image/png',
        width: 200,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
      });
      return qrCodeDataURL;
    } catch (error) {
      console.error('Error generating QR code:', error);
      throw error;
    }
  }

  // Generate HTML template for certificate with HOD and Coordinator signatures
  generateHTMLTemplate(certificateData) {
    const {
      participantName,
      eventTitle,
      eventDuration,
      eventDates,
      venue,
      mode,
      issuedDate,
      certificateId,
      qrCodeDataURL,
      skills = [],
      hodName = process.env.DEPARTMENT_HEAD || "Dr. Department Head",
      coordinatorName = "Program Coordinator"
    } = certificateData;

    const formatDate = (date) => {
      return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    };

    const startDate = formatDate(eventDates.startDate);
    const endDate = formatDate(eventDates.endDate);
    const dateRange = startDate === endDate ? startDate : `${startDate} - ${endDate}`;
    const formattedIssuedDate = formatDate(issuedDate);

    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Certificate of Completion</title>
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=Crimson+Text:wght@400;600&family=Open+Sans:wght@300;400;600;700&display=swap');
            
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }
            
            body {
                font-family: 'Open Sans', sans-serif;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                min-height: 100vh;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 20px;
            }
            
            .certificate {
                width: 1200px;
                height: 900px;
                background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
                border: 15px solid #1a365d;
                border-radius: 25px;
                position: relative;
                box-shadow: 0 25px 50px rgba(0,0,0,0.4);
                overflow: hidden;
            }
            
            .certificate::before {
                content: '';
                position: absolute;
                top: 30px;
                left: 30px;
                right: 30px;
                bottom: 30px;
                border: 4px solid #2d5aa0;
                border-radius: 15px;
                background: linear-gradient(45deg, transparent 0%, rgba(45, 90, 160, 0.05) 50%, transparent 100%);
            }
            
            .certificate::after {
                content: '';
                position: absolute;
                top: 50px;
                left: 50px;
                right: 50px;
                bottom: 50px;
                border: 2px solid #4a90e2;
                border-radius: 10px;
                opacity: 0.6;
            }
            
            .ornamental-border {
                position: absolute;
                top: 70px;
                left: 70px;
                right: 70px;
                bottom: 70px;
                border: 1px solid #d4af37;
                border-radius: 8px;
                background: repeating-linear-gradient(
                    45deg,
                    transparent,
                    transparent 10px,
                    rgba(212, 175, 55, 0.1) 10px,
                    rgba(212, 175, 55, 0.1) 20px
                );
            }
            
            .header {
                text-align: center;
                padding: 90px 60px 30px;
                position: relative;
                z-index: 10;
                background: linear-gradient(180deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 100%);
            }
            
            .university-seal {
                width: 100px;
                height: 100px;
                margin: 0 auto 25px;
                background: linear-gradient(135deg, #1a365d 0%, #2d5aa0 100%);
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-size: 32px;
                font-weight: 900;
                border: 4px solid #d4af37;
                box-shadow: 0 8px 16px rgba(0,0,0,0.2);
                position: relative;
            }
            
            .university-seal::before {
                content: '';
                position: absolute;
                top: -8px;
                left: -8px;
                right: -8px;
                bottom: -8px;
                border: 2px solid #4a90e2;
                border-radius: 50%;
                opacity: 0.5;
            }
            
            .university-name {
                font-family: 'Playfair Display', serif;
                font-size: 32px;
                font-weight: 900;
                color: #1a365d;
                margin-bottom: 8px;
                letter-spacing: 3px;
                text-shadow: 2px 2px 4px rgba(0,0,0,0.1);
            }
            
            .university-address {
                font-size: 14px;
                color: #4a5568;
                margin-bottom: 5px;
                font-weight: 400;
            }
            
            .department {
                font-size: 18px;
                color: #2d5aa0;
                margin-bottom: 35px;
                font-weight: 600;
                letter-spacing: 1px;
            }
            
            .certificate-title {
                font-family: 'Playfair Display', serif;
                font-size: 56px;
                font-weight: 900;
                color: #1a365d;
                margin-bottom: 15px;
                text-shadow: 3px 3px 6px rgba(0,0,0,0.1);
                letter-spacing: 4px;
            }
            
            .certificate-subtitle {
                font-family: 'Crimson Text', serif;
                font-size: 24px;
                color: #d4af37;
                margin-bottom: 30px;
                font-weight: 600;
                font-style: italic;
            }
            
            .content {
                text-align: center;
                padding: 0 80px 40px;
                position: relative;
                z-index: 10;
            }
            
            .awarded-to {
                font-size: 20px;
                color: #4a5568;
                margin-bottom: 25px;
                font-weight: 400;
                font-style: italic;
            }
            
            .participant-name {
                font-family: 'Playfair Display', serif;
                font-size: 48px;
                font-weight: 700;
                color: #1a365d;
                margin-bottom: 25px;
                text-decoration: underline;
                text-decoration-color: #d4af37;
                text-underline-offset: 12px;
                text-decoration-thickness: 4px;
                letter-spacing: 2px;
                text-shadow: 2px 2px 4px rgba(0,0,0,0.1);
            }
            
            .completion-text {
                font-size: 18px;
                color: #4a5568;
                margin-bottom: 20px;
                line-height: 1.6;
                font-weight: 400;
            }
            
            .event-title {
                font-family: 'Playfair Display', serif;
                font-size: 32px;
                font-weight: 700;
                color: #2d5aa0;
                margin-bottom: 25px;
                font-style: italic;
                text-shadow: 1px 1px 2px rgba(0,0,0,0.1);
            }
            
            .event-details {
                display: grid;
                grid-template-columns: repeat(4, 1fr);
                gap: 20px;
                margin: 30px 0;
                padding: 20px;
                background: linear-gradient(135deg, rgba(212, 175, 55, 0.1) 0%, rgba(74, 144, 226, 0.1) 100%);
                border-radius: 10px;
                border: 1px solid rgba(212, 175, 55, 0.3);
            }
            
            .event-info {
                text-align: center;
                padding: 10px;
            }
            
            .event-info strong {
                display: block;
                color: #1a365d;
                margin-bottom: 8px;
                font-weight: 700;
                font-size: 14px;
                text-transform: uppercase;
                letter-spacing: 1px;
            }
            
            .event-info span {
                color: #4a5568;
                font-size: 16px;
                font-weight: 500;
            }
            
            .skills-section {
                margin: 25px 0;
                text-align: center;
            }
            
            .skills-title {
                font-size: 18px;
                color: #1a365d;
                margin-bottom: 15px;
                font-weight: 700;
                text-transform: uppercase;
                letter-spacing: 1px;
            }
            
            .skills-list {
                display: flex;
                flex-wrap: wrap;
                justify-content: center;
                gap: 12px;
            }
            
            .skill-tag {
                background: linear-gradient(135deg, #4a90e2 0%, #2d5aa0 100%);
                color: white;
                padding: 10px 18px;
                border-radius: 25px;
                font-size: 14px;
                font-weight: 600;
                box-shadow: 0 4px 8px rgba(0,0,0,0.2);
                border: 2px solid rgba(255,255,255,0.2);
            }
            
            .footer {
                position: absolute;
                bottom: 90px;
                left: 90px;
                right: 90px;
                z-index: 10;
            }
            
            .signatures-section {
                display: grid;
                grid-template-columns: 1fr auto 1fr;
                gap: 40px;
                align-items: end;
                margin-bottom: 30px;
            }
            
            .signature-block {
                text-align: center;
                position: relative;
            }
            
            .signature-space {
                height: 60px;
                border-bottom: 2px solid #1a365d;
                margin-bottom: 15px;
                position: relative;
                background: linear-gradient(to right, transparent 0%, rgba(212, 175, 55, 0.1) 50%, transparent 100%);
            }
            
            .signature-space::before {
                content: '';
                position: absolute;
                bottom: -1px;
                left: 0;
                right: 0;
                height: 1px;
                background: linear-gradient(to right, transparent 0%, #d4af37 50%, transparent 100%);
            }
            
            .signature-name {
                font-weight: 700;
                color: #1a365d;
                font-size: 16px;
                margin-bottom: 5px;
                letter-spacing: 0.5px;
            }
            
            .signature-title {
                font-size: 14px;
                color: #4a5568;
                font-weight: 600;
                text-transform: uppercase;
                letter-spacing: 1px;
            }
            
            .signature-department {
                font-size: 12px;
                color: #718096;
                margin-top: 3px;
                font-style: italic;
            }
            
            .center-emblem {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                padding: 0 20px;
            }
            
            .university-emblem {
                width: 80px;
                height: 80px;
                background: linear-gradient(135deg, #d4af37 0%, #f6e05e 100%);
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                color: #1a365d;
                font-size: 24px;
                font-weight: 900;
                border: 3px solid #1a365d;
                box-shadow: 0 6px 12px rgba(0,0,0,0.2);
                margin-bottom: 10px;
            }
            
            .emblem-text {
                font-size: 10px;
                color: #4a5568;
                text-align: center;
                font-weight: 600;
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }
            
            .certificate-metadata {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 20px 0;
                border-top: 2px solid rgba(212, 175, 55, 0.3);
                background: linear-gradient(135deg, rgba(255,255,255,0.8) 0%, rgba(248,249,250,0.8) 100%);
                border-radius: 10px;
                margin-top: 20px;
            }
            
            .issue-info {
                text-align: left;
                flex: 1;
            }
            
            .issue-date {
                font-size: 14px;
                color: #1a365d;
                margin-bottom: 5px;
                font-weight: 600;
            }
            
            .certificate-id {
                font-size: 12px;
                color: #718096;
                font-family: 'Courier New', monospace;
                background: rgba(212, 175, 55, 0.1);
                padding: 4px 8px;
                border-radius: 4px;
                display: inline-block;
            }
            
            .qr-section {
                text-align: center;
                flex: 0 0 auto;
                margin: 0 20px;
            }
            
            .qr-code {
                width: 80px;
                height: 80px;
                border: 2px solid #d4af37;
                border-radius: 8px;
                padding: 4px;
                background: white;
                box-shadow: 0 4px 8px rgba(0,0,0,0.1);
            }
            
            .qr-text {
                font-size: 10px;
                color: #718096;
                margin-top: 5px;
                font-weight: 600;
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }
            
            .validity-info {
                text-align: right;
                flex: 1;
            }
            
            .validity-text {
                font-size: 12px;
                color: #4a5568;
                font-weight: 600;
                margin-bottom: 5px;
            }
            
            .verification-url {
                font-size: 10px;
                color: #718096;
                font-family: 'Courier New', monospace;
                word-break: break-all;
            }
            
            .decorative-elements {
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                pointer-events: none;
                z-index: 1;
                opacity: 0.1;
            }
            
            .corner-flourish {
                position: absolute;
                width: 120px;
                height: 120px;
                background: radial-gradient(circle, #d4af37 0%, transparent 70%);
                border-radius: 50%;
            }
            
            .corner-flourish.top-left {
                top: -60px;
                left: -60px;
            }
            
            .corner-flourish.top-right {
                top: -60px;
                right: -60px;
            }
            
            .corner-flourish.bottom-left {
                bottom: -60px;
                left: -60px;
            }
            
            .corner-flourish.bottom-right {
                bottom: -60px;
                right: -60px;
            }
            
            @media print {
                body {
                    background: white;
                    padding: 0;
                }
                
                .certificate {
                    box-shadow: none;
                    border-radius: 0;
                    page-break-inside: avoid;
                }
            }
        </style>
    </head>
    <body>
        <div class="certificate">
            <div class="decorative-elements">
                <div class="corner-flourish top-left"></div>
                <div class="corner-flourish top-right"></div>
                <div class="corner-flourish bottom-left"></div>
                <div class="corner-flourish bottom-right"></div>
            </div>
            
            <div class="ornamental-border"></div>
            
            <div class="header">
                <div class="university-seal">AU</div>
                <div class="university-name">ANNA UNIVERSITY</div>
                <div class="university-address">Sardar Patel Road, Guindy, Chennai - 600 025</div>
                <div class="department">Department of Computer Science and Engineering</div>
                <div class="certificate-title">CERTIFICATE</div>
                <div class="certificate-subtitle">of Completion</div>
            </div>
            
            <div class="content">
                <div class="awarded-to">This is to certify that</div>
                <div class="participant-name">${participantName}</div>
                <div class="completion-text">
                    has successfully completed the program
                </div>
                <div class="event-title">"${eventTitle}"</div>
                
                <div class="event-details">
                    <div class="event-info">
                        <strong>Duration</strong>
                        <span>${eventDuration}</span>
                    </div>
                    <div class="event-info">
                        <strong>Date</strong>
                        <span>${dateRange}</span>
                    </div>
                    <div class="event-info">
                        <strong>Venue</strong>
                        <span>${venue}</span>
                    </div>
                    <div class="event-info">
                        <strong>Mode</strong>
                        <span>${mode}</span>
                    </div>
                </div>
                
                ${skills.length > 0 ? `
                <div class="skills-section">
                    <div class="skills-title">Skills & Competencies Acquired</div>
                    <div class="skills-list">
                        ${skills.map(skill => `<span class="skill-tag">${skill}</span>`).join('')}
                    </div>
                </div>
                ` : ''}
            </div>
            
            <div class="footer">
                <div class="signatures-section">
                    <div class="signature-block">
                        <div class="signature-space"></div>
                        <div class="signature-name">${coordinatorName}</div>
                        <div class="signature-title">Program Coordinator</div>
                        <div class="signature-department">Department of CSE</div>
                    </div>
                    
                    <div class="center-emblem">
                        <div class="university-emblem">★</div>
                        <div class="emblem-text">Official Seal</div>
                    </div>
                    
                    <div class="signature-block">
                        <div class="signature-space"></div>
                        <div class="signature-name">${hodName}</div>
                        <div class="signature-title">Head of Department</div>
                        <div class="signature-department">Department of CSE</div>
                    </div>
                </div>
                
                <div class="certificate-metadata">
                    <div class="issue-info">
                        <div class="issue-date">Issued on: ${formattedIssuedDate}</div>
                        <div class="certificate-id">Certificate ID: ${certificateId}</div>
                    </div>
                    
                    <div class="qr-section">
                        <img src="${qrCodeDataURL}" alt="QR Code" class="qr-code">
                        <div class="qr-text">Scan to Verify</div>
                    </div>
                    
                    <div class="validity-info">
                        <div class="validity-text">Digitally Verifiable</div>
                        <div class="verification-url">verify.annauniv.edu</div>
                    </div>
                </div>
            </div>
        </div>
    </body>
    </html>
    `;
  }

  // Generate certificate as PDF using Puppeteer
  async generatePDFCertificate(certificateData) {
    let browser;
    try {
      // Generate QR code
      const qrCodeDataURL = await this.generateQRCode(certificateData.certificateId);
      
      // Add QR code to certificate data
      const dataWithQR = { ...certificateData, qrCodeDataURL };
      
      // Generate HTML
      const html = this.generateHTMLTemplate(dataWithQR);
      
      // Launch Puppeteer
      browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
      });
      
      const page = await browser.newPage();
      
      // Set content and wait for fonts to load
      await page.setContent(html, { waitUntil: 'networkidle0' });
      
      // Wait a bit more for fonts to fully load
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Generate PDF
      const pdfBuffer = await page.pdf({
        format: 'A4',
        landscape: true,
        printBackground: true,
        preferCSSPageSize: true,
        margin: {
          top: '0.2in',
          right: '0.2in',
          bottom: '0.2in',
          left: '0.2in'
        }
      });
      
      return pdfBuffer;
    } catch (error) {
      console.error('Error generating PDF certificate:', error);
      throw error;
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  }

  // Generate certificate as PNG image using Puppeteer
  async generateImageCertificate(certificateData) {
    let browser;
    try {
      // Generate QR code
      const qrCodeDataURL = await this.generateQRCode(certificateData.certificateId);
      
      // Add QR code to certificate data
      const dataWithQR = { ...certificateData, qrCodeDataURL };
      
      // Generate HTML
      const html = this.generateHTMLTemplate(dataWithQR);
      
      // Launch Puppeteer
      browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
      });
      
      const page = await browser.newPage();
      
      // Set viewport for high-quality image
      await page.setViewport({
        width: 1200,
        height: 900,
        deviceScaleFactor: 2
      });
      
      // Set content and wait for fonts to load
      await page.setContent(html, { waitUntil: 'networkidle0' });
      
      // Wait for fonts to fully load
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Generate screenshot
      const imageBuffer = await page.screenshot({
        type: 'png',
        fullPage: false,
        clip: {
          x: 0,
          y: 0,
          width: 1200,
          height: 900
        }
      });
      
      return imageBuffer;
    } catch (error) {
      console.error('Error generating image certificate:', error);
      throw error;
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  }

  // Generate both PDF and image formats
  async generateCertificate(certificateData, formats = ['pdf', 'image']) {
    const results = {};
    
    try {
      if (formats.includes('pdf')) {

        results.pdfBuffer = await this.generatePDFCertificate(certificateData);
        results.pdfSize = results.pdfBuffer.length;

      }
      
      if (formats.includes('image')) {

        results.imageBuffer = await this.generateImageCertificate(certificateData);
        results.imageSize = results.imageBuffer.length;

      }

      return results;
    } catch (error) {
      console.error('Error in certificate generation:', error);
      throw error;
    }
  }

  // Save certificate to file system
  async saveCertificateToFile(certificateData, buffer, format = 'pdf') {
    try {
      const fileName = `certificate-${certificateData.certificateId}.${format}`;
      const filePath = path.join(this.outputDir, fileName);
      
      fs.writeFileSync(filePath, buffer);
      
      return {
        fileName,
        filePath,
        size: buffer.length
      };
    } catch (error) {
      console.error('Error saving certificate to file:', error);
      throw error;
    }
  }

  // Generate simple fallback certificate (text-based)
  generateFallbackCertificate(certificateData) {
    const {
      participantName,
      eventTitle,
      eventDuration,
      eventDates,
      venue,
      mode,
      issuedDate,
      certificateId,
      hodName = process.env.DEPARTMENT_HEAD || "Dr. Department Head",
      coordinatorName = "Program Coordinator"
    } = certificateData;

    const formatDate = (date) => {
      return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    };

    const startDate = formatDate(eventDates.startDate);
    const endDate = formatDate(eventDates.endDate);
    const dateRange = startDate === endDate ? startDate : `${startDate} - ${endDate}`;

    return `
═══════════════════════════════════════════════════════════════════════════════
                                ANNA UNIVERSITY
                    Department of Computer Science and Engineering
                         Sardar Patel Road, Guindy, Chennai - 600 025
═══════════════════════════════════════════════════════════════════════════════

                                  CERTIFICATE
                                 of Completion

This is to certify that

                              ${participantName.toUpperCase()}

has successfully completed the program

                                "${eventTitle}"

Duration: ${eventDuration}                    Date: ${dateRange}
Venue: ${venue}                              Mode: ${mode}

${certificateData.skills && certificateData.skills.length > 0 ? `
Skills & Competencies Acquired: ${certificateData.skills.join(', ')}
` : ''}

Issued on: ${formatDate(issuedDate)}
Certificate ID: ${certificateId}

_____________________                                    _____________________
${coordinatorName}                                      ${hodName}
Program Coordinator                                      Head of Department
Department of CSE                                        Department of CSE

This certificate is digitally verifiable.
Verification URL: ${process.env.FRONTEND_URL || 'http://localhost:5174'}/verify-certificate/${certificateId}

═══════════════════════════════════════════════════════════════════════════════
    `.trim();
  }
}

export default CertificateGenerationService;