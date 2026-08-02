// ======================================
// People PWA - Main Application
// ======================================


// משתנים גלובליים

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




// טעינת האפליקציה

document.addEventListener(
    "DOMContentLoaded",
    init
);



async function init(){

    await loadPeople();

    registerServiceWorker();

    restoreLastSearch();

    setupEvents();

}




// טעינת קובץ JSON

async function loadPeople(){

    try{

        const response = await fetch(
            "data/people.json"
        );


        people = await response.json();


        filteredPeople = [...people];


        renderTable();


    }

    catch(error){

        console.error(
            "שגיאה בטעינת הנתונים:",
            error
        );


        status.textContent =
            "לא ניתן לטעון את רשימת האנשים";

    }

}





// אירועים

function setupEvents(){


    searchBtn.addEventListener(
        "click",
        search
    );


    clearBtn.addEventListener(
        "click",
        clearSearch
    );


    searchInput.addEventListener(
        "input",
        search
    );


    closeModal.addEventListener(
        "click",
        closeDetails
    );


    copyBtn.addEventListener(
        "click",
        copyDetails
    );


    printBtn.addEventListener(
        "click",
        printDetails
    );

}







// חיפוש

function search(){


    const text =
        normalizeText(
            searchInput.value.trim()
        );


    localStorage.setItem(
        "lastSearch",
        searchInput.value
    );



    if(!text){

        filteredPeople = [...people];

    }

    else{


        filteredPeople =
            people.filter(

                person =>

                normalizeText(
                    person.fullName
                )
                .includes(text)

            );

    }



    sortResults();

    renderTable();


}





// ניקוי חיפוש

function clearSearch(){

    searchInput.value = "";

    localStorage.removeItem(
        "lastSearch"
    );


    filteredPeople = [...people];


    renderTable();

}







// נרמול עברית

function normalizeText(text){

    return text

        .toLowerCase()

        .replace(/ך/g,"כ")

        .replace(/ם/g,"מ")

        .replace(/ן/g,"נ")

        .replace(/ף/g,"פ")

        .replace(/ץ/g,"צ");

}





// הצגת הטבלה

function renderTable(){


    resultsBody.innerHTML = "";


    status.textContent =
        `נמצאו ${filteredPeople.length} תוצאות`;



    filteredPeople.forEach(

        person => {


            const row =
                document.createElement("tr");



            row.innerHTML = `

                <td>
                    ${highlight(
                        person.fullName
                    )}
                </td>

                <td>
                    ${formatDate(
                        person.burialDate
                    )}
                </td>

                <td>
                    ${person.location}
                </td>

            `;



            row.addEventListener(

                "click",

                () => openDetails(person)

            );



            resultsBody.appendChild(row);


        }

    );


}





// הדגשת טקסט החיפוש

function highlight(text){


    const searchText =
        searchInput.value.trim();



    if(!searchText)
        return text;



    const regex =
        new RegExp(
            searchText,
            "gi"
        );



    return text.replace(

        regex,

        match =>
        `<span class="highlight">
            ${match}
        </span>`

    );

}





// פתיחת פרטים

function openDetails(person){


    selectedPerson = person;



    detailsContent.innerHTML = `


        <div class="detail">

            <div class="detail-title">
                מספר סידורי
            </div>

            ${person.serialNumber}

        </div>



        <div class="detail">

            <div class="detail-title">
                שם מלא
            </div>

            ${person.fullName}

        </div>



        <div class="detail">

            <div class="detail-title">
                תאריך לידה
            </div>

            ${formatDate(
                person.birthDate
            )}

        </div>



        <div class="detail">

            <div class="detail-title">
                תאריך קבורה
            </div>

            ${formatDate(
                person.burialDate
            )}

        </div>



        <div class="detail">

            <div class="detail-title">
                מיקום
            </div>

            ${person.location}

        </div>



        <div class="detail">

            <div class="detail-title">
                מידע כללי
            </div>

            ${person.generalInfo}

        </div>


    `;



    modal.classList.remove(
        "hidden"
    );


}





// סגירת חלון

function closeDetails(){

    modal.classList.add(
        "hidden"
    );

}





// העתקת פרטים

async function copyDetails(){


    if(!selectedPerson)
        return;



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


    alert(
        "הפרטים הועתקו"
    );

}





// הדפסה

function printDetails(){

    window.print();

}







// פורמט תאריך

function formatDate(date){


    if(!date)
        return "";


    const parts =
        date.split("-");


    return `${parts[2]}/${parts[1]}/${parts[0]}`;

}





// מיון

function sortResults(){


    filteredPeople.sort(

        (a,b)=>{


            if(currentSort==="name"){

                return a.fullName.localeCompare(
                    b.fullName,
                    "he"
                );

            }


            return 0;

        }

    );


}





// שחזור חיפוש אחרון

function restoreLastSearch(){

    const last =
        localStorage.getItem(
            "lastSearch"
        );


    if(last){

        searchInput.value = last;

        search();

    }

}





// רישום PWA

function registerServiceWorker(){


    if(
        "serviceWorker" in navigator
    ){

        navigator.serviceWorker.register(
            "service-worker.js"
        );

    }

}