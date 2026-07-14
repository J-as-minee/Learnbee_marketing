import type { Metadata } from "next";
import "../site.css";
import "../help.css";
import SiteNav from "@/components/landing/SiteNav";
import SiteFooter from "@/components/landing/SiteFooter";
import HelpChat from "@/components/landing/HelpChat";
import HelpHeroBg from "@/components/landing/HelpHeroBg";
import HelpWiki from "@/components/landing/HelpWiki";
import HelpGuides from "@/components/landing/HelpGuides";

export const metadata: Metadata = {
  title: "Help Centre — Learnbee",
  description: "Answers to common questions about Learnbee, plus an AI assistant ready to help.",
};

export default function HelpPage() {
  return (
    <>
      <SiteNav />

      {/* Hero */}
      <section className="help-hero">
        <HelpHeroBg />
        <div className="help-inner">
          <span className="section-label on-dark">Help Centre</span>
          <h1>
            Got a question?{" "}
            <span className="accent">We&apos;ve got answers.</span>
          </h1>
          <p className="help-body">
            Ask the AI assistant below or browse the help topics.
          </p>
          <div className="help-hero-chat">
            <HelpChat />
          </div>
        </div>
      </section>

      {/* Quick guides — task-based journeys for people who don't know what to search */}
      <HelpGuides />

      {/* Wiki — sticky sidebar + topic stack */}
      <HelpWiki />

      {/* Still stuck */}
      <section className="help-contact-band">
        <div className="container help-contact-inner">
          <div>
            <h3 className="help-contact-title">Still need help?</h3>
            <p className="help-contact-sub">
              Our team usually replies within a few hours. Email us at{" "}
              <a href="mailto:admin@learnbee.ai">admin@learnbee.ai</a>.
            </p>
          </div>
        </div>
      </section>

      <SiteFooter />
    </>
  );
}
