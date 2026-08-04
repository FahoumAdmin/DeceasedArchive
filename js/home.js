// ======================================
// People PWA - Home page (index.html)
// ======================================

const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");
const oldestBurialsBtn = document.getElementById("oldestBurialsBtn");
const newestBurialsBtn = document.getElementById("newestBurialsBtn");
const installBtn = document.getElementById("installBtn");
const iosInstallHint = document.getElementById("iosInstallHint");
const iosInstallCloseBtn = document.getElementById("iosInstallCloseBtn");

let deferredInstallPrompt = null;

document.addEventListener("DOMContentLoaded", init);

function init() {
    registerServiceWorker();
    setupEvents();
    setupInstallPrompt();
    setupIosInstallHint();
    searchInput.focus();
}

function setupEvents() {
    searchBtn.addEventListener("click", goToResults);

    searchInput.addEventListener("keydown", event => {
        if (event.key === "Enter") {
            goToResults();
        }
    });

    oldestBurialsBtn.addEventListener("click", goToOldestBurials);
    newestBurialsBtn.addEventListener("click", goToNewestBurials);
}

// מעבר לדף התוצאות עם בקשה למיון לפי 5 הקבורות הוותיקות ביותר
function goToOldestBurials() {
    window.location.href = "results.html?sort=oldestBurial";
}

// מעבר לדף התוצאות עם בקשה למיון לפי 5 הקבורות האחרונות
function goToNewestBurials() {
    window.location.href = "results.html?sort=newestBurial";
}

// לוגיקת כפתור "התקן אפליקציה" (PWA install prompt)
function setupInstallPrompt() {
    // אם האפליקציה כבר מותקנת/רצה במצב standalone, אין צורך להציג את הכפתור
    if (isRunningStandalone()) {
        return;
    }

    // הדפדפן מודיע שאפשר להציע התקנה
    window.addEventListener("beforeinstallprompt", event => {
        event.preventDefault();
        deferredInstallPrompt = event;
        installBtn.hidden = false;
    });

    installBtn.addEventListener("click", async () => {
        if (!deferredInstallPrompt) {
            return;
        }
        installBtn.hidden = true;
        deferredInstallPrompt.prompt();
        await deferredInstallPrompt.userChoice;
        deferredInstallPrompt = null;
    });

    // לאחר התקנה בפועל - הסתרת הכפתור
    window.addEventListener("appinstalled", () => {
        installBtn.hidden = true;
        deferredInstallPrompt = null;
    });
}

function isRunningStandalone() {
    return (
        window.matchMedia("(display-mode: standalone)").matches ||
        window.navigator.standalone === true
    );
}

// הודעה ידנית למשתמשי אייפון/אייפד (Safari לא תומך ב-beforeinstallprompt)
const IOS_HINT_DISMISSED_KEY = "iosInstallHintDismissed";

function setupIosInstallHint() {
    if (isRunningStandalone()) {
        return;
    }

    if (!isIosSafari()) {
        return;
    }

    if (localStorage.getItem(IOS_HINT_DISMISSED_KEY) === "1") {
        return;
    }

    iosInstallHint.hidden = false;

    iosInstallCloseBtn.addEventListener("click", () => {
        iosInstallHint.hidden = true;
        localStorage.setItem(IOS_HINT_DISMISSED_KEY, "1");
    });
}

function isIosSafari() {
    const ua = window.navigator.userAgent;

    // מכשיר iOS (כולל iPad שמזדהה כ-Mac אך עם מסך מגע)
    const isIos =
        /iPad|iPhone|iPod/.test(ua) ||
        (ua.includes("Macintosh") && navigator.maxTouchPoints > 1);

    // Safari בלבד (לא כרום/פיירפוקס על iOS, שגם הם מבוססי WebKit אך לא Safari עצמו)
    const isSafari =
        /Safari/.test(ua) && !/CriOS|FxiOS|EdgiOS|OPiOS/.test(ua);

    return isIos && isSafari;
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