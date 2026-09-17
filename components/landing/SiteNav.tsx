"use client";

import { useState, useRef } from "react";

const SIGN_IN = "https://creator.learnbee.ai/sign-in";

/* `overlay`: the header is fixed over the top of the page — solid white, staying put
   while scrolling — so a hero image can start at the very top edge behind it. Other
   pages keep the normal sticky header.
   `ctaDark`: black demo button instead of the purple one (About).
   `showSignIn`: the Sign in link sits beside the CTA everywhere except About. */
export default function SiteNav({
  overlay = false,
  ctaDark = false,
  showSignIn = true,
}: {
  overlay?: boolean;
  ctaDark?: boolean;
  showSignIn?: boolean;
}) {
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
    <header className={`site-header${overlay ? " site-header--overlay" : ""}`}>
      <nav className="nav container">
        <a href="/" className="logo">
          <img src="/logo.png" alt="Learnbee" className="logo-img" />
        </a>

        <ul className={`nav-links${mobileOpen ? " open" : ""}`} id="nav-links">
          <li className="nav-item">
            <a href="/#features" className="nav-btn">Features</a>
          </li>
          <li className="nav-item">
            <a href="/about" className="nav-btn">About Us</a>
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
          {/* On phones "Sign in" is hidden from the bar, so it lives in the menu. */}
          {showSignIn && (
            <li className="nav-item nav-mobile-only">
              <a href={SIGN_IN} className="nav-btn">Sign in</a>
            </li>
          )}
        </ul>

        <div className="nav-actions">
          {showSignIn && <a href={SIGN_IN} className="nav-login">Sign in</a>}
          <a href="/contact" className={`btn ${ctaDark ? "btn-dark" : "btn-accent"} nav-cta`}>
            Get a demo
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </a>
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
