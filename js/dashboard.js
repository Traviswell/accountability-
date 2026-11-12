/* dashboard.js — renders published citizen reports into live tracker */
document.addEventListener("DOMContentLoaded", function () {
    const container = document.getElementById('render-target-rows');
    if (!container) return;

    const reports = JSON.parse(localStorage.getItem('coreLedger')) || [];
    const published = reports.filter(r => r.published === true);

    if (published.length === 0) return;

    published.forEach((item, i) => {
        const tr = document.createElement('tr');
        tr.className = 'row-enter';
        tr.style.animationDelay = (i * 0.08) + 's';
        tr.innerHTML = `
            <td>${esc(item.id)}</td>
            <td><strong>${esc(item.location)}</strong></td>
            <td>${esc(item.category)}</td>
            <td>${esc(item.description).substring(0, 55)}${item.description.length > 55 ? '…' : ''}</td>
            <td><span class="status-pill status-pending">${esc(item.status || '🔴 Pending')}</span></td>`;
        container.appendChild(tr);
    });

    function esc(s) {
        return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
    }
});
