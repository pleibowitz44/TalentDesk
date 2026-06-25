<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>TalentDesk — Recruitment & Talent Acquisition Jobs</title>
  <meta name="description" content="The job board built for recruiters. Find roles in talent acquisition, staffing, and recruitment — with an application tracker, salary data, and job alerts.">
  <meta property="og:title" content="TalentDesk — TA & Recruiting Jobs">
  <meta property="og:description" content="Curated jobs in recruitment, talent acquisition, and staffing. Updated daily.">
  <meta property="og:type" content="website">
  <link rel="stylesheet" href="css/style.css">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest/tabler-icons.min.css">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500&display=swap" rel="stylesheet">
</head>
<body>

  <!-- TOP BAR -->
  <header class="topbar">
    <div class="brand">
      <div class="brand-icon"><i class="ti ti-layout-dashboard"></i></div>
      TalentDesk
    </div>
    <nav class="nav-tabs" role="navigation" aria-label="Main navigation">
      <button class="nav-tab active" onclick="showView('jobs', this)" aria-current="page">
        <i class="ti ti-briefcase" aria-hidden="true"></i> Jobs
      </button>
      <button class="nav-tab" onclick="showView('tracker', this)" id="trackerTab">
        <i class="ti ti-columns" aria-hidden="true"></i> Tracker
      </button>
      <button class="nav-tab" onclick="showView('alerts', this)" id="alertsTab">
        <i class="ti ti-bell" aria-hidden="true"></i> Alerts
      </button>
      <button class="nav-tab" onclick="showView('salary', this)">
        <i class="ti ti-chart-bar" aria-hidden="true"></i> Salary
      </button>
    </nav>
  </header>

  <main id="app">

    <!-- JOBS VIEW -->
    <div id="jobs-view" class="view active">
      <div class="hero">
        <div class="hero-eyebrow">Recruitment &amp; Talent Acquisition</div>
        <h1 class="hero-title">Your desk for TA job search</h1>
        <p class="hero-sub">Curated roles in recruiting, staffing &amp; talent acquisition — updated daily</p>
        <div class="search-row">
          <div class="search-wrap">
            <i class="ti ti-search" aria-hidden="true"></i>
            <input id="searchInput" type="search" placeholder="Search by title, company, keyword..." oninput="filterJobs()" aria-label="Search jobs">
          </div>
          <button class="btn-ai" onclick="window.open('https://claude.ai','_blank')" aria-label="Ask AI for job advice">
            <i class="ti ti-sparkles" aria-hidden="true"></i> Ask AI
          </button>
        </div>
        <div class="stats-row" aria-live="polite">
          <span class="stat"><strong id="jobCount">15</strong> open roles</span>
          <span class="stat"><strong>8</strong> remote-friendly</span>
          <span class="stat"><strong>6</strong> director+</span>
          <span class="stat">Updated <strong>today</strong></span>
        </div>
      </div>

      <div class="filters" role="group" aria-label="Filter jobs">
        <button class="filter-btn active" onclick="setFilter('all', this)">All roles</button>
        <button class="filter-btn" onclick="setFilter('remote', this)">Remote</button>
        <button class="filter-btn" onclick="setFilter('hybrid', this)">Hybrid</button>
        <button class="filter-btn" onclick="setFilter('executive', this)">Director+</button>
        <button class="filter-btn" onclick="setFilter('coordinator', this)">Coordinator</button>
        <button class="filter-btn" onclick="setFilter('sourcer', this)">Sourcer</button>
        <button class="filter-btn" onclick="setFilter('agency', this)">Agency</button>
        <button class="filter-btn" onclick="setFilter('corporate', this)">Corporate TA</button>
        <button class="filter-btn" onclick="setFilter('tech', this)">Tech</button>
        <button class="filter-btn" onclick="setFilter('healthcare', this)">Healthcare</button>
      </div>

      <div class="main-layout">
        <div class="job-list" id="jobList" role="list" aria-label="Job listings"></div>
        <div class="detail-pane" id="detailPane">
          <div class="detail-empty">
            <i class="ti ti-briefcase" aria-hidden="true"></i>
            <span>Select a role to see details</span>
          </div>
        </div>
      </div>
    </div>

    <!-- TRACKER VIEW -->
    <div id="tracker-view" class="view">
      <div class="inner-view">
        <div class="view-header">
          <h2 class="view-title">Application tracker</h2>
        </div>
        <div class="tracker-stats">
          <div class="tstat"><div class="tstat-n" id="ts-total">0</div><div class="tstat-l">Total applied</div></div>
          <div class="tstat"><div class="tstat-n" id="ts-interview">0</div><div class="tstat-l">Interviews</div></div>
          <div class="tstat"><div class="tstat-n" id="ts-offer">0</div><div class="tstat-l">Offers</div></div>
          <div class="tstat"><div class="tstat-n" id="ts-rate">0%</div><div class="tstat-l">Interview rate</div></div>
        </div>
        <div class="add-app-row">
          <input id="newJobTitle" type="text" placeholder="Job title" aria-label="Job title">
          <input id="newJobCo" type="text" placeholder="Company" aria-label="Company name">
          <select id="newJobStage" aria-label="Application stage">
            <option value="applied">Applied</option>
            <option value="screening">Screening</option>
            <option value="interview">Interview</option>
            <option value="offer">Offer</option>
          </select>
          <button class="btn-add" onclick="addApplication()">
            <i class="ti ti-plus" aria-hidden="true"></i> Add
          </button>
        </div>
        <div class="stage-cols" id="stageCols"></div>
      </div>
    </div>

    <!-- ALERTS VIEW -->
    <div id="alerts-view" class="view">
      <div class="inner-view">
        <h2 class="view-title" style="margin-bottom: 1.25rem">Job alerts</h2>
        <div class="alert-form">
          <h3>Create a new alert</h3>
          <div class="form-row">
            <div class="form-field">
              <label for="alertKeywords">Keywords</label>
              <input id="alertKeywords" type="text" placeholder="e.g. Senior Recruiter, TA Manager">
            </div>
            <div class="form-field">
              <label for="alertType">Location type</label>
              <select id="alertType">
                <option value="any">Any location</option>
                <option value="remote">Remote only</option>
                <option value="hybrid">Hybrid</option>
                <option value="onsite">On-site</option>
              </select>
            </div>
          </div>
          <div class="form-row">
            <div class="form-field">
              <label for="alertLevel">Level</label>
              <select id="alertLevel">
                <option value="any">Any level</option>
                <option value="coordinator">Coordinator</option>
                <option value="specialist">Specialist / Partner</option>
                <option value="manager">Manager</option>
                <option value="director">Director+</option>
              </select>
            </div>
            <div class="form-field">
              <label for="alertFreq">Frequency</label>
              <select id="alertFreq">
                <option value="daily">Daily digest</option>
                <option value="instant">Instant</option>
                <option value="weekly">Weekly</option>
              </select>
            </div>
          </div>
          <div class="form-field" style="margin-bottom: 1rem">
            <label for="alertSalary">Min. salary</label>
            <input id="alertSalary" type="text" placeholder="e.g. $90,000">
          </div>
          <button class="btn-create-alert" onclick="createAlert()">
            <i class="ti ti-bell" aria-hidden="true"></i> Create alert
          </button>
        </div>
        <div id="alertList"></div>
      </div>
    </div>

    <!-- SALARY VIEW -->
    <div id="salary-view" class="view">
      <div class="inner-view">
        <h2 class="view-title">Salary comparison</h2>
        <p class="view-sub">Ranges from active TA &amp; staffing listings — June 2026</p>
        <div class="sal-grid">
          <div class="sal-card">
            <div class="sal-card-label">Market median</div>
            <div class="sal-card-n">$105K</div>
            <div class="sal-card-range">All TA roles</div>
          </div>
          <div class="sal-card">
            <div class="sal-card-label">Remote premium</div>
            <div class="sal-card-n">+12%</div>
            <div class="sal-card-range">vs. on-site equivalent</div>
          </div>
          <div class="sal-card">
            <div class="sal-card-label">Director+ median</div>
            <div class="sal-card-n">$162K</div>
            <div class="sal-card-range">Excl. commission roles</div>
          </div>
        </div>
        <div class="sal-legend">
          <div class="leg-item"><div class="leg-dot" style="background:#1D9E75"></div> Corporate TA</div>
          <div class="leg-item"><div class="leg-dot" style="background:#185FA5"></div> Agency / RPO</div>
          <div class="leg-item"><div class="leg-dot" style="background:#534AB7"></div> Executive / Director+</div>
        </div>
        <div class="sal-bars" id="salBars"></div>
        <div class="insight-box">
          <strong>Market insight</strong>
          Director-level TA roles in tech and finance offer the widest range ($140K–$220K), driven by equity and bonus components. Remote roles command a 10–14% premium over comparable on-site positions. Healthcare recruiting has seen the fastest salary growth since 2024 (~18%) due to persistent clinical talent shortages. Agency full-desk base salaries ($50K–$65K) can yield $120K+ total comp for top billers.
        </div>
      </div>
    </div>

  </main>

  <!-- TOAST NOTIFICATION -->
  <div id="toast" class="toast" role="status" aria-live="polite"></div>

  <script src="js/data.js"></script>
  <script src="js/app.js"></script>
</body>
</html>
