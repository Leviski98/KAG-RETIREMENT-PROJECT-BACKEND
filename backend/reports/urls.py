from django.urls import path

from .views import (
    DistrictSummaryReportView,
    DistrictSummaryReportPDFView,
    PastorDemographicsReportView,
    PastorDemographicsReportPDFView,
)


urlpatterns = [
    path(
        'reports/district-summary/',
        DistrictSummaryReportView.as_view(),
        name='report-district-summary',
    ),
    path(
        'reports/district-summary/pdf/',
        DistrictSummaryReportPDFView.as_view(),
        name='report-district-summary-pdf',
    ),
    path(
        'reports/pastor-demographics/',
        PastorDemographicsReportView.as_view(),
        name='report-pastor-demographics',
    ),
    path(
        'reports/pastor-demographics/pdf/',
        PastorDemographicsReportPDFView.as_view(),
        name='report-pastor-demographics-pdf',
    ),
]
