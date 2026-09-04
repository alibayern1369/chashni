import { NextRequest, NextResponse } from "next/server";
import { getTenantFromRequest, apiError } from "@/lib/api/helpers";
import { requireTenantAccess } from "@/lib/api/admin-auth";

/**
 * POST /api/admin/media/upload — multipart file upload to Supabase Storage + media row.
 */
export async function POST(req: NextRequest) {
  const { tenant, supabase } = await getTenantFromRequest();
  if (!tenant) return apiError("Tenant not found", 404);

  const access = await requireTenantAccess(tenant, "write");
  if ("error" in access) return access.error;

  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) return apiError("file required", 400);

  const ext = file.name.split(".").pop() || "bin";
  const path = `${tenant.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  const buffer = Buffer.from(await file.arrayBuffer());
  const { error: uploadError } = await supabase.storage.from("media").upload(path, buffer, {
    contentType: file.type || "application/octet-stream",
    upsert: false,
  });

  if (uploadError) {
    return apiError("Upload failed: " + uploadError.message, 500);
  }

  const { data: publicUrl } = supabase.storage.from("media").getPublicUrl(path);

  const { data, error } = await supabase
    .from("media")
    .insert({
      tenant_id: tenant.id,
      file_name: file.name,
      file_url: publicUrl.publicUrl,
      file_type: file.type || null,
      file_size: file.size,
      uploaded_by: access.access.userId,
    })
    .select()
    .single();

  if (error) return apiError(error.message, 500);
  return NextResponse.json({ media: data }, { status: 201 });
}
