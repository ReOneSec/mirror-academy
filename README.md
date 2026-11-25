# Mirror Academy — Official Web App & Student Admissions Portal

> **"Reflect Your Strength!"**  
> Established 2018 in Berhampore, Murshidabad, West Bengal.  
> Specialised coaching for WBPSC, WBCS, Medical & Engineering, Uniformed Forces, and Teaching examinations.

---

## 🌟 Key Features

1. **Brand-Grounded Landing Page**
   - High-performance, mobile-first design built with Next.js 16 (App Router) and Tailwind CSS.
   - 5 streams with 23 courses (Public Services, Medical & Engg., Force, Teaching, Interview), each with a one-line note on the exam.
   - Verbatim contact details: `Near Jamindari Koshaikhana more, Majdia West, Gorabazar, Berhampore`.
   - Clickable telephone link: `tel:9732424300`.
   - Official email: `mirrorexams@gmail.com`.

2. **Student Registration System**
   - Interactive batch selection: **Free batch** (Orientation) vs **Paid batch** (Full Course).
   - Form fields: Student name (max 100 chars), Contact number (10-digit numeric filter), Gender (`Male` / `Female`), Residential address (max 300 chars), Course dropdown, and Questions/notes (max 400 chars with live counter).
   - Live database storage in Supabase PostgreSQL with Row Level Security (RLS).
   - In-memory rate limiting and Cloudflare Turnstile bot protection support.

3. **Student "View Response Preview" Tab**
   - Students can enter their registered mobile number anytime to view their submitted registration card, status (`Application Received`), course details, and batch type.

4. **Dedicated Institute Admin Portal (`/admin`)**
   - Protected with **Supabase Auth** (`@supabase/ssr`).
   - Default administrator account: `mirrorexams@gmail.com`
   - **Live Metrics Dashboard:** Total applications, Free batch count, Paid batch count, Pending follow-ups, Contacted, and Admitted counts.
   - **Real-Time Filters:** Instant search across student names, phone numbers, courses, addresses, or remarks; filter by batch type, stream, status, or gender.
   - **One-Click Communication:** Direct `tel:` call button and direct WhatsApp chat launcher (`https://wa.me/91...`).
   - **Status Management:** Immediate status updates (`new`, `contacted`, `admitted`, `cancelled`) persisted directly to Supabase.
   - **Export to CSV:** Download all or filtered student records with a single click formatted for Excel / Google Sheets.

---

## 🚀 Getting Started

### Prerequisites
- Node.js 20+ (Tested on Node 25.4.0)
- Supabase project credentials

### Environment Setup

Create `.env.local` inside `mirror-academy`:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://<your-project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>

# Site URL
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Optional: Cloudflare Turnstile
TURNSTILE_SECRET_KEY=<your-turnstile-secret>
```

### Installation & Run

```bash
cd mirror-academy
npm install
npm run dev
```

Visit:
- Public Website: [http://localhost:3000](http://localhost:3000)
- Admin Portal: [http://localhost:3000/admin](http://localhost:3000/admin)
  - Sign in with the Supabase Auth admin user you created in the Supabase dashboard.

---

## 🔒 Security Best Practices
- The secret `SUPABASE_SERVICE_ROLE_KEY` is kept strictly server-side and never exposed to the client bundle.
- The Admin Portal endpoints (`/api/admin/*`) require a signed-in Supabase Auth user.
- Character limits are strictly enforced on both the client and server (`name <= 100`, `address <= 300`, `message <= 400`, `phone = 10 digits`).
