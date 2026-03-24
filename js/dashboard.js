// FullBeat — Dashboard Module

// Module-level data store for exports
var _dashboardData = {
    plan: null,
    testCases: [],
    executions: [],
    bugs: [],
    users: []
};

// === Main Init ===
async function initDashboard() {
    try {
        var session = await requireAuth();
        if (!session) return;

        await initAppShell(session);

        await loadDashboardData();
    } catch (err) {
        console.error('Dashboard init error:', err);
        showToast('Failed to load dashboard', 'error');
    }
}

// === Load Data ===
async function loadDashboardData() {
    if (typeof DEV_MODE !== 'undefined' && DEV_MODE) {
        console.log('[DEV MODE] Loading mock dashboard data');

        _dashboardData.testCases = JSON.parse(localStorage.getItem('fullbeat_dev_test_cases') || 'null') || getMockTestCases();
        _dashboardData.executions = JSON.parse(localStorage.getItem('fullbeat_dev_executions') || 'null') || getMockExecutions();
        _dashboardData.bugs = JSON.parse(localStorage.getItem('fullbeat_dev_bugs') || 'null') || getMockBugs();
        _dashboardData.users = getMockUsers();

        // Load active plan from stored plans
        var storedPlans = JSON.parse(localStorage.getItem('fullbeat_dev_plans') || 'null');
        if (storedPlans) {
            _dashboardData.plan = storedPlans.find(function(p) { return p.status === 'active'; }) || storedPlans[0];
        } else {
            _dashboardData.plan = getMockActivePlan();
        }

        renderActivePlan(_dashboardData.plan);
        var stats = computeStats(_dashboardData);
        renderStats(stats);
        renderVerdict(stats);
        renderTesterCards(_dashboardData);
        renderModuleBreakdown(_dashboardData);
        renderFailureAnalysis(_dashboardData);
        return;
    }

    // Production: fetch from Supabase
    var projectId = getSelectedProjectId();
    if (!projectId) {
        console.warn('No project selected');
        return;
    }

    try {
        // Fetch active plan
        var planRes = await supabase
            .from('test_plans')
            .select('*')
            .eq('project_id', projectId)
            .eq('status', 'active')
            .limit(1)
            .single();

        _dashboardData.plan = planRes.data;

        if (_dashboardData.plan) {
            // Fetch executions for active plan
            var execRes = await supabase
                .from('test_executions')
                .select('*')
                .eq('plan_id', _dashboardData.plan.id);

            _dashboardData.executions = execRes.data || [];

            // Fetch test cases for this project
            var tcRes = await supabase
                .from('test_cases')
                .select('*')
                .eq('project_id', projectId)
                .eq('is_active', true);

            _dashboardData.testCases = tcRes.data || [];
        }

        // Fetch open bugs
        var bugRes = await supabase
            .from('bugs')
            .select('*')
            .eq('project_id', projectId)
            .in('status', ['open', 'reopened']);

        _dashboardData.bugs = bugRes.data || [];

        // Fetch users
        var userRes = await supabase
            .from('user_profiles')
            .select('*')
            .eq('is_active', true);

        _dashboardData.users = userRes.data || [];

        renderActivePlan(_dashboardData.plan);
        var stats = computeStats(_dashboardData);
        renderStats(stats);
        renderVerdict(stats);
        renderTesterCards(_dashboardData);
        renderModuleBreakdown(_dashboardData);
        renderFailureAnalysis(_dashboardData);

    } catch (err) {
        console.error('Error loading dashboard data:', err);
        showToast('Error loading dashboard data', 'error');
    }
}

