import Link from "next/link";
import { requireAdmin } from "@/lib/auth/require-admin";
import { createProject } from "./actions";

export const dynamic = "force-dynamic";

const statusLabels: Record<string, string> = {
  planned: "مخطط",
  active: "قيد التنفيذ",
  on_hold: "متوقف مؤقتًا",
  completed: "مكتمل",
  cancelled: "ملغي"
};

export default async function AdminProjectsPage() {
  const { supabase } = await requireAdmin();
  const [{ data: projects, error }, { data: customers }] = await Promise.all([
    supabase.from("projects").select("id, project_code, name, status, progress_percent, due_date, customers(full_name, company_name)").order("created_at", { ascending: false }).limit(200),
    supabase.from("customers").select("id, full_name, company_name").order("full_name").limit(500)
  ]);

  return (
    <main className="admin-content">
      <div className="admin-page-heading">
        <div><span className="eyebrow">PROJECT OPERATIONS</span><h1>إدارة المشاريع</h1><p>إنشاء المشاريع ومتابعة حالتها وتقدم التنفيذ.</p></div>
        <span className="admin-count">{projects?.length ?? 0} مشروع</span>
      </div>
      <section className="admin-panel">
        <div className="admin-panel-heading"><h2>إنشاء مشروع جديد</h2><p>اربط المشروع بملف عميل موجود في CRM.</p></div>
        {!customers?.length ? <p className="admin-note">لازم تضيف عميل أولًا قبل إنشاء مشروع.</p> : (
          <form action={createProject} className="project-create-form">
            <label>العميل<select name="customer_id" required defaultValue=""><option value="" disabled>اختر العميل</option>{customers.map((c) => <option key={c.id} value={c.id}>{c.company_name || c.full_name} — {c.full_name}</option>)}</select></label>
            <label>اسم المشروع<input name="name" required maxLength={160} placeholder="مثال: تطوير نظام إدارة المخزون" /></label>
            <label>كود المشروع<input name="project_code" required maxLength={40} placeholder="AHT-2026-001" /></label>
            <label>وصف المشروع<textarea name="description" rows={3} maxLength={5000} /></label>
            <div className="project-date-fields"><label>تاريخ البداية<input type="date" name="start_date" /></label><label>موعد التسليم<input type="date" name="due_date" /></label></div>
            <button className="button-primary" type="submit">إنشاء المشروع</button>
          </form>
        )}
      </section>
      <section className="admin-panel project-list-panel">
        <div className="admin-panel-heading"><h2>كل المشاريع</h2><p>قائمة المشاريع المسجلة في AHT.</p></div>
        {error ? <p className="auth-error">تعذر تحميل المشاريع. تأكد من تطبيق Migration وإعداد الصلاحيات.</p> : !projects?.length ? <div className="admin-empty"><strong>لا توجد مشاريع حتى الآن</strong><span>أنشئ أول مشروع من النموذج بالأعلى.</span></div> : (
          <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>الكود</th><th>المشروع</th><th>العميل</th><th>الحالة</th><th>التقدم</th><th>التسليم</th><th></th></tr></thead><tbody>
            {projects.map((p) => {
              const customer = Array.isArray(p.customers) ? p.customers[0] : p.customers;
              return <tr key={p.id}><td dir="ltr">{p.project_code}</td><td>{p.name}</td><td>{customer?.company_name || customer?.full_name || "—"}</td><td>{statusLabels[p.status] || p.status}</td><td><div className="project-progress"><span>{p.progress_percent}%</span><i><b style={{width: p.progress_percent + "%"}} /></i></div></td><td>{p.due_date || "—"}</td><td><Link href={"/admin/projects/" + p.id}>التفاصيل ←</Link></td></tr>;
            })}
          </tbody></table></div>
        )}
      </section>
    </main>
  );
}
