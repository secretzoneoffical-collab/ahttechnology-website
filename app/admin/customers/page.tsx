import Link from "next/link";
import { requireAdmin } from "@/lib/auth/require-admin";

export const dynamic = "force-dynamic";

const statusLabels: Record<string, string> = {
  prospect: "عميل محتمل",
  active: "عميل نشط",
  inactive: "غير نشط"
};

export default async function AdminCustomersPage() {
  const { supabase } = await requireAdmin();
  const { data: customers, error } = await supabase
    .from("customers")
    .select("id, customer_type, full_name, company_name, email, phone, status, created_at")
    .order("created_at", { ascending: false })
    .limit(200);

  return (
    <main className="admin-content">
      <div className="admin-page-heading">
        <div>
          <span className="eyebrow">CUSTOMER RELATIONSHIP MANAGEMENT</span>
          <h1>إدارة العملاء</h1>
          <p>ملفات العملاء وسجل التواصل المرتبط بطلبات الخدمات.</p>
        </div>
        <span className="admin-count">{customers?.length ?? 0} عميل</span>
      </div>
      <section className="admin-panel">
        {error ? (
          <p className="auth-error">تعذر تحميل سجل العملاء. راجع صلاحيات قاعدة البيانات.</p>
        ) : !customers?.length ? (
          <div className="admin-empty">
            <strong>سجل العملاء لسه فاضي</strong>
            <span>تقدر تحول أي طلب وارد إلى ملف عميل من صفحة طلبات الخدمات.</span>
            <Link className="button-primary" href="/admin/requests">فتح طلبات الخدمات</Link>
          </div>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead><tr><th>العميل</th><th>نوع الحساب</th><th>بيانات التواصل</th><th>الحالة</th><th>تاريخ الإضافة</th><th>الملف</th></tr></thead>
              <tbody>
                {customers.map((customer) => (
                  <tr key={customer.id}>
                    <td>{customer.full_name}<small className="admin-cell-sub">{customer.company_name || "—"}</small></td>
                    <td>{customer.customer_type === "company" ? "شركة" : "فرد"}</td>
                    <td><a href={customer.email ? `mailto:${customer.email}` : undefined}>{customer.email || "—"}</a><small className="admin-cell-sub" dir="ltr">{customer.phone}</small></td>
                    <td><span className={customer.status === "active" ? "admin-status active" : "admin-role"}>{statusLabels[customer.status] || customer.status}</span></td>
                    <td>{new Intl.DateTimeFormat("ar-EG", { dateStyle: "medium" }).format(new Date(customer.created_at))}</td>
                    <td><Link className="auth-link" href={`/admin/customers/${customer.id}`}>فتح الملف ←</Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
      <p className="admin-note">يتم إنشاء ملف العميل من طلب وارد، مع منع تكرار العميل عند تطابق البريد الإلكتروني.</p>
    </main>
  );
}
