// FullBeat — Test Execution Module

// State
let allExecutionItems = [];
let filteredItems = [];
let currentPlanId = null;
let currentProfile = null;
let bugCounter = 0;
let expandedRows = {};
let remarksItemId = null;
let bugItemId = null;

// ============================================================
// INITIALIZATION
// ============================================================

async function initExecution() {
    const session = await requireAuth();
    if (!session) return;

    currentProfile = await initAppShell(session);
    if (!currentProfile) return;

    await loadActivePlans();

    // Wire up filter controls
    document.getElementById('exec-plan-selector').addEventListener('change', onPlanChange);
    document.getElementById('exec-filter-module').addEventListener('change', filterExecution);
    document.getElementById('exec-filter-status').addEventListener('change', filterExecution);
    document.getElementById('exec-my-only').addEventListener('change', filterExecution);

    // In DEV_MODE admin sees all; in production default to my assignments
    document.getElementById('exec-my-only').checked = !DEV_MODE;
}

// ============================================================
// PLAN LOADING
// ============================================================

async function loadActivePlans() {
    const selector = document.getElementById('exec-plan-selector');

    if (DEV_MODE) {
        var storedPlans = localStorage.getItem('fullbeat_dev_plans');
        const plans = storedPlans ? JSON.parse(storedPlans) : getMockPlans();
        // Show active and completed plans (not draft)
        const activePlans = plans.filter(p => p.status === 'active' || p.status === 'completed');
        selector.innerHTML = '<option value="">Select a plan...</option>';
        activePlans.forEach(p => {
            const opt = document.createElement('option');
            opt.value = p.id;
            opt.textContent = `${p.name} (${p.status})`;
            selector.appendChild(opt);
        });
        return;
    }

    const projectId = getSelectedProjectId();
    if (!projectId) return;

    const { data: plans, error } = await supabase
        .from('test_plans')
        .select('id, name, status')
        .eq('project_id', projectId)
        .in('status', ['active', 'completed'])
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error loading plans:', error);
        showToast('Failed to load plans', 'error');
        return;
    }

    selector.innerHTML = '<option value="">Select a plan...</option>';
    (plans || []).forEach(p => {
        const opt = document.createElement('option');
        opt.value = p.id;
        opt.textContent = `${p.name} (${p.status})`;
        selector.appendChild(opt);
    });
}

// ============================================================
// PLAN CHANGE HANDLER
// ============================================================

async function onPlanChange() {
    const planId = document.getElementById('exec-plan-selector').value;
    if (!planId) {
        allExecutionItems = [];
        filteredItems = [];
        renderExecutionTable([]);
        updateProgress();
        return;
    }
    currentPlanId = planId;
    await loadExecutionItems(planId);
}

// ============================================================
// LOAD EXECUTION ITEMS
// ============================================================

