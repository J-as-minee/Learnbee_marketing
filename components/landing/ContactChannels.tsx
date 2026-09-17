"use client";

import QRCode from "react-qr-code";
import { ArrowRight, ArrowUpRight, Mail, MapPin, Phone, Send } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import "@/app/contact-channels.css";

const EMAIL = "admin@learnbee.ai";
const WHATSAPP_NUMBER = "+91 79960 09099";
const WHATSAPP_URL = "https://wa.me/917996009099";

/* The office people actually visit, and what the map points at. */
const OPERATING_ADDRESS =
  "MOSS, Diamond District, 150, HAL Old Airport Road, ISRO Colony, Domlur, Bengaluru, Karnataka 560008, India";
const MAPS_URL = "https://maps.app.goo.gl/x1RnqQcwLYwK48u3A";
const REGISTERED_ADDRESS =
  "783, Ranka Heights, Patel Rama Reddy Layout, Domlur, Bangalore, Karnataka 560071, India";
/* Google's documented address-search URL — there is no place link for this one. */
const REGISTERED_MAPS_URL = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
  REGISTERED_ADDRESS
)}`;

/* The three ways to reach us, as a row of cards below the contact form. The
   address card carries the legal name and both addresses, which the payment
   gateway's website checklist asks to see on the Contact page itself. */
export default function ContactChannels() {
  return (
    <section className="cc" aria-labelledby="cc-title">
      <div className="cc-inner">
        <span className="cc-eyebrow">Reach us directly</span>
        <h2 className="cc-title" id="cc-title">Multiple ways to connect.</h2>
        <p className="cc-sub">
          Choose the channel that works best for you — we&apos;re available across all of them.
        </p>

        <div className="cc-grid">
          {/* WhatsApp */}
          <div className="cc-card cc-card--wa">
            <div className="cc-head">
              <span className="cc-tile cc-tile--wa" aria-hidden="true">
                <Phone size={21} strokeWidth={2.1} />
              </span>
              <h3 className="cc-card-title">Chat with us</h3>
            </div>
            <div className="cc-wa">
              <div className="cc-wa-text">
                <p className="cc-wa-label">
                  <FaWhatsapp size={15} aria-hidden="true" /> WhatsApp
                </p>
                <p className="cc-wa-num">{WHATSAPP_NUMBER}</p>
              </div>
              <span
                className="cc-qr"
                role="img"
                aria-label="QR code that opens a WhatsApp chat with Learnbee"
              >
                <QRCode value={WHATSAPP_URL} size={66} fgColor="#181426" bgColor="#ffffff" level="M" />
              </span>
            </div>
            <a
              className="cc-btn"
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
            >
              Chat with us <ArrowRight size={16} aria-hidden="true" />
            </a>
          </div>

          {/* Email */}
          <div className="cc-card cc-card--mail">
            <div className="cc-head">
              <span className="cc-tile cc-tile--mail" aria-hidden="true">
                <Send size={20} strokeWidth={2.1} />
              </span>
              <h3 className="cc-card-title">Email us</h3>
            </div>
            <p className="cc-card-body">
              Questions about features or onboarding — we usually reply within a few hours.
            </p>
            <a className="cc-link" href={`mailto:${EMAIL}`}>
              <Mail size={16} aria-hidden="true" /> {EMAIL}
            </a>
            <a className="cc-btn" href={`mailto:${EMAIL}`}>
              Send an email <ArrowRight size={16} aria-hidden="true" />
            </a>
          </div>

          {/* Address — legal name and both addresses, linked out to Maps */}
          <div className="cc-card cc-card--place">
            <div className="cc-head">
              <span className="cc-tile cc-tile--place" aria-hidden="true">
                <MapPin size={21} strokeWidth={2.1} />
              </span>
              <h3 className="cc-card-title">Visit us</h3>
            </div>
            <p className="cc-card-name">Bsharp Sales Enablers Private Limited</p>

            <p className="cc-addr">
              <span className="cc-addr-label">Registered</span>
              <a href={REGISTERED_MAPS_URL} target="_blank" rel="noopener noreferrer">
                {REGISTERED_ADDRESS}
              </a>
            </p>
            <p className="cc-addr">
              <span className="cc-addr-label">Operating</span>
              <a href={MAPS_URL} target="_blank" rel="noopener noreferrer">
                {OPERATING_ADDRESS}
              </a>
            </p>

            <a className="cc-btn" href={MAPS_URL} target="_blank" rel="noopener noreferrer">
              Open in Google Maps <ArrowUpRight size={16} strokeWidth={2.2} aria-hidden="true" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
