import { put } from "@vercel/blob";
import { NextResponse } from "next/server";
import { verifyBlogAdminRequest } from "@/lib/admin-auth";

export const runtime = "nodejs";

// Prefer the canonical BLOB_READ_WRITE_TOKEN, but also accept a prefixed name
// (Vercel Blob stores connected with an env-var prefix produce e.g.
// STORE_BLOB_READ_WRITE_TOKEN). Returns { token, source } or { token: null }.
function resolveBlobToken() {
  const direct = process.env.BLOB_READ_WRITE_TOKEN?.trim();
  if (direct) return { token: direct, source: "BLOB_READ_WRITE_TOKEN" };
  for (const [key, val] of Object.entries(process.env)) {
    if (/BLOB_READ_WRITE_TOKEN$/.test(key) && val?.trim()) {
      return { token: val.trim(), source: key };
    }
  }
  return { token: null, source: null };
}

/** Non-secret prefix of a Blob token: `vercel_blob_rw_<storeId>` (identifies the
 *  store) with the secret tail masked, safe to log. */
function tokenStoreHint(token) {
  if (!token) return "none";
  const parts = token.split("_"); // vercel_blob_rw_<storeId>_<secret...>
  const storeId = parts.slice(0, 4).join("_"); // through <storeId>
  return `${storeId}_…(masked, len=${token.length})`;
}

export async function POST(request) {
  if (!verifyBlogAdminRequest(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { token: blobToken, source } = resolveBlobToken();

  // Diagnostic: which env var provided the token, and WHICH STORE it belongs to.
  console.log(
    `[blog/upload] token source=${source ?? "none"} store=${tokenStoreHint(blobToken)} ` +
      `BLOB_STORE_ID=${process.env.BLOB_STORE_ID ?? "unset"}`,
  );

  if (!blobToken) {
    console.error("[blog/upload] No BLOB_READ_WRITE_TOKEN found in the environment.");
    return NextResponse.json(
      {
        error:
          "Image storage is not configured. Add a Vercel Blob store (Project → Storage → Blob) so BLOB_READ_WRITE_TOKEN is set for Production, then redeploy.",
      },
      { status: 503 },
    );
  }

  const formData = await request.formData();
  const file = formData.get("file");
  const slug = formData.get("slug");

  if (!file || !slug) {
    return NextResponse.json({ error: "Missing file or slug" }, { status: 400 });
  }

  const filename = file.name.replace(/[^a-zA-Z0-9._-]/g, "-").toLowerCase();
  const pathname = `blog/${slug}/images/${filename}`;

  try {
    const blob = await put(pathname, file, {
      access: "public",
      addRandomSuffix: false,
      token: blobToken,
    });

    console.log(`[blog/upload] OK ${pathname} -> ${blob.url}`);
    // Return the Blob URL directly - it's instantly available
    return NextResponse.json({
      path: blob.url,
      filename,
      via: "vercel-blob",
    });
  } catch (error) {
    // Full detail to the server log (visible in Vercel → the deployment → Runtime Logs).
    console.error(
      `[blog/upload] FAILED pathname=${pathname} tokenSource=${source} ` +
        `store=${tokenStoreHint(blobToken)} :: ${error?.name || "Error"}: ${error?.message || error}`,
    );
    return NextResponse.json(
      { error: error.message || "Upload failed" },
      { status: 500 },
    );
  }
}
