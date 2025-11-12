from reportlab.lib.pagesizes import letter, A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from io import BytesIO
from datetime import datetime
from django.core.files.base import ContentFile


def generate_referral_pdf(patient_specialist):
    """
    Generate a PDF document for specialist referral.
    
    Args:
        patient_specialist: PatientSpecialist instance
    
    Returns:
        ContentFile: PDF file content
    """
    buffer = BytesIO()
    
    # Create the PDF object using ReportLab
    doc = SimpleDocTemplate(buffer, pagesize=A4, 
                           rightMargin=72, leftMargin=72,
                           topMargin=72, bottomMargin=18)
    
    # Container for the 'Flowable' objects
    elements = []
    
    # Define styles
    styles = getSampleStyleSheet()
    
    # Custom styles
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=24,
        textColor=colors.HexColor('#1e40af'),
        spaceAfter=30,
        alignment=TA_CENTER,
        fontName='Helvetica-Bold'
    )
    
    heading_style = ParagraphStyle(
        'CustomHeading',
        parent=styles['Heading2'],
        fontSize=14,
        textColor=colors.HexColor('#1e40af'),
        spaceAfter=12,
        spaceBefore=12,
        fontName='Helvetica-Bold'
    )
    
    normal_style = ParagraphStyle(
        'CustomNormal',
        parent=styles['Normal'],
        fontSize=11,
        spaceAfter=6,
    )
    
    # Get data
    patient = patient_specialist.patient
    specialist = patient_specialist.specialist
    assigned_by = patient_specialist.assigned_by
    
    # Title
    elements.append(Paragraph("LETTRE DE RÉFÉRENCE MÉDICALE", title_style))
    elements.append(Spacer(1, 0.2*inch))
    
    # Date
    date_str = patient_specialist.assigned_at.strftime("%d/%m/%Y")
    elements.append(Paragraph(f"<b>Date:</b> {date_str}", normal_style))
    elements.append(Spacer(1, 0.3*inch))
    
    # Referring Doctor Information
    elements.append(Paragraph("MÉDECIN RÉFÉRENT", heading_style))
    if assigned_by:
        doctor_info = [
            ["Nom:", f"Dr. {assigned_by.first_name} {assigned_by.last_name}"],
            ["Spécialité:", assigned_by.get_specialization_display() if assigned_by.specialization else "Médecin Généraliste"],
            ["Email:", assigned_by.email or "N/A"],
            ["Téléphone:", assigned_by.phone or "N/A"],
        ]
        doctor_table = Table(doctor_info, colWidths=[2*inch, 4*inch])
        doctor_table.setStyle(TableStyle([
            ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
            ('FONTNAME', (1, 0), (1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 0), (-1, -1), 10),
            ('TOPPADDING', (0, 0), (-1, -1), 4),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ]))
        elements.append(doctor_table)
    elements.append(Spacer(1, 0.3*inch))
    
    # Specialist Information
    elements.append(Paragraph("MÉDECIN SPÉCIALISTE DESTINATAIRE", heading_style))
    specialist_info = [
        ["Nom:", f"Dr. {specialist.first_name} {specialist.last_name}"],
        ["Spécialité:", specialist.get_specialization_display() if specialist.specialization else "N/A"],
        ["Email:", specialist.email or "N/A"],
        ["Téléphone:", specialist.phone or "N/A"],
    ]
    specialist_table = Table(specialist_info, colWidths=[2*inch, 4*inch])
    specialist_table.setStyle(TableStyle([
        ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
        ('FONTNAME', (1, 0), (1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
    ]))
    elements.append(specialist_table)
    elements.append(Spacer(1, 0.3*inch))
    
    # Patient Information
    elements.append(Paragraph("INFORMATIONS DU PATIENT", heading_style))
    patient_info = [
        ["Nom complet:", patient.full_name],
        ["Date de naissance:", patient.date_of_birth.strftime("%d/%m/%Y")],
        ["Âge:", f"{patient.age} ans"],
        ["Sexe:", patient.get_gender_display()],
        ["Téléphone:", patient.phone or "N/A"],
        ["Email:", patient.email or "N/A"],
        ["Adresse:", patient.address or "N/A"],
    ]
    
    if patient.blood_type:
        patient_info.append(["Groupe sanguin:", patient.blood_type])
    
    patient_table = Table(patient_info, colWidths=[2*inch, 4*inch])
    patient_table.setStyle(TableStyle([
        ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
        ('FONTNAME', (1, 0), (1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
    ]))
    elements.append(patient_table)
    elements.append(Spacer(1, 0.3*inch))
    
    # Medical History
    if patient.medical_history or patient.allergies or patient.current_medications:
        elements.append(Paragraph("ANTÉCÉDENTS MÉDICAUX", heading_style))
        
        if patient.medical_history:
            elements.append(Paragraph("<b>Antécédents:</b>", normal_style))
            elements.append(Paragraph(patient.medical_history, normal_style))
            elements.append(Spacer(1, 0.1*inch))
        
        if patient.allergies:
            elements.append(Paragraph("<b>Allergies:</b>", normal_style))
            elements.append(Paragraph(patient.allergies, normal_style))
            elements.append(Spacer(1, 0.1*inch))
        
        if patient.current_medications:
            elements.append(Paragraph("<b>Médicaments actuels:</b>", normal_style))
            elements.append(Paragraph(patient.current_medications, normal_style))
            elements.append(Spacer(1, 0.1*inch))
        
        elements.append(Spacer(1, 0.2*inch))
    
    # Referral Reason
    elements.append(Paragraph("MOTIF DE LA RÉFÉRENCE", heading_style))
    if patient_specialist.reason:
        elements.append(Paragraph(patient_specialist.reason, normal_style))
    else:
        elements.append(Paragraph("Non spécifié", normal_style))
    elements.append(Spacer(1, 0.2*inch))
    
    # Additional Notes
    if patient_specialist.notes:
        elements.append(Paragraph("NOTES ADDITIONNELLES", heading_style))
        elements.append(Paragraph(patient_specialist.notes, normal_style))
        elements.append(Spacer(1, 0.2*inch))
    
    # Emergency Contact
    if patient.emergency_contact_name:
        elements.append(Paragraph("CONTACT D'URGENCE", heading_style))
        emergency_info = [
            ["Nom:", patient.emergency_contact_name],
            ["Téléphone:", patient.emergency_contact_phone or "N/A"],
            ["Relation:", patient.emergency_contact_relation or "N/A"],
        ]
        emergency_table = Table(emergency_info, colWidths=[2*inch, 4*inch])
        emergency_table.setStyle(TableStyle([
            ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
            ('FONTNAME', (1, 0), (1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 0), (-1, -1), 10),
            ('TOPPADDING', (0, 0), (-1, -1), 4),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ]))
        elements.append(emergency_table)
    
    # Footer
    elements.append(Spacer(1, 0.5*inch))
    footer_text = "Ce document est confidentiel et destiné uniquement au professionnel de santé mentionné ci-dessus."
    elements.append(Paragraph(footer_text, ParagraphStyle('Footer', 
                                                          parent=styles['Normal'],
                                                          fontSize=9,
                                                          textColor=colors.grey,
                                                          alignment=TA_CENTER)))
    
    # Build PDF
    doc.build(elements)
    
    # Get the value of the BytesIO buffer and create ContentFile
    pdf_content = buffer.getvalue()
    buffer.close()
    
    filename = f"referral_{patient.id}_{specialist.id}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf"
    return ContentFile(pdf_content, name=filename)
