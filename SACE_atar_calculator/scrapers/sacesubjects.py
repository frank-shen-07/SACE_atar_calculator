import re
import pandas as pd

# Open the document file to parse
file_path = '/mnt/data/SACE subjects and codes 2024.docx'

# Initialize an empty list to hold subjects
all_subjects = []

# Extract subjects using regex (ensure no duplicates)
all_subjects.extend(re.findall(r"[a-zA-Z& ,'-]+(?:\([\w\s-]+\))?"))

# Remove duplicates and sort alphabetically
unique_subjects = sorted(set(all_subjects))

# Convert to DataFrame and save as CSV
subjects_df = pd.DataFrame(unique_subjects, columns=["Subjects"])
output_path = "/mnt/data/All_Stage2_Subjects_Sorted.csv"
subjects_df.to_csv(output_path, index=False)

output_path
