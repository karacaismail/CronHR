# CronHR — Ürün ve Mimari Referansı

CronHR, 100+ çalışanı olan işletmeler için bir **işgücü işletim sistemi**dir; "HR
ekranları toplamı" değildir. Bu belge ürün kapsamını, domain sınırlarını ve
geliştirme sırasını tanımlar. Bugünkü kod yalnızca frontend'dir; buradaki
sınırlar UI'daki bilgi mimarisine (menü, sayfa, durum akışları) zaten
yansıtılmıştır ve backend geldiğinde aynen korunacaktır.

## En kritik mimari karar

```
Organizasyon + Özlük → Çalışma Takvimi/Vardiya → PDKS + İzin → Puantaj → Bordro → Muhasebe/SGK/GİB
```

> **Vardiya planlar → PDKS ölçer → İzin açıklar → Puantaj hesaplar → Bordro paraya çevirir.**

Bu beş domain birbirine gömülmez. Bordro, PDKS'nin ham hareketlerini asla
doğrudan okumaz; "176 saat normal + 12 saat fazla mesai" bilgisini **Puantaj**'dan
alır. Ayrım, 500 → 2.000 → 10.000 çalışana çıkışı mümkün kılar.

## 1. Çekirdekler

### A. SaaS Platform Core (HRMS'ye özgü değil, tüm modüller kullanır)

| Çekirdek servis | İçerik |
|---|---|
| Tenant Management | müşteri/tenant, izolasyon, tenant settings |
| Company Management | şirket, legal entity, işyeri, şube |
| Identity & Access | user, authentication, MFA |
| Authorization | RBAC, permission, scope, field-level permission |
| SSO | SAML/OIDC |
| Provisioning | SCIM 2.0 |
| Subscription | plan, paket, entitlement, kota |
| Billing | faturalama, abonelik, kullanım |
| Workflow Engine | durumlar, onaylar, approval chain |
| Rules Engine | koşullar, kurallar, formüller |
| Notification Engine | email, SMS, push, in-app |
| Scheduler | zamanlanmış işler |
| Job/Queue Engine | background işlemler |
| Audit | kim, neyi, ne zaman değiştirdi |
| Activity History | işlem geçmişi |
| Documents | dosya, belge, versiyon |
| Search | global arama |
| Reporting | rapor altyapısı |
| Import/Export | Excel/CSV/API |
| API | REST servisleri |
| Webhooks | dış sistem olayları |
| Integration Management | connector/adapters |
| Localization | dil, para, saat dilimi, ülke |
| Configuration | tenant/company/module settings |
| Feature Flags | müşteri/modül bazlı özellik açma |
| Custom Fields | müşteri özel alanları |
| Custom Forms | özelleştirilebilir formlar |
| Data Retention | saklama/silme politikaları |
| Privacy | KVKK/GDPR mekanizmaları |
| Observability | log, metrics, errors |
| Backup/Recovery | yedekleme/geri yükleme |

Tenant izolasyonu database, cache, dosya, queue ve log katmanlarına kadar
uygulanır; tenant context bütün request ve asenkron işlemlerde korunur (OWASP
Multi-Tenant Security). Kurumsal müşteriler için SSO'nun yanında **SCIM user
provisioning** baştan tasarlanır (Microsoft Entra kullanıcı yaratma/güncelleme/
deprovisioning için SCIM 2.0 kullanır).

### B. HR Domain Core

**Person ≠ Employee ≠ Employment.** Aynı kişi 2023'te A şirketinde, 2025'te
B'de, 2026'da tekrar A'da çalışabilir.

```
Person · Employee · Employment · Contract · Organization · Legal Entity · Company
Workplace · Branch · Location · Department · Team · Position · Job · Job Family
Grade · Cost Center · Manager Relationship · Reporting Line · Calendar
Holiday Calendar · Working Calendar · Employment Status · Employment Type
Salary/Compensation Profile · Document · Employee Document · Policy
Policy Assignment · Effective-Dated History
```

**Effective dating** kritik: `01.01.2026 Maaş = 60.000`, `01.06.2026 Maaş = 75.000`
— eski kayıt değiştirilmez, tarihsel kayıt korunur. Employee record ve
organizasyon yapısı bütün süreçlerin System of Record'udur.

