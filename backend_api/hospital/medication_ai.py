def check_medication_interactions(new_medication, existing_medications):
    """
    Checks for potential interactions between a new medication and existing ones.
    Simple rule-based system for demonstration.
    """
    interactions_db = [
        {"meds": ["Warfarin", "Aspirin"], "risk": "High", "note": "Increased risk of bleeding."},
        {"meds": ["Lisinopril", "Spironolactone"], "risk": "Moderate", "note": "Risk of hyperkalemia (high potassium levels)."},
        {"meds": ["Metformin", "Contrast Dye"], "risk": "High", "note": "Risk of lactic acidosis. Hold metformin for 48 hours after contrast."},
        {"meds": ["Simvastatin", "Amlodipine"], "risk": "Low", "note": "Simvastatin dose should not exceed 20mg when taken with amlodipine."},
        {"meds": ["Sildenafil", "Nitroglycerin"], "risk": "Critical", "note": "Severe hypotension risk. Do not combine."},
    ]

    alerts = []
    new_med_lower = new_medication.lower()

    for med_record in existing_medications:
        existing_med_lower = med_record.lower()
        for rule in interactions_db:
            rule_meds_lower = [m.lower() for m in rule["meds"]]
            if new_med_lower in rule_meds_lower and existing_med_lower in rule_meds_lower:
                if new_med_lower != existing_med_lower: # Don't flag same med unless specific rule
                    alerts.append({
                        "medications": rule["meds"],
                        "risk": rule["risk"],
                        "note": rule["note"]
                    })

    return alerts
