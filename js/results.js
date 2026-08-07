// ======================================
// People PWA - Results page (results.html)
// ======================================

let people = [];
let filteredPeople = [];
let selectedPerson = null;
let currentSort = "name";

let currentPage = 1;
const PAGE_SIZE = 5;

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
const pagination = document.getElementById("pagination");
const prevPageBtn = document.getElementById("prevPageBtn");
const nextPageBtn = document.getElementById("nextPageBtn");
const pageInfo = document.getElementById("pageInfo");

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

        const params = new URLSearchParams(window.location.search);
        const queryFromUrl = params.get("q");
        const lastSearch = localStorage.getItem("lastSearch");
        const sortFromUrl = params.get("sort");

        if (sortFromUrl === "oldestBurial" || sortFromUrl === "newestBurial") {
            currentSort = sortFromUrl;
            searchInput.value = "";
        } else {
            searchInput.value = queryFromUrl ?? lastSearch ?? "";
        }

        search();
    } catch (error) {
        console.error("خطأ في تحميل البيانات:", error);
        status.textContent = "لا يمكن تحميل قائمة الأشخاص.";
    }
}

// אירועים
function setupEvents() {
    searchBtn.addEventListener("click", exitSpecialSortModeAndSearch);
    clearBtn.addEventListener("click", clearSearch);
    searchInput.addEventListener("input", exitSpecialSortModeAndSearch);
    closeModal.addEventListener("click", closeDetails);
    copyBtn.addEventListener("click", copyDetails);
    printBtn.addEventListener("click", printDetails);
    prevPageBtn.addEventListener("click", goToPrevPage);
    nextPageBtn.addEventListener("click", goToNextPage);
}

// אם המשתמש מתחיל לחפש באופן ידני, יוצאים ממצבי "5 הקבורות" וחוזרים למיון לפי שם
function exitSpecialSortModeAndSearch() {
    if (currentSort === "oldestBurial" || currentSort === "newestBurial") {
        currentSort = "name";
        removeSortParamFromUrl();
    }

    search();
}

function removeSortParamFromUrl() {
    const params = new URLSearchParams(window.location.search);
    params.delete("sort");

    const query = params.toString();
    const newUrl = window.location.pathname + (query ? `?${query}` : "");
    window.history.replaceState({}, "", newUrl);
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

    // במצבי "5 הקבורות הוותיקות/האחרונות" מציגים רק חמישה
    if (currentSort === "oldestBurial" || currentSort === "newestBurial") {
        filteredPeople = filteredPeople.slice(0, 5);
    }

    currentPage = 1;
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
    currentPage = 1;
    renderTable();
}

// הצגת הטבלה
function renderTable() {
    resultsBody.innerHTML = "";

    if (currentSort === "oldestBurial") {
        status.textContent = "أقدم 5 حالات دفن (من الأقدم إلى الأحدث)";
    } else if (currentSort === "newestBurial") {
        status.textContent = "أحدث 5 حالات دفن (من الأحدث إلى الأقدم)";
    } else {
        status.textContent = `وجد ${filteredPeople.length} بيانات`;
    }

    const pageItems = getCurrentPageItems();

    pageItems.forEach(person => {
        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${highlight(person.fullName)}</td>
            <td>${formatDate(person.birthDate)}</td>
            <td>${formatDate(person.burialDate)}</td>
        `;

        row.addEventListener("click", () => openDetails(person));

        resultsBody.appendChild(row);
    });

    updatePagination();
}

// מחזיר את הרשומות של העמוד הנוכחי בלבד
function getCurrentPageItems() {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredPeople.slice(start, start + PAGE_SIZE);
}

// מספר העמודים הכולל
function totalPages() {
    return Math.max(1, Math.ceil(filteredPeople.length / PAGE_SIZE));
}

// עדכון פקדי הדפדוף (הצגה/הסתרה, טקסט עמוד, נטרול כפתורים בקצוות)
function updatePagination() {
    const pages = totalPages();

    if (filteredPeople.length <= PAGE_SIZE) {
        pagination.classList.add("hidden");
        return;
    }

    pagination.classList.remove("hidden");
    pageInfo.textContent = `صفحة ${currentPage} من ${pages}`;

    prevPageBtn.disabled = currentPage <= 1;
    nextPageBtn.disabled = currentPage >= pages;
}

function goToPrevPage() {
    if (currentPage <= 1) return;

    currentPage--;
    renderTable();
    scrollToTableTop();
}

function goToNextPage() {
    if (currentPage >= totalPages()) return;

    currentPage++;
    renderTable();
    scrollToTableTop();
}

function scrollToTableTop() {
    document.getElementById("resultsTable").scrollIntoView({ block: "start", behavior: "smooth" });
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
            <div class="detail-title">الاسم الكامل</div>
            ${person.fullName}
        </div>

        <div class="detail">
            <div class="detail-title">تاريخ الميلاد</div>
            ${formatDate(person.birthDate)}
        </div>

        <div class="detail">
            <div class="detail-title">تاريخ الوفاة</div>
            ${formatDate(person.burialDate)}
        </div>

        <div class="detail">
            <div class="detail-title">موقع الدفن</div>
            ${person.location}
        </div>

        <div class="detail">
            <div class="detail-title">معلومات عامة</div>
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
الاسم:
${selectedPerson.fullName}

الرقم التسلسلي:
${selectedPerson.serialNumber}

تاريخ الميلاد:
${formatDate(selectedPerson.birthDate)}

تاريخ الوفاة:
${formatDate(selectedPerson.burialDate)}

موقع الدفن:
${selectedPerson.location}

معلومات عامة:
${selectedPerson.generalInfo}
`;

    await navigator.clipboard.writeText(text);
    alert("تم نسخ التفاصيل");
}

// הדפסה
function printDetails() {
    window.print();
}

// מיון
function sortResults() {
    filteredPeople.sort((a, b) => {
        if (currentSort === "oldestBurial") {
            // רשומות בלי תאריך קבורה יידחקו לסוף, לא ייחשבו "הכי ותיקות"
            const dateA = a.burialDate || "9999";
            const dateB = b.burialDate || "9999";
            return dateA.localeCompare(dateB);
        }

        if (currentSort === "newestBurial") {
            // רשומות בלי תאריך קבורה יידחקו לסוף, לא ייחשבו "הכי אחרונות"
            const dateA = a.burialDate || "0000";
            const dateB = b.burialDate || "0000";
            return dateB.localeCompare(dateA);
        }

        if (currentSort === "name") {
            return a.fullName.localeCompare(b.fullName, "he");
        }

        return 0;
    });
}
