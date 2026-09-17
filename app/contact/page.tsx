import type { Metadata } from "next";
import "../site.css";
import "../contact-section.css";
import SiteNav from "@/components/landing/SiteNav";
import SiteFooter from "@/components/landing/SiteFooter";
import ContactSection from "@/components/landing/ContactSection";
import ContactChannels from "@/components/landing/ContactChannels";
import ContactPartner from "@/components/landing/ContactPartner";

export const metadata: Metadata = {
  title: "Contact Us — Learnbee",
  description:
    "Get in touch with the Learnbee team by email, WhatsApp, or the contact form. We respond within one business day.",
  robots: { index: true, follow: true },
};

export default function ContactPage() {
  return (
    <>
      <SiteNav overlay />
      <main>
        <ContactSection />
        <ContactChannels />
        <ContactPartner />
      </main>
      <SiteFooter />
    </>
  );
}
