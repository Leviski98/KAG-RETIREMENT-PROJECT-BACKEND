from datetime import date

from django.contrib.auth import get_user_model
from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient

from churches.models import Church, ChurchPastor, ChurchRole
from districts.models import District
from pastors.models import Pastor
from sections.models import Section

User = get_user_model()


class ReportsApiTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        # DEFAULT_PERMISSION_CLASSES is IsAuthenticated globally, so every request
        # needs a caller. force_authenticate bypasses JWTCookieAuthentication
        # entirely (no cookie/OTP flow needed) and sets request.user directly.
        user = User.objects.create_user(username='reports-tester', email='reports-tester@kag.test')
        self.client.force_authenticate(user=user)

    def test_district_summary_empty_database(self):
        response = self.client.get(reverse('report-district-summary'))

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['totals']['districts'], 0)
        self.assertEqual(response.data['totals']['sections'], 0)
        self.assertEqual(response.data['totals']['churches'], 0)
        self.assertEqual(response.data['totals']['assigned_pastors'], 0)
        self.assertEqual(response.data['districts'], [])

    def test_pastor_demographics_empty_database(self):
        response = self.client.get(reverse('report-pastor-demographics'))

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['totals']['total_pastors'], 0)
        self.assertEqual(response.data['totals']['active_pastors'], 0)
        self.assertEqual(response.data['totals']['retired_pastors'], 0)
        self.assertEqual(response.data['totals']['average_years_served'], 0)
        self.assertEqual(response.data['districts'], [])

    def test_seeded_reports_return_expected_aggregates(self):
        district = District.objects.create(name='Nairobi East District')
        section = Section.objects.create(name='Kasarani', district=district)
        church = Church.objects.create(
            church_name='KAG Kasarani',
            section=section,
            location='Kasarani',
        )
        role = ChurchRole.objects.create(role_name='Lead Pastor')
        pastor = Pastor.objects.create(
            full_name='Samuel Kariuki',
            gender='Male',
            pastor_rank='Bishop',
            national_id='12345678',
            date_of_birth=date(1965, 1, 15),
            phone_number='+254712345678',
            start_of_service=date(1995, 1, 15),
            status='active',
        )
        ChurchPastor.objects.create(church=church, pastor=pastor, role=role)

        district_response = self.client.get(reverse('report-district-summary'))
        pastor_response = self.client.get(reverse('report-pastor-demographics'))

        self.assertEqual(district_response.status_code, 200)
        self.assertEqual(district_response.data['totals']['districts'], 1)
        self.assertEqual(district_response.data['totals']['sections'], 1)
        self.assertEqual(district_response.data['totals']['churches'], 1)
        self.assertEqual(district_response.data['totals']['assigned_pastors'], 1)
        self.assertEqual(district_response.data['districts'][0]['district_name'], district.name)
        self.assertEqual(district_response.data['districts'][0]['sections'], 1)
        self.assertEqual(district_response.data['districts'][0]['churches'], 1)
        self.assertEqual(district_response.data['districts'][0]['assigned_pastors'], 1)

        self.assertEqual(pastor_response.status_code, 200)
        self.assertEqual(pastor_response.data['totals']['total_pastors'], 1)
        self.assertEqual(pastor_response.data['totals']['active_pastors'], 1)
        self.assertEqual(pastor_response.data['totals']['retired_pastors'], 0)
        self.assertIn({'label': 'Male', 'count': 1}, pastor_response.data['by_gender'])
        self.assertIn({'label': 'Bishop', 'count': 1}, pastor_response.data['by_rank'])
        self.assertIn({'label': 'active', 'count': 1}, pastor_response.data['by_status'])

        pastor_row = pastor_response.data['districts'][0]['sections'][0]['pastors'][0]
        self.assertEqual(pastor_row['pastor_id'], pastor.pastor_id)
        self.assertEqual(pastor_row['name'], pastor.full_name)
        self.assertEqual(pastor_row['rank'], 'Bishop')
        self.assertEqual(pastor_row['status'], 'Active')
        self.assertIsInstance(pastor_row['age'], int)
        self.assertIsInstance(pastor_row['years_served'], int)
        self.assertEqual(pastor_row['projected_retirement'], 'Jan 2035')
        self.assertTrue(pastor_row['remaining_tenure'].endswith(' yrs'))

    def test_openapi_schema_includes_report_paths(self):
        response = self.client.get(reverse('schema'))

        self.assertEqual(response.status_code, 200)
        self.assertIn('/api/reports/district-summary/', response.data['paths'])
        self.assertIn('/api/reports/pastor-demographics/', response.data['paths'])
