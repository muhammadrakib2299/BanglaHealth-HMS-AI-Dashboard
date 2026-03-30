import io
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import inch
from reportlab.platypus import (
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)

from database import get_db
from middleware.auth import get_current_user
from models.appointment import Appointment
from models.patient import Patient
from models.risk_prediction import RiskPrediction
from models.user import User
from models.vitals import Vitals
from models.xray_result import XrayResult

router = APIRouter(prefix="/api/patients", tags=["Reports"])

PRIMARY_COLOR = colors.HexColor("#1e40af")
HEADER_BG = colors.HexColor("#1e3a5f")
ROW_ALT_BG = colors.HexColor("#f0f4fa")
LIGHT_BORDER = colors.HexColor("#cbd5e1")


def _build_table(headers: list[str], rows: list[list[str]]) -> Table:
    """Build a professionally styled table."""
    data = [headers] + rows
    table = Table(data, hAlign="LEFT", repeatRows=1)
    style_commands = [
        # Header row
        ("BACKGROUND", (0, 0), (-1, 0), HEADER_BG),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, 0), 9),
        ("BOTTOMPADDING", (0, 0), (-1, 0), 8),
        ("TOPPADDING", (0, 0), (-1, 0), 8),
        # Body rows
        ("FONTNAME", (0, 1), (-1, -1), "Helvetica"),
        ("FONTSIZE", (0, 1), (-1, -1), 8),
        ("BOTTOMPADDING", (0, 1), (-1, -1), 6),
        ("TOPPADDING", (0, 1), (-1, -1), 6),
        # Grid
        ("GRID", (0, 0), (-1, -1), 0.5, LIGHT_BORDER),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
    ]
    # Alternating row colors
    for i in range(1, len(data)):
        if i % 2 == 0:
            style_commands.append(("BACKGROUND", (0, i), (-1, i), ROW_ALT_BG))
    table.setStyle(TableStyle(style_commands))
    return table


def _section_heading(text: str, styles) -> Paragraph:
    """Create a styled section heading."""
    style = ParagraphStyle(
        "SectionHeading",
        parent=styles["Heading2"],
        textColor=PRIMARY_COLOR,
        fontSize=13,
        spaceAfter=8,
        spaceBefore=4,
        borderWidth=0,
        borderPadding=0,
        borderColor=PRIMARY_COLOR,
    )
    return Paragraph(text, style)


