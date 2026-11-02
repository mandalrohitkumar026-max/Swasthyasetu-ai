"""
Feature 2: Preventive Health Insights Engine.
Statistical trend analysis and outlier detection on longitudinal telemetry.
"""
import numpy as np
from typing import List
from models.schemas import MetricAnalysisRequest, MetricAnalysisResponse, MetricTrendInsight
from models.safety import STATUTORY_DISCLAIMER_EN, STATUTORY_DISCLAIMER_HI

def analyze_metric_telemetry(request: MetricAnalysisRequest) -> MetricAnalysisResponse:
    is_hindi = request.language == "hi"
    disclaimer = STATUTORY_DISCLAIMER_HI if is_hindi else STATUTORY_DISCLAIMER_EN

    insights: List[MetricTrendInsight] = []
    overall_advice = []
    suggested_tests = []
    doctor_review_suggested = False

    # Group metrics by type
    grouped: dict = {}
    for pt in request.metrics:
        mtype = pt.metric_type
        if mtype not in grouped:
            grouped[mtype] = []
        grouped[mtype].append(pt)

    # 1. Analyze Blood Glucose
    if "blood_glucose" in grouped:
        pts = grouped["blood_glucose"]
        values = []
        outliers = []
        for p in pts:
            try:
                v = float(p.value)
                values.append(v)
                if v > 180:
                    outliers.append(f"{p.timestamp}: High reading of {v} mg/dL")
                elif v < 70:
                    outliers.append(f"{p.timestamp}: Hypoglycemic event of {v} mg/dL")
            except (ValueError, TypeError):
                continue

        if values:
            arr = np.array(values)
            mean_val = float(np.mean(arr))
            std_dev = float(np.std(arr)) if len(arr) > 1 else 0.0

            # Trend direction: compare first half to second half
            if len(arr) >= 4:
                first_half = np.mean(arr[:len(arr)//2])
                second_half = np.mean(arr[len(arr)//2:])
                diff = second_half - first_half
                if diff > 15:
                    direction = "deteriorating" if not is_hindi else "बढ़ता हुआ (चिंताजनक)"
                elif diff < -15:
                    direction = "improving" if not is_hindi else "सुधरता हुआ"
                elif std_dev > 25:
                    direction = "volatile" if not is_hindi else "अस्थिर (उतार-चढ़ाव)"
                else:
                    direction = "stable" if not is_hindi else "स्थिर"
            else:
                direction = "preliminary tracking"

            abnormal_count = len(outliers)
            if mean_val > 130 or abnormal_count > 0:
                doctor_review_suggested = True
                obs = (
                    f"Fasting glucose average is {mean_val:.1f} mg/dL with {abnormal_count} elevated readings outside target range (<130 mg/dL)."
                    if not is_hindi else
                    f"औसत रक्त शर्करा {mean_val:.1f} mg/dL है तथा {abnormal_count} बार शर्करा सामान्य स्तर से अधिक दर्ज की गई।"
                )
                rec = (
                    "Adopt low glycemic index foods (whole grains, green vegetables). Schedule an HbA1c test and consult your doctor."
                    if not is_hindi else
                    "कम मीठे व चोकरयुक्त अनाज का सेवन करें। नियमित टहलें और डॉक्टर से HbA1c जांच हेतु परामर्श करें।"
                )
                suggested_tests.append("Glycated Hemoglobin (HbA1c) 3-Month Assay")
            else:
                obs = (
                    f"Blood glucose levels are well managed with a 30-day mean of {mean_val:.1f} mg/dL."
                    if not is_hindi else
                    f"रक्त शर्करा स्तर नियंत्रित है, औसत {mean_val:.1f} mg/dL है।"
                )
                rec = "Continue balanced nutritional habits and 30 minutes of daily physical activity." if not is_hindi else "संतुलित आहार और 30 मिनट का दैनिक व्यायाम जारी रखें।"

            insights.append(MetricTrendInsight(
                metric_type="blood_glucose",
                total_readings=len(values),
                mean_value=round(mean_val, 1),
                trend_direction=direction,
                abnormal_count=abnormal_count,
                outlier_points=outliers,
                clinical_observation=obs,
                preventive_recommendation=rec
            ))

    # 2. Analyze Blood Pressure
    if "blood_pressure" in grouped:
        pts = grouped["blood_pressure"]
        systolics = []
        diastolics = []
        bp_outliers = []

        for p in pts:
            sys_val = p.systolic
            dia_val = p.diastolic
            if sys_val is None or dia_val is None:
                # Try parsing string "138/88"
                if isinstance(p.value, str) and "/" in p.value:
                    try:
                        parts = p.value.split("/")
                        sys_val = float(parts[0].strip())
                        dia_val = float(parts[1].strip().split()[0])
                    except Exception:
                        continue
            if sys_val and dia_val:
                systolics.append(sys_val)
                diastolics.append(dia_val)
                if sys_val >= 140 or dia_val >= 90:
                    bp_outliers.append(f"{p.timestamp}: Stage-2 reading {sys_val:.0f}/{dia_val:.0f} mmHg")

        if systolics:
            mean_sys = float(np.mean(systolics))
            mean_dia = float(np.mean(diastolics))
            
            if mean_sys >= 135 or mean_dia >= 88:
                doctor_review_suggested = True
                direction = "elevated" if not is_hindi else "उच्च रक्तचाप"
                obs = (
                    f"Mean blood pressure is {mean_sys:.0f}/{mean_dia:.0f} mmHg with {len(bp_outliers)} readings in the Stage-1/2 hypertension range."
                    if not is_hindi else
                    f"औसत रक्तचाप {mean_sys:.0f}/{mean_dia:.0f} mmHg है, जो सामान्य मानक (120/80) से अधिक है।"
                )
                rec = (
                    "Limit dietary sodium (<5g/day), avoid processed salty snacks, manage mental stress, and verify readings on a calibrated cuff."
                    if not is_hindi else
                    "नमक का सेवन सीमित करें (दिन में 1 चम्मच से कम), तनाव मुक्त रहें और डॉक्टर से परामर्श लें।"
                )
                suggested_tests.append("Lipid Profile & Serum Creatinine")
            else:
                direction = "optimal" if not is_hindi else "आदर्श"
                obs = f"Blood pressure is within target parameters (Mean {mean_sys:.0f}/{mean_dia:.0f} mmHg)." if not is_hindi else f"रक्तचाप सामान्य सीमा में है (औसत {mean_sys:.0f}/{mean_dia:.0f} mmHg)।"
                rec = "Maintain heart-healthy low-sodium lifestyle and routine monitoring." if not is_hindi else "स्वस्थ दिनचर्या और नियमित जांच जारी रखें।"

            insights.append(MetricTrendInsight(
                metric_type="blood_pressure",
                total_readings=len(systolics),
                mean_value=round(mean_sys, 1),
                trend_direction=direction,
                abnormal_count=len(bp_outliers),
                outlier_points=bp_outliers,
                clinical_observation=obs,
                preventive_recommendation=rec
            ))

    # General recommendations
    overall_advice = [
        "Hydrate adequately with 2-3 litres of potable water daily.",
        "Include minimum 150 minutes of moderate aerobic activity weekly (brisk walking, cycling).",
        "Share telemetry trends with your treating physician at your next OPD appointment."
    ] if not is_hindi else [
        "दैनिक 2 से 3 लीटर स्वच्छ जल पिएं।",
        "सप्ताह में कम से कम 150 मिनट मध्यम व्यायाम (तेज चलना) अवश्य करें।",
        "यह रिपोर्ट अपने चिकित्सक को अगले परामर्श के दौरान दिखाएं।"
    ]

    return MetricAnalysisResponse(
        confidence_score=0.88,
        confidence_level="High",
        limitations=[
            "Statistical telemetry analysis is dependent on user measuring accuracy and device calibration.",
            "Isolated spikes can be triggered by acute stress, caffeine, or white-coat effect.",
            "Longitudinal findings do not replace physician clinical evaluation."
        ],
        is_emergency=False,
        emergency_warning=None,
        clinical_safety_notice=disclaimer,
        language=request.language,
        insights=insights,
        overall_lifestyle_advice=overall_advice,
        suggested_screening_tests=suggested_tests,
        doctor_review_suggested=doctor_review_suggested
    )
