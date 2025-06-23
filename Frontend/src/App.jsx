import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home/Home";
import ParticipantDashboard from "./pages/Participants/Components/dashboard";
import RegisterForm from "./pages/Auth/RegisterForm";
import LoginForm from "./pages/Auth/LoginForm";
import HodDashboard from "./pages/HOD/dashboard";
//import ParticipantDashboard from './pages/Participants/Components/dashboard';
import Form from "./pages/Participants/Components/Form";
import Feedback from "./pages/Feedback/feedback";
import ForgotPassword from "./pages/Auth/ForgotPassword";
import ProtectedRoute from "./pages/Auth/ProtectedRoute";
import CertificatePage from "./pages/Participants/CertificatePage";
import CoordinatorDashboard from "./pages/coordinator/coordinatorDashboard";
//import LoginForm from './pages/Auth/LoginForm';
//import HodDashboard from './pages/HOD/dashboard';
//import ForgotPassword from './pages/Auth/ForgotPassword';
//import ProtectedRoute from './pages/Auth/ProtectedRoute';
//import CoordinatorDashboard from './pages/coordinator/coordinatorDashboard'

function App() {
  // Dummy user for demonstration; replace with real user context/provider
  const user = { _id: "6857dbb542e87e57a8748a61s" };

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />}></Route>
        <Route path="/register/:role" element={<Form />} />
        <Route path="/login/:role" element={<LoginForm />} />
        <Route path="/forgot-password/:role" element={<ForgotPassword />} />
        <Route
          path="/participant/dashboard"
          element={
             <ProtectedRoute allowedRole="participant">
            <ParticipantDashboard />
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
        <Route path="/participant/feedback" element={<Feedback />}></Route>
        <Route path="/certificate" element={<CertificatePage/>}></Route>
      </Routes>
    </Router>
  );
}

export default App;