// === Compute Stats ===
function computeStats(data) {
    var plan = data.plan;
    var executions = data.executions || [];
    var bugs = data.bugs || [];
    var testCases = data.testCases || [];

    // Filter executions for active plan if in production mode
    var planExecs = executions;
    if (plan && plan.id) {
        planExecs = executions.filter(function (e) {
            return e.plan_name === plan.name || e.plan_id === plan.id;
        });
    }

    var total = plan ? (plan.total_cases || testCases.length) : testCases.length;
    var pass = 0;
    var fail = 0;
    var blocked = 0;
    var executed = 0;
    var functionalFails = 0;
    var negativeFails = 0;

    planExecs.forEach(function (e) {
        if (e.status === 'pass') {
            pass++;
            executed++;
        } else if (e.status === 'fail') {
            fail++;
            executed++;
            // Determine if it is a negative test case fail
            var tc = testCases.find(function (t) {
                return t.tc_index === e.tc_index || t.id === e.test_case_id;
            });
            if (tc && tc.category === 'negative') {
                negativeFails++;
            } else {
                functionalFails++;
            }
        } else if (e.status === 'blocked') {
            blocked++;
            executed++;
        }
    });

    var pending = total - executed;
    var rate = executed > 0 ? Math.round((pass / executed) * 100) : 0;

    var openBugs = bugs.filter(function (b) {
        return b.status === 'open' || b.status === 'reopened';
    }).length;

    var regressionFlags = bugs.filter(function (b) {
        return (b.status === 'open' || b.status === 'reopened') &&
               (b.severity === 'high' || b.severity === 'Critical');
    }).length;

    var coveragePct = total > 0 ? Math.round((executed / total) * 100) : 0;

    var bugsOpen = bugs.filter(function(b) { return b.fix_status === 'open' || b.status === 'open'; }).length;
    var bugsInProgress = bugs.filter(function(b) { return b.fix_status === 'in_progress'; }).length;
    var bugsFixed = bugs.filter(function(b) { return b.fix_status === 'fixed'; }).length;
    var bugsClosed = bugs.filter(function(b) { return b.fix_status === 'closed' || b.fix_status === 'verified'; }).length;

    return {
        total: total,
        executed: executed,
        pass: pass,
        fail: fail,
        blocked: blocked,
        coveragePct: coveragePct,
        bugsOpen: bugsOpen,
        bugsInProgress: bugsInProgress,
        bugsFixed: bugsFixed,
        bugsClosed: bugsClosed,
        pending: pending,
        rate: rate,
        openBugs: openBugs,
        regressionFlags: regressionFlags,
        functionalFails: functionalFails,
        negativeFails: negativeFails
    };
}

// === Render Active Plan ===
function renderActivePlan(plan) {
    var container = document.getElementById('active-plan-info');
    if (!container) return;

    if (!plan) {
        container.innerHTML = '<p class="text-muted">No active plan selected</p>';
        return;
    }

    var totalCases = plan.total_cases || (plan.items ? plan.items.length : 0);
    var teamNames = (plan.required_team || []).map(function(t) { return escapeHtml(t.name); }).join(', ');
    var deadlineStr = plan.deadline ? new Date(plan.deadline).toLocaleString() : null;

    // Check if deadline is approaching (within 24h) or passed
    var deadlineClass = '';
    if (plan.deadline) {
        var hoursLeft = (new Date(plan.deadline) - new Date()) / (1000 * 60 * 60);
        if (hoursLeft < 0) deadlineClass = 'color:#ef4444;font-weight:600;';
        else if (hoursLeft < 24) deadlineClass = 'color:#f59e0b;font-weight:600;';
    }

    container.innerHTML =
        '<div class="plan-info-grid">' +
            '<div class="plan-info-item">' +
                '<strong>Plan Name</strong>' +
                escapeHtml(plan.name) +
            '</div>' +
            '<div class="plan-info-item">' +
                '<strong>Type</strong>' +
                escapeHtml(plan.type || plan.status || 'Release') +
            '</div>' +
            '<div class="plan-info-item">' +
                '<strong>Environment</strong>' +
                escapeHtml(plan.environment || 'Staging') +
            '</div>' +
            '<div class="plan-info-item">' +
                '<strong>Total Cases</strong>' +
                totalCases +
            '</div>' +
        '</div>' +
        (plan.run_purpose ? '<div style="margin-top:12px;padding:10px 14px;background:#f0fdf4;border:1px solid #bbf7d0;border-radius:var(--radius);font-size:13px;">' +
            '<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;">' +
                '<div><strong style="color:#166534;">Run Purpose:</strong> ' + escapeHtml(plan.run_purpose) + '</div>' +
                (deadlineStr ? '<div><strong style="color:#166534;">Deadline:</strong> <span style="' + deadlineClass + '">' + deadlineStr + (deadlineClass.includes('ef4444') ? ' (OVERDUE)' : '') + '</span></div>' : '') +
                (teamNames ? '<div><strong style="color:#166534;">Required Team:</strong> ' + teamNames + '</div>' : '') +
                (plan.special_instructions ? '<div><strong style="color:#166534;">Instructions:</strong> ' + escapeHtml(plan.special_instructions) + '</div>' : '') +
            '</div>' +
        '</div>' : '');
}

