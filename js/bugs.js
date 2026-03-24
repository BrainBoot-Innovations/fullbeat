// FullBeat — Bug Tracker Module

let allBugs = [];
let currentBugId = null;

// Mock bugs for DEV_MODE
function getPageMockBugs() {
    return [
        {
            id: generateId(),
            project_id: 'proj-1',
            bug_id_display: 'T01-001',
            tc_id: 'TC-003',
            module: 'Authentication',
            severity: 'critical',
            title: 'Login fails with valid credentials',
            description: 'When entering correct email and password, the login button submits but returns a generic error. Users cannot access the system with known-good credentials.',
            fix_status: 'open',
            retest_status: 'pending',
            filed_by: 'user-001',
            filed_by_name: 'Dhivya',
            tester_code: 'T01',
            fixed_by: '',
            fix_description: '',
            steps_to_reproduce: '1. Go to login page\n2. Enter valid email: admin@brainboot.co.in\n3. Enter valid password: Admin@1234\n4. Click Login\n5. Observe error message instead of redirect',
            environment: 'Chrome 122, Windows 11',
            created_at: '2026-03-18T10:30:00Z',
            updated_at: '2026-03-18T10:30:00Z'
        },
        {
            id: generateId(),
            project_id: 'proj-1',
            bug_id_display: 'T02-001',
            tc_id: 'TC-007',
            module: 'Dashboard',
            severity: 'major',
            title: 'Dashboard stats not updating',
            description: 'After executing new test cases, the dashboard summary cards still show stale data. Requires a full page refresh to update.',
            fix_status: 'in_progress',
            retest_status: 'pending',
            filed_by: 'user-002',
            filed_by_name: 'Divish',
            tester_code: 'T02',
            fixed_by: 'Dev Team',
            fix_description: 'Investigating realtime subscription issue.',
            steps_to_reproduce: '1. Execute a test case with pass/fail\n2. Navigate to Dashboard\n3. Observe summary cards show old numbers\n4. Only updates after manual browser refresh',
            environment: 'Firefox 124, macOS Sonoma',
            created_at: '2026-03-19T09:00:00Z',
            updated_at: '2026-03-21T14:00:00Z'
        },
        {
            id: generateId(),
            project_id: 'proj-1',
            bug_id_display: 'T01-002',
            tc_id: 'TC-015',
            module: 'Notifications',
            severity: 'minor',
            title: 'Typo in error message',
            description: 'The error toast for failed saves reads "Somthing went wrong" instead of "Something went wrong".',
            fix_status: 'fixed',
            retest_status: 'pass',
            filed_by: 'user-001',
            filed_by_name: 'Dhivya',
            tester_code: 'T01',
            fixed_by: 'Admin Dev',
            fix_description: 'Corrected typo in utils.js error message string.',
            steps_to_reproduce: '1. Disconnect from internet\n2. Try to save a test case\n3. Observe error toast text',
            environment: 'Chrome 122, Windows 11',
            created_at: '2026-03-15T11:00:00Z',
            updated_at: '2026-03-17T16:00:00Z'
        },
        {
            id: generateId(),
            project_id: 'proj-1',
            bug_id_display: 'T03-001',
            tc_id: 'TC-022',
            module: 'User Profile',
            severity: 'cosmetic',
            title: 'Button alignment off on mobile',
            description: 'On mobile viewports below 400px, the Save and Cancel buttons in the profile modal overlap slightly and are not properly centered.',
            fix_status: 'verified',
            retest_status: 'pass',
            filed_by: 'user-003',
            filed_by_name: 'Mugilan',
            tester_code: 'T03',
            fixed_by: 'Admin Dev',
            fix_description: 'Added flex-wrap and gap to modal footer for small viewports.',
            steps_to_reproduce: '1. Open app on mobile (< 400px viewport)\n2. Open profile edit modal\n3. Observe Save and Cancel buttons overlap',
            environment: 'Safari, iPhone SE, iOS 17.3',
            created_at: '2026-03-10T14:00:00Z',
            updated_at: '2026-03-20T10:00:00Z'
        },
        {
            id: generateId(),
            project_id: 'proj-1',
            bug_id_display: 'T02-002',
            tc_id: 'TC-010',
            module: 'Settings',
            severity: 'major',
            title: 'Export CSV missing headers',
            description: 'When exporting test execution results to CSV, the first row (column headers) is missing. Data starts immediately without header labels.',
            fix_status: 'fixed',
            retest_status: 'pending',
            filed_by: 'user-002',
            filed_by_name: 'Divish',
            tester_code: 'T02',
            fixed_by: 'Dev Team',
            fix_description: 'Added header row to CSV export function.',
            steps_to_reproduce: '1. Go to Execution page\n2. Click Export CSV\n3. Open downloaded CSV file\n4. Observe no header row — data starts on row 1',
            environment: 'Chrome 122, Windows 11',
            created_at: '2026-03-20T08:00:00Z',
            updated_at: '2026-03-22T11:00:00Z'
        }
    ];
}

