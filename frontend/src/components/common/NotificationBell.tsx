import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { getNotificationsByRole, markNotificationAsRead } from "../../services/notification.service";

const NotificationBell = () => {
  const { role } = useAuth();
  const [items, setItems] = useState<any[]>([]);
  const [open, setOpen] = useState(false);

  const load = async () => {
    // If no role is logged in, don't attempt to fetch
    if (!role) return;
    
    try {
      const res = await getNotificationsByRole(role);
      const data = res.data || res; 
      setItems(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Polling failed:", error);
    }
  };

  useEffect(() => {
    // Initial load
    load();

    // Set interval to refresh every 5 seconds
    const intervalId = setInterval(load, 5000);

    // Cleanup interval on component unmount
    return () => clearInterval(intervalId);
  }, [role]);

  const markRead = async (id: string) => {
    try {
      await markNotificationAsRead(id);
      // Immediately filter out the item from state for instant UI feedback
      setItems(prev => prev.filter(item => item.id !== id));
    } catch (error) {
      console.error("Mark read failed:", error);
    }
  };

  const markAll = async () => {
    try {
      const promises = items.map((n) => markNotificationAsRead(n.id));
      await Promise.all(promises);
      setItems([]); // Clear UI immediately
      setOpen(false); // Close dropdown
    } catch (error) {
      console.error("Mark all failed:", error);
    }
  };

  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      {/* Bell Button with Badge */}
      <button 
        onClick={() => setOpen(!open)}
        style={{
          background: "none",
          border: "none",
          fontSize: "20px",
          cursor: "pointer",
          position: "relative"
        }}
      >
        🔔
        {items.length > 0 && (
          <span style={{
            position: "absolute",
            top: "-5px",
            right: "-5px",
            background: "red",
            color: "white",
            borderRadius: "50%",
            padding: "2px 6px",
            fontSize: "12px",
            fontWeight: "bold"
          }}>
            {items.length}
          </span>
        )}
      </button>

      {/* Dropdown Menu */}
      {open && (
        <div style={{ 
          position: "absolute", 
          right: 0, 
          top: "35px",
          width: "300px", 
          background: "#fff", 
          border: "1px solid #ddd", 
          boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
          borderRadius: "8px",
          zIndex: 100 
        }}>
          <div style={{ 
            padding: "10px", 
            borderBottom: "1px solid #eee", 
            display: "flex", 
            justifyContent: "space-between",
            alignItems: "center"
          }}>
            <strong style={{ fontSize: "14px" }}>Notifications</strong>
            {items.length > 0 && (
              <button 
                onClick={markAll}
                style={{ fontSize: "11px", color: "#007bff", border: "none", background: "none", cursor: "pointer" }}
              >
                Mark all as read
              </button>
            )}
          </div>

          <div style={{ maxHeight: "300px", overflowY: "auto" }}>
            {items.length === 0 ? (
              <p style={{ padding: "20px", textAlign: "center", color: "#888", margin: 0 }}>
                No new notifications
              </p>
            ) : (
              items.map((n) => (
                <div key={n.id} style={{ 
                  padding: "12px", 
                  borderBottom: "1px solid #f9f9f9",
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px"
                }}>
                  <p style={{ margin: 0, fontSize: "13px", color: "#333", lineHeight: "1.4" }}>
                    {n.message}
                  </p>
                  <button 
                    onClick={() => markRead(n.id)} 
                    style={{ 
                      alignSelf: "flex-end",
                      fontSize: "10px", 
                      padding: "4px 8px",
                      borderRadius: "4px",
                      border: "1px solid #ddd",
                      background: "#f8f9fa",
                      cursor: "pointer"
                    }}
                  >
                    Dismiss
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;