// === Render Stats ===
function renderStats(stats) {
    setText('stat-total', stats.total);
    setText('stat-executed', stats.executed);
    setText('stat-pass', stats.pass);
    setText('stat-fail', stats.fail);
    setText('stat-rate', stats.rate + '%');
    setText('stat-bugs', stats.openBugs);
    setText('stat-regression', stats.regressionFlags);
    setText('stat-blocked', stats.blocked);
    setText('stat-coverage', stats.coveragePct + '%');
    setText('stat-pending', stats.pending);

    // Bug status
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

    // Remove all verdict classes
    banner.className = 'verdict-banner';

    if (stats.total === 0 || stats.executed === 0) {
        // NOT STARTED
        banner.classList.add('verdict-progress');
        textEl.textContent = 'NOT STARTED';
        return;
    }

    var allExecuted = stats.executed >= stats.total;

    if (!allExecuted) {
        // IN PROGRESS
        banner.classList.add('verdict-progress');
        textEl.textContent = 'IN PROGRESS (' + stats.executed + '/' + stats.total + ')';
        return;
    }

    // All executed
    if (stats.fail === 0) {
        // GO FOR PRODUCTION
        banner.classList.add('verdict-go');
        textEl.textContent = 'GO FOR PRODUCTION';
        return;
    }

    if (stats.functionalFails > 0) {
        // NO-GO: functional failures exist
        banner.classList.add('verdict-nogo');
        textEl.textContent = 'NO-GO (' + stats.fail + ' failures)';
        return;
    }

    if (stats.negativeFails > 0 && stats.negativeFails <= 5) {
        // CONDITIONAL GO: only negative fails, 5 or fewer
        banner.classList.add('verdict-conditional');
        textEl.textContent = 'CONDITIONAL GO (' + stats.negativeFails + ' negative fails)';
        return;
    }

    // Fallback: more than 5 negative fails
    banner.classList.add('verdict-nogo');
    textEl.textContent = 'NO-GO (' + stats.fail + ' failures)';
}

