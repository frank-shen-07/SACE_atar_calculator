// --- Constants ---
const headstartGrades = ["HD", "D", "C", "P"];
const vetGrades = ["Average of top 4 subjects"];
const standardGrades = [
    "A++/Merit", "A+", "A", "A-", "B+", "B", "B-", "C+", "C", "C-", "D+", "D", "D-", "E+", "E", "E-"
];
const subjectOptions = [
    "Accounting",
    "AIF",
    "Ancient Studies",
    "Art",
    "Biology",
    "Business Innovation",
    "Chemistry",
    "Dance",
    "Design",
    "Digital Tech",
    "Drama",
    "EAL",
    "Economics",
    "English",
    "English Literary Studies",
    "Essential Mathematics",
    "Film Studies",
    "Geography",
    "General Mathematics",
    "Headstart",
    "Health and Wellbeing",
    "Languages",
    "Legal Studies",
    "Mathematical Methods",
    "Modern History",
    "Music Ensemble",
    "Music Explorations",
    "Music Performance",
    "Music Studies",
    "Philosophy",
    "Physical Education",
    "Physics",
    "Psychology",
    "Religion",
    "Research Project",
    "Scientific Studies",
    "Society and Culture",
    "Specialist Mathematics",
    "Tourism",
    "VET",
    "Workplace Practices"
];

// ==================== Subject Combo/Dropdown Logic ====================

for (let i = 1; i <= 5; i++) createSubjectCombo(i);

function createSubjectCombo(row) {
    const input = document.getElementById(`subject${row}`);
    const list = document.getElementById(`subject-list${row}`);
    list.innerHTML = '';

    subjectOptions.forEach(opt => {
        const li = document.createElement('li');
        li.textContent = opt;
        li.onclick = () => selectSubject(row, opt);
        list.appendChild(li);
    });

    input.addEventListener("focus", () => showSubjectList(row));
    input.addEventListener("input", () => filterSubjectList(row));
    input.addEventListener("click", () => showSubjectList(row));
    input.addEventListener("blur", () => setTimeout(() => hideSubjectList(row), 120));
}

function showSubjectList(row) {
    const input = document.getElementById(`subject${row}`);
    const list = document.getElementById(`subject-list${row}`);

    if (list.parentNode !== document.body) document.body.appendChild(list);

    const rect = input.getBoundingClientRect();
    list.style.position = 'fixed';
    list.style.display = 'block';
    list.style.left = (rect.left - 1) + 'px';
    list.style.top = (rect.bottom) + 'px';
    list.style.width = (rect.width + 2) + 'px';
    list.style.zIndex = 9999;
}

function hideSubjectList(row) {
    document.getElementById(`subject-list${row}`).style.display = 'none';
}

window.addEventListener('scroll', () => {
    for (let i = 1; i <= 5; i++) hideSubjectList(i);
});

window.addEventListener('resize', () => {
    for (let i = 1; i <= 5; i++) hideSubjectList(i);
});

function filterSubjectList(row) {
    const input = document.getElementById(`subject${row}`);
    const list = document.getElementById(`subject-list${row}`);
    const filter = input.value.toLowerCase();

    clearAllMessages();

    [...list.children].forEach(li => {
        li.style.display = li.textContent.toLowerCase().includes(filter) ? '' : 'none';
    });
}

function selectSubject(row, value) {
    document.getElementById(`subject${row}`).value = value;
    hideSubjectList(row);
    updateGradeOptions(row);
    clearAllMessages();
}

// ==================== Grade / Scaled Score Mode Logic ====================

function setGradeMode(row) {
    const gradeSelect = document.getElementById(`grade${row}`);
    const scoreInput = document.getElementById(`score${row}`);
    const subject = document.getElementById(`subject${row}`).value;

    if (!gradeSelect || !scoreInput) return;

    // Headstart & VET: grades only
    if (subject === "Headstart" || subject === "VET") {
        scoreInput.value = "";
        scoreInput.disabled = true;
    } else {
        scoreInput.disabled = false;
    }

    // Clear scaled score when switching to grade mode
    if (scoreInput.value !== "") {
        scoreInput.value = "";
    }

    gradeSelect.classList.add("active-input");
    scoreInput.classList.remove("active-input");
}

