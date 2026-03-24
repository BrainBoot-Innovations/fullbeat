// FullBeat — Test Case Repository Module

let allTestCases = [];
let filteredTestCases = [];
let editingTestCaseId = null;
let expandedRowId = null;
let debounceTimer = null;

// ── Mock Data (DEV_MODE) ──────────────────────────────────────────────
function getMockTestCases() {
    return [
        {
            id: 'tc-001',
            tc_index: 'TC-001',
            module: 'Authentication',
            category: 'smoke',
            scenario: 'Valid login with correct credentials',
            steps: '1. Open login page\n2. Enter valid email\n3. Enter valid password\n4. Click Sign In',
            expected_result: 'User is redirected to dashboard with session active',
            preconditions: 'User account exists and is active',
            test_data: 'Email: test@brainboot.co.in / Password: Test1234',
            revision: 1,
            is_archived: false,
            previously_failed: false,
            created_at: '2026-03-20T10:00:00Z',
            updated_at: '2026-03-20T10:00:00Z',
            last_runs: [
                { status: 'pass', date: '2026-03-22' },
                { status: 'pass', date: '2026-03-21' },
                { status: 'fail', date: '2026-03-20' }
            ]
        },
        {
            id: 'tc-002',
            tc_index: 'TC-002',
            module: 'Authentication',
            category: 'negative',
            scenario: 'Login with incorrect password',
            steps: '1. Open login page\n2. Enter valid email\n3. Enter wrong password\n4. Click Sign In',
            expected_result: 'Error message displayed: "Invalid login credentials"',
            preconditions: 'User account exists',
            test_data: 'Email: test@brainboot.co.in / Password: WrongPass',
            revision: 2,
            is_archived: false,
            previously_failed: true,
            created_at: '2026-03-20T10:05:00Z',
            updated_at: '2026-03-21T14:00:00Z',
            last_runs: [
                { status: 'fail', date: '2026-03-22' },
                { status: 'pass', date: '2026-03-21' },
                { status: 'pass', date: '2026-03-20' }
            ]
        },
        {
            id: 'tc-003',
            tc_index: 'TC-003',
            module: 'Authentication',
            category: 'functional',
            scenario: 'First-time password change flow',
            steps: '1. Login with temp password\n2. System shows password change form\n3. Enter new password meeting requirements\n4. Confirm password\n5. Submit',
            expected_result: 'Password updated, user redirected to dashboard, must_change_password set to false',
            preconditions: 'User has must_change_password = true',
            test_data: 'New password: NewPass123',
            revision: 1,
            is_archived: false,
            previously_failed: false,
            created_at: '2026-03-20T10:10:00Z',
            updated_at: '2026-03-20T10:10:00Z',
            last_runs: [
                { status: 'pass', date: '2026-03-22' }
            ]
        },
        {
            id: 'tc-004',
            tc_index: 'TC-004',
            module: 'Dashboard',
            category: 'smoke',
            scenario: 'Dashboard loads with correct stats',
            steps: '1. Login successfully\n2. Navigate to dashboard\n3. Verify stat cards show correct counts',
            expected_result: 'Dashboard displays total TCs, pass rate, open bugs, and active plans',
            preconditions: 'User is authenticated with active project selected',
            test_data: '',
            revision: 3,
            is_archived: false,
            previously_failed: true,
            created_at: '2026-03-20T10:15:00Z',
            updated_at: '2026-03-23T09:00:00Z',
            last_runs: [
                { status: 'pass', date: '2026-03-23' },
                { status: 'fail', date: '2026-03-22' },
                { status: 'fail', date: '2026-03-21' }
            ]
        },
        {
            id: 'tc-005',
            tc_index: 'TC-005',
            module: 'Dashboard',
            category: 'functional',
            scenario: 'Project selector switches context',
            steps: '1. Click project selector dropdown\n2. Select a different project\n3. Observe page reload',
            expected_result: 'Page reloads, all data reflects the newly selected project',
            preconditions: 'Multiple projects exist',
            test_data: '',
            revision: 1,
            is_archived: false,
            previously_failed: false,
            created_at: '2026-03-20T10:20:00Z',
            updated_at: '2026-03-20T10:20:00Z',
            last_runs: []
        },
        {
            id: 'tc-006',
            tc_index: 'TC-006',
            module: 'Repository',
            category: 'functional',
            scenario: 'Add new test case via modal',
            steps: '1. Click + Add Test Case\n2. Fill in module, category, scenario, steps, expected result\n3. Click Save',
            expected_result: 'New test case appears in the table with correct TC index and revision 1',
            preconditions: 'User is on repository page',
            test_data: 'Module: Payments, Scenario: Process refund',
            revision: 1,
            is_archived: false,
            previously_failed: false,
            created_at: '2026-03-21T08:00:00Z',
            updated_at: '2026-03-21T08:00:00Z',
            last_runs: []
        },
        {
            id: 'tc-007',
            tc_index: 'TC-007',
            module: 'Repository',
            category: 'regression',
            scenario: 'Filter test cases by module and category',
            steps: '1. Select a module from filter dropdown\n2. Select a category\n3. Observe filtered results\n4. Clear filters',
            expected_result: 'Table shows only matching test cases; clearing filters restores full list',
            preconditions: 'Multiple test cases exist across modules and categories',
            test_data: '',
            revision: 2,
            is_archived: false,
            previously_failed: false,
            created_at: '2026-03-21T08:10:00Z',
            updated_at: '2026-03-22T11:00:00Z',
            last_runs: [
                { status: 'pass', date: '2026-03-23' },
                { status: 'pass', date: '2026-03-22' },
                { status: 'pass', date: '2026-03-21' }
            ]
        },
        {
            id: 'tc-008',
            tc_index: 'TC-008',
            module: 'Bug Tracker',
            category: 'sanity',
            scenario: 'Create a new bug report',
            steps: '1. Navigate to Bugs page\n2. Click + Log Bug\n3. Fill title, severity, description\n4. Link to test case\n5. Save',
            expected_result: 'Bug created with auto-generated bug ID, appears in bug list',
            preconditions: 'User has engineer or higher role',
            test_data: 'Title: Button misaligned on mobile, Severity: Medium',
            revision: 1,
            is_archived: false,
            previously_failed: true,
            created_at: '2026-03-22T09:00:00Z',
            updated_at: '2026-03-22T09:00:00Z',
            last_runs: [
                { status: 'fail', date: '2026-03-23' }
            ]
        },
        {
            id: 'tc-009',
            tc_index: 'TC-009',
            module: 'Admin',
            category: 'smoke',
            scenario: 'Admin can view user list',
            steps: '1. Login as admin\n2. Navigate to Admin tab\n3. Verify users table loads',
            expected_result: 'All users displayed with name, tester code, role, status columns',
            preconditions: 'User has admin role',
            test_data: '',
            revision: 1,
            is_archived: false,
            previously_failed: false,
            created_at: '2026-03-22T09:10:00Z',
            updated_at: '2026-03-22T09:10:00Z',
            last_runs: [
                { status: 'pass', date: '2026-03-23' },
                { status: 'pass', date: '2026-03-22' }
            ]
        },
        {
            id: 'tc-010',
            tc_index: 'TC-010',
            module: 'Admin',
            category: 'functional',
            scenario: 'Admin deactivates a user',
            steps: '1. Login as admin\n2. Go to Admin tab\n3. Click Deactivate on a user\n4. Confirm dialog\n5. Verify user status changes',
            expected_result: 'User marked as inactive, cannot login anymore',
            preconditions: 'Target user is currently active',
            test_data: '',
            revision: 1,
            is_archived: false,
            previously_failed: false,
            created_at: '2026-03-22T09:15:00Z',
            updated_at: '2026-03-22T09:15:00Z',
            last_runs: [
                { status: 'pass', date: '2026-03-23' }
            ]
        }
    ];
}

