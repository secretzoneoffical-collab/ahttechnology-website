"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const allowedStatuses = ["new", "contacted", "qualified", "closed", "spam"] as const;
type RequestStatus = (typeof allowedStatuses)[number];

export async function updateServiceRequest(formData: FormData) {
  const requestId = String(formData.get("request_id") ?? "");
  const status = String(formData.get("status") ?? "");
  const adminNotes = String(formData.get("admin_notes") ?? "").trim();

  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(requestId)) {
    throw new Error("Invalid request identifier.");
  }
  if (!allowedStatuses.includes(status as RequestStatus)) {
    throw new Error("Invalid request status.");
  }
  if (adminNotes.length > 3000) {
    throw new Error("Notes must be 3000 characters or fewer.");
  }

  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) redirect("/login?next=/admin/requests");

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role, status")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError || profile?.role !== "admin" || profile.status !== "active") {
    redirect("/dashboard");
  }

  const update: {
    status: RequestStatus;
    admin_notes: string | null;
    updated_at: string;
    last_contacted_at?: string;
  } = {
    status: status as RequestStatus,
    admin_notes: adminNotes || null,
    updated_at: new Date().toISOString()
  };

  if (status === "contacted" || status === "qualified") {
    update.last_contacted_at = new Date().toISOString();
  }

  const { error } = await supabase
    .from("service_requests")
    .update(update)
    .eq("id", requestId);

  if (error) {
    throw new Error("Unable to update this service request.");
  }

  revalidatePath("/admin");
  revalidatePath("/admin/requests");
  redirect("/admin/requests?updated=1");
}
