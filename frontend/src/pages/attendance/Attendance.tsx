import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../services/api";
import DashboardLayout from "../../components/layout/DashboardLayout";
import {
  Calendar,
  MapPin,
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
  Send,
  User,
  AlertCircle,
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

  /* ✅ FIXED SUBMIT FUNCTION */
  const submitAttendance = async () => {
    if (!selectedEvent || !user) {
      alert("Please select an event first");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        userId: user.uid,                 // ✅ REQUIRED by backend
        eventId: selectedEvent.id,        // ✅ REQUIRED by backend

        // Optional fields (safe to keep)
        studentName: user.email,
        eventTitle: selectedEvent.title,
        date: selectedEvent.eventDate,
        status,
        approvalStatus: "PENDING_ADMIN",
      };

      console.log("Submitting attendance:", payload); // debug

      await api.post("/attendance", payload);

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
      color: "from-blue-500 to-indigo-500",
    },
    {
      label: "This Week",
      value: events.filter((e) => {
        const eventDate = new Date(e.eventDate);
        const today = new Date();
        const daysDiff = Math.ceil(
          (eventDate.getTime() - today.getTime()) /
            (1000 * 3600 * 24)
        );
        return daysDiff <= 7 && daysDiff >= 0;
      }).length,
      icon: Clock,
      color: "from-green-500 to-emerald-500",
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
            <p className="text-sm text-gray-500 mt-0.5">
              Submit your attendance for approved events
            </p>
          </div>
        </div>
      }
    >
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {stats.map((stat, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm font-medium">
                    {stat.label}
                  </p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    {stat.value}
                  </p>
                </div>
                <div
                  className={`w-14 h-14 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center`}
                >
                  <stat.icon className="w-7 h-7 text-white" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {loading && (
          <div className="bg-white rounded-2xl p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-gray-600 font-medium">
              Loading events...
            </p>
          </div>
        )}

        {!loading && events.length === 0 && (
          <div className="bg-white rounded-2xl p-12 text-center">
            <AlertCircle className="w-8 h-8 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900">
              No Events Available
            </h3>
          </div>
        )}

        {!loading && events.length > 0 && (
          <>
            <select
              onChange={(e) => handleEventSelect(e.target.value)}
              value={selectedEvent?.id || ""}
              className="w-full px-4 py-3 border rounded-lg"
            >
              <option value="">-- Choose an Event --</option>
              {events.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.title} - {e.eventDate}
                </option>
              ))}
            </select>

            {selectedEvent && (
              <button
                onClick={submitAttendance}
                disabled={submitting}
                className="w-full flex items-center justify-center bg-blue-600 text-white py-4 rounded-lg"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5 mr-2" />
                    Submit Attendance
                  </>
                )}
              </button>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Attendance;