## 2. Her B2B SaaS panelinde olması gerekenler

**Global Application Shell:** Header (Tenant Switcher, Company Switcher, Global
Search, Command Palette, Create, Notifications, Help, User Account) · Sidebar
(Dashboard, Domain Modules, Reports, Integrations, Administration, Settings) ·
Main Content · Right Rail / Context Panel.

CronHR'da **AiCommandCard** global arama + command palette + bildirim + profil
rolünü tek yüzeyde üstlenir; tenant/şirket seçici ve Oluştur/Yardım kartın iki
yanındadır.

**Temel sayfalar:** Dashboard (KPI, durum özeti, görevler, onay bekleyenler,
kritik uyarılar, son aktiviteler, quick actions) · Entity List (Search, Filter,
Advanced Filter, Sort, Saved Views, Columns, Pagination, Bulk Actions, Export,
Import) · Entity Detail (Summary, Tabs, Related records, Activity, Documents,
Comments, History, Audit, Actions) · **My Tasks / Inbox** (Approvals, Tasks,
Requests, Errors, Warnings, Mentions) · Reports (Standard, Custom, Saved,
Scheduled, Exports) · Users & Roles (Users, Teams, Roles, Permissions, Access
Policies, SSO, Sessions) · Integrations (Connected Apps, API Keys, Webhooks,
Import/Export, Logs) · Billing (Plan, Subscription, Usage, Invoices, Payment
Method) · Settings (General, Organization, Users, Permissions, Localization,
Notifications, Integrations, Security, Data, Billing, Developer).

**Evrensel UI component set** (bir kez geliştirilir, her modülde kullanılır):
DataTable, Search, Filter Builder, Saved View, Column Manager, Pagination, Input,
Textarea, Select, Combobox, Autocomplete, Radio, Checkbox, Switch, Date/DateTime/
Time Picker, File/Image Upload, Tabs, Accordion, Stepper, Wizard, Modal, Drawer,
Popover, Tooltip, Status Badge, Alert, Toast, Timeline, Activity Feed, Audit
Trail, Comment, Mention, Chart, KPI Card, Progress, Empty/Loading/Skeleton/Error
State, Bulk Action, Import, Export, Confirmation, Delete Confirmation, Permission
Guard, Entity/Employee/Department/Organization Picker.

## 3. Özlük — Employee 360

Bölümler: Genel · Kimlik (yalnızca gerekli veri) · İletişim · İş bilgileri ·
Sözleşmeler (versiyon geçmişi) · SGK / yasal (işyeri, meslek kodu, sigortalılık
türü, prim türü, teşvik, vergi) · Ücret (kısıtlı yetki; Base Salary, Salary
Type, Currency, Payroll Group, Bank, IBAN, Grade, Compensation History) ·
Eğitim / yetkinlik · Belgeler (`type, version, issued_at, expires_at, status,
owner, visibility`) · Zimmetler · Lifecycle (Hire, Probation, Transfer,
Promotion, Demotion, Salary Change, Department Change, Manager Change, Contract
Renewal, Suspension, Termination, Rehire) · History (Employment, Organization,
Salary, Document, Status, Audit Trail).

## 4. PDKS — ham zaman olayları

**PDKS = puantaj değildir.** PDKS ham olayları toplar (`08:03 IN · 12:01 OUT ·
12:44 IN · 18:17 OUT`); yorumlayan ayrı engine'dir.

- **Device Management:** Devices, Groups, Locations, Status, Employee Mapping,
  Connection, Sync, Last Sync, Error Logs. Destek: RFID, NFC, PIN, Kart,
  Terminal, Mobile, Web check-in, API, CSV/import.
- **KVKK 2026/921 İlke Kararı (29 Nisan 2026):** yalnızca mesai takibi için
  parmak izi/yüz/iris gibi biyometrik veri işlenmesi ölçülülük bakımından
  hukuka aykırı; PIN, kart, RFID/NFC alternatifleri esastır. **Biyometri
  Türkiye PDKS çekirdeğinin varsayılan özelliği değildir.**
- **Raw Attendance Events** immutable: `employee_id, device_id, timestamp,
  event_type, source, location, external_id, received_at`. Ham veri
  silinmez/değiştirilmez; düzeltmeler ayrı tutulur.
