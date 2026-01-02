import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../services/api";
import DashboardLayout from "../../components/layout/DashboardLayout";
import LogoutButton from "../../components/common/LogoutButton";
import { 
  Calendar, CheckCircle, Clock, XCircle, AlertCircle, 
  Plus, Search 
} from "lucide-react";

const StudentDashboard = () => {
  const { user } = useAuth();
  const [attendance, setAttendance] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const loadAttendance = async () => {
    if (!user) return;

    try {
      const data = await api.get(`/attendance?studentUid=${user.uid}`);
      setAttendance(data);
    } catch (err) {
      console.error("Failed to load attendance", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAttendance();
  }, [user]);

  const getStatusConfig = (approvalStatus: string) => {
    const configs: Record<string, { icon: any; color: string; bg: string; label: string }> = {
      APPROVED_BY_ADMIN: { 
        icon: CheckCircle, 
        color: "text-green-700", 
        bg: "bg-green-50", 
        label: "Approved" 
      },
      FORWARDED_TO_TEACHER: { 
        icon: CheckCircle, 
        color: "text-green-700", 
        bg: "bg-green-50", 
        label: "Approved" 
      },
      PENDING_ADMIN: { 
        icon: Clock, 
        color: "text-amber-700", 
        bg: "bg-amber-50", 
        label: "Pending" 
      },
      REJECTED_BY_ADMIN: { 
        icon: XCircle, 
        color: "text-red-700", 
        bg: "bg-red-50", 
        label: "Rejected" 
      },
    };
    return configs[approvalStatus] || { 
      icon: AlertCircle, 
      color: "text-gray-700", 
      bg: "bg-gray-50", 
      label: approvalStatus 
    };
  };

  const filteredAttendance = attendance.filter((a) => 
    a.date?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.status?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.eventTitle?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = [
    {
      label: "Total Records",
      value: attendance.length,
      icon: Calendar,
      color: "from-blue-500 to-indigo-500"
    },
    {
      label: "Approved",
      value: attendance.filter(a => 
        a.approvalStatus === "APPROVED_BY_ADMIN" || 
        a.approvalStatus === "FORWARDED_TO_TEACHER"
      ).length,
      icon: CheckCircle,
      color: "from-green-500 to-emerald-500"
    },
    {
      label: "Pending",
      value: attendance.filter(a => a.approvalStatus === "PENDING_ADMIN").length,
      icon: Clock,
      color: "from-amber-500 to-orange-500"
    },
  ];

  return (
    <DashboardLayout
      title={
        <div className="flex justify-between items-center w-full gap-6">
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Student Dashboard
            </h1>
            <p className="text-sm text-gray-500 mt-1">Track your attendance records</p>
          </div>

          <div className="flex items-center gap-4">
            {/* User Profile Info - Matches Principal/Teacher Style */}
            {user && (
              <div className="hidden sm:flex items-center gap-3 px-5 py-3 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border border-gray-200 shadow-sm">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-md">
                  {user.email?.charAt(0).toUpperCase()}
                </div>
                <div className="text-left">
                  <p className="text-xs text-gray-500 font-semibold">Logged in as</p>
                  <p className="text-sm text-gray-900 font-bold">{user.email}</p>
                </div>
              </div>
            )}
            
            {/* Logout Action */}
            <LogoutButton />
          </div>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stats.map((stat, idx) => (
            <div key={idx} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm font-medium">{stat.label}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                </div>
                <div className={`w-14 h-14 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center`}>
                  <stat.icon className="w-7 h-7 text-white" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Actions and Search Bar */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <Link to="/attendance" className="w-full md:w-auto">
              <button className="w-full md:w-auto flex items-center justify-center space-x-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium py-3 px-6 rounded-lg transition-all shadow-sm hover:shadow-md">
                <Plus className="w-5 h-5" />
                <span>Mark Attendance</span>
              </button>
            </Link>

            <div className="flex-1 md:max-w-md w-full relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search records..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="bg-white rounded-2xl p-12 shadow-sm border border-gray-100 text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-gray-600 font-medium">Loading attendance records...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredAttendance.length === 0 && (
          <div className="bg-white rounded-2xl p-12 shadow-sm border border-gray-100 text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No Attendance Records</h3>
            <p className="text-gray-600 mb-6">Start by marking your attendance for events</p>
            <Link to="/attendance">
              <button className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium py-3 px-6 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-sm">
                <Plus className="w-5 h-5" />
                <span>Mark Attendance</span>
              </button>
            </Link>
          </div>
        )}

        {/* Attendance Records */}
        {!loading && filteredAttendance.length > 0 && (
          <div className="space-y-4">
            {filteredAttendance.map((a) => {
              const statusConfig = getStatusConfig(a.approvalStatus);
              const StatusIcon = statusConfig.icon;

              return (
                <div
                  key={a.id}
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all overflow-hidden"
                >
                  <div className={`h-1 bg-gradient-to-r ${
                    (a.approvalStatus === 'APPROVED_BY_ADMIN' || a.approvalStatus === 'FORWARDED_TO_TEACHER') ? 'from-green-400 to-green-600' :
                    a.approvalStatus === 'PENDING_ADMIN' ? 'from-amber-400 to-amber-600' :
                    'from-red-400 to-red-600'
                  }`}></div>

                  <div className="p-6">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-4 gap-4">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                          <Calendar className="w-6 h-6" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-gray-900">{a.date}</h3>
                          {a.eventTitle && (
                            <p className="text-sm text-gray-500 mt-1">{a.eventTitle}</p>
                          )}
                        </div>
                      </div>
                      <div className={`flex items-center gap-2 px-3 py-1 rounded-full border ${statusConfig.bg} ${statusConfig.color}`}>
                        <StatusIcon className="w-4 h-4" />
                        <span className="text-xs font-medium">
                          {statusConfig.label}
                        </span>
                      </div>
                    </div>

                    <div className="p-4 bg-gray-50 rounded-xl mb-4">
                      <div className="flex items-center space-x-3">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <div>
                          <p className="text-xs text-gray-500">Attendance Status</p>
                          <p className="text-sm font-medium text-gray-900">{a.status}</p>
                        </div>
                      </div>
                    </div>

                    {a.adminRemark && (
                      <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                        <p className="text-xs text-blue-600 font-medium mb-2 flex items-center">
                          <AlertCircle className="w-4 h-4 mr-2" />
                          Admin Remark
                        </p>
                        <p className="text-sm text-blue-900">{a.adminRemark}</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default StudentDashboard;