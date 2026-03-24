// FullBeat — Admin Module (User Management)

// Load all users
async function loadUsers() {
    const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .order('tester_code');

    if (error) {
        console.error('Error loading users:', error);
        return [];
    }
    return data;
}

// Render users table
async function renderUsersTable() {
    const users = await loadUsers();
    const tbody = document.getElementById('users-tbody');
    if (!tbody) return;

    tbody.innerHTML = '';
    users.forEach(user => {
        const tr = document.createElement('tr');
        tr.className = user.is_active ? '' : 'inactive-row';
        tr.innerHTML = `
            <td>${escapeHtml(user.display_name)}</td>
            <td><span class="badge badge-info">${escapeHtml(user.tester_code)}</span></td>
            <td><span class="badge badge-${getRoleBadge(user.role)}">${user.role}</span></td>
            <td>${user.is_active
                ? '<span class="badge badge-success">Active</span>'
                : '<span class="badge badge-danger">Inactive</span>'}</td>
            <td>${user.must_change_password
                ? '<span class="badge badge-warning">Pending</span>'
                : '<span class="badge badge-success">Done</span>'}</td>
            <td>
                ${user.is_active
                    ? `<button class="btn btn-sm btn-danger" onclick="deactivateUser('${user.id}')">Deactivate</button>`
                    : `<button class="btn btn-sm btn-success" onclick="activateUser('${user.id}')">Activate</button>`}
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function getRoleBadge(role) {
    switch (role) {
        case 'admin': return 'primary';
        case 'lead': return 'warning';
        case 'engineer': return 'info';
        default: return 'info';
    }
}

// Create a new user via Supabase Edge Function or direct signup
async function createUser(email, password, displayName, testerCode, role) {
    // Use Supabase auth.signUp to create the user
    // Note: This creates the auth user. The profile is created via trigger or manually.
    const { data: authData, error: authError } = await supabase.auth.signUp({
        email: email,
        password: password,
        options: {
            data: {
                display_name: displayName,
                tester_code: testerCode,
                role: role
            }
        }
    });

    if (authError) throw authError;

    // Insert profile manually (in case no trigger is set up)
    if (authData.user) {
        const { error: profileError } = await supabase
            .from('user_profiles')
            .upsert({
                id: authData.user.id,
                display_name: displayName,
                tester_code: testerCode,
                role: role,
                must_change_password: true,
                is_active: true
            });

        if (profileError) throw profileError;
    }

    return authData;
}

// Deactivate user (soft delete)
async function deactivateUser(userId) {
    if (!confirm('Are you sure you want to deactivate this user?')) return;

    const { error } = await supabase
        .from('user_profiles')
        .update({ is_active: false })
        .eq('id', userId);

    if (error) {
        alert('Error deactivating user: ' + error.message);
        return;
    }
    await renderUsersTable();
}

// Activate user
async function activateUser(userId) {
    const { error } = await supabase
        .from('user_profiles')
        .update({ is_active: true })
        .eq('id', userId);

    if (error) {
        alert('Error activating user: ' + error.message);
        return;
    }
    await renderUsersTable();
}

// Show create user modal
function showCreateUserModal() {
    document.getElementById('create-user-modal').classList.add('active');
    document.getElementById('create-user-form').reset();
    document.getElementById('create-user-error').textContent = '';
}

// Hide create user modal
function hideCreateUserModal() {
    document.getElementById('create-user-modal').classList.remove('active');
}

// Handle create user form submit
async function handleCreateUser(e) {
    e.preventDefault();
    const errorEl = document.getElementById('create-user-error');
    const submitBtn = e.target.querySelector('button[type="submit"]');
    errorEl.textContent = '';

    const email = document.getElementById('new-email').value.trim();
    const displayName = document.getElementById('new-display-name').value.trim();
    const testerCode = document.getElementById('new-tester-code').value.trim().toUpperCase();
    const role = document.getElementById('new-role').value;
    const password = document.getElementById('new-password').value;

    // Validate
    if (!email || !displayName || !testerCode || !password) {
        errorEl.textContent = 'All fields are required';
        return;
    }

    if (!/^T\d{2}$/.test(testerCode)) {
        errorEl.textContent = 'Tester code must be in format T01, T02, etc.';
        return;
    }

    const pwError = validatePassword(password);
    if (pwError) {
        errorEl.textContent = pwError;
        return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Creating...';

    try {
        await createUser(email, password, displayName, testerCode, role);
        hideCreateUserModal();
        await renderUsersTable();
    } catch (err) {
        errorEl.textContent = err.message;
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Create User';
    }
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
