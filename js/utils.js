// FullBeat — Shared Utilities

// Prevent XSS by escaping HTML entities
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.appendChild(document.createTextNode(text));
    return div.innerHTML;
}

// Format date string to readable format (e.g., "24 Mar 2026")
function formatDate(dateStr) {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '—';
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

// Format date string with time (e.g., "24 Mar 2026, 14:30")
function formatDateTime(dateStr) {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '—';
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const hh = String(d.getHours()).padStart(2, '0');
    const mm = String(d.getMinutes()).padStart(2, '0');
    return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}, ${hh}:${mm}`;
}

// Show a toast notification
function showToast(message, type = 'info') {
    // type: 'success', 'error', 'warning', 'info'
    const colors = {
        success: '#10b981',
        error: '#ef4444',
        warning: '#f59e0b',
        info: '#6366f1'
    };

    const toast = document.createElement('div');
    toast.className = 'toast-notification';
    toast.style.cssText = `
        position: fixed;
        bottom: 24px;
        right: 24px;
        background: ${colors[type] || colors.info};
        color: #fff;
        padding: 12px 24px;
        border-radius: 8px;
        font-family: 'Segoe UI', sans-serif;
        font-size: 14px;
        font-weight: 500;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 10000;
        opacity: 0;
        transform: translateY(12px);
        transition: opacity 0.3s ease, transform 0.3s ease;
        max-width: 400px;
        word-wrap: break-word;
    `;
    toast.textContent = message;
    document.body.appendChild(toast);

    // Trigger animation
    requestAnimationFrame(() => {
        toast.style.opacity = '1';
        toast.style.transform = 'translateY(0)';
    });

    // Auto-remove after 3 seconds
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(12px)';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Generate UUID v4
function generateId() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

// Debounce helper
function debounce(fn, delay = 300) {
    let timer;
    return function(...args) {
        clearTimeout(timer);
        timer = setTimeout(() => fn.apply(this, args), delay);
    };
}

// Get currently selected project ID from localStorage
function getSelectedProjectId() {
    return localStorage.getItem('fullbeat_project_id');
}

// ============================================================
// MOCK DATA GENERATORS (for DEV_MODE)
// ============================================================

function getMockProjects() {
    return [
        { id: 'proj-1', name: 'BrainBoot App', code: 'brainboot', is_active: true }
    ];
}

function getMockUsers() {
    return [
        {
            id: 'user-001',
            display_name: 'Dhivya',
            email: 'dhivya@brainboot.co.in',
            tester_code: 'T01',
            role: 'tester',
            must_change_password: false,
            is_active: true,
            created_at: '2026-01-10T09:00:00Z'
        },
        {
            id: 'user-002',
            display_name: 'Divish',
            email: 'divish@brainboot.co.in',
            tester_code: 'T02',
            role: 'tester',
            must_change_password: false,
            is_active: true,
            created_at: '2026-01-10T09:05:00Z'
        },
        {
            id: 'user-003',
            display_name: 'Mugilan',
            email: 'mugilan@brainboot.co.in',
            tester_code: 'T03',
            role: 'tester',
            must_change_password: true,
            is_active: true,
            created_at: '2026-01-15T10:00:00Z'
        },
        {
            id: 'dev-admin-001',
            display_name: 'Admin Dev',
            email: 'admin@brainboot.co.in',
            tester_code: 'T00',
            role: 'admin',
            must_change_password: false,
            is_active: true,
            created_at: '2026-01-01T08:00:00Z'
        }
    ];
}

function getMockTestCases() {
    return [
        {
            id: 'tc-mock-001',
            tc_index: 1,
            project_id: 'proj-1',
            module: 'Authentication',
            category: 'smoke',
            scenario: 'Valid login with correct credentials',
            steps: '1. Open login page\n2. Enter valid email\n3. Enter valid password\n4. Click Login button',
            expected_result: 'User is redirected to dashboard. Welcome message shows user name.',
            preconditions: 'User account exists and is active',
            test_data: 'Email: testuser@brainboot.co.in / Password: Test@1234',
            revision: 1,
            previously_failed: false,
            last_3_runs: ['pass', 'pass', 'pass'],
            is_active: true,
            created_by: 'user-001',
            created_at: '2026-02-01T10:00:00Z'
        },
        {
            id: 'tc-mock-002',
            tc_index: 2,
            project_id: 'proj-1',
            module: 'Authentication',
            category: 'negative',
            scenario: 'Login with invalid password',
            steps: '1. Open login page\n2. Enter valid email\n3. Enter incorrect password\n4. Click Login button',
            expected_result: 'Error message "Invalid credentials" is displayed. User stays on login page.',
            preconditions: 'User account exists',
            test_data: 'Email: testuser@brainboot.co.in / Password: wrongpass',
            revision: 2,
            previously_failed: true,
            last_3_runs: ['pass', 'fail', 'pass'],
            is_active: true,
            created_by: 'user-001',
            created_at: '2026-02-01T10:30:00Z'
        },
        {
            id: 'tc-mock-003',
            tc_index: 3,
            project_id: 'proj-1',
            module: 'Authentication',
            category: 'functional',
            scenario: 'Password change enforced on first login',
            steps: '1. Login with temporary password\n2. Observe redirect to password change form\n3. Enter new password meeting requirements\n4. Confirm new password\n5. Click Change Password',
            expected_result: 'Password is updated. User redirected to dashboard. must_change_password flag set to false.',
            preconditions: 'User account has must_change_password = true',
            test_data: 'Temp password: Temp@123 / New password: Secure@456',
            revision: 1,
            previously_failed: false,
            last_3_runs: ['pass', 'pass', null],
            is_active: true,
            created_by: 'user-002',
            created_at: '2026-02-02T09:00:00Z'
        },
        {
            id: 'tc-mock-004',
            tc_index: 4,
            project_id: 'proj-1',
            module: 'Dashboard',
            category: 'smoke',
            scenario: 'Dashboard loads with correct summary cards',
            steps: '1. Login as tester\n2. Navigate to Dashboard\n3. Verify summary cards are visible',
            expected_result: 'Dashboard shows total test cases, pass rate, open bugs count, and active plans count.',
            preconditions: 'User is authenticated. At least one project with data exists.',
            test_data: 'N/A',
            revision: 3,
            previously_failed: true,
            last_3_runs: ['fail', 'pass', 'pass'],
            is_active: true,
            created_by: 'user-001',
            created_at: '2026-02-03T11:00:00Z'
        },
        {
            id: 'tc-mock-005',
            tc_index: 5,
            project_id: 'proj-1',
            module: 'Dashboard',
            category: 'regression',
            scenario: 'Project selector filters dashboard data',
            steps: '1. Login\n2. Select project from dropdown\n3. Observe dashboard cards and charts update',
            expected_result: 'All dashboard metrics reflect selected project data only. No cross-project leakage.',
            preconditions: 'Multiple projects exist with test data',
            test_data: 'Projects: BrainBoot App, Test Project',
            revision: 1,
            previously_failed: false,
            last_3_runs: ['pass', 'pass', 'pass'],
            is_active: true,
            created_by: 'user-002',
            created_at: '2026-02-05T14:00:00Z'
        },
        {
            id: 'tc-mock-006',
            tc_index: 6,
            project_id: 'proj-1',
            module: 'User Profile',
            category: 'functional',
            scenario: 'User can view their profile information',
            steps: '1. Login\n2. Click on user avatar/name in header\n3. Verify profile details are displayed',
            expected_result: 'Profile shows display name, email, tester code, and role. Fields are read-only for non-admin.',
            preconditions: 'User is authenticated',
            test_data: 'N/A',
            revision: 1,
            previously_failed: false,
            last_3_runs: ['pass', null, null],
            is_active: true,
            created_by: 'user-003',
            created_at: '2026-02-08T09:30:00Z'
        },
        {
            id: 'tc-mock-007',
            tc_index: 7,
            project_id: 'proj-1',
            module: 'Notifications',
            category: 'sanity',
            scenario: 'Toast notifications appear and auto-dismiss',
            steps: '1. Perform an action that triggers a toast (e.g., save a test case)\n2. Observe toast appears at bottom-right\n3. Wait 3 seconds',
            expected_result: 'Toast appears with correct message and color. Auto-dismisses after 3 seconds with fade animation.',
            preconditions: 'User is on any authenticated page',
            test_data: 'N/A',
            revision: 1,
            previously_failed: false,
            last_3_runs: ['pass', 'pass', 'pass'],
            is_active: true,
            created_by: 'user-001',
            created_at: '2026-02-10T16:00:00Z'
        },
        {
            id: 'tc-mock-008',
            tc_index: 8,
            project_id: 'proj-1',
            module: 'Notifications',
            category: 'negative',
            scenario: 'Error toast shown on network failure',
            steps: '1. Disconnect from internet\n2. Try to save a test case\n3. Observe error handling',
            expected_result: 'Red error toast appears with message "Network error. Please try again." Data is not lost.',
            preconditions: 'User is authenticated with unsaved changes',
            test_data: 'N/A',
            revision: 2,
            previously_failed: true,
            last_3_runs: ['fail', 'fail', 'pass'],
            is_active: true,
            created_by: 'user-002',
            created_at: '2026-02-12T10:00:00Z'
        },
        {
            id: 'tc-mock-009',
            tc_index: 9,
            project_id: 'proj-1',
            module: 'Settings',
            category: 'functional',
            scenario: 'Admin can create new project',
            steps: '1. Login as admin\n2. Go to Admin page\n3. Click "New Project"\n4. Enter project name and code\n5. Click Save',
            expected_result: 'Project is created and appears in the project selector dropdown. Success toast is shown.',
            preconditions: 'User has admin role',
            test_data: 'Name: Demo Project / Code: demo',
            revision: 1,
            previously_failed: false,
            last_3_runs: ['pass', 'pass', null],
            is_active: true,
            created_by: 'dev-admin-001',
            created_at: '2026-02-15T13:00:00Z'
        },
        {
            id: 'tc-mock-010',
            tc_index: 10,
            project_id: 'proj-1',
            module: 'Settings',
            category: 'regression',
            scenario: 'Deactivated user cannot access the system',
            steps: '1. Admin deactivates a user account\n2. Deactivated user attempts to login\n3. Observe behavior',
            expected_result: 'Login fails with message "Your account has been deactivated. Contact admin." No access granted.',
            preconditions: 'Admin has deactivated the target user',
            test_data: 'Deactivated user: deactivated@brainboot.co.in',
            revision: 1,
            previously_failed: true,
            last_3_runs: ['pass', 'fail', 'pass'],
            is_active: true,
            created_by: 'dev-admin-001',
            created_at: '2026-02-18T11:00:00Z'
        }
    ];
}

function getMockPlans() {
    return [
        {
            id: 'plan-mock-001',
            project_id: 'proj-1',
            name: 'Sprint 12 — Regression Suite',
            description: 'Full regression run before Sprint 12 release. Covers authentication, dashboard, and notifications modules.',
            status: 'active',
            test_case_ids: [],   // would reference actual TC IDs
            total_cases: 8,
            assigned_testers: ['user-001', 'user-002'],
            created_by: 'dev-admin-001',
            created_at: '2026-03-01T09:00:00Z',
            updated_at: '2026-03-18T14:30:00Z'
        },
        {
            id: 'plan-mock-002',
            project_id: 'proj-1',
            name: 'Smoke Test — Authentication',
            description: 'Quick smoke test covering core login/logout flows. Run before every deployment.',
            status: 'completed',
            test_case_ids: [],
            total_cases: 3,
            assigned_testers: ['user-001'],
            created_by: 'dev-admin-001',
            created_at: '2026-02-20T10:00:00Z',
            updated_at: '2026-02-22T16:45:00Z'
        },
        {
            id: 'plan-mock-003',
            project_id: 'proj-1',
            name: 'Sprint 13 — New Features Validation',
            description: 'Validate new features planned for Sprint 13: user profile enhancements, notification preferences, and project settings.',
            status: 'draft',
            test_case_ids: [],
            total_cases: 5,
            assigned_testers: ['user-002', 'user-003'],
            created_by: 'dev-admin-001',
            created_at: '2026-03-20T08:00:00Z',
            updated_at: '2026-03-20T08:00:00Z'
        }
    ];
}

function getMockExecutions() {
    return [
        {
            id: 'exec-mock-001',
            project_id: 'proj-1',
            plan_id: null,
            plan_name: 'Sprint 12 — Regression Suite',
            test_case_id: null,
            tc_index: 1,
            scenario: 'Valid login with correct credentials',
            module: 'Authentication',
            status: 'pass',
            executed_by: 'user-001',
            executed_by_name: 'Dhivya',
            tester_code: 'T01',
            remarks: 'All steps passed as expected.',
            executed_at: '2026-03-18T10:15:00Z'
        },
        {
            id: 'exec-mock-002',
            project_id: 'proj-1',
            plan_id: null,
            plan_name: 'Sprint 12 — Regression Suite',
            test_case_id: null,
            tc_index: 2,
            scenario: 'Login with invalid password',
            module: 'Authentication',
            status: 'fail',
            executed_by: 'user-001',
            executed_by_name: 'Dhivya',
            tester_code: 'T01',
            remarks: 'Error message not displayed. Shows blank page instead.',
            bug_id: null,
            executed_at: '2026-03-18T10:25:00Z'
        },
        {
            id: 'exec-mock-003',
            project_id: 'proj-1',
            plan_id: null,
            plan_name: 'Sprint 12 — Regression Suite',
            test_case_id: null,
            tc_index: 4,
            scenario: 'Dashboard loads with correct summary cards',
            module: 'Dashboard',
            status: 'pass',
            executed_by: 'user-002',
            executed_by_name: 'Divish',
            tester_code: 'T02',
            remarks: 'Summary cards render correctly. Data matches expected values.',
            executed_at: '2026-03-18T11:00:00Z'
        },
        {
            id: 'exec-mock-004',
            project_id: 'proj-1',
            plan_id: null,
            plan_name: 'Sprint 12 — Regression Suite',
            test_case_id: null,
            tc_index: 7,
            scenario: 'Toast notifications appear and auto-dismiss',
            module: 'Notifications',
            status: 'pass',
            executed_by: 'user-002',
            executed_by_name: 'Divish',
            tester_code: 'T02',
            remarks: 'Toast appears and dismisses within 3 seconds.',
            executed_at: '2026-03-18T11:20:00Z'
        },
        {
            id: 'exec-mock-005',
            project_id: 'proj-1',
            plan_id: null,
            plan_name: 'Sprint 12 — Regression Suite',
            test_case_id: null,
            tc_index: 8,
            scenario: 'Error toast shown on network failure',
            module: 'Notifications',
            status: 'fail',
            executed_by: 'user-001',
            executed_by_name: 'Dhivya',
            tester_code: 'T01',
            remarks: 'No error toast shown. Console shows unhandled promise rejection.',
            executed_at: '2026-03-18T14:00:00Z'
        },
        {
            id: 'exec-mock-006',
            project_id: 'proj-1',
            plan_id: null,
            plan_name: 'Smoke Test — Authentication',
            test_case_id: null,
            tc_index: 1,
            scenario: 'Valid login with correct credentials',
            module: 'Authentication',
            status: 'pass',
            executed_by: 'user-001',
            executed_by_name: 'Dhivya',
            tester_code: 'T01',
            remarks: 'Smoke passed.',
            executed_at: '2026-02-22T15:00:00Z'
        },
        {
            id: 'exec-mock-007',
            project_id: 'proj-1',
            plan_id: null,
            plan_name: 'Smoke Test — Authentication',
            test_case_id: null,
            tc_index: 3,
            scenario: 'Password change enforced on first login',
            module: 'Authentication',
            status: 'pass',
            executed_by: 'user-001',
            executed_by_name: 'Dhivya',
            tester_code: 'T01',
            remarks: 'Redirect works correctly. Password updated.',
            executed_at: '2026-02-22T15:30:00Z'
        },
        {
            id: 'exec-mock-008',
            project_id: 'proj-1',
            plan_id: null,
            plan_name: 'Sprint 12 — Regression Suite',
            test_case_id: null,
            tc_index: 10,
            scenario: 'Deactivated user cannot access the system',
            module: 'Settings',
            status: 'blocked',
            executed_by: 'user-003',
            executed_by_name: 'Mugilan',
            tester_code: 'T03',
            remarks: 'Cannot test — staging environment user management is down.',
            executed_at: '2026-03-19T09:00:00Z'
        }
    ];
}

function getMockActivePlan() {
    var plans = getMockPlans();
    for (var i = 0; i < plans.length; i++) {
        if (plans[i].status === 'active') return plans[i];
    }
    return plans[0];
}

function downloadCSV(filename, csvContent) {
    var blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    var link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
    URL.revokeObjectURL(link.href);
}

function downloadJSON(filename, data) {
    var blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    var link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
    URL.revokeObjectURL(link.href);
}

function getMockBugs() {
    return [
        {
            id: 'bug-mock-001',
            project_id: 'proj-1',
            bug_index: 1,
            title: 'Login error message not displayed on invalid password',
            description: 'When user enters an incorrect password, the error message "Invalid credentials" does not appear. The page shows a blank state instead of the expected error banner.',
            module: 'Authentication',
            severity: 'high',
            priority: 'P1',
            status: 'open',
            fix_status: 'in_progress',
            reported_by: 'user-001',
            reported_by_name: 'Dhivya',
            tester_code: 'T01',
            assigned_to: 'dev-admin-001',
            steps_to_reproduce: '1. Go to login page\n2. Enter valid email\n3. Enter wrong password\n4. Click Login\n5. Observe — no error message shown',
            environment: 'Chrome 122, Windows 11',
            screenshot_url: null,
            related_tc_index: 2,
            created_at: '2026-03-18T10:30:00Z',
            updated_at: '2026-03-20T09:00:00Z'
        },
        {
            id: 'bug-mock-002',
            project_id: 'proj-1',
            bug_index: 2,
            title: 'Network error toast not appearing when offline',
            description: 'When the browser goes offline and a save action is attempted, no error toast notification is shown. Instead, the promise rejection is unhandled and only visible in the browser console.',
            module: 'Notifications',
            severity: 'medium',
            priority: 'P2',
            status: 'open',
            fix_status: 'not_started',
            reported_by: 'user-001',
            reported_by_name: 'Dhivya',
            tester_code: 'T01',
            assigned_to: null,
            steps_to_reproduce: '1. Login and navigate to any page\n2. Open DevTools > Network > Offline\n3. Try saving a test case\n4. Observe — no toast, console shows error',
            environment: 'Chrome 122, Windows 11',
            screenshot_url: null,
            related_tc_index: 8,
            created_at: '2026-03-18T14:10:00Z',
            updated_at: '2026-03-18T14:10:00Z'
        },
        {
            id: 'bug-mock-003',
            project_id: 'proj-1',
            bug_index: 3,
            title: 'Dashboard summary card shows NaN for pass rate',
            description: 'When a project has zero executed test cases, the pass rate card displays "NaN%" instead of "0%" or "N/A".',
            module: 'Dashboard',
            severity: 'low',
            priority: 'P3',
            status: 'resolved',
            fix_status: 'fixed',
            reported_by: 'user-002',
            reported_by_name: 'Divish',
            tester_code: 'T02',
            assigned_to: 'dev-admin-001',
            steps_to_reproduce: '1. Create a new project with no test executions\n2. Select that project\n3. View dashboard\n4. Observe pass rate card shows NaN%',
            environment: 'Firefox 124, macOS Sonoma',
            screenshot_url: null,
            related_tc_index: 4,
            created_at: '2026-02-25T11:00:00Z',
            updated_at: '2026-03-05T16:00:00Z'
        },
        {
            id: 'bug-mock-004',
            project_id: 'proj-1',
            bug_index: 4,
            title: 'Deactivated user can still see cached dashboard briefly',
            description: 'After an admin deactivates a user, if the user has the dashboard open, they can continue viewing cached data for a few seconds before the auth check kicks in and redirects them.',
            module: 'Settings',
            severity: 'medium',
            priority: 'P2',
            status: 'open',
            fix_status: 'in_progress',
            reported_by: 'user-003',
            reported_by_name: 'Mugilan',
            tester_code: 'T03',
            assigned_to: 'dev-admin-001',
            steps_to_reproduce: '1. User A is logged in on dashboard\n2. Admin deactivates User A\n3. User A can still see dashboard for ~5s\n4. Eventually redirected to login',
            environment: 'Chrome 122, Windows 11',
            screenshot_url: null,
            related_tc_index: 10,
            created_at: '2026-03-10T15:00:00Z',
            updated_at: '2026-03-15T10:00:00Z'
        },
        {
            id: 'bug-mock-005',
            project_id: 'proj-1',
            bug_index: 5,
            title: 'Mobile hamburger menu does not close after navigation',
            description: 'On mobile viewport, after opening the hamburger menu and tapping a navigation tab, the menu stays open. User has to manually tap the hamburger icon again to close it.',
            module: 'User Profile',
            severity: 'low',
            priority: 'P3',
            status: 'open',
            fix_status: 'not_started',
            reported_by: 'user-002',
            reported_by_name: 'Divish',
            tester_code: 'T02',
            assigned_to: null,
            steps_to_reproduce: '1. Open app on mobile (< 768px viewport)\n2. Tap hamburger icon\n3. Tap any navigation tab\n4. Observe menu stays open',
            environment: 'Safari, iPhone 15 Pro, iOS 17.3',
            screenshot_url: null,
            related_tc_index: null,
            created_at: '2026-03-22T09:00:00Z',
            updated_at: '2026-03-22T09:00:00Z'
        }
    ];
}
