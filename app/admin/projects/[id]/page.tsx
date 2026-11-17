import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth/require-admin";
import { createProjectTask, createProjectUpdate, createProjectStage, updateProjectProgress, assignProjectStaff, removeProjectStaff, uploadProjectFile, updateProjectStage, updateProjectTask, updateProjectDetails, updateProjectFileVisibility } from "../actions";

export const dynamic = "force-dynamic";

export default async function AdminProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase } = await requireAdmin();
  const [{ data: project, error }, { data: tasks }, { data: updates }, { data: stages }, { data: team }, { data: staffOptions }, { data: files }] = await Promise.all([
    supabase.from("projects").select("id, project_code, name, description, status, progress_percent, start_date, due_date, customers(full_name, company_name)").eq("id", id).maybeSingle(),
    supabase.from("project_tasks").select("id, title, description, status, priority, due_date, customer_visible, assigned_to").eq("project_id", id).order("created_at", { ascending: false }),
    supabase.from("project_updates").select("id, title, body, customer_visible, created_at").eq("project_id", id).order("created_at", { ascending: false }),
    supabase.from("project_stages").select("id, name, status, progress_percent, sort_order, customer_visible").eq("project_id", id).order("sort_order"),
    supabase.from("project_team").select("user_id").eq("project_id", id),
    supabase.from("profiles").select("id, full_name").eq("role", "staff").eq("status", "active").order("full_name"),
    supabase.from("project_files").select("id, file_name, storage_path, customer_visible, created_at").eq("project_id", id).order("created_at", {ascending:false})
  ]);
  if (error || !project) notFound();
  const customer = Array.isArray(project.customers) ? project.customers[0] : project.customers;

  return (
    <main className="admin-content">
      <div className="admin-page-heading"><div><Link className="auth-link" href="/admin/projects">← كل المشاريع</Link><span className="eyebrow">PROJECT DETAILS · {project.project_code}</span><h1>{project.name}</h1><p>{customer?.company_name || customer?.full_name || "عميل غير محدد"}</p></div><span className="admin-count">{project.progress_percent}% إنجاز</span></div>
      <section className="admin-panel project-summary">
        <div className="admin-panel-heading"><h2>بيانات المشروع</h2><p>تعديل الاسم والوصف والتواريخ.</p></div>
        <form action={updateProjectDetails} className="project-create-form">
          <input type="hidden" name="project_id" value={id}/>
          <label>اسم المشروع<input name="name" required maxLength={160} defaultValue={project.name}/></label>
          <label>الوصف<textarea name="description" rows={3} maxLength={5000} defaultValue={project.description || ""}/></label>
          <div className="project-date-fields"><label>تاريخ البداية<input type="date" name="start_date" defaultValue={project.start_date || ""}/></label><label>موعد التسليم<input type="date" name="due_date" defaultValue={project.due_date || ""}/></label></div>
          <button className="button-secondary" type="submit">حفظ بيانات المشروع</button>
        </form>
        <form action={updateProjectProgress} className="project-progress-form"><input type="hidden" name="project_id" value={id}/><label>حالة المشروع<select name="status" defaultValue={project.status}><option value="planned">مخطط</option><option value="active">قيد التنفيذ</option><option value="on_hold">متوقف مؤقتًا</option><option value="completed">مكتمل</option><option value="cancelled">ملغي</option></select></label><label>نسبة الإنجاز %<input name="progress_percent" type="number" min="0" max="100" defaultValue={project.progress_percent} required/></label><button className="button-primary" type="submit">حفظ التقدم</button></form>
        <div className="project-progress large"><span>{project.progress_percent}%</span><i><b style={{width: project.progress_percent + "%"}} /></i></div>
        <p>{project.description || "لا يوجد وصف للمشروع."}</p>
        <div className="project-meta"><span>الحالة: {project.status}</span><span>البداية: {project.start_date || "—"}</span><span>التسليم: {project.due_date || "—"}</span></div>
      </section>
      <section className="admin-panel project-team-panel"><div className="admin-panel-heading"><h2>فريق المشروع</h2><p>إسناد المشروع إلى الموظفين النشطين.</p></div><form action={assignProjectStaff} className="project-create-form project-team-form"><input type="hidden" name="project_id" value={id}/><label>اختيار موظف<select name="user_id" required defaultValue=""><option value="" disabled>اختر موظفًا</option>{staffOptions?.filter(s=>!team?.some(t=>t.user_id===s.id)).map(s=><option key={s.id} value={s.id}>{s.full_name || s.id}</option>)}</select></label><button className="button-primary" type="submit">إسناد للمشروع</button></form><div className="project-team-list">{team?.map(member=><div key={member.user_id}><span>{staffOptions?.find(s=>s.id===member.user_id)?.full_name || member.user_id}</span><form action={removeProjectStaff}><input type="hidden" name="project_id" value={id}/><input type="hidden" name="user_id" value={member.user_id}/><button className="admin-text-button" type="submit">إزالة</button></form></div>)}</div></section>
      <div className="project-detail-columns">
        <section className="admin-panel">
          <div className="admin-panel-heading"><h2>المهام</h2><p>أضف المهام وحدد ما يمكن للعميل رؤيته.</p></div>
          <form action={createProjectTask} className="project-create-form">
            <input type="hidden" name="project_id" value={id} />
            <label>عنوان المهمة<input name="title" required maxLength={180} /></label>
            <label>التفاصيل<textarea name="description" rows={2} maxLength={3000} /></label>
            <label>موعد التنفيذ<input type="date" name="due_date" /></label>\n            <label>إسناد المهمة لموظف<select name="assigned_to" defaultValue=""><option value="">بدون إسناد</option>{team?.map(member=>{const staff=staffOptions?.find(s=>s.id===member.user_id);return staff?<option key={staff.id} value={staff.id}>{staff.full_name || staff.id}</option>:null;})}</select></label>
            <label className="project-check"><input type="checkbox" name="customer_visible" /> ظاهرة للعميل</label>
            <button className="button-primary" type="submit">إضافة مهمة</button>
          </form>
          <div className="project-record-list">{tasks?.map(t => <article key={t.id}><strong>{t.title}</strong><span>{t.due_date || "بدون موعد"} · {t.customer_visible ? "ظاهرة للعميل" : "داخلية"}</span>{t.description && <p>{t.description}</p>}<form action={updateProjectTask} className="project-inline-form"><input type="hidden" name="project_id" value={id}/><input type="hidden" name="task_id" value={t.id}/><select name="status" defaultValue={t.status}><option value="todo">لم تبدأ</option><option value="in_progress">قيد التنفيذ</option><option value="blocked">متوقفة</option><option value="done">مكتملة</option><option value="cancelled">ملغاة</option></select><select name="priority" defaultValue={t.priority}><option value="low">منخفضة</option><option value="normal">عادية</option><option value="high">عالية</option><option value="urgent">عاجلة</option></select><label className="project-check"><input type="checkbox" name="customer_visible" defaultChecked={t.customer_visible}/> ظاهرة للعميل</label><select name="assigned_to" defaultValue={t.assigned_to || ""}><option value="">بدون إسناد</option>{team?.map(member=>{const staff=staffOptions?.find(s=>s.id===member.user_id);return staff?<option key={staff.id} value={staff.id}>{staff.full_name || staff.id}</option>:null;})}</select><button className="button-secondary" type="submit">حفظ المهمة</button></form></article>)}{!tasks?.length && <p className="admin-note">لا توجد مهام.</p>}</div>
        </section>
        <section className="admin-panel">
          <div className="admin-panel-heading"><h2>تحديثات المشروع</h2><p>انشر تحديثًا داخليًا أو للعميل.</p></div>
          <form action={createProjectUpdate} className="project-create-form">
            <input type="hidden" name="project_id" value={id} />
            <label>عنوان التحديث<input name="title" required maxLength={180} /></label>
            <label>التفاصيل<textarea name="body" required rows={4} maxLength={5000} /></label>
            <label className="project-check"><input type="checkbox" name="customer_visible" /> نشر التحديث للعميل</label>
            <button className="button-primary" type="submit">نشر التحديث</button>
          </form>
          <div className="project-record-list">{updates?.map(u => <article key={u.id}><strong>{u.title}</strong><span>{new Intl.DateTimeFormat("ar-EG", {dateStyle:"medium",timeStyle:"short"}).format(new Date(u.created_at))} · {u.customer_visible ? "مرئي للعميل" : "داخلي"}</span><p>{u.body}</p></article>)}{!updates?.length && <p className="admin-note">لا توجد تحديثات.</p>}</div>
        </section>
      </div>
      <section className="admin-panel project-files-panel"><div className="admin-panel-heading"><h2>ملفات المشروع</h2><p>ارفع مستندات المشروع إلى مساحة تخزين خاصة.</p></div><form action={uploadProjectFile} className="project-create-form" encType="multipart/form-data"><input type="hidden" name="project_id" value={id}/><label>اختيار الملف<input type="file" name="file" required accept=".pdf,.jpg,.jpeg,.png,.webp,.txt,.docx,.xlsx"/></label><label className="project-check"><input type="checkbox" name="customer_visible"/> متاح للعميل</label><button className="button-primary" type="submit">رفع الملف</button><p className="admin-note">الحد الأقصى 15 MB. الأنواع: PDF، الصور، TXT، DOCX، XLSX.</p></form><div className="project-record-list">{files?.map(f=><article key={f.id}><strong>{f.file_name}</strong><span>{new Intl.DateTimeFormat("ar-EG",{dateStyle:"medium"}).format(new Date(f.created_at))}</span><form action={updateProjectFileVisibility} className="project-inline-form"><input type="hidden" name="project_id" value={id}/><input type="hidden" name="file_id" value={f.id}/><label className="project-check"><input type="checkbox" name="customer_visible" defaultChecked={f.customer_visible}/> متاح للعميل</label><button className="button-secondary" type="submit">حفظ الظهور</button></form></article>)}{!files?.length && <p className="admin-note">لا توجد ملفات مرفوعة.</p>}</div></section>
      <section className="admin-panel"><div className="admin-panel-heading"><h2>مراحل المشروع</h2><p>إضافة مراحل التنفيذ وترتيبها وتحديد ظهورها للعميل.</p></div><form action={createProjectStage} className="project-create-form"><input type="hidden" name="project_id" value={id} /><label>اسم المرحلة<input name="name" required maxLength={160} /></label><label>الوصف<textarea name="description" rows={2} maxLength={2000} /></label><label>الترتيب<input name="sort_order" type="number" min="0" defaultValue="0" /></label><label className="project-check"><input type="checkbox" name="customer_visible" defaultChecked /> ظاهرة للعميل</label><button className="button-primary" type="submit">إضافة مرحلة</button></form>{stages?.length ? <div className="project-record-list">{stages.map(s=><article key={s.id}><strong>{s.name}</strong><form action={updateProjectStage} className="project-inline-form"><input type="hidden" name="project_id" value={id}/><input type="hidden" name="stage_id" value={s.id}/><select name="status" defaultValue={s.status}><option value="pending">لم تبدأ</option><option value="in_progress">قيد التنفيذ</option><option value="blocked">متوقفة</option><option value="completed">مكتملة</option></select><input name="progress_percent" type="number" min="0" max="100" defaultValue={s.progress_percent}/><label className="project-check"><input type="checkbox" name="customer_visible" defaultChecked={s.customer_visible}/> ظاهرة للعميل</label><button className="button-secondary" type="submit">حفظ المرحلة</button></form></article>)}</div> : <p className="admin-note">لم تتم إضافة مراحل بعد.</p>}</section>
    </main>
  );
}
