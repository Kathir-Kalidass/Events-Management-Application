import React from 'react';
import {BrowserRouter as Router, Routes, Route} from "react-router-dom"
import Home from './pages/Home/Home';
import ParticipantDashboard from './pages/Participants/dashboard';
import CoordinatorDashboard from './pages/coordinator/dashboard';
import RegisterForm from './pages/Auth/RegisterForm';
import LoginForm from './pages/Auth/LoginForm';
import HodDashboard from './pages/HOD/dashboard';
import Feedback from './pages/Feedback/feedback';
import ForgotPassword from './pages/Auth/ForgotPassword';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home/>}></Route>
        <Route path="/register/:role" element={<RegisterForm />} />
        <Route path="/login/:role" element={<LoginForm />} />
        <Route path="/participant/dashboard" element={<ParticipantDashboard/>}></Route>
        <Route path="/coordinator/dashboard" element={<CoordinatorDashboard/>}></Route>
        <Route path="/hod/dashboard" element={<HodDashboard/>}></Route>
        <Route path="/participant/feedback" element={<Feedback/>}></Route>
        <Route path="/forgot-password/:role" element={<ForgotPassword />} />
      </Routes>
    </Router>
  )
}

export default App