// === Render Tester Cards ===
function renderTesterCards(data) {
    var container = document.getElementById('tester-cards');
    if (!container) return;

    var users = data.users || [];
    var executions = data.executions || [];
    var plan = data.plan;

    // Filter executions for active plan
    var planExecs = executions;
    if (plan && plan.name) {
        planExecs = executions.filter(function (e) {
            return e.plan_name === plan.name || e.plan_id === plan.id;
        });
    }

    // Only include testers (non-admin users who have assigned executions)
    var testers = users.filter(function (u) {
        return u.role !== 'admin';
    });

    if (testers.length === 0) {
        container.innerHTML = '<p class="text-muted">No testers found</p>';
        return;
    }

    container.innerHTML = '';

    testers.forEach(function (tester) {
        var testerExecs = planExecs.filter(function (e) {
            return e.executed_by === tester.id || e.tester_code === tester.tester_code;
        });

        var assigned = testerExecs.length;
        var pass = testerExecs.filter(function (e) { return e.status === 'pass'; }).length;
        var fail = testerExecs.filter(function (e) { return e.status === 'fail'; }).length;
        var pending = testerExecs.filter(function (e) {
            return e.status !== 'pass' && e.status !== 'fail' && e.status !== 'blocked';
        }).length;
        var blocked = testerExecs.filter(function (e) { return e.status === 'blocked'; }).length;
        var done = pass + fail + blocked;
        var progressPct = assigned > 0 ? Math.round((done / assigned) * 100) : 0;

        var card = document.createElement('div');
        card.className = 'tester-card';
        card.innerHTML =
            '<div class="tester-card-header">' +
                '<span class="tester-card-name">' + escapeHtml(tester.display_name) + '</span>' +
                '<span class="badge badge-info" style="background:rgba(99,102,241,0.1);color:#6366f1;">' +
                    escapeHtml(tester.tester_code) +
                '</span>' +
            '</div>' +
            '<div class="tester-card-stats">' +
                '<div><span class="stat-num">' + assigned + '</span><span class="stat-lbl">Assigned</span></div>' +
                '<div><span class="stat-num" style="color:#22c55e;">' + pass + '</span><span class="stat-lbl">Pass</span></div>' +
                '<div><span class="stat-num" style="color:#ef4444;">' + fail + '</span><span class="stat-lbl">Fail</span></div>' +
                '<div><span class="stat-num">' + pending + '</span><span class="stat-lbl">Pending</span></div>' +
            '</div>' +
            '<div class="progress-bar-container">' +
                '<div class="progress-bar bar-success" style="width:' + progressPct + '%"></div>' +
            '</div>' +
            '<div style="text-align:right;font-size:12px;color:#6b7280;margin-top:4px;">' +
                progressPct + '% complete' +
            '</div>';

        container.appendChild(card);
    });
}

// === Render Module Breakdown ===
function renderModuleBreakdown(data) {
    var tbody = document.getElementById('module-tbody');
    if (!tbody) return;

    var testCases = data.testCases || [];
    var executions = data.executions || [];
    var plan = data.plan;

    // Filter executions for active plan
    var planExecs = executions;
    if (plan && plan.name) {
        planExecs = executions.filter(function (e) {
            return e.plan_name === plan.name || e.plan_id === plan.id;
        });
    }

    // Gather unique modules from test cases
    var moduleMap = {};
    testCases.forEach(function (tc) {
        var mod = tc.module;
        if (!moduleMap[mod]) {
            moduleMap[mod] = { total: 0, pass: 0, fail: 0, pending: 0, blocked: 0 };
        }
        moduleMap[mod].total++;
    });

    // Map executions to modules
    planExecs.forEach(function (e) {
        var mod = e.module;
        if (!moduleMap[mod]) {
            moduleMap[mod] = { total: 0, pass: 0, fail: 0, pending: 0, blocked: 0 };
        }
        if (e.status === 'pass') moduleMap[mod].pass++;
        else if (e.status === 'fail') moduleMap[mod].fail++;
        else if (e.status === 'blocked') moduleMap[mod].blocked++;
    });

    // Count bugs per module
    var bugsByModule = {};
    (data.bugs || []).forEach(function(b) {
        var mod = b.module;
        if (mod) bugsByModule[mod] = (bugsByModule[mod] || 0) + 1;
    });

    // Calculate pending for each module
    var modules = Object.keys(moduleMap).sort();
    modules.forEach(function (mod) {
        var m = moduleMap[mod];
        var executed = m.pass + m.fail + m.blocked;
        m.pending = Math.max(0, m.total - executed);
    });

    tbody.innerHTML = '';

    if (modules.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" class="text-muted text-center">No module data available</td></tr>';
        return;
    }

    modules.forEach(function (mod) {
        var m = moduleMap[mod];
        var executed = m.pass + m.fail + m.blocked;
        var progressPct = m.total > 0 ? Math.round((executed / m.total) * 100) : 0;

        var tr = document.createElement('tr');
        tr.innerHTML =
            '<td><strong>' + escapeHtml(mod) + '</strong></td>' +
            '<td>' + m.total + '</td>' +
            '<td style="color:#22c55e;font-weight:600;">' + m.pass + '</td>' +
            '<td style="color:#ef4444;font-weight:600;">' + m.fail + '</td>' +
            '<td>' + (m.blocked || 0) + '</td>' +
            '<td style="color:#ef4444;">' + (bugsByModule[mod] || 0) + '</td>' +
            '<td>' + m.pending + '</td>' +
            '<td style="min-width:120px;">' +
                '<div class="progress-bar-container">' +
                    '<div class="progress-bar bar-success" style="width:' + progressPct + '%"></div>' +
                '</div>' +
                '<div style="font-size:11px;color:#6b7280;margin-top:2px;">' + progressPct + '%</div>' +
            '</td>';
        tbody.appendChild(tr);
    });
}

