"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/require-admin";

function requiredText(value: FormDataEntryValue | null, max: number) {
  const text = String(value ?? "").trim();
  if (!text || text.length > max) throw new Error("Invalid required field.");
  return text;
}

export async function createProject(formData: FormData) {
  const { supabase, user } = await requireAdmin();
  const customerId = requiredText(formData.get("customer_id"), 64);
  const name = requiredText(formData.get("name"), 160);
  const projectCode = requiredText(formData.get("project_code"), 40).toUpperCase();
  const description = String(formData.get("description") ?? "").trim().slice(0, 5000);
  const startDate = String(formData.get("start_date") ?? "").trim() || null;
  const dueDate = String(formData.get("due_date") ?? "").trim() || null;

  if (!/^[A-Z0-9_-]+$/.test(projectCode)) throw new Error("Project code format is invalid.");
  if (startDate && dueDate && dueDate < startDate) throw new Error("Due date must be after start date.");

  const { data, error } = await supabase.from("projects").insert({
    customer_id: customerId,
    project_code: projectCode,
    name,
    description: description || null,
    status: "planned",
    progress_percent: 0,
    start_date: startDate,
    due_date: dueDate,
    created_by: user.id
  }).select("id").single();

  if (error || !data) throw new Error("Unable to create project. Check the customer and project code.");
  revalidatePath("/admin/projects");
  revalidatePath("/dashboard");
  redirect("/admin/projects/" + data.id);
}

export async function createProjectTask(formData: FormData) {
  const { supabase, user } = await requireAdmin();
  const projectId = requiredText(formData.get("project_id"), 64);
  const title = requiredText(formData.get("title"), 180);
  const description = String(formData.get("description") ?? "").trim().slice(0, 3000);
  const dueDate = String(formData.get("due_date") ?? "").trim() || null;
  const customerVisible = formData.get("customer_visible") === "on";

  const { error } = await supabase.from("project_tasks").insert({
    project_id: projectId,
    title,
    description: description || null,
    due_date: dueDate,
    customer_visible: customerVisible,
    created_by: user.id
  });
  if (error) throw new Error("Unable to add task.");
  revalidatePath("/admin/projects/" + projectId);
  revalidatePath("/dashboard");
}

export async function createProjectUpdate(formData: FormData) {
  const { supabase, user } = await requireAdmin();
  const projectId = requiredText(formData.get("project_id"), 64);
  const title = requiredText(formData.get("title"), 180);
  const body = requiredText(formData.get("body"), 5000);
  const customerVisible = formData.get("customer_visible") === "on";

  const { error } = await supabase.from("project_updates").insert({
    project_id: projectId,
    author_id: user.id,
    title,
    body,
    customer_visible: customerVisible
  });
  if (error) throw new Error("Unable to publish project update.");
  revalidatePath("/admin/projects/" + projectId);
  revalidatePath("/dashboard");
}


export async function createProjectStage(formData: FormData) {
  const { supabase } = await requireAdmin();
  const projectId = requiredText(formData.get("project_id"), 64);
  const name = requiredText(formData.get("name"), 160);
  const description = String(formData.get("description") ?? "").trim().slice(0, 2000);
  const sortOrder = Math.max(0, Math.min(10000, Number(formData.get("sort_order") ?? 0) || 0));
  const customerVisible = formData.get("customer_visible") === "on";
  const { error } = await supabase.from("project_stages").insert({
    project_id: projectId, name, description: description || null,
    sort_order: sortOrder, customer_visible: customerVisible
  });
  if (error) throw new Error("Unable to add project stage.");
  revalidatePath("/admin/projects/" + projectId);
  revalidatePath("/dashboard");
}

export async function updateProjectProgress(formData: FormData) {
  const { supabase } = await requireAdmin();
  const projectId = requiredText(formData.get("project_id"), 64);
  const status = String(formData.get("status") ?? "");
  const progress = Number(formData.get("progress_percent"));
  if (!["planned","active","on_hold","completed","cancelled"].includes(status) || !Number.isInteger(progress) || progress < 0 || progress > 100) {
    throw new Error("Invalid project status or progress.");
  }
  const { error } = await supabase.from("projects").update({
    status, progress_percent: progress,
    completed_at: status === "completed" ? new Date().toISOString() : null,
    updated_at: new Date().toISOString()
  }).eq("id", projectId);
  if (error) throw new Error("Unable to update project progress.");
  revalidatePath("/admin/projects");
  revalidatePath("/admin/projects/" + projectId);
  revalidatePath("/dashboard");
}
