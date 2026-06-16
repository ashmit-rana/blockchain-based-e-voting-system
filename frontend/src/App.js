import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import VoterPortal from "./pages/VoterPortal/VoterPortal";
import AdminDashboard from "./pages/AdminDashboard/AdminDashboard";
import Results from "./pages/Results/Results";

const ProtectedRoute = ({ children, requiredRole }) => {
  const { token, role } = useAuth();
  if (!token) return <Navigate to="/" />;
  if (requiredRole && role !== requiredRole) return <Navigate to="/" />;
  return children;
};

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/voter" element={<VoterPortal />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/results" element={<Results />} />
      </Routes>
    </Router>
  );
}

export default App;