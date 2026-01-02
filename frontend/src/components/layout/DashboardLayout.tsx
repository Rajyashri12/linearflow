import EventOverview from "../common/EventOverview";

import NotificationBell from "../common/NotificationBell";



interface Props {

  title: React.ReactNode;

  children: React.ReactNode;

  hideEventsOverview?: boolean;

}



const DashboardLayout = ({

  title,

  children,

  hideEventsOverview = false,

}: Props) => {

  return (

    <div style={styles.pageWrapper}>

      <div style={styles.container}>

        {/* --- HEADER SECTION --- */}

        <header style={styles.header}>

          <div style={styles.titleSection}>

            <h2 style={styles.titleText}>{title}</h2>

            <div style={styles.underline} />

          </div>

         

          <div style={styles.actionSection}>

            <NotificationBell />

          </div>

        </header>



        {/* --- OVERVIEW SECTION --- */}

        {!hideEventsOverview && (

          <section style={styles.overviewSection}>

            <EventOverview />

          </section>

        )}



        {/* --- MAIN CONTENT AREA --- */}

        <main style={styles.mainContent}>

          {children}

        </main>

      </div>

    </div>

  );

};



const styles: Record<string, React.CSSProperties> = {

  pageWrapper: {

    minHeight: "100vh",

    backgroundColor: "#f8fafc", // Light grayish-blue background

    padding: "24px 16px",

    fontFamily: "'Inter', system-ui, sans-serif",

  },

  container: {

    maxWidth: "1200px",

    margin: "0 auto",

  },

  header: {

    display: "flex",

    justifyContent: "space-between",

    alignItems: "center",

    padding: "16px 24px",

    backgroundColor: "#ffffff",

    borderRadius: "12px",

    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",

    marginBottom: "24px",

  },

  titleSection: {

    display: "flex",

    flexDirection: "column",

    gap: "4px",

  },

  titleText: {

    margin: 0,

    fontSize: "1.5rem",

    fontWeight: 700,

    color: "#1e293b", // Slate 800

  },

  underline: {

    width: "40px",

    height: "4px",

    backgroundColor: "#3b82f6", // Primary Blue

    borderRadius: "2px",

  },

  actionSection: {

    display: "flex",

    alignItems: "center",

    gap: "16px",

  },

  overviewSection: {

    marginBottom: "24px",

    animation: "fadeIn 0.5s ease-in-out",

  },

  mainContent: {

    backgroundColor: "transparent",
    borderRadius: "12px",

  },

};



export default DashboardLayout;