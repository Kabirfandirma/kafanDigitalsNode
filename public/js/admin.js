let adminAuthenticated = false;

document.addEventListener('DOMContentLoaded', function () {
    checkAdminSession();

    document.getElementById('login-btn')?.addEventListener('click', handleLogin);
    document.getElementById('add-portfolio-form')?.addEventListener('submit', handlePortfolioSubmit);
});

// Improved session checking
function checkAdminSession() {
    const authToken = localStorage.getItem('adminAuthenticated');
    if (authToken === 'true') {
        adminAuthenticated = true;
        showAdminPanel();
        loadAllTestimonials();
        loadPortfolioItems();
    }
}

// Login button - simple version
document.getElementById('login-btn').addEventListener('click', function () {
    const password = document.getElementById('admin-password').value;

    // Show loading spinner
    this.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Checking...';

    fetch('/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: password })
    })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                // Login success!
                localStorage.setItem('isAdmin', 'true');
                document.getElementById('login-section').style.display = 'none';
                document.getElementById('admin-panel').style.display = 'block';
                showAlert('Welcome Admin!', 'success');
            } else {
                showAlert(data.message || 'Wrong password!', 'danger');
            }
        })
        .catch(error => {
            showAlert('Login failed. Try again later.', 'danger');
        })
        .finally(() => {
            // Reset button text
            document.getElementById('login-btn').textContent = 'Login';
        });
});

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

// Improved delete function with better error handling
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

        // Check if response is HTML instead of JSON
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

// Keep all other existing functions exactly as they were:
// showAdminPanel(), loadAllTestimonials(), renderTestimonialsTable(),
// approveTestimonial(), rejectTestimonial(), deleteTestimonial(),
// loadPortfolioItems(), showAlert()