// ============================================================
// INITIALIZATION
// ============================================================

async function initBugs() {
    const session = await requireAuth();
    if (!session) return;

    const profile = await initAppShell(session);
    if (!profile) return;

    // Load bugs data
    await loadBugs();

    // Bind filter events
    document.getElementById('bug-filter-severity').addEventListener('change', filterBugs);
    document.getElementById('bug-filter-status').addEventListener('change', filterBugs);
    document.getElementById('bug-filter-tester').addEventListener('change', filterBugs);
    document.getElementById('bug-filter-search').addEventListener('input', debounce(filterBugs, 300));
}

// ============================================================
// DATA LOADING
// ============================================================

async function loadBugs() {
    if (DEV_MODE) {
        console.log('[DEV MODE] Loading mock bugs');
        allBugs = getPageMockBugs();
        populateTesterFilter(allBugs);
        renderBugStats(allBugs);
        renderBugs(allBugs);
        return;
    }

    const projectId = getSelectedProjectId();
    if (!projectId) return;

    const { data, error } = await supabase
        .from('bugs')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error loading bugs:', error);
        showToast('Failed to load bugs', 'error');
        return;
    }

    allBugs = data || [];
    populateTesterFilter(allBugs);
    renderBugStats(allBugs);
    renderBugs(allBugs);
}

// ============================================================
// RENDERING
// ============================================================

function renderBugs(bugs) {
    const tbody = document.getElementById('bugs-tbody');
    if (!tbody) return;

    if (bugs.length === 0) {
        tbody.innerHTML = '<tr><td colspan="10" style="text-align:center;padding:32px;color:#94a3b8;">No bugs found</td></tr>';
        return;
    }

    tbody.innerHTML = bugs.map(bug => {
        const severityBadge = getSeverityBadge(bug.severity);
        const fixBadge = getFixStatusBadge(bug.fix_status);
        const retestBadge = getRetestBadge(bug.retest_status);

        return `<tr>
            <td><strong>${escapeHtml(bug.bug_id_display)}</strong></td>
            <td>${escapeHtml(bug.tc_id)}</td>
            <td>${escapeHtml(bug.module)}</td>
            <td>${severityBadge}</td>
            <td>${escapeHtml(bug.title)}</td>
            <td>${fixBadge}</td>
            <td>${retestBadge}</td>
            <td>${escapeHtml(bug.filed_by_name)} <span class="badge badge-info">${escapeHtml(bug.tester_code)}</span></td>
            <td>${formatDate(bug.created_at)}</td>
            <td><button class="btn btn-ghost btn-sm" onclick="openBugDetail('${bug.id}')">View</button></td>
        </tr>`;
    }).join('');
}

function renderBugStats(bugs) {
    const total = bugs.length;
    const open = bugs.filter(b => b.fix_status === 'open').length;
    const inProgress = bugs.filter(b => b.fix_status === 'in_progress').length;
    const fixed = bugs.filter(b => b.fix_status === 'fixed').length;
    const closed = bugs.filter(b => b.fix_status === 'closed' || b.fix_status === 'verified').length;

    document.getElementById('bug-stat-total').textContent = total;
    document.getElementById('bug-stat-open').textContent = open;
    document.getElementById('bug-stat-progress').textContent = inProgress;
    document.getElementById('bug-stat-fixed').textContent = fixed;
    document.getElementById('bug-stat-closed').textContent = closed;
}