// ── Initialization ────────────────────────────────────────────────────
async function initRepository() {
    const session = await requireAuth();
    if (!session) return;

    await initAppShell(session);

    // Bind filter events with debounce
    document.getElementById('filter-module').addEventListener('change', () => debouncedFilter());
    document.getElementById('filter-category').addEventListener('change', () => debouncedFilter());
    document.getElementById('filter-search').addEventListener('input', () => debouncedFilter());
    document.getElementById('filter-failed').addEventListener('change', () => debouncedFilter());

    // Bind add button
    document.getElementById('btn-add-tc').addEventListener('click', openAddModal);
    setupUploadHandlers();

    // Load test cases
    await loadTestCases();
}

// ── Load Test Cases ───────────────────────────────────────────────────
async function loadTestCases() {
    if (DEV_MODE) {
        console.log('[DEV MODE] Loading mock test cases');
        allTestCases = getMockTestCases();
        localStorage.setItem('fullbeat_dev_test_cases', JSON.stringify(allTestCases));
        populateModuleFilter();
        filterTestCases();
        return;
    }

    const projectId = getSelectedProjectId();
    if (!projectId) {
        allTestCases = [];
        renderTestCases([]);
        return;
    }

    try {
        const { data, error } = await supabase
            .from('test_cases')
            .select('*')
            .eq('project_id', projectId)
            .eq('is_archived', false)
            .order('tc_index');

        if (error) throw error;

        // Fetch last 3 runs for each test case
        const tcIds = data.map(tc => tc.id);
        let runsMap = {};

        if (tcIds.length > 0) {
            const { data: runs, error: runsError } = await supabase
                .from('test_executions')
                .select('test_case_id, status, executed_at')
                .in('test_case_id', tcIds)
                .order('executed_at', { ascending: false });

            if (!runsError && runs) {
                runs.forEach(run => {
                    if (!runsMap[run.test_case_id]) runsMap[run.test_case_id] = [];
                    if (runsMap[run.test_case_id].length < 3) {
                        runsMap[run.test_case_id].push({
                            status: run.status,
                            date: run.executed_at ? run.executed_at.split('T')[0] : ''
                        });
                    }
                });
            }
        }

        allTestCases = data.map(tc => ({
            ...tc,
            last_runs: runsMap[tc.id] || []
        }));

        populateModuleFilter();
        filterTestCases();
    } catch (err) {
        console.error('Error loading test cases:', err);
        allTestCases = [];
        renderTestCases([]);
    }
}

