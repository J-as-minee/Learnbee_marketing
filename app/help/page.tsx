import type { Metadata } from "next";
import "../site.css";
import "../help.css";
import SiteNav from "@/components/landing/SiteNav";
import SiteFooter from "@/components/landing/SiteFooter";
import HelpChat from "@/components/landing/HelpChat";
import HelpWiki from "@/components/landing/HelpWiki";
import HelpGuides from "@/components/landing/HelpGuides";
import WaveCta from "@/components/landing/WaveCta";

export const metadata: Metadata = {
  title: "Help Centre — Learnbee",
  description: "Answers to common questions about Learnbee, plus an AI assistant ready to help.",
};

export default function HelpPage() {
  return (
    <>
      <SiteNav overlay />

      {/* Hero */}
      <section className="help-hero">
        {/* Brand wave from the very top of the page — same asset as About and Contact */}
        <div className="help-wave" aria-hidden="true" />
        <div className="help-inner">
          <span className="section-label">Help Centre</span>
          <h1>
            Got a question?
            <br />
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
      <WaveCta id="help-still-title" title="Still need help?">
        Our team usually replies within a few hours. Email us at{" "}
        <a href="mailto:admin@learnbee.ai">admin@learnbee.ai</a>.
      </WaveCta>

      <SiteFooter />
    </>
  );
}
