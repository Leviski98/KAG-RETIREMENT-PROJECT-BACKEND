from collections import defaultdict
from datetime import date

from django.db.models import Count
from django.http import FileResponse
from django.utils import timezone
from drf_spectacular.utils import extend_schema
from rest_framework.response import Response
from rest_framework.views import APIView

from churches.models import Church, ChurchPastor
from districts.models import District
from pastors.models import Pastor
from sections.models import Section

from .serializers import (
    DistrictSummaryReportSerializer,
    PastorDemographicsReportSerializer,
)
from .pdf_generator import ReportPDFGenerator


DEFAULT_RETIREMENT_AGE = 65


def get_retirement_age():
    try:
        from app_settings.models import SystemSettings
        obj = SystemSettings.objects.only('retirement_age').get(pk=1)
        return obj.retirement_age
    except Exception:
        return DEFAULT_RETIREMENT_AGE


def calculate_age(birth_date):
    if not birth_date:
        return None

    today = date.today()
    return today.year - birth_date.year - (
        (today.month, today.day) < (birth_date.month, birth_date.day)
    )


def calculate_years_served(start_date):
    if not start_date:
        return None

    today = date.today()
    return today.year - start_date.year - (
        (today.month, today.day) < (start_date.month, start_date.day)
    )


def format_projected_retirement(birth_date, retirement_age):
    if not birth_date:
        return '-'

    retirement_date = birth_date.replace(year=birth_date.year + retirement_age)
    return retirement_date.strftime('%b %Y')


def format_remaining_tenure(age, status, retirement_age):
    if status in {'retired', 'deceased'} or age is None:
        return '-'

    remaining_years = max(retirement_age - age, 0)
    return f'{remaining_years} yrs'


def format_average_years(value):
    if value is None:
        return '0 yrs'

    rounded = round(value, 1)
    if rounded.is_integer():
        return f'{int(rounded)} yrs'

    return f'{rounded} yrs'


class DistrictSummaryReportView(APIView):
    """
    Live district summary report.

    Returns district-level section, church, and pastor assignment counts.
    """

    @extend_schema(
        tags=['Reports'],
        summary='District Summary Report',
        description='Generate a live summary of districts, sections, churches, and assigned pastors.',
        responses=DistrictSummaryReportSerializer,
    )
    def get(self, request):
        districts = District.objects.annotate(
            section_count=Count('sections', distinct=True),
            church_count=Count('sections__churches', distinct=True),
            assigned_pastor_count=Count('sections__churches__church_pastors', distinct=True),
        ).order_by('name')

        district_rows = [
            {
                'district_id': district.district_id,
                'district_name': district.name,
                'sections': district.section_count,
                'churches': district.church_count,
                'assigned_pastors': district.assigned_pastor_count,
            }
            for district in districts
        ]

        total_districts = len(district_rows)
        total_sections = Section.objects.count()
        total_churches = Church.objects.count()
        assigned_pastors = ChurchPastor.objects.values('pastor').distinct().count()

        return Response({
            'title': 'District Summary Report',
            'generated_at': timezone.now(),
            'totals': {
                'districts': total_districts,
                'sections': total_sections,
                'churches': total_churches,
                'assigned_pastors': assigned_pastors,
            },
            'metrics': [
                {'label': 'Districts', 'value': str(total_districts)},
                {'label': 'Sections', 'value': str(total_sections)},
                {'label': 'Churches', 'value': str(total_churches)},
            ],
            'districts': district_rows,
        })


