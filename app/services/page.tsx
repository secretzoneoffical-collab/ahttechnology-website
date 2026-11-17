const services = [
  ["01","Business Systems Audit","Review current workflows, software, data, and operational gaps. Receive a practical assessment and prioritized improvement roadmap.","مراجعة أنظمة الأعمال","مراجعة طريقة التشغيل والبرامج والبيانات لتحديد نقاط الضعف وفرص التحسين ووضع خطة عملية."],
  ["02","POS / ERP Setup & Optimization","Configure and improve point-of-sale and ERP systems around the business workflow, reporting, and user needs.","تجهيز وتطوير أنظمة POS و ERP","تجهيز وتطوير أنظمة البيع والإدارة والحسابات بما يتناسب مع طبيعة التشغيل والتقارير واحتياجات المستخدمين."],
  ["03","Systems Integration","Connect business tools and reduce disconnected data through clear, maintainable integration workflows.","ربط الأنظمة","ربط البرامج والأدوات المختلفة وتنظيم انتقال البيانات بينها بصورة واضحة وقابلة للصيانة."],
  ["04","Business Automation","Identify repetitive tasks and automate suitable workflows after reviewing cost, privacy, and maintenance requirements.","أتمتة الأعمال","تحديد المهام المتكررة وأتمتة ما يناسب منها بعد مراجعة التكلفة والخصوصية ومتطلبات الصيانة."],
  ["05","Inventory & Operations Management","Improve inventory visibility, stock movement, purchasing routines, and day-to-day operational control.","إدارة المخزون والتشغيل","تحسين متابعة المخزون وحركة الأصناف والمشتريات وتنظيم ومراقبة العمليات اليومية."],
  ["06","IT Operations & Technical Solutions","Support business devices, servers, file sharing, user accounts, permissions, and backup planning.","تشغيل IT والحلول التقنية","دعم أجهزة الشركة والسيرفرات ومشاركة الملفات وحسابات المستخدمين والصلاحيات وخطط النسخ الاحتياطي."],
  ["07","Technical Support & Troubleshooting","Diagnose technical issues, restore service, and help teams keep essential systems working reliably.","الدعم الفني وحل المشكلات","تشخيص الأعطال التقنية ومعالجتها ومساعدة فريق العمل على استمرار الأنظمة الأساسية."],
  ["08","Networking & CCTV Solutions","Plan and support business networks, connectivity, surveillance cameras, and related security infrastructure.","الشبكات وأنظمة المراقبة","تصميم وتجهيز ودعم شبكات الشركات والاتصال وكاميرات المراقبة والبنية التحتية المرتبطة بها."]
];

export default function ServicesPage() {
  return (
    <main>
      <header className="site-header"><div className="container nav"><a className="brand" href="/"><span className="brand-mark">AHT</span><span>ALI HANY TECHNOLOGY</span></a><nav className="nav-links"><a href="/">Home</a><a href="/about">About</a><a href="/contact">Contact</a><a href="#arabic" lang="ar">العربية</a></nav><a className="nav-cta" href="/contact">Discuss a project ↗</a></div></header>
      <section className="hero"><div className="container"><span className="eyebrow">AHT SERVICES</span><h1>Technology services built around <span className="gradient-text">your business.</span></h1><p className="hero-copy">A practical range of business systems, operations, IT, and security technology services — starting with understanding what your business actually needs.</p></div></section>
      <section className="section"><div className="container"><div className="service-grid">{services.map(([number,title,description])=><article className="service-card" key={number}><span className="service-number">{number} / AHT</span><h2>{title}</h2><p>{description}</p></article>)}</div></div></section>
      <section className="section" id="arabic" lang="ar" dir="rtl"><div className="container"><div className="section-heading"><span className="eyebrow">خدمات AHT</span><h2>حلول تكنولوجية تبدأ من احتياج شغلك.</h2><p>بنقدم خدمات متكاملة في أنظمة الأعمال والتشغيل وتقنية المعلومات، مع التركيز على الحل العملي المناسب لطبيعة كل نشاط.</p></div><div className="service-grid">{services.map(([number,, ,arTitle,arDescription])=><article className="service-card" key={number}><span className="service-number">{number} / AHT</span><h2>{arTitle}</h2><p>{arDescription}</p></article>)}</div></div></section>
      <section className="section"><div className="container"><div className="contact-band"><div><h2>Not sure what your business needs?</h2><p>Start with the challenge. We’ll help define a practical next step.</p></div><a className="button-primary" href="/contact">Talk to AHT ↗</a></div></div></section>
      <footer className="footer"><div className="container footer-inner"><span>© {new Date().getFullYear()} AHT — Ali Hany Technology</span><span>Business Systems & IT Solutions</span></div></footer>
    </main>
  );
}
