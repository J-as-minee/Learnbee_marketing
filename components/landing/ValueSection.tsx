import { valueCards, valSvg, valCheck } from "./data";

export default function ValueSection() {
  return (
    <section id="value" className="value-section">
      <div className="container">
        <div className="value-header">
          <span className="section-label on-dark reveal">WHAT THIS MEANS FOR YOU</span>
          <h2 className="value-headline reveal reveal-d1">
            Less time building. More training that works.
          </h2>
          <p className="value-subhead reveal reveal-d2">
            Why teams switch, and the capabilities that make it happen.
          </p>
        </div>
        <div className="value-grid" id="value-grid">
          {valueCards.map((c, i) => (
            <div
              key={i}
              className="value-card reveal"
              data-val={i}
              style={{ transitionDelay: `${i * 0.1}s` }}
            >
              <div className="value-card-inner">
                <div className="value-card-front">
                  <div className="value-card-top">
                    <span
                      className="value-card-icon"
                      dangerouslySetInnerHTML={{ __html: valSvg(c.icon, 18) }}
                    />
                    <span className="value-card-flip-hint">hover to flip</span>
                  </div>
                  <div className="value-card-title">{c.title}</div>
                  <div className="value-card-desc">{c.desc}</div>
                  <div className="value-card-tag-row">
                    {c.tags.map((t, j) => (
                      <span key={j} className="value-tag-pill">{t}</span>
                    ))}
                  </div>
                </div>
                <div className="value-card-back">
                  <div className="value-back-title">{c.title}</div>
                  <div className="value-card-detail-inner">
                    {c.details.map((d, j) => (
                      <div key={j} className="value-detail-row">
                        <span
                          className="value-detail-icon"
                          dangerouslySetInnerHTML={{ __html: valSvg(valCheck, 13) }}
                        />
                        <span>{d}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
