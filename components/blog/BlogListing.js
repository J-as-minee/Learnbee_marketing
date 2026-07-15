"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import BlogCard from "@/components/blog/BlogCard";

// Learnbee is single-product, so the product filter collapses to "All" only
// (the chip row is hidden below when there's just one filter).
const FILTERS = [{ value: "all", label: "All" }];

function normalizeProduct() {
  return "all";
}

/**
 * Client-side filter + search over the statically-shipped post list.
 * URL query params (?product=, ?q=) are the source of truth so filtered
 * views are shareable; the default state (All, no search) keeps the URL clean.
 */
export default function BlogListing({ posts }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const product = normalizeProduct(searchParams.get("product"));
  const q = searchParams.get("q") || "";

  // Local input state drives instant filtering; the URL is updated debounced.
  const [searchInput, setSearchInput] = useState(q);

  // Re-sync the input when the URL changes externally (back/forward, shared link).
  useEffect(() => {
    setSearchInput(q);
  }, [q]);

  const buildHref = (nextProduct, nextQ) => {
    const params = new URLSearchParams();
    if (nextProduct && nextProduct !== "all") params.set("product", nextProduct);
    const trimmed = (nextQ || "").trim();
    if (trimmed) params.set("q", trimmed);
    const qs = params.toString();
    return { href: qs ? `${pathname}?${qs}` : pathname, qs };
  };

  // Debounce search input → URL (300ms). Chip clicks update the URL immediately.
  useEffect(() => {
    const t = setTimeout(() => {
      const { href, qs } = buildHref(product, searchInput);
      if (qs !== searchParams.toString()) {
        router.replace(href, { scroll: false });
      }
    }, 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchInput, product]);

  const onSelectProduct = (value) => {
    router.replace(buildHref(value, searchInput).href, { scroll: false });
  };

  const needle = searchInput.trim().toLowerCase();
  const filtered = posts.filter((post) => {
    if (product !== "all" && post.product !== product) return false;
    if (needle) {
      const haystack = `${post.title || ""} ${post.description || ""}`.toLowerCase();
      if (!haystack.includes(needle)) return false;
    }
    return true;
  });

  return (
    <div>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {FILTERS.length > 1 ? (
        <div className="order-2 flex flex-wrap gap-2 sm:order-1">
          {FILTERS.map((f) => {
            const active = product === f.value;
            return (
              <button
                key={f.value}
                type="button"
                onClick={() => onSelectProduct(f.value)}
                aria-pressed={active}
                className={`rounded-full border px-4 py-1.5 text-sm font-medium transition ${
                  active
                    ? "border-slate-900 bg-slate-900 text-white"
                    : "border-slate-300 bg-white text-slate-700 hover:border-slate-400"
                }`}
              >
                {f.label}
              </button>
            );
          })}
        </div>
        ) : null}

        <div className="relative order-1 w-full sm:order-2 sm:w-72">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search blog posts..."
            aria-label="Search blog posts"
            className="w-full rounded-full border border-slate-300 bg-white py-2 pl-9 pr-4 text-sm outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
          />
        </div>
      </div>

      {posts.length === 0 ? (
        <p className="text-slate-600">No blog posts yet.</p>
      ) : filtered.length === 0 ? (
        <p className="text-slate-600">
          No posts match these filters. Try a different search or filter.
        </p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((post) => (
            <BlogCard key={post.slug} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}
