export default function DemoSection() {
  return (
    <section className="demo-section">
      <div className="container">
        <span className="section-label reveal">LIVE PREVIEW</span>
        <h2 className="reveal reveal-d1 headline-nowrap">
          See what a Learnbee course feels like.
        </h2>
        <p className="section-sub reveal reveal-d2">
          This is a real course, running live. Click through the slides, listen to the narration,
          answer the quiz.
        </p>
        <div className="demo-frame-wrap reveal reveal-d3">
          <div
            style={{
              position: "relative",
              width: "100%",
              maxWidth: 880,
              margin: "0 auto",
              aspectRatio: "16/9",
            }}
          >
            <iframe
              src="https://creator.learnbee.ai/play/9V3JD7?embed=true"
              allowFullScreen
              style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                border: "none",
                borderRadius: 12,
              }}
              title="Learnbee course demo"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
