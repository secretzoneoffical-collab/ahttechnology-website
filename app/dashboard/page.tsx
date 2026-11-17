import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const projectStatusLabels: Record<string,string> = { planned:"مخطط", active:"قيد التنفيذ", on_hold:"متوقف مؤقتًا", completed:"مكتمل", cancelled:"ملغي" };

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();
  if (error || !data?.claims?.sub) redirect("/login?next=/dashboard");
  const { data: profile } = await supabase.from("profiles").select("id, full_name, role, status").eq("id", data.claims.sub).maybeSingle();
  if (!profile) redirect("/login?message=account-unavailable");
  if (profile.status !== "active") return <main className="auth-page" dir="rtl"><section className="auth-card"><h1>{profile.status === "pending" && profile.role === "staff" ? "طلب انضمامك قيد المراجعة" : "الحساب غير نشط"}</h1><p className="auth-muted">{profile.status === "pending" && profile.role === "staff" ? "استلمت AHT طلب انضمامك. سيتم تفعيل حساب الموظف بعد مراجعة الإدارة والموافقة عليه. لن تتمكن من الوصول إلى المشاريع أو بيانات الفريق قبل التفعيل." : "لا يمكن الوصول إلى بوابة AHT بهذا الحساب حاليًا. يرجى التواصل مع فريق AHT للمساعدة."}</p><form action="/auth/signout" method="post"><button className="button-secondary" type="submit">تسجيل الخروج</button></form></section></main>;

  let visibleProjects: {id:string;project_code:string;name:string;status:string;progress_percent:number;due_date:string|null}[] = [];
  let loadError = false;
  if (profile.role === "admin") {
    const result = await supabase.from("projects").select("id, project_code, name, status, progress_percent, due_date").order("created_at", {ascending:false});
    visibleProjects = result.data ?? []; loadError = !!result.error;
  } else if (profile.role === "staff") {
    const { data: assignments, error: assignmentError } = await supabase.from("project_team").select("project_id").eq("user_id", profile.id);
    const ids = (assignments ?? []).map(a=>a.project_id);
    if (ids.length) {
      const result = await supabase.from("projects").select("id, project_code, name, status, progress_percent, due_date").in("id", ids).order("created_at", {ascending:false});
      visibleProjects = result.data ?? []; loadError = !!result.error;
    } else loadError = !!assignmentError;
  } else {
    const { data: links, error: linkError } = await supabase.from("customer_users").select("customer_id").eq("user_id", profile.id);
    const customerIds = (links ?? []).map(link=>link.customer_id);
    if (customerIds.length) {
      const result = await supabase.from("projects").select("id, project_code, name, status, progress_percent, due_date").in("customer_id", customerIds).order("created_at", {ascending:false});
      visibleProjects = result.data ?? []; loadError = !!result.error;
    } else loadError = !!linkError;
  }

  return <main className="dashboard-page" dir="rtl"><header className="dashboard-header"><Link className="auth-brand" href="/">AHT <span>ALI HANY TECHNOLOGY</span></Link><div className="dashboard-header-actions">{profile.role === "admin" && <Link className="button-primary" href="/admin">لوحة الإدارة</Link>}<form action="/auth/signout" method="post"><button className="button-secondary" type="submit">تسجيل الخروج</button></form></div></header><section className="dashboard-content"><span className="eyebrow">AHT {profile.role === "staff" ? "TEAM WORKSPACE" : "CUSTOMER PORTAL"}</span><h1>أهلاً {profile.full_name || "بك"} 👋</h1><p className="auth-muted">{profile.role === "admin" ? "أنت مسجل كمدير. تقدر تتابع كل المشاريع من لوحة الإدارة." : profile.role === "staff" ? "المشاريع المسندة إليك ومهام فريق العمل." : "دي مساحة متابعة مشاريعك وملفاتك وتحديثات فريق AHT."}</p><div className="portal-section-heading"><h2>{profile.role === "staff" ? "المشاريع المسندة إليّ" : "مشاريعي"}</h2><span>{visibleProjects.length} مشروع</span></div>{loadError ? <div className="dashboard-placeholder"><strong>تعذر تحميل المشاريع</strong><span>تأكد من تطبيق Migration الخاصة بإدارة المشاريع.</span></div> : !visibleProjects.length ? <div className="dashboard-placeholder"><strong>لا توجد مشاريع مرتبطة بحسابك حتى الآن</strong><span>عند ربط حسابك بملف العميل أو إسناد مشروع إليك، سيظهر هنا.</span></div> : <div className="portal-project-grid">{visibleProjects.map(p=><article key={p.id} className="portal-project-card"><div><span className="portal-project-code">{p.project_code}</span><span className="portal-project-status">{projectStatusLabels[p.status] || p.status}</span></div><h3>{p.name}</h3><div className="project-progress"><span>{p.progress_percent}%</span><i><b style={{width:p.progress_percent+"%"}} /></i></div><small>موعد التسليم: {p.due_date || "غير محدد"}</small><Link href={"/dashboard/projects/"+p.id}>عرض تفاصيل المشروع ←</Link></article>)}</div>}</section></main>;
}
