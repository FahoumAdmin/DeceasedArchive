const params = new URLSearchParams(window.location.search);

const query = params.get("q") || "";

document.getElementById("backBtn").addEventListener("click", () => {

    window.location.href = "index.html";

});






searchPeople(query);
