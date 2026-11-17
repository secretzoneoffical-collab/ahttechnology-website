import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth/require-admin";
import { createProjectTask, createProjectUpdate } from "../actions";

export const dynamic = "force-dynamic";

export default async function AdminProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase } = await requireAdmin();
  const [{ data: project, error }, { data: tasks }, { data: updates }, { data: stages }] = await Promise.all([
    supabase.from("projects").select("id, project_code, name, description, status, progress_percent, start_date, due_date, customers(full_name, company_name)").eq("id", id).maybeSingle(),
    supabase.from("project_tasks").select("id, title, description, status, priority, due_date, customer_visible").eq("project_id", id).order("created_at", { ascending: false }),
    supabase.from("project_updates").select("id, title, body, customer_visible, created_at").eq("project_id", id).order("created_at", { ascending: false }),
    supabase.from("project_stages").select("id, name, status, progress_percent, sort_order").eq("project_id", id).order("sort_order")
  ]);
  if (error || !project) notFound();
  const customer = Array.isArray(project.customers) ? project.customers[0] : project.customers;

  return (
    <main className="admin-content">
      <div className="admin-page-heading"><div><Link className="auth-link" href="/admin/projects">← كل المشاريع</Link><span className="eyebrow">PROJECT DETAILS · {project.project_code}</span><h1>{project.name}</h1><p>{customer?.company_name || customer?.full_name || "عميل غير محدد"}</p></div><span className="admin-count">{project.progress_percent}% إنجاز</span></div>
      <section className="admin-panel project-summary">
        <div className="project-progress large"><span>{project.progress_percent}%</span><i><b style={{width: project.progress_percent + "%"}} /></i></div>
        <p>{project.description || "لا يوجد وصف للمشروع."}</p>
        <div className="project-meta"><span>الحالة: {project.status}</span><span>البداية: {project.start_date || "—"}</span><span>التسليم: {project.due_date || "—"}</span></div>
      </section>
      <div className="project-detail-columns">
        <section className="admin-panel">
          <div className="admin-panel-heading"><h2>المهام</h2><p>أضف المهام وحدد ما يمكن للعميل رؤيته.</p></div>
          <form action={createProjectTask} className="project-create-form">
            <input type="hidden" name="project_id" value={id} />
            <label>عنوان المهمة<input name="title" required maxLength={180} /></label>
            <label>التفاصيل<textarea name="description" rows={2} maxLength={3000} /></label>
            <label>موعد التنفيذ<input type="date" name="due_date" /></label>
            <label className="project-check"><input type="checkbox" name="customer_visible" /> ظاهرة للعميل</label>
            <button className="button-primary" type="submit">إضافة مهمة</button>
          </form>
          <div className="project-record-list">{tasks?.map(t => <article key={t.id}><strong>{t.title}</strong><span>{t.status} · {t.due_date || "بدون موعد"} · {t.customer_visible ? "ظاهرة للعميل" : "داخلية"}</span>{t.description && <p>{t.description}</p>}</article>)}{!tasks?.length && <p className="admin-note">لا توجد مهام.</p>}</div>
        </section>
        <section className="admin-panel">
          <div className="admin-panel-heading"><h2>تحديثات المشروع</h2><p>انشر تحديثًا داخليًا أو للعميل.</p></div>
          <form action={createProjectUpdate} className="project-create-form">
            <input type="hidden" name="project_id" value={id} />
            <label>عنوان التحديث<input name="title" required maxLength={180} /></label>
            <label>التفاصيل<textarea name="body" required rows={4} maxLength={5000} /></label>
            <label className="project-check"><input type="checkbox" name="customer_visible" /> نشر التحديث للعميل</label>
            <button className="button-primary" type="submit">نشر التحديث</button>
          </form>
          <div className="project-record-list">{updates?.map(u => <article key={u.id}><strong>{u.title}</strong><span>{new Intl.DateTimeFormat("ar-EG", {dateStyle:"medium",timeStyle:"short"}).format(new Date(u.created_at))} · {u.customer_visible ? "مرئي للعميل" : "داخلي"}</span><p>{u.body}</p></article>)}{!updates?.length && <p className="admin-note">لا توجد تحديثات.</p>}</div>
        </section>
      </div>
      <section className="admin-panel"><div className="admin-panel-heading"><h2>مراحل المشروع</h2><p>المراحل قابلة للإدارة من قاعدة البيانات حاليًا؛ واجهة تحرير المراحل قيد الاستكمال.</p></div>{stages?.length ? <div className="project-record-list">{stages.map(s=><article key={s.id}><strong>{s.name}</strong><span>{s.status} · {s.progress_percent}%</span></article>)}</div> : <p className="admin-note">لم تتم إضافة مراحل بعد.</p>}</section>
    </main>
  );
}
