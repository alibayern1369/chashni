import { checkAdminAccessApi } from "@/lib/api/admin-auth";

/** GET /api/admin/access — verify current user may use restaurant admin */
export async function GET() {
  return checkAdminAccessApi();
}
