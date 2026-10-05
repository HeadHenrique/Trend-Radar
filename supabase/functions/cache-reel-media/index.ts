import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const BUCKET = "reel-media-cache";
const MAX_BYTES = 64 * 1024 * 1024;

const json = (body: Record<string, unknown>, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });

function safeKey(value: string) {
  return value.replace(/[^A-Za-z0-9._-]/g, "_").slice(0, 180);
}

function allowedSource(value: string) {
  try {
    const url = new URL(value);
    const host = url.hostname.toLowerCase();
    return url.protocol === "https:" &&
      (host === "cdninstagram.com" ||
        host.endsWith(".cdninstagram.com") ||
        host === "fbcdn.net" ||
        host.endsWith(".fbcdn.net"));
  } catch {
    return false;
  }
}

async function objectExists(
  supabase: ReturnType<typeof createClient>,
  path: string,
) {
  const parts = path.split("/");
  const filename = parts.pop();
  const folder = parts.join("/");
  if (!filename) return false;

  const { data, error } = await supabase.storage
    .from(BUCKET)
    .list(folder, { limit: 20, search: filename });

  if (error) return false;
  return (data ?? []).some((item) => item.name === filename);
}

Deno.serve(async (req: Request) => {
  if (req.method !== "POST") {
    return json({ ok: false, code: "method_not_allowed" }, 405);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !serviceRoleKey) {
    return json({ ok: false, code: "server_configuration" }, 500);
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  let payload: {
    postId?: string;
    instagramMediaId?: string;
    shortcode?: string;
    videoSourceUrl?: string | null;
  };

  try {
    payload = await req.json();
  } catch {
    return json({ ok: false, code: "invalid_json" }, 400);
  }

  const postId = typeof payload.postId === "string" ? payload.postId.trim() : "";
  const instagramMediaId =
    typeof payload.instagramMediaId === "string" ? payload.instagramMediaId.trim() : "";
  const shortcode =
    typeof payload.shortcode === "string" ? payload.shortcode.trim() : "";
  const videoSourceUrl =
    typeof payload.videoSourceUrl === "string" ? payload.videoSourceUrl.trim() : "";

  if (!postId && !instagramMediaId && !shortcode) {
    return json({ ok: false, code: "missing_post_identity" }, 400);
  }

  let postQuery = supabase
    .from("instagram_posts")
    .select(
      "id,instagram_media_id,instagram_shortcode,content_type,video_storage_path,video_cached_at",
    );

  if (postId) postQuery = postQuery.eq("id", postId);
  else if (instagramMediaId) postQuery = postQuery.eq("instagram_media_id", instagramMediaId);
  else postQuery = postQuery.eq("instagram_shortcode", shortcode);

  const { data: post, error: postError } = await postQuery.maybeSingle();

  if (postError || !post) {
    return json({ ok: false, code: "post_not_found" }, 200);
  }

  if (post.content_type !== "reel" && post.content_type !== "video") {
    return json({ ok: true, skipped: true, code: "not_video_content" }, 200);
  }

  if (post.video_storage_path) {
    const validExisting = await objectExists(supabase, post.video_storage_path);
    if (validExisting) {
      return json({
        ok: true,
        cached: true,
        storagePath: post.video_storage_path,
      });
    }
  }

  const identity = post.instagram_media_id || post.instagram_shortcode;
  if (!identity) {
    return json({ ok: false, code: "missing_stable_identity" }, 200);
  }

  const storagePath = `reels/${safeKey(String(identity))}.mp4`;

  if (await objectExists(supabase, storagePath)) {
    const cachedAt = post.video_cached_at || new Date().toISOString();

    await supabase
      .from("instagram_posts")
      .update({
        video_storage_path: storagePath,
        video_cached_at: cachedAt,
      })
      .eq("id", post.id);

    return json({ ok: true, cached: true, storagePath });
  }

  if (!videoSourceUrl) {
    return json({ ok: false, code: "missing_video_source" }, 200);
  }

  if (!allowedSource(videoSourceUrl)) {
    return json({ ok: false, code: "source_host_not_allowed" }, 200);
  }

  let response: Response;
  try {
    response = await fetch(videoSourceUrl, {
      method: "GET",
      redirect: "follow",
      signal: AbortSignal.timeout(30000),
    });
  } catch {
    return json({ ok: false, code: "source_fetch_failed" }, 200);
  }

  if (!response.ok) {
    return json({
      ok: false,
      code: "source_http_error",
      sourceStatus: response.status,
    });
  }

  const contentLengthHeader = response.headers.get("content-length");
  const contentLength = contentLengthHeader ? Number(contentLengthHeader) : null;

  if (
    contentLength !== null &&
    Number.isFinite(contentLength) &&
    contentLength > MAX_BYTES
  ) {
    return json({ ok: false, code: "source_too_large" }, 200);
  }

  const contentType = (response.headers.get("content-type") || "")
    .split(";")[0]
    .trim()
    .toLowerCase();

  if (
    contentType &&
    !contentType.startsWith("video/") &&
    contentType !== "application/octet-stream"
  ) {
    return json({ ok: false, code: "source_not_video" }, 200);
  }

  let bytes: Uint8Array;
  try {
    bytes = new Uint8Array(await response.arrayBuffer());
  } catch {
    return json({ ok: false, code: "source_read_failed" }, 200);
  }

  if (!bytes.byteLength || bytes.byteLength > MAX_BYTES) {
    return json({ ok: false, code: "source_invalid_size" }, 200);
  }

  const looksLikeMp4 =
    bytes.byteLength >= 12 &&
    String.fromCharCode(bytes[4], bytes[5], bytes[6], bytes[7]) === "ftyp";

  if (!looksLikeMp4) {
    return json({ ok: false, code: "source_invalid_mp4" }, 200);
  }

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(storagePath, bytes, {
      contentType: "video/mp4",
      cacheControl: "3600",
      upsert: false,
    });

  if (uploadError && !(await objectExists(supabase, storagePath))) {
    return json({ ok: false, code: "storage_upload_failed" }, 200);
  }

  const cachedAt = new Date().toISOString();
  const { error: updateError } = await supabase
    .from("instagram_posts")
    .update({
      video_storage_path: storagePath,
      video_cached_at: cachedAt,
    })
    .eq("id", post.id);

  if (updateError) {
    return json({ ok: false, code: "post_update_failed" }, 200);
  }

  return json({
    ok: true,
    cached: false,
    storagePath,
    cachedAt,
    sizeBytes: bytes.byteLength,
  });
});
