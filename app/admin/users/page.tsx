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
  pending: "بانتظار الموافقة",
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
    .select("id, full_name, email, phone, role, status, created_at")
    .order("created_at", { ascending: false })
    .limit(100);

  return (
    <main className="admin-content">
      <div className="admin-page-heading">
        <div>
          <span className="eyebrow">USER & ACCESS MANAGEMENT</span>
          <h1>المستخدمون والصلاحيات</h1>
          <p>مراجعة طلبات الموظفين وإدارة وصول العملاء وفريق العمل.</p>
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
            <span>سيظهر المستخدمون هنا بعد التسجيل من صفحة إنشاء الحساب أو بعد إضافة حساب من الإدارة.</span>
          </div>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead><tr><th>الاسم</th><th>البريد الإلكتروني</th><th>الهاتف</th><th>الدور الحالي</th><th>الحالة</th><th>تاريخ الإنشاء</th><th>إدارة الوصول</th></tr></thead>
              <tbody>
                {profiles.map((item) => (
                  <tr key={item.id}>
                    <td>{item.full_name || "بدون اسم"}{item.id === user.id && <small className="admin-cell-sub">حسابك الحالي</small>}</td>
                    <td>{item.email ? <a href={`mailto:${item.email}`}>{item.email}</a> : "—"}</td>
                    <td dir="ltr">{item.phone || "—"}</td>
                    <td><span className="admin-role">{roleLabels[item.role] || item.role}</span></td>
                    <td><span className={`admin-status ${item.status === "active" ? "active" : item.status === "pending" ? "pending" : "suspended"}`}>{statusLabels[item.status] || item.status}</span></td>
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
                            <option value="pending" disabled={item.role !== "staff"}>بانتظار الموافقة</option>
                            <option value="active">{item.role === "staff" && item.status === "pending" ? "موافقة وتفعيل" : "نشط"}</option>
                            <option value="suspended">إيقاف</option>
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
      <p className="admin-note">طلبات الموظفين الجديدة تظهر بحالة «بانتظار الموافقة». اختر «موافقة وتفعيل» للسماح للموظف بالدخول، أو «إيقاف» لرفض الوصول. حسابات Admin محمية ولا يمكن إنشاؤها أو ترقيتها من هذه الصفحة.</p>
    </main>
  );
}
