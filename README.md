# Events Management Application

A comprehensive web application for managing educational events, training programs, workshops, and certificate courses at Anna University. The system provides role-based access for HODs, Coordinators, and Participants with features for event creation, registration, brochure generation, and certificate management.

## 🌟 Features

### 🏢 Multi-Role System
- **HOD (Head of Department)**: Create events, manage organizing committees, approve/reject events
- **Coordinator**: Manage assigned events, generate documents, handle participant registrations
- **Participant**: Register for events, view certificates, provide feedback

### 📋 Event Management
- **Dynamic Event Creation**: Customizable event types (workshops, training programs, seminars, courses)
- **Organizing Committee Management**: Add committee members with roles and designations
- **Registration Procedure Configuration**: Flexible registration forms, payment details, evaluation criteria
- **Event Dashboard**: Real-time statistics and participant management

### 📄 Document Generation
- **Professional Brochures**: AI-enhanced brochures with Anna University branding
- **Dynamic Content**: Auto-generated course descriptions based on event data
- **Registration Forms**: Customizable forms integrated into brochures
- **Certificate Generation**: Automated certificate generation for participants
- **PDF Management**: Save, download, and manage all generated documents

### 🎨 Brochure Features
- **Professional Layout**: Two-column design with Anna University logo and branding
- **AI-Enhanced Descriptions**: Intelligent course descriptions based on event type and content
- **Dynamic Sections**: 
  - About the University/Department
  - Event Information
  - Organizing Committee (from database)
  - Registration Information
  - Payment Details
  - Contact Information
- **Responsive Design**: Optimized for printing and digital viewing

### 🔐 Authentication & Security
- **JWT-based Authentication**: Secure login system
- **Role-based Authorization**: Different access levels for different user types
- **Password Encryption**: Bcrypt-secured password storage
- **Session Management**: Automatic token refresh and logout

### 📊 Analytics & Reporting
- **Event Statistics**: Participant counts, completion rates, feedback scores
- **Dashboard Analytics**: Visual charts and graphs using Recharts
- **Export Capabilities**: Download participant lists, certificates, and reports

## 🛠️ Technology Stack

### Frontend
- **React 19.1.0**: Modern React with hooks and functional components
- **Material-UI (MUI) 7.1.1**: Professional UI components and theming
- **Vite**: Fast development server and build tool
- **React Router DOM 7.6.2**: Client-side routing
- **Axios 1.10.0**: HTTP client for API calls
- **jsPDF 3.0.1**: PDF generation for brochures and documents
- **Recharts 2.15.3**: Data visualization and charts
- **Notistack 3.0.2**: Toast notifications

### Backend
- **Node.js**: JavaScript runtime environment
- **Express.js 5.1.0**: Web application framework
- **MongoDB**: NoSQL database for data storage
- **Mongoose 8.16.1**: MongoDB object modeling
- **JWT**: JSON Web Tokens for authentication
- **Bcrypt 6.0.0**: Password hashing
- **Multer 2.0.1**: File upload handling
- **PDFKit 0.17.1**: Server-side PDF generation
- **Nodemailer 7.0.4**: Email sending capabilities

## 🚀 Quick Start

### Prerequisites
- **Node.js** (v16 or higher)
- **MongoDB** (v4.4 or higher)
- **Git**

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/DhanushT7/Events-Management-Application.git
   cd Events-Management-Application
   ```

2. **Install root dependencies**
   ```bash
   npm install
   ```

3. **Install Frontend dependencies**
   ```bash
   cd Frontend
   npm install
   cd ..
   ```

4. **Install Backend dependencies**
   ```bash
   cd Backend
   npm install
   cd ..
   ```

### Configuration

1. **Backend Environment Setup**
   Create a `.env` file in the `Backend` directory:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/events-management
   JWT_SECRET=your-super-secret-jwt-key
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password
   ```

2. **Frontend Configuration**
   Update API base URL in `Frontend/src/services/api.js` if needed:
   ```javascript
   const API_BASE_URL = 'http://localhost:5000/api';
   ```

### Database Setup

1. **Start MongoDB**
   ```bash
   # For Windows (if MongoDB is installed as service)
   net start MongoDB
   
   # For macOS/Linux
   sudo systemctl start mongod
   # OR
   mongod
   ```

2. **Create Sample Data (Optional)**
   ```bash
   node create-sample-data.js
   ```

### Running the Application

#### Option 1: Run Both Servers Simultaneously
```bash
# From root directory
npm run dev
```

#### Option 2: Run Servers Separately

**Terminal 1 - Backend Server**
```bash
npm run backend
# OR
cd Backend && npm start
```

**Terminal 2 - Frontend Development Server**
```bash
npm run frontend
# OR
cd Frontend && npm run dev
```

### Using VS Code Tasks
If using VS Code, you can use the predefined task:
```bash
# Use Ctrl+Shift+P -> "Tasks: Run Task" -> "Start Backend Server"
```

## 📱 Application Access

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000
- **MongoDB**: mongodb://localhost:27017

## 👥 Default User Accounts

After running sample data creation:

### HOD Account
- **Email**: hod@annauniv.edu
- **Password**: hod123
- **Role**: Head of Department

### Coordinator Account
- **Email**: coordinator@annauniv.edu
- **Password**: coord123
- **Role**: Coordinator

### Participant Account
- **Email**: participant@annauniv.edu
- **Password**: part123
- **Role**: Participant

## 📁 Project Structure

