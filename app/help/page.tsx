import type { Metadata } from "next";
import "../site.css";
import "../help.css";
import SiteNav from "@/components/landing/SiteNav";
import SiteFooter from "@/components/landing/SiteFooter";

export const metadata: Metadata = {
  title: "Help Centre — Learnbee",
  description: "Need a hand with Learnbee? Our team is here to help.",
};

export default function HelpPage() {
  return (
    <>
      <SiteNav />
      <section className="help-hero">
        <div className="help-grid" aria-hidden="true" />
        <div className="help-glow" aria-hidden="true" />
        <div className="help-inner">
          <span className="help-eyebrow">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M13 2L4.5 13.5H11l-1 8.5L19.5 10H13l0-8z" />
            </svg>
            We&apos;re here to help
          </span>
          <h1>
            Welcome to the <span className="accent">Help Centre</span>
          </h1>
          <p className="help-body">
            Whether you&apos;re exploring Learnbee for the first time or deep into building your
            courses, our team is ready to help. Run into a problem or have a question? Email us at{" "}
            <a href="mailto:gopal@bsharpcorp.com">gopal@bsharpcorp.com</a> and we&apos;ll get you
            sorted.
          </p>
        </div>
      </section>
      <SiteFooter />
    </>
  );
}
