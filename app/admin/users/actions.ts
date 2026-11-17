"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/require-admin";

export async function updateUserAccess(formData: FormData) {
  const userId = String(formData.get("user_id") ?? "");
  const role = String(formData.get("role") ?? "");
  const status = String(formData.get("status") ?? "");

  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId)) {
    throw new Error("Invalid user identifier.");
  }
  if (!["customer", "staff"].includes(role) || !["active", "pending", "suspended"].includes(status) || (status === "pending" && role !== "staff")) {
    throw new Error("Invalid role or account status.");
  }

  const { supabase, user } = await requireAdmin();
  if (user.id === userId) {
    throw new Error("You cannot change your own access.");
  }

  const { data: target, error: targetError } = await supabase
    .from("profiles")
    .select("id, role")
    .eq("id", userId)
    .maybeSingle();

  if (targetError || !target || target.role === "admin") {
    throw new Error("This account cannot be managed from this screen.");
  }

  const { error } = await supabase.rpc("admin_update_profile_access", {
    target_user_id: userId,
    new_role: role,
    new_status: status
  });

  if (error) {
    throw new Error("Unable to update this account. Check administrator access and database permissions.");
  }

  revalidatePath("/admin");
  revalidatePath("/admin/users");
  revalidatePath("/admin/team");
  redirect("/admin/users?updated=1");
}
