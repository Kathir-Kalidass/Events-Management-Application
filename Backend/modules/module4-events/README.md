# Module 4 - Events Conducted by Department

This module handles all aspects of events conducted by the department including:

## Features

### 1. Event Management
- Note order preparation for permission (template-based)
- Duration, mode, and venue management
- Participant registration and management
- Money collection tracking

### 2. Claim Processing
- Template-based claim processing
- Financial tracking and reporting
- Budget synchronization

### 3. Brochure Design and Content
- Dynamic brochure generation
- Content management system
- Template customization

### 4. Feedback Collection
- Participant feedback forms
- Feedback analysis and reporting
- Question bank management

### 5. Certificate Generation
- Automated certificate design and generation
- Bulk certificate processing
- Template customization
- PDF generation with participant details

## File Structure

```
module4-events/
├── models/
│   ├── eventModel.js
��   ├── participantModel.js
│   ├── ParticipantEventModel.js
│   ├── certificateModel.js
│   ├── claimModel.js
│   ├── feedbackModel.js
│   ├── feedbackQuestionModel.js
│   ├── convenorCommitteeModel.js
│   ├── TrainingProgramme.js
│   └── index.js
├── controllers/
│   ├── admin/
│   ├── coordinator/
│   ├── hod/
│   ├── participant/
│   ├── certificateController.js
│   └── index.js
├── routes/
│   ├── adminRoutes.js
│   ├── coordinatorRoutes.js
│   ├── hodRoutes.js
│   ├── participantRoutes.js
│   ├── certificateRoutes.js
│   ├── claimItemRoutes.js
│   ├── budgetSyncRoutes.js
│   └── index.js
├── services/
│   ├── emailService.js
│   ├── pdfService.js
│   ├── certificateService.js
│   ├── claimService.js
│   ├── eventService.js
│   └── index.js
├── templates/
│   ├── certificates/
│   ├── claims/
│   ├── brochures/
│   └── permissions/
└── README.md
```

## API Endpoints

### Admin Routes (`/api/admin`)
- `GET /feedback-questions` - Get all feedback questions
- `POST /feedback-questions` - Create new feedback question
- `PUT /feedback-questions/:id` - Update feedback question
- `DELETE /feedback-questions/:id` - Delete feedback question
- `PUT /feedback-questions/reorder` - Reorder feedback questions
- `POST /feedback-questions/initialize` - Initialize default questions

### Coordinator Routes (`/api/module4/coordinator`)
- `GET /events` - Get coordinator events
- `POST /events` - Create event
- `PUT /events/:id` - Update event
- `GET /participants/:eventId` - Get event participants
- `POST /feedback` - Submit feedback

### HOD Routes (`/api/module4/hod`)
- `GET /events/pending` - Get pending approvals
- `POST /events/:id/approve` - Approve event
- `POST /events/:id/reject` - Reject event
- `GET /reports` - Get department reports

### Participant Routes (`/api/module4/participant`)
- `GET /events` - Get available events
- `POST /events/:id/register` - Register for event
- `POST /feedback` - Submit feedback
- `GET /certificates` - Get participant certificates

### Certificate Routes (`/api/module4/certificates`)
- `POST /generate` - Generate certificates
- `GET /:id` - Get certificate
- `POST /bulk-generate` - Bulk generate certificates

## Integration Points

### With Other Modules
1. **Module 1 (Student OD)**: Event participation triggers OD requests
2. **Module 2 (Student Internship)**: Workshop/training events can be internship opportunities
3. **Module 3 (Faculty OD)**: Faculty conducting events need OD approval
4. **Module 5 (Facility Booking)**: Events require facility booking
5. **Module 6 (Timetable)**: Events should not conflict with regular classes
7. **Module 7 (Feedback)**: Integrated feedback system
10. **Module 10 (Purchase)**: Event expenses and claims processing

### Shared Services
- Authentication middleware
- File upload handling
- Email notifications
- PDF generation utilities
- Database connection

## Templates Available

### 1. Permission Templates
- Note order for event permission
- Dean approval letters
- Venue booking requests

### 2. Claim Templates
- Event expense claims
- Honorarium claims
- Travel expense claims

### 3. Certificate Templates
- Participation certificates
- Completion certificates
- Achievement certificates

### 4. Brochure Templates
- Workshop brochures
- Conference brochures
- Training program brochures

## Usage Examples

### Creating an Event
```javascript
const event = await Event.create({
  title: "AI Workshop",
  description: "Introduction to Artificial Intelligence",
  startDate: new Date("2025-06-15"),
  endDate: new Date("2025-06-17"),
  venue: "Conference Hall",
  maxParticipants: 50,
  registrationFee: 500,
  coordinatorId: "user123"
});
```

### Generating Certificates
```javascript
const certificates = await certificateService.generateBulkCertificates({
  eventId: "event123",
  templateId: "template456",
  participantIds: ["p1", "p2", "p3"]
});
```

### Processing Claims
```javascript
const claim = await claimService.processClaim({
  eventId: "event123",
  claimType: "expense",
  amount: 15000,
  description: "Event expenses",
  receipts: ["receipt1.pdf", "receipt2.pdf"]
});
```