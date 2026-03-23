import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./SignUp.css";
import { registerUser } from "../hooks/useAuth";


export default function SignUp() {
  const [active, setActive] = useState("signup"); 
  const [fullname, setFullname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("attend");
  const navigate = useNavigate();

  async function handleSubmit(e) {
  e.preventDefault();
  try {
    if (!fullname || !email || !password) {
      alert("Please fill all fields");
      return;
    }

    await registerUser({
      name: fullname,
      email,
      password,
      role,
    });

    alert("Account created successfully");
    navigate("/");
  } catch (err) {
    console.error(err);
    const msg =
      err.response?.data?.message || "Failed to sign up. Please try again.";
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
          <Link to="/auth" className="auth-toggle-btn">Sign In</Link>
          <button className="auth-toggle-btn active" style={{ color: "#fff" }}>Sign Up</button>
        </div>
        <form className="auth-form" onSubmit={handleSubmit}>
          <label>Full Name</label>
          <div className="auth-input-row">
            <span className="auth-icon">👤</span>
            <input
              type="text"
              required
              placeholder="John Doe"
              value={fullname}
              onChange={e => setFullname(e.target.value)}
            />
          </div>
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
          <div style={{ margin: "12px 0 3px 0", fontWeight: 600 }}>I want to:</div>
          <div className="auth-role-toggle">
            <button
              type="button"
              className={`role-btn${role === "attend" ? " active" : ""}`}
              onClick={() => setRole("attend")}
            >
              <span role="img" aria-label="headphones">🎧</span> Attend Events
            </button>
            <button
              type="button"
              className={`role-btn${role === "host" ? " active" : ""}`}
              onClick={() => setRole("host")}
            >
              <span role="img" aria-label="microphone">🎤</span> Host Events
            </button>
          </div>
          <button className="auth-main-btn highlight-btn" type="submit">
            Create Account
          </button>
        </form>
      </main>
    </div>
  );
}
