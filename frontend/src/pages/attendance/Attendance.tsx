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
        studentUid: user.uid,
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
       if (error?.response?.status === 409) {
        alert("⚠️ Attendance already marked for this event");
      } else {
        console.error("Failed to submit attendance:", error);
        alert("Failed to submit attendance");
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
        const daysDiff = Math.ceil((eventDate.getTime() - today.getTime()) / (1000 * 3600 * 24));
        return daysDiff <= 7 && daysDiff >= 0;
      }).length,
      icon: Clock,
      color: "from-emerald-500 to-teal-500"
    },
  ];

  return (
    <DashboardLayout
      title={
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-blue-200 shadow-lg">
            <CheckCircle className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Mark Attendance</h1>
            <p className="text-sm text-gray-500">Log your presence for approved college events</p>
          </div>
        </div>
      }
    >
      <div className="max-w-4xl mx-auto space-y-6 pb-12">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {stats.map((stat, idx) => (
            <div key={idx} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm font-medium uppercase tracking-wider">{stat.label}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{stat.value}</p>
                </div>
                <div className={`w-14 h-14 bg-gradient-to-br ${stat.color} rounded-2xl flex items-center justify-center shadow-inner`}>
                  <stat.icon className="w-7 h-7 text-white" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="bg-white rounded-3xl p-20 border border-gray-100 text-center shadow-sm">
            <Loader2 className="w-10 h-10 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-500 font-medium">Fetching scheduled events...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && events.length === 0 && (
          <div className="bg-white rounded-3xl p-16 border border-dashed border-gray-300 text-center">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-10 h-10 text-gray-300" />
            </div>
            <h3 className="text-xl font-bold text-gray-800">No events found</h3>
            <p className="text-gray-500 mt-2">Check back later for newly approved activities.</p>
          </div>
        )}

        {/* Form Section */}
        {!loading && events.length > 0 && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-50 bg-gray-50/50">
                <label className="text-sm font-semibold text-gray-700 uppercase tracking-tight">Step 1: Select Event</label>
              </div>
              <div className="p-6">
                <select
                  onChange={(e) => handleEventSelect(e.target.value)}
                  value={selectedEvent?.id || ""}
                  className="w-full px-4 py-4 bg-white border-2 border-gray-100 rounded-xl focus:ring-4 focus:ring-blue-50 focus:border-blue-500 transition-all text-gray-800 font-medium appearance-none"
                  style={{ backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center', backgroundSize: '1.2em' }}
                >
                  <option value="">Choose from available events...</option>
                  {events.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.title} ({e.eventDate})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {selectedEvent && (
              <div className="bg-white rounded-2xl shadow-xl border border-blue-100 overflow-hidden transition-all animate-in fade-in slide-in-from-bottom-4">
                <div className="h-1.5 bg-gradient-to-r from-blue-500 to-indigo-600"></div>
                
                <div className="p-8">
                  <div className="flex justify-between items-start mb-8">
                    <div>
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full uppercase tracking-wider">Event Details</span>
                      <h2 className="text-2xl font-black text-gray-900 mt-2">{selectedEvent.title}</h2>
                    </div>
                    <div className="text-right">
                       <p className="text-sm font-bold text-gray-900">{selectedEvent.eventDate}</p>
                       <p className="text-xs text-gray-500 uppercase tracking-widest mt-1">Scheduled Date</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                    <div className="flex items-center p-4 bg-gray-50 rounded-2xl border border-gray-100">
                      <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm mr-4">
                        <MapPin className="w-5 h-5 text-blue-500" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 font-bold uppercase">Venue</p>
                        <p className="text-sm font-semibold text-gray-700">{selectedEvent.venue || "Campus Main Hall"}</p>
                      </div>
                    </div>
                    <div className="flex items-center p-4 bg-gray-50 rounded-2xl border border-gray-100">
                      <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm mr-4">
                        <User className="w-5 h-5 text-indigo-500" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 font-bold uppercase">Department</p>
                        <p className="text-sm font-semibold text-gray-700">{selectedEvent.department || "General"}</p>
                      </div>
                    </div>
                  </div>

                  <div className="mb-8">
                    <label className="block text-sm font-bold text-gray-700 mb-4 uppercase tracking-wider">Step 2: Your Status</label>
                    <div className="grid grid-cols-2 gap-4">
                      <button 
                        onClick={() => setStatus("Present")}
                        className={`flex items-center justify-center gap-3 p-5 rounded-2xl border-2 transition-all ${
                        status === "Present" 
                          ? 'border-emerald-500 bg-emerald-50 text-emerald-700 shadow-md ring-4 ring-emerald-50' 
                          : 'border-gray-100 bg-white text-gray-500 hover:border-gray-200'
                      }`}>
                        <CheckCircle className={`w-6 h-6 ${status === "Present" ? 'text-emerald-600' : 'text-gray-300'}`} />
                        <span className="font-bold text-lg">Present</span>
                      </button>

                      <button 
                        onClick={() => setStatus("Absent")}
                        className={`flex items-center justify-center gap-3 p-5 rounded-2xl border-2 transition-all ${
                        status === "Absent" 
                          ? 'border-red-500 bg-red-50 text-red-700 shadow-md ring-4 ring-red-50' 
                          : 'border-gray-100 bg-white text-gray-500 hover:border-gray-200'
                      }`}>
                        <XCircle className={`w-6 h-6 ${status === "Absent" ? 'text-red-600' : 'text-gray-300'}`} />
                        <span className="font-bold text-lg">Absent</span>
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={submitAttendance}
                    disabled={submitting}
                    className={`w-full group relative flex items-center justify-center gap-3 bg-gray-900 text-white font-bold py-5 px-8 rounded-2xl overflow-hidden transition-all hover:bg-black active:scale-[0.98] ${
                      submitting ? 'opacity-70 cursor-not-allowed' : ''
                    }`}
                  >
                    {submitting ? (
                      <Loader2 className="w-6 h-6 animate-spin" />
                    ) : (
                      <>
                        <Send className="w-5 h-5 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                        <span className="text-lg">Confirm Attendance</span>
                      </>
                    )}
                  </button>

                  <div className="mt-6 flex items-start gap-3 p-4 bg-blue-50/50 rounded-xl border border-blue-100">
                    <AlertCircle className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                    <p className="text-xs text-blue-600 leading-relaxed">
                      <strong>Submission Note:</strong> By clicking confirm, your attendance record for <strong>{selectedEvent.title}</strong> will be timestamped and sent to the administrator for verification.
                    </p>
                  </div>
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
