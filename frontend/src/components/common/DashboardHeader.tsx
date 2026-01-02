import EventOverview from "./EventOverview";
import NotificationBell from "./NotificationBell";

const DashboardHeader = ({ title }: { title: string }) => {
  return (
    <div style={styles.headerContainer}>
      {/* --- TOP BAR: Title and Notification --- */}
      <div style={styles.topBar}>
        <div style={styles.titleGroup}>
          <h2 style={styles.titleText}>{title}</h2>
          <div style={styles.accentLine} />
        </div>
        
        <div style={styles.bellWrapper}>
          <NotificationBell />
        </div>
      </div>

      {/* --- SUMMARY SECTION --- */}
      <div style={styles.overviewWrapper}>
        <EventOverview />
      </div>

      <div style={styles.divider} />
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  headerContainer: {
    marginBottom: "24px",
    fontFamily: "'Inter', system-ui, sans-serif",
  },
  topBar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
  },
  titleGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  titleText: {
    margin: 0,
    fontSize: "1.75rem",
    fontWeight: 700,
    color: "#0f172a", // Dark Slate
    letterSpacing: "-0.025em",
  },
  accentLine: {
    width: "40px",
    height: "4px",
    backgroundColor: "#3b82f6", // Bright Blue
    borderRadius: "2px",
  },
  bellWrapper: {
    padding: "8px",
    backgroundColor: "#ffffff",
    borderRadius: "50%",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    transition: "transform 0.2s ease",
  },
  overviewWrapper: {
    backgroundColor: "#ffffff",
    padding: "16px",
    borderRadius: "12px",
    border: "1px solid #e2e8f0",
    boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
  },
  divider: {
    marginTop: "24px",
    height: "1px",
    backgroundColor: "#e2e8f0", // Light Slate border
    width: "100%",
  }
};

export default DashboardHeader;