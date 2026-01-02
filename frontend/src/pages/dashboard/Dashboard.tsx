import { useAuth } from "../../context/AuthContext";
import StudentDashboard from "./StudentDashboard";
import AdminDashboard from "./AdminDashboard";
import HodDashboard from "./HodDashboard";
import TeacherDashboard from "./TeacherDashboard";
import CommitteeHeadDashboard from "./CommitteeHeadDashboard";
import PrincipalDashboard from "./PrincipalDashboard";
import { Loader2, Shield, UserCircle } from "lucide-react";

const Dashboard = () => {
  const { role, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative inline-block">
            {/* Animated Background Circle */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full opacity-20 animate-pulse"></div>
            
            {/* Spinner */}
            <div className="relative w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-lg">
              <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
            </div>
          </div>
          
          <h2 className="mt-6 text-xl font-bold text-gray-900">Loading Dashboard</h2>
          <p className="mt-2 text-gray-600">Please wait while we prepare your workspace...</p>
        </div>
      </div>
    );
  }

  console.log("Logged in role:", role); // 👈 DEBUG (important)

  // Role-based dashboard mapping with visual feedback
  const renderDashboard = () => {
    switch (role) {
      case "admin":
        return <AdminDashboard />;

      case "hod":
        return <HodDashboard />;

      case "teacher":
        return <TeacherDashboard />;

      case "committee_head":
        return <CommitteeHeadDashboard />;

      case "principal":
        return <PrincipalDashboard />;

      case "student":
        return <StudentDashboard />;

      default:
        // Fallback for unknown roles
        return (
          <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-6">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 max-w-md w-full text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-red-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-red-600" />
              </div>
              
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Not Configured</h2>
              <p className="text-gray-600 mb-6">
                Your role <span className="font-semibold text-gray-900">"{role}"</span> doesn't have a dashboard configured yet.
              </p>
              
              <div className="space-y-3">
                <button 
                  onClick={() => window.location.reload()} 
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium py-3 px-6 rounded-lg transition-all shadow-sm"
                >
                  Refresh Page
                </button>
                <button 
                  onClick={() => window.history.back()} 
                  className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-6 rounded-lg transition-colors"
                >
                  Go Back
                </button>
              </div>
              
              <p className="text-xs text-gray-500 mt-6">
                If this problem persists, please contact your system administrator.
              </p>
            </div>
          </div>
        );
    }
  };

  return (
    <>
      {renderDashboard()}
      
      {/* Optional: Role Indicator Badge (can be removed if not needed) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-4 right-4 bg-white border border-gray-200 shadow-lg rounded-lg px-4 py-2 flex items-center space-x-2 z-50">
          <UserCircle className="w-4 h-4 text-blue-600" />
          <span className="text-xs font-medium text-gray-700">
            Role: <span className="text-blue-600">{role || "Unknown"}</span>
          </span>
        </div>
      )}
    </>
  );
};

export default Dashboard;