"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function updateMyProjectTask(formData: FormData) {
  const projectId = String(formData.get("project_id") ?? "");
  const taskId = String(formData.get("task_id") ?? "");
  const status = String(formData.get("status") ?? "");
  const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuid.test(projectId) || !uuid.test(taskId) || !["todo","in_progress","blocked","done","cancelled"].includes(status)) {
    throw new Error("Invalid task update.");
  }
  const supabase = await createClient();
  const { data: auth, error: authError } = await supabase.auth.getClaims();
  if (authError || !auth?.claims?.sub) throw new Error("Authentication required.");
  const { data: profile } = await supabase.from("profiles").select("id, role, status").eq("id", auth.claims.sub).maybeSingle();
  if (!profile || profile.role !== "staff" || profile.status !== "active") throw new Error("Active staff access required.");
  const { error } = await supabase.from("project_tasks").update({
    status,
    completed_at: status === "done" ? new Date().toISOString() : null,
    updated_at: new Date().toISOString()
  }).eq("id", taskId).eq("project_id", projectId).eq("assigned_to", profile.id);
  if (error) throw new Error("Unable to update this assigned task.");
  revalidatePath("/dashboard/projects/" + projectId);
  revalidatePath("/dashboard");
}

export async function createInternalProjectUpdate(formData: FormData) {
  const projectId = String(formData.get("project_id") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();
  const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuid.test(projectId) || title.length < 2 || title.length > 180 || body.length < 2 || body.length > 5000) {
    throw new Error("Invalid project update.");
  }
  const supabase = await createClient();
  const { data: auth, error: authError } = await supabase.auth.getClaims();
  if (authError || !auth?.claims?.sub) throw new Error("Authentication required.");
  const { data: profile } = await supabase.from("profiles").select("id, role, status").eq("id", auth.claims.sub).maybeSingle();
  if (!profile || profile.role !== "staff" || profile.status !== "active") throw new Error("Active staff access required.");
  const { error } = await supabase.from("project_updates").insert({
    project_id: projectId, author_id: profile.id, title, body, customer_visible: false
  });
  if (error) throw new Error("Unable to save internal project update.");
  revalidatePath("/dashboard/projects/" + projectId);
  revalidatePath("/dashboard");
}
