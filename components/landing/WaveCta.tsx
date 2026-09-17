import type { ReactNode } from "react";
import PartnerWave from "./PartnerWave";
import "@/app/wave-cta.css";

/* A closing call-to-action: heading, a line of copy and optional buttons, with
   the animated brand wave running full width beneath them. Shared by the
   homepage ("Get started with Learnbee"), the help centre ("Still need help?")
   and the contact page ("Looking to partner?"), so the three stay identical.

   There is no card. The copy sits on the page and the wave is a free band below
   it, which also means the wave can never land on the text however short the
   copy is — the reason the old `plain` variant existed.

   The class names keep their original cp- prefix because PartnerWave renders its
   layer as .cp-wave. */
export default function WaveCta({
  id,
  title,
  children,
  actions,
}: {
  /** Heading id, used for the section's aria-labelledby. Unique per page. */
  id: string;
  title: string;
  children: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <section className="cp" aria-labelledby={id}>
      <div className="cp-inner">
        <h2 className="cp-title" id={id}>{title}</h2>
        <p className="cp-body">{children}</p>
        {actions && <div className="cp-actions">{actions}</div>}
      </div>
      <div className="cp-band">
        <PartnerWave />
      </div>
    </section>
  );
}
