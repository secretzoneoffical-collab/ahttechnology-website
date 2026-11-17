import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function CustomerProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getClaims();
  if (!auth?.claims?.sub) redirect("/login?next=/dashboard");
  const { data: profile } = await supabase.from("profiles").select("id, role, status").eq("id", auth.claims.sub).maybeSingle();
  if (!profile || profile.status !== "active") redirect("/dashboard");

  const { data: project } = await supabase.from("projects").select("id, project_code, name, description, status, progress_percent, start_date, due_date").eq("id", id).maybeSingle();
  if (!project) notFound();
  if (profile.role !== "admin") {
    const { data: link } = await supabase.from("customer_users").select("customer_id").eq("user_id", profile.id).maybeSingle();
    if (!link) notFound();
    const { data: ownership } = await supabase.from("projects").select("id").eq("id", id).eq("customer_id", link.customer_id).maybeSingle();
    if (!ownership) notFound();
  }

  const [{ data: stages }, { data: tasks }, { data: updates }, { data: files }] = await Promise.all([
    supabase.from("project_stages").select("id, name, status, progress_percent, sort_order").eq("project_id", id).eq("customer_visible", true).order("sort_order"),
    supabase.from("project_tasks").select("id, title, status, due_date").eq("project_id", id).eq("customer_visible", true).order("created_at", {ascending:false}),
    supabase.from("project_updates").select("id, title, body, created_at").eq("project_id", id).eq("customer_visible", true).order("created_at", {ascending:false}),
    supabase.from("project_files").select("id, file_name, storage_path, created_at").eq("project_id", id).eq("customer_visible", true).order("created_at", {ascending:false})
  ]);

  return <main className="dashboard-page" dir="rtl"><header className="dashboard-header"><Link className="auth-brand" href="/">AHT <span>ALI HANY TECHNOLOGY</span></Link><Link className="button-secondary" href="/dashboard">العودة لمشاريعي</Link></header><section className="dashboard-content"><Link className="auth-link" href="/dashboard">← مشاريعي</Link><span className="eyebrow">PROJECT · {project.project_code}</span><h1>{project.name}</h1><p className="auth-muted">{project.description || "تفاصيل وتحديثات مشروعك مع AHT."}</p><div className="admin-panel project-summary"><div className="project-progress large"><span>{project.progress_percent}%</span><i><b style={{width:project.progress_percent+"%"}} /></i></div><div className="project-meta"><span>الحالة: {project.status}</span><span>البداية: {project.start_date || "—"}</span><span>التسليم: {project.due_date || "—"}</span></div></div><div className="project-detail-columns"><section className="admin-panel"><h2>مراحل المشروع</h2>{stages?.length ? <div className="project-record-list">{stages.map(s=><article key={s.id}><strong>{s.name}</strong><span>{s.status} · {s.progress_percent}%</span></article>)}</div> : <p className="admin-note">لم يتم نشر مراحل بعد.</p>}<h2>المهام الظاهرة لك</h2>{tasks?.length ? <div className="project-record-list">{tasks.map(t=><article key={t.id}><strong>{t.title}</strong><span>{t.status} · {t.due_date || "بدون موعد"}</span></article>)}</div> : <p className="admin-note">لا توجد مهام منشورة.</p>}</section><section className="admin-panel"><h2>تحديثات فريق AHT</h2>{updates?.length ? <div className="project-record-list">{updates.map(u=><article key={u.id}><strong>{u.title}</strong><span>{new Intl.DateTimeFormat("ar-EG",{dateStyle:"medium",timeStyle:"short"}).format(new Date(u.created_at))}</span><p>{u.body}</p></article>)}</div> : <p className="admin-note">لا توجد تحديثات منشورة.</p>}<h2>ملفات المشروع</h2>{files?.length ? <div className="project-record-list">{files.map(f=><article key={f.id}><strong>{f.file_name}</strong><span>مرفق مشروع — {new Intl.DateTimeFormat("ar-EG",{dateStyle:"medium"}).format(new Date(f.created_at))}</span></article>)}</div> : <p className="admin-note">لا توجد ملفات منشورة.</p>}</section></div></section></main>;
}
