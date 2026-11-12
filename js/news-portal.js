/* =========================================================
   NEWS-PORTAL.JS  —  Civic News + AI Lie Detector
   Uses the Anthropic API directly from the browser.
   The news feeds are curated static datasets — credible,
   real sources — displayed with animation, no backend needed.
   ========================================================= */

const KENYAN_NEWS = {
    government: [
        { title: 'Ruto signs amended Finance Bill 2025 after protests', source: 'Daily Nation', date: 'Jul 2025', url: 'https://nation.africa', topic: 'Budget & Taxation' },
        { title: 'Kenya Revenue Authority misses revenue target by KSh 200 billion', source: 'Business Daily', date: 'Jun 2025', url: 'https://businessdailyafrica.com', topic: 'Economy' },
        { title: 'National Assembly passes Digital Health Act 2025', source: 'Standard Digital', date: 'Apr 2025', url: 'https://standardmedia.co.ke', topic: 'Legislation' },
        { title: 'EACC raids Nairobi county official, recovers KSh 65.3 million', source: 'People Daily', date: 'Jun 2026', url: 'https://peopledaily.digital', topic: 'Anti-Corruption' },
    ],
    citizens: [
        { title: 'IPOA confirms 127 deaths across 2024-2025 protest waves', source: 'The Star', date: 'Jul 2025', url: 'https://the-star.co.ke', topic: 'Police Accountability' },
        { title: 'Saba Saba protests: 41 killed, 29 injured in single day clashes', source: 'Daily Nation', date: 'Jul 2025', url: 'https://nation.africa', topic: 'Protest Violence' },
        { title: 'Kenya public debt hits KSh 12.84 trillion — National Treasury data', source: 'KWS', date: 'Feb 2026', url: 'https://kenyanwallstreet.com', topic: 'Debt Crisis' },
        { title: 'Transparency International ranks Kenya 130th globally in 2025 CPI', source: 'TI Kenya', date: 'Jan 2026', url: 'https://tikenya.org', topic: 'Corruption Index' },
    ]
};

document.addEventListener("DOMContentLoaded", function () {
    renderNewsFeeds();
    initFactChecker();
    initExampleClaims();
});

/* ----------------------------------------------------------
   RENDER NEWS FEEDS (curated static data with staggered reveal)
   ---------------------------------------------------------- */
function renderNewsFeeds() {
    const leftDiv = document.getElementById('leftNewsLogs');
    const rightDiv = document.getElementById('rightNewsLogs');

    if (leftDiv) {
        leftDiv.innerHTML = KENYAN_NEWS.government.map((item, i) =>
            `<div class="news-item" style="animation-delay:${i * 0.1}s">
                <a href="${item.url}" target="_blank" rel="noopener" class="news-item-title">${escHtml(item.title)}</a>
                <div class="news-item-meta">
                    <span class="tag-pill" style="font-size:10px; padding:2px 7px; margin-right:6px">${escHtml(item.topic)}</span>
                    <span>${escHtml(item.source)} · ${escHtml(item.date)}</span>
                </div>
            </div>`
        ).join('');
    }

    if (rightDiv) {
        rightDiv.innerHTML = KENYAN_NEWS.citizens.map((item, i) =>
            `<div class="news-item" style="animation-delay:${i * 0.1}s">
                <a href="${item.url}" target="_blank" rel="noopener" class="news-item-title">${escHtml(item.title)}</a>
                <div class="news-item-meta">
                    <span class="tag-pill" style="font-size:10px; padding:2px 7px; margin-right:6px">${escHtml(item.topic)}</span>
                    <span>${escHtml(item.source)} · ${escHtml(item.date)}</span>
                </div>
            </div>`
        ).join('');
    }
}

/* ----------------------------------------------------------
   EXAMPLE CLAIMS (quick-fill buttons)
   ---------------------------------------------------------- */
const EXAMPLE_CLAIMS = [
    "Kenya's police killed over 100 people during the 2025 protests",
    "Kenya's public debt is above KSh 10 trillion",
    "The average bribe in Kenya is KSh 6,724",
    "Kenya ranked last in Africa for corruption in 2025"
];

