let adminAuthenticated = false;

document.addEventListener('DOMContentLoaded', function () {
    checkAdminSession();

    document.getElementById('login-btn')?.addEventListener('click', handleLogin);
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
        showAdminPanel();
        loadAllTestimonials();
        loadPortfolioItems();
        showAlert('Login successful', 'success');
    } catch (error) {
        showAlert(error.message || 'Login failed. Please try again.', 'danger');
    }
}

// Submit portfolio form
async function handlePortfolioSubmit(e) {
    e.preventDefault();
    const form = e.target;

    const formData = {
        title: form.querySelector('#portfolio-title').value.trim(),
        image: form.querySelector('#portfolio-image').value.trim(),
        description: form.querySelector('#portfolio-description').value.trim()
    };

    if (!formData.title || !formData.image || !formData.description) {
        showAlert('Please fill all fields', 'danger');
        return;
    }

    try {
        const response = await fetch('/api/portfolio', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to add item');
        }

        showAlert('Portfolio item added!', 'success');
        form.reset();
        loadPortfolioItems();
    } catch (error) {
        showAlert(error.message || 'Failed to add portfolio item', 'danger');
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

        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            const text = await response.text();
            throw new Error(`Server returned: ${text.substring(0, 50)}...`);
        }

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
