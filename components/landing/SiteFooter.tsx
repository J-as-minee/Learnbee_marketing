export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="container footer-inner">
        <div className="footer-brand">
          <a href="/" className="logo footer-logo">
            <img src="/logo.png" alt="Learnbee" className="logo-img logo-img-footer" />
          </a>
          <p className="footer-mission">
            We believe training people actually finish is training that actually works.
          </p>
        </div>
        <div className="footer-col">
          <strong>Platform</strong>
          <a href="/#philosophy">How It Works</a>
          <a href="/#features">Platform Features</a>
          <a href="/#value">Why Learnbee</a>
          <a href="/#faq">FAQs</a>
        </div>
        <div className="footer-col">
          <strong>Features</strong>
          <a href="/#features">AI Course Wizard</a>
          <a href="/#features">AI Narration</a>
          <a href="/#features">Slide Formats</a>
          <a href="/#features">SCORM Export</a>
          <a href="/#features">Publish &amp; Share</a>
        </div>
        <div className="footer-col">
          <strong>Company</strong>
          <a href="/help">Help Centre</a>
          <a href="/privacy">Privacy Policy</a>
          <a href="/terms">Terms &amp; Conditions</a>
        </div>
      </div>
      <div className="footer-bottom container">
        <span>&copy; 2026 Learnbee. All rights reserved.</span>
      </div>
    </footer>
  );
}
