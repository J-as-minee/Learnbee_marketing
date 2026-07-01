const SIGN_IN = "https://creator.learnbee.ai/sign-in";

export default function CtaSection() {
  return (
    <section className="cta-band">
      <div className="cta-grid" aria-hidden="true"></div>
      <div className="container cta-band-inner">
        <div className="cta-text reveal">
          <h2>Get started with Learnbee</h2>
          <p>Start from a document, a topic, or a blank page. Your first course can be live today.</p>
        </div>
        <div className="cta-actions reveal reveal-d2">
          <a href={SIGN_IN} className="btn btn-white btn-lg">Get Started for Free</a>
          <a href="#philosophy" className="btn btn-outline-light btn-lg">See How It Works</a>
        </div>
      </div>
    </section>
  );
}
