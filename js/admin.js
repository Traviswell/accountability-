/* admin.js — report queue management */
document.addEventListener("DOMContentLoaded", function () {
    loadQueue();

    const flushBtn = document.getElementById('flushQueueBtn');
    if (flushBtn) {
        flushBtn.addEventListener('click', function () {
            if (confirm('This will permanently delete all queued reports. Continue?')) {
                localStorage.removeItem('coreLedger');
                loadQueue();
            }
        });
    }

    document.getElementById('admin-processing-node').addEventListener('click', function (e) {
        const btn = e.target.closest('button[data-action]');
        if (!btn) return;
        const pos = Number(btn.dataset.position);
        const reports = JSON.parse(localStorage.getItem('coreLedger')) || [];
        if (btn.dataset.action === 'publish') {
            reports[pos].published = true;
            localStorage.setItem('coreLedger', JSON.stringify(reports));
        } else if (btn.dataset.action === 'dismiss') {
            reports.splice(pos, 1);
            localStorage.setItem('coreLedger', JSON.stringify(reports));
        }
        loadQueue();
    });
});

function loadQueue() {
    const tbody = document.getElementById('admin-processing-node');
    if (!tbody) return;
    const reports = JSON.parse(localStorage.getItem('coreLedger')) || [];
    tbody.innerHTML = '';

    if (!reports.length) {
        tbody.innerHTML = '<tr><td colspan="3" class="text-muted" style="text-align:center;padding:24px">No reports in queue.</td></tr>';
        return;
    }

    reports.forEach((r, i) => {
        const tr = document.createElement('tr');
        tr.className = 'row-enter';
        const actions = r.published
            ? '<span class="status-pill status-resolved">✓ Published</span>'
            : `<div class="action-buttons">
                <button class="btn-report btn-sm" data-action="publish" data-position="${i}">Publish</button>
                <button class="btn-report btn-sm btn-secondary" data-action="dismiss" data-position="${i}">Dismiss</button>
               </div>`;
        tr.innerHTML = `<td><strong>${esc(r.id)}</strong><br><small>${esc(r.date)}</small></td>
            <td><strong>${esc(r.location)}</strong> — ${esc(r.category)}<br><small>${esc(r.description).substring(0,80)}…</small></td>
            <td>${actions}</td>`;
        tbody.appendChild(tr);
    });
}

function esc(s) {
    return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}
