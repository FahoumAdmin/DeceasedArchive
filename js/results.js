// ======================================
// People PWA - Results page (results.html)
// ======================================

let people = [];
let filteredPeople = [];
let selectedPerson = null;
let currentSort = "name";

// אלמנטים מהמסך
const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");
const clearBtn = document.getElementById("clearBtn");
const resultsBody = document.getElementById("resultsBody");
const status = document.getElementById("status");
const modal = document.getElementById("detailsModal");
const closeModal = document.getElementById("closeModal");
const detailsContent = document.getElementById("detailsContent");
const copyBtn = document.getElementById("copyBtn");
const printBtn = document.getElementById("printBtn");

document.addEventListener("DOMContentLoaded", init);

async function init() {
    registerServiceWorker();
    setupEvents();
    await loadInitialData();
}

async function loadInitialData() {
    try {
        people = await loadPeople();
        filteredPeople = [...people];

        // מונח החיפוש מגיע מכתובת ה-URL (מדף הבית) או מהחיפוש האחרון שנשמר
        const params = new URLSearchParams(window.location.search);
        const queryFromUrl = params.get("q");
        const lastSearch = localStorage.getItem("lastSearch");

        searchInput.value = queryFromUrl ?? lastSearch ?? "";

        search();
    } catch (error) {
        console.error("שגיאה בטעינת הנתונים:", error);
        status.textContent = "לא ניתן לטעון את רשימת האנשים";
    }
}

// אירועים
function setupEvents() {
    searchBtn.addEventListener("click", search);
    clearBtn.addEventListener("click", clearSearch);
    searchInput.addEventListener("input", search);
    closeModal.addEventListener("click", closeDetails);
    copyBtn.addEventListener("click", copyDetails);
    printBtn.addEventListener("click", printDetails);
}

// חיפוש
function search() {
    const text = normalizeText(searchInput.value.trim());

    localStorage.setItem("lastSearch", searchInput.value);
    updateUrl(searchInput.value);

    if (!text) {
        filteredPeople = [...people];
    } else {
        filteredPeople = people.filter(person =>
            normalizeText(person.fullName).includes(text)
        );
    }

    sortResults();
    renderTable();
}

// עדכון כתובת ה-URL כך שאפשר לשתף/לרענן ולשמור את מונח החיפוש
function updateUrl(text) {
    const params = new URLSearchParams(window.location.search);

    if (text) {
        params.set("q", text);
    } else {
        params.delete("q");
    }

    const query = params.toString();
    const newUrl = window.location.pathname + (query ? `?${query}` : "");
    window.history.replaceState({}, "", newUrl);
}

// ניקוי חיפוש
function clearSearch() {
    searchInput.value = "";
    localStorage.removeItem("lastSearch");
    updateUrl("");

    filteredPeople = [...people];
    renderTable();
}

// הצגת הטבלה
function renderTable() {
    resultsBody.innerHTML = "";
    status.textContent = `נמצאו ${filteredPeople.length} תוצאות`;

    filteredPeople.forEach(person => {
        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${highlight(person.fullName)}</td>
            <td>${formatDate(person.burialDate)}</td>
            <td>${person.location}</td>
        `;

        row.addEventListener("click", () => openDetails(person));

        resultsBody.appendChild(row);
    });
}

// הדגשת טקסט החיפוש
function highlight(text) {
    const searchText = searchInput.value.trim();

    if (!searchText) return text;

    const regex = new RegExp(escapeRegExp(searchText), "gi");

    return text.replace(regex, match => `<span class="highlight">${match}</span>`);
}

// מניעת שגיאה כאשר מונח החיפוש מכיל תווים מיוחדים של regex
function escapeRegExp(text) {
    return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// פתיחת פרטים
function openDetails(person) {
    selectedPerson = person;

    detailsContent.innerHTML = `
        <div class="detail">
            <div class="detail-title">מספר סידורי</div>
            ${person.serialNumber}
        </div>

        <div class="detail">
            <div class="detail-title">שם מלא</div>
            ${person.fullName}
        </div>

        <div class="detail">
            <div class="detail-title">תאריך לידה</div>
            ${formatDate(person.birthDate)}
        </div>

        <div class="detail">
            <div class="detail-title">תאריך קבורה</div>
            ${formatDate(person.burialDate)}
        </div>

        <div class="detail">
            <div class="detail-title">מיקום</div>
            ${person.location}
        </div>

        <div class="detail">
            <div class="detail-title">מידע כללי</div>
            ${person.generalInfo}
        </div>
    `;

    modal.classList.remove("hidden");
}

// סגירת חלון
function closeDetails() {
    modal.classList.add("hidden");
}

// העתקת פרטים
async function copyDetails() {
    if (!selectedPerson) return;

    const text = `
שם:
${selectedPerson.fullName}

מספר סידורי:
${selectedPerson.serialNumber}

תאריך לידה:
${formatDate(selectedPerson.birthDate)}

תאריך קבורה:
${formatDate(selectedPerson.burialDate)}

מיקום:
${selectedPerson.location}

מידע כללי:
${selectedPerson.generalInfo}
`;

    await navigator.clipboard.writeText(text);
    alert("הפרטים הועתקו");
}

// הדפסה
function printDetails() {
    window.print();
}

// מיון
function sortResults() {
    filteredPeople.sort((a, b) => {
        if (currentSort === "name") {
            return a.fullName.localeCompare(b.fullName, "he");
        }

        return 0;
    });
}
