let adminAuthenticated = false;

document.addEventListener('DOMContentLoaded', function () {
    // Check for existing session
    if (localStorage.getItem('adminAuthenticated')) {
        adminAuthenticated = true;
        showAdminPanel();
        loadAllTestimonials();
        loadPortfolioItems();
    }

    // Login functionality
    document.getElementById('login-btn').addEventListener('click', function () {
        const password = document.getElementById('admin-password').value;

        fetch('/admin/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ password })
        })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    localStorage.setItem('adminAuthenticated', 'true');
                    adminAuthenticated = true;
                    showAdminPanel();
                    loadAllTestimonials();
                    loadPortfolioItems();
                } else {
                    showAlert('Invalid password', 'danger');
                }
            })
            .catch(error => {
                console.error('Login error:', error);
                showAlert('Login failed. Please try again.', 'danger');
            });
    });

    // Add portfolio item form submission
    document.getElementById('add-portfolio-form')?.addEventListener('submit', function (e) {
        e.preventDefault();
        const formData = {
            title: this.querySelector('#portfolio-title').value,
            image: this.querySelector('#portfolio-image').value,
            description: this.querySelector('#portfolio-description').value
        };

        fetch('/api/portfolio', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    showAlert('Portfolio item added successfully!', 'success');
                    this.reset();
                    loadPortfolioItems();
                } else {
                    showAlert('Error: ' + data.message, 'danger');
                }
            })
            .catch(error => {
                console.error('Error adding portfolio:', error);
                showAlert('Failed to add portfolio item', 'danger');
            });
    });
});

function showAdminPanel() {
    document.getElementById('login-section').classList.add('d-none');
    document.getElementById('admin-panel').classList.remove('d-none');
}

function loadAllTestimonials() {
    fetch('/api/admin/testimonials')
        .then(res => res.json())
        .then(data => {
            renderTestimonialsTable(data.pending, 'pending-testimonials', true);
            renderTestimonialsTable(data.approved, 'approved-testimonials', false);
        })
        .catch(error => {
            console.error('Error loading testimonials:', error);
            showAlert('Failed to load testimonials', 'danger');
        });
}

function renderTestimonialsTable(testimonials, containerId, showActions) {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (testimonials.length === 0) {
        container.innerHTML = `<tr><td colspan="${showActions ? 4 : 3}" class="text-center">No testimonials found</td></tr>`;
        return;
    }

    container.innerHTML = testimonials.map(testimonial => `
        <tr data-id="${testimonial.id}">
            <td>${testimonial.name}</td>
            <td>${testimonial.message}</td>
            <td>${new Date(testimonial.date).toLocaleDateString()}</td>
            ${showActions ? `
            <td>
                <button class="btn btn-success btn-sm me-2" onclick="approveTestimonial('${testimonial.id}')">
                    Approve
                </button>
                <button class="btn btn-danger btn-sm" onclick="rejectTestimonial('${testimonial.id}')">
                    Reject
                </button>
            </td>
            ` : `
            <td>
                <button class="btn btn-danger btn-sm" onclick="deleteTestimonial('${testimonial.id}')">
                    Delete
                </button>
            </td>
            `}
        </tr>
    `).join('');
}

function approveTestimonial(id) {
    if (!confirm('Are you sure you want to approve this testimonial?')) return;

    const password = prompt('Enter admin password to approve:');
    if (!password) return;

    fetch('/admin/approve-testimonial', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password, id })
    })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                showAlert('Testimonial approved successfully!', 'success');
                loadAllTestimonials();
            } else {
                throw new Error(data.message || 'Approval failed');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            showAlert('Failed to approve testimonial: ' + error.message, 'danger');
        });
}

function rejectTestimonial(id) {
    if (!confirm('Are you sure you want to reject this testimonial?')) return;

    const password = prompt('Enter admin password to reject:');
    if (!password) return;

    fetch('/admin/reject-testimonial', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password, id })
    })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                showAlert('Testimonial rejected successfully!', 'success');
                loadAllTestimonials();
            } else {
                throw new Error(data.message || 'Rejection failed');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            showAlert('Failed to reject testimonial: ' + error.message, 'danger');
        });
}

function deleteTestimonial(id) {
    if (!confirm('Are you sure you want to delete this testimonial?')) return;

    const password = prompt('Enter admin password:');
    if (!password) return;

    fetch('/admin/delete-testimonial', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password, id })
    })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                showAlert('Testimonial deleted successfully!', 'success');
                loadAllTestimonials();
            } else {
                throw new Error(data.message || 'Deletion failed');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            showAlert('Failed to delete testimonial: ' + error.message, 'danger');
        });
}

function loadPortfolioItems() {
    fetch('/api/portfolio')
        .then(res => res.json())
        .then(portfolio => {
            const container = document.getElementById('portfolio-items-admin');
            if (!container) return;

            container.innerHTML = portfolio.map(item => `
                <div class="col-md-4 mb-4">
                    <div class="card h-100">
                        <img src="${item.image}" class="card-img-top" alt="${item.title}">
                        <div class="card-body">
                            <h5 class="card-title">${item.title}</h5>
                            <p class="card-text">${item.description}</p>
                        </div>
                        <div class="card-footer bg-transparent">
                            <button class="btn btn-danger btn-sm" onclick="deletePortfolioItem('${item.id}')">
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            `).join('');
        })
        .catch(error => {
            console.error('Error loading portfolio:', error);
            showAlert('Failed to load portfolio items', 'danger');
        });
}

function deletePortfolioItem(id) {
    if (!confirm('Are you sure you want to delete this portfolio item?')) return;

    const password = prompt('Enter admin password:');
    if (!password) return;

    fetch('/admin/delete-portfolio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password, id })
    })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                showAlert('Portfolio item deleted successfully!', 'success');
                loadPortfolioItems();
            } else {
                throw new Error(data.message || 'Deletion failed');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            showAlert('Failed to delete portfolio item: ' + error.message, 'danger');
        });
}

function showAlert(message, type) {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;

    const container = document.getElementById('admin-alerts');
    if (container) {
        container.prepend(alertDiv);
        setTimeout(() => alertDiv.remove(), 5000);
    }
}