import type { Metadata } from "next";
import Image from "next/image";
import "../site.css";
import "../company.css";
import SiteNav from "@/components/landing/SiteNav";
import SiteFooter from "@/components/landing/SiteFooter";
import RevealObserver from "@/components/landing/RevealObserver";
import AboutValues from "@/components/landing/AboutValues";
import WaveCta from "@/components/landing/WaveCta";
import { IconArrowRight } from "@/components/landing/CompanyIcons";

export const metadata: Metadata = {
  title: "About Us — Learnbee",
  description:
    "Learnbee is an AI-assisted platform for authoring, narrating, translating, publishing and exporting training courses — a product of Bsharp Sales Enablers Private Limited, Bangalore, building since 2012.",
  robots: { index: true, follow: true },
};

const ADDRESS =
  "MOSS, Diamond District, 150, HAL Old Airport Road, ISRO Colony, Domlur, Bengaluru, Karnataka 560008, India";
const MAPS_URL = "https://maps.app.goo.gl/x1RnqQcwLYwK48u3A";

const TRUST = [
  "Enterprise-grade security and governance",
  "Responsible use of AI",
  "Customer ownership and privacy of data",
  "Clear boundaries on how AI is applied",
];

const THOUGHTFULNESS = [
  "Address the needs of all stakeholders — learners, L&D managers, and business leaders",
  "Continuously improve accessibility and usability",
  "Embed principles of learning science",
  "Apply AI thoughtfully to support learning",
];

export default function AboutPage() {
  return (
    <>
      <SiteNav overlay ctaDark showSignIn={false} />
      <main>
        {/* Hero — copy left, team photo right, brand wave from the very top */}
        <section className="ab-hero">
          <div className="co-lhero-wave" aria-hidden="true" />
          <div className="ab-hero-inner">
            <div className="ab-hero-copy">
              <span className="section-label reveal">By the team at Bsharp</span>
              <h1 className="reveal reveal-d1">
                Great training,
                <br />
                far easier to make.
              </h1>
              <p className="ab-hero-body reveal reveal-d2">
                Learnbee brings course creation into one place, combining AI with thoughtful design and
                interactive formats to help creators move from an idea to a finished learning experience
                faster.
              </p>
              <div className="ab-hero-actions reveal reveal-d3">
                <a href="/contact" className="btn btn-accent btn-lg co-btn-icon">
                  Request a demo <IconArrowRight size={18} />
                </a>
                <a href="/#create" className="btn btn-lg co-btn-outline">Try now</a>
              </div>
            </div>
            <div className="ab-hero-media reveal reveal-d2">
              <Image
                src="/AU_hero.webp"
                alt="The Bsharp team at the Bengaluru office"
                width={1920}
                height={1440}
                sizes="(max-width: 960px) 100vw, 52vw"
                priority
              />
            </div>
          </div>
        </section>

        {/* Core values — cards travel sideways while the section is pinned */}
        <AboutValues />

        {/* Built on Trust */}
        <section className="ab-split-section">
          <div className="ab-split">
            <div>
              <h2 className="reveal">Built on Trust.</h2>
              <p className="ab-split-sub reveal reveal-d1">Our solutions are built with trust at the core.</p>
              <ul className="ab-bullets reveal reveal-d2" style={{ ["--dot" as string]: "#9333ea" }}>
                {TRUST.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </div>
            <div className="ab-split-media reveal reveal-d1">
              <Image
                src="/Team_1.webp"
                alt="Bsharp team at a company offsite"
                width={1633}
                height={1294}
                sizes="(max-width: 960px) 100vw, 46vw"
              />
            </div>
          </div>
        </section>

        {/* Guided by Thoughtfulness — photo on the left this time */}
        <section className="ab-split-section">
          <div className="ab-split media-left">
            <div>
              <h2 className="reveal">Guided by Thoughtfulness.</h2>
              <p className="ab-split-sub reveal reveal-d1">Our solutions are designed with care and intent.</p>
              <ul className="ab-bullets reveal reveal-d2" style={{ ["--dot" as string]: "#0f9b76" }}>
                {THOUGHTFULNESS.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </div>
            <div className="ab-split-media ab-media-match reveal reveal-d1">
              <Image
                src="/Team_2.webp"
                alt="Bsharp team outdoors at a team day"
                width={1534}
                height={2048}
                sizes="(max-width: 960px) 100vw, 46vw"
              />
            </div>
          </div>
        </section>

        {/* The company behind Learnbee, with its registration details */}
        <section className="ab-company">
          <div className="ab-company-inner">
            <span className="section-label reveal">A Bsharp product</span>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/bsharp-logo.webp"
              alt="Bsharp"
              width={256}
              height={67}
              className="ab-company-logo reveal reveal-d1"
            />
            <h2 className="reveal reveal-d1">Bsharp Sales Enablers Private Limited</h2>
            <p className="ab-company-body reveal reveal-d2">
              Building for frontline teams since 2012.
            </p>
            <p className="ab-company-desc reveal reveal-d2">
              Learnbee is built by Bsharp, a technology company focused on creating digital solutions
              for frontline teams and the organizations that support them.
            </p>
            <a
              href="https://www.bsharpcorp.com"
              target="_blank"
              rel="noopener noreferrer"
              className="co-visit ab-company-explore reveal reveal-d2"
            >
              Explore Bsharp <IconArrowRight size={18} />
            </a>

            <div className="ab-company-split reveal reveal-d2">
              <dl className="ab-info-card">
                <dt>Operating address</dt>
                <dd>{ADDRESS}</dd>
                <dt>Website</dt>
                <dd>
                  <a href="https://www.bsharpcorp.com" target="_blank" rel="noopener noreferrer">
                    www.bsharpcorp.com
                  </a>
                </dd>
              </dl>
              <div className="ab-map-card">
                {/* Overlay rather than Google's own "View larger map", so the pin
                    opens the same place link the address used to carry. */}
                <a
                  href={MAPS_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ab-map-open"
                >
                  View on Maps <IconArrowRight size={15} />
                </a>
                <iframe
                  src={`https://www.google.com/maps?q=${encodeURIComponent(ADDRESS)}&output=embed`}
                  title="Bsharp office location"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            </div>
          </div>
        </section>

        <hr className="ab-divider" />

        {/* Closing call to action — the same wave card as the homepage and contact page */}
        <WaveCta
          id="about-cta-title"
          title="Ready to see Learnbee in action?"
          actions={
            <>
              <a href="/contact" className="cp-cta">
                Talk to our team <IconArrowRight size={17} />
              </a>
              <a href="/#create" className="cp-cta cp-cta--ghost">Try Learnbee</a>
            </>
          }
        >
          Book a free demo with our team or jump in and experience the platform for yourself.
        </WaveCta>
      </main>
      <SiteFooter />
      <RevealObserver />
    </>
  );
}