async function loadExecutionItems(planId) {
    if (DEV_MODE) {
        var storedTC = localStorage.getItem('fullbeat_dev_test_cases');
        const testCases = storedTC ? JSON.parse(storedTC) : getMockTestCases();
        const users = getMockUsers();

        // Get the plan — check stored plans first (plans page saves here), then mock
        var storedPlans = localStorage.getItem('fullbeat_dev_plans');
        const plans = storedPlans ? JSON.parse(storedPlans) : (typeof getPlansPageMockPlans === 'function' ? getPlansPageMockPlans() : getMockPlans());
        const plan = plans.find(p => p.id === planId);

        if (!plan || !plan.items || plan.items.length === 0) {
            allExecutionItems = [];
            populateModuleFilter();
            filterExecution();
            return;
        }

        // Load any previously saved execution state
        var savedExecs = JSON.parse(localStorage.getItem('fullbeat_dev_executions_' + planId) || 'null');

        // Build execution items from plan's items array
        allExecutionItems = plan.items.map(function(item) {
            // Find matching test case for full details
            var tc = testCases.find(function(t) {
                return t.tc_index === item.tc_index || t.tc_index === ('TC-' + String(item.tc_index).padStart(3, '0'));
            });

            // Find assigned user
            var assignedUser = users.find(function(u) { return u.id === item.assigned_to; });

            // Check for previously saved execution state
            var savedExec = savedExecs ? savedExecs.find(function(e) { return e.tc_index === item.tc_index; }) : null;

            return {
                id: savedExec ? savedExec.id : generateId(),
                plan_id: planId,
                test_case_id: tc ? tc.id : item.tc_index,
                tc_index: item.tc_index,
                module: item.module || (tc ? tc.module : ''),
                category: tc ? tc.category : 'functional',
                scenario: item.scenario || (tc ? tc.scenario : ''),
                steps: tc ? tc.steps : '',
                expected_result: tc ? tc.expected_result : '',
                assigned_to: item.assigned_to || null,
                assigned_name: assignedUser ? assignedUser.display_name : 'Unassigned',
                tester_code: assignedUser ? assignedUser.tester_code : '',
                previously_failed: tc ? tc.previously_failed : false,
                last_3_runs: tc ? (tc.last_3_runs || []) : [],
                status: savedExec ? savedExec.status : (item.status || 'pending'),
                remarks: savedExec ? (savedExec.remarks || '') : '',
                bug_id: savedExec ? (savedExec.bug_id || null) : null,
                bug_code: savedExec ? (savedExec.bug_code || null) : null,
                executed_at: savedExec ? savedExec.executed_at : null
            };
        });

        // Count existing bugs
        var existingBugs = JSON.parse(localStorage.getItem('fullbeat_dev_bugs') || '[]');
        bugCounter = existingBugs.length;

        populateModuleFilter();
        filterExecution();
        updateDeadline();
        return;
    }

    // Production: fetch from Supabase
    const projectId = getSelectedProjectId();
    if (!projectId) return;

    try {
        const { data: items, error } = await supabase
            .from('plan_items')
            .select(`
                id, plan_id, test_case_id, assigned_to, status, remarks, bug_id, executed_at,
                test_cases (id, tc_index, module, category, scenario, steps, expected_result, previously_failed, last_3_runs),
                user_profiles!plan_items_assigned_to_fkey (display_name, tester_code)
            `)
            .eq('plan_id', planId)
            .order('test_cases(tc_index)');

        if (error) throw error;

        allExecutionItems = (items || []).map(item => ({
            id: item.id,
            plan_id: item.plan_id,
            test_case_id: item.test_case_id,
            tc_index: item.test_cases?.tc_index || 0,
            module: item.test_cases?.module || '',
            category: item.test_cases?.category || '',
            scenario: item.test_cases?.scenario || '',
            steps: item.test_cases?.steps || '',
            expected_result: item.test_cases?.expected_result || '',
            assigned_to: item.assigned_to,
            assigned_name: item.user_profiles?.display_name || 'Unassigned',
            tester_code: item.user_profiles?.tester_code || '',
            previously_failed: item.test_cases?.previously_failed || false,
            last_3_runs: item.test_cases?.last_3_runs || [],
            status: item.status || 'pending',
            remarks: item.remarks || '',
            bug_id: item.bug_id || null,
            bug_code: null,
            executed_at: item.executed_at
        }));

        // Get bug counter for this project
        const { count } = await supabase
            .from('bugs')
            .select('*', { count: 'exact', head: true })
            .eq('project_id', projectId);
        bugCounter = count || 0;

        populateModuleFilter();
        filterExecution();
    } catch (err) {
        console.error('Error loading execution items:', err);
        showToast('Failed to load execution items', 'error');
    }
}

// ============================================================
// MODULE FILTER POPULATION
// ============================================================

function populateModuleFilter() {
    const select = document.getElementById('exec-filter-module');
    const modules = [...new Set(allExecutionItems.map(i => i.module))].sort();
    select.innerHTML = '<option value="">All</option>';
    modules.forEach(m => {
        const opt = document.createElement('option');
        opt.value = m;
        opt.textContent = m;
        select.appendChild(opt);
    });
}

