import { useEffect, useState } from "react";
import { api } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import DashboardLayout from "../../components/layout/DashboardLayout";
import LogoutButton from "../../components/common/LogoutButton";
import { 
  CheckCircle, XCircle, Calendar, User, Clock, 
  FileText, Search, Filter, AlertCircle, UserPlus, Mail, Loader2 
} from "lucide-react";

const AdminDashboard = () => {
  const { user } = useAuth();
  
  // State for Attendance Records
  const [records, setRecords] = useState<any[]>([]);
  const [remarkMap, setRemarkMap] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  // State for User Registration Approvals
  const [pendingUsers, setPendingUsers] = useState<any[]>([]);
  const [userLoading, setUserLoading] = useState(true);
  const [filterUserRole, setFilterUserRole] = useState("all");

  // --- 1. Data Fetching Logic ---
  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setUserLoading(true);

      // Fetch Attendance pending Admin
      const attendanceData = await api.get("/attendance?approvalStatus=PENDING_ADMIN");
      setRecords(Array.isArray(attendanceData) ? attendanceData : []);

      // Fetch Users pending Approval
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

  // --- 2. User Approval Actions ---
 const handleAttendance = async (
  record: any,
  status: "APPROVED_BY_ADMIN" | "REJECTED_BY_ADMIN"
) => {
  try {
    await api.patch("/attendance/approve", {
      userId: record.userId,
      eventId: record.eventId,
    });

    // Notification logic (unchanged)
    const toRole = status === "APPROVED_BY_ADMIN" ? "hod" : "student";
    await api.post("/notifications", {
      toRole: toRole,
      message: `Attendance ${
        status === "APPROVED_BY_ADMIN" ? "approved" : "rejected"
      } for ${record.studentName}`,
      read: false,
    });

    loadDashboardData();
  } catch (error) {
    console.error("Attendance action failed", error);
    alert("Failed to update attendance status");
  }
};


  // --- 3. Attendance Approval Actions ---
  const handleAttendance = async (record: any, status: "APPROVED_BY_ADMIN" | "REJECTED_BY_ADMIN") => {
    try {
      await api.patch(`/attendance/${record.id}`, {
        approvalStatus: status,
        adminRemark: remarkMap[record.id] || `${status.replace(/_/g, ' ')} by Admin`,
      });

      // Notification logic
      const toRole = status === "APPROVED_BY_ADMIN" ? "hod" : "student";
      await api.post("/notifications", {
        toRole: toRole,
        message: `Attendance ${status === "APPROVED_BY_ADMIN" ? 'approved' : 'rejected'} for ${record.studentName}`,
        read: false,
      });

      setRemarkMap({ ...remarkMap, [record.id]: "" });
      loadDashboardData();
    } catch (error) {
      console.error("Attendance action failed", error);
    }
  };

  // --- 4. Filtering Logic ---
  const filteredRecords = records.filter((r) => {
    const matchesSearch = r.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
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
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Admin Dashboard</h1>
            <p className="text-sm text-gray-500 mt-1">System Administration & Gatekeeping</p>
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

        {/* SECTION 1: USER REGISTRATION APPROVAL */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-red-600" />
              User Registration Requests
            </h2>
            
            {/* 5-Group Role Filter */}
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
              <div className="flex justify-center py-10"><Loader2 className="animate-spin text-red-600" /></div>
            ) : filteredUsers.length === 0 ? (
              <p className="text-center text-gray-500 py-6 font-medium">No pending {filterUserRole !== 'all' ? filterUserRole : ''} registrations.</p>
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
                            <button onClick={() => handleUserApproval(u.id, true)} className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 shadow-sm"><CheckCircle size={18} /></button>
                            <button onClick={() => handleUserApproval(u.id, false)} className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 shadow-sm"><XCircle size={18} /></button>
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

        {/* SECTION 2: ATTENDANCE APPROVALS */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-gray-900 px-2">Attendance Approval Queue</h2>
          
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by student or event..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="pl-10 pr-8 py-2 border border-gray-200 rounded-lg outline-none appearance-none bg-white"
              >
                <option value="all">All Attendance</option>
                <option value="PRESENT">Present</option>
                <option value="ABSENT">Absent</option>
                <option value="LATE">Late</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-20"><Loader2 className="animate-spin text-blue-600" /></div>
          ) : filteredRecords.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-gray-100">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">All attendance records processed!</p>
            </div>
          ) : (
            filteredRecords.map((r) => (
              <div key={r.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all overflow-hidden">
                <div className={`h-1 bg-gradient-to-r ${r.status === 'PRESENT' ? 'from-green-400 to-green-600' : 'from-red-400 to-red-600'}`}></div>
                <div className="p-6">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600 font-bold text-lg">
                        {r.studentName?.charAt(0)}
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">{r.studentName}</h3>
                        <p className="text-sm text-gray-500 font-medium">{r.eventTitle}</p>
                      </div>
                    </div>
                    <span className={`mt-2 md:mt-0 px-3 py-1 rounded-full text-xs font-bold border ${r.status === 'PRESENT' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-red-50 text-red-700 border-red-100'}`}>{r.status}</span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <div className="flex items-center gap-2 text-sm font-medium"><Calendar size={16} className="text-gray-400"/> {r.date}</div>
                    <div className="flex items-center gap-2 text-sm font-medium"><Clock size={16} className="text-gray-400"/> {r.time || "N/A"}</div>
                    <div className="flex items-center gap-2 text-sm font-medium"><FileText size={16} className="text-gray-400"/> Status: Pending</div>
                  </div>

                  <div className="mb-6">
                    <textarea
                      placeholder="Add admin remark..."
                      value={remarkMap[r.id] || ""}
                      onChange={(e) => setRemarkMap({ ...remarkMap, [r.id]: e.target.value })}
                      className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none resize-none text-sm"
                      rows={2}
                    />
                  </div>

                  <div className="flex gap-3">
                    <button onClick={() => handleAttendance(r, "APPROVED_BY_ADMIN")} className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors">Approve Attendance</button>
                    <button onClick={() => handleAttendance(r, "REJECTED_BY_ADMIN")} className="flex-1 py-3 bg-red-100 text-red-600 rounded-xl font-bold hover:bg-red-200 transition-colors">Reject</button>
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