class PastorDemographicsReportView(APIView):
    """
    Live pastor demographics report.

    Returns aggregate demographic counts and a printable district/section grouping.
    """

    @extend_schema(
        tags=['Reports'],
        summary='Pastor Demographics Report',
        description='Generate a live pastor demographics report grouped by district and section.',
        responses=PastorDemographicsReportSerializer,
    )
    def get(self, request):
        retirement_age = get_retirement_age()

        pastors = list(Pastor.objects.all())
        total_pastors = len(pastors)
        active_pastors = sum(1 for pastor in pastors if pastor.status == 'active')
        retired_pastors = sum(1 for pastor in pastors if pastor.status == 'retired')

        years_values = [
            years
            for years in (calculate_years_served(pastor.start_of_service) for pastor in pastors)
            if years is not None
        ]
        average_years = round(sum(years_values) / len(years_values), 1) if years_values else 0

        by_gender = [
            {'label': row['gender'] or 'Unknown', 'count': row['count']}
            for row in Pastor.objects.values('gender').annotate(count=Count('id')).order_by('gender')
        ]
        by_rank = [
            {'label': row['pastor_rank'] or 'Unknown', 'count': row['count']}
            for row in Pastor.objects.values('pastor_rank').annotate(count=Count('id')).order_by('pastor_rank')
        ]
        by_status = [
            {'label': row['status'] or 'Unknown', 'count': row['count']}
            for row in Pastor.objects.values('status').annotate(count=Count('id')).order_by('status')
        ]

        grouped_assignments = defaultdict(lambda: defaultdict(dict))
        assignments = ChurchPastor.objects.select_related(
            'pastor',
            'church__section__district',
        ).order_by(
            'church__section__district__name',
            'church__section__name',
            'pastor__full_name',
        )

        for assignment in assignments:
            pastor = assignment.pastor
            section = assignment.church.section
            district = section.district
            age = calculate_age(pastor.date_of_birth)
            years_served = calculate_years_served(pastor.start_of_service)

            district_bucket = grouped_assignments[district.id]
            district_bucket['district'] = {
                'district_id': district.district_id,
                'district_name': district.name,
            }

            section_bucket = district_bucket[section.id]
            section_bucket['section'] = {
                'section_id': section.section_id,
                'section_name': section.name,
            }
            section_bucket.setdefault('pastors', [])
            section_bucket['pastors'].append({
                'pastor_id': pastor.pastor_id,
                'name': pastor.full_name,
                'rank': pastor.pastor_rank,
                'status': pastor.get_status_display(),
                'age': age,
                'years_served': years_served,
                'projected_retirement': format_projected_retirement(pastor.date_of_birth, retirement_age),
                'remaining_tenure': format_remaining_tenure(age, pastor.status, retirement_age),
            })

        district_groups = []
        for district_bucket in grouped_assignments.values():
            sections = []
            for section_id, section_bucket in district_bucket.items():
                if section_id == 'district':
                    continue
                sections.append({
                    **section_bucket['section'],
                    'pastors': section_bucket['pastors'],
                })

            district_groups.append({
                **district_bucket['district'],
                'sections': sections,
            })

        return Response({
            'title': 'Pastor Demographics Report',
            'generated_at': timezone.now(),
            'totals': {
                'total_pastors': total_pastors,
                'active_pastors': active_pastors,
                'retired_pastors': retired_pastors,
                'average_years_served': average_years,
            },
            'metrics': [
                {'label': 'Pastors', 'value': str(total_pastors)},
                {'label': 'Active', 'value': str(active_pastors)},
                {'label': 'Avg. Service', 'value': format_average_years(average_years)},
            ],
            'by_gender': by_gender,
            'by_rank': by_rank,
            'by_status': by_status,
            'districts': district_groups,
        })


class DistrictSummaryReportPDFView(APIView):
    """
    Generate District Summary Report as PDF download.

    Returns a downloadable PDF file.
    """

    @extend_schema(
        tags=['Reports'],
        summary='District Summary Report PDF',
        description='Generate and download district summary report as PDF.',
        responses={'application/pdf': None},
    )
    def get(self, request):
        # Get the same data as the JSON endpoint
        districts = District.objects.annotate(
            section_count=Count('sections', distinct=True),
            church_count=Count('sections__churches', distinct=True),
            assigned_pastor_count=Count('sections__churches__church_pastors', distinct=True),
        ).order_by('name')

        district_rows = [
            {
                'district_id': district.district_id,
                'district_name': district.name,
                'sections': district.section_count,
                'churches': district.church_count,
                'assigned_pastors': district.assigned_pastor_count,
            }
            for district in districts
        ]

        total_districts = len(district_rows)
        total_sections = Section.objects.count()
        total_churches = Church.objects.count()
        assigned_pastors = ChurchPastor.objects.values('pastor').distinct().count()

        report_data = {
            'title': 'District Summary Report',
            'generated_at': timezone.now().strftime('%B %d, %Y at %I:%M %p'),
            'totals': {
                'districts': total_districts,
                'sections': total_sections,
                'churches': total_churches,
                'assigned_pastors': assigned_pastors,
            },
            'districts': district_rows,
        }

        # Generate PDF
        pdf_generator = ReportPDFGenerator(report_data['title'], report_data['generated_at'])
        pdf_buffer = pdf_generator.create_district_summary_pdf(report_data)

        # Return as file download
        response = FileResponse(
            pdf_buffer,
            content_type='application/pdf',
        )
        response['Content-Disposition'] = 'attachment; filename="District_Summary_Report.pdf"'
        return response


