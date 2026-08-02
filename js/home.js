// ======================================
// People PWA - Home page (index.html)
// ======================================

const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");

document.addEventListener("DOMContentLoaded", init);

function init() {
    registerServiceWorker();
    setupEvents();
    searchInput.focus();
}

function setupEvents() {
    searchBtn.addEventListener("click", goToResults);

    searchInput.addEventListener("keydown", event => {
        if (event.key === "Enter") {
            goToResults();
        }
    });
}

// מעבר לדף התוצאות עם מונח החיפוש בכתובת (או בלי מונח, כדי להציג הכל)
function goToResults() {
    const text = searchInput.value.trim();

    const params = new URLSearchParams();
    if (text) {
        params.set("q", text);
    }

    const query = params.toString();
    window.location.href = "results.html" + (query ? `?${query}` : "");
}