// === Render Failure Analysis ===
function renderFailureAnalysis(data) {
    var card = document.getElementById('failure-analysis-card');
    var body = document.getElementById('failure-analysis-body');
    var badge = document.getElementById('failure-count-badge');
    if (!card || !body) return;

    var plan = data.plan;
    var bugs = data.bugs || [];
    var executions = data.executions || [];
    var testCases = data.testCases || [];

    // Get failed executions for this plan
    var planExecs = executions;
    if (plan && plan.name) {
        planExecs = executions.filter(function(e) {
            return e.plan_name === plan.name || e.plan_id === plan.id;
        });
    }

    // Also check plan items for failures
    var failedItems = [];
    if (plan && plan.items) {
        plan.items.forEach(function(item) {
            if (item.status === 'fail') {
                failedItems.push(item);
            }
        });
    }

    var failedExecs = planExecs.filter(function(e) { return e.status === 'fail'; });

    // Merge: get unique failed TC indices
    var failedTcSet = {};
    failedExecs.forEach(function(e) {
        var key = e.tc_index || e.test_case_id;
        if (!failedTcSet[key]) {
            failedTcSet[key] = {
                tc_index: e.tc_index,
                module: e.module || '',
                scenario: e.scenario || '',
                remarks: e.remarks || '',
                tester_name: e.executed_by_name || e.tester_code || '',
                executed_at: e.executed_at
            };
        }
    });
    failedItems.forEach(function(item) {
        if (!failedTcSet[item.tc_index]) {
            failedTcSet[item.tc_index] = {
                tc_index: item.tc_index,
                module: item.module || '',
                scenario: item.scenario || '',
                remarks: '',
                tester_name: '',
                executed_at: null
            };
        }
    });

    var failedList = Object.values(failedTcSet);

    if (failedList.length === 0 && bugs.length === 0) {
        card.style.display = 'none';
        return;
    }

    card.style.display = '';
    var totalFailures = failedList.length;
    badge.textContent = totalFailures + ' failure' + (totalFailures !== 1 ? 's' : '') + ', ' + bugs.length + ' bug' + (bugs.length !== 1 ? 's' : '');

    // Group failures by module
    var moduleGroups = {};
    failedList.forEach(function(f) {
        var mod = f.module || 'Unknown';
        if (!moduleGroups[mod]) moduleGroups[mod] = [];
        moduleGroups[mod].push(f);
    });

    // Build HTML
    var html = '';

    // Plan execution context (if available)
    if (plan && plan.run_purpose) {
        html += '<div style="padding:12px 16px;background:#eff6ff;border:1px solid #bfdbfe;border-radius:var(--radius);margin-bottom:16px;">' +
            '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;font-size:13px;">' +
                '<div><strong>Run Purpose:</strong> ' + escapeHtml(plan.run_purpose) + '</div>' +
                '<div><strong>Deadline:</strong> ' + (plan.deadline ? new Date(plan.deadline).toLocaleString() : '—') + '</div>' +
                '<div><strong>Team:</strong> ' + ((plan.required_team || []).map(function(t) { return escapeHtml(t.name); }).join(', ') || '—') + '</div>' +
                (plan.special_instructions ? '<div><strong>Instructions:</strong> ' + escapeHtml(plan.special_instructions) + '</div>' : '') +
            '</div>' +
        '</div>';
    }

    // Failure summary by module
    var modules = Object.keys(moduleGroups).sort();
    modules.forEach(function(mod) {
        var items = moduleGroups[mod];
        var moduleBugs = bugs.filter(function(b) { return b.module === mod; });

        html += '<div style="margin-bottom:20px;border:1px solid var(--gray-200);border-radius:var(--radius);overflow:hidden;">';
        html += '<div style="padding:10px 16px;background:var(--gray-50);border-bottom:1px solid var(--gray-200);display:flex;justify-content:space-between;align-items:center;">';
        html += '<strong style="font-size:14px;">' + escapeHtml(mod) + '</strong>';
        html += '<span class="badge badge-danger" style="font-size:11px;">' + items.length + ' failed</span>';
        html += '</div>';

        // Failed test cases in this module
        items.forEach(function(f) {
            var relatedBugs = moduleBugs.filter(function(b) {
                return b.related_tc_index === f.tc_index;
            });

            html += '<div style="padding:12px 16px;border-bottom:1px solid var(--gray-100);">';
            html += '<div style="display:flex;justify-content:space-between;align-items:flex-start;gap:12px;">';
            html += '<div style="flex:1;">';
            html += '<div style="font-weight:600;font-size:13px;color:#ef4444;">TC-' + String(f.tc_index).padStart(3, '0') + ' — ' + escapeHtml(f.scenario) + '</div>';
            if (f.remarks) {
                html += '<div style="font-size:12px;color:var(--gray-600);margin-top:4px;"><strong>Remarks:</strong> ' + escapeHtml(f.remarks) + '</div>';
            }
            if (f.tester_name) {
                html += '<div style="font-size:12px;color:var(--gray-500);margin-top:2px;">Tested by: ' + escapeHtml(f.tester_name) + '</div>';
            }
            html += '</div>';
            html += '</div>';

            // Show related bugs with screenshots
            if (relatedBugs.length > 0) {
                relatedBugs.forEach(function(bug) {
                    html += '<div style="margin-top:8px;padding:10px;background:#fef2f2;border:1px solid #fecaca;border-radius:6px;">';
                    html += '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">';
                    html += '<span style="font-weight:600;font-size:12px;color:#991b1b;">' + escapeHtml(bug.bug_code || 'BUG-' + bug.bug_index) + '</span>';
                    html += '<div style="display:flex;gap:4px;">';
                    html += '<span class="badge" style="font-size:10px;padding:2px 6px;' + getSeverityStyle(bug.severity) + '">' + escapeHtml(bug.severity || 'N/A') + '</span>';
                    html += '<span class="badge" style="font-size:10px;padding:2px 6px;background:var(--gray-100);color:var(--gray-600);">' + escapeHtml(bug.fix_status || bug.status) + '</span>';
                    html += '</div></div>';
                    html += '<div style="font-size:13px;font-weight:500;color:#7f1d1d;">' + escapeHtml(bug.title) + '</div>';
                    if (bug.description) {
                        html += '<div style="font-size:12px;color:#991b1b;margin-top:4px;white-space:pre-wrap;">' + escapeHtml(bug.description) + '</div>';
                    }
                    if (bug.reported_by_name) {
                        html += '<div style="font-size:11px;color:#b91c1c;margin-top:4px;">Reported by: ' + escapeHtml(bug.reported_by_name) + ' | ' + (bug.created_at ? new Date(bug.created_at).toLocaleString() : '') + '</div>';
                    }

                    // Screenshot
                    if (bug.screenshot_url) {
                        html += '<div style="margin-top:8px;">';
                        html += '<div style="font-size:11px;color:#991b1b;font-weight:600;margin-bottom:4px;">Screenshot:</div>';
                        html += '<a href="' + escapeHtml(bug.screenshot_url) + '" target="_blank" rel="noopener noreferrer">';
                        html += '<img src="' + escapeHtml(bug.screenshot_url) + '" alt="Bug screenshot" style="max-width:100%;max-height:300px;border-radius:6px;border:1px solid #fca5a5;cursor:pointer;" onerror="this.parentElement.innerHTML=\'<span style=color:#991b1b;font-size:12px;>Screenshot failed to load: <a href=&quot;\' + this.src + \'&quot; target=_blank>' + escapeHtml(bug.screenshot_url) + '</a></span>\'">';
                        html += '</a></div>';
                    }

                    html += '</div>';
                });
            } else {
                html += '<div style="margin-top:6px;font-size:12px;color:var(--gray-400);font-style:italic;">No bug filed for this failure.</div>';
            }

            html += '</div>';
        });

        // Show module bugs without related TC (orphan bugs)
        var orphanBugs = moduleBugs.filter(function(b) {
            return !items.some(function(f) { return f.tc_index === b.related_tc_index; });
        });
        if (orphanBugs.length > 0) {
            orphanBugs.forEach(function(bug) {
                html += '<div style="padding:12px 16px;border-bottom:1px solid var(--gray-100);">';
                html += '<div style="padding:10px;background:#fef2f2;border:1px solid #fecaca;border-radius:6px;">';
                html += '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">';
                html += '<span style="font-weight:600;font-size:12px;color:#991b1b;">' + escapeHtml(bug.bug_code || 'BUG-' + bug.bug_index) + '</span>';
                html += '<span class="badge" style="font-size:10px;padding:2px 6px;' + getSeverityStyle(bug.severity) + '">' + escapeHtml(bug.severity || 'N/A') + '</span>';
                html += '</div>';
                html += '<div style="font-size:13px;font-weight:500;color:#7f1d1d;">' + escapeHtml(bug.title) + '</div>';
                if (bug.screenshot_url) {
                    html += '<div style="margin-top:8px;"><a href="' + escapeHtml(bug.screenshot_url) + '" target="_blank"><img src="' + escapeHtml(bug.screenshot_url) + '" alt="Bug screenshot" style="max-width:100%;max-height:300px;border-radius:6px;border:1px solid #fca5a5;" onerror="this.style.display=\'none\'"></a></div>';
                }
                html += '</div></div>';
            });
        }

        html += '</div>';
    });

    // Show bugs for modules with no failures
    var failedModules = new Set(modules);
    var otherBugs = bugs.filter(function(b) { return b.module && !failedModules.has(b.module); });
    if (otherBugs.length > 0) {
        var otherModules = {};
        otherBugs.forEach(function(b) {
            if (!otherModules[b.module]) otherModules[b.module] = [];
            otherModules[b.module].push(b);
        });

        Object.keys(otherModules).sort().forEach(function(mod) {
            html += '<div style="margin-bottom:20px;border:1px solid var(--gray-200);border-radius:var(--radius);overflow:hidden;">';
            html += '<div style="padding:10px 16px;background:var(--gray-50);border-bottom:1px solid var(--gray-200);">';
            html += '<strong style="font-size:14px;">' + escapeHtml(mod) + '</strong> <span class="badge badge-warning" style="font-size:11px;">' + otherModules[mod].length + ' open bug' + (otherModules[mod].length !== 1 ? 's' : '') + '</span>';
            html += '</div>';

            otherModules[mod].forEach(function(bug) {
                html += '<div style="padding:12px 16px;border-bottom:1px solid var(--gray-100);">';
                html += '<div style="padding:10px;background:#fef2f2;border:1px solid #fecaca;border-radius:6px;">';
                html += '<span style="font-weight:600;font-size:12px;color:#991b1b;">' + escapeHtml(bug.bug_code || 'BUG-' + bug.bug_index) + '</span> — ';
                html += '<span style="font-size:13px;color:#7f1d1d;">' + escapeHtml(bug.title) + '</span>';
                if (bug.screenshot_url) {
                    html += '<div style="margin-top:8px;"><a href="' + escapeHtml(bug.screenshot_url) + '" target="_blank"><img src="' + escapeHtml(bug.screenshot_url) + '" alt="Bug screenshot" style="max-width:100%;max-height:300px;border-radius:6px;border:1px solid #fca5a5;" onerror="this.style.display=\'none\'"></a></div>';
                }
                html += '</div></div>';
            });

            html += '</div>';
        });
    }

    if (!html) {
        card.style.display = 'none';
        return;
    }

    body.innerHTML = html;
}

