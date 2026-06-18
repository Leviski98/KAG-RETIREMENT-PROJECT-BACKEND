"""
PDF generation service for reports using ReportLab.
"""
from io import BytesIO
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter, landscape
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib.enums import TA_CENTER

# Landscape letter: 11" × 8.5" with 0.5" margins each side → 10" usable width
_PAGE = landscape(letter)
_MARGIN = 0.5 * inch
_W = _PAGE[0] - 2 * _MARGIN  # 10.0 inches usable


class ReportPDFGenerator:
    """Generate PDF reports with consistent styling."""

    def __init__(self, title: str, generated_at: str):
        self.title = title
        self.generated_at = generated_at
        self.styles = getSampleStyleSheet()
        self._add_styles()

    def _add_styles(self):
        self.styles.add(ParagraphStyle(
            name='ReportTitle',
            parent=self.styles['Normal'],
            fontSize=20,
            textColor=colors.HexColor('#1f4e78'),
            spaceAfter=4,
            alignment=TA_CENTER,
            fontName='Helvetica-Bold',
        ))
        self.styles.add(ParagraphStyle(
            name='ReportSubtitle',
            parent=self.styles['Normal'],
            fontSize=9,
            textColor=colors.HexColor('#607391'),
            spaceAfter=8,
            alignment=TA_CENTER,
            fontName='Helvetica',
        ))
        self.styles.add(ParagraphStyle(
            name='SectionHeading',
            parent=self.styles['Normal'],
            fontSize=11,
            textColor=colors.HexColor('#003a70'),
            spaceBefore=8,
            spaceAfter=4,
            fontName='Helvetica-Bold',
        ))
        self.styles.add(ParagraphStyle(
            name='SubSection',
            parent=self.styles['Normal'],
            fontSize=9,
            textColor=colors.HexColor('#333333'),
            spaceBefore=6,
            spaceAfter=3,
            fontName='Helvetica-BoldOblique',
        ))
        self.styles.add(ParagraphStyle(
            name='CellNormal',
            parent=self.styles['Normal'],
            fontSize=7,
            leading=9,
            fontName='Helvetica',
        ))
        self.styles.add(ParagraphStyle(
            name='CellBold',
            parent=self.styles['Normal'],
            fontSize=7,
            leading=9,
            fontName='Helvetica-Bold',
        ))

    def _new_doc(self, buffer: BytesIO) -> SimpleDocTemplate:
        return SimpleDocTemplate(
            buffer,
            pagesize=_PAGE,
            leftMargin=_MARGIN,
            rightMargin=_MARGIN,
            topMargin=0.7 * inch,
            bottomMargin=0.7 * inch,
        )

    def _page_header(self, title: str) -> list:
        return [
            Paragraph(title, self.styles['ReportTitle']),
            Paragraph(f'Generated on {self.generated_at}', self.styles['ReportSubtitle']),
            Spacer(1, 0.2 * inch),
        ]

    # ── Shared table styles ────────────────────────────────────────────────

    @staticmethod
    def _summary_style() -> TableStyle:
        return TableStyle([
            ('BACKGROUND',    (0, 0), (-1,  0), colors.HexColor('#1f4e78')),
            ('TEXTCOLOR',     (0, 0), (-1,  0), colors.white),
            ('FONTNAME',      (0, 0), (-1,  0), 'Helvetica-Bold'),
            ('FONTSIZE',      (0, 0), (-1,  0), 10),
            ('ALIGN',         (0, 0), (-1,  0), 'CENTER'),
            ('TOPPADDING',    (0, 0), (-1,  0), 9),
            ('BOTTOMPADDING', (0, 0), (-1,  0), 9),
            ('BACKGROUND',    (0, 1), (-1, -1), colors.HexColor('#eaf1ff')),
            ('FONTNAME',      (0, 1), (-1, -1), 'Helvetica-Bold'),
            ('FONTSIZE',      (0, 1), (-1, -1), 13),
            ('ALIGN',         (0, 1), (-1, -1), 'CENTER'),
            ('TOPPADDING',    (0, 1), (-1, -1), 10),
            ('BOTTOMPADDING', (0, 1), (-1, -1), 10),
            ('GRID',          (0, 0), (-1, -1), 0.5, colors.HexColor('#b0c4de')),
        ])

    @staticmethod
    def _detail_table_style() -> TableStyle:
        return TableStyle([
            ('BACKGROUND',    (0, 0), (-1,  0), colors.HexColor('#1f4e78')),
            ('TEXTCOLOR',     (0, 0), (-1,  0), colors.white),
            ('FONTNAME',      (0, 0), (-1,  0), 'Helvetica-Bold'),
            ('FONTSIZE',      (0, 0), (-1,  0), 8),
            ('ALIGN',         (0, 0), (-1,  0), 'CENTER'),
            ('TOPPADDING',    (0, 0), (-1,  0), 6),
            ('BOTTOMPADDING', (0, 0), (-1,  0), 6),
            ('FONTNAME',      (0, 1), (-1, -1), 'Helvetica'),
            ('FONTSIZE',      (0, 1), (-1, -1), 8),
            ('TOPPADDING',    (0, 1), (-1, -1), 5),
            ('BOTTOMPADDING', (0, 1), (-1, -1), 5),
            ('LEFTPADDING',   (0, 0), (-1, -1), 6),
            ('ALIGN',         (2, 1), (-1, -1), 'CENTER'),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#f5f5dc')]),
            ('GRID',          (0, 0), (-1, -1), 0.5, colors.HexColor('#808080')),
            ('VALIGN',        (0, 0), (-1, -1), 'MIDDLE'),
        ])

    @staticmethod
    def _demo_style() -> TableStyle:
        return TableStyle([
            ('BACKGROUND',    (0, 0), (-1,  0), colors.HexColor('#2e5c8a')),
            ('TEXTCOLOR',     (0, 0), (-1,  0), colors.white),
            ('FONTNAME',      (0, 0), (-1,  0), 'Helvetica-Bold'),
            ('FONTSIZE',      (0, 0), (-1,  0), 8),
            ('ALIGN',         (0, 0), (-1,  0), 'CENTER'),
            ('TOPPADDING',    (0, 0), (-1,  0), 5),
            ('BOTTOMPADDING', (0, 0), (-1,  0), 5),
            ('FONTNAME',      (0, 1), (-1, -1), 'Helvetica'),
            ('FONTSIZE',      (0, 1), (-1, -1), 8),
            ('TOPPADDING',    (0, 1), (-1, -1), 4),
            ('BOTTOMPADDING', (0, 1), (-1, -1), 4),
            ('LEFTPADDING',   (0, 1), (0, -1), 6),
            ('ALIGN',         (1, 1), (1, -1), 'RIGHT'),
            ('RIGHTPADDING',  (1, 1), (1, -1), 6),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#f0f4f8')]),
            ('GRID',          (0, 0), (-1, -1), 0.5, colors.HexColor('#b0c4de')),
        ])

    # ── District Summary ───────────────────────────────────────────────────

    def create_district_summary_pdf(self, data: dict) -> BytesIO:
        buffer = BytesIO()
        doc = self._new_doc(buffer)
        elements = self._page_header(data['title'])

        # Totals banner — 4 equal columns filling full width
        t = data['totals']
        col4 = _W / 4
        totals_table = Table(
            [
                ['Districts', 'Sections', 'Churches', 'Assigned Pastors'],
                [str(t['districts']), str(t['sections']),
                 str(t['churches']), str(t['assigned_pastors'])],
            ],
            colWidths=[col4] * 4,
        )
        totals_table.setStyle(self._summary_style())
        elements += [totals_table, Spacer(1, 0.2 * inch)]

        # District detail table
        # ID 1.0" | Name 4.2" | Sections 1.4" | Churches 1.4" | Assigned 2.0" = 10.0"
        col_w = [1.0 * inch, 4.2 * inch, 1.4 * inch, 1.4 * inch, 2.0 * inch]
        rows = [['District ID', 'District Name', 'Sections', 'Churches', 'Assigned Pastors']]
        for d in data['districts']:
            rows.append([
                d['district_id'],
                Paragraph(d['district_name'], self.styles['CellBold']),
                str(d['sections']),
                str(d['churches']),
                str(d['assigned_pastors']),
            ])

        detail_table = Table(rows, colWidths=col_w, repeatRows=1)
        detail_table.setStyle(self._detail_table_style())
        elements.append(Paragraph('District Breakdown', self.styles['SectionHeading']))
        elements.append(Spacer(1, 0.06 * inch))
        elements.append(detail_table)

        doc.build(elements)
        buffer.seek(0)
        return buffer

    # ── Pastor Demographics ────────────────────────────────────────────────

    def create_pastor_demographics_pdf(self, data: dict) -> BytesIO:
        buffer = BytesIO()
        doc = self._new_doc(buffer)
        elements = self._page_header(data['title'])

        # Totals banner — 4 equal columns
        s = data['summary']
        col4 = _W / 4
        summary_table = Table(
            [
                ['Total Pastors', 'Active', 'Retired', 'Avg. Years Served'],
                [str(s['total_pastors']), str(s['active_pastors']),
                 str(s['retired_pastors']), s['average_years_served']],
            ],
            colWidths=[col4] * 4,
        )
        summary_table.setStyle(self._summary_style())
        elements += [summary_table, Spacer(1, 0.2 * inch)]

        # Demographics: gender / rank / status side by side
        # Each panel is 1/3 of page width; inner cols split 60/40
        col3 = _W / 3
        lw = col3 * 0.62
        cw = col3 * 0.38

        def _demo(header: str, rows_data: list) -> Table:
            tdata = [[header, 'Count']] + [[r['label'], str(r['count'])] for r in rows_data]
            t = Table(tdata, colWidths=[lw, cw])
            t.setStyle(self._demo_style())
            return t

        demo_wrapper = Table(
            [[_demo('Gender', data['by_gender']),
              _demo('Rank', data['by_rank']),
              _demo('Status', data['by_status'])]],
            colWidths=[col3] * 3,
        )
        demo_wrapper.setStyle(TableStyle([
            ('VALIGN',         (0, 0), (-1, -1), 'TOP'),
            ('LEFTPADDING',    (0, 0), (-1, -1), 3),
            ('RIGHTPADDING',   (0, 0), (-1, -1), 3),
            ('TOPPADDING',     (0, 0), (-1, -1), 0),
            ('BOTTOMPADDING',  (0, 0), (-1, -1), 0),
        ]))
        elements.append(Paragraph('Demographics', self.styles['SectionHeading']))
        elements.append(Spacer(1, 0.06 * inch))
        elements += [demo_wrapper, Spacer(1, 0.25 * inch)]

        # Pastor assignments
        # Name 2.3" | Rank 1.4" | Status 1.1" | Age 0.7" | Yrs 1.0" | Proj 1.75" | Rem 1.75" = 10.0"
        p_cols = [2.3 * inch, 1.4 * inch, 1.1 * inch, 0.7 * inch,
                  1.0 * inch, 1.75 * inch, 1.75 * inch]

        elements.append(Paragraph('Pastor Assignments by District', self.styles['SectionHeading']))

        for district_id, district_data in data['assignments'].items():
            dist_info = district_data['district']
            elements.append(Spacer(1, 0.08 * inch))
            elements.append(Paragraph(dist_info['district_name'], self.styles['SectionHeading']))

            for section_id, section_info in district_data['sections'].items():
                section = section_info['section']
                pastors = section_info['pastors']

                elements.append(Paragraph(
                    f"Section: {section['section_name']}",
                    self.styles['SubSection'],
                ))
                elements.append(Spacer(1, 0.03 * inch))

                p_rows = [[
                    'Name', 'Rank', 'Status', 'Age',
                    'Yrs Served', 'Proj. Retirement', 'Rem. Tenure',
                ]]
                for p in pastors:
                    p_rows.append([
                        Paragraph(p['name'], self.styles['CellBold']),
                        p['rank'] or '-',
                        p['status'],
                        str(p['age']) if p['age'] is not None else '-',
                        str(p['years_served']) if p['years_served'] is not None else '-',
                        p['projected_retirement'],
                        p['remaining_tenure'],
                    ])

                p_table = Table(p_rows, colWidths=p_cols, repeatRows=1)
                p_table.setStyle(self._detail_table_style())
                elements.append(p_table)
                elements.append(Spacer(1, 0.1 * inch))

        doc.build(elements)
        buffer.seek(0)
        return buffer
