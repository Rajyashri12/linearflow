import { useEffect, useState } from "react";
import { api } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import DashboardLayout from "../../components/layout/DashboardLayout";
import LogoutButton from "../../components/common/LogoutButton";
import { 
  CheckCircle, XCircle, Calendar, User, Clock, 
  FileText, Search, Filter, AlertCircle, UserPlus, Loader2 
} from "lucide-react";

const AdminDashboard = () => {
  const { user } = useAuth();

  const [records, setRecords] = useState<any[]>([]);
  const [remarkMap, setRemarkMap] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const [pendingUsers, setPendingUsers] = useState<any[]>([]);
  const [userLoading, setUserLoading] = useState(true);
  const [filterUserRole, setFilterUserRole] = useState("all");

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setUserLoading(true);

      const attendanceData = await api.get("/attendance?approvalStatus=PENDING_ADMIN");
      setRecords(Array.isArray(attendanceData) ? attendanceData : []);

      const userRes = await api.get("/users?status=PENDING");
      const userData = userRes.data || userRes;
      setPendingUsers(Array.isArray(userData) ? userData : []);
    } catch (err) {
      console.error("Failed to load Admin Dashboard data", err);
    } finally {
      setLoading(false);
      setUserLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleUserApproval = async (userId: string, approve: boolean) => {
    try {
      await api.patch(`/users/${userId}`, {
        status: approve ? "APPROVED" : "REJECTED",
        approvedAt: new Date().toISOString(),
      });
      loadDashboardData();
    } catch (error) {
      console.error("User update failed", error);
    }
  };

  /* ✅ ONLY LOGIC FIX — UI UNCHANGED */
  const handleAttendance = async (
    record: any,
    status: "APPROVED_BY_ADMIN" | "REJECTED_BY_ADMIN"
  ) => {
    try {
      await api.patch("/attendance/approve", {
        userId: record.userId,
        eventId: record.eventId,
      });

      loadDashboardData();
    } catch (error) {
      console.error("Attendance action failed", error);
      alert("Failed to update attendance");
    }
  };

  const filteredRecords = records.filter((r) => {
    const matchesSearch =
      r.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.eventTitle?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === "all" || r.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const filteredUsers = pendingUsers.filter((u) => {
    return filterUserRole === "all" || u.role?.toLowerCase() === filterUserRole.toLowerCase();
  });

  const stats = [
    { label: "Pending Attendance", value: records.length, icon: AlertCircle, color: "from-amber-500 to-orange-500" },
    { label: "Pending Registrations", value: pendingUsers.length, icon: UserPlus, color: "from-red-500 to-rose-500" },
    { label: "Total Students", value: new Set(records.map(r => r.studentName)).size, icon: User, color: "from-purple-500 to-indigo-500" },
  ];

  return (
    <DashboardLayout
      title={
        <div className="flex justify-between items-center w-full gap-6">
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Admin Dashboard
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              System Administration & Gatekeeping
            </p>
          </div>
          <div className="flex items-center gap-4">
            {user && (
              <div className="hidden sm:flex items-center gap-3 px-5 py-3 bg-white rounded-2xl border border-gray-200 shadow-sm">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-md">
                  {user.email?.charAt(0).toUpperCase()}
                </div>
                <div className="text-left">
                  <p className="text-xs text-gray-500 font-semibold">Logged in as</p>
                  <p className="text-sm text-gray-900 font-bold">{user.email}</p>
                </div>
              </div>
            )}
            <LogoutButton />
          </div>
        </div>
      }
    >
      <div className="space-y-8">
        {/* Statistics Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stats.map((stat, idx) => (
            <div key={idx} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm font-medium">{stat.label}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                </div>
                <div className={`w-14 h-14 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center text-white shadow-lg`}>
                  <stat.icon size={28} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* USER REGISTRATION APPROVAL */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-red-600" />
              User Registration Requests
            </h2>

            <div className="relative min-w-[200px]">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <select
                value={filterUserRole}
                onChange={(e) => setFilterUserRole(e.target.value)}
                className="w-full pl-9 pr-8 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 appearance-none bg-white font-medium shadow-sm"
              >
                <option value="all">All Roles</option>
                <option value="student">Student</option>
                <option value="teacher">Teacher</option>
                <option value="admin">Admin</option>
                <option value="hod">HOD</option>
                <option value="principal">Principal</option>
              </select>
            </div>
          </div>

          <div className="p-6">
            {userLoading ? (
              <div className="flex justify-center py-10">
                <Loader2 className="animate-spin text-red-600" />
              </div>
            ) : filteredUsers.length === 0 ? (
              <p className="text-center text-gray-500 py-6 font-medium">
                No pending {filterUserRole !== "all" ? filterUserRole : ""} registrations.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-gray-400 text-xs uppercase font-bold border-b">
                      <th className="pb-3 px-2">Email Address</th>
                      <th className="pb-3 px-2">Role</th>
                      <th className="pb-3 px-2 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filteredUsers.map((u) => (
                      <tr key={u.id} className="text-sm hover:bg-slate-50 transition-colors">
                        <td className="py-4 px-2 font-medium text-gray-900">{u.email}</td>
                        <td className="py-4 px-2">
                          <span className="px-2 py-1 bg-indigo-50 text-indigo-700 rounded-md text-[10px] font-black uppercase">
                            {u.role}
                          </span>
                        </td>
                        <td className="py-4 px-2 text-right">
                          <div className="flex justify-end gap-2">
                            <button onClick={() => handleUserApproval(u.id, true)} className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 shadow-sm">
                              <CheckCircle size={18} />
                            </button>
                            <button onClick={() => handleUserApproval(u.id, false)} className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 shadow-sm">
                              <XCircle size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* ATTENDANCE APPROVAL QUEUE */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-gray-900 px-2">Attendance Approval Queue</h2>

          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="animate-spin text-blue-600" />
            </div>
          ) : filteredRecords.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-gray-100">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">All attendance records processed!</p>
            </div>
          ) : (
            filteredRecords.map((r) => (
              <div key={`${r.userId}-${r.eventId}`} className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all overflow-hidden">
                <div className="p-6">
                  <h3 className="font-bold">{r.studentName}</h3>
                  <p>{r.eventTitle}</p>
                  <div className="flex gap-3 mt-4">
                    <button onClick={() => handleAttendance(r, "APPROVED_BY_ADMIN")} className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold">
                      Approve Attendance
                    </button>
                    <button onClick={() => handleAttendance(r, "REJECTED_BY_ADMIN")} className="flex-1 py-3 bg-red-100 text-red-600 rounded-xl font-bold">
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
