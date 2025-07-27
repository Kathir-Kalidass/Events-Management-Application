# Advanced Brochure Generator

## Overview

The Advanced Brochure Generator is a comprehensive system for creating professional, landscape-oriented brochures for events. It integrates seamlessly with the Events Management Application and provides multiple templates, formats, and customization options.

## Features

### 🎨 Multiple Templates
- **Modern Gradient**: Contemporary design with gradient backgrounds and modern typography
- **Classic Professional**: Traditional academic design with formal styling
- **Sample-Based**: Custom design based on provided sample brochure images

### 📄 Multiple Output Formats
- **PDF**: High-quality PDF files suitable for printing
- **PNG Images**: High-resolution images for digital use

### 🖼️ Landscape Mode
- Optimized for A4 landscape orientation (297mm x 210mm)
- Professional layout designed for brochures and promotional materials

### 📑 Multi-Page Support
- **Page 1 (Front)**: Event overview, key details, and registration information
- **Page 2 (Back)**: Detailed information, speakers, agenda, and contact details

### 🔧 Event-Based Generation
- Automatically pulls event data from the database
- Dynamic content based on event properties
- QR codes for registration and information

## Architecture

### Backend Components

#### BrochureGenerationService
- **Location**: `Backend/src/shared/services/brochureGenerationService.js`
- **Purpose**: Core service for generating brochures using Puppeteer
- **Features**:
  - HTML template generation
  - PDF and image generation
  - QR code integration
  - Logo and asset management
  - Responsive font sizing

#### BrochureController
- **Location**: `Backend/src/features/brochures/controllers/brochureController.js`
- **Purpose**: API endpoints for brochure operations
- **Endpoints**:
  - `POST /api/brochures/:eventId/generate` - Generate brochure
  - `GET /api/brochures/:eventId/download/:filename` - Download files
  - `GET /api/brochures/:eventId/preview` - Preview brochure
  - `GET /api/brochures/:eventId/status` - Check generation status
  - `GET /api/brochures/templates` - List available templates
  - `POST /api/brochures/bulk/generate` - Bulk generation

#### Routes
- **Location**: `Backend/src/features/brochures/routes/brochureRoutes.js`
- **Purpose**: Route definitions with authentication and authorization

### Frontend Components

#### AdvancedBrochureGenerator
- **Location**: `Frontend/src/features/brochures/components/AdvancedBrochureGenerator.jsx`
- **Purpose**: Main component for brochure generation interface
- **Features**:
  - Template selection
  - Format and page configuration
  - Real-time preview
  - Download management
  - Progress tracking

#### BrochureManagement
- **Location**: `Frontend/src/features/brochures/pages/BrochureManagement.jsx`
- **Purpose**: Management interface for all event brochures
- **Features**:
  - Event listing with brochure status
  - Search and filtering
  - Bulk operations
  - Status tracking

## Usage

### For Coordinators and HODs

1. **Access Brochure Management**
   - Navigate to `/coordinator/brochures` or `/hod/brochures`
   - View all events with their brochure status

2. **Generate a Brochure**
   - Click "Create Brochure" on any event
   - Select template (Modern, Classic, or Sample-based)
   - Choose output formats (PDF, PNG, or both)
   - Select pages to generate (Page 1, Page 2, or both)
   - Click "Generate Brochure"

3. **Preview and Download**
   - Use "Preview Design" to see the brochure before generation
   - Download generated files in PDF or PNG format
   - Files are automatically named with event title and page information

### API Usage

#### Generate Brochure
```javascript
POST /api/brochures/:eventId/generate
{
  "formats": ["pdf", "image"],
  "pages": ["page1", "page2"],
  "style": "modern"
}
```

#### Download Brochure
```javascript
GET /api/brochures/:eventId/download/page1.pdf
GET /api/brochures/:eventId/download/page2.png
```

#### Preview Brochure
```javascript
GET /api/brochures/:eventId/preview?page=page1&style=modern
```

## Sample Integration

The system includes special support for the provided sample brochure images:
- `bronchure _sample1_page-0001.jpg`
- `bronchure _sample1_page-0002.jpg`

When using the "Sample-Based" template, the generator:
1. Loads the sample images as background
2. Overlays event-specific content
3. Maintains the original design aesthetic
4. Adds QR codes and dynamic information

## Configuration

### Environment Variables
```env
FRONTEND_URL=http://10.5.12.1:5173  # For QR code generation
```

### Dependencies
- **Puppeteer**: For PDF and image generation
- **QRCode**: For QR code generation
- **Material-UI**: For frontend components

## File Structure

```
Backend/
├── src/
│   ├── features/
│   │   └── brochures/
│   │       ├── controllers/
│   │       │   └── brochureController.js
│   │       └── routes/
│   │           └── brochureRoutes.js
│   └── shared/
│       └── services/
│           └── brochureGenerationService.js

Frontend/
├── src/
│   └── features/
│       └── brochures/
│           ├── components/
│           │   └── AdvancedBrochureGenerator.jsx
│           └── pages/
│               └── BrochureManagement.jsx
```

## Security

- Authentication required for all generation endpoints
- Role-based authorization (coordinators and HODs only)
- File downloads are secured with tokens
- Generated files are cached temporarily

## Performance

- Puppeteer instances are managed efficiently
- Files are cached in memory for quick downloads
- Responsive font sizing for long text content
- Optimized image loading and processing

## Troubleshooting

### Common Issues

1. **Puppeteer Launch Errors**
   - Ensure all required dependencies are installed
   - Check system permissions for Puppeteer

2. **Font Loading Issues**
   - Verify Google Fonts are accessible
   - Check network connectivity

3. **Image Loading Failures**
   - Ensure logo files exist in `Backend/src/assets/logo/`
   - Check file permissions

4. **QR Code Generation Errors**
   - Verify FRONTEND_URL environment variable
   - Check QRCode library installation

### Debug Mode

Enable debug logging by setting:
```env
DEBUG=brochure:*
```

## Future Enhancements

- Additional template designs
- Custom color schemes
- Batch processing for multiple events
- Integration with external design tools
- Advanced typography options
- Multi-language support

## Support

For technical support or feature requests, please refer to the main project documentation or contact the development team.