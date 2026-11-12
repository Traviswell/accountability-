/* =========================================================
   USER-DASHBOARD.JS — citizen dashboard page logic
   ========================================================= */

document.addEventListener("DOMContentLoaded", function () {
    const user = window.AC.getSessionUser();

    if (!user) {
        window.location.href = 'user-login.html';
        return;
    }

    // Populate greeting & sidebar
    const els = {
        name: document.getElementById('sidebarName'),
        email: document.getElementById('sidebarEmail'),
        avatar: document.getElementById('sidebarAvatar'),
        greeting: document.getElementById('topbarGreeting'),
        reportCount: document.getElementById('statReports'),
        joinDate: document.getElementById('statJoined')
    };

    if (els.name) els.name.textContent = user.name;
    if (els.email) els.email.textContent = user.email;
    if (els.avatar) els.avatar.textContent = user.name.charAt(0).toUpperCase();
    if (els.greeting) els.greeting.innerHTML = `Welcome back, <strong>${user.name.split(' ')[0]}</strong>`;

    // Load user's own reports from the ledger
    const allReports = JSON.parse(localStorage.getItem('coreLedger')) || [];
    const userReports = allReports.filter(r => r.userId === user.id);

    if (els.reportCount) els.reportCount.textContent = userReports.length;

    const fullUser = getFullUser(user.email);
    if (els.joinDate && fullUser) els.joinDate.textContent = fullUser.joined || 'Today';

    renderUserReports(userReports);

    // Sidebar navigation — show / hide panels
    document.querySelectorAll('.sidebar-link[data-panel]').forEach(link => {
        link.addEventListener('click', function () {
            document.querySelectorAll('.sidebar-link').forEach(l => l.classList.remove('active'));
            this.classList.add('active');

            const target = this.dataset.panel;
            document.querySelectorAll('.dash-panel').forEach(p => p.classList.remove('active'));
            const panel = document.getElementById(target);
            if (panel) panel.classList.add('active');
        });
    });

    // Logout
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function () {
            if (confirm('Sign out of your account?')) {
                window.AC.clearSession();
            }
        });
    }

    // New report shortcut form inside dashboard
    const dashReportForm = document.getElementById('dashReportForm');
    if (dashReportForm) {
        dashReportForm.addEventListener('submit', function (e) {
            e.preventDefault();
            const location = document.getElementById('dashLocation').value.trim();
            const category = document.getElementById('dashCategory').value;
            const description = document.getElementById('dashDetails').value.trim();

            const payload = {
                id: 'AC-' + Math.floor(Math.random() * 90000 + 10000),
                userId: user.id,
                location,
                category,
                description,
                status: '🔴 Pending Action',
                published: false,
                date: new Date().toLocaleDateString()
            };

            const reports = JSON.parse(localStorage.getItem('coreLedger')) || [];
            reports.push(payload);
            localStorage.setItem('coreLedger', JSON.stringify(reports));

            dashReportForm.reset();
            const success = document.getElementById('dashReportSuccess');
            if (success) {
                success.style.display = 'block';
                setTimeout(() => { success.style.display = 'none'; }, 3000);
            }

            // Refresh the reports panel
            const updated = JSON.parse(localStorage.getItem('coreLedger')) || [];
            renderUserReports(updated.filter(r => r.userId === user.id));
            if (els.reportCount) els.reportCount.textContent = updated.filter(r => r.userId === user.id).length;
        });
    }
});

function renderUserReports(reports) {
    const list = document.getElementById('userReportsList');
    if (!list) return;

    if (!reports.length) {
        list.innerHTML = `
            <div class="empty-state">
                <span class="empty-icon">📭</span>
                <p class="empty-title">No reports yet</p>
                <p class="empty-desc">Your submitted reports will appear here. Use the Report Failure button to file your first case.</p>
                <a href="report.html" class="btn-report" style="margin-top:16px; display:inline-flex;">File a Report</a>
            </div>`;
        return;
    }

    list.innerHTML = reports.map(r => `
        <div class="user-report-card row-enter">
            <div class="report-info">
                <div class="report-id">${escapeHtml(r.id)} · ${escapeHtml(r.date)}</div>
                <div class="report-title">${escapeHtml(r.description).substring(0, 80)}${r.description.length > 80 ? '…' : ''}</div>
                <div class="report-date">📍 ${escapeHtml(r.location)} — ${escapeHtml(r.category)}</div>
            </div>
            <span class="status-pill ${r.published ? 'status-active' : 'status-pending'}">
                ${r.published ? '✓ Published' : '🔴 Pending'}
            </span>
        </div>
    `).join('');
}

function getFullUser(email) {
    try {
        const users = JSON.parse(localStorage.getItem('ac_users')) || [];
        return users.find(u => u.email === email) || null;
    } catch { return null; }
}

function escapeHtml(str) {
    return String(str)
        .replace(/&/g, '&amp;').replace(/</g, '&lt;')
        .replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}

// Wire the second logout button (sidebar duplicate)
document.addEventListener('DOMContentLoaded', function () {
    const lb2 = document.getElementById('logoutBtn2');
    if (lb2) {
        lb2.addEventListener('click', function () {
            if (confirm('Sign out of your account?')) {
                window.AC.clearSession();
            }
        });
    }
}, false);
