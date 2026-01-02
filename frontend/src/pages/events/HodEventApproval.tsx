import { useEffect, useState } from "react";
import { api } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import DashboardLayout from "../../components/layout/DashboardLayout";
import NotificationBell from "../../components/common/NotificationBell";
import { 
  Calendar, MapPin, CheckCircle, XCircle, Clock, 
  Users, Search, Loader2, FileText 
} from "lucide-react";

const HodEventApproval = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [processingId, setProcessingId] = useState<number | null>(null);

  const load = async () => {
    try {
      const data = await api.get("/eventPermissions?status=PENDING_HOD");
      setEvents(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to load events:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const approve = async (event: any) => {
    if (!user) return;
    
    setProcessingId(event.id);
    try {
      const approvals = [...(event.hodApprovals || []), user.uid];

      let newStatus = event.status;

      if (
        event.hodApprovalType === "DEPARTMENT" ||
        (event.hodApprovalType === "ALL" && approvals.length >= 3)
      ) {
        newStatus = "PENDING_PRINCIPAL";
      }

      await api.patch(`/eventPermissions/${event.id}`, {
        hodApprovals: approvals,
        status: newStatus,
      });

      alert("Event approved successfully!");
      load();
    } catch (error) {
      console.error("Failed to approve event:", error);
      alert("Failed to approve event");
    } finally {
      setProcessingId(null);
    }
  };

  const reject = async (event: any) => {
    if (!window.confirm(`Reject "${event.title}"?`)) return;
    
    setProcessingId(event.id);
    try {
      await api.patch(`/eventPermissions/${event.id}`, {
        status: "REJECTED",
        principalStatus: "TERMINATED",
      });

      alert("Event rejected");
      load();
    } catch (error) {
      console.error("Failed to reject event:", error);
      alert("Failed to reject event");
    } finally {
      setProcessingId(null);
    }
  };

  const filteredEvents = events.filter((e) => 
    e.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.venue?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.department?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = [
    {
      label: "Pending Approvals",
      value: events.length,
      icon: Clock,
      color: "from-amber-500 to-orange-500"
    },
    {
      label: "This Week",
      value: events.filter(e => {
        const eventDate = new Date(e.eventDate);
        const today = new Date();
        const daysDiff = Math.ceil((eventDate.getTime() - today.getTime()) / (1000 * 3600 * 24));
        return daysDiff <= 7 && daysDiff >= 0;
      }).length,
      icon: Calendar,
      color: "from-blue-500 to-indigo-500"
    },
    {
      label: "Departments",
      value: new Set(events.map(e => e.department).filter(Boolean)).size,
      icon: Users,
      color: "from-purple-500 to-pink-500"
    },
  ];

  return (
    <DashboardLayout
      title={
        <div className="flex justify-between items-center w-full">
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              HOD Event Approvals
            </h1>
            <p className="text-sm text-gray-500 mt-1">Review and approve event requests</p>
          </div>
          <NotificationBell />
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

        {/* Search Bar */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search events..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="bg-white rounded-2xl p-12 shadow-sm border border-gray-100 text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-gray-600 font-medium">Loading events...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredEvents.length === 0 && (
          <div className="bg-white rounded-2xl p-12 shadow-sm border border-gray-100 text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">All Clear!</h3>
            <p className="text-gray-600">No pending event approvals</p>
          </div>
        )}

        {/* Events List */}
        <div className="space-y-4">
          {filteredEvents.map((e) => {
            const isProcessing = processingId === e.id;
            const approvalCount = e.hodApprovals?.length || 0;
            const needsMoreApprovals = e.hodApprovalType === "ALL" && approvalCount < 3;

            return (
              <div
                key={e.id}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all overflow-hidden"
              >
                {/* Status Bar */}
                <div className="h-1 bg-gradient-to-r from-amber-400 to-orange-600"></div>

                <div className="p-6">
                  {/* Header */}
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-4 gap-4">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                        {e.title?.charAt(0) || "E"}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">{e.title}</h3>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {e.department && (
                            <span className="inline-block px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-medium">
                              {e.department}
                            </span>
                          )}
                          {e.hodApprovalType === "ALL" && (
                            <span className="inline-block px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-xs font-medium">
                              Requires 3 HOD Approvals ({approvalCount}/3)
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <span className="inline-block px-3 py-1 rounded-full text-xs font-medium border bg-amber-100 text-amber-700 border-amber-200">
                      PENDING HOD
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

                  {/* Volunteers */}
                  {e.volunteers && e.volunteers.length > 0 && (
                    <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                      <p className="text-xs text-blue-700 font-medium mb-2 flex items-center">
                        <Users className="w-4 h-4 mr-2" />
                        Volunteers ({e.volunteers.length})
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {e.volunteers.slice(0, 5).map((v: string, idx: number) => (
                          <span key={idx} className="text-xs bg-white px-2 py-1 rounded border border-blue-200 text-blue-900">
                            {v}
                          </span>
                        ))}
                        {e.volunteers.length > 5 && (
                          <span className="text-xs text-blue-700 font-medium">
                            +{e.volunteers.length - 5} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={() => approve(e)}
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
                      onClick={() => reject(e)}
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

export default HodEventApproval;