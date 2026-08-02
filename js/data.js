// ======================================
// People PWA - Shared data & utilities
// נטען משני הדפים (index ו-results)
// ======================================

// טעינת קובץ JSON של האנשים
async function loadPeople() {
    const response = await fetch("data/people.json");

    if (!response.ok) {
        throw new Error("خطأ في الشبكة أثناء تحميل البيانات");
    }

    return await response.json();
}

// נרמול עברית לצורך חיפוש (מתעלם מאותיות סופיות)
function normalizeText(text) {
    return text
        .toLowerCase()
        .replace(/ך/g, "כ")
        .replace(/ם/g, "מ")
        .replace(/ן/g, "נ")
        .replace(/ף/g, "פ")
        .replace(/ץ/g, "צ");
}

// פורמט תאריך dd/mm/yyyy
function formatDate(date) {
    if (!date) return "";

    const parts = date.split("-");
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
}

// רישום Service Worker
function registerServiceWorker() {
    if ("serviceWorker" in navigator) {
        navigator.serviceWorker.register("service-worker.js");
    }
}
