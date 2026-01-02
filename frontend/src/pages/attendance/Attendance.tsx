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
    } catch (error) {
      console.error("Failed to submit attendance:", error);
      alert("Failed to submit attendance");
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
      color: "from-green-500 to-emerald-500"
    },
  ];

  return (
    <DashboardLayout
      title={
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center">
            <CheckCircle className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Mark Attendance
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">Submit your attendance for approved events</p>
          </div>
        </div>
      }
    >
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

        {/* Loading State */}
        {loading && (
          <div className="bg-white rounded-2xl p-12 shadow-sm border border-gray-100 text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-gray-600 font-medium">Loading events...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && events.length === 0 && (
          <div className="bg-white rounded-2xl p-12 shadow-sm border border-gray-100 text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No Events Available</h3>
            <p className="text-gray-600">There are no approved events at the moment</p>
          </div>
        )}

        {/* Event Selection */}
        {!loading && events.length > 0 && (
          <>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  Select Event
                </h2>
                <p className="text-sm text-gray-500 mt-1">Choose an event to mark your attendance</p>
              </div>
              <div className="p-6">
                <select
                  onChange={(e) => handleEventSelect(e.target.value)}
                  value={selectedEvent?.id || ""}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                >
                  <option value="">-- Choose an Event --</option>
                  {events.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.title} - {e.eventDate}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Event Details & Attendance Form */}
            {selectedEvent && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="h-1 bg-gradient-to-r from-blue-400 to-indigo-600"></div>
                
                <div className="p-6">
                  <h2 className="text-lg font-bold text-gray-900 mb-4">Event Details</h2>
                  
                  {/* Event Info Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center space-x-3">
                      <Calendar className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-xs text-gray-500">Event Name</p>
                        <p className="text-sm font-medium text-gray-900">{selectedEvent.title}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Clock className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-xs text-gray-500">Event Date</p>
                        <p className="text-sm font-medium text-gray-900">{selectedEvent.eventDate}</p>
                      </div>
                    </div>
                    {selectedEvent.venue && (
                      <div className="flex items-center space-x-3">
                        <MapPin className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-xs text-gray-500">Venue</p>
                          <p className="text-sm font-medium text-gray-900">{selectedEvent.venue}</p>
                        </div>
                      </div>
                    )}
                    {selectedEvent.department && (
                      <div className="flex items-center space-x-3">
                        <User className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-xs text-gray-500">Department</p>
                          <p className="text-sm font-medium text-gray-900">{selectedEvent.department}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Attendance Status */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Attendance Status
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <label className={`flex items-center justify-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        status === "Present" 
                          ? 'border-green-500 bg-green-50' 
                          : 'border-gray-200 bg-white hover:bg-gray-50'
                      }`}>
                        <input
                          type="radio"
                          name="status"
                          value="Present"
                          checked={status === "Present"}
                          onChange={(e) => setStatus(e.target.value)}
                          className="sr-only"
                        />
                        <CheckCircle className={`w-5 h-5 mr-2 ${
                          status === "Present" ? 'text-green-600' : 'text-gray-400'
                        }`} />
                        <span className={`font-medium ${
                          status === "Present" ? 'text-green-900' : 'text-gray-700'
                        }`}>
                          Present
                        </span>
                      </label>

                      <label className={`flex items-center justify-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        status === "Absent" 
                          ? 'border-red-500 bg-red-50' 
                          : 'border-gray-200 bg-white hover:bg-gray-50'
                      }`}>
                        <input
                          type="radio"
                          name="status"
                          value="Absent"
                          checked={status === "Absent"}
                          onChange={(e) => setStatus(e.target.value)}
                          className="sr-only"
                        />
                        <XCircle className={`w-5 h-5 mr-2 ${
                          status === "Absent" ? 'text-red-600' : 'text-gray-400'
                        }`} />
                        <span className={`font-medium ${
                          status === "Absent" ? 'text-red-900' : 'text-gray-700'
                        }`}>
                          Absent
                        </span>
                      </label>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    onClick={submitAttendance}
                    disabled={submitting}
                    className={`w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium py-4 px-6 rounded-lg transition-all shadow-sm hover:shadow-md ${
                      submitting ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Submitting...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        <span>Submit Attendance</span>
                      </>
                    )}
                  </button>

                  {/* Info Note */}
                  <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-xs text-blue-700 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-2" />
                      Your attendance will be sent for admin approval
                    </p>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Attendance;