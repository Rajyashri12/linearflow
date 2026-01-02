import { useEffect, useState } from "react";
import { api } from "../../services/api";
import { 
  Calendar, MapPin, Users, ChevronDown, ChevronUp, 
  Filter, RotateCcw, Loader2, FileText, Download, 
  Building2, Clock, CheckCircle, Mail
} from "lucide-react";

interface Props {
  showVolunteers?: boolean;
}

const EventOverview = ({ showVolunteers = false }: Props) => {
  const [allEvents, setAllEvents] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [openId, setOpenId] = useState<string | null>(null);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [loading, setLoading] = useState(false);

  const loadAll = async () => {
    setLoading(true);
    try {
      const res = await api.get("/eventPermissions?status=APPROVED&principalStatus=APPROVED");
      const data = res.data || res;
      const list = Array.isArray(data) ? data : [];
      setAllEvents(list);
      setEvents(list);
    } catch (err) {
      console.error("Failed to load events", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const applyFilter = () => {
    if (!from || !to) {
      alert("Please select both dates");
      return;
    }
    if (from > to) {
      alert("Invalid date range");
      return;
    }
    const filtered = allEvents.filter((e) => e.eventDate >= from && e.eventDate <= to);
    setEvents(filtered);
  };

  const resetFilter = () => {
    setFrom("");
    setTo("");
    setEvents(allEvents);
  };

  const exportToCSV = () => {
    if (events.length === 0) {
      alert("No events to export");
      return;
    }

    const headers = ["Event Title", "Date", "Venue", "Department", "Organized By", "Volunteers Count"];
    const rows = events.map(e => [
      e.title,
      e.eventDate,
      e.venue,
      e.department || "N/A",
      e.organisedBy || "N/A",
      Array.isArray(e.volunteers) ? e.volunteers.length : 0
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `events_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const exportEventDetails = (event: any) => {
    const details = `
EVENT DETAILS
=============

Title: ${event.title}
Date: ${event.eventDate}
Venue: ${event.venue}
Department: ${event.department || "N/A"}
Organized By: ${event.organisedBy || "N/A"}
Description: ${event.description || "N/A"}

${showVolunteers && event.volunteers ? `
VOLUNTEERS (${event.volunteers.length})
===========
${event.volunteers.map((v: string, i: number) => `${i + 1}. ${v}`).join('\n')}
` : ''}
    `.trim();

    const blob = new Blob([details], { type: "text/plain" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${event.title.replace(/[^a-z0-9]/gi, '_')}_details.txt`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Filter Section */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 animate-fadeIn">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Calendar className="w-6 h-6 text-blue-600" />
              Events Overview
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              {events.length} {events.length === 1 ? 'event' : 'events'} found
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
              <span className="text-gray-400 font-medium">to</span>
              <input
                type="date"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={applyFilter}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg transition-all shadow-sm hover:shadow-md font-medium transform hover:scale-105"
              >
                <Filter className="w-4 h-4" />
                Apply
              </button>
              <button
                onClick={resetFilter}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all font-medium"
              >
                <RotateCcw className="w-4 h-4" />
                Reset
              </button>
              <button
                onClick={exportToCSV}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-all shadow-sm hover:shadow-md font-medium transform hover:scale-105"
              >
                <Download className="w-4 h-4" />
                Export
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="bg-white rounded-2xl p-12 shadow-sm border border-gray-100 text-center animate-fadeIn">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600 font-medium">Loading events...</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && events.length === 0 && (
        <div className="bg-white rounded-2xl p-12 shadow-sm border border-gray-100 text-center animate-fadeIn">
          <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <Calendar className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">No Events Found</h3>
          <p className="text-gray-600">No events found in the selected date range</p>
        </div>
      )}

      {/* Events Grid */}
      {!loading && events.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((e, index) => (
            <div
              key={e.id}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 overflow-hidden hover:-translate-y-1 animate-slideUp"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {/* Status Bar */}
              <div className="h-1 bg-gradient-to-r from-green-400 via-emerald-500 to-teal-600"></div>

              <div className="p-6">
                {/* Header with Export */}
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h4 className="text-lg font-bold text-gray-900 mb-2 hover:text-blue-600 transition-colors">
                      {e.title}
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
                        <MapPin className="w-3 h-3" />
                        {e.venue}
                      </span>
                      {e.department && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-xs font-medium">
                          <Building2 className="w-3 h-3" />
                          {e.department}
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => exportEventDetails(e)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors group"
                    title="Download event details"
                  >
                    <Download className="w-4 h-4 text-gray-400 group-hover:text-blue-600 transition-colors" />
                  </button>
                </div>

                {/* Enhanced Details Grid */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Calendar className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-500 font-medium">Event Date</p>
                      <p className="text-sm text-gray-900 font-semibold">{e.eventDate}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <FileText className="w-4 h-4 text-green-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-500 font-medium">Organized By</p>
                      <p className="text-sm text-gray-900 font-semibold truncate">{e.organisedBy || "N/A"}</p>
                    </div>
                  </div>

                  {e.status && (
                    <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-100">
                      <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-green-600 font-medium">Status</p>
                        <p className="text-sm text-green-900 font-bold">Approved</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Description */}
                {e.description && (
                  <div className="mb-4 p-3 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-lg">
                    <p className="text-xs text-blue-600 font-medium mb-1 flex items-center gap-1">
                      <FileText className="w-3 h-3" />
                      Description
                    </p>
                    <p className="text-sm text-blue-900 leading-relaxed">{e.description}</p>
                  </div>
                )}

                {/* Enhanced Volunteers Section */}
                {showVolunteers && (
                  <div className="border-t border-gray-100 pt-4">
                    <button
                      onClick={() => setOpenId(openId === e.id ? null : e.id)}
                      className="w-full flex items-center justify-between px-4 py-3 bg-gradient-to-r from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 border border-purple-200 rounded-lg transition-all duration-200 group"
                    >
                      <span className="flex items-center gap-2 text-sm font-semibold text-purple-700">
                        <Users className="w-4 h-4 group-hover:scale-110 transition-transform" />
                        Volunteers
                        {Array.isArray(e.volunteers) && e.volunteers.length > 0 && (
                          <span className="px-2 py-0.5 bg-purple-600 text-white rounded-full text-xs font-bold shadow-sm">
                            {e.volunteers.length}
                          </span>
                        )}
                      </span>
                      {openId === e.id ? (
                        <ChevronUp className="w-4 h-4 text-purple-600 group-hover:scale-110 transition-transform" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-purple-600 group-hover:scale-110 transition-transform" />
                      )}
                    </button>

                    {openId === e.id && (
                      <div className="mt-3 p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg border border-purple-100 animate-slideDown">
                        {Array.isArray(e.volunteers) && e.volunteers.length > 0 ? (
                          <div className="space-y-2">
                            {e.volunteers.map((v: string, i: number) => (
                              <div
                                key={i}
                                className="flex items-center gap-3 bg-white px-4 py-3 rounded-lg border border-purple-200 hover:border-purple-300 hover:shadow-sm transition-all duration-200 group animate-fadeIn"
                                style={{ animationDelay: `${i * 50}ms` }}
                              >
                                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-sm group-hover:scale-110 transition-transform">
                                  {v.charAt(0).toUpperCase()}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-semibold text-gray-900 truncate">{v}</p>
                                  <p className="text-xs text-gray-500 flex items-center gap-1">
                                    <Mail className="w-3 h-3" />
                                    Volunteer #{i + 1}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-6">
                            <Users className="w-12 h-12 text-purple-300 mx-auto mb-2" />
                            <p className="text-sm text-purple-600 font-medium">No volunteers assigned yet</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideUp {
          from { 
            opacity: 0;
            transform: translateY(20px);
          }
          to { 
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes slideDown {
          from {
            opacity: 0;
            max-height: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            max-height: 1000px;
            transform: translateY(0);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
        }
        
        .animate-slideUp {
          animation: slideUp 0.4s ease-out forwards;
          opacity: 0;
        }
        
        .animate-slideDown {
          animation: slideDown 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default EventOverview;