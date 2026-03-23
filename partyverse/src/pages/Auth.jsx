import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Auth.css"; // See below for the CSS
import { loginUser } from "../hooks/useAuth";


export default function Auth() {
  const [mode, setMode] = useState("signin"); // "signin" or "signup"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  async function handleSubmit(e) {
  e.preventDefault();
  try {
    if (!email || !password) {
      alert("Please enter email and password");
      return;
    }

    // Only sign-in here (you already have a separate SignUp page)
    await loginUser({ email, password });
    alert("Signed in successfully");
    navigate("/");
  } catch (err) {
    console.error(err);
    const msg =
      err.response?.data?.message || "Failed to sign in. Please try again.";
    alert(msg);
  }
}


  return (
    <div className="auth-root">
      <div className="auth-back">
        <Link to="/" className="back-link">← Back to Home</Link>
      </div>
      <main className="auth-shell">
        <div className="auth-logo-box">
          
        </div>
        <h1 className="auth-title">
          Welcome to <span className="auth-title-highlight">PartyVerse</span>
        </h1>
        <div className="auth-desc">
          Sign in to your account or create a new one
        </div>
        <div className="auth-toggle-row">
          <button
            className={`auth-toggle-btn${mode === "signin" ? " active" : ""}`}
            onClick={() => setMode("signin")}
          >Sign In</button>
          
        </div>
        <form className="auth-form" onSubmit={handleSubmit}>
          <label>Email</label>
          <div className="auth-input-row">
            <span className="auth-icon">📧</span>
            <input
              type="email"
              required
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>
          <label>Password</label>
          <div className="auth-input-row">
            <span className="auth-icon">🔒</span>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </div>
          <button className="auth-main-btn" type="submit">
            {mode === "signin" ? "Sign In" : "Sign Up"}
          </button>
          <div className="auth-footer">
  Don't have an account? <Link to="/auth/register" className="signup-link">Sign Up</Link>
</div>
        </form>
        <div className="auth-terms">
          By continuing, you agree to our <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>
        </div>
      </main>
    </div>
  );
}
