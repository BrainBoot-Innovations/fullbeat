// FullBeat — Admin Module (User Management)

let allUsers = [];

// Load all users into the table
async function loadUsers() {
  const tableBody = document.getElementById('users-table-body');
  if (!tableBody) return;

  tableBody.innerHTML = '<tr><td colspan="6" class="loading"><div class="spinner"></div> Loading users...</td></tr>';

  const { data: users, error } = await supabase
    .from('user_profiles')
    .select('*')
    .order('tester_code');

  if (error) {
    tableBody.innerHTML = `<tr><td colspan="6" class="text-center" style="color:var(--danger)">Error loading users</td></tr>`;
    return;
  }

  allUsers = users || [];

  if (allUsers.length === 0) {
    tableBody.innerHTML = '<tr><td colspan="6"><div class="empty-state"><h3>No users yet</h3><p>Create your first user above.</p></div></td></tr>';
    return;
  }

  tableBody.innerHTML = allUsers.map(u => `
    <tr>
      <td><strong>${escapeHtml(u.display_name)}</strong></td>
      <td><code>${escapeHtml(u.tester_code)}</code></td>
      <td>${escapeHtml(u.email || '')}</td>
      <td><span class="badge badge-${u.role}">${u.role}</span></td>
      <td><span class="badge ${u.is_active ? 'badge-active' : 'badge-inactive'}">${u.is_active ? 'Active' : 'Inactive'}</span></td>
      <td>
        <button class="btn btn-sm ${u.is_active ? 'btn-danger' : 'btn-success'}"
                onclick="toggleUserActive('${u.id}', ${!u.is_active})">
          ${u.is_active ? 'Deactivate' : 'Activate'}
        </button>
      </td>
    </tr>
  `).join('');
}

// Create a new user via Supabase Edge Function
async function createUser(email, displayName, testerCode, role, tempPassword) {
  // Call the edge function that uses admin API to create user
  const { data, error } = await db.functions.invoke('create-user', {
    body: { email, displayName, testerCode, role, tempPassword }
  });

  if (error) throw error;
  if (data?.error) throw new Error(data.error);
  return data;
}

// Toggle user active status
async function toggleUserActive(userId, isActive) {
  const { error } = await supabase
    .from('user_profiles')
    .update({ is_active: isActive })
    .eq('id', userId);

  if (error) {
    showAlert('admin-alert', 'Failed to update user status', 'error');
    return;
  }

  showAlert('admin-alert', `User ${isActive ? 'activated' : 'deactivated'} successfully`, 'success');
  loadUsers();
}

// Show/hide the create user modal
function openCreateUserModal() {
  document.getElementById('create-user-modal').classList.add('active');
  document.getElementById('create-user-form').reset();
  // Suggest next tester code
  suggestNextTesterCode();
}

function closeCreateUserModal() {
  document.getElementById('create-user-modal').classList.remove('active');
}

// Suggest the next available tester code (T01, T02...)
function suggestNextTesterCode() {
  const existing = allUsers.map(u => {
    const match = u.tester_code.match(/^T(\d+)$/);
    return match ? parseInt(match[1]) : 0;
  });
  const maxNum = existing.length > 0 ? Math.max(...existing) : 0;
  const next = String(maxNum + 1).padStart(2, '0');
  const field = document.getElementById('field-tester-code');
  if (field) field.value = `T${next}`;
}

// Handle create user form submission
async function handleCreateUser(e) {
  e.preventDefault();
  const btn = document.getElementById('btn-create-user');
  btn.disabled = true;
  btn.textContent = 'Creating...';

  const email = document.getElementById('field-email').value.trim();
  const displayName = document.getElementById('field-display-name').value.trim();
  const testerCode = document.getElementById('field-tester-code').value.trim().toUpperCase();
  const role = document.getElementById('field-role').value;
  const tempPassword = document.getElementById('field-temp-password').value;

  try {
    await createUser(email, displayName, testerCode, role, tempPassword);
    showAlert('admin-alert', `User ${displayName} (${testerCode}) created successfully`, 'success');
    closeCreateUserModal();
    loadUsers();
  } catch (err) {
    showAlert('modal-alert', err.message, 'error');
  } finally {
    btn.disabled = false;
    btn.textContent = 'Create User';
  }
}

// Utility: show alert message
function showAlert(id, message, type) {
  const el = document.getElementById(id);
  if (!el) return;
  el.className = `alert alert-${type} show`;
  el.textContent = message;
  setTimeout(() => el.classList.remove('show'), 5000);
}

// Utility: escape HTML to prevent XSS
function escapeHtml(str) {
  if (!str) return '';
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// Initialize admin page
async function initAdmin() {
  const profile = await initApp('admin');
  if (!profile) return;

  // Only admins can access this page
  if (profile.role !== 'admin') {
    document.querySelector('.main-content').innerHTML =
      '<div class="empty-state"><h3>Access Denied</h3><p>Admin role required.</p></div>';
    return;
  }

  loadUsers();

  // Bind form
  const form = document.getElementById('create-user-form');
  if (form) form.addEventListener('submit', handleCreateUser);
}
