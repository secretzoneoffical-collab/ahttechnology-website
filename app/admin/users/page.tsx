import Link from "next/link";
import { requireAdmin } from "@/lib/auth/require-admin";
import { updateUserAccess } from "./actions";

export const dynamic = "force-dynamic";

const roleLabels: Record<string, string> = {
  admin: "مدير النظام",
  staff: "موظف",
  customer: "عميل"
};
const statusLabels: Record<string, string> = {
  active: "نشط",
  suspended: "موقوف"
};

export default async function AdminUsersPage({
  searchParams
}: {
  searchParams: Promise<{ updated?: string }>;
}) {
  const query = await searchParams;
  const { supabase, user } = await requireAdmin();
  const { data: profiles, error } = await supabase
    .from("profiles")
    .select("id, full_name, role, status, created_at")
    .order("created_at", { ascending: false })
    .limit(100);

  return (
    <main className="admin-content">
      <div className="admin-page-heading">
        <div>
          <span className="eyebrow">USER & ACCESS MANAGEMENT</span>
          <h1>المستخدمون والصلاحيات</h1>
          <p>إدارة وصول الحسابات الحالية وتحديد حسابات فريق العمل.</p>
        </div>
        <div className="admin-heading-actions">
          <span className="admin-count">{profiles?.length ?? 0} حساب</span>
          <Link className="button-secondary" href="/admin/team">عرض فريق العمل</Link>
        </div>
      </div>

      {query.updated === "1" && <p className="auth-success" role="status">تم تحديث صلاحيات الحساب بنجاح.</p>}

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
              <thead><tr><th>الاسم</th><th>الدور الحالي</th><th>الحالة</th><th>تاريخ الإنشاء</th><th>إدارة الوصول</th></tr></thead>
              <tbody>
                {profiles.map((item) => (
                  <tr key={item.id}>
                    <td>{item.full_name || "بدون اسم"}{item.id === user.id && <small className="admin-cell-sub">حسابك الحالي</small>}</td>
                    <td><span className="admin-role">{roleLabels[item.role] || item.role}</span></td>
                    <td><span className={item.status === "active" ? "admin-status active" : "admin-status suspended"}>{statusLabels[item.status] || item.status}</span></td>
                    <td>{new Intl.DateTimeFormat("ar-EG", { dateStyle: "medium" }).format(new Date(item.created_at))}</td>
                    <td>
                      {item.role === "admin" ? (
                        <span className="admin-readonly">حساب إدارة محمي</span>
                      ) : item.id === user.id ? (
                        <span className="admin-readonly">لا يمكن تعديل حسابك</span>
                      ) : (
                        <form action={updateUserAccess} className="admin-user-access-form">
                          <input type="hidden" name="user_id" value={item.id} />
                          <select name="role" aria-label={`دور ${item.full_name || "المستخدم"}`} defaultValue={item.role}>
                            <option value="customer">عميل</option>
                            <option value="staff">موظف</option>
                          </select>
                          <select name="status" aria-label={`حالة ${item.full_name || "المستخدم"}`} defaultValue={item.status}>
                            <option value="active">نشط</option>
                            <option value="suspended">موقوف</option>
                          </select>
                          <button type="submit" className="button-primary">حفظ</button>
                        </form>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
      <p className="admin-note">يمكن تعيين الحسابات الحالية كموظفين أو عملاء وإيقافها أو تفعيلها. لا يمكن إنشاء أو ترقية حساب Admin من هذه الصفحة، كما لا يمكن تعديل حساب الإدارة الحالي.</p>
    </main>
  );
}
