// Marketing route group — the bespoke landing-page stylesheet loads only here,
// so the legal pages (/privacy, /terms) stay isolated with their own styles.
import "../site.css";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
