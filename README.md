[README.md](https://github.com/user-attachments/files/29342884/README.md)
# TalentDesk

**The job board built for recruiters.**
Curated roles in talent acquisition, staffing, and recruitment — with an application tracker, salary benchmarks, and job alerts.

---

## Project structure

```
talentdesk/
├── index.html        # Main app shell
├── css/
│   └── style.css     # All styles (light + dark mode)
├── js/
│   ├── data.js       # Job listings & salary data
│   └── app.js        # All application logic
└── README.md
```

---

## How to run locally

No build step needed. Just open `index.html` in a browser:

```bash
# Option 1 — open directly
open index.html

# Option 2 — serve with Python (avoids any CORS issues)
python3 -m http.server 3000
# then visit http://localhost:3000
```

---

## How to deploy (free)

### Vercel (recommended)
1. Push this folder to a GitHub repo
2. Go to vercel.com → New Project → Import your repo
3. Deploy — done. Vercel auto-detects static sites.
4. Add your custom domain in Project Settings → Domains

### Netlify
1. Go to netlify.com → Add new site → Deploy manually
2. Drag and drop the `talentdesk/` folder into the deploy box
3. Done instantly. Add your domain in Site Settings → Domain Management.

### GitHub Pages
1. Push to GitHub
2. Settings → Pages → Source: Deploy from branch → main → / (root)
3. Your site will be live at `https://yourusername.github.io/talentdesk`

---

## How to add live job data

The `js/data.js` file currently holds static job listings.
To connect a live job feed, replace the `JOBS` array with an API call.

### Option A — Adzuna API (free tier, 250 req/day)
```javascript
async function fetchJobs() {
  const APP_ID  = 'YOUR_ADZUNA_APP_ID';
  const APP_KEY = 'YOUR_ADZUNA_APP_KEY';
  const res = await fetch(
    `https://api.adzuna.com/v1/api/jobs/us/search/1` +
    `?app_id=${APP_ID}&app_key=${APP_KEY}` +
    `&results_per_page=20&what=talent+acquisition+recruiter`
  );
  const data = await res.json();
  return data.results.map(j => ({
    id:       j.id,
    title:    j.title,
    company:  j.company.display_name,
    location: j.location.display_name,
    type:     'hybrid',
    salary:   j.salary_min ? `$${Math.round(j.salary_min/1000)}K – $${Math.round(j.salary_max/1000)}K` : 'Competitive',
    posted:   'Recently',
    tags:     ['corporate'],
    badge:    '',
    desc:     j.description,
    requirements: [],
    about:    j.company.display_name,
    source:   'Adzuna',
    url:      j.redirect_url
  }));
}
```

Sign up free at: https://developer.adzuna.com

### Option B — Indeed Publisher API
Apply at: https://www.indeed.com/publisher
Free for low-volume publishers. Returns XML; parse with DOMParser.

### Option C — RapidAPI job search APIs
Many job board APIs available on RapidAPI.com, some with free tiers.
Search for "JSearch" or "Indeed scraper" APIs.

---

## Adding a backend (when you're ready)

For user accounts, email alerts, and resume uploads, add **Supabase**:

1. Create a free project at supabase.com
2. Install the JS client: `<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>`
3. Replace localStorage calls in app.js with Supabase reads/writes
4. Use Supabase Auth for login (email magic link is easiest)

Tables you'll need:
- `saved_jobs` (user_id, job_id)
- `applications` (user_id, job_id, title, company, stage, date)
- `alerts` (user_id, keywords, type, level, freq, min_salary, active)
- `candidates` (for future resume upload feature)

---

## Roadmap ideas

- [ ] Connect live job API (Adzuna recommended first)
- [ ] Supabase backend for persistent user accounts
- [ ] Email digest for job alerts (use Resend.com — free tier 3,000/mo)
- [ ] Candidate profile / resume upload (employer search side)
- [ ] Employer accounts + job posting (paid feature)
- [ ] SEO pages for each job (server-side rendering with Next.js)

---

## Cheapest production stack (year 1)

| Service | Purpose | Cost |
|---------|---------|------|
| Vercel | Hosting | Free |
| Supabase | Database + auth | Free |
| Adzuna API | Job data | Free |
| Resend | Email alerts | Free (3K/mo) |
| Domain (.co or .io) | Brand | ~$12/yr |
| **Total** | | **~$12/year** |

---

Built with plain HTML, CSS, and vanilla JavaScript — no framework required.
