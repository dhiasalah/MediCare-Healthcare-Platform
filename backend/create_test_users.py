from accounts.models import User

# Create a test doctor
doctor_user = User.objects.create_user(
    email="doctor@test.com",
    password="test123",
    first_name="Dr. Jean",
    last_name="Dupont",
    user_type="doctor"
)
print(f"Created doctor: {doctor_user.email}")

# Create a test patient  
patient_user = User.objects.create_user(
    email="patient@test.com", 
    password="test123",
    first_name="Marie",
    last_name="Martin",
    user_type="patient"
)
print(f"Created patient: {patient_user.email}")

# Create an admin user
admin_user = User.objects.create_user(
    email="admin@test.com",
    password="admin123", 
    first_name="Admin",
    last_name="System",
    user_type="admin",
    is_staff=True,
    is_superuser=True
)
print(f"Created admin: {admin_user.email}")

print("\nTest accounts created successfully!")
print("Doctor login: doctor@test.com / test123")
print("Patient login: patient@test.com / test123") 
print("Admin login: admin@test.com / admin123")