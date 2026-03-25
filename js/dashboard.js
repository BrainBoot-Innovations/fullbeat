// FullBeat — Dashboard Module (Daily/Weekly Command Center)

var _dashboardData = { plan: null, testCases: [], executions: [], bugs: [], users: [] };
var _currentFilter = 'today';
var _filterFrom = null;
var _filterTo = null;

// === Main Init ===
async function initDashboard() {
    try {
        var session = await requireAuth();
        if (!session) return;
        await initAppShell(session);

        // Set default date range to today
        var today = new Date().toISOString().split('T')[0];
        document.getElementById('filter-date-from').value = today;
        document.getElementById('filter-date-to').value = today;

        await loadDashboardData();
    } catch (err) {
        console.error('Dashboard init error:', err);
        showToast('Failed to load dashboard', 'error');
    }
}

// === Date Filter ===
function setDateFilter(mode) {
    _currentFilter = mode;
    // Update active button
    ['filter-today', 'filter-week', 'filter-all'].forEach(function(id) {
        var el = document.getElementById(id);
        if (el) el.classList.remove('active-filter');
    });
    var activeBtn = document.getElementById('filter-' + mode);
    if (activeBtn) activeBtn.classList.add('active-filter');

    var now = new Date();
    var today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    if (mode === 'today') {
        _filterFrom = today;
        _filterTo = new Date(today.getTime() + 86400000);
    } else if (mode === 'week') {
        var dayOfWeek = today.getDay();
        var monday = new Date(today.getTime() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1) * 86400000);
        _filterFrom = monday;
        _filterTo = new Date(monday.getTime() + 7 * 86400000);
    } else if (mode === 'all') {
        _filterFrom = null;
        _filterTo = null;
    } else if (mode === 'custom') {
        var fromVal = document.getElementById('filter-date-from').value;
        var toVal = document.getElementById('filter-date-to').value;
        _filterFrom = fromVal ? new Date(fromVal) : null;
        _filterTo = toVal ? new Date(new Date(toVal).getTime() + 86400000) : null;
    }

    refreshDashboard();
}

function filterByDate(items, dateField) {
    if (!_filterFrom && !_filterTo) return items;
    return items.filter(function(item) {
        var d = item[dateField] ? new Date(item[dateField]) : null;
        if (!d) return _currentFilter === 'all';
        if (_filterFrom && d < _filterFrom) return false;
        if (_filterTo && d >= _filterTo) return false;
        return true;
    });
}

function refreshDashboard() {
    var label = document.getElementById('filter-label');
    if (label) {
        if (_currentFilter === 'today') label.textContent = '(Today)';
        else if (_currentFilter === 'week') label.textContent = '(This Week)';
        else if (_currentFilter === 'all') label.textContent = '(All Time)';
        else label.textContent = '(Custom Range)';
    }

    var filteredExecs = filterByDate(_dashboardData.executions, 'executed_at');
    var filteredBugs = _currentFilter === 'all' ? _dashboardData.bugs : filterByDate(_dashboardData.bugs, 'created_at');

    var viewData = {
        plan: _dashboardData.plan,
        testCases: _dashboardData.testCases,
        executions: filteredExecs,
        bugs: filteredBugs,
        users: _dashboardData.users,
        allBugs: _dashboardData.bugs
    };

    var stats = computeStats(viewData);
    renderStats(stats);
    renderVerdict(stats);
    renderBugList(viewData.allBugs);
    renderTesterCards(viewData);
    renderModuleBreakdown(viewData);
}

