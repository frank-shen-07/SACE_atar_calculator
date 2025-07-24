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

// Subject selection logic
for (let i = 1; i <= 5; i++) {
    createSubjectCombo(i);
}

function createSubjectCombo(row) {
    const input = document.getElementById(`subject${row}`);
    const list = document.getElementById(`subject-list${row}`);

    // Populate subject list
    list.innerHTML = '';
    subjectOptions.forEach(opt => {
        const li = document.createElement('li');
        li.textContent = opt;
        li.onclick = () => selectSubject(row, opt);
        list.appendChild(li);
    });

    // Show, hide, or filter events
    input.addEventListener("focus", () => showSubjectList(row));
    input.addEventListener("input", () => filterSubjectList(row));
    input.addEventListener("click", () => showSubjectList(row));
    input.addEventListener("blur", () => setTimeout(() => hideSubjectList(row), 120)); // allow click
}

function showSubjectList(row) {
    const input = document.getElementById(`subject${row}`);
    const list = document.getElementById(`subject-list${row}`);

    // If list is not already in body, append it to body
    if (list.parentNode !== document.body) {
        document.body.appendChild(list);
    }

    const rect = input.getBoundingClientRect();
    list.style.position = 'fixed';
    list.style.display = 'block';
    list.style.left = (rect.left - 1) + 'px';
    list.style.top = (rect.bottom) + 'px';
    list.style.width = (rect.width + 2) + 'px';
    list.style.zIndex = 9999;
}

function hideSubjectList(row) {
    const list = document.getElementById(`subject-list${row}`);
    list.style.display = 'none';
}


// Hide all dropdowns on scroll or resize (avoid floating lists in the wrong place)
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
    [...list.children].forEach(li => {
        if (li.textContent.toLowerCase().includes(filter)) {
            li.style.display = '';
        } else {
            li.style.display = 'none';
        }
    });
}

function selectSubject(row, value) {
    const input = document.getElementById(`subject${row}`);
    input.value = value;
    hideSubjectList(row);
    updateGradeOptions(row); // updates grade dropdown once user has selected a valid subject
}

// Grade selection logic
function updateGradeOptions(row) {
    const subject = document.getElementById(`subject${row}`).value;
    const gradeSelect = document.getElementById(`grade${row}`);
    gradeSelect.innerHTML = '<option value="" disabled selected>Select a grade</option>';

    let grades = [];
    if (subject === "Headstart") {
        grades = headstartGrades;
        gradeSelect.disabled = false;
    } else if (subject === "VET") {
        grades = vetGrades;
        gradeSelect.disabled = false;
    } else if (subject && subjectOptions.includes(subject)) {
        grades = standardGrades;
        gradeSelect.disabled = false;
    } else {
        gradeSelect.disabled = true;
    }

    grades.forEach(grade => {
        const option = document.createElement("option");
        option.value = grade;
        option.textContent = grade;
        gradeSelect.appendChild(option);
    });
}

// Toggle Scaled Score/Grade selection
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

// Calculate button and also toggle button logic
document.getElementById("atar-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);

    // Add the adjusted atar logic (doesn't matter now, but you can keep it)
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
});

//toggle atar score when toggle button is clicked
document.getElementById("check-5").addEventListener("change", function() {
    const resultDiv = document.getElementById("result");
    if (lastRawResult !== null && lastAdjustedResult !== null) {
        if (this.checked) {
            resultDiv.textContent = `Your adjusted ATAR is: ${lastAdjustedResult}`;
        } else {
            resultDiv.textContent = `Your raw ATAR is: ${lastRawResult}`;
        }
    }
});

