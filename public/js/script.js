document.addEventListener("DOMContentLoaded", function () {
  // Portfolio page
  if (window.location.pathname.includes("/portfolio")) {
    loadPortfolioItems();
  }

  // Testimonials page
  if (window.location.pathname.includes("/testimonials")) {
    loadTestimonials();

    const form = document.getElementById("testimonialForm");
    if (form) form.addEventListener("submit", submitTestimonial);
  }

  // Contact page
  if (window.location.pathname.includes("/contact")) {
    const form = document.getElementById("contactForm");
    if (form) form.addEventListener("submit", submitContactForm);
  }

  // Set year in footer
  const yearElement = document.getElementById("year");
  if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
  }
});

// Portfolio functions
function loadPortfolioItems() {
  const container = document.getElementById("portfolio-items");
  if (!container) return;

  const items = [
    {
      title: "School Flyer Design",
      image: "/portfolio-images/weekend.webp",
      description: "Modern Flyer design for a School",
    },
    {
      title: "Brand Identity Package",
      image: "/portfolio-images/amina.webp",
      description: "Brand Identity design for a company",
    },
    {
      title: "Corporate Flyer",
      image: "/portfolio-images/Assunniy.webp",
      description: "Modern business flyer design",
    },
    {
      title: "Eid Celebration Design",
      image: "/portfolio-images/atamfa.webp",
      description: "Modern Flyer design for Eid",
    },
    {
      title: "Marketing Poster",
      image: "/portfolio-images/bazanba.webp",
      description: "Modern Business Flyer design",
    },
    {
      title: "Political Campaign Poster",
      image: "/portfolio-images/Beli.webp",
      description: "Modern poster design for a politician",
    },
    {
      title: "Wedding Invitation Design",
      image: "/portfolio-images/bin fussar.webp",
      description: "Stylish wedding invite design",
    },
    {
      title: "Engagement Card Design",
      image: "/portfolio-images/dankama.webp",
      description: "Elegant design for engagement announcement",
    },
    {
      title: "Groom's Event Flyer",
      image: "/portfolio-images/emeralld.webp",
      description: "Creative flyer for a groom's ceremony",
    },
    {
      title: "Digital Business Poster",
      image: "/portfolio-images/exchange.webp",
      description: "Clean business poster design",
    },
    {
      title: "Fashion Brand Flyer",
      image: "/portfolio-images/FASHION.webp",
      description: "Flyer design for a fashion label",
    },
    {
      title: "Charity Event Poster",
      image: "/portfolio-images/fitra.webp",
      description: "Flyer for Ramadan charity event",
    },
    {
      title: "Crypto Service Promo",
      image: "/portfolio-images/gas fee.webp",
      description: "Crypto gas fee awareness flyer",
    },
    {
      title: "Corporate Branding Card",
      image: "/portfolio-images/ittisam.webp",
      description: "Professional branding card design",
    },
    {
      title: "Tech Seminar Poster",
      image: "/portfolio-images/mal hassan.webp",
      description: "Poster for a technology event",
    },
    {
      title: "Ladies' Event Invite",
      image: "/portfolio-images/maryam n.webp",
      description: "Save the Date for ladies' conference",
    },
    {
      title: "Food Service Flyer",
      image: "/portfolio-images/pasta.webp",
      description: "Flyer design for a pasta restaurant",
    },
    {
      title: "Social Media Campaign",
      image: "/portfolio-images/tiktok.webp",
      description: "Poster design for TikTok event",
    },
    {
      title: "Finance Platform Flyer",
      image: "/portfolio-images/transfer.webp",
      description: "Flyer for a money transfer app",
    },
    {
      title: "Startup Pitch Poster",
      image: "/portfolio-images/asb.webp",
      description: "Modern poster for business pitch",
    },
  ];

  container.innerHTML = items
    .map(
      (item) => `
        <div class="col-md-4 portfolio-item">
            <div class="card h-100">
                <img src="${item.image}" class="card-img-top" alt="${item.title}">
                <div class="card-body">
                    <h5 class="card-title">${item.title}</h5>
                    <p class="card-text">${item.description}</p>
                </div>
            </div>
        </div>
    `
    )
    .join("");
}

// Testimonial functions
function loadTestimonials() {
  const container = document.getElementById("testimonials-container");
  if (!container) return;

  fetch("/api/testimonials")
    .then((res) => res.json())
    .then((data) => {
      container.innerHTML =
        '<h2 class="mb-4">Client Testimonials</h2>' +
        data
          .map(
            (testimonial) => `
                    <div class="testimonial-card">
                        <div class="d-flex testimonial-content">
                            ${
                              testimonial.photo
                                ? `<img src="${testimonial.photo}" class="testimonial-photo" alt="${testimonial.name}">`
                                : ""
                            }
                            <div>
                                <h3>${testimonial.name}</h3>
                                <p>${testimonial.message}</p>
                                <small>${new Date(
                                  testimonial.date
                                ).toLocaleDateString()}</small>
                            </div>
                        </div>
                    </div>
                `
          )
          .join("");
    })
    .catch((err) => {
      console.error("Error:", err);
      container.innerHTML = "<p>Error loading testimonials</p>";
    });
}

function submitTestimonial(e) {
  e.preventDefault();

  const name = document.getElementById("clientName").value;
  const photo = document.getElementById("clientPhoto").value;
  const message = document.getElementById("clientMessage").value;

  if (!name || !message) {
    alert("Please enter your name and message");
    return;
  }

  fetch("/submit-testimonial", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, photo, message }),
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.success) {
        document.getElementById("testimonialForm").reset();
        loadTestimonials();
        alert(data.message);
      } else {
        alert("Error: " + data.message);
      }
    })
    .catch((err) => {
      console.error("Error:", err);
      alert("Submission failed");
    });
}

// Contact functions
function submitContactForm(e) {
  e.preventDefault();

  const form = e.target;
  const messageDiv = document.getElementById("form-message");
  const formData = {
    name: form.querySelector("#name").value,
    email: form.querySelector("#email").value,
    subject: form.querySelector("#subject").value,
    message: form.querySelector("#message").value,
  };

  if (!validateForm(formData)) {
    messageDiv.innerHTML =
      '<div class="alert alert-danger">Please fill all fields correctly</div>';
    return;
  }

  fetch("/send-message", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(formData),
  })
    .then((res) => res.json())
    .then((data) => {
      messageDiv.innerHTML = data.success
        ? '<div class="alert alert-success">' + data.message + "</div>"
        : '<div class="alert alert-danger">' + data.message + "</div>";

      if (data.success) form.reset();
    })
    .catch((err) => {
      console.error("Error:", err);
      messageDiv.innerHTML =
        '<div class="alert alert-danger">Network error</div>';
    });
}

function validateForm(data) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return (
    data.name &&
    data.subject &&
    data.message &&
    data.email &&
    emailRegex.test(data.email)
  );
}

window.addEventListener("scroll", function () {
  const navbar = document.querySelector(".navbar");

  if (window.scrollY > 50) {
    // when user scrolls down more than 50px
    navbar.classList.add("shrink");
  } else {
    // when user scrolls back to top
    navbar.classList.remove("shrink");
  }
});