// === Load Data ===
async function loadDashboardData() {
    if (typeof DEV_MODE !== 'undefined' && DEV_MODE) {
        _dashboardData.testCases = JSON.parse(localStorage.getItem('fullbeat_dev_test_cases') || 'null') || getMockTestCases();
        _dashboardData.executions = JSON.parse(localStorage.getItem('fullbeat_dev_executions') || 'null') || getMockExecutions();
        _dashboardData.bugs = JSON.parse(localStorage.getItem('fullbeat_dev_bugs') || 'null') || getMockBugs();
        _dashboardData.users = getMockUsers();
        var storedPlans = JSON.parse(localStorage.getItem('fullbeat_dev_plans') || 'null');
        _dashboardData.plan = storedPlans ? (storedPlans.find(function(p) { return p.status === 'active'; }) || storedPlans[0]) : getMockActivePlan();

        renderActivePlan(_dashboardData.plan);
        setDateFilter('all'); // start with all time to show data
        return;
    }

    // Production: fetch from Supabase
    var projectId = getSelectedProjectId();
    if (!projectId) return;
    try {
        var planRes = await supabase.from('test_plans').select('*').eq('project_id', projectId).eq('status', 'active').limit(1).single();
        _dashboardData.plan = planRes.data;
        if (_dashboardData.plan) {
            var execRes = await supabase.from('test_executions').select('*').eq('plan_id', _dashboardData.plan.id);
            _dashboardData.executions = execRes.data || [];
            var tcRes = await supabase.from('test_cases').select('*').eq('project_id', projectId).eq('is_active', true);
            _dashboardData.testCases = tcRes.data || [];
        }
        var bugRes = await supabase.from('bugs').select('*').eq('project_id', projectId);
        _dashboardData.bugs = bugRes.data || [];
        var userRes = await supabase.from('user_profiles').select('*').eq('is_active', true);
        _dashboardData.users = userRes.data || [];
        renderActivePlan(_dashboardData.plan);
        setDateFilter('today');
    } catch (err) {
        console.error('Error loading dashboard data:', err);
        showToast('Error loading dashboard data', 'error');
    }
}

// === Compute Stats ===
function computeStats(data) {
    var plan = data.plan;
    var executions = data.executions || [];
    var bugs = data.allBugs || data.bugs || [];
    var testCases = data.testCases || [];

    var planExecs = executions;
    if (plan && plan.id) {
        planExecs = executions.filter(function(e) { return e.plan_name === plan.name || e.plan_id === plan.id; });
    }

    var total = plan ? (plan.total_cases || (plan.items ? plan.items.length : testCases.length)) : testCases.length;
    var pass = 0, fail = 0, blocked = 0, executed = 0, functionalFails = 0, negativeFails = 0;

    planExecs.forEach(function(e) {
        if (e.status === 'pass') { pass++; executed++; }
        else if (e.status === 'fail') {
            fail++; executed++;
            var tc = testCases.find(function(t) { return t.tc_index === e.tc_index || t.id === e.test_case_id; });
            if (tc && tc.category === 'negative') negativeFails++; else functionalFails++;
        } else if (e.status === 'blocked') { blocked++; executed++; }
    });

    var pending = Math.max(0, total - executed);
    var rate = executed > 0 ? Math.round((pass / executed) * 100) : 0;
    var coveragePct = total > 0 ? Math.round((executed / total) * 100) : 0;

    var bugsOpen = bugs.filter(function(b) { return b.fix_status === 'open' || b.status === 'open'; }).length;
    var bugsInProgress = bugs.filter(function(b) { return b.fix_status === 'in_progress'; }).length;
    var bugsFixed = bugs.filter(function(b) { return b.fix_status === 'fixed'; }).length;
    var bugsClosed = bugs.filter(function(b) { return b.fix_status === 'closed' || b.fix_status === 'verified'; }).length;
    var regressionFlags = bugs.filter(function(b) {
        return (b.fix_status === 'open') && (b.severity === 'critical' || b.severity === 'high');
    }).length;

    return {
        total: total, executed: executed, pass: pass, fail: fail, blocked: blocked,
        pending: pending, rate: rate, coveragePct: coveragePct,
        openBugs: bugsOpen, regressionFlags: regressionFlags,
        bugsOpen: bugsOpen, bugsInProgress: bugsInProgress, bugsFixed: bugsFixed, bugsClosed: bugsClosed,
        functionalFails: functionalFails, negativeFails: negativeFails
    };
}

// === Render Active Plan ===
function renderActivePlan(plan) {
    var c = document.getElementById('active-plan-info');
    if (!c) return;
    if (!plan) { c.innerHTML = '<p class="text-muted">No active plan selected</p>'; return; }
    var total = plan.total_cases || (plan.items ? plan.items.length : 0);
    c.innerHTML =
        '<div class="plan-info-grid">' +
        '<div class="plan-info-item"><strong>Plan</strong>' + escapeHtml(plan.name || plan.plan_name) + '</div>' +
        '<div class="plan-info-item"><strong>Type</strong>' + escapeHtml(plan.type || plan.plan_type || '—') + '</div>' +
        '<div class="plan-info-item"><strong>Environment</strong>' + escapeHtml(plan.environment || '—') + '</div>' +
        '<div class="plan-info-item"><strong>Cases</strong>' + total + '</div>' +
        '</div>';
}

