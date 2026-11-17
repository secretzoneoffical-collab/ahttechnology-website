import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function requireAdmin() {
  const supabase = await createClient();

  // getUser() verifies the current user with the Auth server.
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/login?next=/admin");
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, full_name, role, status")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError || !profile || profile.status !== "active") {
    redirect("/login?message=account-unavailable");
  }

  if (profile.role !== "admin") {
    redirect("/dashboard");
  }

  return { supabase, user, profile };
}
