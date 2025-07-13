import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { SnackbarProvider } from 'notistack';
import Home from "./pages/Home/Home";
import EnhancedParticipantDashboard from "./pages/Participants/Components/EnhancedDashboard";
import RegisterForm from "./pages/Auth/RegisterForm";
import LoginForm from "./pages/Auth/LoginForm";
import HodDashboard from "./pages/HOD/dashboard";
import Form from "./pages/Participants/Components/Form";
import Feedback from "./pages/Feedback/feedback";
import ForgotPassword from "./pages/Auth/ForgotPassword";
import ProtectedRoute from "./pages/Auth/ProtectedRoute";
import CertificatePage from "./pages/Participants/CertificatePage";
import CoordinatorDashboard from "./pages/coordinator/coordinatorDashboard";
import CoordinatorEventDashboard from "./pages/coordinator/EventDashboard";
import HODEventDashboard from "./pages/HOD/EventDashboard";
import CertificateVerification from "./components/CertificateVerification";
import CertificateManagement from "./pages/coordinator/CertificateManagement";

function App() {
  return (
    <SnackbarProvider 
      maxSnack={3}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'right',
      }}
    >
      <Router>
        <Routes>
          <Route path="/" element={<Home />}></Route>
          <Route path="/register/:role" element={<RegisterForm />} />
          <Route path="/login/:role" element={<LoginForm />} />
          <Route path="/forgot-password/:role" element={<ForgotPassword />} />
          <Route
            path="/participant/dashboard"
            element={
               <ProtectedRoute allowedRole="participant">
              <EnhancedParticipantDashboard />
               </ProtectedRoute>
            }
          />
          <Route path="/participant/register" element={<Form />} />
           <Route path="/coordinator/dashboard" element={
            <ProtectedRoute allowedRole="coordinator">
              <CoordinatorDashboard/>
            </ProtectedRoute>
          } />

          <Route path="/hod/dashboard" element={
            <ProtectedRoute allowedRole="hod">
              <HodDashboard />
            </ProtectedRoute>
          } />
          <Route path="/hod/event/:eventId" element={
            <ProtectedRoute allowedRole="hod">
              <HODEventDashboard />
            </ProtectedRoute>
          } />
          <Route path="/coordinator/event/:eventId" element={
            <ProtectedRoute allowedRole="coordinator">
              <CoordinatorEventDashboard />
            </ProtectedRoute>
          } />
          <Route path="/coordinator/certificates" element={
            <ProtectedRoute allowedRole="coordinator">
              <CertificateManagement />
            </ProtectedRoute>
          } /> 
          <Route path="/participant/feedback" element={<Feedback />}></Route>
          <Route path="/certificate" element={<CertificatePage/>}></Route>
          <Route path="/verify-certificate" element={<CertificateVerification />}></Route>
          <Route path="/verify-certificate/:certificateId" element={<CertificateVerification />}></Route>
        </Routes>
      </Router>
    </SnackbarProvider>
  );
}

export default App;
