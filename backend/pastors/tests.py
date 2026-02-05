from django.test import TestCase
from django.contrib.auth.models import User
from rest_framework.test import APIClient
from rest_framework import status
from datetime import date, timedelta
from .models import Pastor


class PastorViewSetTestCase(TestCase):
    """Test suite for Pastor API endpoints"""
    
    def setUp(self):
        """Set up test client and create test user and data"""
        self.client = APIClient()
        
        # Create test user for authentication
        self.user = User.objects.create_user(
            username='testuser',
            password='testpass123'
        )
        
        # Create test pastors
        self.pastor1 = Pastor.objects.create(
            full_name='John Doe',
            gender='Male',
            pastor_rank='Bishop',
            national_id='12345678',
            date_of_birth=date(1970, 1, 1),
            phone_number='+254712345678',
            start_of_service=date(2000, 1, 1),
            status='active'
        )
        
        self.pastor2 = Pastor.objects.create(
            full_name='Jane Smith',
            gender='Female',
            pastor_rank='Reverend',
            national_id='87654321',
            date_of_birth=date(1980, 6, 15),
            phone_number='+254787654321',
            start_of_service=date(2010, 1, 1),
            status='retired'
        )
        
        self.pastor3 = Pastor.objects.create(
            full_name='Bob Johnson',
            gender='Male',
            pastor_rank='Pastor',
            national_id='11223344',
            date_of_birth=date(1985, 3, 20),
            phone_number='+254711223344',
            start_of_service=date(2015, 1, 1),
            status='active'
        )
    
    def test_authentication_required(self):
        """Test that authentication is required for all endpoints"""
        # DRF with IsAuthenticated returns 403 Forbidden for unauthenticated requests
        # when the user is recognized as unauthenticated (AnonymousUser)
        response = self.client.get('/api/pastors/')
        self.assertIn(response.status_code, [status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN])
        
        response = self.client.post('/api/pastors/', {})
        self.assertIn(response.status_code, [status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN])
    
    def test_list_pastors(self):
        """Test listing all pastors"""
        self.client.force_authenticate(user=self.user)
        response = self.client.get('/api/pastors/')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 3)
    
    def test_filter_by_pastor_rank(self):
        """Test filtering pastors by rank using DjangoFilterBackend"""
        self.client.force_authenticate(user=self.user)
        response = self.client.get('/api/pastors/?pastor_rank=Bishop')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['pastor_rank'], 'Bishop')
    
    def test_filter_by_status(self):
        """Test filtering pastors by status using DjangoFilterBackend"""
        self.client.force_authenticate(user=self.user)
        response = self.client.get('/api/pastors/?status=active')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)
        for pastor in response.data:
            self.assertEqual(pastor['status'], 'active')
    
    def test_filter_by_gender(self):
        """Test filtering pastors by gender using DjangoFilterBackend"""
        self.client.force_authenticate(user=self.user)
        response = self.client.get('/api/pastors/?gender=Male')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)
        for pastor in response.data:
            self.assertEqual(pastor['gender'], 'Male')
    
    def test_combined_filters(self):
        """Test combining multiple filters"""
        self.client.force_authenticate(user=self.user)
        response = self.client.get('/api/pastors/?status=active&gender=Male')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)
        for pastor in response.data:
            self.assertEqual(pastor['status'], 'active')
            self.assertEqual(pastor['gender'], 'Male')
    
    def test_search_functionality(self):
        """Test search functionality"""
        self.client.force_authenticate(user=self.user)
        response = self.client.get('/api/pastors/?search=John')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreater(len(response.data), 0)
    
    def test_ordering(self):
        """Test ordering functionality"""
        self.client.force_authenticate(user=self.user)
        response = self.client.get('/api/pastors/?ordering=full_name')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        names = [p['full_name'] for p in response.data]
        self.assertEqual(names, sorted(names))
    
    def test_statistics_endpoint(self):
        """Test statistics custom action"""
        self.client.force_authenticate(user=self.user)
        response = self.client.get('/api/pastors/statistics/')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('total_pastors', response.data)
        self.assertIn('active_pastors', response.data)
        self.assertIn('retired_pastors', response.data)
        self.assertEqual(response.data['total_pastors'], 3)
        self.assertEqual(response.data['active_pastors'], 2)
        self.assertEqual(response.data['retired_pastors'], 1)
    
    def test_summary_endpoint_with_valid_data(self):
        """Test summary action with valid date_of_birth"""
        self.client.force_authenticate(user=self.user)
        response = self.client.get(f'/api/pastors/{self.pastor1.id}/summary/')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('age', response.data)
        self.assertIn('years_of_service', response.data)
        self.assertIsNotNone(response.data['age'])
        self.assertIsNotNone(response.data['years_of_service'])
    
    def test_bulk_create_success(self):
        """Test bulk create with valid data"""
        self.client.force_authenticate(user=self.user)
        
        pastors_data = {
            'pastors': [
                {
                    'full_name': 'Test Pastor 1',
                    'gender': 'Male',
                    'pastor_rank': 'Pastor',
                    'date_of_birth': '1990-01-01',
                    'phone_number': '+254711111111',
                    'status': 'active'
                },
                {
                    'full_name': 'Test Pastor 2',
                    'gender': 'Female',
                    'pastor_rank': 'Reverend',
                    'date_of_birth': '1992-05-15',
                    'phone_number': '+254722222222',
                    'status': 'active'
                }
            ]
        }
        
        response = self.client.post('/api/pastors/bulk_create/', pastors_data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(len(response.data), 2)
        self.assertEqual(Pastor.objects.count(), 5)  # 3 initial + 2 new
    
    def test_bulk_create_rate_limit(self):
        """Test bulk create rate limiting (max 1000)"""
        self.client.force_authenticate(user=self.user)
        
        # Create a list with more than 1000 items
        pastors_data = {
            'pastors': [
                {
                    'full_name': f'Test Pastor {i}',
                    'gender': 'Male',
                    'pastor_rank': 'Pastor',
                    'date_of_birth': '1990-01-01',
                    'phone_number': f'+2547{i:08d}',
                    'status': 'active'
                }
                for i in range(1001)
            ]
        }
        
        response = self.client.post('/api/pastors/bulk_create/', pastors_data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('error', response.data)
        self.assertIn('Maximum 1000', response.data['error'])
    
    def test_bulk_create_empty_list(self):
        """Test bulk create with empty list"""
        self.client.force_authenticate(user=self.user)
        
        response = self.client.post('/api/pastors/bulk_create/', {'pastors': []}, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
    
    def test_bulk_create_transaction_rollback(self):
        """Test that bulk create rolls back on validation error"""
        self.client.force_authenticate(user=self.user)
        
        initial_count = Pastor.objects.count()
        
        # Include one invalid pastor (missing required field)
        pastors_data = {
            'pastors': [
                {
                    'full_name': 'Valid Pastor',
                    'gender': 'Male',
                    'pastor_rank': 'Pastor',
                    'date_of_birth': '1990-01-01',
                    'phone_number': '+254733333333',
                    'status': 'active'
                },
                {
                    'full_name': 'Invalid Pastor',
                    'gender': 'Male',
                    'pastor_rank': 'Pastor',
                    # Missing required date_of_birth
                    'phone_number': '+254744444444',
                    'status': 'active'
                }
            ]
        }
        
        response = self.client.post('/api/pastors/bulk_create/', pastors_data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        # Ensure no pastors were created (transaction rolled back)
        self.assertEqual(Pastor.objects.count(), initial_count)
    
    def test_create_pastor(self):
        """Test creating a single pastor"""
        self.client.force_authenticate(user=self.user)
        
        pastor_data = {
            'full_name': 'New Pastor',
            'gender': 'Male',
            'pastor_rank': 'Bishop',
            'national_id': '99999999',
            'date_of_birth': '1975-12-25',
            'phone_number': '+254755555555',
            'status': 'active'
        }
        
        response = self.client.post('/api/pastors/', pastor_data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['full_name'], 'New Pastor')
        self.assertEqual(Pastor.objects.count(), 4)
    
    def test_update_pastor(self):
        """Test updating a pastor"""
        self.client.force_authenticate(user=self.user)
        
        update_data = {
            'full_name': 'Updated Name',
            'gender': self.pastor1.gender,
            'pastor_rank': self.pastor1.pastor_rank,
            'date_of_birth': str(self.pastor1.date_of_birth),
            'phone_number': self.pastor1.phone_number,
            'status': 'retired'
        }
        
        response = self.client.put(f'/api/pastors/{self.pastor1.id}/', update_data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['full_name'], 'Updated Name')
        self.assertEqual(response.data['status'], 'retired')
    
    def test_partial_update_pastor(self):
        """Test partial update of a pastor"""
        self.client.force_authenticate(user=self.user)
        
        response = self.client.patch(
            f'/api/pastors/{self.pastor1.id}/',
            {'status': 'suspended'},
            format='json'
        )
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['status'], 'suspended')
    
    def test_delete_pastor(self):
        """Test deleting a pastor"""
        self.client.force_authenticate(user=self.user)
        
        response = self.client.delete(f'/api/pastors/{self.pastor1.id}/')
        
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(Pastor.objects.count(), 2)
    
    def test_retrieve_pastor(self):
        """Test retrieving a single pastor"""
        self.client.force_authenticate(user=self.user)
        
        response = self.client.get(f'/api/pastors/{self.pastor1.id}/')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['full_name'], 'John Doe')
