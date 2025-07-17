const headstartGrades = ["HD", "D", "C", "P"];
        const vetGrades = ["Average of top 4 subjects"];
        const standardGrades = ["A++/Merit", "A+", "A", "A-", "B+", "B", "B-", "C+", "C", "C-", "D+", "D", "D-", "E+", "E", "E-"];

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
            } else {
                grades = standardGrades;
                gradeSelect.disabled = false;
            }

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

        $(document).ready(function () {
            $('.js-example-basic-single').select2({
                placeholder: "Search for a subject",
                allowClear: true
            });
        });

        document.getElementById("atar-form").addEventListener("submit", async (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const response = await fetch("/calculate", { method: "POST", body: formData });
            const result = await response.json();
            const resultDiv = document.getElementById("result");
            resultDiv.textContent = result.error ? result.error : `Your calculated ATAR is: ${result.atar}`;
        });