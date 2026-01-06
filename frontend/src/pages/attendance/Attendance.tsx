import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../services/api";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { 
  Calendar, MapPin, CheckCircle, XCircle, Clock, 
  Loader2, Send, User, AlertCircle 
} from "lucide-react";

const Attendance = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState<any[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [status, setStatus] = useState("Present");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const loadEvents = async () => {
      try {
        const data = await api.get(
          "/eventPermissions?status=APPROVED&principalStatus=APPROVED"
        );
        setEvents(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadEvents();
  }, []);

  const submitAttendance = async () => {
    if (!selectedEvent || !user) {
      alert("Please select an event first");
      return;
    }

    setSubmitting(true);
    try {
      await api.post("/attendance", {
        userId: user.uid,              
        studentName: user.email,
        eventId: selectedEvent.id,
        eventTitle: selectedEvent.title,
        date: selectedEvent.eventDate,
        status,
        approvalStatus: "PENDING_ADMIN",
      });

      alert("✅ Attendance submitted successfully!");
      setSelectedEvent(null);
      setStatus("Present");

    } catch (error: any) {
      // UPDATED LOGIC: Handle "Already Marked" specifically
      if (error?.response?.status === 409 || error?.response?.data?.message?.includes("already marked")) {
        alert("⚠️ You have already marked attendance for this event.");
      } else {
        console.error("Failed to submit attendance:", error);
        alert("Failed to submit attendance. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleEventSelect = (eventId: string) => {
    const event = events.find((ev) => ev.id === eventId);
    setSelectedEvent(event || null);
  };

  const stats = [
    {
      label: "Available Events",
      value: events.length,
      icon: Calendar,
      color: "from-blue-500 to-indigo-500"
    },
    {
      label: "This Week",
      value: events.filter(e => {
        const eventDate = new Date(e.eventDate);
        const today = new Date();
        const daysDiff = Math.ceil(
          (eventDate.getTime() - today.getTime()) / (1000 * 3600 * 24)
        );
        return daysDiff <= 7 && daysDiff >= 0;
      }).length,
      icon: Clock,
      color: "from-green-500 to-emerald-500"
    },
  ];

  return (
    <DashboardLayout
      title={
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
            <CheckCircle className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Mark Attendance</h1>
            <p className="text-sm text-gray-500">Submit your presence for approved events</p>
          </div>
        </div>
      }
    >
      <div className="max-w-4xl mx-auto space-y-6 pb-10">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {stats.map((stat, idx) => (
            <div key={idx} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 transition-all hover:shadow-md">
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

        {/* Loading State */}
        {loading && (
          <div className="bg-white rounded-2xl p-12 border border-gray-100 text-center shadow-sm">
            <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-blue-600 border-t-transparent mb-4"></div>
            <p className="text-gray-600 font-medium">Loading events...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && events.length === 0 && (
          <div className="bg-white rounded-2xl p-12 border border-gray-100 text-center shadow-sm">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-gray-300" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No Events Available</h3>
            <p className="text-gray-600">There are no approved events at the moment</p>
          </div>
        )}

        {!loading && events.length > 0 && (
          <div className="space-y-6">
            {/* Event Selection Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-50 bg-gray-50/30">
                <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wider flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-blue-600" />
                  1. Select Event
                </h2>
              </div>
              <div className="p-6">
                <select
                  onChange={(e) => handleEventSelect(e.target.value)}
                  value={selectedEvent?.id || ""}
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-gray-900 font-medium"
                >
                  <option value="">-- Select an Event --</option>
                  {events.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.title} — {e.eventDate}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Attendance Form Card */}
            {selectedEvent && (
              <div className="bg-white rounded-2xl shadow-xl border border-blue-100 overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="h-1.5 bg-gradient-to-r from-blue-500 to-indigo-600"></div>
                <div className="p-6">
                  <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <User className="w-5 h-5 text-indigo-600" />
                    2. Event Details & Status
                  </h2>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8 bg-blue-50/30 p-5 rounded-2xl border border-blue-50">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white rounded-lg shadow-sm"><MapPin className="w-4 h-4 text-blue-500" /></div>
                      <div>
                        <p className="text-[10px] uppercase font-bold text-gray-400">Venue</p>
                        <p className="text-sm font-semibold text-gray-800">{selectedEvent.venue || "TBD"}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white rounded-lg shadow-sm"><Clock className="w-4 h-4 text-blue-500" /></div>
                      <div>
                        <p className="text-[10px] uppercase font-bold text-gray-400">Date</p>
                        <p className="text-sm font-semibold text-gray-800">{selectedEvent.eventDate}</p>
                      </div>
                    </div>
                  </div>

                  <div className="mb-8">
                    <label className="block text-sm font-bold text-gray-700 mb-4 uppercase tracking-tight">Mark your status</label>
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        type="button"
                        onClick={() => setStatus("Present")}
                        className={`flex items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all font-bold ${
                          status === "Present" 
                            ? 'border-green-500 bg-green-50 text-green-700 shadow-inner' 
                            : 'border-gray-100 bg-white text-gray-400 hover:bg-gray-50'
                        }`}
                      >
                        <CheckCircle className="w-5 h-5" /> Present
                      </button>
                      <button
                        type="button"
                        onClick={() => setStatus("Absent")}
                        className={`flex items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all font-bold ${
                          status === "Absent" 
                            ? 'border-red-500 bg-red-50 text-red-700 shadow-inner' 
                            : 'border-gray-100 bg-white text-gray-400 hover:bg-gray-50'
                        }`}
                      >
                        <XCircle className="w-5 h-5" /> Absent
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={submitAttendance}
                    disabled={submitting}
                    className={`w-full flex items-center justify-center gap-3 py-4 rounded-xl font-bold text-white transition-all shadow-lg active:scale-[0.98] ${
                      submitting 
                        ? 'bg-gray-400 cursor-not-allowed' 
                        : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-blue-200'
                    }`}
                  >
                    {submitting ? (
                      <><Loader2 className="w-5 h-5 animate-spin" /> Submitting...</>
                    ) : (
                      <><Send className="w-5 h-5" /> Submit Attendance</>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Attendance;
