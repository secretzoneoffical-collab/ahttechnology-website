import Link from "next/link";
import { requireAdmin } from "@/lib/auth/require-admin";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const { supabase, profile } = await requireAdmin();

  const { count: totalUsers, error: countError } = await supabase
    .from("profiles")
    .select("id", { count: "exact", head: true });

  const { count: activeUsers } = await supabase
    .from("profiles")
    .select("id", { count: "exact", head: true })
    .eq("status", "active");

  const { count: adminUsers } = await supabase
    .from("profiles")
    .select("id", { count: "exact", head: true })
    .eq("role", "admin");

  return (
    <main className="admin-content">
      <div className="admin-page-heading">
        <div>
          <span className="eyebrow">ADMINISTRATION</span>
          <h1>لوحة التحكم</h1>
          <p>مرحبًا {profile.full_name || "بك"}، دي نظرة عامة على بوابة AHT.</p>
        </div>
        <Link className="button-primary" href="/admin/users">إدارة المستخدمين</Link>
      </div>

      <section className="admin-stats" aria-label="إحصائيات النظام">
        <article className="admin-stat"><span>إجمالي الحسابات</span><strong>{countError ? "—" : totalUsers ?? 0}</strong></article>
        <article className="admin-stat"><span>الحسابات النشطة</span><strong>{activeUsers ?? 0}</strong></article>
        <article className="admin-stat"><span>حسابات الإدارة</span><strong>{adminUsers ?? 0}</strong></article>
      </section>

      <section className="admin-panel">
        <div className="admin-panel-heading">
          <div><h2>إدارة النظام</h2><p>الأقسام المتاحة حاليًا في لوحة الإدارة.</p></div>
        </div>
        <div className="admin-shortcuts">
          <Link href="/admin/users"><strong>المستخدمون</strong><span>عرض حسابات العملاء والموظفين وأدوارهم.</span></Link>
          <div><strong>طلبات العملاء</strong><span>قيد التطوير — سيتم ربطها بقاعدة البيانات.</span></div>
          <div><strong>إعدادات الموقع</strong><span>قيد التطوير — إعدادات المحتوى واللغات.</span></div>
        </div>
      </section>
    </main>
  );
}
