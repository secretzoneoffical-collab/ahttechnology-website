import Link from "next/link";
import { requireAdmin } from "@/lib/auth/require-admin";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children
}: Readonly<{ children: React.ReactNode }>) {
  const { profile } = await requireAdmin();

  return (
    <div className="admin-shell" dir="rtl">
      <aside className="admin-sidebar">
        <Link className="auth-brand" href="/">AHT <span>ADMIN</span></Link>
        <p className="admin-caption">لوحة الإدارة</p>
        <nav className="admin-nav" aria-label="قائمة الإدارة">
          <Link href="/admin">نظرة عامة</Link>
          <Link href="/admin/users">المستخدمون</Link>
          <Link href="/admin/requests">طلبات الخدمات</Link>
          <Link href="/admin/customers">إدارة العملاء</Link>
          <Link href="/dashboard">بوابة العميل</Link>
          <Link href="/">الموقع الرئيسي</Link>
        </nav>
        <div className="admin-sidebar-user">
          <strong>{profile.full_name || "مدير النظام"}</strong>
          <span>Administrator</span>
        </div>
      </aside>
      <div className="admin-main">
        <header className="admin-topbar">
          <span>إدارة AHT</span>
          <form action="/auth/signout" method="post">
            <button className="button-secondary" type="submit">تسجيل الخروج</button>
          </form>
        </header>
        {children}
      </div>
    </div>
  );
}
