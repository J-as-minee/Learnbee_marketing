/**
 * Blog admin uses BLOG_ADMIN_PASSWORD (server-only).
 * Trim values so Vercel/UI copy-paste whitespace doesn't break login.
 */
export function getBlogAdminPassword() {
  return String(process.env.BLOG_ADMIN_PASSWORD ?? "").trim();
}

export function isBlogAdminConfigured() {
  return getBlogAdminPassword().length > 0;
}

export function verifyBlogAdminPassword(input) {
  const expected = getBlogAdminPassword();
  if (!expected) return false;
  return String(input ?? "").trim() === expected;
}

export function verifyBlogAdminRequest(request) {
  const header = request.headers.get("x-admin-password");
  return verifyBlogAdminPassword(header);
}
