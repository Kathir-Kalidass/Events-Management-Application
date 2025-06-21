import React from 'react';
import {BrowserRouter as Router, Routes, Route} from "react-router-dom"
import Home from './pages/Home/Home';
import ParticipantDashboard from './pages/Participants/dashboard';
import RegisterForm from './pages/Auth/RegisterForm';
import LoginForm from './pages/Auth/LoginForm';
import HodDashboard from './pages/HOD/dashboard';
import Feedback from './pages/Feedback/feedback';
import ForgotPassword from './pages/Auth/ForgotPassword';
import ProtectedRoute from './pages/Auth/ProtectedRoute';
import CertificatePage from './pages/Participants/CertificatePage';
import CoordinatorDashboard from './pages/coordinator/coordinatorDashboard'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home/>}></Route>
        <Route path="/register/:role" element={<RegisterForm />} />
        <Route path="/login/:role" element={<LoginForm />} />
        <Route path="/forgot-password/:role" element={<ForgotPassword />} />
        <Route path="/participant/dashboard" element={
          <ProtectedRoute allowedRole="participant">
            <ParticipantDashboard />
          </ProtectedRoute>
        } />
        <Route path="/participant/certificate" element={
          <ProtectedRoute allowedRole="participant">
            <CertificatePage />
          </ProtectedRoute>
        } />

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
        <Route path="/participant/feedback" element={<Feedback/>}></Route>  
      </Routes>
    </Router>
  )
}

export default App
