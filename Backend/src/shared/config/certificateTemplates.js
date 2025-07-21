/**
 * Certificate Template Configuration System
 * Version: 2.0.0
 * Enhanced with modular template management and versioning
 */

export const TEMPLATE_VERSIONS = {
  CURRENT: "2.0.0",
  SUPPORTED: ["1.0.0", "1.5.0", "2.0.0"],
  DEPRECATED: ["0.9.0"],
};

export const CERTIFICATE_TEMPLATES = {
  "cream-bordered-appreciation": {
    id: "cream-bordered-appreciation",
    name: "Cream Bordered Appreciation Certificate",
    version: "2.0.0",
    description: "Elegant cream-colored certificate with decorative borders",
    
    // Template file configuration
    template: {
      path: "template/Cream Bordered Appreciation Certificate.png",
      format: "PNG",
      dimensions: {
        width: 1200,
        height: 900,
        dpi: 300,
      },
    },

    // Text positioning and styling
    textFields: {
      participantName: {
        position: { x: 600, y: 420 },
        style: {
          fontSize: 36,
          fontFamily: "Times-Bold",
          color: "#2C3E50",
          align: "center",
          maxWidth: 800,
        },
        transform: {
          letterSpacing: 2,
          textTransform: "uppercase",
        },
      },
      
      eventTitle: {
        position: { x: 600, y: 520 },
        style: {
          fontSize: 24,
          fontFamily: "Times-Roman",
          color: "#34495E",
          align: "center",
          maxWidth: 900,
        },
        prefix: "for successfully completing",
        suffix: "",
      },

      eventDuration: {
        position: { x: 600, y: 580 },
        style: {
          fontSize: 18,
          fontFamily: "Times-Roman",
          color: "#7F8C8D",
          align: "center",
        },
        format: "Duration: {duration}",
      },

      eventDates: {
        position: { x: 600, y: 620 },
        style: {
          fontSize: 16,
          fontFamily: "Times-Roman",
          color: "#7F8C8D",
          align: "center",
        },
        format: "Conducted from {startDate} to {endDate}",
      },

      venue: {
        position: { x: 600, y: 660 },
        style: {
          fontSize: 16,
          fontFamily: "Times-Roman",
          color: "#7F8C8D",
          align: "center",
        },
        format: "Venue: {venue} ({mode})",
      },

      issuedDate: {
        position: { x: 200, y: 780 },
        style: {
          fontSize: 14,
          fontFamily: "Times-Roman",
          color: "#95A5A6",
          align: "left",
        },
        format: "Issued on: {date}",
      },

      certificateId: {
        position: { x: 1000, y: 780 },
        style: {
          fontSize: 12,
          fontFamily: "Courier",
          color: "#95A5A6",
          align: "right",
        },
        format: "Certificate ID: {id}",
      },

      qrCode: {
        position: { x: 1050, y: 680 },
        size: { width: 80, height: 80 },
        style: {
          backgroundColor: "#FFFFFF",
          border: {
            width: 2,
            color: "#BDC3C7",
          },
        },
      },

      organizationLogo: {
        position: { x: 100, y: 100 },
        size: { width: 80, height: 80 },
        style: {
          opacity: 0.9,
        },
      },

      watermark: {
        position: { x: 600, y: 450 },
        style: {
          fontSize: 120,
          fontFamily: "Times-Roman",
          color: "#ECF0F1",
          align: "center",
          opacity: 0.1,
          rotation: -15,
        },
        text: "CERTIFICATE",
      },
    },

    // Color scheme
    colors: {
      primary: "#2C3E50",
      secondary: "#34495E",
      accent: "#E67E22",
      text: "#2C3E50",
      muted: "#7F8C8D",
      background: "#FDF6E3",
      border: "#D4AF37",
    },

    // Validation rules
    validation: {
      requiredFields: ["participantName", "eventTitle", "eventDuration", "issuedDate"],
      maxTextLength: {
        participantName: 100,
        eventTitle: 200,
        eventDuration: 50,
      },
    },

    // Output configuration
    output: {
      formats: ["PDF", "PNG", "JPEG"],
      quality: {
        PDF: { compression: "high", dpi: 300 },
        PNG: { quality: 100, dpi: 300 },
        JPEG: { quality: 95, dpi: 300 },
      },
      sizes: {
        standard: { width: 1200, height: 900 },
        print: { width: 3600, height: 2700 }, // 300 DPI for printing
        web: { width: 800, height: 600 },
        thumbnail: { width: 400, height: 300 },
      },
    },

    // Metadata
    metadata: {
      author: "Events Management System",
      creator: "Anna University CSRC",
      subject: "Certificate of Completion",
      keywords: ["certificate", "completion", "training", "workshop"],
      createdDate: new Date().toISOString(),
      version: "2.0.0",
    },
  },

  // Additional template configurations can be added here
  "modern-blue": {
    id: "modern-blue",
    name: "Modern Blue Certificate",
    version: "1.5.0",
    description: "Contemporary blue-themed certificate design",
    // ... similar structure as above
  },

  "classic-gold": {
    id: "classic-gold",
    name: "Classic Gold Certificate",
    version: "1.0.0",
    description: "Traditional gold-themed certificate with ornate borders",
    // ... similar structure as above
  },
};

/**
 * Get template configuration by ID and version
 */
export function getTemplate(templateId, version = null) {
  const template = CERTIFICATE_TEMPLATES[templateId];
  
  if (!template) {
    throw new Error(`Template '${templateId}' not found`);
  }

  if (version && template.version !== version) {
    // Handle version compatibility
    if (!TEMPLATE_VERSIONS.SUPPORTED.includes(version)) {
      throw new Error(`Template version '${version}' is not supported`);
    }
  }

  return template;
}

/**
 * Get all available templates
 */
export function getAllTemplates() {
  return Object.values(CERTIFICATE_TEMPLATES);
}

/**
 * Validate template configuration
 */
export function validateTemplate(templateConfig) {
  const requiredFields = ['id', 'name', 'version', 'template', 'textFields'];
  
  for (const field of requiredFields) {
    if (!templateConfig[field]) {
      throw new Error(`Template configuration missing required field: ${field}`);
    }
  }

  // Validate version format (semantic versioning)
  const versionRegex = /^\d+\.\d+\.\d+$/;
  if (!versionRegex.test(templateConfig.version)) {
    throw new Error(`Invalid version format: ${templateConfig.version}`);
  }

  return true;
}

/**
 * Get template by participant preferences or event type
 */
export function getRecommendedTemplate(eventType, participantPreferences = {}) {
  // Default recommendation logic
  let recommendedTemplate = "cream-bordered-appreciation";

  // Customize based on event type
  switch (eventType?.toLowerCase()) {
    case "workshop":
    case "training":
      recommendedTemplate = "cream-bordered-appreciation";
      break;
    case "seminar":
    case "conference":
      recommendedTemplate = "modern-blue";
      break;
    case "competition":
    case "hackathon":
      recommendedTemplate = "classic-gold";
      break;
    default:
      recommendedTemplate = "cream-bordered-appreciation";
  }

  // Override with participant preferences if available
  if (participantPreferences.preferredTemplate) {
    const preferredTemplate = CERTIFICATE_TEMPLATES[participantPreferences.preferredTemplate];
    if (preferredTemplate) {
      recommendedTemplate = participantPreferences.preferredTemplate;
    }
  }

  return getTemplate(recommendedTemplate);
}

export default {
  TEMPLATE_VERSIONS,
  CERTIFICATE_TEMPLATES,
  getTemplate,
  getAllTemplates,
  validateTemplate,
  getRecommendedTemplate,
};