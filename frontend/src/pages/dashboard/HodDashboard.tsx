import { useEffect, useState } from "react";
import { api } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { createNotification } from "../../services/notification.service"; 
import DashboardLayout from "../../components/layout/DashboardLayout";
import LogoutButton from "../../components/common/LogoutButton";
import { 
  Calendar, MapPin, CheckCircle, XCircle, FileText, 
  AlertTriangle, Clock, Users, Search, Filter 
} from "lucide-react";

const HodDashboard = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState<any[]>([]);
  const [remarkMap, setRemarkMap] = useState<Record<string, string>>({});
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDepartment, setFilterDepartment] = useState("all");

  const load = async () => {
    try {
      const res = await api.get("/eventPermissions?status=PENDING_HOD");
      const data = res.data || res;
      setEvents(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error loading pending events:", error);
    }
  };

  useEffect(() => {
    load();
    const t = setInterval(load, 5000);
    return () => clearInterval(t);
  }, []);

  const approve = async (event: any) => {
    if (!user) return;

    const currentRemarks = remarkMap[event.id] || "Approved by HOD";
    const approvals = event.hodApprovals ? [...event.hodApprovals, user.uid] : [user.uid];

    let nextStatus = "PENDING_HOD";

    if (event.hodApprovalType === "DEPARTMENT" || approvals.length >= 1) {
      nextStatus = "PENDING_PRINCIPAL";

      await createNotification({
        toRole: "PRINCIPAL",
        message: `New Approval Required: "${event.title}" has been forwarded by HOD.`
      });
    }

    await api.patch(`/eventPermissions/${event.id}`, {
      hodApprovals: approvals,
      status: nextStatus,
      hodRemark: currentRemarks,
      collisionReason: null,
      rescheduleSuggestions: [], 
      cancellationReason: null,
    });

    await createNotification({
      toRole: "COMMITTEE_HEAD",
      message: `Progress: Your event "${event.title}" was approved by HOD and is now ${nextStatus.replace('_', ' ')}.`
    });

    setRemarkMap({ ...remarkMap, [event.id]: "" });
    load();
  };

  const reject = async (event: any) => {
    const reason = remarkMap[event.id] || "Rejected by HOD";
    
    await api.patch(`/eventPermissions/${event.id}`, {
      status: "REJECTED",
      hodRemark: reason,
      principalStatus: "TERMINATED",
    });

    await createNotification({
      toRole: "COMMITTEE_HEAD",
      message: `Event Rejected: "${event.title}" was rejected by HOD. Reason: ${reason}`
    });

    setRemarkMap({ ...remarkMap, [event.id]: "" });
    load();
  };

  const filteredEvents = events.filter((e) => {
    const matchesSearch = 
      e.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.venue?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDepartment = filterDepartment === "all" || e.department === filterDepartment;
    
    return matchesSearch && matchesDepartment;
  });

  const departments = ["all", ...new Set(events.map(e => e.department).filter(Boolean))];

  const stats = [
    { 
      label: "Pending Reviews", 
      value: events.length, 
      icon: Clock, 
      color: "from-amber-500 to-orange-500" 
    },
    { 
      label: "Today's Requests", 
      value: events.filter(e => e.eventDate === new Date().toISOString().split('T')[0]).length, 
      icon: Calendar, 
      color: "from-blue-500 to-indigo-500" 
    },
    { 
      label: "Rescheduled", 
      value: events.filter(e => e.rescheduleSuggestions?.length > 0).length, 
      icon: AlertTriangle, 
      color: "from-purple-500 to-pink-500" 
    },
  ];

  return (
    <DashboardLayout
      title={
        <div className="flex justify-between items-center w-full gap-6">
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              HOD Dashboard
            </h1>
            <p className="text-sm text-gray-500 mt-1">Review and approve department event requests</p>
          </div>
          <div className="flex items-center gap-4">
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
            <LogoutButton />
          </div>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stats.map((stat, idx) => (
            <div key={idx} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all">
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

        {/* Search and Filter Bar */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by event name or venue..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                value={filterDepartment}
                onChange={(e) => setFilterDepartment(e.target.value)}
                className="pl-10 pr-8 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white min-w-[200px]"
              >
                {departments.map(dept => (
                  <option key={dept} value={dept}>
                    {dept === "all" ? "All Departments" : dept}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Empty State */}
        {filteredEvents.length === 0 && (
          <div className="bg-white rounded-2xl p-12 shadow-sm border border-gray-100 text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">All Clear!</h3>
            <p className="text-gray-600">No pending event approvals at the moment</p>
          </div>
        )}

        {/* Events List */}
        <div className="space-y-4">
          {filteredEvents.map((e) => {
            const hasReschedule = e.rescheduleSuggestions?.length > 0;
            
            return (
              <div
                key={e.id}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all overflow-hidden"
              >
                <div className="h-1 bg-gradient-to-r from-amber-400 to-orange-600"></div>

                <div className="p-6">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-4 gap-4">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                        {e.title?.charAt(0) || "E"}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">{e.title}</h3>
                        <span className="inline-block mt-1 px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-medium">
                          {e.department || "General"}
                        </span>
                      </div>
                    </div>
                    <span className="inline-block px-3 py-1 rounded-full text-xs font-medium border bg-amber-100 text-amber-700 border-amber-200">
                      PENDING HOD APPROVAL
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center space-x-3">
                      <Calendar className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-xs text-gray-500">Event Date</p>
                        <p className="text-sm font-medium text-gray-900">{e.eventDate}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <MapPin className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-xs text-gray-500">Venue</p>
                        <p className="text-sm font-medium text-gray-900">{e.venue}</p>
                      </div>
                    </div>
                  </div>

                  {hasReschedule && (
                    <div className="flex items-start space-x-3 p-4 bg-amber-50 border border-amber-200 rounded-xl mb-4">
                      <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-amber-900 text-sm">Rescheduled Event</p>
                        <p className="text-amber-700 text-sm mt-1">
                          This was previously a collision. Verify the new date/venue is acceptable.
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                      <FileText className="w-4 h-4 mr-2" />
                      HOD Remarks
                    </label>
                    <textarea
                      placeholder="Add your remarks here (required for rejection)..."
                      value={remarkMap[e.id] || ""}
                      onChange={(ev) => setRemarkMap({ ...remarkMap, [e.id]: ev.target.value })}
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={() => approve(e)}
                      className="flex-1 flex items-center justify-center space-x-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-medium py-3 px-6 rounded-lg transition-all shadow-sm hover:shadow-md"
                    >
                      <CheckCircle className="w-5 h-5" />
                      <span>Approve & Forward to Principal</span>
                    </button>

                    <button
                      onClick={() => reject(e)}
                      className="flex-1 flex items-center justify-center space-x-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-medium py-3 px-6 rounded-lg transition-all shadow-sm hover:shadow-md"
                    >
                      <XCircle className="w-5 h-5" />
                      <span>Reject Request</span>
                    </button>
                  </div>

                  {e.hodApprovalType && (
                    <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-xs text-blue-700 flex items-center">
                        <Users className="w-3 h-3 mr-2" />
                        <span className="font-medium">Approval Type:</span>
                        <span className="ml-2">{e.hodApprovalType}</span>
                      </p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default HodDashboard;