- **Attendance Engine:** Present, Absent, Late, Early Leave, Missing Punch,
  Partial Work, On Leave, Holiday Work, Rest Day Work, Overtime.
- **Rules:** Grace Period, Rounding, Tolerance, Minimum Working Time, Late/
  Early thresholds, Break, Overtime, Missing Punch.
- **Exception Management:** Missing IN/OUT, Double IN/OUT, Unmatched shift,
  Unexpected attendance, Late, Early, Device failure. Durumlar:
  `Normal · Exception · Needs Review · Approved · Rejected`. HR 500 hareketi
  tek tek incelemez.
- **Correction Requests:** çalışan talep açar, yönetici/HR Approve/Reject/Edit;
  audit trail.

## 5. Vardiya — planlanan zaman

Vardiya = planlanan çalışma zamanı, PDKS = gerçekleşen hareketler; birleşmez.
Shift Type (Start, End, Cross Midnight, Break, Paid/Unpaid Break, Grace, Night,
Working Hours) · Templates (Sabah, Akşam, Gece, Ofis, Hafta sonu, 12/24, 12/36)
· Rotation · Assignment (Employee, Team, Department, Location, Position) ·
Visual Scheduler (Day/Week/Month) · Coverage/Staffing (Required/Assigned/
Missing) · Qualification Constraints · Conflict Engine · Shift Change (Swap,
Change Request, Approval) · Publish: **Draft → Published → Locked**.

## 6. Bordro — Payroll Calculation Engine

Configuration (Period, Group, Frequency, Currency, Working Day Calculation,
Rounding) · Salary Structure (Base, Earnings, Deductions, Employer/Employee
Contributions) · Earnings · Deductions · Variable Inputs (PDKS, Puantaj,
Overtime, Leave, Bonus, Commission, Premium, Advance, Expense, Adjustments) ·
**Payroll Run: Draft → Calculate → Validate → Review → Approve → Finalize → Pay
→ Close** · **Pre-Payroll Validation** (IBAN eksik, puantaj onaysız, maaş tanımı
yok, meslek kodu eksik, anormal mesai; kullanıcıyı durdurabilir) · Retro Payroll
· Off-Cycle (Bonus, Termination, Correction) · Termination Calculation (Final
Salary, Unused Leave, Severance, Notice) · Output (Payslip, Register, Employer
Cost, Department Cost, Cost Center Distribution, Bank File, Accounting Entry).

**Türkiye localization ayrı, sürümlü paket:** TR Payroll Rules, SGK, Tax,
İşsizlik, SGK Workplace, Meslek Kodu, Teşvikler, MUHSGK, E-Bildirge V2, Bank
Files, Accounting Integration. Oranlar koda gömülmez:

```
SGK_EMPLOYEE_RATE · effective_from · effective_to · value · legal_reference · version
```

## 7. Puantaj — en kritik ayrı domain

```
VARDİYA (planlanan) → PDKS (gerçek hareket) → İZİN/RAPOR/GÖREV (haklı yokluk)
→ FAZLA MESAİ / DÜZELTME → PUANTAJ (hesaplanmış çalışma) → BORDRO (parasal karşılık)
```

Puantaj üretir: Planlanan Gün, Çalışılan Gün/Saat, Ücretli/Ücretsiz İzin, Eksik
Gün, Devamsızlık, Normal Mesai, Fazla Mesai, Gece, Tatil, Vardiya Primi, Geç
Kalma, Erken Çıkma, Payroll Units.

## 8. Diğer P0 alanlar

Organizasyon Yönetimi · İzin & Yokluk (PDKS/bordrodan önce) · Puantaj · ESS ·
MSS · Workflow & Approval · Document Management · Reporting & Analytics.

## 9. Geliştirme sırası

