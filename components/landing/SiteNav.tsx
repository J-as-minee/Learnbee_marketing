"use client";

import { useState } from "react";

const SIGN_IN = "https://creator.learnbee.ai/sign-in";

export default function SiteNav() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="site-header">
      <nav className="nav container">
        <a href="/" className="logo">
          <img src="/logo.png" alt="Learnbee" className="logo-img" />
        </a>

        <ul className={`nav-links${mobileOpen ? " open" : ""}`} id="nav-links">
          <li className="nav-item">
            <a href="/#philosophy" className="nav-btn">About</a>
          </li>
          <li className="nav-item">
            <a href="/#features" className="nav-btn">Features</a>
          </li>
        </ul>

        <div className="nav-actions">
          <a href={SIGN_IN} className="nav-login">Log in</a>
          <a href={SIGN_IN} className="btn btn-accent">Get Started</a>
        </div>

        <button
          className="nav-toggle"
          id="nav-toggle"
          aria-label="Toggle menu"
          onClick={() => setMobileOpen((v) => !v)}
        >
          <span></span><span></span><span></span>
        </button>
      </nav>
    </header>
  );
}
