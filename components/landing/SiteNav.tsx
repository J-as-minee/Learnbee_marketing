"use client";

import { useState, useRef } from "react";

const SIGN_IN = "https://creator.learnbee.ai/sign-in";

export default function SiteNav() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [resourcesOpen, setResourcesOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const openResources = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setResourcesOpen(true);
  };
  const closeResources = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setResourcesOpen(false), 180);
  };

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
          <li
            className={`nav-item${resourcesOpen ? " open" : ""}`}
            onMouseEnter={openResources}
            onMouseLeave={closeResources}
          >
            <button
              className="nav-btn"
              aria-haspopup="true"
              aria-expanded={resourcesOpen}
              onClick={() => setResourcesOpen((v) => !v)}
            >
              Resources
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>
            <div className="dropdown">
              <a href="/blog" className="dropdown-item">Blog</a>
              <a href="/help" className="dropdown-item">Help</a>
            </div>
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
