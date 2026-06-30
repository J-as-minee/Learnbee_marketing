const SIGN_IN = "https://creator.learnbee.ai/sign-in";

export default function CtaSection() {
  return (
    <section className="cta-band">
      <div className="cta-grid" aria-hidden="true"></div>
      <div className="container cta-band-inner">
        <div className="cta-text reveal">
          <span className="section-label on-dark">GET STARTED</span>
          <h2>Ready to make training your team will actually finish?</h2>
          <p>Start from a document, a topic, or a blank page — your first course can be live today.</p>
        </div>
        <div className="cta-actions reveal reveal-d2">
          <a href={SIGN_IN} className="btn btn-white btn-lg">Get Started for Free</a>
          <a href="#philosophy" className="btn btn-outline-light btn-lg">See How It Works</a>
        </div>
      </div>
    </section>
  );
}
