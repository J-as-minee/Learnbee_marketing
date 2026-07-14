export function getBlogPreviewToken() {
  return process.env.BLOG_PREVIEW_TOKEN || "";
}

export function isValidPreviewToken(token) {
  const expected = getBlogPreviewToken();
  if (!expected) return false;
  return token === expected;
}
