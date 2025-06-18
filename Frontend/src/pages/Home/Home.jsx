import React from 'react';
import { Link } from "react-router-dom";
import "../../styles/Home.css";

const Home = () => {
  return (
    <div className="home-container">
      <h2 className="home-title">Select Your Role:</h2>
      <div className="role-links">
        <Link to="/login/coordinator">Coordinator</Link>
        <Link to="/login/hod">HOD</Link>
        <Link to="/login/participant">Participant</Link>
      </div>
    </div>
  );
};

export default Home;
