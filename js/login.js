/* login.js — admin login gateway */
document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById('loginForm');
    if (!form) return;
    form.addEventListener('submit', function (e) {
        e.preventDefault();
        // Placeholder — replace with real Firebase Auth before launch
        window.location.href = 'admin.html';
    });
});