// ── Populate Module Filter ────────────────────────────────────────────
function populateModuleFilter() {
    const select = document.getElementById('filter-module');
    const currentValue = select.value;

    // Get unique modules
    const modules = [...new Set(allTestCases.map(tc => tc.module))].sort();

    // Keep the "All Modules" option, rebuild the rest
    select.innerHTML = '<option value="">All Modules</option>';
    modules.forEach(mod => {
        const opt = document.createElement('option');
        opt.value = mod;
        opt.textContent = mod;
        select.appendChild(opt);
    });

    // Restore previous selection if still valid
    if (currentValue && modules.includes(currentValue)) {
        select.value = currentValue;
    }
}

// ── Filter Test Cases ─────────────────────────────────────────────────
function filterTestCases() {
    const moduleVal = document.getElementById('filter-module').value;
    const categoryVal = document.getElementById('filter-category').value;
    const searchVal = document.getElementById('filter-search').value.trim().toLowerCase();
    const failedOnly = document.getElementById('filter-failed').checked;

    filteredTestCases = allTestCases.filter(tc => {
        if (moduleVal && tc.module !== moduleVal) return false;
        if (categoryVal && tc.category !== categoryVal) return false;
        if (searchVal && !tc.scenario.toLowerCase().includes(searchVal) &&
            !tc.tc_index.toLowerCase().includes(searchVal) &&
            !tc.module.toLowerCase().includes(searchVal)) return false;
        if (failedOnly && !tc.previously_failed) return false;
        return true;
    });

    renderTestCases(filteredTestCases);
}

function debouncedFilter() {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(filterTestCases, 250);
}

