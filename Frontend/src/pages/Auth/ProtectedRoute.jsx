import React from "react";
import { Navigate, useLocation } from "react-router-dom";

const ProtectedRoute = ({ children, allowedRole }) => {
  const user = JSON.parse(localStorage.getItem("user")); // { name, email, role, dept }
  const location = useLocation();

  if (!user) {
    alert("Please login to continue.");
    return <Navigate to={`/login/${allowedRole}`} state={{ from: location }} replace />;
  }

  if (user.role !== allowedRole) {
    alert("Access denied: You are not authorized for this route.");
    return <Navigate to={`/login/${user.role}`} replace />;
  }

  return children;
};

export default ProtectedRoute;
