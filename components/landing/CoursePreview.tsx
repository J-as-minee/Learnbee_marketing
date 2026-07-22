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
          <iframe
            src="https://dev.learnbee.ai/play/57ACX5?embed=true"
            width="900"
            height="560"
            allowFullScreen
            style={{ borderRadius: 12, border: "none" }}
            title="Learnbee — a course about Learnbee"
          />
        </div>
      </div>
    </section>
  );
}
