import ContactRequestForm from "./contact-request-form";

export default function ContactPage() {
  return (
    <main>
      <header className="site-header">
        <div className="container nav">
          <a className="brand" href="/"><span className="brand-mark">AHT</span><span>ALI HANY TECHNOLOGY</span></a>
          <nav className="nav-links" aria-label="Main navigation">
            <a href="/services">Services</a><a href="/about">About</a><a href="/">Home</a>
          </nav>
          <a className="nav-cta" href="https://bit.ly/m/AliHanySys" target="_blank" rel="noreferrer">WhatsApp ↗</a>
        </div>
      </header>
      <section className="hero">
        <div className="container">
          <span className="eyebrow">CONTACT AHT</span>
          <h1>Let’s talk about <span className="gradient-text">your business.</span></h1>
          <p className="hero-copy">Tell us what you want to organize, improve, or solve. We’ll review your request and follow up to understand the right next step.</p>
        </div>
      </section>
      <section className="section" lang="ar" dir="rtl">
        <div className="container split">
          <div className="split-copy">
            <span className="eyebrow">تواصل مع AHT</span>
            <h2>احكيلنا عن احتياج شغلك.</h2>
            <p>املأ البيانات دي وهنراجع طلبك ونتواصل معاك لمناقشة التفاصيل والخطوة المناسبة.</p>
            <div className="principles">
              <div className="principle"><strong>أنظمة الأعمال و ERP</strong><span>تطوير الأنظمة وتنظيم العمليات والبيانات.</span></div>
              <div className="principle"><strong>تقنية المعلومات والدعم</strong><span>الأجهزة والشبكات والسيرفرات والدعم الفني.</span></div>
              <div className="principle"><strong>الشبكات وأنظمة المراقبة</strong><span>حلول الشبكات وكاميرات المراقبة والبنية التقنية.</span></div>
            </div>
            <p><a className="auth-link" href="https://bit.ly/m/AliHanySys" target="_blank" rel="noreferrer">أو تواصل معنا مباشرة عبر واتساب ↗</a></p>
          </div>
          <div className="auth-card contact-form-card">
            <ContactRequestForm />
          </div>
        </div>
      </section>
      <footer className="footer"><div className="container footer-inner"><span>© {new Date().getFullYear()} AHT — Ali Hany Technology</span><span>Business Systems & IT Solutions</span></div></footer>
    </main>
  );
}