// ============================================================
// BADGE HELPERS
// ============================================================

function getSeverityBadge(severity) {
    const map = {
        critical: 'badge-danger',
        major: 'badge-warning',
        minor: 'badge-info',
        cosmetic: ''
    };
    const cls = map[severity] || '';
    const label = severity ? severity.charAt(0).toUpperCase() + severity.slice(1) : 'Unknown';
    return `<span class="badge ${cls}">${label}</span>`;
}

function getFixStatusBadge(status) {
    const map = {
        open: 'badge-danger',
        in_progress: 'badge-warning',
        fixed: 'badge-primary',
        verified: 'badge-success',
        closed: 'badge-success',
        wont_fix: ''
    };
    const labels = {
        open: 'Open',
        in_progress: 'In Progress',
        fixed: 'Fixed',
        verified: 'Verified',
        closed: 'Closed',
        wont_fix: "Won't Fix"
    };
    const cls = map[status] || '';
    const label = labels[status] || status || 'Unknown';
    return `<span class="badge ${cls}">${label}</span>`;
}

function getRetestBadge(status) {
    const map = {
        pending: 'badge-warning',
        pass: 'badge-success',
        fail: 'badge-danger'
    };
    const labels = {
        pending: 'Pending',
        pass: 'Pass',
        fail: 'Fail'
    };
    const cls = map[status] || '';
    const label = labels[status] || status || '—';
    return `<span class="badge ${cls}">${label}</span>`;
}

// ============================================================
// FILTERS
// ============================================================

function populateTesterFilter(bugs) {
    const select = document.getElementById('bug-filter-tester');
    if (!select) return;

    // Keep the "All Testers" option
    select.innerHTML = '<option value="">All Testers</option>';

    // Extract unique testers
    const testers = new Map();
    bugs.forEach(b => {
        if (b.filed_by && b.filed_by_name) {
            testers.set(b.filed_by, `${b.filed_by_name} (${b.tester_code})`);
        }
    });

    testers.forEach((label, value) => {
        const opt = document.createElement('option');
        opt.value = value;
        opt.textContent = label;
        select.appendChild(opt);
    });
}

function filterBugs() {
    const severity = document.getElementById('bug-filter-severity').value;
    const status = document.getElementById('bug-filter-status').value;
    const tester = document.getElementById('bug-filter-tester').value;
    const search = document.getElementById('bug-filter-search').value.toLowerCase().trim();

    let filtered = allBugs;

    if (severity) {
        filtered = filtered.filter(b => b.severity === severity);
    }
    if (status) {
        filtered = filtered.filter(b => b.fix_status === status);
    }
    if (tester) {
        filtered = filtered.filter(b => b.filed_by === tester);
    }
    if (search) {
        filtered = filtered.filter(b =>
            (b.title && b.title.toLowerCase().includes(search)) ||
            (b.bug_id_display && b.bug_id_display.toLowerCase().includes(search)) ||
            (b.module && b.module.toLowerCase().includes(search)) ||
            (b.description && b.description.toLowerCase().includes(search))
        );
    }

    renderBugStats(filtered);
    renderBugs(filtered);
}

// ============================================================
// BUG DETAIL MODAL
// ============================================================

