import Link from "next/link";
import { requireAdmin } from "@/lib/auth/require-admin";
import { createCustomerFromRequest } from "../customers/actions";
import { updateServiceRequest } from "./actions";

export const dynamic = "force-dynamic";

const statusLabels: Record<string, string> = {
  new: "جديد",
  contacted: "تم التواصل",
  qualified: "مؤهل",
  closed: "مغلق",
  spam: "غير مرغوب"
};

export default async function AdminRequestsPage({ searchParams }: { searchParams: Promise<{ updated?: string }> }) {
  const params = await searchParams;
  const { supabase } = await requireAdmin();
  const { data: requests, error } = await supabase
    .from("service_requests")
    .select("id, full_name, email, phone, company, service_type, message, status, admin_notes, last_contacted_at, customer_id, created_at")
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
        {params.updated === "1" && <p className="auth-success" role="status">تم تحديث الطلب بنجاح.</p>}
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
              <thead><tr><th>العميل</th><th>التواصل</th><th>الخدمة</th><th>تحديث المتابعة</th><th>التاريخ</th><th>التفاصيل</th></tr></thead>
              <tbody>
                {requests.map((request) => (
                  <tr key={request.id}>
                    <td>{request.full_name}<small className="admin-cell-sub">{request.company || "فرد"}</small>{request.customer_id ? <Link className="auth-link admin-customer-link" href={`/admin/customers/${request.customer_id}`}>ملف العميل</Link> : <form action={createCustomerFromRequest}><input type="hidden" name="request_id" value={request.id} /><button className="admin-text-button" type="submit">إنشاء ملف عميل</button></form>}</td>
                    <td><a href={`mailto:${request.email}`}>{request.email}</a><small className="admin-cell-sub" dir="ltr">{request.phone}</small></td>
                    <td>{request.service_type}</td>
                    <td>
                      <form action={updateServiceRequest} className="admin-request-update">
                        <input type="hidden" name="request_id" value={request.id} />
                        <label className="sr-only" htmlFor={`status-${request.id}`}>حالة الطلب</label>
                        <select id={`status-${request.id}`} name="status" defaultValue={request.status}>
                          {Object.entries(statusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                        </select>
                        <label className="sr-only" htmlFor={`notes-${request.id}`}>ملاحظات المتابعة</label>
                        <textarea id={`notes-${request.id}`} name="admin_notes" rows={2} maxLength={3000} defaultValue={request.admin_notes || ""} placeholder="ملاحظات المتابعة (اختياري)" />
                        <button className="button-primary" type="submit">حفظ التحديث</button>
                        {request.last_contacted_at && <small className="admin-cell-sub">آخر تواصل: {new Intl.DateTimeFormat("ar-EG", { dateStyle: "medium", timeStyle: "short" }).format(new Date(request.last_contacted_at))}</small>}
                      </form>
                    </td>
                    <td>{new Intl.DateTimeFormat("ar-EG", { dateStyle: "medium" }).format(new Date(request.created_at))}</td>
                    <td className="admin-message-cell">{request.message}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
      <p className="admin-note">تغيير الحالة والملاحظات متاحان للمسؤولين النشطين فقط. عند اختيار «تم التواصل» أو «مؤهل» يتم تسجيل وقت المتابعة.</p>
    </main>
  );
}
