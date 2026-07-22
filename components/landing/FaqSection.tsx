import { faqData } from "./data";

export default function FaqSection() {
  return (
    <section id="faq" className="faq-section">
      <div className="container faq-inner">
        <div className="faq-left">
          <span className="section-label">FAQS</span>
          <h2 className="faq-headline">You&apos;ve likely got a few questions</h2>
        </div>
        <div className="faq-list" id="faq-list">
          {faqData.map((item, i) => (
            <div className="faq-item" data-faq={i} key={i} tabIndex={0}>
              <div className="faq-q">
                <span>{item.q}</span>
                <span className="faq-arrow">→</span>
              </div>
              <div className="faq-a">{item.a}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
