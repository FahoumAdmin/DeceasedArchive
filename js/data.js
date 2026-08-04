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

// פורמט תאריך - תומך בתאריך מלא (YYYY-MM-DD), שנה+חודש (YYYY-MM), או שנה בלבד (YYYY)
function formatDate(date) {
    if (!date) return "";

    const parts = date.split("-");

    const year = parts[0];
    const month = parts[1];
    const day = parts[2];

    if (day) {
        return `${day}/${month}/${year}`;
    }

    if (month) {
        return `${month}/${year}`;
    }

    return year;
}

// רישום Service Worker
function registerServiceWorker() {
    if ("serviceWorker" in navigator) {
        navigator.serviceWorker.register("service-worker.js");
    }
}