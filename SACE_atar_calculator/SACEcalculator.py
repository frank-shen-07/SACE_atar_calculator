from flask import Flask, render_template, request, jsonify
import pandas as pd
import numpy as np

# Load data
data_file = "extracteddata/SACENT_aggregate_to_ATAR_2024.csv"
grade_to_score_file = "extracteddata/sace_scaled_scores_for_each_subject.csv"
data = pd.read_csv(data_file)
grade_to_score_data = pd.read_csv(grade_to_score_file)

# Transform grade-to-score data into a dictionary
grade_to_score = {}
for _, row in grade_to_score_data.iterrows():
    subject = row[grade_to_score_data.columns[0]]
    for grade in row.index[1:]:
        if pd.notna(row[grade]):
            grade_to_score[(subject.strip(), grade.strip())] = row[grade]

# Define half-year subjects, Headstart scores, and VET
half_year_subjects = ["Music Ensemble", "Music Performance", "Research Project", "AIF"]
headstart_scores = {"HD": 20, "D": 19.8, "C": 18, "P": 15.8}
vet_identifier = "Average of top 4 subjects"

# Initialize Flask app
app = Flask(__name__)

@app.route("/")
def home():
    return render_template("SACEcalculator.html")

@app.route("/calculate", methods=["POST"])
def calculate():
    
    try:
        subjects = [request.form[f"subject{i}"] for i in range(1, 6)]
        scores = []
        vet_index = None
        adjusted = request.form.get("adjusted", "false") == "true"

        # Check for duplicate subjects
        if len(subjects) != len(set(subjects)):
            return jsonify({"error": "Duplicate subjects detected. Each subject must be unique."})

        for i in range(1, 6):
            grade_input = request.form.get(f"grade{i}")
            score_input = request.form.get(f"score{i}")
            subject = subjects[i - 1]

            if subject == "VET":
                if grade_input == vet_identifier:
                    vet_index = i - 1
                    scores.append(None)  # Placeholder for VET, to be filled later
                    continue
                else:
                    return jsonify({"error": "Invalid selection for VET."})

            if score_input and not grade_input:
                try:
                    scores.append(float(score_input))
                except ValueError:
                    return jsonify({"error": f"Invalid scaled score for Subject {i}. Must be a number."})

            elif grade_input and not score_input:
                if subject == "Headstart":
                    if grade_input in headstart_scores:
                        scores.append(headstart_scores[grade_input])
                    else:
                        return jsonify({"error": f"Invalid grade {grade_input} for Headstart, please select HD, D, C, P"})
                elif (subject, grade_input) in grade_to_score:
                    scores.append(float(grade_to_score[(subject, grade_input)]))
            else:
                return jsonify({""})

        # VET special calculation
        if vet_index is not None:
            non_vet_subjects = [subjects[i] for i in range(5) if i != vet_index]
            non_vet_scores = [scores[i] for i in range(5) if i != vet_index]
            half_year_indices = [i for i, subj in enumerate(non_vet_subjects) if subj in half_year_subjects]
            if half_year_indices:
                # If there is at least one half-year subject, double it.
                vet_averages = []
                for idx in half_year_indices:
                    doubled = non_vet_scores[idx] * 2
                    fulls = [non_vet_scores[j] for j in range(4) if j != idx]
                    vet_averages.append((sum(fulls) + doubled) / 4)
                vet_score = max(vet_averages)
            else:
                # All the other subjects are full-years, just use a simple arithemetic mean
                vet_score = np.mean(non_vet_scores)
            scores[vet_index] = vet_score
            
        # Halve the fifth subject if it's not a half-year subject
        fifth_index = 4
        
        if subjects[fifth_index] not in half_year_subjects:
            scores[fifth_index] = float(scores[fifth_index]) / 2  # Ensure numeric division

        # Aggregate calculation
        top4_scores = sorted(scores[:4], reverse=True)[:4]

        # Calculate aggregate for RAW atar
        raw_aggregate = sum(top4_scores) + scores[fifth_index]
        raw_atar = data.loc[(data["Aggregate"] - raw_aggregate).abs().idxmin(), "ATAR"]

        # Calculate aggregate for ADJUSTED atar
        bonus_subjects = ["Specialist Mathematics", "Mathematical Methods", "English", "Languages", "English Literary Studies"]
        bonus = sum(1 for s in subjects if s in bonus_subjects)
        if bonus == 1:
            adjusted_aggregate = raw_aggregate + 2
        elif bonus >= 2:
            adjusted_aggregate = raw_aggregate + 4
        else:
            adjusted_aggregate = raw_aggregate

        adjusted_atar = data.loc[(data["Aggregate"] - adjusted_aggregate).abs().idxmin(), "ATAR"]

        return jsonify({
            "aggregate_raw": round(raw_aggregate, 2),
            "atar_raw": round(raw_atar, 2),
            "aggregate_adjusted": round(adjusted_aggregate, 2),
            "atar_adjusted": round(adjusted_atar, 2)
        })

    except Exception as e:
        return jsonify({"error": str(e)})

if __name__ == "__main__":
    app.run(debug=True)
