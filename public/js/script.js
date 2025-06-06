document.addEventListener('DOMContentLoaded', function () {
    // Portfolio page
    if (window.location.pathname.includes('/portfolio')) {
        loadPortfolioItems();
    }

    // Testimonials page
    if (window.location.pathname.includes('/testimonials')) {
        loadTestimonials();

        const form = document.getElementById('testimonialForm');
        if (form) form.addEventListener('submit', submitTestimonial);
    }

    // Contact page
    if (window.location.pathname.includes('/contact')) {
        const form = document.getElementById('contactForm');
        if (form) form.addEventListener('submit', submitContactForm);
    }
});

// Portfolio functions
function loadPortfolioItems() {
    const container = document.getElementById('portfolio-items');
    if (!container) return;

    const items = [
        {
            title: "School Flyer Design",
            image: "/portfolio-images/fitra.png",
            description: "Modern Flyer design for a School"

        },
        {
            title: "Brand ID Design",
            image: "/portfolio-images/BrandID.png",
            description: "Brand Identity design for a company"

        },
        {
            title: "Business Flyer Design",
            image: "/portfolio-images/BinFussar.png",
            description: "Modern business flyer design"

        },
        {
            title: "Eid Flyer Design",
            image: "/portfolio-images/EidFitar.png",
            description: "Modern Flyer design for Eid"

        },
        {
            title: "Business Flyer Design",
            image: "/portfolio-images/emeralld.png",
            description: "Modern Business Flyer design"

        },
        {
            title: "Poster Design",
            image: "/portfolio-images/poster.png",
            description: "Modern poster design for a politician"

        },
        {
            title: "Save the Date Design",
            image: "/portfolio-images/Suyudi2.png",
            description: "Modern Save the Date design for a Groom"

        },
        // ... keep your other portfolio items ...
    ];

    container.innerHTML = items.map(item => `
        <div class="col-md-4 portfolio-item">
            <div class="card h-100">
                <img src="${item.image}" class="card-img-top" alt="${item.title}">
                <div class="card-body">
                    <h5 class="card-title">${item.title}</h5>
                    <p class="card-text">${item.description}</p>
                </div>
            </div>
        </div>
    `).join('');
}

// Testimonial functions
function loadTestimonials() {
    const container = document.getElementById('testimonials-container');
    if (!container) return;

    fetch('/api/testimonials')
        .then(res => res.json())
        .then(data => {
            container.innerHTML = '<h2 class="mb-4">Client Testimonials</h2>' +
                data.map(testimonial => `
                    <div class="testimonial-card">
                        <div class="d-flex testimonial-content">
                            ${testimonial.photo ?
                        `<img src="${testimonial.photo}" class="testimonial-photo" alt="${testimonial.name}">`
                        : ''}
                            <div>
                                <h3>${testimonial.name}</h3>
                                <p>${testimonial.message}</p>
                                <small>${new Date(testimonial.date).toLocaleDateString()}</small>
                            </div>
                        </div>
                    </div>
                `).join('');
        })
        .catch(err => {
            console.error('Error:', err);
            container.innerHTML = '<p>Error loading testimonials</p>';
        });
}

function submitTestimonial(e) {
    e.preventDefault();

    const name = document.getElementById('clientName').value;
    const photo = document.getElementById('clientPhoto').value;
    const message = document.getElementById('clientMessage').value;

    if (!name || !message) {
        alert('Please enter your name and message');
        return;
    }

    fetch('/submit-testimonial', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, photo, message })
    })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                document.getElementById('testimonialForm').reset();
                loadTestimonials();
                alert(data.message);
            } else {
                alert('Error: ' + data.message);
            }
        })
        .catch(err => {
            console.error('Error:', err);
            alert('Submission failed');
        });
}

// Contact functions
function submitContactForm(e) {
    e.preventDefault();

    const form = e.target;
    const messageDiv = document.getElementById('form-message');
    const formData = {
        name: form.querySelector('#name').value,
        email: form.querySelector('#email').value,
        subject: form.querySelector('#subject').value,
        message: form.querySelector('#message').value
    };

    if (!validateForm(formData)) {
        messageDiv.innerHTML = '<div class="alert alert-danger">Please fill all fields correctly</div>';
        return;
    }

    fetch('/send-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
    })
        .then(res => res.json())
        .then(data => {
            messageDiv.innerHTML = data.success ?
                '<div class="alert alert-success">' + data.message + '</div>' :
                '<div class="alert alert-danger">' + data.message + '</div>';

            if (data.success) form.reset();
        })
        .catch(err => {
            console.error('Error:', err);
            messageDiv.innerHTML = '<div class="alert alert-danger">Network error</div>';
        });
}

function validateForm(data) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return data.name && data.subject && data.message &&
        data.email && emailRegex.test(data.email);
}

document.addEventListener('DOMContentLoaded', function () {
    const yearElement = document.getElementById('year');
    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }
});