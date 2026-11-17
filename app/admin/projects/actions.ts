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
  const assignedTo = String(formData.get("assigned_to") ?? "").trim() || null;
  if (assignedTo) {
    const { data: assignment } = await supabase.from("project_team").select("user_id, profiles!inner(role,status)").eq("project_id", projectId).eq("user_id", assignedTo).eq("profiles.role", "staff").eq("profiles.status", "active").maybeSingle();
    if (!assignment) throw new Error("Assign the task to an active member of this project team.");
  }

  const { error } = await supabase.from("project_tasks").insert({
    project_id: projectId,
    title,
    description: description || null,
    due_date: dueDate,
    assigned_to: assignedTo,
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


export async function assignProjectStaff(formData: FormData) {
  const { supabase, user } = await requireAdmin();
  const projectId = requiredText(formData.get("project_id"), 64);
  const staffId = requiredText(formData.get("user_id"), 64);
  const { data: staff } = await supabase.from("profiles").select("id, role, status").eq("id", staffId).maybeSingle();
  if (!staff || staff.role !== "staff" || staff.status !== "active") throw new Error("Choose an active staff account.");
  const { error } = await supabase.from("project_team").insert({ project_id: projectId, user_id: staffId, assigned_by: user.id });
  if (error) throw new Error("Unable to assign staff member.");
  revalidatePath("/admin/projects/" + projectId);
  revalidatePath("/dashboard");
}

export async function removeProjectStaff(formData: FormData) {
  const { supabase } = await requireAdmin();
  const projectId = requiredText(formData.get("project_id"), 64);
  const staffId = requiredText(formData.get("user_id"), 64);
  const { error } = await supabase.from("project_team").delete().eq("project_id", projectId).eq("user_id", staffId);
  if (error) throw new Error("Unable to remove staff assignment.");
  revalidatePath("/admin/projects/" + projectId);
  revalidatePath("/dashboard");
}


export async function uploadProjectFile(formData: FormData) {
  const { supabase, user } = await requireAdmin();
  const projectId = requiredText(formData.get("project_id"), 64);
  const upload = formData.get("file");
  if (!(upload instanceof File) || upload.size < 1 || upload.size > 15 * 1024 * 1024) {
    throw new Error("Choose a file smaller than 15 MB.");
  }
  const allowed = new Set([
    "application/pdf", "image/jpeg", "image/png", "image/webp", "text/plain",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  ]);
  if (!allowed.has(upload.type)) throw new Error("This file type is not allowed.");
  const safeName = upload.name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(-120) || "document";
  const storagePath = projectId + "/" + crypto.randomUUID() + "-" + safeName;
  const { error: uploadError } = await supabase.storage.from("aht-project-files")
    .upload(storagePath, new Uint8Array(await upload.arrayBuffer()), { contentType: upload.type, upsert: false });
  if (uploadError) throw new Error("Unable to upload file. Check Storage migration and project access.");
  const customerVisible = formData.get("customer_visible") === "on";
  const { error: recordError } = await supabase.from("project_files").insert({
    project_id: projectId, uploaded_by: user.id, file_name: upload.name.slice(0, 255),
    storage_path: storagePath, mime_type: upload.type, size_bytes: upload.size,
    customer_visible: customerVisible
  });
  if (recordError) {
    await supabase.storage.from("aht-project-files").remove([storagePath]);
    throw new Error("File uploaded but its project record could not be saved.");
  }
  revalidatePath("/admin/projects/" + projectId);
  revalidatePath("/dashboard");
}


export async function updateProjectStage(formData: FormData) {
  const { supabase } = await requireAdmin();
  const projectId = requiredText(formData.get("project_id"), 64);
  const stageId = requiredText(formData.get("stage_id"), 64);
  const status = String(formData.get("status") ?? "");
  const progress = Number(formData.get("progress_percent"));
  if (!["pending","in_progress","completed","blocked"].includes(status) || !Number.isInteger(progress) || progress < 0 || progress > 100) {
    throw new Error("Invalid stage status or progress.");
  }
  const { error } = await supabase.from("project_stages").update({
    status, progress_percent: progress,
    completed_at: status === "completed" ? new Date().toISOString() : null,
    updated_at: new Date().toISOString()
  }).eq("id", stageId).eq("project_id", projectId);
  if (error) throw new Error("Unable to update project stage.");
  revalidatePath("/admin/projects/" + projectId);
  revalidatePath("/dashboard");
}

export async function updateProjectTask(formData: FormData) {
  const { supabase } = await requireAdmin();
  const projectId = requiredText(formData.get("project_id"), 64);
  const taskId = requiredText(formData.get("task_id"), 64);
  const status = String(formData.get("status") ?? "");
  const priority = String(formData.get("priority") ?? "");
  const assignedTo = String(formData.get("assigned_to") ?? "").trim() || null;
  if (assignedTo) {
    const { data: assignment } = await supabase.from("project_team").select("user_id, profiles!inner(role,status)").eq("project_id", projectId).eq("user_id", assignedTo).eq("profiles.role", "staff").eq("profiles.status", "active").maybeSingle();
    if (!assignment) throw new Error("Assign the task to an active member of this project team.");
  }
  if (["todo","in_progress","blocked","done","cancelled"].includes(status) || !["low","normal","high","urgent"].includes(priority)) {
    throw new Error("Invalid task status or priority.");
  }
  const { error } = await supabase.from("project_tasks").update({
    status, priority, assigned_to: assignedTo, completed_at: status === "done" ? new Date().toISOString() : null,
    updated_at: new Date().toISOString()
  }).eq("id", taskId).eq("project_id", projectId);
  if (error) throw new Error("Unable to update project task.");
  revalidatePath("/admin/projects/" + projectId);
  revalidatePath("/dashboard");
}
