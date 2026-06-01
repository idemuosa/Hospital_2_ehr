def analyze_vitals(vitals):
    """
    Analyzes vital signs and returns alerts if they are outside normal ranges.
    """
    alerts = []

    # Blood Pressure Analysis
    if vitals.bp:
        try:
            systolic, diastolic = map(int, vitals.bp.split('/'))
            if systolic > 140 or diastolic > 90:
                alerts.append({"type": "Hypertension", "severity": "High", "note": "High Blood Pressure detected."})
            elif systolic < 90 or diastolic < 60:
                alerts.append({"type": "Hypotension", "severity": "Moderate", "note": "Low Blood Pressure detected."})
        except ValueError:
            pass # Invalid BP format

    # Pulse Analysis
    if vitals.pulse:
        if vitals.pulse > 100:
            alerts.append({"type": "Tachycardia", "severity": "Moderate", "note": "High heart rate detected."})
        elif vitals.pulse < 60:
            alerts.append({"type": "Bradycardia", "severity": "Moderate", "note": "Low heart rate detected."})

    # Temperature Analysis
    if vitals.temp:
        if vitals.temp > 38.0:
            alerts.append({"type": "Fever", "severity": "Moderate", "note": "Elevated body temperature."})
        elif vitals.temp < 35.0:
            alerts.append({"type": "Hypothermia", "severity": "High", "note": "Dangerously low body temperature."})

    # SpO2 Analysis
    if vitals.spo2:
        if vitals.spo2 < 95:
            alerts.append({"type": "Hypoxia", "severity": "High", "note": "Low oxygen saturation levels."})

    return alerts
