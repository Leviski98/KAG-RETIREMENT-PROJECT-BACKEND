from rest_framework import serializers


class ReportMetricSerializer(serializers.Serializer):
    label = serializers.CharField()
    value = serializers.CharField()


class ReportTotalsSerializer(serializers.Serializer):
    districts = serializers.IntegerField(required=False)
    sections = serializers.IntegerField(required=False)
    churches = serializers.IntegerField(required=False)
    assigned_pastors = serializers.IntegerField(required=False)
    total_pastors = serializers.IntegerField(required=False)
    active_pastors = serializers.IntegerField(required=False)
    retired_pastors = serializers.IntegerField(required=False)
    average_years_served = serializers.FloatField(required=False)


class DistrictSummaryRowSerializer(serializers.Serializer):
    district_id = serializers.CharField()
    district_name = serializers.CharField()
    sections = serializers.IntegerField()
    churches = serializers.IntegerField()
    assigned_pastors = serializers.IntegerField()


class DemographicCountSerializer(serializers.Serializer):
    label = serializers.CharField()
    count = serializers.IntegerField()


class PastorReportRowSerializer(serializers.Serializer):
    pastor_id = serializers.CharField()
    name = serializers.CharField()
    rank = serializers.CharField()
    status = serializers.CharField()
    age = serializers.IntegerField(allow_null=True)
    years_served = serializers.IntegerField(allow_null=True)
    projected_retirement = serializers.CharField()
    remaining_tenure = serializers.CharField()


class PastorReportSectionSerializer(serializers.Serializer):
    section_id = serializers.CharField()
    section_name = serializers.CharField()
    pastors = PastorReportRowSerializer(many=True)


class PastorReportDistrictSerializer(serializers.Serializer):
    district_id = serializers.CharField()
    district_name = serializers.CharField()
    sections = PastorReportSectionSerializer(many=True)


class DistrictSummaryReportSerializer(serializers.Serializer):
    title = serializers.CharField()
    generated_at = serializers.DateTimeField()
    totals = ReportTotalsSerializer()
    metrics = ReportMetricSerializer(many=True)
    districts = DistrictSummaryRowSerializer(many=True)


class PastorDemographicsReportSerializer(serializers.Serializer):
    title = serializers.CharField()
    generated_at = serializers.DateTimeField()
    totals = ReportTotalsSerializer()
    metrics = ReportMetricSerializer(many=True)
    by_gender = DemographicCountSerializer(many=True)
    by_rank = DemographicCountSerializer(many=True)
    by_status = DemographicCountSerializer(many=True)
    districts = PastorReportDistrictSerializer(many=True)
