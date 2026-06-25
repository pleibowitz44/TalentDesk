// =====================
// TalentDesk — app.js
// =====================

// ---- State ----
let filteredJobs = [...JOBS];
let activeFilter = 'all';
let selectedId = null;
let savedJobs = new Set();
let alertJobs = new Set();
let applications = [];
let jobAlerts = [];

// ---- Persistence (localStorage) ----
function saveState() {
  try {
    localStorage.setItem('td_saved', JSON.stringify([...savedJobs]));
    localStorage.setItem('td_applications', JSON.stringify(applications));
    localStorage.setItem('td_alerts', JSON.stringify(jobAlerts));
  } catch (e) { /* storage unavailable */ }
}

function loadState() {
  try {
    const saved = localStorage.getItem('td_saved');
    const apps  = localStorage.getItem('td_applications');
    const alerts = localStorage.getItem('td_alerts');
    if (saved)  savedJobs    = new Set(JSON.parse(saved));
    if (apps)   applications = JSON.parse(apps);
    if (alerts) jobAlerts    = JSON.parse(alerts);
    alertJobs = new Set(jobAlerts.map(a => a.sourceJobId).filter(Boolean));
    updateTrackerBadge();
    updateAlertBadge();
  } catch (e) { /* storage unavailable */ }
}

// ---- Navigation ----
function showView(name, btn) {
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  document.querySelectorAll('.nav-tab').forEach(b => {
    b.classList.remove('active');
    b.removeAttribute('aria-current');
  });
  document.getElementById(name + '-view').classList.add('active');
  btn.classList.add('active');
  btn.setAttribute('aria-current', 'page');
  if (name === 'tracker') renderTracker();
  if (name === 'salary')  renderSalary();
  if (name === 'alerts')  renderAlerts();
}

// ---- Toast ----
function toast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2400);
}

// ---- Job List ----
function renderList() {
  const list = document.getElementById('jobList');
  const count = document.getElementById('jobCount');

  if (!filteredJobs.length) {
    list.innerHTML = '<div class="no-results">No roles match your search.<br>Try a different keyword or filter.</div>';
    count.textContent = '0';
    return;
  }

  count.textContent = filteredJobs.length;

  list.innerHTML = filteredJobs.map(j => {
    const isSaved = savedJobs.has(j.id);
    const badgeHtml = j.badge === 'new-tag'
      ? '<span class="badge is-new">New</span>'
      : j.badge === 'feat'
        ? '<span class="badge is-feat">Featured</span>'
        : '';

    return `
      <div class="job-card${selectedId === j.id ? ' selected' : ''}"
           onclick="selectJob(${j.id})"
           role="listitem"
           tabindex="0"
           onkeydown="if(event.key==='Enter')selectJob(${j.id})"
           aria-label="${j.title} at ${j.company}">
        <div class="job-card-header">
          <div class="job-title">${j.title}</div>
          <div style="display:flex;align-items:center;gap:5px;flex-shrink:0">
            ${isSaved ? '<div class="saved-dot" title="Saved"></div>' : ''}
            ${badgeHtml}
          </div>
        </div>
        <div class="job-co">${j.company} &middot; ${j.location}</div>
        <div class="job-meta">
          <span class="badge ${j.type}">${j.type === 'remote' ? 'Remote' : j.type === 'hybrid' ? 'Hybrid' : 'On-site'}</span>
          ${j.tags.includes('agency')    ? '<span class="badge">Agency</span>'    : ''}
          ${j.tags.includes('executive') ? '<span class="badge">Director+</span>' : ''}
          ${j.tags.includes('tech')      ? '<span class="badge">Tech</span>'      : ''}
          ${j.tags.includes('healthcare')? '<span class="badge">Healthcare</span>': ''}
        </div>
        <div class="job-sal">${j.salary}</div>
        <div class="job-posted">Posted ${j.posted} &middot; via ${j.source}</div>
      </div>`;
  }).join('');
}

