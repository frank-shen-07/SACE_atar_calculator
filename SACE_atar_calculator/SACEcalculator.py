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

        # Check for duplicate subjects
        if len(subjects) != len(set(subjects)):
            return jsonify({"error": "Duplicate subjects detected. Each subject must be unique."})

        for i in range(1, 6):
            grade_input = request.form.get(f"grade{i}")
            score_input = request.form.get(f"score{i}")
            subject = subjects[i - 1]

            if score_input and not grade_input:
                try:
                    scores.append(float(score_input))  # Ensure score_input is a float
                except ValueError:
                    return jsonify({"error": f"Invalid scaled score for Subject {i}. Must be a number."})
            elif grade_input and not score_input:
                if subject == "Headstart":  # Special handling for Headstart
                    if grade_input in headstart_scores:
                        scores.append(headstart_scores[grade_input])  # Map Headstart grades to scores
                    else:
                        return jsonify({"error": f"Invalid grade {grade_input} for Headstart, please select HD, D, C, P"})
                elif subject == "VET":  # Special handling for VET
                    if grade_input == vet_identifier:
                        vet_score = np.mean(sorted(scores[:4], reverse=True)[:4]) / 2
                        scores.append(vet_score)
                    else:
                        return jsonify({"error": "Invalid selection for VET."})
                elif (subject, grade_input) in grade_to_score:
                    scores.append(float(grade_to_score[(subject, grade_input)]))  # Map grades to scores for other subjects
                else:
                    return jsonify({"error": f"Invalid grade {grade_input} for {subject}."})
            else:
                return jsonify({"error": "Please select either a grade or a scaled score for each subject."})

        # Halve the fifth subject if it's not a half-year subject
        fifth_index = 4
        try:
            if subjects[fifth_index] not in half_year_subjects:
                scores[fifth_index] = float(scores[fifth_index]) / 2  # Ensure numeric division
        except ValueError:
            return jsonify({"error": f"Invalid score for Subject {subjects[fifth_index]}."})

        # Aggregate calculation
        top4_scores = sorted(scores[:4], reverse=True)[:4]
        aggregate = sum(top4_scores) + scores[fifth_index]

        # Match ATAR
        closest_atar = data.loc[(data["Aggregate"] - aggregate).abs().idxmin(), "ATAR"]

        return jsonify({"aggregate": round(aggregate, 2), "atar": round(closest_atar, 2)})

    except Exception as e:
        return jsonify({"error": str(e)})

if __name__ == "__main__":
    app.run(debug=True)