@router.get("/{patient_id}/report")
def generate_patient_report(
    patient_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    # Fetch related data
    latest_vitals = (
        db.query(Vitals)
        .filter(Vitals.patient_id == patient_id)
        .order_by(Vitals.recorded_at.desc())
        .first()
    )

    latest_prediction = (
        db.query(RiskPrediction)
        .filter(RiskPrediction.patient_id == patient_id)
        .order_by(RiskPrediction.predicted_at.desc())
        .first()
    )

    latest_xray = (
        db.query(XrayResult)
        .filter(XrayResult.patient_id == patient_id)
        .order_by(XrayResult.uploaded_at.desc())
        .first()
    )

    appointments = (
        db.query(Appointment)
        .filter(Appointment.patient_id == patient_id)
        .order_by(Appointment.appointment_date.desc())
        .limit(20)
        .all()
    )

    # Build PDF in memory
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        topMargin=0.5 * inch,
        bottomMargin=0.5 * inch,
        leftMargin=0.6 * inch,
        rightMargin=0.6 * inch,
    )
    styles = getSampleStyleSheet()
    elements: list = []

    # --- Hospital Header ---
    header_style = ParagraphStyle(
        "HospitalHeader",
        parent=styles["Title"],
        textColor=PRIMARY_COLOR,
        fontSize=20,
        spaceAfter=2,
        alignment=1,  # center
    )
    sub_header_style = ParagraphStyle(
        "SubHeader",
        parent=styles["Normal"],
        textColor=colors.grey,
        fontSize=10,
        alignment=1,
        spaceAfter=4,
    )
    elements.append(Paragraph("BanglaHealth HMS", header_style))
    elements.append(Paragraph("Patient Report", sub_header_style))

    # Divider line via a thin table
    divider = Table([[""]], colWidths=[doc.width])
    divider.setStyle(
        TableStyle(
            [
                ("LINEBELOW", (0, 0), (-1, 0), 1.5, PRIMARY_COLOR),
                ("TOPPADDING", (0, 0), (-1, 0), 0),
                ("BOTTOMPADDING", (0, 0), (-1, 0), 0),
            ]
        )
    )
    elements.append(divider)
    elements.append(Spacer(1, 16))

    # --- Patient Information ---
    elements.append(_section_heading("Patient Information", styles))
    patient_info = [
        ["Full Name", patient.full_name],
        ["Age", str(patient.age)],
        ["Gender", patient.gender.value.capitalize()],
        ["District", patient.district],
        ["Phone", patient.phone or "N/A"],
        ["Registered", patient.created_at.strftime("%Y-%m-%d %H:%M")],
    ]
    info_table = Table(patient_info, colWidths=[1.6 * inch, 4.5 * inch], hAlign="LEFT")
    info_table.setStyle(
        TableStyle(
            [
                ("FONTNAME", (0, 0), (0, -1), "Helvetica-Bold"),
                ("FONTSIZE", (0, 0), (-1, -1), 9),
                ("TEXTCOLOR", (0, 0), (0, -1), colors.HexColor("#374151")),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
                ("TOPPADDING", (0, 0), (-1, -1), 5),
                ("LINEBELOW", (0, 0), (-1, -2), 0.25, LIGHT_BORDER),
                ("LINEBELOW", (0, -1), (-1, -1), 0.25, LIGHT_BORDER),
                ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
            ]
        )
    )
    elements.append(info_table)
    elements.append(Spacer(1, 16))

    # --- Latest Vitals ---
    elements.append(_section_heading("Latest Vitals", styles))
    if latest_vitals:
        vitals_data = [
            ["Glucose (mg/dL)", f"{latest_vitals.glucose:.1f}"],
            ["Blood Pressure (mm Hg)", f"{latest_vitals.blood_pressure:.1f}"],
            ["BMI", f"{latest_vitals.bmi:.1f}"],
            ["Insulin (mu U/ml)", f"{latest_vitals.insulin:.1f}"],
            ["Skin Thickness (mm)", f"{latest_vitals.skin_thickness:.1f}"],
            ["Pregnancies", str(latest_vitals.pregnancies)],
            ["Diabetes Pedigree", f"{latest_vitals.diabetes_pedigree:.3f}"],
            ["Recorded At", latest_vitals.recorded_at.strftime("%Y-%m-%d %H:%M")],
        ]
        elements.append(
            _build_table(["Metric", "Value"], vitals_data)
        )
    else:
        elements.append(
            Paragraph(
                "No vitals recorded.",
                ParagraphStyle("NoData", parent=styles["Normal"], textColor=colors.grey, fontSize=9),
            )
        )
    elements.append(Spacer(1, 16))

    # --- Latest Risk Prediction ---
    elements.append(_section_heading("Latest Risk Prediction", styles))
    if latest_prediction:
        risk_color = {
            "low": colors.HexColor("#16a34a"),
            "medium": colors.HexColor("#d97706"),
            "high": colors.HexColor("#dc2626"),
        }.get(latest_prediction.risk_level.value, colors.black)

        risk_style = ParagraphStyle(
            "RiskValue",
            parent=styles["Normal"],
            fontSize=9,
        )
        prediction_data = [
            [
                "Risk Level",
                Paragraph(
                    f'<font color="{risk_color.hexval()}">'
                    f"<b>{latest_prediction.risk_level.value.upper()}</b></font>",
                    risk_style,
                ),
            ],
            ["Risk Score", f"{latest_prediction.risk_score * 100:.1f}%"],
            ["Predicted At", latest_prediction.predicted_at.strftime("%Y-%m-%d %H:%M")],
        ]
        pred_table = Table(prediction_data, colWidths=[1.6 * inch, 4.5 * inch], hAlign="LEFT")
        pred_table.setStyle(
            TableStyle(
                [
                    ("FONTNAME", (0, 0), (0, -1), "Helvetica-Bold"),
                    ("FONTSIZE", (0, 0), (-1, -1), 9),
                    ("TEXTCOLOR", (0, 0), (0, -1), colors.HexColor("#374151")),
                    ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
                    ("TOPPADDING", (0, 0), (-1, -1), 5),
                    ("LINEBELOW", (0, 0), (-1, -2), 0.25, LIGHT_BORDER),
                    ("LINEBELOW", (0, -1), (-1, -1), 0.25, LIGHT_BORDER),
                    ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
                ]
            )
        )
        elements.append(pred_table)
    else:
        elements.append(
            Paragraph(
                "No risk predictions available.",
                ParagraphStyle("NoData", parent=styles["Normal"], textColor=colors.grey, fontSize=9),
            )
        )
    elements.append(Spacer(1, 16))

    # --- Latest X-Ray Result ---
    elements.append(_section_heading("Latest X-Ray Result", styles))
    if latest_xray:
        xray_data = [
            ["Pneumonia Probability", f"{latest_xray.pneumonia_probability * 100:.1f}%"],
            ["Confidence", f"{latest_xray.confidence * 100:.1f}%"],
            ["Uploaded At", latest_xray.uploaded_at.strftime("%Y-%m-%d %H:%M")],
        ]
        xray_table = Table(xray_data, colWidths=[1.6 * inch, 4.5 * inch], hAlign="LEFT")
        xray_table.setStyle(
            TableStyle(
                [
                    ("FONTNAME", (0, 0), (0, -1), "Helvetica-Bold"),
                    ("FONTSIZE", (0, 0), (-1, -1), 9),
                    ("TEXTCOLOR", (0, 0), (0, -1), colors.HexColor("#374151")),
                    ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
                    ("TOPPADDING", (0, 0), (-1, -1), 5),
                    ("LINEBELOW", (0, 0), (-1, -2), 0.25, LIGHT_BORDER),
                    ("LINEBELOW", (0, -1), (-1, -1), 0.25, LIGHT_BORDER),
                    ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
                ]
            )
        )
        elements.append(xray_table)
    else:
        elements.append(
            Paragraph(
                "No X-ray results available.",
                ParagraphStyle("NoData", parent=styles["Normal"], textColor=colors.grey, fontSize=9),
            )
        )
    elements.append(Spacer(1, 16))

    # --- Appointment History ---
    elements.append(_section_heading("Appointment History", styles))
    if appointments:
        appt_rows = []
        for appt in appointments:
            appt_rows.append(
                [
                    appt.appointment_date.strftime("%Y-%m-%d"),
                    appt.appointment_time.strftime("%H:%M"),
                    appt.status.value.capitalize(),
                    appt.notes or "-",
                ]
            )
        elements.append(
            _build_table(["Date", "Time", "Status", "Notes"], appt_rows)
        )
    else:
        elements.append(
            Paragraph(
                "No appointments found.",
                ParagraphStyle("NoData", parent=styles["Normal"], textColor=colors.grey, fontSize=9),
            )
        )
    elements.append(Spacer(1, 24))

    # --- Footer / Timestamp ---
    footer_style = ParagraphStyle(
        "Footer",
        parent=styles["Normal"],
        textColor=colors.grey,
        fontSize=8,
        alignment=1,
    )
    generated_at = datetime.utcnow().strftime("%Y-%m-%d %H:%M UTC")
    elements.append(
        Paragraph(
            f"Generated on {generated_at} by BanglaHealth HMS | "
            f"Report for patient #{patient.id}",
            footer_style,
        )
    )

    # Build PDF
    doc.build(elements)
    buffer.seek(0)

    filename = f"patient_{patient.id}_report.pdf"
    return StreamingResponse(
        buffer,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f'attachment; filename="{filename}"',
        },
    )
