import React from 'react';
import { Link } from "react-router-dom";
import "../../styles/Home.css";

const Home = () => {
  return (
    <div className="home-wrapper">

      {/* ===== Header/Navbar ===== */}
      <header className="navbar">
        <div className="navbar-left">
          <img src="/anna-university-logo.jpg" alt="Logo" className="logo" />
          <span className="app-title">Events Management System</span>
        </div>
        <nav className="navbar-right">
          <a href="#">Home</a>
          <a href="#">Services</a>
          <a href="#">About Us</a>
          <a href="#">Team</a>
          <a href="#">Contact</a>
        </nav>
      </header>

      {/* ===== Hero Section ===== */}
      <section className="hero">
        <img src="/anna univ photo.avif" alt="Anna University" className="hero-image" />
      </section>

      {/* ===== Role Login Selector ===== */}
      <section className="role-section">
        <h2 className="home-title">Select Your Role:</h2>
        <div className="role-links">
          <Link to="/login/coordinator">Coordinator</Link>
          <Link to="/login/hod">HOD</Link>
          <Link to="/login/participant">Participant</Link>
        </div>
      </section>

      {/* ===== Footer ===== */}
      <footer className="footer">
        © 2025 Events Management System. All rights reserved.
      </footer>

    </div>
  );
};

export default Home;