// === Render Stats ===
function renderStats(stats) {
    setText('stat-total', stats.total);
    setText('stat-executed', stats.executed);
    setText('stat-pass', stats.pass);
    setText('stat-fail', stats.fail);
    setText('stat-rate', stats.rate + '%');
    setText('stat-coverage', stats.coveragePct + '%');
    setText('stat-blocked', stats.blocked);
    setText('stat-pending', stats.pending);
    setText('stat-bugs', stats.openBugs);
    setText('stat-regression', stats.regressionFlags);
    setText('bugs-open', stats.bugsOpen);
    setText('bugs-in-progress', stats.bugsInProgress);
    setText('bugs-fixed', stats.bugsFixed);
    setText('bugs-closed', stats.bugsClosed);
}

function setText(id, value) {
    var el = document.getElementById(id);
    if (el) el.textContent = value;
}

// === Render Verdict ===
function renderVerdict(stats) {
    var banner = document.getElementById('verdict-banner');
    var textEl = document.getElementById('verdict-text');
    if (!banner || !textEl) return;
    banner.className = 'verdict-banner';

    if (stats.total === 0 || stats.executed === 0) {
        banner.classList.add('verdict-progress');
        textEl.textContent = 'NOT STARTED';
    } else if (stats.executed < stats.total) {
        banner.classList.add('verdict-progress');
        textEl.textContent = 'IN PROGRESS (' + stats.executed + '/' + stats.total + ')';
    } else if (stats.fail === 0) {
        banner.classList.add('verdict-go');
        textEl.textContent = 'GO FOR PRODUCTION';
    } else if (stats.functionalFails > 0) {
        banner.classList.add('verdict-nogo');
        textEl.textContent = 'NO-GO (' + stats.fail + ' failures)';
    } else if (stats.negativeFails <= 5) {
        banner.classList.add('verdict-conditional');
        textEl.textContent = 'CONDITIONAL GO (' + stats.negativeFails + ' negative fails)';
    } else {
        banner.classList.add('verdict-nogo');
        textEl.textContent = 'NO-GO (' + stats.fail + ' failures)';
    }
}

// === Render Bug List Table ===
function renderBugList(bugs) {
    var tbody = document.getElementById('bug-list-tbody');
    var countBadge = document.getElementById('bug-list-count');
    if (!tbody) return;

    if (countBadge) countBadge.textContent = bugs.length > 0 ? bugs.length : '';

    if (!bugs || bugs.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:24px;color:#94a3b8;">No bugs reported yet</td></tr>';
        return;
    }

    // Sort: open first, then by severity (critical > major > minor > cosmetic), then by date
    var severityOrder = { critical: 0, high: 0, major: 1, medium: 1, minor: 2, low: 2, cosmetic: 3 };
    var statusOrder = { open: 0, in_progress: 1, fixed: 2, verified: 3, closed: 4, wont_fix: 5 };

    var sorted = bugs.slice().sort(function(a, b) {
        var sa = statusOrder[a.fix_status] || statusOrder[a.status] || 0;
        var sb = statusOrder[b.fix_status] || statusOrder[b.status] || 0;
        if (sa !== sb) return sa - sb;
        var pa = severityOrder[a.severity] !== undefined ? severityOrder[a.severity] : 9;
        var pb = severityOrder[b.severity] !== undefined ? severityOrder[b.severity] : 9;
        if (pa !== pb) return pa - pb;
        return new Date(b.created_at || 0) - new Date(a.created_at || 0);
    });

    tbody.innerHTML = sorted.map(function(bug) {
        var sev = bug.severity || 'unknown';
        var rowClass = 'bug-table-row-' + (sev === 'critical' || sev === 'high' ? 'critical' : sev === 'major' || sev === 'medium' ? 'major' : sev === 'minor' || sev === 'low' ? 'minor' : 'cosmetic');
        var fixStatus = bug.fix_status || bug.status || 'open';
        var sevBadge = getSeverityBadge(sev);
        var statusBadge = getFixStatusBadge(fixStatus);
        var dateStr = bug.created_at ? formatDate(bug.created_at) : '—';
        var filedBy = bug.filed_by_name || bug.reported_by_name || bug.tester_code || '—';
        var bugId = bug.bug_id_display || bug.bug_code || ('BUG-' + (bug.bug_index || '?'));

        return '<tr class="' + rowClass + '">' +
            '<td><strong>' + escapeHtml(bugId) + '</strong></td>' +
            '<td>' + sevBadge + '</td>' +
            '<td>' + escapeHtml(bug.title) + '</td>' +
            '<td>' + escapeHtml(bug.module || '—') + '</td>' +
            '<td>' + statusBadge + '</td>' +
            '<td>' + escapeHtml(filedBy) + '</td>' +
            '<td>' + dateStr + '</td>' +
            '</tr>';
    }).join('');
}