// ---- Job Detail ----
function selectJob(id) {
  selectedId = id;
  renderList();

  const j = JOBS.find(x => x.id === id);
  if (!j) return;

  const initials = j.company.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
  const isSaved  = savedJobs.has(j.id);
  const hasAlert = alertJobs.has(j.id);

  document.getElementById('detailPane').innerHTML = `
    <div>
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:1rem">
        <div class="co-logo">${initials}</div>
        <div>
          <div class="detail-title">${j.title}</div>
          <div class="detail-co">${j.company}</div>
        </div>
      </div>
      <div class="detail-badges">
        <span class="badge ${j.type}">${j.type === 'remote' ? 'Remote' : j.type === 'hybrid' ? 'Hybrid' : 'On-site'}</span>
        <span class="badge">${j.location}</span>
        <span class="badge">via ${j.source}</span>
      </div>
      <div class="detail-sal">
        <strong>${j.salary}</strong>
        Estimated compensation &middot; Posted ${j.posted}
      </div>
      <div class="dsec"><h3>About the role</h3><p>${j.desc}</p></div>
      <div class="dsec">
        <h3>Requirements</h3>
        <ul>${j.requirements.map(r => `<li>${r}</li>`).join('')}</ul>
      </div>
      <div class="dsec"><h3>About the company</h3><p>${j.about}</p></div>
      <button class="btn-primary" onclick="applyAndTrack(${j.id}, '${j.url}')">
        <i class="ti ti-external-link" aria-hidden="true"></i> Apply on ${j.source}
      </button>
      <div class="btn-row">
        <button class="btn-sm${isSaved ? ' active-save' : ''}" onclick="toggleSave(${j.id})">
          <i class="ti ti-heart" aria-hidden="true"></i> ${isSaved ? 'Saved' : 'Save role'}
        </button>
        <button class="btn-sm${hasAlert ? ' active-alert' : ''}" onclick="toggleJobAlert(${j.id})">
          <i class="ti ti-bell" aria-hidden="true"></i> ${hasAlert ? 'Alert on' : 'Get alerts'}
        </button>
      </div>
      <button class="btn-sm" style="width:100%" onclick="addToTracker(${j.id})">
        <i class="ti ti-columns" aria-hidden="true"></i> Add to tracker
      </button>
    </div>`;
}

// ---- Save / Alerts ----
function toggleSave(id) {
  if (savedJobs.has(id)) { savedJobs.delete(id); toast('Removed from saved roles'); }
  else                   { savedJobs.add(id);    toast('Role saved!'); }
  saveState();
  selectJob(id);
  renderList();
}

function toggleJobAlert(id) {
  const j = JOBS.find(x => x.id === id);
  if (alertJobs.has(id)) {
    alertJobs.delete(id);
    jobAlerts = jobAlerts.filter(a => a.sourceJobId !== id);
    toast('Alert removed');
  } else {
    alertJobs.add(id);
    jobAlerts.push({
      id: Date.now(),
      sourceJobId: id,
      keywords: j.title,
      type: j.type,
      level: 'any',
      freq: 'daily',
      salary: '',
      active: true,
      matches: Math.floor(Math.random() * 8) + 2
    });
    updateAlertBadge();
    toast('Alert created for similar roles!');
  }
  saveState();
  selectJob(id);
}

// ---- Tracker ----
function applyAndTrack(id, url) {
  window.open(url, '_blank');
  addToTracker(id, true);
}

function addToTracker(id, silent) {
  if (!applications.find(a => a.jobId === id)) {
    const j = JOBS.find(x => x.id === id);
    applications.push({
      id: Date.now(),
      jobId: id,
      title: j.title,
      company: j.company,
      stage: 'applied',
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    });
    updateTrackerBadge();
    saveState();
    if (!silent) toast('Added to tracker!');
    else toast('Logged in your tracker!');
  } else {
    if (!silent) toast('Already in your tracker');
  }
  if (!silent) selectJob(id);
}