// ============================================================
// FILTERING
// ============================================================

function filterExecution() {
    const moduleVal = document.getElementById('exec-filter-module').value;
    const statusVal = document.getElementById('exec-filter-status').value;
    const myOnly = document.getElementById('exec-my-only').checked;

    filteredItems = allExecutionItems.filter(item => {
        if (moduleVal && item.module !== moduleVal) return false;
        if (statusVal && item.status !== statusVal) return false;
        if (myOnly && currentProfile) {
            if (item.assigned_to !== currentProfile.id) return false;
        }
        return true;
    });

    renderExecutionTable(filteredItems);
    updateProgress();
}

// ============================================================
// RENDER TABLE
// ============================================================

function renderExecutionTable(items) {
    const tbody = document.getElementById('exec-tbody');
    tbody.innerHTML = '';

    if (items.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="9" class="text-center text-muted" style="padding:40px;">
                    ${currentPlanId ? 'No test cases match the current filters.' : 'Select a plan to begin execution.'}
                </td>
            </tr>`;
        return;
    }

    items.forEach(item => {
        // Main row
        const tr = document.createElement('tr');
        tr.id = `exec-row-${item.id}`;
        if (item.status !== 'pending') {
            tr.classList.add('executed-row');
        }

        const statusClass = item.status !== 'pending' ? ` status-active-${item.status}` : '';

        tr.innerHTML = `
            <td><strong>${item.tc_index}</strong></td>
            <td>${escapeHtml(item.module)}</td>
            <td><span class="badge badge-${getCategoryBadge(item.category)}">${escapeHtml(item.category)}</span></td>
            <td>
                <a href="javascript:void(0)" class="scenario-link" onclick="toggleExpand('${item.id}')">
                    ${escapeHtml(item.scenario)}
                </a>
            </td>
            <td>${escapeHtml(item.assigned_name)}</td>
            <td>${item.previously_failed ? '<span class="badge badge-danger">PREV FAIL</span>' : '<span class="text-muted">-</span>'}</td>
            <td class="status-buttons">
                <button class="status-btn status-pass${item.status === 'pass' ? ' active' : ''}" onclick="executeTest('${item.id}','pass')">PASS</button>
                <button class="status-btn status-fail${item.status === 'fail' ? ' active' : ''}" onclick="executeTest('${item.id}','fail')">FAIL</button>
                <button class="status-btn status-blocked${item.status === 'blocked' ? ' active' : ''}" onclick="executeTest('${item.id}','blocked')">BLOCKED</button>
                <button class="status-btn status-skip${item.status === 'skipped' ? ' active' : ''}" onclick="executeTest('${item.id}','skipped')">SKIP</button>
            </td>
            <td>${item.bug_id ? `<a href="bugs.html?bug=${item.bug_id}" class="badge badge-danger">${escapeHtml(item.bug_code || 'BUG')}</a>` : '<span class="text-muted">-</span>'}</td>
            <td>
                <a href="javascript:void(0)" onclick="openRemarks('${item.id}')" class="remarks-link">
                    ${item.remarks ? escapeHtml(item.remarks.substring(0, 30)) + (item.remarks.length > 30 ? '...' : '') : '<span class="text-muted">Add</span>'}
                </a>
            </td>
        `;
        tbody.appendChild(tr);

        // Expandable detail row (hidden by default)
        const detailTr = document.createElement('tr');
        detailTr.id = `exec-detail-${item.id}`;
        detailTr.className = 'expandable-content';
        detailTr.style.display = expandedRows[item.id] ? '' : 'none';
        if (expandedRows[item.id]) detailTr.classList.add('expanded');
        detailTr.innerHTML = `
            <td colspan="9">
                <div class="tc-details">
                    <strong>Steps:</strong><pre>${escapeHtml(item.steps)}</pre>
                    <strong>Expected:</strong><pre>${escapeHtml(item.expected_result)}</pre>
                </div>
            </td>
        `;
        tbody.appendChild(detailTr);
    });
}

// ============================================================
// EXPAND / COLLAPSE
// ============================================================

function toggleExpand(itemId) {
    const detailRow = document.getElementById(`exec-detail-${itemId}`);
    if (!detailRow) return;

    if (expandedRows[itemId]) {
        detailRow.style.display = 'none';
        detailRow.classList.remove('expanded');
        delete expandedRows[itemId];
    } else {
        detailRow.style.display = '';
        detailRow.classList.add('expanded');
        expandedRows[itemId] = true;
    }
}

// ============================================================
// EXECUTE TEST
// ============================================================

async function executeTest(itemId, status) {
    const item = allExecutionItems.find(i => i.id === itemId);
    if (!item) return;

    const previousStatus = item.status;
    item.status = status;
    item.executed_at = new Date().toISOString();

    if (status === 'fail') {
        // Auto-generate bug code and open bug creation modal
        bugItemId = itemId;
        bugCounter++;
        const testerCode = currentProfile ? currentProfile.tester_code : 'T00';
        const bugCode = `${testerCode}-${String(bugCounter).padStart(3, '0')}`;
        document.getElementById('bug-code').value = bugCode;
        document.getElementById('bug-title').value = `[TC-${item.tc_index}] ${item.scenario}`;
        document.getElementById('bug-description').value = '';
        document.getElementById('bug-severity').value = 'major';
        document.getElementById('bug-screenshot').value = '';
        document.getElementById('bug-form-error').textContent = '';
        openModal('bug-create-modal');
    }

    // Update last_3_runs
    const runs = item.last_3_runs ? [...item.last_3_runs] : [];
    runs.push(status);
    if (runs.length > 3) runs.shift();
    item.last_3_runs = runs;

    if (!DEV_MODE) {
        try {
            // Upsert execution record
            const { error } = await supabase
                .from('test_executions')
                .upsert({
                    id: item.id,
                    plan_id: item.plan_id,
                    test_case_id: item.test_case_id,
                    status: status,
                    executed_by: currentProfile.id,
                    remarks: item.remarks,
                    executed_at: item.executed_at
                });

            if (error) throw error;

            // Update test_case last_3_runs
            await supabase
                .from('test_cases')
                .update({
                    last_3_runs: item.last_3_runs,
                    previously_failed: item.last_3_runs.includes('fail')
                })
                .eq('id', item.test_case_id);
        } catch (err) {
            console.error('Error saving execution:', err);
            showToast('Failed to save execution', 'error');
            // Revert
            item.status = previousStatus;
            filterExecution();
            return;
        }
    }

    // Persist execution state in DEV_MODE
    if (DEV_MODE && currentPlanId) {
        localStorage.setItem('fullbeat_dev_executions_' + currentPlanId, JSON.stringify(allExecutionItems));
    }

    // Re-render and update progress
    filterExecution();
    if (status !== 'fail') {
        showToast(`TC-${item.tc_index} marked as ${status.toUpperCase()}`, 'success');
    }
}

// ============================================================
// SAVE BUG
// ============================================================

async function saveBug() {
    const bugCode = document.getElementById('bug-code').value;
    const severity = document.getElementById('bug-severity').value;
    const title = document.getElementById('bug-title').value.trim();
    const description = document.getElementById('bug-description').value.trim();
    const screenshot = document.getElementById('bug-screenshot').value.trim();
    const errorEl = document.getElementById('bug-form-error');

    if (!title) {
        errorEl.textContent = 'Title is required.';
        return;
    }

    const item = allExecutionItems.find(i => i.id === bugItemId);
    if (!item) {
        errorEl.textContent = 'Execution item not found.';
        return;
    }

    const bugId = generateId();
    const bug = {
        id: bugId,
        project_id: getSelectedProjectId() || 'proj-1',
        bug_code: bugCode,
        bug_index: bugCounter,
        title: title,
        description: description,
        module: item.module,
        severity: severity,
        priority: severity === 'critical' ? 'P1' : severity === 'major' ? 'P2' : 'P3',
        status: 'open',
        fix_status: 'not_started',
        reported_by: currentProfile ? currentProfile.id : 'dev-admin-001',
        reported_by_name: currentProfile ? currentProfile.display_name : 'Admin Dev',
        tester_code: currentProfile ? currentProfile.tester_code : 'T00',
        related_tc_index: item.tc_index,
        screenshot_url: screenshot || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    };

    if (DEV_MODE) {
        console.log('[DEV MODE] Bug filed:', bug);
        item.bug_id = bugId;
        item.bug_code = bugCode;
        var existingBugs = JSON.parse(localStorage.getItem('fullbeat_dev_bugs') || '[]');
        existingBugs.push(bug);
        localStorage.setItem('fullbeat_dev_bugs', JSON.stringify(existingBugs));
        closeModal('bug-create-modal');
        filterExecution();
        showToast(`Bug ${bugCode} filed for TC-${item.tc_index}`, 'success');
        return;
    }

    try {
        const { error } = await supabase
            .from('bugs')
            .insert(bug);

        if (error) throw error;

        // Link bug to execution item
        await supabase
            .from('plan_items')
            .update({ bug_id: bugId })
            .eq('id', item.id);

        item.bug_id = bugId;
        item.bug_code = bugCode;
        closeModal('bug-create-modal');
        filterExecution();
        showToast(`Bug ${bugCode} filed for TC-${item.tc_index}`, 'success');
    } catch (err) {
        console.error('Error saving bug:', err);
        errorEl.textContent = 'Failed to save bug. Please try again.';
    }
}

// ============================================================
// REMARKS
// ============================================================

function openRemarks(itemId) {
    const item = allExecutionItems.find(i => i.id === itemId);
    if (!item) return;

    remarksItemId = itemId;
    document.getElementById('exec-remarks').value = item.remarks || '';
    openModal('remarks-modal');
}

async function saveRemarks() {
    const remarks = document.getElementById('exec-remarks').value.trim();
    const item = allExecutionItems.find(i => i.id === remarksItemId);
    if (!item) return;

    item.remarks = remarks;

    if (!DEV_MODE) {
        try {
            const { error } = await supabase
                .from('plan_items')
                .update({ remarks: remarks })
                .eq('id', item.id);

            if (error) throw error;
        } catch (err) {
            console.error('Error saving remarks:', err);
            showToast('Failed to save remarks', 'error');
            return;
        }
    } else {
        console.log('[DEV MODE] Remarks saved for item:', item.id, remarks);
    }

    closeModal('remarks-modal');
    filterExecution();
    showToast('Remarks saved', 'success');
}

// ============================================================
// PROGRESS BAR
// ============================================================

function updateProgress() {
    var total = allExecutionItems.length;
    var executed = allExecutionItems.filter(function(i) { return i.status !== 'pending'; }).length;
    var pct = total > 0 ? Math.round((executed / total) * 100) : 0;

    document.getElementById('exec-progress-text').textContent = executed + ' / ' + total + ' executed';
    document.getElementById('exec-progress-fill').style.width = pct + '%';
    document.getElementById('exec-progress-pct').textContent = pct + '%';

    var bar = document.getElementById('exec-progress-fill');
    bar.classList.remove('bar-success', 'bar-danger');
    if (pct === 100) bar.classList.add('bar-success');

    // Per-tester progress
    renderTesterProgress();

    // Deadline
    updateDeadline();
}

function renderTesterProgress() {
    var container = document.getElementById('exec-tester-progress');
    var barsDiv = document.getElementById('exec-tester-bars');
    if (!container || !barsDiv) return;

    if (allExecutionItems.length === 0) {
        container.style.display = 'none';
        return;
    }

    // Group by tester
    var testerMap = {};
    allExecutionItems.forEach(function(item) {
        var key = item.assigned_name || item.tester_code || 'Unassigned';
        if (!testerMap[key]) testerMap[key] = { total: 0, done: 0, pass: 0, fail: 0, code: item.tester_code || '' };
        testerMap[key].total++;
        if (item.status !== 'pending') {
            testerMap[key].done++;
            if (item.status === 'pass') testerMap[key].pass++;
            if (item.status === 'fail') testerMap[key].fail++;
        }
    });

    var testers = Object.keys(testerMap);
    if (testers.length <= 1) {
        container.style.display = 'none';
        return;
    }

    container.style.display = '';
    barsDiv.innerHTML = '';

    testers.forEach(function(name) {
        var t = testerMap[name];
        var pct = t.total > 0 ? Math.round((t.done / t.total) * 100) : 0;
        var row = document.createElement('div');
        row.style.cssText = 'display:flex;align-items:center;gap:10px;font-size:13px;';
        row.innerHTML =
            '<span style="min-width:90px;font-weight:500;">' + name + ' <span class="badge badge-info" style="font-size:10px;padding:1px 5px;">' + t.code + '</span></span>' +
            '<div class="progress-bar-container" style="flex:1;height:8px;">' +
                '<div class="progress-bar bar-success" style="width:' + pct + '%"></div>' +
            '</div>' +
            '<span style="min-width:60px;text-align:right;color:#64748b;">' + t.done + '/' + t.total + '</span>' +
            '<span style="min-width:30px;text-align:right;font-weight:600;color:' + (pct === 100 ? '#16a34a' : '#6366f1') + ';">' + pct + '%</span>';
        barsDiv.appendChild(row);
    });
}

function updateDeadline() {
    var el = document.getElementById('exec-deadline');
    if (!el) return;

    // Get current plan's deadline from stored plans
    if (!currentPlanId) { el.style.display = 'none'; return; }

    var plans = [];
    if (typeof DEV_MODE !== 'undefined' && DEV_MODE) {
        plans = JSON.parse(localStorage.getItem('fullbeat_dev_plans') || '[]');
    }
    var plan = plans.find(function(p) { return p.id === currentPlanId; });
    if (!plan || !plan.deadline) { el.style.display = 'none'; return; }

    var deadline = new Date(plan.deadline);
    var now = new Date();
    var diff = deadline - now;

    el.style.display = '';
    if (diff <= 0) {
        el.style.background = '#fef2f2';
        el.style.color = '#991b1b';
        el.innerHTML = '&#9888; DEADLINE PASSED — was ' + deadline.toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'});
    } else {
        var h = Math.floor(diff / 3600000);
        var m = Math.floor((diff % 3600000) / 60000);
        if (diff < 1800000) {
            el.style.background = '#fef2f2'; el.style.color = '#991b1b';
        } else if (diff < 3600000) {
            el.style.background = '#fef3c7'; el.style.color = '#92400e';
        } else {
            el.style.background = '#f0fdf4'; el.style.color = '#166534';
        }
        el.innerHTML = '&#9200; Deadline: ' + deadline.toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'}) + ' — ' + h + 'h ' + m + 'm remaining';
    }
}

// ============================================================
// MODALS
// ============================================================

function openModal(id) {
    const modal = document.getElementById(id);
    if (modal) modal.classList.add('active');
}

function closeModal(id) {
    const modal = document.getElementById(id);
    if (modal) modal.classList.remove('active');
}

// ============================================================
// HELPERS
// ============================================================

function getCategoryBadge(category) {
    const map = {
        smoke: 'warning',
        sanity: 'info',
        regression: 'primary',
        functional: 'success',
        negative: 'danger',
        performance: 'info'
    };
    return map[category] || 'primary';
}

// ============================================================
// INIT ON DOM READY
// ============================================================

document.addEventListener('DOMContentLoaded', initExecution);
