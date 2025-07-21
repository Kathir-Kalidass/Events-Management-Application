# 📁 Events Management Application - Project Structure

## 🎯 Overview

This document outlines the reorganized project structure that groups files by features and improves maintainability. The new structure follows modern software architecture principles with clear separation of concerns.

## 🏗️ Architecture Principles

- **Feature-Based Organization**: Files are grouped by business features rather than technical layers
- **Shared Resources**: Common utilities, components, and services are centralized
- **Clear Separation**: Frontend and Backend have similar organizational patterns
- **Scalability**: Easy to add new features without affecting existing code
- **Maintainability**: Related files are co-located for easier development

## 📂 Backend Structure

```
Backend/
├── src/                                    # Source code
│   ├── features/                          # Feature-based modules
│   │   ├── auth/                          # Authentication & Authorization
│   │   │   ├── controllers/               # Auth controllers
│   │   │   ├── routes/                    # Auth routes
│   │   │   ├── services/                  # Auth business logic
│   │   │   └── index.js                   # Feature exports
│   │   ├── events/                        # Event Management
│   │   │   ├── controllers/               # Event controllers (coordinator, HOD)
│   │   │   ├── routes/                    # Event routes
│   │   │   ├── services/                  # Event business logic
│   │   │   └── index.js                   # Feature exports
│   │   ├── claims/                        # Claims & Budget Management
│   │   │   ├── controllers/               # Claim controllers
│   │   │   ├── routes/                    # Claim routes
│   │   │   ├── services/                  # Claim business logic
│   │   │   └── index.js                   # Feature exports
│   │   ├── certificates/                  # Certificate Management
│   │   │   ├── controllers/               # Certificate controllers
│   │   │   ├── routes/                    # Certificate routes
│   │   │   ├── services/                  # Certificate business logic
│   │   │   └── index.js                   # Feature exports
│   │   ├── participants/                  # Participant Management
│   │   │   ├── controllers/               # Participant controllers
│   │   │   ├── routes/                    # Participant routes
│   │   │   ├── services/                  # Participant business logic
│   │   │   └── index.js                   # Feature exports
│   │   ├── documents/                     # Document Generation (Brochures, PDFs)
│   │   │   ├── controllers/               # Document controllers
│   │   │   ├── routes/                    # Document routes
│   │   │   ├── services/                  # Document business logic
│   │   │   └── index.js                   # Feature exports
│   │   ├── feedback/                      # Feedback Management
│   │   │   ├── controllers/               # Feedback controllers
│   │   │   ├── routes/                    # Feedback routes
│   │   │   ├── services/                  # Feedback business logic
│   │   │   └── index.js                   # Feature exports
│   │   └── admin/                         # Admin & System Management
│   │       ├── controllers/               # Admin controllers
│   │       ├── routes/                    # Admin routes
│   │       ├── services/                  # Admin business logic
│   │       └── index.js                   # Feature exports
│   ├── shared/                            # Shared resources
│   │   ├── config/                        # Configuration files
│   │   │   ├── db.js                      # Database configuration
│   │   │   └── index.js                   # Config exports
│   │   ├── middleware/                    # Shared middleware
│   │   │   ├── authMiddleware.js          # Authentication middleware
│   │   │   ├── roleAuthMiddleware.js      # Role-based authorization
│   │   │   ├── dataValidationMiddleware.js # Data validation
│   │   │   └── index.js                   # Middleware exports
│   │   ├── models/                        # Database models
│   │   │   ├── eventModel.js              # Event schema
│   │   │   ├── userModel.js               # User schema
│   │   │   ├── certificateModel.js        # Certificate schema
│   │   │   ├── participantModel.js        # Participant schema
│   │   │   ├── TrainingProgramme.js       # Training program schema
│   │   │   ├── convenorCommitteeModel.js  # Committee schema
│   │   │   ├── feedbackQuestionModel.js   # Feedback schema
│   │   │   └── index.js                   # Model exports
│   │   ├── utils/                         # Shared utilities
│   │   │   ├── amountSyncHelper.js        # Amount synchronization
│   │   │   ├── emailService.js            # Email utilities
│   │   │   └── index.js                   # Utils exports
│   │   ├── services/                      # Shared services
│   │   │   └── index.js                   # Services exports
│   │   └── index.js                       # Shared exports
│   ├── assets/                            # Static assets
│   │   ├── logo/                          # University logos
│   │   └── templates/                     # Document templates
│   └── server.js                          # Main server file
├── generated-certificates/                # Generated certificate files
├── passwordManager/                       # Password encryption utilities
├── .env                                   # Environment variables
├── .env.example                          # Environment template
└── package.json                          # Dependencies and scripts
```

