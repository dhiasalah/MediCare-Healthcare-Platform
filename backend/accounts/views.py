from rest_framework import status, generics, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import login
from django.db.models import Count, Q
from .models import User
from .serializers import UserSerializer, LoginSerializer, RegisterSerializer, ProfileSerializer

@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    """Login endpoint that returns JWT tokens"""
    serializer = LoginSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.validated_data['user']
        
        # Generate JWT tokens
        refresh = RefreshToken.for_user(user)
        access_token = str(refresh.access_token)
        refresh_token = str(refresh)
        
        # Check if user needs to set password
        user_data = UserSerializer(user).data
        user_data['password_needs_reset'] = user.password_needs_reset
        
        return Response({
            'message': 'Connexion réussie',
            'user': user_data,
            'tokens': {
                'access': access_token,
                'refresh': refresh_token,
            }
        }, status=status.HTTP_200_OK)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([AllowAny])
def register_view(request):
    """Registration endpoint"""
    serializer = RegisterSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        
        # Generate JWT tokens
        refresh = RefreshToken.for_user(user)
        access_token = str(refresh.access_token)
        refresh_token = str(refresh)
        
        return Response({
            'message': 'Inscription réussie',
            'user': UserSerializer(user).data,
            'tokens': {
                'access': access_token,
                'refresh': refresh_token,
            }
        }, status=status.HTTP_201_CREATED)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
def logout_view(request):
    """Logout endpoint"""
    try:
        refresh_token = request.data.get('refresh_token')
        
        if not refresh_token:
            return Response(
                {'error': 'Refresh token is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Try to blacklist the token
        token = RefreshToken(refresh_token)
        token.blacklist()
        
        return Response({'message': 'Déconnexion réussie'}, status=status.HTTP_200_OK)
    except AttributeError as e:
        # Blacklist not available - this is OK, just return success
        print(f"Token blacklist not available: {e}")
        return Response({'message': 'Déconnexion réussie'}, status=status.HTTP_200_OK)
    except Exception as e:
        print(f"Logout error: {str(e)}")
        return Response(
            {'error': f'Erreur lors de la déconnexion: {str(e)}'}, 
            status=status.HTTP_400_BAD_REQUEST
        )

@api_view(['GET'])
def profile_view(request):
    """Get current user profile"""
    serializer = UserSerializer(request.user)
    return Response(serializer.data)

@api_view(['PUT', 'PATCH'])
def update_profile_view(request):
    """Update current user profile"""
    serializer = ProfileSerializer(request.user, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response({
            'message': 'Profil mis à jour avec succès',
            'user': serializer.data
        })
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class DoctorListView(generics.ListAPIView):
    """List all doctors"""
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return User.objects.filter(user_type='doctor', is_active=True)

@api_view(['GET'])
@permission_classes([AllowAny])
def available_doctors_view(request):
    """Get list of doctors who can accept new patients (max 4 patients per doctor)"""
    
    # Get all active doctors with their patient count
    doctors = User.objects.filter(
        user_type='doctor', 
        is_active=True
    ).annotate(
        patient_count=Count('patients', filter=Q(patients__is_active=True))
    ).filter(
        patient_count__lt=4  # Only doctors with less than 4 patients
    ).order_by('patient_count', 'first_name')
    
    # Serialize with patient count
    doctors_data = []
    for doctor in doctors:
        doctor_data = UserSerializer(doctor).data
        doctor_data['patient_count'] = doctor.patient_count
        doctor_data['available_slots'] = 4 - doctor.patient_count
        doctors_data.append(doctor_data)
    
    return Response(doctors_data)

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def set_initial_password(request):
    """
    Allow users who were created by a doctor to set their password for the first time
    """
    user = request.user
    
    # Check if user needs password reset
    if not user.password_needs_reset:
        return Response(
            {'error': 'Votre mot de passe a déjà été défini'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    password = request.data.get('password')
    password_confirm = request.data.get('password_confirm')
    
    if not password or not password_confirm:
        return Response(
            {'error': 'Le mot de passe et sa confirmation sont requis'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    if password != password_confirm:
        return Response(
            {'error': 'Les mots de passe ne correspondent pas'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    if len(password) < 8:
        return Response(
            {'error': 'Le mot de passe doit contenir au moins 8 caractères'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Set the new password
    user.set_password(password)
    user.password_needs_reset = False
    user.save()
    
    return Response({
        'message': 'Mot de passe défini avec succès',
        'user': UserSerializer(user).data
    }, status=status.HTTP_200_OK)

@api_view(['POST'])
@permission_classes([AllowAny])
def check_email_exists(request):
    """
    Check if email exists and if password needs to be set
    """
    email = request.data.get('email')
    
    if not email:
        return Response(
            {'error': 'Email requis'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        user = User.objects.get(email=email, is_active=True)
        return Response({
            'exists': True,
            'password_needs_reset': user.password_needs_reset,
            'user_type': user.user_type
        })
    except User.DoesNotExist:
        return Response({
            'exists': False,
            'password_needs_reset': False
        })

@api_view(['POST'])
@permission_classes([AllowAny])
def set_password_first_time(request):
    """
    Allow users to set their password for the first time using only their email
    This is for patients created by doctors who don't have a password yet
    """
    email = request.data.get('email')
    password = request.data.get('password')
    password_confirm = request.data.get('password_confirm')
    
    if not email:
        return Response(
            {'error': 'Email requis'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    if not password or not password_confirm:
        return Response(
            {'error': 'Le mot de passe et sa confirmation sont requis'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    if password != password_confirm:
        return Response(
            {'error': 'Les mots de passe ne correspondent pas'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    if len(password) < 8:
        return Response(
            {'error': 'Le mot de passe doit contenir au moins 8 caractères'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        user = User.objects.get(email=email, is_active=True)
        
        # Check if user actually needs password reset
        if not user.password_needs_reset:
            return Response(
                {'error': 'Votre mot de passe a déjà été défini. Veuillez vous connecter normalement.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Set the new password
        user.set_password(password)
        user.password_needs_reset = False
        user.save()
        
        return Response({
            'message': 'Mot de passe défini avec succès. Vous pouvez maintenant vous connecter.',
            'user': UserSerializer(user).data
        }, status=status.HTTP_200_OK)
        
    except User.DoesNotExist:
        return Response(
            {'error': 'Aucun compte trouvé avec cet email'},
            status=status.HTTP_404_NOT_FOUND
        )