import { useEffect, useState } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import EventOverview from "../../components/common/EventOverview";
import { useAuth } from "../../context/AuthContext";
import LogoutButton from "../../components/common/LogoutButton";
import { getEventPermissions } from "../../services/event.service"; 
import { api } from "../../services/api"; 
import { 
  Calendar, Users, Clock, Award, Loader2, 
  CheckCircle2, UserCheck, Search, Filter, Info 
} from "lucide-react";

const TeacherDashboard = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filter States
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEvent, setSelectedEvent] = useState("all");

  const loadData = async () => {
    try {
      setLoading(true);
      const [eventRes, attendRes] = await Promise.all([
        getEventPermissions(),
        api.get("/attendance")
      ]);

      const eventData = eventRes.data || eventRes; 
      const attendData = attendRes.data || attendRes;

      setEvents(Array.isArray(eventData) ? eventData : []);
      
      // Filter for records forwarded to the teacher level
      setAttendance(Array.isArray(attendData) ? attendData.filter(a => 
        a.approvalStatus === "FORWARDED_TO_TEACHER" || a.approvalStatus === "APPROVED_BY_ADMIN"
      ) : []);

    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filter logic for the attendance table
  const filteredAttendance = attendance.filter((record) => {
    const matchesSearch = record.studentName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesEvent = selectedEvent === "all" || record.eventTitle === selectedEvent;
    return matchesSearch && matchesEvent;
  });

  const eventOptions = ["all", ...new Set(attendance.map(a => a.eventTitle).filter(Boolean))];

  // Stats Calculation
  const activeEventsCount = events.filter(e => e.status === "PENDING_PRINCIPAL" || e.status === "APPROVED").length;
  const totalVolunteersCount = new Set(events.flatMap(e => e.volunteers || [])).size;

  const stats = [
    { label: "Active Events", value: loading ? "..." : activeEventsCount.toString(), icon: Calendar, color: "from-blue-500 to-indigo-500" },
    { label: "Total Volunteers", value: loading ? "..." : totalVolunteersCount.toString(), icon: Users, color: "from-green-500 to-emerald-500" },
    { label: "Verified Attendance", value: loading ? "..." : attendance.length.toString(), icon: UserCheck, color: "from-purple-500 to-pink-500" },
    { label: "Pending Reviews", value: loading ? "..." : events.filter(e => e.status === "PENDING_HOD").length.toString(), icon: Clock, color: "from-amber-500 to-orange-500" },
  ];

  return (
    <DashboardLayout
      title={
        <div className="flex justify-between items-center w-full gap-6">
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Teacher Dashboard</h1>
            <p className="text-sm text-gray-500 mt-1">Event Management & Attendance Tracking</p>
          </div>
          <div className="flex items-center gap-4">
            {user && (
              <div className="hidden sm:flex items-center gap-3 px-4 py-2 bg-gray-50 rounded-xl border border-gray-200">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                  {user.email?.charAt(0).toUpperCase()}
                </div>
                <div className="text-left">
                  <p className="text-[10px] text-gray-500 leading-none">Logged in as</p>
                  <p className="text-xs text-gray-900 font-bold">{user.email}</p>
                </div>
              </div>
            )}
            <LogoutButton />
          </div>
        </div>
      }
      hideEventsOverview // Keeps layout consistent
    >
      <div className="space-y-8">
        {/* 1. Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, idx) => (
            <div key={idx} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm font-medium">{stat.label}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                </div>
                <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center text-white`}>
                  <stat.icon size={24} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 2. Event Details Section (Missing Details Fixed) */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 bg-blue-50/30">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Info className="w-5 h-5 text-blue-600" />
              Active Event Details
            </h2>
            <p className="text-sm text-gray-500 mt-1">Overview of currently planned and ongoing events</p>
          </div>
          <div className="p-6">
            <EventOverview showVolunteers={true} />
          </div>
        </div>

        {/* 3. Student Attendance Section (With Sorting) */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                Student Attendance Records
              </h2>
              <p className="text-sm text-gray-500 mt-1">Filter present students by specific events</p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input 
                  type="text"
                  placeholder="Search student..."
                  className="pl-9 pr-4 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none w-full"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <select 
                  className="pl-9 pr-8 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none appearance-none bg-white w-full"
                  value={selectedEvent}
                  onChange={(e) => setSelectedEvent(e.target.value)}
                >
                  {eventOptions.map(opt => (
                    <option key={opt} value={opt}>{opt === "all" ? "All Events" : opt}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="p-6 overflow-x-auto">
            {loading ? (
               <div className="flex justify-center py-10"><Loader2 className="animate-spin text-blue-600" /></div>
            ) : filteredAttendance.length === 0 ? (
              <p className="text-center text-gray-500 py-10">No records found for the selected event.</p>
            ) : (
              <table className="w-full text-left">
                <thead className="text-gray-400 text-xs uppercase font-semibold">
                  <tr>
                    <th className="pb-4">Student Name</th>
                    <th className="pb-4">Event Title</th>
                    <th className="pb-4">Date</th>
                    <th className="pb-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredAttendance.map((record) => (
                    <tr key={record.id} className="text-sm hover:bg-slate-50 transition-colors">
                      <td className="py-4 font-medium text-gray-900">{record.studentName}</td>
                      <td className="py-4 text-blue-600 font-semibold">{record.eventTitle}</td>
                      <td className="py-4 text-gray-600">{record.date}</td>
                      <td className="py-4">
                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                          record.status === 'Present' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {record.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default TeacherDashboard;