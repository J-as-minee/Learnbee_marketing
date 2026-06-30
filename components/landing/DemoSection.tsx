export default function DemoSection() {
  return (
    <section className="demo-section">
      <div className="container">
        <span className="section-label reveal">LIVE PREVIEW</span>
        <h2 className="reveal reveal-d1" style={{ whiteSpace: "nowrap", maxWidth: "none" }}>
          See what a Learnbee course feels like.
        </h2>
        <p className="section-sub reveal reveal-d2">
          This is a real course, running live. Click through the slides, listen to the narration,
          answer the quiz.
        </p>
        <div className="demo-frame-wrap reveal reveal-d3">
          <iframe
            src="https://dev.learnbee.ai/play/GXH26L?embed=true"
            width="900"
            height="560"
            allowFullScreen
            style={{ borderRadius: 12, border: "none" }}
            title="Learnbee course demo"
          />
        </div>
      </div>
    </section>
  );
}
