export default function CoursePreview() {
  return (
    <section className="demo-section">
      <div className="container">
        <span className="section-label reveal">LEARNBEE EXPLAINED</span>
        <h2 className="reveal reveal-d1 headline-nowrap">
          A Learnbee course, about Learnbee.
        </h2>
        <p className="section-sub reveal reveal-d2">
          The quickest way to feel what you&apos;re about to build — click through it just like your
          learners would.
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
              src="https://creator.learnbee.ai/play/R3VGRZ?embed=true"
              allowFullScreen
              style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                border: "none",
                borderRadius: 12,
              }}
              title="Learnbee — a course about Learnbee"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
