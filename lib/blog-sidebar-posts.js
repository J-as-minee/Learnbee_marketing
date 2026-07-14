const SIDEBAR_LIMIT = 4;

function minPost(p) {
  return {
    slug: p.slug,
    title: p.title,
    date: p.date,
    thumbnailImage: p.thumbnailImage || "",
    thumbnailAlt: p.thumbnailAlt || "",
  };
}

export function pickRecentSidebarPosts(currentSlug, sortedPosts, limit = SIDEBAR_LIMIT) {
  return sortedPosts
    .filter((p) => p.slug !== currentSlug)
    .slice(0, limit)
    .map(minPost);
}

export function pickRelatedSidebarPosts(
  currentSlug,
  currentPost,
  sortedPosts,
  limit = SIDEBAR_LIMIT,
) {
  const tagSet = new Set(currentPost?.tags || []);
  if (tagSet.size === 0) {
    return pickRecentSidebarPosts(currentSlug, sortedPosts, limit);
  }

  const scored = sortedPosts
    .filter((p) => p.slug !== currentSlug)
    .map((p) => ({
      post: p,
      score: (p.tags || []).filter((t) => tagSet.has(t)).length,
    }))
    .filter((x) => x.score > 0)
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      const ta = a.post.date ? new Date(a.post.date).getTime() : 0;
      const tb = b.post.date ? new Date(b.post.date).getTime() : 0;
      return tb - ta;
    })
    .map((x) => minPost(x.post));

  if (scored.length >= limit) return scored.slice(0, limit);

  const seen = new Set(scored.map((s) => s.slug));
  seen.add(currentSlug);
  const filler = sortedPosts
    .filter((p) => !seen.has(p.slug))
    .slice(0, limit - scored.length)
    .map(minPost);

  return [...scored, ...filler];
}

export function pickCustomSidebarPosts(customSlugs, sortedPosts, limit = SIDEBAR_LIMIT) {
  const bySlug = new Map(sortedPosts.map((p) => [p.slug, p]));
  return customSlugs
    .map((s) => bySlug.get(String(s).trim()))
    .filter(Boolean)
    .slice(0, limit)
    .map(minPost);
}

export function resolveSidebarPosts(settings, currentSlug, currentPost, sortedPosts) {
  const mode = settings?.sidePanel?.postListMode || "related";
  const customSlugs = settings?.sidePanel?.customSlugs || [];

  if (mode === "custom" && customSlugs.length > 0) {
    const picked = pickCustomSidebarPosts(customSlugs, sortedPosts);
    if (picked.length > 0) return picked;
  }

  if (mode === "recent") {
    return pickRecentSidebarPosts(currentSlug, sortedPosts);
  }

  if (mode === "related") {
    return pickRelatedSidebarPosts(currentSlug, currentPost, sortedPosts);
  }

  return pickRecentSidebarPosts(currentSlug, sortedPosts);
}