function addApplication() {
  const title = document.getElementById('newJobTitle').value.trim();
  const co    = document.getElementById('newJobCo').value.trim();
  const stage = document.getElementById('newJobStage').value;
  if (!title || !co) { toast('Enter a job title and company'); return; }
  applications.push({
    id: Date.now(),
    jobId: null,
    title,
    company: co,
    stage,
    date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  });
  document.getElementById('newJobTitle').value = '';
  document.getElementById('newJobCo').value = '';
  updateTrackerBadge();
  saveState();
  renderTracker();
  toast('Application added!');
}

function advanceStage(id) {
  const stages = ['applied', 'screening', 'interview', 'offer'];
  const a = applications.find(x => x.id === id);
  if (!a) return;
  const i = stages.indexOf(a.stage);
  if (i < stages.length - 1) {
    a.stage = stages[i + 1];
    toast('Moved to ' + stages[i + 1]);
    saveState();
  }
  renderTracker();
}

function removeApp(id) {
  applications = applications.filter(a => a.id !== id);
  updateTrackerBadge();
  saveState();
  renderTracker();
  toast('Removed');
}

function renderTracker() {
  const stages = ['applied', 'screening', 'interview', 'offer'];
  const labels = { applied: 'Applied', screening: 'Screening', interview: 'Interview', offer: 'Offer' };
  const counts = { applied: 0, screening: 0, interview: 0, offer: 0 };
  applications.forEach(a => { if (counts[a.stage] !== undefined) counts[a.stage]++; });

  const total      = applications.length;
  const interviews = counts.interview + counts.offer;
  const rate       = total ? Math.round((interviews / total) * 100) : 0;

  document.getElementById('ts-total').textContent     = total;
  document.getElementById('ts-interview').textContent = interviews;
  document.getElementById('ts-offer').textContent     = counts.offer;
  document.getElementById('ts-rate').textContent      = rate + '%';

  const cols = document.getElementById('stageCols');
  if (!total) {
    cols.innerHTML = '<div class="tracker-empty">No applications yet.<br>Click "Add to tracker" on any listing, or add one manually above.</div>';
    return;
  }

  cols.innerHTML = stages.map(s => `
    <div class="stage-col">
      <div class="stage-label">
        ${labels[s]}
        <span class="stage-count">${counts[s]}</span>
      </div>
      ${applications.filter(a => a.stage === s).map(a => `
        <div class="tracker-card">
          <div class="tc-title">${a.title}</div>
          <div class="tc-co">${a.company}</div>
          <div class="tc-date">${a.date}</div>
          <div class="tc-actions">
            ${s !== 'offer' ? `<button class="tc-btn" onclick="advanceStage(${a.id})">Advance <i class="ti ti-arrow-right" aria-hidden="true"></i></button>` : ''}
            <button class="tc-btn" onclick="removeApp(${a.id})" aria-label="Remove ${a.title}">
              <i class="ti ti-trash" aria-hidden="true"></i>
            </button>
          </div>
        </div>`).join('')}
    </div>`).join('');
}

function updateTrackerBadge() {
  const tab = document.getElementById('trackerTab');
  let b = tab.querySelector('.badge-count');
  if (!b) { b = document.createElement('span'); b.className = 'badge-count'; tab.appendChild(b); }
  if (applications.length > 0) { b.textContent = applications.length; b.style.display = ''; }
  else { b.style.display = 'none'; }
}

// ---- Alerts ----
function createAlert() {
  const keywords = document.getElementById('alertKeywords').value.trim();
  const type     = document.getElementById('alertType').value;
  const level    = document.getElementById('alertLevel').value;
  const freq     = document.getElementById('alertFreq').value;
  const salary   = document.getElementById('alertSalary').value.trim();
  if (!keywords) { toast('Enter keywords for your alert'); return; }

  jobAlerts.push({
    id: Date.now(),
    sourceJobId: null,
    keywords, type, level, freq, salary,
    active: true,
    matches: Math.floor(Math.random() * 12) + 3
  });

  document.getElementById('alertKeywords').value = '';
  document.getElementById('alertSalary').value   = '';
  updateAlertBadge();
  saveState();
  renderAlerts();
  toast('Alert created!');
}