## 📂 Frontend Structure

```
Frontend/
├── src/                                   # Source code
│   ├── features/                          # Feature-based modules
│   │   ├── auth/                          # Authentication pages
│   │   │   ├── LoginForm.jsx              # Login component
│   │   │   ├── RegisterForm.jsx           # Registration component
│   │   │   ├── ForgotPassword.jsx         # Password reset
│   │   │   ├── ProtectedRoute.jsx         # Route protection
│   │   │   └── index.js                   # Feature exports
│   │   ├── events/                        # Event Management pages
│   │   │   ├── coordinatorDashboard.jsx   # Coordinator dashboard
│   │   │   ├── EventDashboard.jsx         # Event dashboard
│   │   │   ├── CertificateManagement.jsx  # Certificate management
│   │   │   ├── ErrorBoundary.jsx          # Error handling
│   │   │   ├── hod/                       # HOD-specific pages
│   │   │   │   ├── dashboard.jsx          # HOD dashboard
│   │   │   │   ├── EventDashboard.jsx     # HOD event dashboard
│   │   │   │   ├── Components/            # HOD components
│   │   │   │   ├── drawerPages/           # HOD drawer pages
│   │   │   │   └── utils/                 # HOD utilities
│   │   │   └── index.js                   # Feature exports
│   │   ├── claims/                        # Claims Management (to be organized)
│   │   ├── certificates/                  # Certificate Management (to be organized)
│   │   ├── participants/                  # Participant pages
│   │   │   ├── CertificatePage.jsx        # Certificate page
│   │   │   ├── Components/                # Participant components
│   │   │   │   ├── EnhancedDashboard.jsx  # Enhanced dashboard
│   │   │   │   ├── EnhancedEventsList.jsx # Events list
│   │   │   │   ├── EnhancedCertificates.jsx # Certificates view
│   │   │   │   ├── EnhancedFeedbackPortal.jsx # Feedback portal
│   │   │   │   └── ...                    # Other components
│   │   │   └── index.js                   # Feature exports
│   │   ├── documents/                     # Document Management (to be organized)
│   │   ├── feedback/                      # Feedback pages
│   │   │   ├── feedback.jsx               # Feedback component
│   │   │   └── index.js                   # Feature exports
│   │   └── admin/                         # Admin pages (to be organized)
│   ├── shared/                            # Shared resources
│   │   ├── components/                    # Reusable components
│   │   │   ├── AddParticipantModal.jsx    # Add participant modal
│   │   │   ├── CertificateGenerator.jsx   # Certificate generator
│   │   │   ├── ClaimManagement.jsx        # Claim management
│   │   │   ├── OrganizingCommitteeManager.jsx # Committee manager
│   │   │   └── ...                        # Other shared components
│   │   ├── services/                      # API services
│   │   │   ├── api.js                     # Main API service
│   │   │   ├── brochureGenerator.js       # Brochure generation
│   │   │   ├── certificateService.js      # Certificate service
│   │   │   └── index.js                   # Services exports
│   │   ├── utils/                         # Shared utilities
│   │   │   ├── apiUtils.js                # API utilities
│   │   │   ├── axiosConfig.js             # Axios configuration
│   │   │   └── index.js                   # Utils exports
│   │   ├── constants/                     # Application constants
│   │   │   ├── enums.js                   # Enumerations
│   │   │   ├── universityInfo.js          # University information
│   │   │   └── index.js                   # Constants exports
│   │   ├── context/                       # React contexts
│   │   │   ├── eventProvider.jsx          # Event context
│   │   │   ├── pendingEventContext.js     # Pending events context
│   │   │   └── index.js                   # Context exports
│   │   ├── hooks/                         # Custom React hooks
│   │   │   └── index.js                   # Hooks exports
│   │   └── index.js                       # Shared exports
│   ├── styles/                            # Global styles
│   ├── modules/                           # Legacy modules (to be refactored)
│   ├── App.jsx                            # Main App component
│   └── main.jsx                           # Entry point
├── public/                                # Static assets
├── index.html                             # HTML template
├── package.json                           # Dependencies and scripts
└── vite.config.js                         # Vite configuration
```

