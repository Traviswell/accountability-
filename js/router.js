/* =========================================================
   ROUTER.JS  —  runs on every page
   Handles: header/footer injection, scroll progress bar,
   page-exit transitions on internal links, scroll-reveal,
   button ripples, and active nav link highlighting.
   NO inline styles or onclick attributes anywhere.
   ========================================================= */

document.addEventListener("DOMContentLoaded", function () {
    injectHeader();
    injectFooter();
    initScrollBar();
    initScrollReveal();
    initGalleryReveal();
    initButtonRipples();
    initPageTransitions();
    highlightActiveNav();
});

/* ----------------------------------------------------------
   HEADER
   ---------------------------------------------------------- */
function injectHeader() {
    const node = document.getElementById("inject-global-header");
    if (!node) return;

    const user = getSessionUser();
    const userNav = user
        ? `<a href="user-dashboard.html" class="btn-report btn-green btn-sm">👤 ${user.name.split(' ')[0]}</a>`
        : `<a href="user-login.html" class="btn-report btn-dark btn-sm">Sign In</a>`;

    node.innerHTML = `
        <div class="scroll-bar" id="scrollBar"></div>
        <header class="branding-nav">
            <div class="container">
                <div class="nav-wrapper">
                    <a href="index.html" class="brand-logo" aria-label="Accountability to the Core Home">
                        <img src="images/accountability_to_the_core2.png" alt="AC Logo" width="40" height="40">
                        <div class="logo-text">
                            <h1>ACCOUNTABILITY TO THE CORE</h1>
                            <span>National Citizen Oversight Platform</span>
                        </div>
                    </a>
                    <div class="nav-scroll-wrap">
                        <nav class="nav-menu" aria-label="Main navigation">
                            <a href="dashboard.html">Live Tracker</a>
                            <a href="vice-tracker.html">Vice Tracker</a>
                            <a href="policy-watch.html">Policy Watch</a>
                            <a href="news-portal.html">NewsKing</a>
                            <a href="about.html">Manifesto</a>
                            <a href="contact.html">Contact</a>
                            <a href="admin.html">Console</a>
                            <a href="report.html" class="btn-report btn-sm">Report Failure</a>
                            ${userNav}
                        </nav>
                    </div>
                </div>
            </div>
        </header>`;
}

/* ----------------------------------------------------------
   FOOTER
   ---------------------------------------------------------- */
function injectFooter() {
    const node = document.getElementById("inject-global-footer");
    if (!node) return;

    node.innerHTML = `
        <footer class="core-footer">
            <div class="container">
                <p class="footer-brand">ACCOUNTABILITY TO THE CORE™</p>
                <p class="text-muted" style="font-size:12px; margin-bottom:12px;">www.accountability-to-the-core.netlify.app</p>
                <nav class="footer-links" aria-label="Footer navigation">
                    <a href="index.html">Home</a>
                    <a href="dashboard.html">Tracker</a>
                    <a href="vice-tracker.html">Vice Tracker</a>
                    <a href="news-portal.html">NewsKing</a>
                    <a href="about.html">About</a>
                    <a href="contact.html">Contact</a>
                    <a href="report.html">Report</a>
                    <a href="user-login.html">Sign In</a>
                </nav>
                <p class="footer-copy">© 2026 Accountability to the Core. Built by Travis Kimutai. All rights reserved.</p>
            </div>
        </footer>`;
}

/* ----------------------------------------------------------
   SCROLL PROGRESS BAR
   (width is updated in requestAnimationFrame for smoothness)
   ---------------------------------------------------------- */
function initScrollBar() {
    function updateBar() {
        const bar = document.getElementById('scrollBar');
        if (!bar) return;
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
        bar.style.width = pct + '%';
    }
    window.addEventListener('scroll', updateBar, { passive: true });
    updateBar();
}

/* ----------------------------------------------------------
   SCROLL-REVEAL  (generic .reveal elements)
   ---------------------------------------------------------- */
function initScrollReveal() {
    const targets = document.querySelectorAll('.reveal');
    if (!targets.length) return;

    if (!('IntersectionObserver' in window)) {
        targets.forEach(el => el.classList.add('is-visible'));
        return;
    }

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.10 });

    targets.forEach(el => observer.observe(el));
}

/* ----------------------------------------------------------
   GALLERY CARD REVEAL  (staggered, for evidence photos)
   ---------------------------------------------------------- */
function initGalleryReveal() {
    const cards = document.querySelectorAll('.evidence-gallery .gallery-card');
    if (!cards.length) return;

    if (!('IntersectionObserver' in window)) {
        cards.forEach(c => c.classList.add('is-visible'));
        return;
    }

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.08 });

    cards.forEach(c => observer.observe(c));
}

/* ----------------------------------------------------------
   PAGE-EXIT TRANSITION
   Adds .page-exit class to body before navigating to any
   internal link so the CSS fadeOutDown plays first.
   ---------------------------------------------------------- */
function initPageTransitions() {
    document.addEventListener('click', function (e) {
        const anchor = e.target.closest('a[href]');
        if (!anchor) return;

        const href = anchor.getAttribute('href');
        if (!href) return;

        const isInternal = !href.startsWith('http') && !href.startsWith('//') &&
                           !href.startsWith('mailto:') && !href.startsWith('tel:') &&
                           !href.startsWith('#') && href.endsWith('.html');

        if (isInternal) {
            e.preventDefault();
            document.body.classList.add('page-exit');
            setTimeout(() => { window.location.href = href; }, 200);
        }
    });
}

/* ----------------------------------------------------------
   ACTIVE NAV LINK HIGHLIGHT
   ---------------------------------------------------------- */
function highlightActiveNav() {
    const current = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-menu a').forEach(link => {
        const href = link.getAttribute('href');
        if (href === current) link.classList.add('nav-active');
    });
}

/* ----------------------------------------------------------
   BUTTON RIPPLE EFFECT  (Material-style, on all .btn-report)
   ---------------------------------------------------------- */
function initButtonRipples() {
    document.addEventListener('click', function (e) {
        const btn = e.target.closest('.btn-report');
        if (!btn) return;

        const existing = btn.querySelector('.ripple');
        if (existing) existing.remove();

        const rect = btn.getBoundingClientRect();
        const diameter = Math.max(rect.width, rect.height);
        const circle = document.createElement('span');

        circle.className = 'ripple';
        circle.style.width = circle.style.height = diameter + 'px';
        circle.style.left = (e.clientX - rect.left - diameter / 2) + 'px';
        circle.style.top = (e.clientY - rect.top - diameter / 2) + 'px';

        btn.appendChild(circle);
        setTimeout(() => circle.remove(), 650);
    });
}

/* ----------------------------------------------------------
   USER SESSION HELPERS  (shared across all pages)
   ---------------------------------------------------------- */
function getSessionUser() {
    try {
        return JSON.parse(localStorage.getItem('ac_session')) || null;
    } catch { return null; }
}

function clearSession() {
    localStorage.removeItem('ac_session');
    window.location.href = 'user-login.html';
}

// Expose helpers globally so page-specific scripts can call them
window.AC = window.AC || {};
window.AC.getSessionUser = getSessionUser;
window.AC.clearSession = clearSession;
