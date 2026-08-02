const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");

document.addEventListener("DOMContentLoaded", () => {

    registerServiceWorker();

    const lastSearch = localStorage.getItem("lastSearch");

    if (lastSearch) {
        searchInput.value = lastSearch;
    }

    searchBtn.addEventListener("click", goSearch);

    searchInput.addEventListener("keydown", e => {

        if (e.key === "Enter") {
            goSearch();
        }

    });

});

function goSearch() {

    const text = searchInput.value.trim();

    if (!text) return;

    localStorage.setItem("lastSearch", text);

    window.location.href =
        `results.html?q=${encodeURIComponent(text)}`;

}
