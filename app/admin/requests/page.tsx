import { requireAdmin } from "@/lib/auth/require-admin";

export const dynamic = "force-dynamic";

const statusLabels: Record<string, string> = {
  new: "جديد",
  contacted: "تم التواصل",
  qualified: "مؤهل",
  closed: "مغلق",
  spam: "غير مرغوب"
};

export default async function AdminRequestsPage() {
  const { supabase } = await requireAdmin();
  const { data: requests, error } = await supabase
    .from("service_requests")
    .select("id, full_name, email, phone, company, service_type, message, status, created_at")
    .order("created_at", { ascending: false })
    .limit(100);

  return (
    <main className="admin-content">
      <div className="admin-page-heading">
        <div>
          <span className="eyebrow">LEAD MANAGEMENT</span>
          <h1>طلبات الخدمات</h1>
          <p>طلبات التواصل الواردة من نموذج الموقع — أحدث 100 طلب.</p>
        </div>
        <span className="admin-count">{requests?.length ?? 0} طلب</span>
      </div>
      <section className="admin-panel">
        {error ? (
          <p className="auth-error">تعذر تحميل الطلبات. راجع إعدادات قاعدة البيانات والصلاحيات.</p>
        ) : !requests?.length ? (
          <div className="admin-empty">
            <strong>لسه مفيش طلبات</strong>
            <span>أي طلب جديد من نموذج التواصل هيظهر هنا.</span>
          </div>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead><tr><th>العميل</th><th>التواصل</th><th>الخدمة</th><th>الحالة</th><th>التاريخ</th><th>التفاصيل</th></tr></thead>
              <tbody>
                {requests.map((request) => (
                  <tr key={request.id}>
                    <td>{request.full_name}<small className="admin-cell-sub">{request.company || "فرد"}</small></td>
                    <td><a href={`mailto:${request.email}`}>{request.email}</a><small className="admin-cell-sub" dir="ltr">{request.phone}</small></td>
                    <td>{request.service_type}</td>
                    <td><span className={request.status === "new" ? "admin-status active" : "admin-role"}>{statusLabels[request.status] || request.status}</span></td>
                    <td>{new Intl.DateTimeFormat("ar-EG", { dateStyle: "medium" }).format(new Date(request.created_at))}</td>
                    <td className="admin-message-cell">{request.message}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
      <p className="admin-note">الطلبات متاحة للقراءة داخل لوحة الإدارة فقط. تحديث الحالة وإجراءات المتابعة هنضيفها في المرحلة التالية.</p>
    </main>
  );
}