| Faz | Kapsam |
|---|---|
| 0 Platform Kernel | Tenant, Auth, RBAC, Company, Workflow, Rules, Audit, Documents, Notifications, API, Integration, Import/Export, Localization |
| 1 Core HR | Özlük, Organization, Employee Lifecycle, Documents, ESS, MSS — ürün kullanılmaya başlanır |
| 2 Workforce Management | Holiday Calendar, İzin & Yokluk, Vardiya, PDKS, Puantaj, Overtime — üretim, depo, lojistik, perakende, güvenlik, çağrı merkezi |
| 3 Payroll | Compensation, Payroll, TR Localization, SGK, GİB/MUHSGK, Bank, Accounting |
| 4 Employee Lifecycle | Onboarding, Probation, Transfer, Promotion, Offboarding, Exit Interview |
| 5 Recruitment / ATS | Requisition, Vacancy, Career Page, Candidate, Pipeline, Interview, Assessment, Offer, Hire |
| 6 Performance | Goals, OKR, KPI, Competency, Review, 360, 1:1, PIP |
| 7 Learning | Training, Course, LMS, Certification, Qualification, Skills, Training Matrix, Expiration Alerts |
| 8 Compensation & Benefits | Salary Bands, Grades, Planning, Review, Bonus, Benefits, Insurance, Meal, Transportation, Flexible |
| 9 Employee Relations | Disciplinary, Warning, Incident, Grievance, HR Case, Request, Helpdesk |
| 10 Talent Management | Talent Pool, Career Path, Succession, 9 Box, HiPo, Skills Gap, Internal Mobility |
| 11 Workforce Planning | Headcount, Position Budget, Workforce Budget, Vacant Positions, Hiring Plan, Turnover/Labor Cost Forecast |

## 10. Nihai menü (ilk ticari sürüm)

```
Dashboard
Görevlerim
İnsanlar: Çalışanlar · Organizasyon · Pozisyonlar · Özlük · Belgeler
Zaman: İzinler · Vardiyalar · PDKS · Puantaj · Fazla Mesai · Takvim
Bordro: Bordrolar · Ücretler · Değişken Ödemeler · Kesintiler · SGK · Beyannameler · Ödemeler
Yaşam Döngüsü: Onboarding · Transferler · Terfiler · Offboarding
İşe Alım · Performans · Eğitim · HR Vakaları · Raporlar
Portallar: Çalışan Portalı · Yönetici Portalı
Entegrasyonlar · Ayarlar
```

## 11. Öncelik kesimi

| Seviye | Modül |
|---|---|
| P0 | SaaS Kernel, Organization, Özlük, Employee Lifecycle temel, Document, İzin, Vardiya, PDKS, Puantaj, Bordro, ESS, MSS, Workflow, Reporting, Audit, Integration/API |
| P1 | Onboarding/Offboarding, Recruitment, Compensation, Performance, Training, Discipline/HR Cases |
| P2 | Benefits, Engagement, Talent, Succession, Workforce Planning, Advanced Analytics |

## 12. Güvenlik çekirdeğin parçasıdır

HRMS kimlik, ücret, banka, çalışma ve kimi durumlarda özel nitelikli kişisel
veri taşır. Audit, erişim kontrolü, maskeleme, veri saklama/imha ve güçlü
kimlik doğrulama sonradan eklenen özellik değildir. KVKK Kişisel Veri Güvenliği
Rehberi (teknik/idari tedbirler) log kayıtları, maskeleme, yedekleme, erişim
ve imha politikalarını açıkça kapsar.

## Kaynaklar

1. OWASP Multi Tenant Security Cheat Sheet — https://cheatsheetseries.owasp.org/cheatsheets/Multi_Tenant_Security_Cheat_Sheet.html
2. Microsoft Entra application provisioning (SCIM) — https://learn.microsoft.com/en-us/entra/identity/app-provisioning/
3. Workday, Human Capital Management — https://www.workday.com/en-us/topics/hr/human-capital-management-software.html
4. SGK E-Bildirge V2 (2026) — https://e.sgk.gov.tr/Uygulamalar/Detay/E-BildirgeV2-2026-04-21-09-12-18
5. KVKK 2026/921 İlke Kararı — https://www.kvkk.gov.tr/Icerik/8912/
6. Frappe HR Employee Checkin — https://docs.frappe.io/hr/employee-checkin
7. Frappe HR Payroll Entry — https://docs.frappe.io/hr/payroll-entry
8. KVKK Kişisel Veri Güvenliği Rehberi — https://kvkk.gov.tr/SharedFolderServer/CMSFiles/7512d0d4-f345-41cb-bc5b-8d5cf125e3a1.pdf
