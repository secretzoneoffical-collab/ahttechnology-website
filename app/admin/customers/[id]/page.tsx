import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth/require-admin";
import { updateCustomer, linkCustomerAccount, unlinkCustomerAccount } from "../actions";

export const dynamic = "force-dynamic";

const statusLabels: Record<string, string> = { prospect: "عميل محتمل", active: "عميل نشط", inactive: "غير نشط" };

export default async function AdminCustomerDetailPage({ params, searchParams }: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ created?: string; updated?: string; linked?: string; unlinked?: string }>;
}) {
  const { id } = await params;
  const query = await searchParams;
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) notFound();
  const { supabase } = await requireAdmin();
  const { data: customer, error } = await supabase.from("customers")
    .select("id, customer_type, full_name, company_name, email, phone, alternate_phone, status, source, notes, created_at")
    .eq("id", id).maybeSingle();
  if (error || !customer) notFound();

  const [{ data: requests }, { data: linkedRows }, { data: eligibleAccounts }] = await Promise.all([
    supabase.from("service_requests").select("id, service_type, status, message, created_at").eq("customer_id", id).order("created_at", { ascending: false }).limit(100),
    supabase.from("customer_users").select("user_id").eq("customer_id", id),
    supabase.from("profiles").select("id, full_name, role, status").eq("role", "customer").eq("status", "active").order("full_name")
  ]);
  const linkedIds = (linkedRows ?? []).map(row => row.user_id);
  const linkedAccounts = linkedIds.length
    ? (await supabase.from("profiles").select("id, full_name, role, status").in("id", linkedIds)).data ?? []
    : [];

  return <main className="admin-content">
    <div className="admin-page-heading"><div><span className="eyebrow">CUSTOMER PROFILE</span><h1>{customer.full_name}</h1><p>{customer.company_name || (customer.customer_type === "company" ? "شركة" : "عميل فرد")}</p></div><Link className="button-secondary" href="/admin/customers">العودة للعملاء</Link></div>
    {(query.created === "1" || query.updated === "1" || query.linked === "1" || query.unlinked === "1") && <p className="auth-success" role="status">{query.created === "1" ? "تم إنشاء ملف العميل وربطه بالطلب." : query.updated === "1" ? "تم تحديث بيانات العميل." : query.linked === "1" ? "تم ربط حساب العميل بنجاح." : "تم فك ربط الحساب."}</p>}
    <div className="customer-detail-grid">
      <section className="admin-panel"><div className="admin-panel-heading"><h2>بيانات العميل</h2><p>معلومات التواصل والتصنيف الداخلي.</p></div>
        <dl className="customer-info"><div><dt>البريد الإلكتروني</dt><dd>{customer.email || "—"}</dd></div><div><dt>رقم الهاتف</dt><dd dir="ltr">{customer.phone}</dd></div><div><dt>هاتف بديل</dt><dd dir="ltr">{customer.alternate_phone || "—"}</dd></div><div><dt>المصدر</dt><dd>{customer.source}</dd></div><div><dt>تاريخ الإضافة</dt><dd>{new Intl.DateTimeFormat("ar-EG", { dateStyle: "medium" }).format(new Date(customer.created_at))}</dd></div></dl>
        <form action={updateCustomer} className="admin-customer-form"><input type="hidden" name="customer_id" value={customer.id}/><label htmlFor="customer-status">حالة العميل</label><select id="customer-status" name="status" defaultValue={customer.status}>{Object.entries(statusLabels).map(([value,label])=><option key={value} value={value}>{label}</option>)}</select><label htmlFor="customer-notes">ملاحظات داخلية</label><textarea id="customer-notes" name="notes" rows={5} maxLength={5000} defaultValue={customer.notes || ""}/><button className="button-primary" type="submit">حفظ بيانات العميل</button></form>
      </section>
      <section className="admin-panel"><div className="admin-panel-heading"><h2>حسابات بوابة العميل</h2><p>اربط حساب تسجيل الدخول بملف العميل لعرض مشاريعه.</p></div>
        <form action={linkCustomerAccount} className="admin-customer-form"><input type="hidden" name="customer_id" value={customer.id}/><label htmlFor="customer-user">حساب عميل نشط</label><select id="customer-user" name="user_id" required defaultValue=""><option value="" disabled>اختر حسابًا</option>{eligibleAccounts?.filter(account=>!linkedIds.includes(account.id)).map(account=><option key={account.id} value={account.id}>{account.full_name || account.id}</option>)}</select><button className="button-primary" type="submit">ربط الحساب</button></form>
        <div className="customer-request-list">{linkedAccounts.map(account=><article key={account.id}><div><strong>{account.full_name || account.id}</strong><span>حساب مرتبط</span></div><form action={unlinkCustomerAccount}><input type="hidden" name="customer_id" value={customer.id}/><input type="hidden" name="user_id" value={account.id}/><button className="admin-text-button" type="submit">فك الربط</button></form></article>)}</div>
        <div className="admin-panel-heading" style={{marginTop:24}}><h2>سجل طلبات الخدمات</h2><p>الطلبات المرتبطة بملف العميل.</p></div>
        {!requests?.length ? <div className="admin-empty"><strong>لا توجد طلبات مرتبطة</strong><span>أي طلب يتم ربطه بالعميل هيظهر هنا.</span></div> : <div className="customer-request-list">{requests.map(request=><article key={request.id}><div><strong>{request.service_type}</strong><span>{statusLabels[request.status] || request.status}</span></div><p>{request.message}</p><small>{new Intl.DateTimeFormat("ar-EG", {dateStyle:"medium"}).format(new Date(request.created_at))}</small></article>)}</div>}
      </section>
    </div>
  </main>;
}
