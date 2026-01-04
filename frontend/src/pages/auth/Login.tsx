import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../config/firebase";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { motion, Variants } from "framer-motion"; // Added Variants type

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // 1. Define Variants ABOVE the return statement
  const containerVariants: Variants = {
    hidden: { 
      opacity: 0, 
      scale: 0.5, 
      rotateY: 45, 
      z: -200 
    },
    visible: { 
      opacity: 1, 
      scale: 1, 
      rotateY: 0, 
      z: 0,
      transition: { 
        duration: 0.8, 
        ease: "backOut",
        staggerChildren: 0.15 
      }
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/dashboard");
    } catch (error) {
      alert("Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.pageWrapper}>
      {/* Background Floating Decorations */}
      <motion.div 
        animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0], x: [0, 50, 0] }}
        transition={{ duration: 15, repeat: Infinity }}
        style={styles.blob1} 
      />
      <motion.div 
        animate={{ scale: [1, 1.3, 1], rotate: [0, -90, 0], x: [0, -70, 0] }}
        transition={{ duration: 12, repeat: Infinity }}
        style={styles.blob2} 
      />

      <div style={{ perspective: "1200px", zIndex: 10 }}>
        {/* 2. Apply variants to the motion.div */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          style={styles.loginCard}
        >
          {/* Header Section */}
          <div style={styles.headerSection}>
            <motion.div 
              initial={{ rotate: -180, scale: 0 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ type: "spring", stiffness: 200, delay: 0.5 }}
              style={styles.logoIcon}
            >
              🔑
            </motion.div>
            <motion.h2 variants={itemVariants} style={styles.title}>Welcome Back</motion.h2>
            <motion.p variants={itemVariants} style={styles.subtitle}>Enter your credentials to access your dashboard</motion.p>
          </div>

          <form onSubmit={handleLogin} style={styles.form}>
            <motion.div variants={itemVariants} style={styles.inputGroup}>
              <label style={styles.label}>Email Address</label>
              <input
                type="email"
                placeholder="name@company.com"
                required
                onChange={(e) => setEmail(e.target.value)}
                style={styles.input}
              />
            </motion.div>

            <motion.div variants={itemVariants} style={styles.inputGroup}>
              <label style={styles.label}>Password</label>
              <input
                type="password"
                placeholder="••••••••"
                required
                onChange={(e) => setPassword(e.target.value)}
                style={styles.input}
              />
            </motion.div>

            <motion.button 
              variants={itemVariants}
              whileHover={{ scale: 1.03, boxShadow: "0px 10px 30px rgba(59, 130, 246, 0.5)" }}
              whileTap={{ scale: 0.97 }}
              type="submit" 
              disabled={loading} 
              style={styles.loginButton}
            >
              {loading ? "Verifying..." : "Sign In"}
            </motion.button>
          </form>

          <motion.div variants={itemVariants} style={styles.signupContainer}>
            <p style={styles.signupText}>
              Don't have an account?{" "}
              <span onClick={() => navigate("/register")} style={styles.signupLink}>Sign Up</span>
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

// --- STYLES ---
const styles: Record<string, React.CSSProperties> = {
  pageWrapper: {
    height: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#0f172a",
    fontFamily: "'Inter', sans-serif",
    overflow: "hidden",
    position: "relative",
  },
  blob1: {
    position: "absolute",
    top: "10%",
    left: "15%",
    width: "300px",
    height: "300px",
    background: "linear-gradient(to right, #3b82f6, #2dd4bf)",
    filter: "blur(80px)",
    borderRadius: "50%",
    opacity: 0.4,
  },
  blob2: {
    position: "absolute",
    bottom: "10%",
    right: "15%",
    width: "350px",
    height: "350px",
    background: "linear-gradient(to right, #8b5cf6, #ec4899)",
    filter: "blur(80px)",
    borderRadius: "50%",
    opacity: 0.3,
  },
  loginCard: {
    backgroundColor: "rgba(255, 255, 255, 0.98)",
    padding: "45px",
    borderRadius: "35px",
    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.7)",
    width: "100%",
    maxWidth: "420px",
    textAlign: "center",
    backdropFilter: "blur(10px)",
    border: "1px solid rgba(255, 255, 255, 0.2)",
    transformStyle: "preserve-3d", // Important for 3D rotation
  },
  headerSection: { marginBottom: "30px" },
  logoIcon: { fontSize: "50px", marginBottom: "10px" },
  title: { fontSize: "28px", fontWeight: 900, color: "#0f172a", margin: 0 },
  subtitle: { color: "#64748b", fontSize: "14px", marginTop: "8px" },
  form: { display: "flex", flexDirection: "column", gap: "20px", textAlign: "left" },
  inputGroup: { display: "flex", flexDirection: "column", gap: "6px" },
  label: { fontSize: "13px", fontWeight: 600, color: "#475569", marginLeft: "4px" },
  input: {
    padding: "14px",
    borderRadius: "15px",
    border: "2px solid #f1f5f9",
    fontSize: "15px",
    outline: "none",
    backgroundColor: "#f8fafc",
  },
  loginButton: {
    marginTop: "10px",
    backgroundColor: "#3b82f6",
    color: "white",
    padding: "16px",
    borderRadius: "15px",
    border: "none",
    fontSize: "16px",
    fontWeight: 800,
    cursor: "pointer",
  },
  signupContainer: { marginTop: "25px" },
  signupText: { fontSize: "14px", color: "#64748b" },
  signupLink: { color: "#3b82f6", fontWeight: 800, cursor: "pointer", marginLeft: "5px" },
};

export default Login;
