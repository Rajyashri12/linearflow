import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../config/firebase";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { motion, Variants } from "framer-motion";
import { useAuth } from "../../context/AuthContext"; // ✅ ADD

const Login = () => {
  const navigate = useNavigate();
  const { user } = useAuth(); // ✅ ADD
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const containerVariants: Variants = {
    hidden: { opacity: 0, scale: 0.5, rotateY: 45, z: -200 },
    visible: {
      opacity: 1,
      scale: 1,
      rotateY: 0,
      z: 0,
      transition: { duration: 0.8, ease: "backOut", staggerChildren: 0.15 },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 },
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // ❌ DO NOT navigate here
    } catch {
      alert("Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Navigate ONLY after Firebase auth state updates
  useEffect(() => {
    if (user) {
      navigate("/dashboard", { replace: true });
    }
  }, [user, navigate]);

  return (
    <div style={styles.pageWrapper}>
      {/* UI & animations unchanged */}
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
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          style={styles.loginCard}
        >
          <div style={styles.headerSection}>
            <motion.div
              initial={{ rotate: -180, scale: 0 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ type: "spring", stiffness: 200, delay: 0.5 }}
              style={styles.logoIcon}
            >
              🔑
            </motion.div>
            <motion.h2 variants={itemVariants} style={styles.title}>
              Welcome Back
            </motion.h2>
            <motion.p variants={itemVariants} style={styles.subtitle}>
              Enter your credentials to access your dashboard
            </motion.p>
          </div>

          <form onSubmit={handleLogin} style={styles.form}>
            <motion.div variants={itemVariants} style={styles.inputGroup}>
              <label style={styles.label}>Email Address</label>
              <input
                type="email"
                required
                onChange={(e) => setEmail(e.target.value)}
                style={styles.input}
              />
            </motion.div>

            <motion.div variants={itemVariants} style={styles.inputGroup}>
              <label style={styles.label}>Password</label>
              <input
                type="password"
                required
                onChange={(e) => setPassword(e.target.value)}
                style={styles.input}
              />
            </motion.div>

            <motion.button
              variants={itemVariants}
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
              <span
                onClick={() => navigate("/register")}
                style={styles.signupLink}
              >
                Sign Up
              </span>
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
