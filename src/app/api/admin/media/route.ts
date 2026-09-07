import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi, apiError, parseBody } from "@/lib/api/helpers";

/**
 * GET /api/admin/media — list media for tenant.
 * POST /api/admin/media — save a media entry by URL.
 * DELETE /api/admin/media — delete a media row by id (?id=).
 */
export async function GET() {
  const auth = await requireAdminApi("write");
  if ("error" in auth) return auth.error;
  const { tenant, supabase } = auth;

  const { data, error } = await supabase
    .from("media")
    .select("*")
    .eq("tenant_id", tenant.id)
    .order("created_at", { ascending: false })
    .limit(200);

  if (error) return apiError("Failed to load media", 500);
  return NextResponse.json({ media: data ?? [] });
}

export async function POST(req: NextRequest) {
  const auth = await requireAdminApi("write");
  if ("error" in auth) return auth.error;
  const { tenant, supabase, access } = auth;

  const body = await parseBody<{
    file_url: string;
    file_name: string;
    file_type?: string;
    file_size?: number;
    alt_text?: string;
  }>(req);
  if (!body?.file_url || !body?.file_name) return apiError("file_url and file_name required", 400);

  const { data, error } = await supabase
    .from("media")
    .insert({
      tenant_id: tenant.id,
      file_name: body.file_name,
      file_url: body.file_url,
      file_type: body.file_type ?? null,
      file_size: body.file_size ?? null,
      alt_text: body.alt_text ?? null,
      uploaded_by: access.userId,
    })
    .select()
    .single();

  if (error) return apiError("Failed to save media: " + error.message, 500);
  return NextResponse.json({ media: data }, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const auth = await requireAdminApi("write");
  if ("error" in auth) return auth.error;
  const { tenant, supabase } = auth;

  const id = req.nextUrl.searchParams.get("id");
  if (!id) return apiError("id required", 400);

  const { data: row } = await supabase
    .from("media")
    .select("id, file_url")
    .eq("id", id)
    .eq("tenant_id", tenant.id)
    .maybeSingle();

  if (!row) return apiError("Media not found", 404);

  // Best-effort storage cleanup when URL is from our media bucket
  try {
    const marker = `/storage/v1/object/public/media/`;
    const idx = row.file_url.indexOf(marker);
    if (idx !== -1) {
      const path = row.file_url.slice(idx + marker.length);
      if (path.startsWith(tenant.id + "/")) {
        await supabase.storage.from("media").remove([path]);
      }
    }
  } catch {
    /* ignore storage errors — row delete still proceeds */
  }

  const { error } = await supabase
    .from("media")
    .delete()
    .eq("id", id)
    .eq("tenant_id", tenant.id);

  if (error) return apiError("Failed to delete media", 500);
  return NextResponse.json({ ok: true });
}
