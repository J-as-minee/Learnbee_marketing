export default function BlogLayout({ children, sidebar = null }) {
  if (!sidebar) {
    return (
      <article className="mx-auto max-w-4xl px-6 py-12">
        <div className="prose prose-lg prose-slate blog-reading-prose mx-auto">
          {children}
        </div>
      </article>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(280px,320px)] lg:items-start lg:gap-12">
        <article className="min-w-0 max-w-4xl lg:max-w-none">
          <div className="prose prose-lg prose-slate blog-reading-prose max-w-none">
            {children}
          </div>
        </article>
        <aside className="min-w-0 lg:sticky lg:top-24 lg:self-start">{sidebar}</aside>
      </div>
    </div>
  );
}