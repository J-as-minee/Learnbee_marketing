import WaveCta from "./WaveCta";

const EMAIL = "admin@learnbee.ai";

/* Closing panel on the contact page — the shared wave card. */
export default function ContactPartner() {
  return (
    <WaveCta
      id="cp-title"
      title="Looking to partner?"
      actions={<a className="cp-cta" href="#message">Request a demo</a>}
    >
      Got an interesting proposal? Looking for more ways to collaborate? Drop us a note at{" "}
      <a href={`mailto:${EMAIL}`}>{EMAIL}</a> with your proposal, and we&apos;ll make sure to get
      in touch.
    </WaveCta>
  );
}
