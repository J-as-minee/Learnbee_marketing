export default function CourseLibrary() {
  return (
    <section id="library" className="course-library">
      <div className="container">
        <span className="section-label reveal">Free Course Library — Edit and Upload in Your LMS</span>
        <h2 className="reveal reveal-d1">Don&apos;t start from scratch. Start from here.</h2>
        <p className="section-sub reveal reveal-d2">
          A growing collection of professionally authored courses; free to share as-is, or clone
          into the editor, customise for your team, and export to your LMS via SCORM.
        </p>

        <div className="lib-grid reveal reveal-d3">
          {/* First library — real content, links to the hosted library */}
          <a
            className="lib-card lib-card-link"
            href="https://dev.learnbee.ai/library/lib-1782897821266"
          >
            <div className="lib-thumb lib-thumb-img">
              <img src="/library-infosec.png" alt="Information Security Essentials" />
            </div>
            <div className="lib-card-body">
              <h3 className="lib-course-title">Information Security Essentials</h3>
              <p className="lib-curator">Curated by Learnbee</p>
              <p className="lib-desc">
                Information security goes beyond preventing cyberattacks—it&apos;s about protecting
                the confidentiality, integrity, and availability of organizational data. This
                library introduces employees to the policies, processes, and best practices required
                to securely manage information throughout its lifecycle while reducing business risk
                and maintaining compliance.
              </p>
              <div className="lib-meta">
                <span className="lib-tag">📖 2 courses</span>
                <span className="lib-tag">🕐 ~31 min total</span>
              </div>
            </div>
          </a>

          {/* Second library — Growth Mindset */}
          <a className="lib-card lib-card-link" href="https://dev.learnbee.ai/library/lib-1782971893663">
            <div className="lib-thumb lib-thumb-img">
              <img src="/library-infosec2.png" alt="Growth Mindset" />
            </div>
            <div className="lib-card-body">
              <h3 className="lib-course-title">Growth Mindset</h3>
              <p className="lib-curator">Curated by Learnbee</p>
              <p className="lib-desc">
                A curated collection of short courses to help you understand, recognise, and develop
                a growth mindset — at work and in everyday life.
              </p>
              <div className="lib-meta">
                <span className="lib-tag">📖 3 courses</span>
                <span className="lib-tag">🕐 ~1h 28m total</span>
              </div>
            </div>
          </a>

          {/* Third library — Diversity, Equity & Inclusion */}
          <a className="lib-card lib-card-link" href="https://dev.learnbee.ai/library/lib-1782896538865">
            <div className="lib-thumb lib-thumb-img">
              <img src="/library-infosec3.png" alt="Diversity, Equity & Inclusion" />
            </div>
            <div className="lib-card-body">
              <h3 className="lib-course-title">Diversity, Equity &amp; Inclusion</h3>
              <p className="lib-curator">Curated by Learnbee</p>
              <p className="lib-desc">
                Creating an inclusive workplace helps employees feel respected, valued, and empowered
                to contribute their best work. This library provides a collection of courses that
                explore diversity, equity, inclusion, belonging, cultural awareness, unconscious
                bias, and inclusive leadership.
              </p>
              <div className="lib-meta">
                <span className="lib-tag">📖 3 courses</span>
                <span className="lib-tag">🕐 ~1h 4m total</span>
              </div>
            </div>
          </a>
        </div>
        <p className="lib-note reveal">Curated courses coming soon</p>
      </div>
    </section>
  );
}
