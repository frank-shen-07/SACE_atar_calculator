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

    // Clear all messages as soon as filtering begins
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


// ==================== Grade/Toggle Logic ====================

function updateGradeOptions(row) {
    const subject = document.getElementById(`subject${row}`).value;
    const gradeSelect = document.getElementById(`grade${row}`);

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
}

function toggleInput(row) {
    const gradeSelect = document.getElementById(`grade${row}`);
    const scoreInput = document.getElementById(`score${row}`);
    const subject = document.getElementById(`subject${row}`).value;

    if (subject === "Headstart") {
        alert("Toggle disabled for Headstart. Use predefined grades: HD, D, C, P.");
        return;
    }
    if (subject === "VET") {
        alert("Toggle disabled for VET. Use predefined grade: Average of top 4 subjects.");
        return;
    }

    if (gradeSelect.disabled) {
        gradeSelect.disabled = false;
        scoreInput.disabled = true;
        scoreInput.value = "";
    } else {
        gradeSelect.disabled = true;
        scoreInput.disabled = false;
        gradeSelect.selectedIndex = 0;
    }
}


// ==================== ATAR Calculation Logic ====================

let hasCalculated = false;
let lastRawResult = null;
let lastAdjustedResult = null;

// Main calculation function (used for both manual and auto updates)
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


// Submit handler: only runs on first calculation
document.getElementById("atar-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    await recalculateATAR();
    hasCalculated = true;
});


// Auto-update ATAR on edits **after first calculation**
function autoRecalculateIfCalculated() {
    if (hasCalculated) recalculateATAR();
}

//Clear message when user is changing a subject
function clearAllMessages() {
    // This will clear the result message regardless of whether it's an error or normal output
    const resultDiv = document.getElementById("result");
    resultDiv.textContent = "";
}

for (let i = 1; i <= 5; i++) {
    // Clear on any subject input (dropdown or typing)
    document.getElementById(`subject${i}`).addEventListener('input', clearAllMessages);
    document.getElementById(`subject${i}`).addEventListener('focus', clearAllMessages);

    // Clear on any grade selection
    document.getElementById(`grade${i}`).addEventListener('change', clearAllMessages);

    // Clear on any score input
    document.getElementById(`score${i}`).addEventListener('input', clearAllMessages);
}


// Toggle between raw and adjusted display (uses last calculated results)
document.getElementById("check-5").addEventListener("change", function() {
    const resultDiv = document.getElementById("result");
    if (lastRawResult !== null && lastAdjustedResult !== null) {
        resultDiv.textContent = this.checked
            ? `Your adjusted ATAR is: ${lastAdjustedResult}`
            : `Your raw ATAR is: ${lastRawResult}`;
    }
});
