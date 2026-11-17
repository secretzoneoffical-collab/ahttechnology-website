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

  const { count: serviceRequests } = await supabase
    .from("service_requests")
    .select("id", { count: "exact", head: true });

  const { count: newRequests } = await supabase
    .from("service_requests")
    .select("id", { count: "exact", head: true })
    .eq("status", "new");

  const { count: staffUsers } = await supabase
    .from("profiles")
    .select("id", { count: "exact", head: true })
    .eq("role", "staff");

  const { count: customers } = await supabase
    .from("customers")
    .select("id", { count: "exact", head: true });

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
        <article className="admin-stat"><span>طلبات الخدمات</span><strong>{serviceRequests ?? 0}</strong><small>{newRequests ?? 0} طلب جديد</small></article>
        <article className="admin-stat"><span>سجل العملاء</span><strong>{customers ?? 0}</strong></article>
        <article className="admin-stat"><span>فريق العمل</span><strong>{staffUsers ?? 0}</strong></article>
      </section>

      <section className="admin-panel">
        <div className="admin-panel-heading">
          <div><h2>إدارة النظام</h2><p>الأقسام المتاحة حاليًا في لوحة الإدارة.</p></div>
        </div>
        <div className="admin-shortcuts">
          <Link href="/admin/users"><strong>المستخدمون والصلاحيات</strong><span>تعيين دور الموظف وإيقاف الحسابات أو تفعيلها.</span></Link>
          <Link href="/admin/team"><strong>فريق العمل</strong><span>عرض حسابات الموظفين النشطة والموقوفة.</span></Link>
          <Link href="/admin/requests"><strong>طلبات الخدمات</strong><span>عرض الطلبات الواردة ومعلومات التواصل وتفاصيل الاحتياج.</span></Link>
          <Link href="/admin/customers"><strong>إدارة العملاء</strong><span>ملفات العملاء وتصنيفهم وملاحظاتهم وسجل طلباتهم.</span></Link>
          <div><strong>إعدادات الموقع</strong><span>قيد التطوير — إعدادات المحتوى واللغات.</span></div>
        </div>
      </section>
    </main>
  );
}