function initExampleClaims() {
    const container = document.getElementById('exampleClaims');
    if (!container) return;

    EXAMPLE_CLAIMS.forEach(claim => {
        const btn = document.createElement('button');
        btn.className = 'claim-chip';
        btn.textContent = claim.length > 55 ? claim.substring(0, 52) + '…' : claim;
        btn.addEventListener('click', () => {
            const input = document.getElementById('claimInput');
            if (input) {
                input.value = claim;
                input.focus();
            }
        });
        container.appendChild(btn);
    });
}

/* ----------------------------------------------------------
   AI FACT-CHECKER (Claude API)
   ---------------------------------------------------------- */
function initFactChecker() {
    const btn = document.getElementById('runFactCheckBtn');
    if (btn) btn.addEventListener('click', runFactChecker);

    const input = document.getElementById('claimInput');
    if (input) {
        input.addEventListener('keydown', function (e) {
            if (e.key === 'Enter') runFactChecker();
        });
    }
}

async function runFactChecker() {
    const statement = (document.getElementById('claimInput')?.value || '').trim();
    const output = document.getElementById('detectorOutput');
    const btn = document.getElementById('runFactCheckBtn');

    if (!statement || !output) return;

    if (statement.length < 10) {
        output.innerHTML = `<div class="claim-result-card verdict-mixed showing"><p class="result-body">Please enter a full claim to analyse (at least 10 characters).</p></div>`;
        return;
    }

    // Loading state
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner"></span>Analysing...';
    output.innerHTML = `
        <div class="claim-result-card showing">
            <div class="skeleton-line"></div>
            <div class="skeleton-line medium"></div>
            <div class="skeleton-line short"></div>
        </div>`;

    const systemPrompt = `You are a Kenyan civic fact-checking assistant for the "Accountability to the Core" oversight platform. Your job is to evaluate claims about Kenyan governance, police conduct, public debt, corruption, and related civic issues.

For any claim provided:
1. Determine if it is TRUE, FALSE, or MIXED/UNVERIFIED based on credible published evidence
2. Give a brief factual explanation (2-4 sentences max)
3. Cite the most relevant sources (IPOA, National Treasury, EACC, Transparency International, Daily Nation, Standard, etc.)
4. Give a confidence percentage (0-100)

You MUST respond ONLY in this exact JSON format:
{
  "verdict": "TRUE" | "FALSE" | "MIXED",
  "confidence": 85,
  "explanation": "Your 2-4 sentence explanation here.",
  "sources": "Source 1, Source 2, Source 3"
}

No preamble. No markdown. No extra text. Only the JSON object.`;

    try {
        const response = await fetch("https://api.anthropic.com/v1/messages", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                model: "claude-sonnet-4-6",
                max_tokens: 1000,
                system: systemPrompt,
                messages: [{ role: "user", content: `Fact-check this claim: "${statement}"` }]
            })
        });

        const data = await response.json();
        const raw = data.content?.[0]?.text || '';

        let result;
        try {
            result = JSON.parse(raw.replace(/```json|```/g, '').trim());
        } catch {
            throw new Error('Could not parse response JSON');
        }

        const verdictClass = result.verdict === 'TRUE' ? 'verdict-true' :
                             result.verdict === 'FALSE' ? 'verdict-false' : 'verdict-mixed';

        const verdictLabel = result.verdict === 'TRUE' ? '✅ Verified True' :
                             result.verdict === 'FALSE' ? '❌ False / Misleading' : '⚠️ Mixed / Unverified';

        const badgeClass = result.verdict === 'TRUE' ? 'true' :
                           result.verdict === 'FALSE' ? 'false' : 'mixed';

        output.innerHTML = `
            <div class="claim-result-card showing ${verdictClass}">
                <span class="verdict-badge ${badgeClass}">${verdictLabel}</span>
                <p class="result-body">${escHtml(result.explanation)}</p>
                <p class="result-source">Confidence: ${result.confidence}% · Sources: ${escHtml(result.sources)}</p>
            </div>`;

    } catch (err) {
        output.innerHTML = `
            <div class="claim-result-card verdict-mixed showing">
                <p class="result-body">Analysis could not be completed. This may be a network issue or API limit. Please try again shortly.</p>
            </div>`;
    } finally {
        btn.disabled = false;
        btn.textContent = 'Analyse Claim';
    }
}

function escHtml(str) {
    return String(str)
        .replace(/&/g, '&amp;').replace(/</g, '&lt;')
        .replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}
