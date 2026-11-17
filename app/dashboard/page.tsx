import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();

  if (error || !data?.claims?.sub) {
    redirect("/login?next=/dashboard");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role, status")
    .eq("id", data.claims.sub)
    .maybeSingle();

  if (!profile) {\n    redirect("/login?message=account-unavailable");\n  }\n\n  if (profile.status === "suspended") {
    return (
      <main className="auth-page" dir="rtl">
        <section className="auth-card">
          <h1>الحساب موقوف</h1>
          <p className="auth-muted">يرجى التواصل مع فريق AHT للمساعدة.</p>
        </section>
      </main>
    );
  }

  return (
    <main className="dashboard-page" dir="rtl">
      <header className="dashboard-header">
        <Link className="auth-brand" href="/">AHT <span>ALI HANY TECHNOLOGY</span></Link>
        <form action="/auth/signout" method="post"><button className="button-secondary" type="submit">تسجيل الخروج</button></form>
      </header>
      <section className="dashboard-content">
        <span className="eyebrow">AHT CUSTOMER PORTAL</span>
        <h1>أهلاً {profile?.full_name || "بك"} 👋</h1>
        <p className="auth-muted">تم تسجيل الدخول بنجاح. دي مساحة حسابك على AHT.</p>\n        {profile?.role === "admin" && <p><Link className="button-primary" href="/admin">فتح لوحة الإدارة</Link></p>}
        <div className="dashboard-placeholder">
          <strong>مساحة العمل الخاصة بك</strong>
          <span>حالة الحساب: {profile?.status || "بانتظار إعداد الملف الشخصي"}</span>
          <span>نوع الحساب: {profile?.role || "customer"}</span>
        </div>
      </section>
    </main>
  );
}
