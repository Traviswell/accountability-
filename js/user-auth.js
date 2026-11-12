/* =========================================================
   USER-AUTH.JS — login + register page logic
   Uses localStorage for credential storage until Firebase
   is configured. No inline handlers anywhere.
   ========================================================= */

document.addEventListener("DOMContentLoaded", function () {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const tabs = document.querySelectorAll('.auth-tab');
    const loginPanel = document.getElementById('loginPanel');
    const registerPanel = document.getElementById('registerPanel');

    // Switch between Login / Register tabs
    tabs.forEach(tab => {
        tab.addEventListener('click', function () {
            tabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            const target = this.dataset.tab;
            loginPanel.style.display = target === 'login' ? 'block' : 'none';
            registerPanel.style.display = target === 'register' ? 'block' : 'none';
        });
    });

    // Login
    if (loginForm) {
        loginForm.addEventListener('submit', function (e) {
            e.preventDefault();
            const email = document.getElementById('loginEmail').value.trim().toLowerCase();
            const password = document.getElementById('loginPassword').value;
            const errorBox = document.getElementById('loginError');

            errorBox.style.display = 'none';

            const users = getUsers();
            const user = users.find(u => u.email === email && u.password === hashSimple(password));

            if (!user) {
                errorBox.textContent = 'Incorrect email or password. Please try again.';
                errorBox.style.display = 'block';
                return;
            }

            // Create session
            const session = { id: user.id, name: user.name, email: user.email };
            localStorage.setItem('ac_session', JSON.stringify(session));
            window.location.href = 'user-dashboard.html';
        });
    }

    // Register
    if (registerForm) {
        registerForm.addEventListener('submit', function (e) {
            e.preventDefault();
            const name = document.getElementById('regName').value.trim();
            const email = document.getElementById('regEmail').value.trim().toLowerCase();
            const password = document.getElementById('regPassword').value;
            const confirm = document.getElementById('regConfirm').value;
            const errorBox = document.getElementById('registerError');
            const successBox = document.getElementById('registerSuccess');

            errorBox.style.display = 'none';
            successBox.style.display = 'none';

            if (password !== confirm) {
                errorBox.textContent = 'Passwords do not match.';
                errorBox.style.display = 'block';
                return;
            }

            if (password.length < 6) {
                errorBox.textContent = 'Password must be at least 6 characters.';
                errorBox.style.display = 'block';
                return;
            }

            const users = getUsers();
            if (users.find(u => u.email === email)) {
                errorBox.textContent = 'An account with this email already exists.';
                errorBox.style.display = 'block';
                return;
            }

            const newUser = {
                id: 'usr_' + Date.now(),
                name,
                email,
                password: hashSimple(password),
                joined: new Date().toLocaleDateString(),
                role: 'citizen'
            };

            users.push(newUser);
            localStorage.setItem('ac_users', JSON.stringify(users));

            successBox.textContent = 'Account created! Switching to login...';
            successBox.style.display = 'block';
            registerForm.reset();

            setTimeout(() => {
                tabs.forEach(t => t.classList.remove('active'));
                tabs[0].classList.add('active');
                loginPanel.style.display = 'block';
                registerPanel.style.display = 'none';
                successBox.style.display = 'none';
                document.getElementById('loginEmail').value = email;
            }, 1800);
        });
    }
});

function getUsers() {
    try { return JSON.parse(localStorage.getItem('ac_users')) || []; }
    catch { return []; }
}

// Very simple hash — NOT for production, only for MVP localStorage auth.
// Replace with Firebase Auth or a real backend before launch.
function hashSimple(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = ((hash << 5) - hash) + str.charCodeAt(i);
        hash |= 0;
    }
    return 'h_' + Math.abs(hash).toString(36);
}
