document.addEventListener('DOMContentLoaded', function () {
    // Check if already logged in
    if (localStorage.getItem('isAdmin') === 'true') {
        showAdminPanel();
    }

    // Login button click
    document.getElementById('login-btn').addEventListener('click', function () {
        const password = document.getElementById('admin-password').value;

        // Simple password check (change "kafanadmin123" to your real password)
        if (password === "kafanadmin123") {
            localStorage.setItem('isAdmin', 'true');
            showAdminPanel();
            alert("Login successful!");
        } else {
            alert("Wrong password!");
        }
    });
});

function showAdminPanel() {
    // Hide login
    const loginSection = document.getElementById('login-section');
    if (loginSection) loginSection.style.display = 'none';

    // Show admin panel
    const adminPanel = document.getElementById('admin-panel');
    if (adminPanel) adminPanel.style.display = 'block';
}