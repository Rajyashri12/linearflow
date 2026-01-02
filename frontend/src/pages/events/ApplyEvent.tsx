import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { Calendar, MapPin, Users, FileText, Plus, X, Loader2 } from "lucide-react";

const ApplyEvent = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  // Form States
  const [title, setTitle] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [venue, setVenue] = useState("");
  const [department, setDepartment] = useState("");
  const [hodApprovalType, setHodApprovalType] = useState("DEPARTMENT");

  // Volunteer States
  const [students, setStudents] = useState<any[]>([]);
  const [volunteers, setVolunteers] = useState<string[]>([]);
  const [inputName, setInputName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const departments = ["CS", "IT", "AIML", "DS", "IOT", "EXTC", "Mechanical", "Civil", "Electrical"];

  useEffect(() => {
    if (!user) return;
    api.get("/users?role=student").then((data) => {
      setStudents(Array.isArray(data) ? data : []);
    }).catch(err => {
      console.error("Failed to load students:", err);
    });
  }, [user]);

  const addVolunteer = (name: string) => {
    if (!name || volunteers.includes(name)) return;
    setVolunteers(prev => [...prev, name]);
    setInputName("");
  };

  const removeVolunteer = (name: string) => {
    setVolunteers(prev => prev.filter(v => v !== name));
  };

  const submit = async () => {
    if (!user) {
      alert("User not authenticated");
      return;
    }
    if (!title || !eventDate || !venue || (hodApprovalType === "DEPARTMENT" && !department)) {
      alert("Please fill in all required fields.");
      return;
    }

    setSubmitting(true);
    try {
      await api.post("/eventPermissions", {
        title,
        committeeHeadUid: user.uid,
        eventDate,
        venue,
        department: hodApprovalType === "ALL" ? "All Departments" : department,
        hodApprovalType,
        volunteers,
        status: "PENDING_HOD",
        principalStatus: "PENDING",
      });

      alert("Event permission applied successfully!");
      navigate("/dashboard");
    } catch (err) {
      alert("Failed to submit application.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="Create Event Application">
        <div className="bg-white rounded-2xl p-16 shadow-sm border border-gray-100 text-center">
          <Loader2 className="w-8 h-8 text-gray-400 animate-spin mx-auto mb-3" />
          <p className="text-gray-500 font-medium">Loading...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title={
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center">
            <FileText className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Create Event Application
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">Submit a new event permission request</p>
          </div>
        </div>
      }
    >
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Basic Information Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              Basic Information
            </h2>
          </div>
          <div className="p-6 space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Event Title *
              </label>
              <input
                type="text"
                placeholder="Enter event name"
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  Event Date *
                </label>
                <input
                  type="date"
                  value={eventDate}
                  onChange={e => setEventDate(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  Venue *
                </label>
                <input
                  type="text"
                  placeholder="Room / Hall"
                  value={venue}
                  onChange={e => setVenue(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Approval Scope Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-bold text-gray-900">Approval Scope</h2>
          </div>
          <div className="p-6 space-y-5">
            <div className="space-y-3">
              <label className="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                <input
                  type="radio"
                  checked={hodApprovalType === "DEPARTMENT"}
                  onChange={() => setHodApprovalType("DEPARTMENT")}
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-3 text-gray-900 font-medium">Specific Department</span>
              </label>

              <label className="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                <input
                  type="radio"
                  checked={hodApprovalType === "ALL"}
                  onChange={() => { setHodApprovalType("ALL"); setDepartment(""); }}
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-3 text-gray-900 font-medium">All Departments</span>
              </label>
            </div>

            {hodApprovalType === "DEPARTMENT" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Department *
                </label>
                <select
                  value={department}
                  onChange={e => setDepartment(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Choose department...</option>
                  {departments.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Volunteers Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />
              Volunteers
            </h2>
            <p className="text-sm text-gray-500 mt-1">Add student volunteers for this event</p>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select from Students
              </label>
              <select
                onChange={e => addVolunteer(e.target.value)}
                value=""
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Choose a student...</option>
                {students.map(s => (
                  <option key={s.id} value={s.email}>{s.email}</option>
                ))}
              </select>
            </div>

            <div className="flex gap-3">
              <input
                type="text"
                placeholder="Or type manual name"
                value={inputName}
                onChange={e => setInputName(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    addVolunteer(inputName);
                  }
                }}
                className="flex-1 px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                onClick={() => addVolunteer(inputName)}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                <Plus className="w-4 h-4" />
                Add
              </button>
            </div>

            {volunteers.length > 0 && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium text-gray-700 mb-3">
                  Selected Volunteers ({volunteers.length})
                </p>
                <div className="flex flex-wrap gap-2">
                  {volunteers.map(v => (
                    <span
                      key={v}
                      className="inline-flex items-center gap-2 px-3 py-2 bg-white border border-blue-200 text-blue-700 rounded-lg text-sm font-medium"
                    >
                      {v}
                      <button
                        onClick={() => removeVolunteer(v)}
                        className="hover:bg-blue-100 rounded-full p-0.5 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pb-6">
          <button
            onClick={() => navigate("/dashboard")}
            disabled={submitting}
            className="px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={submit}
            disabled={submitting}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-lg transition-all shadow-sm hover:shadow-md font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Submitting...</span>
              </>
            ) : (
              <>
                <FileText className="w-4 h-4" />
                <span>Submit Application</span>
              </>
            )}
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ApplyEvent;