```
Events-Management-Application/
├── Backend/                          # Backend server
│   ├── config/
│   │   └── db.js                    # Database configuration
│   ├── controllers/                 # Route controllers
│   │   ├── auth/                   # Authentication controllers
│   │   ├── coordinator/            # Coordinator-specific controllers
│   │   ├── hod/                    # HOD-specific controllers
│   │   └── participant/            # Participant-specific controllers
│   ├── middleware/                 # Custom middleware
│   ├── models/                     # MongoDB schemas
│   ├── routes/                     # API routes
│   ├── passwordManager/            # Encryption/Decryption utilities
│   ├── server.js                   # Main server file
│   └── package.json
├── Frontend/                        # React frontend
│   ├── public/                     # Static assets
│   ├── src/
│   │   ├── components/             # Reusable components
│   │   ├── context/                # React context providers
│   │   ├── pages/                  # Page components
│   │   │   ├── Auth/              # Authentication pages
│   │   │   ├── coordinator/       # Coordinator dashboard
│   │   │   ├── HOD/               # HOD dashboard
│   │   │   └── Participants/      # Participant pages
│   │   ├── services/              # API services and utilities
│   │   │   ├── api.js             # API configuration
│   │   │   └── brochureGenerator.js # Professional brochure generation
│   │   ├── styles/                # CSS stylesheets
│   │   ├── App.jsx                # Main App component
│   │   └── main.jsx               # Entry point
│   ├── package.json
│   └── vite.config.js
├── data/                           # MongoDB data files
├── create-sample-data.js           # Sample data creation script
├── package.json                    # Root package.json
└── README.md                       # This file
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/forgot-password` - Password reset

### HOD Routes
- `GET /api/hod/dashboard` - HOD dashboard data
- `POST /api/hod/events` - Create new event
- `GET /api/hod/events` - Get all events
- `PUT /api/hod/events/:id/status` - Update event status
- `POST /api/hod/committee` - Add organizing committee members

### Coordinator Routes
- `GET /api/coordinator/dashboard` - Coordinator dashboard
- `GET /api/coordinator/events/:id` - Get specific event details
- `POST /api/coordinator/brochure/:eventId` - Generate and save brochure
- `GET /api/coordinator/brochure/:eventId` - Download brochure PDF
- `GET /api/coordinator/participants/:eventId` - Get event participants

### Participant Routes
- `GET /api/participant/dashboard` - Participant dashboard
- `POST /api/participant/register/:eventId` - Register for event
- `GET /api/participant/events/completed` - Get completed events
- `POST /api/participant/feedback` - Submit event feedback

## 🎨 Brochure Generation System

### Features
- **Professional Layout**: Anna University branded header and footer
- **AI-Enhanced Content**: Intelligent course descriptions based on event data
- **Dynamic Sections**: All content pulled from database
- **Responsive Design**: Optimized for both digital viewing and printing
- **PDF Export**: High-quality PDF generation using jsPDF

### Usage

#### For Coordinators
1. Navigate to Event Dashboard
2. Select an event
3. Click "Generate Brochure"
4. Brochure is automatically saved and can be downloaded

#### For HODs
1. Access HOD Dashboard
2. View event details
3. Generate brochure from event overview
4. Review and approve before distribution

### Customization
The brochure generator supports:
- Custom event types and durations
- Dynamic organizing committee display
- Flexible registration procedures
- Intelligent content generation based on event data
- Professional formatting with consistent styling

## 🔄 Development Workflow

### Adding New Features
1. **Backend**: Add routes in `Backend/routes/`, controllers in `Backend/controllers/`
2. **Frontend**: Create components in `Frontend/src/components/` or pages in `Frontend/src/pages/`
3. **Database**: Update models in `Backend/models/`
4. **API Integration**: Update services in `Frontend/src/services/`

### Code Style
- **ES6+ JavaScript**: Use modern JavaScript features
- **Functional Components**: React functional components with hooks
- **Async/Await**: Prefer async/await over promises
- **Error Handling**: Proper error handling with try-catch blocks

## 🧪 Testing

### Backend Testing
```bash
cd Backend
npm test
```

### Frontend Testing
```bash
cd Frontend
npm test
```

## 📦 Building for Production

### Frontend Build
```bash
cd Frontend
npm run build
```

### Backend Production
```bash
cd Backend
NODE_ENV=production npm start
```

## 🚀 Deployment

### Frontend Deployment (Vercel/Netlify)
1. Build the frontend: `npm run build`
2. Deploy the `dist` folder
3. Update API base URL in environment variables

### Backend Deployment (Heroku/Railway)
1. Set environment variables
2. Deploy the Backend folder
3. Configure MongoDB connection string

### Full Stack Deployment
Consider using platforms like:
- **Vercel** + **Railway**
- **Netlify** + **Heroku**
- **AWS** (Frontend: S3+CloudFront, Backend: EC2/Lambda)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Commit changes: `git commit -am 'Add new feature'`
4. Push to branch: `git push origin feature/new-feature`
5. Submit a Pull Request

## 📄 License

This project is licensed under the ISC License - see the LICENSE file for details.

## 👨‍💻 Authors

- **Dhanush T** - *Initial work* - [DhanushT7](https://github.com/DhanushT7)

## 🙏 Acknowledgments

- Anna University for institutional support
- Material-UI team for excellent React components
- MongoDB team for reliable database solutions
- React and Node.js communities for robust frameworks

## 📞 Support

For support, email: dhanush@annauniv.edu or create an issue in the GitHub repository.

## 🔮 Future Enhancements

- [ ] Mobile application (React Native)
- [ ] Advanced analytics and reporting
- [ ] Integration with university LMS
- [ ] Automated email notifications
- [ ] Multi-language support
- [ ] Advanced PDF customization
- [ ] Integration with payment gateways
- [ ] Real-time chat support
- [ ] Calendar integration
- [ ] Advanced user roles and permissions

---

**Note**: This application is designed specifically for Anna University's event management needs but can be adapted for other educational institutions with minimal modifications.
