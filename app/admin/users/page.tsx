import { requireAdmin } from "@/lib/auth/require-admin";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const { supabase } = await requireAdmin();
  const { data: profiles, error } = await supabase
    .from("profiles")
    .select("id, full_name, role, status, created_at")
    .order("created_at", { ascending: false })
    .limit(100);

  return (
    <main className="admin-content">
      <div className="admin-page-heading">
        <div>
          <span className="eyebrow">USER MANAGEMENT</span>
          <h1>المستخدمون</h1>
          <p>عرض ملفات المستخدمين المسجلة في قاعدة بيانات AHT.</p>
        </div>
        <span className="admin-count">{profiles?.length ?? 0} حساب</span>
      </div>

      <section className="admin-panel">
        {error ? (
          <p className="auth-error">تعذر تحميل المستخدمين. راجع صلاحيات قاعدة البيانات.</p>
        ) : !profiles?.length ? (
          <div className="admin-empty">
            <strong>لا توجد حسابات حتى الآن</strong>
            <span>سيظهر المستخدمون هنا بعد إنشاء حساباتهم من خلال Supabase Auth.</span>
          </div>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead><tr><th>الاسم</th><th>الدور</th><th>الحالة</th><th>تاريخ الإنشاء</th></tr></thead>
              <tbody>
                {profiles.map((item) => (
                  <tr key={item.id}>
                    <td>{item.full_name || "بدون اسم"}</td>
                    <td><span className="admin-role">{item.role}</span></td>
                    <td><span className={item.status === "active" ? "admin-status active" : "admin-status suspended"}>{item.status}</span></td>
                    <td>{new Intl.DateTimeFormat("ar-EG", { dateStyle: "medium" }).format(new Date(item.created_at))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
      <p className="admin-note">ملاحظة أمنية: تغيير الأدوار والحالات غير متاح من الواجهة حاليًا؛ صلاحيات قاعدة البيانات تمنع المستخدم العادي من تعديلها.</p>
    </main>
  );
}
