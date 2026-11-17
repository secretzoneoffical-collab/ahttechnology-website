import Link from "next/link";
import LanguageSwitcher from "@/components/language-switcher";
const services = [
  { number: "01", title: "Business Systems Audit", description: "Review workflows, identify gaps, and build a practical improvement plan." },
  { number: "02", title: "POS / ERP Setup & Optimization", description: "Configure and improve the systems that support your daily business operations." },
  { number: "03", title: "Systems Integration", description: "Connect business tools and organize the flow of information." },
  { number: "04", title: "Business Automation", description: "Reduce repetitive tasks with suitable, maintainable automation." },
  { number: "05", title: "Inventory & Operations Management", description: "Improve stock visibility, purchasing routines, and operational control." },
  { number: "06", title: "IT Operations & Technical Solutions", description: "Support devices, servers, file sharing, user accounts, and backups." },
  { number: "07", title: "Technical Support & Troubleshooting", description: "Diagnose technical issues and help keep essential systems running." },
  { number: "08", title: "Networking & CCTV Solutions", description: "Plan and support business networks and surveillance systems." }
];

export default function HomePage() {
  return (
    <main>
      <header className="site-header">
        <div className="container nav">
          <a className="brand" href="#home" aria-label="AHT home">
            <span className="brand-mark">AHT</span>
            <span>ALI HANY TECHNOLOGY</span>
          </a>
          <nav className="nav-links" aria-label="Main navigation">
            <Link href="/services">Services</Link>
            <Link href="/about">About</Link>
            <Link href="/contact">Contact</Link>
            <LanguageSwitcher />
          </nav>
          <div className="hero-actions" style={{ marginTop: 0 }}><Link className="button-secondary" href="/login">Client Portal</Link><Link className="nav-cta" href="/contact">Let’s Talk <span aria-hidden="true">↗</span></Link></div>
        </div>
      </header>

      <section className="hero" id="home" data-locale="en">
        <div className="container hero-grid">
          <div>
            <span className="eyebrow">BUSINESS SYSTEMS & IT SOLUTIONS</span>
            <h1>Make your business work <span className="gradient-text">smarter.</span></h1>
            <p className="hero-copy">
              We help businesses organize their systems, operations, and data —
              turning everyday challenges into practical technology solutions.
            </p>
            <div className="hero-actions">
              <Link className="button-primary" href="/contact">Discuss your project <span aria-hidden="true">↗</span></Link>
              <Link className="button-secondary" href="/services">Explore services</Link>
            </div>
          </div>

          <aside className="hero-panel" aria-label="AHT capabilities">
            <div className="panel-top"><span>THE AHT APPROACH</span><span><i className="status-dot" /> PRACTICAL BY DESIGN</span></div>
            <h2 className="panel-title">Technology with a business purpose.</h2>
            <p className="panel-subtitle">The right systems should make work clearer, faster, and easier to manage.</p>
            <div className="signal-list">
              <div className="signal"><span className="signal-icon">⌘</span><div><strong>Connected systems</strong><small>Less fragmentation. Better visibility.</small></div></div>
              <div className="signal"><span className="signal-icon">▦</span><div><strong>Organized operations</strong><small>Processes that support real work.</small></div></div>
              <div className="signal"><span className="signal-icon">↗</span><div><strong>Useful business data</strong><small>Clearer information for better decisions.</small></div></div>
            </div>
          </aside>
        </div>
      </section>

      <section className="hero" lang="ar" dir="rtl" data-locale="ar">
        <div className="container hero-grid">
          <div>
            <span className="eyebrow">أنظمة الأعمال وحلول تكنولوجيا المعلومات</span>
            <h1>خلّي شغلك يشتغل <span className="gradient-text">بشكل أذكى.</span></h1>
            <p className="hero-copy">بنساعد الشركات تنظم الأنظمة والتشغيل والبيانات، ونحوّل تحديات الشغل اليومية لحلول تكنولوجية عملية تناسب احتياجاتها وإمكانياتها.</p>
            <div className="hero-actions">
              <Link className="button-primary" href="/contact">ناقش مشروعك <span aria-hidden="true">↗</span></Link>
              <Link className="button-secondary" href="/services">استكشف الخدمات</Link>
            </div>
          </div>
          <aside className="hero-panel">
            <div className="panel-top"><span>منهج AHT</span><span><i className="status-dot" /> حلول عملية</span></div>
            <h2 className="panel-title">تكنولوجيا ليها هدف في شغلك.</h2>
            <p className="panel-subtitle">الأنظمة الصح بتخلي الشغل أوضح وأسهل في الإدارة والمتابعة.</p>
            <div className="signal-list">
              <div className="signal"><span className="signal-icon">⌘</span><div><strong>أنظمة مترابطة</strong><small>تقليل التشتت وتحسين الرؤية.</small></div></div>
              <div className="signal"><span className="signal-icon">▦</span><div><strong>تشغيل منظم</strong><small>إجراءات تدعم الشغل اليومي.</small></div></div>
              <div className="signal"><span className="signal-icon">↗</span><div><strong>بيانات مفيدة</strong><small>معلومات أوضح لاتخاذ القرار.</small></div></div>
            </div>
          </aside>
        </div>
      </section>
      <section className="section" id="services" data-locale="en">
        <div className="container">
          <div className="section-heading">
            <span className="eyebrow">WHAT WE DO</span>
            <h2>Practical solutions for the way business works.</h2>
            <p>From reviewing existing systems to improving daily operations, AHT focuses on solutions that fit the business — not technology for its own sake.</p>
          </div>
          <div className="service-grid">
            {services.map((service) => (
              <article className="service-card" key={service.number}>
                <span className="service-number">{service.number} / AHT</span>
                <h3>{service.title}</h3>
                <p>{service.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section" id="about" data-locale="en">
        <div className="container split">
          <div className="split-copy">
            <span className="eyebrow">ABOUT AHT</span>
            <h2>Technology should solve a business problem.</h2>
            <p>
              AHT — Ali Hany Technology — brings business thinking and technical
              know-how together. We look at the process first, understand the
              challenge, then recommend a practical path forward.
            </p>
          </div>
          <div className="principles">
            <div className="principle"><strong>Understand before implementing</strong><span>Start with the business need, existing workflow, and real constraints.</span></div>
            <div className="principle"><strong>Keep it practical</strong><span>Choose tools and improvements that make sense for the team and budget.</span></div>
            <div className="principle"><strong>Build for continuity</strong><span>Prioritize clarity, maintainability, and solutions that can grow over time.</span></div>
          </div>
        </div>
      </section>

      <section className="section" id="contact" data-locale="en">
        <div className="container">
          <div className="contact-band">
            <div>
              <h2>Let’s solve the right problem.</h2>
              <p>Tell us what is slowing your business down. We’ll start with the challenge and work toward a practical solution.</p>
            </div>
            <a className="button-primary" href="https://bit.ly/m/AliHanySys" target="_blank" rel="noreferrer">Contact AHT <span aria-hidden="true">↗</span></a>
          </div>
        </div>
      </section>

      <section className="section" id="arabic" lang="ar" dir="rtl">
        <div className="container">
          <div className="section-heading">
            <span className="eyebrow">علي هاني تكنولوجي</span>
            <h2>نساعد أعمالك تشتغل بشكل أذكى.</h2>
            <p>بنساعد الشركات تنظم الأنظمة والتشغيل والبيانات، ونحوّل مشاكل الشغل اليومية لحلول تكنولوجية عملية تناسب احتياجاتها وإمكانياتها.</p>
          </div>
          <div className="service-grid">
            <article className="service-card"><span className="service-number">01 / AHT</span><h3>مراجعة أنظمة الأعمال</h3><p>فهم طريقة الشغل الحالية وتحديد المشاكل وفرص التحسين.</p></article>
            <article className="service-card"><span className="service-number">02 / AHT</span><h3>تجهيز وتطوير POS و ERP</h3><p>تجهيز وتطوير أنظمة البيع والإدارة والحسابات.</p></article>
            <article className="service-card"><span className="service-number">03 / AHT</span><h3>ربط الأنظمة</h3><p>تنظيم تدفق البيانات وربط الأدوات والأنظمة المختلفة.</p></article>
            <article className="service-card"><span className="service-number">04 / AHT</span><h3>أتمتة الأعمال</h3><p>تقليل المهام المتكررة بأدوات أتمتة مناسبة.</p></article>
            <article className="service-card"><span className="service-number">05 / AHT</span><h3>إدارة المخزون والتشغيل</h3><p>تحسين متابعة المخزون والمشتريات والعمليات اليومية.</p></article>
            <article className="service-card"><span className="service-number">06 / AHT</span><h3>تشغيل IT والحلول التقنية</h3><p>دعم الأجهزة والسيرفرات والمستخدمين والنسخ الاحتياطي.</p></article>
            <article className="service-card"><span className="service-number">07 / AHT</span><h3>الدعم الفني وحل المشكلات</h3><p>تشخيص الأعطال ومعالجتها لضمان استمرارية التشغيل.</p></article>
            <article className="service-card"><span className="service-number">08 / AHT</span><h3>الشبكات وأنظمة المراقبة</h3><p>حلول الشبكات وكاميرات المراقبة والبنية التقنية.</p></article>
          </div>
        </div>
      </section>

      <section className="section" lang="ar" dir="rtl" data-locale="ar">
        <div className="container split">
          <div className="split-copy"><span className="eyebrow">عن AHT</span><h2>التكنولوجيا لازم تحل مشكلة حقيقية في الشغل.</h2><p>علي هاني تكنولوجي AHT بتجمع بين فهم الأعمال والخبرة التقنية. بنفهم طريقة التشغيل والتحديات الأول، وبعدها بنقترح مسار عملي مناسب للنشاط.</p></div>
          <div className="principles">
            <div className="principle"><strong>نفهم قبل التنفيذ</strong><span>نبدأ باحتياج النشاط وطريقة العمل والقيود الموجودة.</span></div>
            <div className="principle"><strong>نختار العملي</strong><span>حلول وأدوات مناسبة للفريق والميزانية.</span></div>
            <div className="principle"><strong>نهتم باستمرارية الشغل</strong><span>وضوح وتوثيق وسهولة الصيانة والتطوير.</span></div>
          </div>
        </div>
      </section>
      <section className="section" lang="ar" dir="rtl" data-locale="ar">
        <div className="container"><div className="contact-band"><div><h2>خلّينا نحل المشكلة الصح.</h2><p>احكيلنا إيه اللي محتاج يتنظم أو يتحسن في شغلك، ونبدأ بتحديد خطوة عملية مناسبة.</p></div><Link className="button-primary" href="/contact">تواصل مع AHT ↗</Link></div></div>
      </section>
      <footer className="footer">
        <div className="container footer-inner">
          <span>© {new Date().getFullYear()} AHT — Ali Hany Technology</span>
          <span data-locale="en">Business Systems & IT Solutions</span><span data-locale="ar" lang="ar">أنظمة الأعمال وحلول تكنولوجيا المعلومات</span>
        </div>
      </footer>
    </main>
  );
}
