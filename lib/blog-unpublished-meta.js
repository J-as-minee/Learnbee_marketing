import matter from "gray-matter";

/** Admin-only flag: post lives in staging but was previously on the live site. */
export function isUnpublishedFromLiveMeta(data) {
  if (!data || typeof data !== "object") return false;
  const v = data.unpublished_from_live;
  return v === true || v === "true";
}

export function stripUnpublishedFromLiveFlag(rawMarkdown) {
  try {
    const { data, content } = matter(rawMarkdown);
    if (!isUnpublishedFromLiveMeta(data)) return rawMarkdown;
    delete data.unpublished_from_live;
    return matter.stringify(content, data);
  } catch {
    return rawMarkdown;
  }
}

export function addUnpublishedFromLiveFlag(rawMarkdown) {
  try {
    const { data, content } = matter(rawMarkdown);
    data.unpublished_from_live = true;
    return matter.stringify(content, data);
  } catch {
    return rawMarkdown;
  }
}
