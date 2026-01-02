import { useEffect, useState } from "react";
import { api } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import DashboardLayout from "../../components/layout/DashboardLayout";
import LogoutButton from "../../components/common/LogoutButton";
import { 
  Calendar, MapPin, CheckCircle, XCircle, AlertTriangle, 
  Clock, Shield, Search, Filter, Loader2, Users, FileText 
} from "lucide-react";

const PrincipalDashboard = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDepartment, setFilterDepartment] = useState("all");
  const [processingId, setProcessingId] = useState<number | null>(null);

  const load = async () => {
    try {
      const data = await api.get("/eventPermissions?status=PENDING_PRINCIPAL");
      setRequests(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error loading requests:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const approve = async (req: any) => {
    setProcessingId(req.id);
    try {
      // Check for collision
      const existing = await api.get(
        `/eventPermissions?status=APPROVED&principalStatus=APPROVED&eventDate=${req.eventDate}&venue=${req.venue}`
      );

      if (Array.isArray(existing) && existing.length > 0) {
        const collided = existing[0];

        // Handle collision
        await api.patch(`/eventPermissions/${req.id}`, {
          status: "COLLISION",
          principalStatus: "TERMINATED",
          collisionWith: collided.title,
        });

        await api.post("/notifications", {
          toRole: "committee_head",
          message: `Event "${req.title}" cancelled due to collision with "${collided.title}"`,
          read: false,
        });

        alert(`⚠️ Collision detected with "${collided.title}". Event marked as collision.`);
        load();
        return;
      }

      // Normal approval
      await api.patch(`/eventPermissions/${req.id}`, {
        status: "APPROVED",
        principalStatus: "APPROVED",
        organisedBy: req.organisedBy || "Committee Head",
        description: req.description || "Approved by Principal",
      });

      await api.post("/notifications", {
        toRole: "committee_head",
        message: `Event "${req.title}" approved by Principal`,
        read: false,
      });

      alert("✅ Event approved successfully");
      load();
    } catch (error) {
      console.error("Error approving event:", error);
      alert("Failed to approve event. Please try again.");
    } finally {
      setProcessingId(null);
    }
  };

  const reject = async (req: any) => {
    if (!window.confirm(`Are you sure you want to reject "${req.title}"?`)) return;
    
    setProcessingId(req.id);
    try {
      await api.patch(`/eventPermissions/${req.id}`, {
        status: "REJECTED",
        principalStatus: "TERMINATED",
      });

      await api.post("/notifications", {
        toRole: "committee_head",
        message: `Event "${req.title}" rejected by Principal`,
        read: false,
      });

      load();
    } catch (error) {
      console.error("Error rejecting event:", error);
      alert("Failed to reject event. Please try again.");
    } finally {
      setProcessingId(null);
    }
  };

  const filteredRequests = requests.filter((r) => {
    const matchesSearch = 
      r.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.venue?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.department?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDepartment = filterDepartment === "all" || r.department === filterDepartment;
    
    return matchesSearch && matchesDepartment;
  });

  const departments = ["all", ...new Set(requests.map(r => r.department).filter(Boolean))];

  const stats = [
    { 
      label: "Pending Approvals", 
      value: requests.length, 
      icon: Clock, 
      color: "from-purple-500 to-indigo-500" 
    },
    { 
      label: "Urgent Reviews", 
      value: requests.filter(r => {
        const eventDate = new Date(r.eventDate);
        const today = new Date();
        const daysDiff = Math.ceil((eventDate.getTime() - today.getTime()) / (1000 * 3600 * 24));
        return daysDiff <= 7 && daysDiff >= 0;
      }).length, 
      icon: AlertTriangle, 
      color: "from-red-500 to-pink-500" 
    },
    { 
      label: "This Month", 
      value: requests.filter(r => {
        const eventDate = new Date(r.eventDate);
        const today = new Date();
        return eventDate.getMonth() === today.getMonth() && 
               eventDate.getFullYear() === today.getFullYear();
      }).length, 
      icon: Calendar, 
      color: "from-blue-500 to-cyan-500" 
    },
  ];

  return (
    <DashboardLayout
      title={
        <div className="flex justify-between items-center w-full gap-6">
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
              Principal Dashboard
            </h1>
            <p className="text-sm text-gray-500 mt-1">Final approval and collision management</p>
          </div>
          <div className="flex items-center gap-4">
            {user && (
              <div className="hidden sm:flex items-center gap-3 px-5 py-3 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border border-gray-200 shadow-sm">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-md">
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

        {/* Search and Filter Bar */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by event name, venue, or department..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                value={filterDepartment}
                onChange={(e) => setFilterDepartment(e.target.value)}
                className="pl-10 pr-8 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent appearance-none bg-white min-w-[200px]"
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

        {/* Loading State */}
        {loading && (
          <div className="bg-white rounded-2xl p-12 shadow-sm border border-gray-100 text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mb-4"></div>
            <p className="text-gray-600 font-medium">Loading approval requests...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredRequests.length === 0 && (
          <div className="bg-white rounded-2xl p-12 shadow-sm border border-gray-100 text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">All Clear!</h3>
            <p className="text-gray-600">No pending approvals at the moment</p>
          </div>
        )}

        {/* Requests List */}
        <div className="space-y-4">
          {filteredRequests.map((r) => {
            const isProcessing = processingId === r.id;
            const eventDate = new Date(r.eventDate);
            const today = new Date();
            const daysDiff = Math.ceil((eventDate.getTime() - today.getTime()) / (1000 * 3600 * 24));
            const isUrgent = daysDiff <= 7 && daysDiff >= 0;

            return (
              <div
                key={r.id}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all overflow-hidden"
              >
                {/* Status Bar */}
                <div className={`h-1 bg-gradient-to-r ${
                  isUrgent ? 'from-red-400 to-pink-600' : 'from-purple-400 to-indigo-600'
                }`}></div>

                <div className="p-6">
                  {/* Header */}
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-4 gap-4">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-xl flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                        {r.title?.charAt(0) || "E"}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">{r.title}</h3>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {r.department && (
                            <span className="inline-block px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-medium">
                              {r.department}
                            </span>
                          )}
                          {isUrgent && (
                            <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-50 text-red-700 rounded-full text-xs font-medium">
                              <AlertTriangle className="w-3 h-3" />
                              Urgent - {daysDiff} days left
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Shield className="w-5 h-5 text-purple-600" />
                      <span className="inline-block px-3 py-1 rounded-full text-xs font-medium border bg-purple-100 text-purple-700 border-purple-200">
                        AWAITING PRINCIPAL
                      </span>
                    </div>
                  </div>

                  {/* Info Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center space-x-3">
                      <Calendar className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-xs text-gray-500">Event Date</p>
                        <p className="text-sm font-medium text-gray-900">{r.eventDate}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <MapPin className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-xs text-gray-500">Venue</p>
                        <p className="text-sm font-medium text-gray-900">{r.venue || "Not specified"}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Users className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-xs text-gray-500">Organized By</p>
                        <p className="text-sm font-medium text-gray-900">{r.organisedBy || "Committee Head"}</p>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  {r.description && (
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl mb-4">
                      <p className="text-xs text-blue-700 flex items-center mb-2">
                        <FileText className="w-4 h-4 mr-2" />
                        <span className="font-medium">Event Description</span>
                      </p>
                      <p className="text-sm text-blue-900">{r.description}</p>
                    </div>
                  )}

                  {/* HOD Approval Info */}
                  {r.hodRemark && (
                    <div className="p-4 bg-green-50 border border-green-200 rounded-xl mb-4">
                      <p className="text-xs text-green-700 flex items-center mb-2">
                        <CheckCircle className="w-4 h-4 mr-2" />
                        <span className="font-medium">HOD Approval</span>
                      </p>
                      <p className="text-sm text-green-900">{r.hodRemark}</p>
                    </div>
                  )}

                  {/* Collision Warning */}
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl mb-4">
                    <p className="text-xs text-amber-700 flex items-center">
                      <AlertTriangle className="w-4 h-4 mr-2" />
                      <span className="font-medium">Collision Check:</span>
                      <span className="ml-2">System will automatically verify venue availability</span>
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={() => approve(r)}
                      disabled={isProcessing}
                      className={`flex-1 flex items-center justify-center space-x-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-medium py-3 px-6 rounded-lg transition-all shadow-sm hover:shadow-md ${
                        isProcessing ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          <span>Processing...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-5 h-5" />
                          <span>Approve Event</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => reject(r)}
                      disabled={isProcessing}
                      className={`flex-1 flex items-center justify-center space-x-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-medium py-3 px-6 rounded-lg transition-all shadow-sm hover:shadow-md ${
                        isProcessing ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          <span>Processing...</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-5 h-5" />
                          <span>Reject Event</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default PrincipalDashboard;