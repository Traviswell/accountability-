/* storage.js — citizen report submission */
document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById('complaintForm');
    if (!form) return;

    form.addEventListener('submit', function (e) {
        e.preventDefault();
        const location = document.getElementById('fieldLocation').value.trim();
        const category = document.getElementById('fieldCategory').value;
        const details = document.getElementById('fieldDetails').value.trim();
        const successBox = document.getElementById('reportSuccess');
        const errorBox = document.getElementById('reportError');

        if (errorBox) errorBox.style.display = 'none';

        const user = window.AC ? window.AC.getSessionUser() : null;

        const payload = {
            id: 'AC-' + Math.floor(Math.random() * 90000 + 10000),
            userId: user ? user.id : 'anonymous',
            location,
            category,
            description: details,
            status: '🔴 Pending Action',
            published: false,
            date: new Date().toLocaleDateString()
        };

        const reports = JSON.parse(localStorage.getItem('coreLedger')) || [];
        reports.push(payload);
        localStorage.setItem('coreLedger', JSON.stringify(reports));

        if (successBox) successBox.style.display = 'block';
        form.reset();

        const btn = form.querySelector('button[type="submit"]');
        if (btn) {
            btn.textContent = '✓ Submitted';
            btn.disabled = true;
            setTimeout(() => {
                btn.textContent = 'Submit Report';
                btn.disabled = false;
                if (successBox) successBox.style.display = 'none';
            }, 4000);
        }
    });
});
