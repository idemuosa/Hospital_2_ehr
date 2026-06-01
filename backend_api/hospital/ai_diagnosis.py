import re

def suggest_diagnosis(clinical_notes):
    """
    Analyzes clinical notes and suggests possible diagnoses.
    clinical_notes: string
    """
    suggestions = []
    notes = clinical_notes.lower()

    knowledge_base = [
        {"diagnosis": "Diabetes Mellitus", "keywords": ["high sugar", "polydipsia", "polyuria", "insulin", "hyperglycemia", "excessive thirst", "frequent urination"]},
        {"diagnosis": "Hypertension", "keywords": ["high bp", "headache", "dizziness", "chest pain", "elevated pressure", "blurred vision", "palpitations"]},
        {"diagnosis": "Malaria", "keywords": ["fever", "chills", "rigors", "headache", "nausea", "sweating", "muscle pain", "bitter taste"]},
        {"diagnosis": "Pneumonia", "keywords": ["cough", "shortness of breath", "chest pain", "crackles", "phlegm", "difficulty breathing", "wheezing"]},
        {"diagnosis": "Urinary Tract Infection (UTI)", "keywords": ["burning urination", "frequency", "dysuria", "lower abdominal pain", "cloudy urine", "foul smell"]},
        {"diagnosis": "Peptic Ulcer Disease", "keywords": ["gastric pain", "heartburn", "bloating", "acid reflux", "nausea", "epigastric pain"]},
        {"diagnosis": "Anemia", "keywords": ["fatigue", "paleness", "weakness", "shortness of breath", "low hemoglobin", "cold hands", "brittle nails"]},
        {"diagnosis": "Typhoid Fever", "keywords": ["prolonged fever", "constipation", "diarrhea", "abdominal pain", "rose spots", "loss of appetite"]},
    ]

    for item in knowledge_base:
        matches = [word for word in item["keywords"] if word in notes]
        if len(matches) >= 2:
            # Score based on percentage of keywords matched
            score = (len(matches) / len(item["keywords"])) * 100
            confidence = "High" if score > 50 or len(matches) >= 4 else "Moderate"

            suggestions.append({
                "diagnosis": item["diagnosis"],
                "confidence": confidence,
                "score": round(score, 2),
                "matching_indicators": matches
            })

    # Sort suggestions by score descending
    suggestions.sort(key=lambda x: x['score'], reverse=True)
    return suggestions
