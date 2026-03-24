// FullBeat — Authentication Module

// DEV MODE: Set to true to bypass authentication
const DEV_MODE = true;
const DEV_USER = {
    id: 'dev-admin-001',
    email: 'admin@brainboot.co.in',
    user_metadata: { display_name: 'Admin Dev', tester_code: 'T00', role: 'admin' }
};
const DEV_PROFILE = {
    id: 'dev-admin-001',
    display_name: 'Admin Dev',
    tester_code: 'T00',
    role: 'admin',
    must_change_password: false,
    is_active: true
};

// Check if user is authenticated, redirect to login if not
async function requireAuth() {
    if (DEV_MODE) {
        console.log('[DEV MODE] Auth bypassed — returning mock session');
        return {
            user: DEV_USER,
            access_token: 'dev-token-mock',
            expires_at: Date.now() + 3600000
        };
    }

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
        window.location.href = 'index.html';
        return null;
    }
    return session;
}

// Get current user's profile from user_profiles table
async function getUserProfile(userId) {
    if (DEV_MODE) {
        console.log('[DEV MODE] Returning mock profile');
        return DEV_PROFILE;
    }

    const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();
    if (error) {
        console.error('Error fetching profile:', error);
        return null;
    }
    return data;
}

// Login with email and password
async function login(email, password) {
    if (DEV_MODE) {
        console.log('[DEV MODE] Mock login for:', email);
        return { user: DEV_USER, session: { access_token: 'dev-token-mock' } };
    }

    const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password
    });
    if (error) throw error;
    return data;
}

// Logout
async function logout() {
    if (DEV_MODE) {
        console.log('[DEV MODE] Mock logout');
        window.location.href = 'index.html';
        return;
    }

    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    window.location.href = 'index.html';
}

// Change password
async function changePassword(newPassword) {
    if (DEV_MODE) {
        console.log('[DEV MODE] Mock password change');
        return { user: DEV_USER };
    }

    const { data, error } = await supabase.auth.updateUser({
        password: newPassword
    });
    if (error) throw error;
    return data;
}

// Mark password as changed in user_profiles
async function markPasswordChanged(userId) {
    if (DEV_MODE) {
        console.log('[DEV MODE] Mock markPasswordChanged');
        return;
    }

    const { error } = await supabase
        .from('user_profiles')
        .update({ must_change_password: false })
        .eq('id', userId);
    if (error) throw error;
}

// Validate password strength: min 8 chars, 1 uppercase, 1 number
function validatePassword(password) {
    if (password.length < 8) return 'Password must be at least 8 characters';
    if (!/[A-Z]/.test(password)) return 'Password must contain at least 1 uppercase letter';
    if (!/[0-9]/.test(password)) return 'Password must contain at least 1 number';
    return null;
}

// Initialize app shell header with user info
async function initAppShell(session) {
    if (DEV_MODE) {
        console.log('[DEV MODE] Initializing app shell with mock data');

        // Set user info in header
        const userNameEl = document.getElementById('user-name');
        const testerCodeEl = document.getElementById('tester-code');
        if (userNameEl) userNameEl.textContent = DEV_PROFILE.display_name;
        if (testerCodeEl) testerCodeEl.textContent = DEV_PROFILE.tester_code;

        // Show admin tab always in DEV_MODE
        const adminTab = document.getElementById('tab-admin');
        if (adminTab) adminTab.style.display = '';

        // Load mock projects into selector
        loadProjects();

        // Setup logout button
        const logoutBtn = document.getElementById('btn-logout');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', logout);
        }

        // Setup mobile menu
        initMobileMenu();

        return DEV_PROFILE;
    }

    const profile = await getUserProfile(session.user.id);
    if (!profile) {
        await logout();
        return null;
    }
    if (!profile.is_active) {
        alert('Your account has been deactivated. Contact admin.');
        await logout();
        return null;
    }

    // Set user info in header
    const userNameEl = document.getElementById('user-name');
    const testerCodeEl = document.getElementById('tester-code');
    if (userNameEl) userNameEl.textContent = profile.display_name;
    if (testerCodeEl) testerCodeEl.textContent = profile.tester_code;

    // Show/hide admin tab based on role
    const adminTab = document.getElementById('tab-admin');
    if (adminTab) {
        adminTab.style.display = profile.role === 'admin' ? '' : 'none';
    }

    // Load projects into selector
    await loadProjects();

    // Setup logout button
    const logoutBtn = document.getElementById('btn-logout');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logout);
    }

    // Setup mobile menu
    initMobileMenu();

    return profile;
}

// Load projects into the project selector dropdown
async function loadProjects() {
    if (DEV_MODE) {
        console.log('[DEV MODE] Loading mock projects');
        const projects = (typeof getMockProjects === 'function') ? getMockProjects() : [
            { id: 'proj-1', name: 'BrainBoot App', code: 'brainboot', is_active: true }
        ];

        const selector = document.getElementById('project-selector');
        if (!selector) return;

        selector.innerHTML = '';
        projects.forEach(p => {
            const opt = document.createElement('option');
            opt.value = p.id;
            opt.textContent = `${p.name} (${p.code})`;
            selector.appendChild(opt);
        });

        const saved = localStorage.getItem('fullbeat_project_id');
        if (saved && projects.find(p => p.id === saved)) {
            selector.value = saved;
        }
        localStorage.setItem('fullbeat_project_id', selector.value);

        selector.addEventListener('change', () => {
            localStorage.setItem('fullbeat_project_id', selector.value);
            window.location.reload();
        });
        return;
    }

    const { data: projects, error } = await supabase
        .from('projects')
        .select('*')
        .eq('is_active', true)
        .order('name');

    if (error) {
        console.error('Error loading projects:', error);
        return;
    }

    const selector = document.getElementById('project-selector');
    if (!selector) return;

    selector.innerHTML = '';
    projects.forEach(p => {
        const opt = document.createElement('option');
        opt.value = p.id;
        opt.textContent = `${p.name} (${p.code})`;
        selector.appendChild(opt);
    });

    // Store selected project ID
    const saved = localStorage.getItem('fullbeat_project_id');
    if (saved && projects.find(p => p.id === saved)) {
        selector.value = saved;
    }
    localStorage.setItem('fullbeat_project_id', selector.value);

    selector.addEventListener('change', () => {
        localStorage.setItem('fullbeat_project_id', selector.value);
        window.location.reload();
    });
}

// Get currently selected project ID
function getSelectedProjectId() {
    return localStorage.getItem('fullbeat_project_id');
}

// Setup mobile hamburger menu
function initMobileMenu() {
    const hamburger = document.getElementById('hamburger');
    const navTabs = document.getElementById('nav-tabs');
    if (hamburger && navTabs) {
        hamburger.addEventListener('click', () => {
            navTabs.classList.toggle('open');
        });
    }
}