// ── Render Test Cases Table ───────────────────────────────────────────
function renderTestCases(cases) {
    const tbody = document.getElementById('tc-tbody');
    tbody.innerHTML = '';
    expandedRowId = null;

    if (cases.length === 0) {
        const tr = document.createElement('tr');
        tr.innerHTML = '<td colspan="7" class="empty-state">No test cases found. Click "+ Add Test Case" to create one.</td>';
        tbody.appendChild(tr);
        return;
    }

    cases.forEach(tc => {
        const tr = document.createElement('tr');
        tr.className = 'tc-row';
        tr.dataset.id = tc.id;
        tr.addEventListener('click', () => toggleExpandRow(tc));

        const statusBadges = [];
        if (tc.previously_failed) {
            statusBadges.push('<span class="badge badge-danger">PREV FAIL</span>');
        }
        if (tc.is_archived) {
            statusBadges.push('<span class="badge badge-muted">Archived</span>');
        }
        if (!tc.previously_failed && !tc.is_archived) {
            statusBadges.push('<span class="badge badge-success">Active</span>');
        }

        tr.innerHTML = `
            <td><strong>${escapeHtml(tc.tc_index)}</strong></td>
            <td>${escapeHtml(tc.module)}</td>
            <td><span class="badge badge-${getCategoryBadge(tc.category)}">${escapeHtml(tc.category)}</span></td>
            <td>${escapeHtml(tc.scenario)}</td>
            <td>v${tc.revision || 1}</td>
            <td>${statusBadges.join(' ')}</td>
            <td class="actions-cell">
                <button class="btn btn-sm btn-ghost" onclick="event.stopPropagation(); openEditModal('${tc.id}')" title="Edit">&#9998;</button>
                <button class="btn btn-sm btn-danger" onclick="event.stopPropagation(); archiveTestCase('${tc.id}')" title="Archive">&#128465;</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function getCategoryBadge(category) {
    switch (category) {
        case 'smoke': return 'warning';
        case 'sanity': return 'info';
        case 'regression': return 'primary';
        case 'functional': return 'success';
        case 'negative': return 'danger';
        case 'performance': return 'muted';
        default: return 'info';
    }
}

// ── Expand / Collapse Row Detail ──────────────────────────────────────
function toggleExpandRow(tc) {
    const tbody = document.getElementById('tc-tbody');
    const existingExpanded = tbody.querySelector('.expandable-content');

    // If clicking the same row, collapse it
    if (existingExpanded && expandedRowId === tc.id) {
        existingExpanded.remove();
        expandedRowId = null;
        return;
    }

    // Remove any existing expanded row
    if (existingExpanded) {
        existingExpanded.remove();
    }

    expandedRowId = tc.id;

    // Find the clicked row and insert detail row after it
    const clickedRow = tbody.querySelector(`tr[data-id="${tc.id}"]`);
    if (!clickedRow) return;

    const detailRow = document.createElement('tr');
    detailRow.className = 'expandable-content expanded';
    detailRow.innerHTML = `
        <td colspan="7">
            <div class="tc-details">
                <div class="tc-detail-section">
                    <strong>Steps:</strong>
                    <pre>${escapeHtml(tc.steps || 'N/A')}</pre>
                </div>
                <div class="tc-detail-section">
                    <strong>Expected:</strong>
                    <pre>${escapeHtml(tc.expected_result || 'N/A')}</pre>
                </div>
                <div class="tc-detail-section">
                    <strong>Preconditions:</strong> ${escapeHtml(tc.preconditions || 'None')}
                </div>
                <div class="tc-detail-section">
                    <strong>Test Data:</strong> ${escapeHtml(tc.test_data || 'None')}
                </div>
                <div class="tc-detail-section">
                    <strong>Last 3 Runs:</strong> ${renderLastRuns(tc.last_runs)}
                </div>
            </div>
        </td>
    `;

    clickedRow.insertAdjacentElement('afterend', detailRow);
}

function renderLastRuns(runs) {
    if (!runs || runs.length === 0) {
        return '<span class="text-muted">No runs yet</span>';
    }

    return runs.map(run => {
        const badgeClass = run.status === 'pass' ? 'badge-success'
            : run.status === 'fail' ? 'badge-danger'
            : 'badge-warning';
        return `<span class="badge ${badgeClass}">${run.status.toUpperCase()} (${run.date})</span>`;
    }).join(' ');
}

// ── Modal: Add / Edit ─────────────────────────────────────────────────
function openAddModal() {
    editingTestCaseId = null;
    document.getElementById('tc-modal-title').textContent = 'Add Test Case';
    document.getElementById('tc-form').reset();
    document.getElementById('tc-form-error').textContent = '';
    document.getElementById('tc-save-btn').textContent = 'Save';
    openModal('tc-modal');
}

function openEditModal(id) {
    const tc = allTestCases.find(t => t.id === id);
    if (!tc) return;

    editingTestCaseId = id;
    document.getElementById('tc-modal-title').textContent = 'Edit Test Case';
    document.getElementById('tc-module').value = tc.module || '';
    document.getElementById('tc-category').value = tc.category || 'functional';
    document.getElementById('tc-scenario').value = tc.scenario || '';
    document.getElementById('tc-steps').value = tc.steps || '';
    document.getElementById('tc-expected').value = tc.expected_result || '';
    document.getElementById('tc-preconditions').value = tc.preconditions || '';
    document.getElementById('tc-testdata').value = tc.test_data || '';
    document.getElementById('tc-form-error').textContent = '';
    document.getElementById('tc-save-btn').textContent = 'Update';
    openModal('tc-modal');
}

function openModal(id) {
    document.getElementById(id).classList.add('active');
}

function closeModal(id) {
    document.getElementById(id).classList.remove('active');
}

// ── Save Test Case ────────────────────────────────────────────────────
async function saveTestCase() {
    const errorEl = document.getElementById('tc-form-error');
    errorEl.textContent = '';

    const module = document.getElementById('tc-module').value.trim();
    const category = document.getElementById('tc-category').value;
    const scenario = document.getElementById('tc-scenario').value.trim();
    const steps = document.getElementById('tc-steps').value.trim();
    const expected = document.getElementById('tc-expected').value.trim();
    const preconditions = document.getElementById('tc-preconditions').value.trim();
    const testdata = document.getElementById('tc-testdata').value.trim();

    // Validate required fields
    if (!module || !category || !scenario || !steps || !expected) {
        errorEl.textContent = 'Module, Category, Scenario, Steps, and Expected Result are required.';
        return;
    }

    const saveBtn = document.getElementById('tc-save-btn');
    saveBtn.disabled = true;
    saveBtn.textContent = 'Saving...';

    try {
        if (DEV_MODE) {
            if (editingTestCaseId) {
                // Update existing in local array
                const idx = allTestCases.findIndex(t => t.id === editingTestCaseId);
                if (idx !== -1) {
                    allTestCases[idx] = {
                        ...allTestCases[idx],
                        module,
                        category,
                        scenario,
                        steps,
                        expected_result: expected,
                        preconditions,
                        test_data: testdata,
                        revision: (allTestCases[idx].revision || 1) + 1,
                        updated_at: new Date().toISOString()
                    };
                }
                console.log('[DEV MODE] Updated test case:', editingTestCaseId);
            } else {
                // Add new to local array
                const newIndex = allTestCases.length + 1;
                const newTC = {
                    id: 'tc-' + String(newIndex).padStart(3, '0'),
                    tc_index: 'TC-' + String(newIndex).padStart(3, '0'),
                    module,
                    category,
                    scenario,
                    steps,
                    expected_result: expected,
                    preconditions,
                    test_data: testdata,
                    revision: 1,
                    is_archived: false,
                    previously_failed: false,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                    last_runs: []
                };
                allTestCases.push(newTC);
                console.log('[DEV MODE] Added test case:', newTC.tc_index);
            }

            localStorage.setItem('fullbeat_dev_test_cases', JSON.stringify(allTestCases));
            populateModuleFilter();
            filterTestCases();
            closeModal('tc-modal');
            return;
        }

        // Supabase save
        const projectId = getSelectedProjectId();
        if (!projectId) {
            errorEl.textContent = 'No project selected.';
            return;
        }

        if (editingTestCaseId) {
            // Fetch current revision
            const existing = allTestCases.find(t => t.id === editingTestCaseId);
            const newRevision = (existing ? existing.revision || 1 : 1) + 1;

            const { error } = await supabase
                .from('test_cases')
                .update({
                    module,
                    category,
                    scenario,
                    steps,
                    expected_result: expected,
                    preconditions,
                    test_data: testdata,
                    revision: newRevision,
                    updated_at: new Date().toISOString()
                })
                .eq('id', editingTestCaseId);

            if (error) throw error;
        } else {
            // Generate next TC index
            const maxIndex = allTestCases.reduce((max, tc) => {
                const num = parseInt(tc.tc_index.replace('TC-', ''), 10);
                return num > max ? num : max;
            }, 0);
            const newTcIndex = 'TC-' + String(maxIndex + 1).padStart(3, '0');

            const { error } = await supabase
                .from('test_cases')
                .insert({
                    project_id: projectId,
                    tc_index: newTcIndex,
                    module,
                    category,
                    scenario,
                    steps,
                    expected_result: expected,
                    preconditions,
                    test_data: testdata,
                    revision: 1,
                    is_archived: false,
                    previously_failed: false
                });

            if (error) throw error;
        }

        closeModal('tc-modal');
        await loadTestCases();
    } catch (err) {
        console.error('Error saving test case:', err);
        errorEl.textContent = err.message || 'Failed to save test case.';
    } finally {
        saveBtn.disabled = false;
        saveBtn.textContent = editingTestCaseId ? 'Update' : 'Save';
    }
}

// ── Archive Test Case (Soft Delete) ───────────────────────────────────
async function archiveTestCase(id) {
    if (!confirm('Archive this test case? It will be hidden from the repository.')) return;

    if (DEV_MODE) {
        const idx = allTestCases.findIndex(t => t.id === id);
        if (idx !== -1) {
            allTestCases.splice(idx, 1);
            console.log('[DEV MODE] Archived test case:', id);
        }
        localStorage.setItem('fullbeat_dev_test_cases', JSON.stringify(allTestCases));
        populateModuleFilter();
        filterTestCases();
        return;
    }

    try {
        const { error } = await supabase
            .from('test_cases')
            .update({ is_archived: true, updated_at: new Date().toISOString() })
            .eq('id', id);

        if (error) throw error;
        await loadTestCases();
    } catch (err) {
        console.error('Error archiving test case:', err);
        alert('Failed to archive test case: ' + (err.message || 'Unknown error'));
    }
}

// ── Escape HTML ───────────────────────────────────────────────────────
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ── Upload JSON ──────────────────────────────────────────────────────
var uploadedEntries = [];
var uploadClassified = { newEntries: [], updateEntries: [], skipEntries: [] };
var uploadStep = 1;

function openUploadModal() {
    uploadStep = 1;
    uploadedEntries = [];
    uploadClassified = { newEntries: [], updateEntries: [], skipEntries: [] };
    document.getElementById('upload-step-1').style.display = '';
    document.getElementById('upload-step-2').style.display = 'none';
    document.getElementById('upload-step-3').style.display = 'none';
    document.getElementById('upload-error').textContent = '';
    document.getElementById('upload-file-input').value = '';
    document.getElementById('upload-modal-title').textContent = 'Upload Test Cases (JSON)';
    // Show/hide buttons
    document.getElementById('upload-btn-back').style.display = 'none';
    document.getElementById('upload-btn-next').style.display = 'none';
    document.getElementById('upload-btn-import').style.display = 'none';
    document.getElementById('upload-btn-close').style.display = 'none';
    document.getElementById('upload-btn-map').style.display = 'none';
    openModal('upload-modal');
}

function setupUploadHandlers() {
    var dropzone = document.getElementById('upload-dropzone');
    var fileInput = document.getElementById('upload-file-input');
    if (!dropzone || !fileInput) return;

    dropzone.addEventListener('click', function() { fileInput.click(); });
    dropzone.addEventListener('dragover', function(e) { e.preventDefault(); dropzone.classList.add('dragover'); });
    dropzone.addEventListener('dragleave', function() { dropzone.classList.remove('dragover'); });
    dropzone.addEventListener('drop', function(e) {
        e.preventDefault();
        dropzone.classList.remove('dragover');
        var files = e.dataTransfer.files;
        if (files.length > 0) handleUploadFile(files[0]);
    });
    fileInput.addEventListener('change', function() {
        if (fileInput.files.length > 0) handleUploadFile(fileInput.files[0]);
    });

    document.getElementById('btn-upload-tc').addEventListener('click', openUploadModal);
}

function handleUploadFile(file) {
    var errorEl = document.getElementById('upload-error');
    errorEl.textContent = '';

    if (!file.name.endsWith('.json')) {
        errorEl.textContent = 'Please upload a .json file.';
        return;
    }
    if (file.size > 2 * 1024 * 1024) {
        errorEl.textContent = 'File too large (max 2MB).';
        return;
    }

    var reader = new FileReader();
    reader.onload = function(e) {
        try {
            var parsed = JSON.parse(e.target.result);
            var entries = Array.isArray(parsed) ? parsed : (parsed.test_cases || parsed.testCases || []);
            if (!Array.isArray(entries) || entries.length === 0) {
                errorEl.textContent = 'No test cases found in the file.';
                return;
            }
            if (entries.length > 500) {
                errorEl.textContent = 'Too many entries (max 500). Found ' + entries.length + '.';
                return;
            }
            uploadedEntries = entries;
            classifyAndPreview();
        } catch (err) {
            errorEl.textContent = 'Invalid JSON: ' + err.message;
        }
    };
    reader.readAsText(file);
}

function classifyAndPreview() {
    var mode = document.querySelector('input[name="upload-mode"]:checked').value;
    var newE = [], updateE = [], skipE = [];
    var required = ['tc_index', 'module', 'category', 'scenario', 'steps', 'expected_result'];
    var validCategories = ['smoke', 'sanity', 'functional', 'regression', 'negative', 'performance'];
    var seen = {};

    uploadedEntries.forEach(function(entry) {
        // Normalize tc_index
        if (entry.tc_index && typeof entry.tc_index === 'number') {
            entry.tc_index = 'TC-' + String(entry.tc_index).padStart(3, '0');
        }
        if (entry.tc_index && !entry.tc_index.startsWith('TC-')) {
            entry.tc_index = 'TC-' + entry.tc_index;
        }

        // Validate required fields
        var missing = required.filter(function(f) { return !entry[f] || !String(entry[f]).trim(); });
        if (missing.length > 0) {
            entry._skipReason = 'Missing: ' + missing.join(', ');
            skipE.push(entry);
            return;
        }
        // Validate category
        if (validCategories.indexOf(entry.category.toLowerCase()) === -1) {
            entry._skipReason = 'Invalid category: ' + entry.category;
            skipE.push(entry);
            return;
        }
        entry.category = entry.category.toLowerCase();
        // Deduplicate
        if (seen[entry.tc_index]) {
            return; // skip duplicate, keep first
        }
        seen[entry.tc_index] = true;

        // Classify
        var existing = allTestCases.find(function(tc) {
            return tc.tc_index === entry.tc_index || tc.tc_index === entry.tc_index.toUpperCase();
        });
        if (mode === 'update' && existing) {
            entry._existingId = existing.id;
            entry._existingRevision = existing.revision || 1;
            updateE.push(entry);
        } else {
            newE.push(entry);
        }
    });

    uploadClassified = { newEntries: newE, updateEntries: updateE, skipEntries: skipE };

    // Show preview
    uploadStep = 2;
    document.getElementById('upload-step-1').style.display = 'none';
    document.getElementById('upload-step-2').style.display = '';
    document.getElementById('upload-modal-title').textContent = 'Preview — ' + (newE.length + updateE.length) + ' test cases';
    document.getElementById('upload-preview-summary').innerHTML =
        '<span class="badge badge-success">' + newE.length + ' new</span> ' +
        '<span class="badge badge-primary">' + updateE.length + ' updates</span> ' +
        '<span class="badge">' + skipE.length + ' skipped</span>';

    var tbody = document.getElementById('upload-preview-tbody');
    tbody.innerHTML = '';
    newE.forEach(function(e) { addPreviewRow(tbody, e, 'New', 'badge-success'); });
    updateE.forEach(function(e) { addPreviewRow(tbody, e, 'Update', 'badge-primary'); });
    skipE.forEach(function(e) { addPreviewRow(tbody, e, 'Skip', '', e._skipReason); });

    // Buttons
    document.getElementById('upload-btn-back').style.display = '';
    document.getElementById('upload-btn-next').style.display = 'none';
    document.getElementById('upload-btn-import').style.display = '';
    document.getElementById('upload-btn-close').style.display = 'none';
    document.getElementById('upload-btn-map').style.display = 'none';
}

function addPreviewRow(tbody, entry, actionLabel, badgeClass, tooltip) {
    var tr = document.createElement('tr');
    if (tooltip) tr.style.opacity = '0.5';
    tr.innerHTML =
        '<td>' + escapeHtml(entry.tc_index) + '</td>' +
        '<td>' + escapeHtml(entry.module) + '</td>' +
        '<td>' + escapeHtml(entry.category) + '</td>' +
        '<td>' + escapeHtml(entry.scenario) + '</td>' +
        '<td><span class="badge ' + (badgeClass || '') + '" title="' + escapeHtml(tooltip || '') + '">' + actionLabel + '</span></td>';
    tbody.appendChild(tr);
}

function uploadGoBack() {
    uploadStep = 1;
    document.getElementById('upload-step-1').style.display = '';
    document.getElementById('upload-step-2').style.display = 'none';
    document.getElementById('upload-step-3').style.display = 'none';
    document.getElementById('upload-modal-title').textContent = 'Upload Test Cases (JSON)';
    document.getElementById('upload-btn-back').style.display = 'none';
    document.getElementById('upload-btn-import').style.display = 'none';
    document.getElementById('upload-btn-next').style.display = 'none';
}

function uploadNext() {} // placeholder, not used currently

function executeImport() {
    var newE = uploadClassified.newEntries;
    var updateE = uploadClassified.updateEntries;
    var created = 0, updated = 0;

    // Process new entries
    newE.forEach(function(entry) {
        var newTC = {
            id: generateId(),
            tc_index: entry.tc_index,
            module: entry.module,
            category: entry.category,
            scenario: entry.scenario,
            steps: entry.steps,
            expected_result: entry.expected_result,
            preconditions: entry.preconditions || '',
            test_data: entry.test_data || '',
            revision: 1,
            is_archived: false,
            previously_failed: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            last_runs: []
        };
        allTestCases.push(newTC);
        created++;
    });

    // Process updates
    updateE.forEach(function(entry) {
        var idx = allTestCases.findIndex(function(tc) { return tc.id === entry._existingId; });
        if (idx !== -1) {
            allTestCases[idx].module = entry.module;
            allTestCases[idx].category = entry.category;
            allTestCases[idx].scenario = entry.scenario;
            allTestCases[idx].steps = entry.steps;
            allTestCases[idx].expected_result = entry.expected_result;
            allTestCases[idx].preconditions = entry.preconditions || allTestCases[idx].preconditions;
            allTestCases[idx].test_data = entry.test_data || allTestCases[idx].test_data;
            allTestCases[idx].revision = (entry._existingRevision || 1) + 1;
            allTestCases[idx].updated_at = new Date().toISOString();
            updated++;
        }
    });

    // Persist to localStorage
    localStorage.setItem('fullbeat_dev_test_cases', JSON.stringify(allTestCases));

    // Store imported indices for plan mapping
    var importedIndices = newE.concat(updateE).map(function(e) { return e.tc_index; });
    localStorage.setItem('fullbeat_pending_map', JSON.stringify(importedIndices));
    localStorage.setItem('fullbeat_last_import', JSON.stringify({
        tc_indices: importedIndices,
        timestamp: new Date().toISOString(),
        plan_id: null
    }));

    // Refresh table
    populateModuleFilter();
    filterTestCases();

    // Show result
    uploadStep = 3;
    document.getElementById('upload-step-1').style.display = 'none';
    document.getElementById('upload-step-2').style.display = 'none';
    document.getElementById('upload-step-3').style.display = '';
    document.getElementById('upload-modal-title').textContent = 'Import Complete';
    document.getElementById('upload-result-summary').innerHTML =
        '<div style="font-size:48px;margin-bottom:12px;">&#9989;</div>' +
        '<h3>' + created + ' created, ' + updated + ' updated</h3>' +
        '<p class="text-muted">' + uploadClassified.skipEntries.length + ' skipped</p>';

    // Buttons
    document.getElementById('upload-btn-back').style.display = 'none';
    document.getElementById('upload-btn-import').style.display = 'none';
    document.getElementById('upload-btn-close').style.display = '';
    document.getElementById('upload-btn-map').style.display = '';
}

function goToMapPlan() {
    closeModal('upload-modal');
    window.location.href = 'plans.html';
}

// ── Init on DOM Ready ─────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', initRepository);
