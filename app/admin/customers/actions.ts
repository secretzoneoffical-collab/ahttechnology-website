"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

async function requireActiveAdmin() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) redirect("/login?next=/admin/customers");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, status")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile || profile.role !== "admin" || profile.status !== "active") {
    redirect("/dashboard");
  }
  return supabase;
}

export async function createCustomerFromRequest(formData: FormData) {
  const requestId = String(formData.get("request_id") ?? "");
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(requestId)) {
    throw new Error("Invalid request identifier.");
  }

  const supabase = await requireActiveAdmin();
  const { data: request, error: requestError } = await supabase
    .from("service_requests")
    .select("id, full_name, email, phone, company, customer_id")
    .eq("id", requestId)
    .maybeSingle();

  if (requestError || !request) throw new Error("Service request not found.");
  if (request.customer_id) redirect("/admin/customers/" + request.customer_id);

  let customerId: string | null = null;
  const { data: existing } = await supabase
    .from("customers")
    .select("id")
    .ilike("email", request.email)
    .limit(1)
    .maybeSingle();

  if (existing) {
    customerId = existing.id;
  } else {
    const { data: created, error: createError } = await supabase
      .from("customers")
      .insert({
        customer_type: request.company ? "company" : "individual",
        full_name: request.full_name,
        company_name: request.company,
        email: request.email,
        phone: request.phone,
        status: "prospect",
        source: "website"
      })
      .select("id")
      .single();

    if (createError || !created) {
      const { data: duplicate } = await supabase
        .from("customers")
        .select("id")
        .ilike("email", request.email)
        .limit(1)
        .maybeSingle();
      if (!duplicate) throw new Error("Unable to create customer record.");
      customerId = duplicate.id;
    } else {
      customerId = created.id;
    }
  }

  const { error: linkError } = await supabase
    .from("service_requests")
    .update({ customer_id: customerId })
    .eq("id", request.id);

  if (linkError || !customerId) throw new Error("Customer was created but the request could not be linked.");
  revalidatePath("/admin");
  revalidatePath("/admin/requests");
  revalidatePath("/admin/customers");
  redirect("/admin/customers/" + customerId + "?created=1");
}

export async function updateCustomer(formData: FormData) {
  const customerId = String(formData.get("customer_id") ?? "");
  const status = String(formData.get("status") ?? "");
  const notes = String(formData.get("notes") ?? "").trim();

  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(customerId)) {
    throw new Error("Invalid customer identifier.");
  }
  if (!["prospect", "active", "inactive"].includes(status) || notes.length > 5000) {
    throw new Error("Invalid customer details.");
  }

  const supabase = await requireActiveAdmin();
  const { error } = await supabase
    .from("customers")
    .update({ status, notes: notes || null, updated_at: new Date().toISOString() })
    .eq("id", customerId);

  if (error) throw new Error("Unable to update customer.");
  revalidatePath("/admin/customers");
  revalidatePath("/admin/customers/" + customerId);
  redirect("/admin/customers/" + customerId + "?updated=1");
}