function getSeverityBadge(sev) {
    var map = { critical: 'badge-danger', high: 'badge-danger', major: 'badge-warning', medium: 'badge-warning', minor: 'badge-info', low: 'badge-info', cosmetic: '' };
    var label = sev.charAt(0).toUpperCase() + sev.slice(1);
    return '<span class="badge ' + (map[sev] || '') + '">' + label + '</span>';
}

function getFixStatusBadge(status) {
    var map = { open: 'badge-danger', in_progress: 'badge-warning', fixed: 'badge-primary', verified: 'badge-success', closed: 'badge-success', wont_fix: '', not_started: 'badge-danger' };
    var labels = { open: 'Open', in_progress: 'In Progress', fixed: 'Fixed', verified: 'Verified', closed: 'Closed', wont_fix: "Won't Fix", not_started: 'Open' };
    return '<span class="badge ' + (map[status] || '') + '">' + (labels[status] || status) + '</span>';
}

// === Render Tester Cards ===
function renderTesterCards(data) {
    var container = document.getElementById('tester-cards');
    if (!container) return;
    var users = data.users || [];
    var executions = data.executions || [];
    var bugs = data.allBugs || data.bugs || [];
    var plan = data.plan;

    var planExecs = executions;
    if (plan && plan.name) {
        planExecs = executions.filter(function(e) { return e.plan_name === plan.name || e.plan_id === plan.id; });
    }

    var testers = users.filter(function(u) { return u.role !== 'admin'; });
    if (testers.length === 0) { container.innerHTML = '<p class="text-muted">No testers found</p>'; return; }

    container.innerHTML = '';
    testers.forEach(function(tester) {
        var tExecs = planExecs.filter(function(e) { return e.executed_by === tester.id || e.tester_code === tester.tester_code; });
        var assigned = tExecs.length;
        var pass = tExecs.filter(function(e) { return e.status === 'pass'; }).length;
        var fail = tExecs.filter(function(e) { return e.status === 'fail'; }).length;
        var blocked = tExecs.filter(function(e) { return e.status === 'blocked'; }).length;
        var bugsCount = bugs.filter(function(b) { return b.filed_by === tester.id || b.reported_by === tester.id || b.tester_code === tester.tester_code; }).length;
        var done = pass + fail + blocked;
        var pct = assigned > 0 ? Math.round((done / assigned) * 100) : 0;

        var card = document.createElement('div');
        card.className = 'tester-card';
        card.innerHTML =
            '<div class="tester-card-header">' +
                '<span class="tester-card-name">' + escapeHtml(tester.display_name) + '</span>' +
                '<span class="badge badge-info" style="background:rgba(99,102,241,0.1);color:#6366f1;">' + escapeHtml(tester.tester_code) + '</span>' +
            '</div>' +
            '<div class="tester-card-stats">' +
                '<div><span class="stat-num">' + assigned + '</span><span class="stat-lbl">Assigned</span></div>' +
                '<div><span class="stat-num" style="color:#22c55e;">' + pass + '</span><span class="stat-lbl">Pass</span></div>' +
                '<div><span class="stat-num" style="color:#ef4444;">' + fail + '</span><span class="stat-lbl">Fail</span></div>' +
                '<div><span class="stat-num" style="color:#f59e0b;">' + bugsCount + '</span><span class="stat-lbl">Bugs</span></div>' +
            '</div>' +
            '<div class="progress-bar-container"><div class="progress-bar bar-success" style="width:' + pct + '%"></div></div>' +
            '<div style="text-align:right;font-size:12px;color:#6b7280;margin-top:4px;">' + pct + '% complete</div>';
        container.appendChild(card);
    });
}