class PastorDemographicsReportPDFView(APIView):
    """
    Generate Pastor Demographics Report as PDF download.

    Returns a downloadable PDF file.
    """

    @extend_schema(
        tags=['Reports'],
        summary='Pastor Demographics Report PDF',
        description='Generate and download pastor demographics report as PDF.',
        responses={'application/pdf': None},
    )
    def get(self, request):
        retirement_age = get_retirement_age()

        # Get the same data as the JSON endpoint
        pastors = list(Pastor.objects.all())
        total_pastors = len(pastors)
        active_pastors = sum(1 for pastor in pastors if pastor.status == 'active')
        retired_pastors = sum(1 for pastor in pastors if pastor.status == 'retired')

        years_values = [
            years
            for years in (calculate_years_served(pastor.start_of_service) for pastor in pastors)
            if years is not None
        ]
        average_years = round(sum(years_values) / len(years_values), 1) if years_values else 0

        by_gender = [
            {'label': row['gender'] or 'Unknown', 'count': row['count']}
            for row in Pastor.objects.values('gender').annotate(count=Count('id')).order_by('gender')
        ]
        by_rank = [
            {'label': row['pastor_rank'] or 'Unknown', 'count': row['count']}
            for row in Pastor.objects.values('pastor_rank').annotate(count=Count('id')).order_by('pastor_rank')
        ]
        by_status = [
            {'label': row['status'] or 'Unknown', 'count': row['count']}
            for row in Pastor.objects.values('status').annotate(count=Count('id')).order_by('status')
        ]

        # Build assignment grouping
        grouped_assignments = defaultdict(lambda: defaultdict(dict))
        assignments = ChurchPastor.objects.select_related(
            'pastor',
            'church__section__district',
        ).order_by(
            'church__section__district__name',
            'church__section__name',
            'pastor__full_name',
        )

        for assignment in assignments:
            pastor = assignment.pastor
            section = assignment.church.section
            district = section.district
            age = calculate_age(pastor.date_of_birth)
            years_served = calculate_years_served(pastor.start_of_service)

            district_bucket = grouped_assignments[district.id]
            district_bucket['district'] = {
                'district_id': district.district_id,
                'district_name': district.name,
            }

            section_bucket = district_bucket[section.id]
            section_bucket['section'] = {
                'section_id': section.section_id,
                'section_name': section.name,
            }
            section_bucket.setdefault('pastors', [])
            section_bucket['pastors'].append({
                'pastor_id': pastor.pastor_id,
                'name': pastor.full_name,
                'rank': pastor.pastor_rank,
                'status': pastor.get_status_display(),
                'age': age,
                'years_served': years_served,
                'projected_retirement': format_projected_retirement(pastor.date_of_birth, retirement_age),
                'remaining_tenure': format_remaining_tenure(age, pastor.status, retirement_age),
            })

        # Format data for PDF generator
        assignments_dict = {}
        for district_id, district_bucket in grouped_assignments.items():
            district_info = district_bucket['district']
            sections_dict = {}
            for section_id, section_bucket in district_bucket.items():
                if section_id == 'district':
                    continue
                sections_dict[section_id] = {
                    'section': section_bucket['section'],
                    'pastors': section_bucket['pastors'],
                }
            assignments_dict[district_id] = {
                'district': district_info,
                'sections': sections_dict,
            }

        report_data = {
            'title': 'Pastor Demographics Report',
            'generated_at': timezone.now().strftime('%B %d, %Y at %I:%M %p'),
            'summary': {
                'total_pastors': total_pastors,
                'active_pastors': active_pastors,
                'retired_pastors': retired_pastors,
                'average_years_served': format_average_years(average_years),
            },
            'by_gender': by_gender,
            'by_rank': by_rank,
            'by_status': by_status,
            'assignments': assignments_dict,
        }

        # Generate PDF
        pdf_generator = ReportPDFGenerator(report_data['title'], report_data['generated_at'])
        pdf_buffer = pdf_generator.create_pastor_demographics_pdf(report_data)

        # Return as file download
        response = FileResponse(
            pdf_buffer,
            content_type='application/pdf',
        )
        response['Content-Disposition'] = 'attachment; filename="Pastor_Demographics_Report.pdf"'
        return response
