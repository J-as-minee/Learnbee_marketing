import Link from "next/link";
import Image from "next/image";

function formatDate(date) {
  if (!date) return "";
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return date;
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function BlogCard({ post }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group block overflow-hidden rounded-2xl border border-slate-200 bg-white transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="relative aspect-[16/9] w-full bg-slate-100">
        {post.thumbnailImage ? (
          <Image
            src={post.thumbnailImage}
            alt={
              (post.thumbnailAlt && String(post.thumbnailAlt).trim()) ||
              post.title
            }
            fill
            unoptimized
            className="object-cover"
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-violet-100 via-indigo-100 to-slate-100" />
        )}
      </div>

      <div className="p-5">
        {post.date ? (
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-violet-700">
            {formatDate(post.date)} {post.readingTime ? `• ${post.readingTime} min read` : ""}
          </p>
        ) : null}
        <h2 className="mb-2 text-xl font-semibold leading-snug text-slate-900 transition group-hover:text-violet-700">
          {post.title}
        </h2>
        <p className="line-clamp-3 text-sm leading-relaxed text-slate-600">
          {post.description || "Read the full article."}
        </p>
      </div>
    </Link>
  );
}

