import Link from "next/link";
import { requireAdmin } from "@/lib/auth/require-admin";

export const dynamic = "force-dynamic";

export default async function AdminTeamPage() {
  const { supabase } = await requireAdmin();
  const { data: staff, error } = await supabase
    .from("profiles")
    .select("id, full_name, status, created_at")
    .eq("role", "staff")
    .order("created_at", { ascending: false })
    .limit(100);

  const activeCount = staff?.filter((member) => member.status === "active").length ?? 0;
  const suspendedCount = staff?.filter((member) => member.status === "suspended").length ?? 0;

  return (
    <main className="admin-content">
      <div className="admin-page-heading">
        <div>
          <span className="eyebrow">AHT TEAM</span>
          <h1>فريق العمل</h1>
          <p>الحسابات التي تم تعيين دور الموظف لها داخل بوابة AHT.</p>
        </div>
        <Link className="button-primary" href="/admin/users">إدارة صلاحيات المستخدمين</Link>
      </div>
      <section className="admin-stats" aria-label="إحصائيات فريق العمل">
        <article className="admin-stat"><span>إجمالي الموظفين</span><strong>{staff?.length ?? 0}</strong></article>
        <article className="admin-stat"><span>حسابات نشطة</span><strong>{activeCount}</strong></article>
        <article className="admin-stat"><span>حسابات موقوفة</span><strong>{suspendedCount}</strong></article>
      </section>
      <section className="admin-panel">
        <div className="admin-panel-heading"><div><h2>قائمة الموظفين</h2><p>إدارة الدور والحالة متاحة من صفحة المستخدمين.</p></div></div>
        {error ? (
          <p className="auth-error">تعذر تحميل فريق العمل.</p>
        ) : !staff?.length ? (
          <div className="admin-empty">
            <strong>لم يتم تعيين موظفين بعد</strong>
            <span>اختار حسابًا موجودًا من إدارة المستخدمين وغيّر دوره إلى «موظف».</span>
            <Link className="button-primary" href="/admin/users">فتح إدارة المستخدمين</Link>
          </div>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead><tr><th>اسم الموظف</th><th>حالة الحساب</th><th>تاريخ الانضمام</th><th>الإجراء</th></tr></thead>
              <tbody>
                {staff.map((member) => (
                  <tr key={member.id}>
                    <td>{member.full_name || "بدون اسم"}</td>
                    <td><span className={member.status === "active" ? "admin-status active" : "admin-status suspended"}>{member.status === "active" ? "نشط" : "موقوف"}</span></td>
                    <td>{new Intl.DateTimeFormat("ar-EG", { dateStyle: "medium" }).format(new Date(member.created_at))}</td>
                    <td><Link className="auth-link" href="/admin/users">تعديل الصلاحيات</Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
      <p className="admin-note">ملاحظة: دي إدارة وصول حسابات البوابة، وليست ملف HR وظيفي كامل. بيانات التعيين والمرتبات والحضور هتكون في وحدة HR مستقلة لاحقًا.</p>
    </main>
  );
}
