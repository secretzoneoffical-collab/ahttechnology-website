import Link from "next/link";

export default function NotFound() {
  return (
    <main className="auth-page">
      <section className="auth-card" style={{ textAlign: "center" }}>
        <span className="brand-mark" style={{ margin: "0 auto 24px" }}>AHT</span>
        <span className="eyebrow">404 — PAGE NOT FOUND</span>
        <h1>الصفحة غير موجودة</h1>
        <p className="auth-muted">الرابط اللي بتحاول تفتحه غير متاح أو اتنقل لمكان تاني.</p>
        <Link className="button-primary" href="/">العودة للرئيسية</Link>
      </section>
    </main>
  );
}
