import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { createNotification } from "../../services/notification.service"; 
import DashboardLayout from "../../components/layout/DashboardLayout";
import LogoutButton from "../../components/common/LogoutButton";
import { 
  Calendar, MapPin, AlertTriangle, CheckCircle, XCircle, 
  Edit3, Trash2, Plus, Clock, FileText, Search, Filter 
} from "lucide-react";

const CommitteeHeadDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [events, setEvents] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  
  // Form and Action States
  const [editingId, setEditingId] = useState<number | null>(null);
  const [cancellingId, setCancellingId] = useState<number | null>(null);
  const [cancelReason, setCancelReason] = useState("");
  const [newDate, setNewDate] = useState("");
  const [newVenue, setNewVenue] = useState("");

  const load = async () => {
    try {
      const data = await api.get("/eventPermissions");
      setEvents(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error loading events:", error);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const startReschedule = (event: any) => {
    setEditingId(event.id);
    setCancellingId(null);
    setNewDate(event.eventDate || "");
    setNewVenue(event.venue || "");
  };

  const submitReschedule = async (event: any) => {
    if (!newDate || !newVenue) {
      alert("Please provide date and venue");
      return;
    }
    try {
      await api.patch(`/eventPermissions/${event.id}`, {
        eventDate: newDate,
        venue: newVenue,
        status: "PENDING_HOD",
        principalStatus: "PENDING",
        collisionReason: null,
        cancellationReason: null,
        rescheduleSuggestions: [] 
      });

      await createNotification({
        toRole: "HOD",
        message: `Event Rescheduled: "${event.title}" has been moved to ${newDate} at ${newVenue}.`
      });

      setEditingId(null);
      load();
    } catch (err) {
      alert("Failed to reschedule event.");
    }
  };

  const submitPermanentCancel = async (event: any) => {
    if (!cancelReason.trim()) {
      alert("Please provide a reason for cancellation.");
      return;
    }
    try {
      await api.patch(`/eventPermissions/${event.id}`, {
        status: "CANCELLED",
        cancellationReason: cancelReason,
      });

      await createNotification({
        toRole: "HOD",
        message: `Event Cancelled: "${event.title}" was cancelled by the Committee Head.`
      });

      setCancellingId(null);
      setCancelReason("");
      load();
    } catch (err) {
      alert("Failed to cancel event.");
    }
  };

  const deleteEventDirectly = async (eventId: number) => {
    if (!window.confirm("Delete this record permanently?")) return;
    try {
      await api.delete(`/eventPermissions/${eventId}`);
      load();
    } catch (e) {
      alert("Delete failed. Ensure backend DELETE route is active.");
    }
  };

  const filteredEvents = events.filter((e) => {
    const matchesSearch = 
      e.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.venue?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.department?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterStatus === "all" || e.status === filterStatus;
    
    return matchesSearch && matchesFilter;
  });

  const stats = [
    { 
      label: "Total Events", 
      value: events.length, 
      icon: Calendar, 
      color: "from-blue-500 to-indigo-500" 
    },
    { 
      label: "Approved", 
      value: events.filter(e => e.status === "APPROVED").length, 
      icon: CheckCircle, 
      color: "from-green-500 to-emerald-500" 
    },
    { 
      label: "Pending", 
      value: events.filter(e => e.status?.includes("PENDING")).length, 
      icon: Clock, 
      color: "from-amber-500 to-orange-500" 
    },
    { 
      label: "Cancelled", 
      value: events.filter(e => e.status === "CANCELLED").length, 
      icon: XCircle, 
      color: "from-red-500 to-pink-500" 
    },
  ];

  const getStatusConfig = (status: string) => {
    const configs: Record<string, { color: string; bg: string; border: string }> = {
      APPROVED: { color: "text-green-700", bg: "bg-green-100", border: "border-green-200" },
      CANCELLED: { color: "text-red-700", bg: "bg-red-100", border: "border-red-200" },
      COLLISION: { color: "text-amber-700", bg: "bg-amber-100", border: "border-amber-200" },
      PENDING_HOD: { color: "text-blue-700", bg: "bg-blue-100", border: "border-blue-200" },
      PENDING_PRINCIPAL: { color: "text-purple-700", bg: "bg-purple-100", border: "border-purple-200" },
    };
    return configs[status] || { color: "text-gray-700", bg: "bg-gray-100", border: "border-gray-200" };
  };

  return (
    <DashboardLayout 
      title={
        <div className="flex justify-between items-center w-full gap-6">
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Committee Head Dashboard
            </h1>
            <p className="text-sm text-gray-500 mt-1">Manage event permissions and requests</p>
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
        {/* Header Section */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Event Management
              </h1>
              <p className="text-gray-600 mt-1">Review and manage your event permission requests</p>
            </div>
            <button 
              onClick={() => navigate("/events/apply")}
              className="flex items-center space-x-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-medium py-3 px-6 rounded-lg transition-all shadow-sm hover:shadow-md"
            >
              <Plus className="w-5 h-5" />
              <span>Apply for New Event</span>
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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

        {/* Search and Filter */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search events, venues, or departments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="pl-10 pr-8 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white min-w-[200px]"
              >
                <option value="all">All Status</option>
                <option value="APPROVED">Approved</option>
                <option value="PENDING_HOD">Pending HOD</option>
                <option value="PENDING_PRINCIPAL">Pending Principal</option>
                <option value="COLLISION">Collision</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>
          </div>
        </div>

        {/* Events List */}
        {filteredEvents.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 shadow-sm border border-gray-100 text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No Events Found</h3>
            <p className="text-gray-600 mb-6">Start by creating your first event permission request</p>
            <button 
              onClick={() => navigate("/events/apply")}
              className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium py-3 px-6 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all"
            >
              <Plus className="w-5 h-5" />
              <span>Create Event</span>
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredEvents.map((e) => {
              const isCancelled = e.status === "CANCELLED";
              const isCollision = e.status === "COLLISION" || e.collisionReason;
              const isApproved = e.status === "APPROVED";
              const statusConfig = getStatusConfig(e.status);

              return (
                <div key={e.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all overflow-hidden">
                  {/* Status Bar */}
                  <div className={`h-1 bg-gradient-to-r ${
                    isCancelled ? 'from-red-400 to-red-600' :
                    isApproved ? 'from-green-400 to-green-600' :
                    isCollision ? 'from-amber-400 to-amber-600' :
                    'from-blue-400 to-blue-600'
                  }`}></div>

                  <div className="p-6">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-4 gap-4">
                      <div className="flex-1">
                        <div className="flex items-start gap-3 mb-2">
                          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                            {e.title?.charAt(0) || "E"}
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-gray-900">{e.title}</h3>
                            <span className="inline-block mt-1 px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-medium">
                              {e.department || "General"}
                            </span>
                          </div>
                        </div>
                      </div>
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium border ${statusConfig.bg} ${statusConfig.color} ${statusConfig.border}`}>
                        {e.status}
                      </span>
                    </div>

                    {/* Info Grid */}
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

                    {/* Collision Alert */}
                    {isCollision && (
                      <div className="flex items-start space-x-3 p-4 bg-amber-50 border border-amber-200 rounded-xl mb-4">
                        <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold text-amber-900 text-sm">Collision Detected</p>
                          <p className="text-amber-700 text-sm mt-1">{e.collisionReason || "Venue already booked."}</p>
                        </div>
                      </div>
                    )}

                    {/* Reschedule Suggestions */}
                    {e.rescheduleSuggestions?.length > 0 && (
                      <div className="p-4 bg-green-50 border border-green-200 rounded-xl mb-4">
                        <p className="font-semibold text-green-900 text-sm mb-3 flex items-center">
                          <FileText className="w-4 h-4 mr-2" />
                          Recommended Alternatives
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {e.rescheduleSuggestions.map((suggestion: string, index: number) => (
                            <button
                              key={index}
                              onClick={() => {
                                const [sVenue, sDate] = suggestion.split(" on ");
                                setEditingId(e.id);
                                setNewVenue(sVenue);
                                setNewDate(sDate);
                              }}
                              className="px-3 py-2 bg-white border border-green-300 text-green-700 rounded-lg hover:bg-green-100 transition-colors text-sm font-medium"
                            >
                              {suggestion}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Cancellation Reason */}
                    {e.cancellationReason && (
                      <div className="p-4 bg-red-50 border border-red-200 rounded-xl mb-4">
                        <p className="font-semibold text-red-900 text-sm mb-1">Cancellation Reason</p>
                        <p className="text-red-700 text-sm">{e.cancellationReason}</p>
                      </div>
                    )}

                    {/* Action Buttons */}
                    {editingId !== e.id && cancellingId !== e.id && (
                      <div className="flex flex-wrap gap-3 mt-4">
                        <button 
                          onClick={() => startReschedule(e)} 
                          className="flex items-center space-x-2 bg-blue-50 text-blue-600 hover:bg-blue-100 font-medium py-2 px-4 rounded-lg transition-colors"
                        >
                          <Edit3 className="w-4 h-4" />
                          <span>Reschedule</span>
                        </button>

                        {!isCancelled && (
                          <button 
                            onClick={() => setCancellingId(e.id)} 
                            className="flex items-center space-x-2 bg-orange-50 text-orange-600 hover:bg-orange-100 font-medium py-2 px-4 rounded-lg transition-colors"
                          >
                            <XCircle className="w-4 h-4" />
                            <span>Cancel Event</span>
                          </button>
                        )}

                        <button 
                          onClick={() => deleteEventDirectly(e.id)} 
                          className="flex items-center space-x-2 bg-red-50 text-red-600 hover:bg-red-100 font-medium py-2 px-4 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span>Delete</span>
                        </button>
                      </div>
                    )}

                    {/* Inline Cancel Form */}
                    {cancellingId === e.id && (
                      <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-xl">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Cancellation Reason
                        </label>
                        <textarea
                          placeholder="Provide reason for cancellation..."
                          value={cancelReason}
                          onChange={(ev) => setCancelReason(ev.target.value)}
                          rows={3}
                          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none mb-3"
                        />
                        <div className="flex gap-3">
                          <button 
                            onClick={() => submitPermanentCancel(e)} 
                            className="flex-1 flex items-center justify-center space-x-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-medium py-2 px-4 rounded-lg transition-all"
                          >
                            <XCircle className="w-4 h-4" />
                            <span>Confirm Cancel</span>
                          </button>
                          <button 
                            onClick={() => setCancellingId(null)} 
                            className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium rounded-lg transition-colors"
                          >
                            Back
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Inline Reschedule Form */}
                    {editingId === e.id && (
                      <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-xl">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Reschedule Event
                        </label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                          <div>
                            <label className="block text-xs text-gray-600 mb-1">New Date</label>
                            <input 
                              type="date" 
                              value={newDate} 
                              onChange={ev => setNewDate(ev.target.value)} 
                              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-600 mb-1">New Venue</label>
                            <input 
                              placeholder="Enter venue" 
                              value={newVenue} 
                              onChange={ev => setNewVenue(ev.target.value)} 
                              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          </div>
                        </div>
                        <div className="flex gap-3">
                          <button 
                            onClick={() => submitReschedule(e)} 
                            className="flex-1 flex items-center justify-center space-x-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-medium py-2 px-4 rounded-lg transition-all"
                          >
                            <CheckCircle className="w-4 h-4" />
                            <span>Submit Change</span>
                          </button>
                          <button 
                            onClick={() => setEditingId(null)} 
                            className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium rounded-lg transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
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

export default CommitteeHeadDashboard;