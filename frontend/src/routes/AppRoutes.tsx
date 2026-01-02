import { Routes, Route, Navigate } from "react-router-dom";
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import Dashboard from "../pages/dashboard/Dashboard";
import ProtectedRoute from "./ProtectedRoute";
import Attendance from "../pages/attendance/Attendance";
import ApplyEvent from "../pages/events/ApplyEvent";

const AppRoutes = () => {
  return (
    <Routes>
      {/* --- PUBLIC ROUTES --- */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* --- PROTECTED ROUTES --- */}
      {/* By wrapping a group of routes in one ProtectedRoute, 
          you don't have to repeat the code for every page. */}
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/attendance" element={<Attendance />} />
        
        {/* Only the Committee Head should usually see this */}
        <Route path="/events/apply" element={<ApplyEvent />} />
      </Route>

      {/* --- 404 SAFETY NET --- */}
      <Route 
        path="*" 
        element={
          <div style={styles.errorPage}>
            <h1>404</h1>
            <p>Oops! This page doesn't exist.</p>
            <button onClick={() => window.location.href = "/dashboard"} style={styles.btn}>
              Back to Safety
            </button>
          </div>
        } 
      />
    </Routes>
  );
};

const styles = {
  errorPage: { textAlign: "center" as const, marginTop: "100px", fontFamily: "sans-serif" },
  btn: { padding: "10px 20px", cursor: "pointer", background: "#3b82f6", color: "#fff", border: "none", borderRadius: "5px" }
};

export default AppRoutes;