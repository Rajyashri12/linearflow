import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../config/firebase";
import { saveUser } from "../../services/user.service";
import { useNavigate } from "react-router-dom";

const Register = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("student");
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false); // New state for message
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // 1️⃣ Firebase Auth
      const res = await createUserWithEmailAndPassword(auth, email, password);

      // 2️⃣ Save role in JSON Server (Sets status to PENDING)
      await saveUser(res.user.uid, email, role);

      // 3️⃣ Show success message instead of redirecting
      setIsSuccess(true);
      
      // Optional: clear inputs
      setEmail("");
      setPassword("");
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.pageWrapper}>
      <div style={styles.registerCard}>
        {isSuccess ? (
          // --- SUCCESS VIEW ---
          <div style={styles.headerSection}>
            <div style={{ fontSize: "50px", marginBottom: "15px" }}>✅</div>
            <h2 style={styles.title}>Registration Sent!</h2>
            <p style={styles.subtitle}>
              Your account has been created and is awaiting Admin approval. 
              You can log in once approved.
            </p>
            <button 
              onClick={() => navigate("/login")} 
              style={{ ...styles.registerButton, marginTop: "20px" }}
            >
              Go to Login
            </button>
            <p 
              onClick={() => setIsSuccess(false)} 
              style={{ ...styles.link, marginTop: "15px", fontSize: "13px", display: "block" }}
            >
              Register another account
            </p>
          </div>
        ) : (
          // --- FORM VIEW ---
          <>
            <div style={styles.headerSection}>
              <div style={styles.logoIcon}>📝</div>
              <h2 style={styles.title}>Create Account</h2>
              <p style={styles.subtitle}>Join the Event Management System</p>
            </div>

            <form onSubmit={handleRegister} style={styles.form}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Email Address</label>
                <input
                  type="email"
                  value={email}
                  placeholder="name@university.edu"
                  required
                  onChange={(e) => setEmail(e.target.value)}
                  style={styles.input}
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Password</label>
                <input
                  type="password"
                  value={password}
                  placeholder="Min. 6 characters"
                  required
                  onChange={(e) => setPassword(e.target.value)}
                  style={styles.input}
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Assign Role</label>
                <select 
                  onChange={(e) => setRole(e.target.value)} 
                  style={styles.select}
                  value={role}
                >
                  <option value="student">Student</option>
                  <option value="committee_head">Committee Head</option>
                  <option value="teacher">Class Teacher</option>
                  <option value="hod">HOD</option>
                  <option value="principal">Principal</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                style={{ 
                  ...styles.registerButton, 
                  opacity: loading ? 0.7 : 1,
                  cursor: loading ? "not-allowed" : "pointer"
                }}
              >
                {loading ? "Creating Account..." : "Register User"}
              </button>
            </form>

            <footer style={styles.footer}>
              <p style={styles.footerText}>
                Already have an account? <span onClick={() => navigate("/login")} style={styles.link}>Sign In</span>
              </p>
            </footer>
          </>
        )}
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  pageWrapper: {
    height: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "linear-gradient(135deg, #74ebd5 0%, #9face6 100%)",
    fontFamily: "'Inter', system-ui, sans-serif",
  },
  registerCard: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    padding: "40px",
    borderRadius: "24px",
    boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
    width: "100%",
    maxWidth: "420px",
    textAlign: "center",
  },
  headerSection: {
    marginBottom: "25px",
  },
  logoIcon: {
    fontSize: "35px",
    marginBottom: "8px",
  },
  title: {
    margin: 0,
    fontSize: "26px",
    fontWeight: 800,
    color: "#1a202c",
  },
  subtitle: {
    color: "#718096",
    fontSize: "14px",
    marginTop: "6px",
    lineHeight: "1.5",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "18px",
    textAlign: "left",
  },
  inputGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  label: {
    fontSize: "13px",
    fontWeight: 600,
    color: "#4a5568",
    marginLeft: "4px",
  },
  input: {
    padding: "12px 16px",
    borderRadius: "12px",
    border: "1px solid #e2e8f0",
    fontSize: "15px",
    transition: "all 0.2s ease",
    outline: "none",
  },
  select: {
    padding: "12px 16px",
    borderRadius: "12px",
    border: "1px solid #e2e8f0",
    backgroundColor: "white",
    fontSize: "15px",
    cursor: "pointer",
    outline: "none",
  },
  registerButton: {
    marginTop: "10px",
    backgroundColor: "#0d9488", 
    color: "white",
    padding: "14px",
    borderRadius: "12px",
    border: "none",
    fontSize: "16px",
    fontWeight: 600,
    boxShadow: "0 4px 6px -1px rgba(13, 148, 136, 0.3)",
    transition: "background-color 0.2s",
  },
  footer: {
    marginTop: "20px",
    borderTop: "1px solid #edf2f7",
    paddingTop: "20px",
  },
  footerText: {
    fontSize: "14px",
    color: "#718096",
    margin: 0,
  },
  link: {
    color: "#0d9488",
    fontWeight: "bold",
    cursor: "pointer",
    textDecoration: "underline",
  }
};

export default Register;