// Simple Admin Panel Code - Just copy all of this
document.addEventListener('DOMContentLoaded', function () {
    // 1. Check if already logged in
    if (localStorage.getItem('isAdmin') === 'true') {
        hideLogin();
        showAdminContent();
    }

    // 2. Login button click
    document.getElementById('login-btn').addEventListener('click', function () {
        const password = document.getElementById('admin-password').value;

        // Simple login check
        if (password === "kafanadmin123") {
            localStorage.setItem('isAdmin', 'true');
            hideLogin();
            showAdminContent();
            alert("Login successful!"); // Simple alert for now
        } else {
            alert("Wrong password!");
        }
    });
});

// Helper functions - These make the page change
function hideLogin() {
    const loginSection = document.getElementById('login-section');
    if (loginSection) loginSection.style.display = 'none';
}

function showAdminContent() {
    const adminPanel = document.getElementById('admin-panel');
    if (adminPanel) adminPanel.style.display = 'block';
}