function getSeverityStyle(severity) {
    switch (severity) {
        case 'critical': return 'background:#fecaca;color:#991b1b;';
        case 'major':    return 'background:#fed7aa;color:#9a3412;';
        case 'minor':    return 'background:#fef3c7;color:#92400e;';
        case 'cosmetic': return 'background:var(--gray-100);color:var(--gray-600);';
        default:         return 'background:var(--gray-100);color:var(--gray-600);';
    }
}

// === Export Functions ===

function exportCSVResults() {
    var executions = _dashboardData.executions || [];
    if (executions.length === 0) {
        showToast('No execution data to export', 'warning');
        return;
    }

    var headers = ['TC Index', 'Scenario', 'Module', 'Status', 'Tester', 'Tester Code', 'Remarks', 'Executed At'];
    var rows = [headers.join(',')];

    executions.forEach(function (e) {
        rows.push([
            e.tc_index || '',
            '"' + (e.scenario || '').replace(/"/g, '""') + '"',
            e.module || '',
            e.status || '',
            e.executed_by_name || '',
            e.tester_code || '',
            '"' + (e.remarks || '').replace(/"/g, '""') + '"',
            e.executed_at || ''
        ].join(','));
    });

    var planName = _dashboardData.plan ? _dashboardData.plan.name.replace(/\s+/g, '_') : 'results';
    downloadCSV('fullbeat_results_' + planName + '.csv', rows.join('\n'));
    showToast('Results CSV exported', 'success');
}

function exportCSVBugs() {
    var bugs = _dashboardData.bugs || [];
    if (bugs.length === 0) {
        showToast('No bug data to export', 'warning');
        return;
    }

    var headers = ['Bug ID', 'Title', 'Module', 'Severity', 'Priority', 'Status', 'Fix Status', 'Reported By', 'Created At'];
    var rows = [headers.join(',')];

    bugs.forEach(function (b) {
        rows.push([
            b.bug_index || '',
            '"' + (b.title || '').replace(/"/g, '""') + '"',
            b.module || '',
            b.severity || '',
            b.priority || '',
            b.status || '',
            b.fix_status || '',
            b.reported_by_name || '',
            b.created_at || ''
        ].join(','));
    });

    downloadCSV('fullbeat_bugs.csv', rows.join('\n'));
    showToast('Bugs CSV exported', 'success');
}

function exportJSON() {
    var payload = {
        exported_at: new Date().toISOString(),
        plan: _dashboardData.plan,
        executions: _dashboardData.executions,
        bugs: _dashboardData.bugs,
        test_cases: _dashboardData.testCases
    };

    var planName = _dashboardData.plan ? _dashboardData.plan.name.replace(/\s+/g, '_') : 'all';
    downloadJSON('fullbeat_export_' + planName + '.json', payload);
    showToast('JSON exported', 'success');
}

// === Bootstrap ===
document.addEventListener('DOMContentLoaded', initDashboard);
