import Link from "next/link";

/** Brand-colored product pill for the single post metadata area. */
const PRODUCT_TAG = {
  learnbee: { label: "Learnbee", bg: "#6F4EF6" },
};

/**
 * Small brand-colored pill linking to the filtered listing.
 * Renders nothing for an unknown/missing product (defensive — validation
 * should prevent this, but we never show "Unknown" or crash).
 */
export default function ProductTag({ product, className = "" }) {
  const meta = PRODUCT_TAG[product];
  if (!meta) return null;

  return (
    <Link
      href={`/blog?product=${product}`}
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold text-white no-underline transition hover:opacity-90 ${className}`}
      style={{ backgroundColor: meta.bg }}
    >
      {meta.label}
    </Link>
  );
}
