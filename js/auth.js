// FullBeat — Auth Module

// Check if user is authenticated, redirect to login if not
async function requireAuth() {
  const { data: { session } } = await db.auth.getSession();
  if (!session) {
    window.location.href = 'index.html';
    return null;
  }
  return session;
}

// Get current user's profile from user_profiles table
async function getCurrentProfile() {
  const { data: { user } } = await db.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  return profile;
}

// Login with email and password
async function login(email, password) {
  const { data, error } = await db.auth.signInWithPassword({
    email: email.trim(),
    password
  });

  if (error) throw error;
  return data;
}

// Logout
async function logout() {
  await db.auth.signOut();
  window.location.href = 'index.html';
}

// Change password
async function changePassword(newPassword) {
  const { error } = await db.auth.updateUser({ password: newPassword });
  if (error) throw error;

  // Mark must_change_password as false
  const { data: { user } } = await db.auth.getUser();
  const { error: profileError } = await supabase
    .from('user_profiles')
    .update({ must_change_password: false })
    .eq('id', user.id);

  if (profileError) throw profileError;
}

// Validate password rules: min 8 chars, 1 uppercase, 1 number
function validatePassword(password) {
  return {
    minLength: password.length >= 8,
    hasUpper: /[A-Z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    get isValid() {
      return this.minLength && this.hasUpper && this.hasNumber;
    }
  };
}

// Populate the top bar with user info
async function populateTopBar() {
  const profile = await getCurrentProfile();
  if (!profile) return;

  const userEl = document.getElementById('topbar-user');
  if (userEl) {
    userEl.innerHTML = `
      <strong>${profile.display_name}</strong>
      <span class="tester-code">${profile.tester_code}</span>
    `;
  }

  // Show/hide admin tab based on role
  const adminTab = document.getElementById('tab-admin');
  if (adminTab) {
    adminTab.style.display = (profile.role === 'admin') ? '' : 'none';
  }

  // Store profile globally for convenience
  window.__fullbeat_profile = profile;
  return profile;
}

// Load projects into the project selector dropdown
async function loadProjectSelector() {
  const { data: projects } = await supabase
    .from('projects')
    .select('id, name, code')
    .eq('is_active', true)
    .order('name');

  const selector = document.getElementById('project-selector');
  if (!selector || !projects) return;

  selector.innerHTML = projects.map(p =>
    `<option value="${p.id}" data-code="${p.code}">${p.name}</option>`
  ).join('');

  // Store selected project
  const saved = localStorage.getItem('fullbeat_project_id');
  if (saved && projects.find(p => p.id === saved)) {
    selector.value = saved;
  }

  selector.addEventListener('change', () => {
    localStorage.setItem('fullbeat_project_id', selector.value);
    window.location.reload();
  });

  localStorage.setItem('fullbeat_project_id', selector.value);
  window.__fullbeat_project_id = selector.value;
}

// Get current project ID
function getProjectId() {
  return localStorage.getItem('fullbeat_project_id');
}

// Initialize app shell (call on every protected page)
async function initApp(activeTab) {
  const session = await requireAuth();
  if (!session) return null;

  const profile = await populateTopBar();
  await loadProjectSelector();

  // Set active tab
  if (activeTab) {
    const tab = document.querySelector(`.tab-nav a[data-tab="${activeTab}"]`);
    if (tab) tab.classList.add('active');
  }

  // Hamburger toggle
  const hamburger = document.getElementById('hamburger');
  const tabNav = document.getElementById('tab-nav');
  if (hamburger && tabNav) {
    hamburger.addEventListener('click', () => {
      tabNav.classList.toggle('open');
    });
  }

  // Logout button
  const logoutBtn = document.getElementById('btn-logout');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      logout();
    });
  }

  return profile;
}
