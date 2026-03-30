import React from "react";
import { Link, useLocation } from "react-router-dom";

export default function Navigation() {
  const { pathname } = useLocation();
  return (
    <nav className="landing-navbar">
      <div className="landing-navbar-logo">
        
        <span className="landing-navbar-title">PartyVerse</span>
      </div>
      <div className="landing-navbar-links">
        <Link to="/" className={pathname === "/partyverse" ? "active-link" : ""}>Home</Link>
        <Link to="/events" className={pathname === "/events" ? "active-link" : ""}>Events</Link>
        <Link to="/venues" className={pathname === "/venues" ? "active-link" : ""}>Venues</Link>
      </div>
      <div className="landing-navbar-auth">
        <Link to="/auth" className="signin-link">Sign In</Link>
        <Link to="/auth/register" className="getstarted-link">Get Started</Link>
      </div>
     
    </nav>
  );
}