// === Render Module Breakdown ===
function renderModuleBreakdown(data) {
    var tbody = document.getElementById('module-tbody');
    if (!tbody) return;
    var testCases = data.testCases || [];
    var executions = data.executions || [];
    var bugs = data.allBugs || data.bugs || [];
    var plan = data.plan;

    var planExecs = executions;
    if (plan && plan.name) {
        planExecs = executions.filter(function(e) { return e.plan_name === plan.name || e.plan_id === plan.id; });
    }

    var moduleMap = {};
    testCases.forEach(function(tc) {
        var mod = tc.module;
        if (!moduleMap[mod]) moduleMap[mod] = { total: 0, pass: 0, fail: 0, pending: 0, blocked: 0 };
        moduleMap[mod].total++;
    });
    planExecs.forEach(function(e) {
        var mod = e.module;
        if (!moduleMap[mod]) moduleMap[mod] = { total: 0, pass: 0, fail: 0, pending: 0, blocked: 0 };
        if (e.status === 'pass') moduleMap[mod].pass++;
        else if (e.status === 'fail') moduleMap[mod].fail++;
        else if (e.status === 'blocked') moduleMap[mod].blocked++;
    });

    var bugsByModule = {};
    bugs.forEach(function(b) { if (b.module) bugsByModule[b.module] = (bugsByModule[b.module] || 0) + 1; });

    var modules = Object.keys(moduleMap).sort();
    modules.forEach(function(mod) {
        var m = moduleMap[mod];
        m.pending = Math.max(0, m.total - m.pass - m.fail - m.blocked);
    });

    tbody.innerHTML = '';
    if (modules.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" class="text-muted" style="text-align:center;padding:24px;">No module data</td></tr>';
        return;
    }

    modules.forEach(function(mod) {
        var m = moduleMap[mod];
        var executed = m.pass + m.fail + m.blocked;
        var pct = m.total > 0 ? Math.round((executed / m.total) * 100) : 0;
        var tr = document.createElement('tr');
        tr.innerHTML =
            '<td><strong>' + escapeHtml(mod) + '</strong></td>' +
            '<td>' + m.total + '</td>' +
            '<td style="color:#22c55e;font-weight:600;">' + m.pass + '</td>' +
            '<td style="color:#ef4444;font-weight:600;">' + m.fail + '</td>' +
            '<td>' + m.blocked + '</td>' +
            '<td style="color:#ef4444;">' + (bugsByModule[mod] || 0) + '</td>' +
            '<td>' + m.pending + '</td>' +
            '<td style="min-width:100px;"><div class="progress-bar-container"><div class="progress-bar bar-success" style="width:' + pct + '%"></div></div><div style="font-size:11px;color:#6b7280;margin-top:2px;">' + pct + '%</div></td>';
        tbody.appendChild(tr);
    });
}

// === Export Functions ===
function exportCSVResults() {
    var execs = _dashboardData.executions || [];
    if (execs.length === 0) { showToast('No data to export', 'warning'); return; }
    var rows = ['TC Index,Scenario,Module,Status,Tester,Remarks,Date'];
    execs.forEach(function(e) {
        rows.push([e.tc_index, '"' + (e.scenario || '').replace(/"/g, '""') + '"', e.module, e.status, e.executed_by_name || e.tester_code, '"' + (e.remarks || '').replace(/"/g, '""') + '"', e.executed_at || ''].join(','));
    });
    downloadCSV('fullbeat_results.csv', rows.join('\n'));
    showToast('Results exported', 'success');
}

function exportCSVBugs() {
    var bugs = _dashboardData.bugs || [];
    if (bugs.length === 0) { showToast('No bugs to export', 'warning'); return; }
    var rows = ['Bug ID,Title,Module,Severity,Fix Status,Filed By,Created'];
    bugs.forEach(function(b) {
        rows.push([(b.bug_id_display || b.bug_code || ''), '"' + (b.title || '').replace(/"/g, '""') + '"', b.module, b.severity, b.fix_status || b.status, b.filed_by_name || b.reported_by_name || '', b.created_at || ''].join(','));
    });
    downloadCSV('fullbeat_bugs.csv', rows.join('\n'));
    showToast('Bugs exported', 'success');
}

function exportJSON() {
    downloadJSON('fullbeat_export.json', {
        exported_at: new Date().toISOString(),
        plan: _dashboardData.plan,
        executions: _dashboardData.executions,
        bugs: _dashboardData.bugs,
        test_cases: _dashboardData.testCases
    });
    showToast('JSON exported', 'success');
}

// === Bootstrap ===
document.addEventListener('DOMContentLoaded', initDashboard);
