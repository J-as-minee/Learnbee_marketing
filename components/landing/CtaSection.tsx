import WaveCta from "./WaveCta";

/* Homepage closing call to action — the shared wave card. */
export default function CtaSection() {
  return (
    <WaveCta
      id="cta-title"
      title="Create your first course with Learnbee"
      actions={
        <>
          {/* data-open-create: HomeQuickCreate opens the inline builder in place.
              The href is /#create, never /create, so a cmd-click or a click
              before hydration still lands on the homepage builder. */}
          <a href="/#create" data-open-create className="cp-cta">Create for free</a>
          <a href="#features" className="cp-cta cp-cta--ghost">See how it works</a>
        </>
      }
    >
      Start with a document, a topic, or a blank page. Turn your ideas and existing content into an
      engaging course in minutes.
    </WaveCta>
  );
}