function setScoreMode(row) {
    const gradeSelect = document.getElementById(`grade${row}`);
    const scoreInput = document.getElementById(`score${row}`);
    const subject = document.getElementById(`subject${row}`).value;

    if (!gradeSelect || !scoreInput || !subject) return;

    if (subject === "Headstart") {
        alert("Headstart uses fixed scores. Please choose a grade (HD, D, C, P).");
        return;
    }

    if (subject === "VET") {
        alert("VET uses the average of your top 4 subjects. Please use the provided grade option.");
        return;
    }

    // When using scaled score, clear the grade selection
    gradeSelect.selectedIndex = 0;
    gradeSelect.classList.remove("active-input");

    scoreInput.disabled = false;
    scoreInput.classList.add("active-input");
}

// ==================== Grade Options ====================

function updateGradeOptions(row) {
    const subject = document.getElementById(`subject${row}`).value;
    const gradeSelect = document.getElementById(`grade${row}`);
    const scoreInput = document.getElementById(`score${row}`);

    gradeSelect.innerHTML = '<option value="" disabled selected>Select a grade</option>';
    let grades = [];

    if (subject === "Headstart") grades = headstartGrades;
    else if (subject === "VET") grades = vetGrades;
    else if (subject && subjectOptions.includes(subject)) grades = standardGrades;

    gradeSelect.disabled = grades.length === 0;

    grades.forEach(grade => {
        const option = document.createElement("option");
        option.value = grade;
        option.textContent = grade;
        gradeSelect.appendChild(option);
    });

    // Headstart & VET: grades only
    if (subject === "Headstart" || subject === "VET") {
        scoreInput.value = "";
        scoreInput.disabled = true;
    } else {
        scoreInput.disabled = false;
    }

    // Default to grade mode whenever subject changes
    setGradeMode(row);
}

// ==================== ATAR Calculation Logic ====================

let hasCalculated = false;
let lastRawResult = null;
let lastAdjustedResult = null;

async function recalculateATAR() {
    const form = document.getElementById("atar-form");
    const formData = new FormData(form);
    const isAdjusted = document.getElementById("check-5").checked;
    formData.append("adjusted", isAdjusted ? "true" : "false");

    const response = await fetch("/calculate", { method: "POST", body: formData });
    const result = await response.json();
    const resultDiv = document.getElementById("result");

    if (result.error) {
        resultDiv.textContent = result.error;
        lastRawResult = null;
        lastAdjustedResult = null;
    } else {
        lastRawResult = result.atar_raw;
        lastAdjustedResult = result.atar_adjusted;
        resultDiv.textContent = isAdjusted
            ? `Your adjusted ATAR is: ${lastAdjustedResult}`
            : `Your raw ATAR is: ${lastRawResult}`;
    }
}

document.getElementById("atar-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    await recalculateATAR();
    hasCalculated = true;
});

function autoRecalculateIfCalculated() {
    if (hasCalculated) recalculateATAR();
}

function clearAllMessages() {
    const resultDiv = document.getElementById("result");
    resultDiv.textContent = "";
}

// Attach listeners for clearing messages and switching modes
for (let i = 1; i <= 5; i++) {
    const subjectInput = document.getElementById(`subject${i}`);
    const gradeSelect = document.getElementById(`grade${i}`);
    const scoreInput = document.getElementById(`score${i}`);

    subjectInput.addEventListener('input', clearAllMessages);
    subjectInput.addEventListener('focus', clearAllMessages);

    gradeSelect.addEventListener('change', () => {
        clearAllMessages();
        setGradeMode(i);
        autoRecalculateIfCalculated();
    });

    scoreInput.addEventListener('input', () => {
        clearAllMessages();
        setScoreMode(i);
        autoRecalculateIfCalculated();
    });

    // Click/focus to switch mode
    gradeSelect.addEventListener('focus', () => setGradeMode(i));
    gradeSelect.addEventListener('click', () => setGradeMode(i));

    scoreInput.addEventListener('focus', () => setScoreMode(i));
    scoreInput.addEventListener('click', () => setScoreMode(i));

    // Initial state: highlight grade side
    setGradeMode(i);
}

// Raw / Adjusted display toggle
document.getElementById("check-5").addEventListener("change", function() {
    const resultDiv = document.getElementById("result");
    if (lastRawResult !== null && lastAdjustedResult !== null) {
        resultDiv.textContent = this.checked
            ? `Your adjusted ATAR is: ${lastAdjustedResult}`
            : `Your raw ATAR is: ${lastRawResult}`;
    }
});