function openBugDetail(bugId) {
    const bug = allBugs.find(b => b.id === bugId);
    if (!bug) {
        showToast('Bug not found', 'error');
        return;
    }

    currentBugId = bugId;

    // Set modal title
    document.getElementById('bug-detail-title').textContent = `${bug.bug_id_display} — ${bug.title}`;

    // Populate bug info section (read-only)
    const infoSection = document.getElementById('bug-info-section');
    infoSection.innerHTML = `
        <div class="form-row">
            <div class="form-group">
                <label>Bug ID</label>
                <div class="field-value">${escapeHtml(bug.bug_id_display)}</div>
            </div>
            <div class="form-group">
                <label>Test Case</label>
                <div class="field-value">${escapeHtml(bug.tc_id)}</div>
            </div>
            <div class="form-group">
                <label>Module</label>
                <div class="field-value">${escapeHtml(bug.module)}</div>
            </div>
            <div class="form-group">
                <label>Severity</label>
                <div class="field-value">${getSeverityBadge(bug.severity)}</div>
            </div>
        </div>
        <div class="form-group">
            <label>Title</label>
            <div class="field-value">${escapeHtml(bug.title)}</div>
        </div>
        <div class="form-group">
            <label>Description</label>
            <div class="field-value">${escapeHtml(bug.description)}</div>
        </div>
        <div class="form-group">
            <label>Steps to Reproduce</label>
            <div class="field-value" style="white-space:pre-line;">${escapeHtml(bug.steps_to_reproduce)}</div>
        </div>
        <div class="form-row">
            <div class="form-group">
                <label>Environment</label>
                <div class="field-value">${escapeHtml(bug.environment)}</div>
            </div>
            <div class="form-group">
                <label>Filed By</label>
                <div class="field-value">${escapeHtml(bug.filed_by_name)} (${escapeHtml(bug.tester_code)})</div>
            </div>
            <div class="form-group">
                <label>Filed On</label>
                <div class="field-value">${formatDateTime(bug.created_at)}</div>
            </div>
        </div>
    `;

    // Populate fix details
    document.getElementById('detail-fix-status').value = bug.fix_status;
    document.getElementById('detail-fixed-by').value = bug.fixed_by || '';
    document.getElementById('detail-fix-desc').value = bug.fix_description || '';

    // Populate retest
    document.getElementById('detail-retest-status').value = bug.retest_status || 'pending';

    // Render timeline
    renderTimeline(bug);

    // Show modal
    document.getElementById('bug-detail-modal').classList.add('active');
}

// ============================================================
// TIMELINE
// ============================================================

function renderTimeline(bug) {
    const timeline = document.getElementById('bug-timeline');
    if (!timeline) return;

    const steps = [
        { key: 'open', label: 'Filed', icon: '1' },
        { key: 'in_progress', label: 'In Progress', icon: '2' },
        { key: 'fixed', label: 'Fixed', icon: '3' },
        { key: 'verified', label: 'Verified', icon: '4' },
        { key: 'closed', label: 'Closed', icon: '5' }
    ];

    const statusOrder = ['open', 'in_progress', 'fixed', 'verified', 'closed'];
    const currentIndex = statusOrder.indexOf(bug.fix_status);

    // Handle wont_fix specially
    const isWontFix = bug.fix_status === 'wont_fix';

    timeline.innerHTML = steps.map((step, i) => {
        let cls = 'timeline-step';
        if (isWontFix) {
            if (i === 0) {
                cls += ' completed';
            } else {
                cls += ' skipped';
            }
        } else if (i < currentIndex) {
            cls += ' completed';
        } else if (i === currentIndex) {
            cls += ' active';
        }

        return `<div class="${cls}">
            <div class="timeline-dot">${step.icon}</div>
            <div class="timeline-label">${step.label}</div>
        </div>`;
    }).join('');

    if (isWontFix) {
        timeline.innerHTML += `<div class="timeline-step active">
            <div class="timeline-dot">X</div>
            <div class="timeline-label">Won't Fix</div>
        </div>`;
    }
}

// ============================================================
// UPDATE ACTIONS
// ============================================================