## 🔄 Migration Status

### ✅ Completed
- **Backend Structure**: Fully reorganized with feature-based architecture
- **Shared Modules**: All shared resources moved to appropriate locations
- **Index Files**: Created for easy imports and exports
- **Server Configuration**: Updated to use new structure
- **Package.json**: Updated to point to new server location

### 🚧 In Progress
- **Frontend Structure**: Partially reorganized, needs completion
- **Import Updates**: Need to update import statements throughout the codebase
- **Route Updates**: Update route imports in server.js

### 📋 TODO
- **Complete Frontend Migration**: Move remaining components to feature folders
- **Update Import Statements**: Update all import paths to use new structure
- **Create Feature Services**: Extract business logic into feature-specific services
- **Add Type Definitions**: Add TypeScript definitions for better development experience
- **Update Documentation**: Update API documentation to reflect new structure

## 🎯 Benefits of New Structure

### 1. **Feature Cohesion**
- Related files are co-located
- Easier to understand feature boundaries
- Simplified feature development and maintenance

### 2. **Scalability**
- Easy to add new features without affecting existing code
- Clear separation of concerns
- Modular architecture supports team development

### 3. **Maintainability**
- Reduced cognitive load when working on specific features
- Clear dependency management
- Easier testing and debugging

### 4. **Code Reusability**
- Shared components and utilities are centralized
- Consistent patterns across features
- Reduced code duplication

## 🚀 Development Workflow

### Adding a New Feature

1. **Create Feature Directory**
   ```bash
   mkdir src/features/new-feature
   mkdir src/features/new-feature/{controllers,routes,services}
   ```

2. **Create Feature Files**
   - Add controllers in `controllers/`
   - Add routes in `routes/`
   - Add business logic in `services/`
   - Create `index.js` for exports

3. **Update Main Server**
   - Import feature routes in `server.js`
   - Register routes with appropriate prefix

4. **Add Frontend Components**
   - Create feature directory in Frontend
   - Add components, pages, and feature-specific logic
   - Update routing in `App.jsx`

### Working with Existing Features

1. **Locate Feature**: Find the feature directory
2. **Understand Structure**: Check `index.js` for available exports
3. **Make Changes**: Modify controllers, services, or routes as needed
4. **Update Exports**: Add new exports to `index.js` if needed

## 📚 Import Patterns

### Backend Imports
```javascript
// Feature imports
import { authRoutes } from './features/auth/index.js';
import { coordinatorRoutes } from './features/events/index.js';

// Shared imports
import { db } from './shared/index.js';
import { Event, User } from './shared/models/index.js';
```

### Frontend Imports
```javascript
// Feature imports
import { LoginForm, ProtectedRoute } from '../features/auth/index.js';
import { CoordinatorDashboard } from '../features/events/index.js';

// Shared imports
import { api } from '../shared/services/index.js';
import { AddParticipantModal } from '../shared/components/index.js';
```

## 🔧 Configuration Updates

### Package.json Scripts
```json
{
  "scripts": {
    "start": "node src/server.js",
    "dev": "nodemon src/server.js"
  }
}
```

### Environment Variables
- `.env` file remains in Backend root
- Server configuration updated to find `.env` file correctly

## 📈 Next Steps

1. **Complete Frontend Migration**: Finish moving all components to feature folders
2. **Update Import Statements**: Systematically update all import paths
3. **Add Feature Tests**: Create tests for each feature module
4. **Documentation**: Update API documentation and add feature-specific docs
5. **Performance Optimization**: Implement lazy loading for feature modules
6. **Type Safety**: Add TypeScript for better development experience

## 🤝 Contributing

When contributing to this project:

1. **Follow the Structure**: Place new files in appropriate feature directories
2. **Update Exports**: Add new exports to feature `index.js` files
3. **Use Shared Resources**: Leverage shared components and utilities
4. **Document Changes**: Update this document when adding new features
5. **Test Thoroughly**: Ensure changes don't break existing functionality

---

This new structure provides a solid foundation for the Events Management Application, making it more maintainable, scalable, and developer-friendly.