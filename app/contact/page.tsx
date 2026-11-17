import Link from "next/link";
import ContactRequestForm from "./contact-request-form";
import LanguageSwitcher from "@/components/language-switcher";

export default function ContactPage() {
  return (
    <main>
      <header className="site-header">
        <div className="container nav">
          <Link className="brand" href="/"><span className="brand-mark">AHT</span><span>ALI HANY TECHNOLOGY</span></Link>
          <nav className="nav-links" aria-label="Main navigation">
            <Link href="/services"><span data-locale="en">Services</span><span data-locale="ar">الخدمات</span></Link><Link href="/about"><span data-locale="en">About</span><span data-locale="ar">عن AHT</span></Link><Link href="/"><span data-locale="en">Home</span><span data-locale="ar">الرئيسية</span></Link>
          </nav>
          <LanguageSwitcher /> <Link className="button-secondary" href="/login"><span data-locale="en">Client Portal</span><span data-locale="ar">بوابة العملاء</span></Link>
          <a className="nav-cta" href="https://bit.ly/m/AliHanySys" target="_blank" rel="noreferrer"><span data-locale="en">WhatsApp</span><span data-locale="ar">واتساب</span> ↗</a>
        </div>
      </header>
      <section className="hero" data-locale="en">
        <div className="container">
          <span className="eyebrow">CONTACT AHT</span>
          <h1>Let’s talk about <span className="gradient-text">your business.</span></h1>
          <p className="hero-copy">Tell us what you want to organize, improve, or solve. We’ll review your request and follow up to understand the right next step.</p>
        </div>
      </section>
      <section className="hero" lang="ar" dir="rtl" data-locale="ar">
        <div className="container"><span className="eyebrow">تواصل مع AHT</span><h1>خلّينا نتكلم عن <span className="gradient-text">شغلك.</span></h1><p className="hero-copy">احكيلنا إيه اللي محتاج تنظمه أو تطوره أو تحله، وهنراجع طلبك ونحدد معاك الخطوة المناسبة.</p></div>
      </section>
      <section className="section">
        <div className="container split">
          <div className="split-copy" data-locale="en">
            <span className="eyebrow">CONTACT AHT</span>
            <h2>Tell us what your business needs.</h2>
            <p>Share a little about the challenge. We will review your request and follow up about the most practical next step.</p>
            <div className="principles">
              <div className="principle"><strong>Business systems & ERP</strong><span>Systems improvement, operations, and business data.</span></div>
              <div className="principle"><strong>IT & technical support</strong><span>Devices, networks, servers, and technical support.</span></div>
              <div className="principle"><strong>Networking & surveillance</strong><span>Business networks, CCTV, and technical infrastructure.</span></div>
            </div>
            <p><a className="auth-link" href="https://bit.ly/m/AliHanySys" target="_blank" rel="noreferrer">Or contact us directly on WhatsApp ↗</a></p>
          </div>
          <div className="split-copy" data-locale="ar">
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
      <footer className="footer"><div className="container footer-inner"><span>© {new Date().getFullYear()} AHT — Ali Hany Technology</span><span data-locale="en">Business Systems & IT Solutions</span><span data-locale="ar" lang="ar">أنظمة الأعمال وحلول تكنولوجيا المعلومات</span></div></footer>
    </main>
  );
}
