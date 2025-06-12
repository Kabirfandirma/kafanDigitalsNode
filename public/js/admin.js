let adminAuthenticated = false;

document.addEventListener('DOMContentLoaded', function () {
    checkAdminSession();

    document.getElementById('login-btn')?.addEventListener('click', handleLogin);
    document.getElementById('logout-btn')?.addEventListener('click', handleLogout);
    document.getElementById('add-portfolio-form')?.addEventListener('submit', handlePortfolioSubmit);
});

// Check admin session from localStorage
function checkAdminSession() {
    const authToken = localStorage.getItem('adminAuthenticated');
    if (authToken === 'true') {
        adminAuthenticated = true;
        showAdminPanel();
        loadAllTestimonials();
        loadPortfolioItems();
    }
}

// Login handler
async function handleLogin() {
    const password = document.getElementById('admin-password').value.trim();

    if (!password) {
        showAlert('Please enter your password', 'danger');
        return;
    }

    try {
        const response = await fetch('/admin/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ password })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Login failed');
        }

        localStorage.setItem('adminAuthenticated', 'true');
        adminAuthenticated = true;
        checkAdminSession(); // reload admin panel
        showAlert('Login successful', 'success');
    } catch (error) {
        showAlert(error.message || 'Login failed. Please try again.', 'danger');
    }
}

// Show the admin panel
function showAdminPanel() {
    document.getElementById('login-section')?.classList.add('d-none');
    document.getElementById('admin-panel')?.classList.remove('d-none');
}

// Logout handler
function handleLogout() {
    localStorage.removeItem('adminAuthenticated');
    adminAuthenticated = false;
    document.getElementById('admin-panel')?.classList.add('d-none');
    document.getElementById('login-section')?.classList.remove('d-none');
    showAlert('You have been logged out.', 'success');
}

// Load pending testimonials
async function loadAllTestimonials() {
    try {
        const response = await fetch('/api/pending-testimonials');
        const pending = await response.json();

        const list = document.getElementById('testimonials-list');
        list.innerHTML = '';

        if (pending.length === 0) {
            list.innerHTML = `<tr><td colspan="4" class="text-center">No pending testimonials.</td></tr>`;
            return;
        }

        pending.forEach(t => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${t.name}</td>
                <td>${t.message}</td>
                <td>${new Date(t.date).toLocaleString()}</td>
                <td>
                    <button class="btn btn-success btn-sm me-1" onclick="approveTestimonial('${t.id}')">Approve</button>
                    <button class="btn btn-danger btn-sm" onclick="rejectTestimonial('${t.id}')">Reject</button>
                </td>
            `;
            list.appendChild(row);
        });
    } catch (error) {
        console.error('Failed to load testimonials:', error);
        showAlert('Could not load testimonials', 'danger');
    }
}

// Approve testimonial
async function approveTestimonial(id) {
    const password = prompt('Enter admin password:');
    if (!password) return;

    try {
        const res = await fetch('/admin/approve-testimonial', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ password, id })
        });
        const data = await res.json();
        if (data.success) {
            showAlert('Testimonial approved!', 'success');
            loadAllTestimonials();
        } else {
            throw new Error('Approval failed');
        }
    } catch (error) {
        showAlert('Approval error', 'danger');
        console.error(error);
    }
}

// Reject testimonial
async function rejectTestimonial(id) {
    const password = prompt('Enter admin password:');
    if (!password) return;

    try {
        const res = await fetch('/admin/reject-testimonial', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ password, id })
        });
        const data = await res.json();
        if (data.success) {
            showAlert('Testimonial rejected!', 'success');
            loadAllTestimonials();
        } else {
            throw new Error('Rejection failed');
        }
    } catch (error) {
        showAlert('Rejection error', 'danger');
        console.error(error);
    }
}

// Submit portfolio form (with file upload)
async function handlePortfolioSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const title = form.querySelector('#portfolio-title').value.trim();
    const description = form.querySelector('#portfolio-description').value.trim();
    const fileInput = form.querySelector('#portfolio-image');

    if (!title || !description || !fileInput.files.length) {
        showAlert('Please fill all fields and select an image file', 'danger');
        return;
    }

    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('image', fileInput.files[0]);

    try {
        const response = await fetch('/api/upload', {
            method: 'POST',
            body: formData
        });

        const result = await response.json();
        if (result.success) {
            showAlert('Portfolio item added successfully!', 'success');
            form.reset();
            loadPortfolioItems();
        } else {
            throw new Error(result.message || 'Failed to add item');
        }
    } catch (error) {
        showAlert(error.message || 'Upload failed', 'danger');
        console.error(error);
    }
}

// Load and display portfolio items
async function loadPortfolioItems() {
    try {
        const response = await fetch('/api/portfolio');
        const portfolio = await response.json();

        const container = document.getElementById('portfolio-items-admin');
        container.innerHTML = '';

        if (portfolio.length === 0) {
            container.innerHTML = `<p class="text-muted">No portfolio items found.</p>`;
            return;
        }

        portfolio.forEach(item => {
            const card = document.createElement('div');
            card.className = 'col-md-4 mb-4';
            card.innerHTML = `
                <div class="card h-100 shadow-sm">
                    <img src="${item.image}" class="card-img-top" alt="${item.title}">
                    <div class="card-body">
                        <h5 class="card-title">${item.title}</h5>
                        <p class="card-text">${item.description}</p>
                        <button class="btn btn-danger btn-sm" onclick="deletePortfolioItem('${item.id}')">Delete</button>
                    </div>
                </div>
            `;
            container.appendChild(card);
        });
    } catch (error) {
        console.error('Failed to load portfolio:', error);
        showAlert('Error loading portfolio items', 'danger');
    }
}

// Delete portfolio item
async function deletePortfolioItem(id) {
    if (!adminAuthenticated || !confirm('Delete this portfolio item?')) return;

    try {
        const password = prompt('Enter admin password:');
        if (!password) return;

        const response = await fetch('/admin/delete-portfolio', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({ password, id })
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
            throw new Error(data.message || 'Deletion failed');
        }

        showAlert('Portfolio item deleted!', 'success');
        loadPortfolioItems();
    } catch (error) {
        showAlert('Delete failed: ' + error.message, 'danger');
        console.error('Delete error:', error);
    }
}

// Utility function for showing alerts
function showAlert(message, type = 'info') {
    const container = document.getElementById('admin-alerts');
    if (!container) return;

    container.innerHTML = `
        <div class="alert alert-${type} alert-dismissible fade show" role="alert">
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
    `;
}
