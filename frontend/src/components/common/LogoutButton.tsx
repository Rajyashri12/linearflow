import { signOut } from "firebase/auth";
import { auth } from "../../config/firebase";
import { useNavigate } from "react-router-dom";
import { LogOut, Loader2 } from "lucide-react";
import { useState } from "react";

const LogoutButton = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    try {
      await signOut(auth);
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
      alert("Failed to logout. Please try again.");
      setLoading(false);
      setShowConfirm(false);
    }
  };

  if (showConfirm) {
    return (
      <div className="relative">
        <div className="absolute right-0 top-12 z-50 bg-white rounded-2xl shadow-2xl border border-gray-200 p-5 w-72 animate-slideDown">
          <div className="mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-red-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <LogOut className="w-6 h-6 text-red-600" />
            </div>
            <p className="text-center text-base font-semibold text-gray-900 mb-1">
              Confirm Logout
            </p>
            <p className="text-center text-sm text-gray-600">
              Are you sure you want to end your session?
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleLogout}
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-xl transition-all shadow-md hover:shadow-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Please wait...</span>
                </>
              ) : (
                <>
                  <LogOut className="w-4 h-4" />
                  <span>Yes, Logout</span>
                </>
              )}
            </button>
            <button
              onClick={() => setShowConfirm(false)}
              disabled={loading}
              className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
            >
              Cancel
            </button>
          </div>
        </div>
        {/* Backdrop overlay */}
        <div 
          className="fixed inset-0 bg-black bg-opacity-20 z-40 animate-fadeIn"
          onClick={() => setShowConfirm(false)}
        ></div>
      </div>
    );
  }

  return (
    <button
      onClick={() => setShowConfirm(true)}
      className="group relative flex items-center justify-center gap-2.5 px-5 py-2.5 bg-gradient-to-r from-red-50 via-red-100 to-pink-50 hover:from-red-500 hover:to-pink-600 border-2 border-red-200 hover:border-red-500 text-red-700 hover:text-white rounded-2xl transition-all duration-300 font-semibold shadow-md hover:shadow-xl transform hover:scale-105 overflow-hidden"
    >
      {/* Animated background shimmer */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-20 transition-opacity duration-500 -translate-x-full group-hover:translate-x-full pointer-events-none"
           style={{ width: '200%' }}>
      </div>
      
      <LogOut className="w-5 h-5 transition-all duration-300 group-hover:scale-110 group-hover:rotate-12 relative z-10" />
      <span className="hidden sm:inline relative z-10 font-bold">Logout</span>
      
      {/* Pulse effect on hover */}
      <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
        <div className="absolute inset-0 rounded-2xl bg-red-400 animate-ping opacity-20"></div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out forwards;
        }
        
        .animate-slideDown {
          animation: slideDown 0.3s ease-out forwards;
        }
      `}</style>
    </button>
  );
};

export default LogoutButton;