async function updateFixStatus() {
    const bug = allBugs.find(b => b.id === currentBugId);
    if (!bug) return;

    const newStatus = document.getElementById('detail-fix-status').value;
    const fixedBy = document.getElementById('detail-fixed-by').value.trim();
    const fixDesc = document.getElementById('detail-fix-desc').value.trim();

    if (DEV_MODE) {
        console.log('[DEV MODE] Updating fix status:', newStatus);
        bug.fix_status = newStatus;
        bug.fixed_by = fixedBy;
        bug.fix_description = fixDesc;
        bug.updated_at = new Date().toISOString();
        showToast('Fix status updated', 'success');
        renderTimeline(bug);
        renderBugStats(allBugs);
        renderBugs(getFilteredBugs());
        return;
    }

    const { error } = await supabase
        .from('bugs')
        .update({
            fix_status: newStatus,
            fixed_by: fixedBy,
            fix_description: fixDesc,
            updated_at: new Date().toISOString()
        })
        .eq('id', currentBugId);

    if (error) {
        console.error('Error updating fix status:', error);
        showToast('Failed to update fix status', 'error');
        return;
    }

    bug.fix_status = newStatus;
    bug.fixed_by = fixedBy;
    bug.fix_description = fixDesc;
    bug.updated_at = new Date().toISOString();
    showToast('Fix status updated', 'success');
    renderTimeline(bug);
    renderBugStats(allBugs);
    renderBugs(getFilteredBugs());
}

async function updateRetestStatus() {
    const bug = allBugs.find(b => b.id === currentBugId);
    if (!bug) return;

    const newRetest = document.getElementById('detail-retest-status').value;

    if (DEV_MODE) {
        console.log('[DEV MODE] Updating retest status:', newRetest);
        bug.retest_status = newRetest;
        bug.updated_at = new Date().toISOString();

        // If retest passes, auto-advance fix status
        if (newRetest === 'pass') {
            bug.fix_status = 'verified';
            document.getElementById('detail-fix-status').value = 'verified';
            // Then close
            bug.fix_status = 'closed';
            document.getElementById('detail-fix-status').value = 'closed';
        }

        showToast('Retest status updated', 'success');
        renderTimeline(bug);
        renderBugStats(allBugs);
        renderBugs(getFilteredBugs());
        return;
    }

    const updates = {
        retest_status: newRetest,
        updated_at: new Date().toISOString()
    };

    // If retest passes, auto-advance to closed
    if (newRetest === 'pass') {
        updates.fix_status = 'closed';
    }

    const { error } = await supabase
        .from('bugs')
        .update(updates)
        .eq('id', currentBugId);

    if (error) {
        console.error('Error updating retest status:', error);
        showToast('Failed to update retest status', 'error');
        return;
    }

    bug.retest_status = newRetest;
    if (newRetest === 'pass') {
        bug.fix_status = 'closed';
        document.getElementById('detail-fix-status').value = 'closed';
    }
    bug.updated_at = new Date().toISOString();

    showToast('Retest status updated', 'success');
    renderTimeline(bug);
    renderBugStats(allBugs);
    renderBugs(getFilteredBugs());
}

// ============================================================
// HELPERS
// ============================================================

function getFilteredBugs() {
    const severity = document.getElementById('bug-filter-severity').value;
    const status = document.getElementById('bug-filter-status').value;
    const tester = document.getElementById('bug-filter-tester').value;
    const search = document.getElementById('bug-filter-search').value.toLowerCase().trim();

    let filtered = allBugs;

    if (severity) filtered = filtered.filter(b => b.severity === severity);
    if (status) filtered = filtered.filter(b => b.fix_status === status);
    if (tester) filtered = filtered.filter(b => b.filed_by === tester);
    if (search) {
        filtered = filtered.filter(b =>
            (b.title && b.title.toLowerCase().includes(search)) ||
            (b.bug_id_display && b.bug_id_display.toLowerCase().includes(search)) ||
            (b.module && b.module.toLowerCase().includes(search)) ||
            (b.description && b.description.toLowerCase().includes(search))
        );
    }

    return filtered;
}

function closeModal(id) {
    const modal = document.getElementById(id);
    if (modal) {
        modal.classList.remove('active');
    }
    if (id === 'bug-detail-modal') {
        currentBugId = null;
    }
}

// ============================================================
// BOOT
// ============================================================

document.addEventListener('DOMContentLoaded', initBugs);
