"""
Script to generate referral PDFs for existing specialist assignments
that don't have PDFs yet.

Run this from the Django shell:
    python manage.py shell < generate_missing_pdfs.py

Or:
    python manage.py shell
    exec(open('generate_missing_pdfs.py').read())
"""

from patients.models import PatientSpecialist
from medical_documents.models import SpecialistReferralPDF
from medical_documents.pdf_generator import generate_referral_pdf

# Get all specialist assignments without PDFs
assignments_without_pdfs = PatientSpecialist.objects.filter(
    referral_pdf__isnull=True
)

print(f"Found {assignments_without_pdfs.count()} specialist assignments without PDFs")
print("-" * 50)

generated_count = 0
failed_count = 0

for assignment in assignments_without_pdfs:
    try:
        print(f"Generating PDF for: {assignment}")
        
        # Generate PDF
        pdf_file = generate_referral_pdf(assignment)
        
        # Create patient summary
        patient = assignment.patient
        patient_summary = f"""
        Patient: {patient.full_name}
        Date de naissance: {patient.date_of_birth}
        Âge: {patient.age} ans
        Sexe: {patient.get_gender_display()}
        """
        
        # Create SpecialistReferralPDF record
        referral_pdf = SpecialistReferralPDF.objects.create(
            patient_specialist=assignment,
            pdf_file=pdf_file,
            patient_summary=patient_summary.strip(),
            referral_reason=assignment.reason or "",
            additional_notes=assignment.notes or ""
        )
        
        print(f"  ✓ PDF created: {referral_pdf.pdf_file.name}")
        generated_count += 1
        
    except Exception as e:
        print(f"  ✗ Failed: {str(e)}")
        failed_count += 1

print("-" * 50)
print(f"Summary:")
print(f"  Generated: {generated_count}")
print(f"  Failed: {failed_count}")
print(f"  Total: {assignments_without_pdfs.count()}")