function toggleAlert(id) {
  const a = jobAlerts.find(x => x.id === id);
  if (a) { a.active = !a.active; saveState(); renderAlerts(); toast(a.active ? 'Alert activated' : 'Alert paused'); }
}

function deleteAlert(id) {
  jobAlerts = jobAlerts.filter(a => a.id !== id);
  updateAlertBadge();
  saveState();
  renderAlerts();
  toast('Alert deleted');
}

function renderAlerts() {
  const list = document.getElementById('alertList');
  const tl = { any: 'Any location', remote: 'Remote only', hybrid: 'Hybrid', onsite: 'On-site' };
  const fl = { daily: 'Daily digest', instant: 'Instant', weekly: 'Weekly' };
  const ll = { any: 'Any level', coordinator: 'Coordinator', specialist: 'Specialist / Partner', manager: 'Manager', director: 'Director+' };

  if (!jobAlerts.length) {
    list.innerHTML = '<div style="text-align:center;color:var(--gray-400);font-size:13px;padding:2rem;line-height:1.6">No alerts yet.<br>Create one above or click "Get alerts" on any listing.</div>';
    return;
  }

  list.innerHTML = jobAlerts.map(a => `
    <div class="alert-list-item">
      <div>
        <div class="ali-title">${a.keywords}</div>
        <div class="ali-meta">
          ${tl[a.type]} &middot; ${ll[a.level]} &middot; ${fl[a.freq]}
          ${a.salary ? ' &middot; Min ' + a.salary : ''}
        </div>
        <div class="ali-match">
          <i class="ti ti-check" aria-hidden="true"></i>
          ${a.matches} matching roles today
        </div>
      </div>
      <div class="ali-actions">
        <button class="toggle-btn${a.active ? ' on' : ''}" onclick="toggleAlert(${a.id})">
          ${a.active ? 'Active' : 'Paused'}
        </button>
        <button class="del-btn" onclick="deleteAlert(${a.id})" aria-label="Delete alert for ${a.keywords}">
          <i class="ti ti-trash"></i>
        </button>
      </div>
    </div>`).join('');
}

function updateAlertBadge() {
  const tab = document.getElementById('alertsTab');
  let b = tab.querySelector('.badge-count');
  if (!b) { b = document.createElement('span'); b.className = 'badge-count'; tab.appendChild(b); }
  if (jobAlerts.length > 0) { b.textContent = jobAlerts.length; b.style.display = ''; }
  else { b.style.display = 'none'; }
}

// ---- Filtering ----
function filterJobs() {
  const q = document.getElementById('searchInput').value.toLowerCase().trim();
  filteredJobs = JOBS.filter(j => {
    const matchFilter =
      activeFilter === 'all' ||
      j.type === activeFilter ||
      j.tags.includes(activeFilter) ||
      (activeFilter === 'executive'   && j.tags.includes('executive'))   ||
      (activeFilter === 'coordinator' && j.tags.includes('coordinator')) ||
      (activeFilter === 'sourcer'     && j.tags.includes('sourcer'));
    if (!matchFilter) return false;
    if (!q) return true;
    return (j.title + j.company + j.location + j.desc + j.tags.join(' ')).toLowerCase().includes(q);
  });
  renderList();
}

function setFilter(type, btn) {
  activeFilter = type;
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  filterJobs();
}

// ---- Salary ----
function renderSalary() {
  const maxSal = 240;
  const colors = { corporate: '#1D9E75', agency: '#185FA5', executive: '#534AB7' };
  document.getElementById('salBars').innerHTML = SAL_DATA.map(d => {
    const mid = Math.round(((d.min + d.max) / 2 / maxSal) * 100);
    return `
      <div class="sal-row">
        <div class="sal-label">${d.label}</div>
        <div class="sal-bar-wrap">
          <div class="sal-bar" style="width:${mid}%;background:${colors[d.type]}"></div>
        </div>
        <div class="sal-val">$${d.min}K – $${d.max}K</div>
      </div>`;
  }).join('');
}

// ---- Init ----
document.addEventListener('DOMContentLoaded', () => {
  loadState();
  renderList();
});
