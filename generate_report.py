"""
AI Hospitality Startup Opportunities — Canada 2026
Investor-Grade PDF Report Generator
"""

from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.units import inch
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_JUSTIFY, TA_RIGHT
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, PageBreak,
    Table, TableStyle, HRFlowable, KeepTogether
)
from reportlab.platypus import ListFlowable, ListItem
from reportlab.lib.colors import HexColor
import os

# ── Brand Colours ────────────────────────────────────────────────────────────
NAVY       = HexColor("#0D1B2A")   # deep navy — primary
GOLD       = HexColor("#C9A84C")   # warm gold — accent / tier labels
SLATE      = HexColor("#3D5A6C")   # mid slate — section headers
LIGHT_BLUE = HexColor("#E8F1F8")   # light wash — table shading
OFF_WHITE  = HexColor("#FAFAF8")   # page background suggestion
DARK_GRAY  = HexColor("#2C2C2C")   # body text
MED_GRAY   = HexColor("#6B7280")   # captions / subtext
TIER1_BG   = HexColor("#FFF8E7")   # tier 1 card bg
TIER2_BG   = HexColor("#F0F7FF")   # tier 2 card bg
TIER3_BG   = HexColor("#F5F5F5")   # tier 3 card bg
GREEN      = HexColor("#2D6A4F")   # positive indicators
RED_SOFT   = HexColor("#9B2226")   # risk indicators

PAGE_W, PAGE_H = letter

# ── Style Factory ────────────────────────────────────────────────────────────
def make_styles():
    base = getSampleStyleSheet()

    styles = {
        "cover_title": ParagraphStyle(
            "cover_title",
            fontName="Helvetica-Bold",
            fontSize=28,
            textColor=colors.white,
            leading=36,
            alignment=TA_LEFT,
            spaceAfter=10,
        ),
        "cover_sub": ParagraphStyle(
            "cover_sub",
            fontName="Helvetica",
            fontSize=13,
            textColor=HexColor("#C8D6E0"),
            leading=18,
            alignment=TA_LEFT,
            spaceAfter=6,
        ),
        "cover_label": ParagraphStyle(
            "cover_label",
            fontName="Helvetica-Bold",
            fontSize=9,
            textColor=GOLD,
            leading=14,
            alignment=TA_LEFT,
            spaceBefore=20,
        ),
        "h1": ParagraphStyle(
            "h1",
            fontName="Helvetica-Bold",
            fontSize=18,
            textColor=NAVY,
            leading=24,
            spaceBefore=20,
            spaceAfter=8,
        ),
        "h2": ParagraphStyle(
            "h2",
            fontName="Helvetica-Bold",
            fontSize=13,
            textColor=SLATE,
            leading=18,
            spaceBefore=14,
            spaceAfter=5,
        ),
        "h3": ParagraphStyle(
            "h3",
            fontName="Helvetica-Bold",
            fontSize=11,
            textColor=DARK_GRAY,
            leading=15,
            spaceBefore=10,
            spaceAfter=4,
        ),
        "body": ParagraphStyle(
            "body",
            fontName="Helvetica",
            fontSize=10,
            textColor=DARK_GRAY,
            leading=15,
            spaceAfter=6,
            alignment=TA_JUSTIFY,
        ),
        "body_left": ParagraphStyle(
            "body_left",
            fontName="Helvetica",
            fontSize=10,
            textColor=DARK_GRAY,
            leading=15,
            spaceAfter=5,
            alignment=TA_LEFT,
        ),
        "caption": ParagraphStyle(
            "caption",
            fontName="Helvetica-Oblique",
            fontSize=8.5,
            textColor=MED_GRAY,
            leading=12,
            spaceAfter=4,
        ),
        "label_gold": ParagraphStyle(
            "label_gold",
            fontName="Helvetica-Bold",
            fontSize=8,
            textColor=GOLD,
            leading=12,
            spaceBefore=4,
        ),
        "label_slate": ParagraphStyle(
            "label_slate",
            fontName="Helvetica-Bold",
            fontSize=8,
            textColor=SLATE,
            leading=12,
            spaceBefore=4,
        ),
        "bullet": ParagraphStyle(
            "bullet",
            fontName="Helvetica",
            fontSize=10,
            textColor=DARK_GRAY,
            leading=14,
            leftIndent=14,
            spaceAfter=3,
        ),
        "table_header": ParagraphStyle(
            "table_header",
            fontName="Helvetica-Bold",
            fontSize=9,
            textColor=colors.white,
            leading=12,
            alignment=TA_CENTER,
        ),
        "table_cell": ParagraphStyle(
            "table_cell",
            fontName="Helvetica",
            fontSize=9,
            textColor=DARK_GRAY,
            leading=12,
            alignment=TA_LEFT,
        ),
        "table_cell_bold": ParagraphStyle(
            "table_cell_bold",
            fontName="Helvetica-Bold",
            fontSize=9,
            textColor=DARK_GRAY,
            leading=12,
            alignment=TA_LEFT,
        ),
        "score_big": ParagraphStyle(
            "score_big",
            fontName="Helvetica-Bold",
            fontSize=22,
            textColor=GOLD,
            leading=26,
            alignment=TA_CENTER,
        ),
        "score_label": ParagraphStyle(
            "score_label",
            fontName="Helvetica",
            fontSize=8,
            textColor=MED_GRAY,
            leading=11,
            alignment=TA_CENTER,
        ),
        "tier_badge": ParagraphStyle(
            "tier_badge",
            fontName="Helvetica-Bold",
            fontSize=8,
            textColor=colors.white,
            leading=12,
            alignment=TA_CENTER,
        ),
        "opp_title": ParagraphStyle(
            "opp_title",
            fontName="Helvetica-Bold",
            fontSize=15,
            textColor=NAVY,
            leading=20,
            spaceBefore=6,
            spaceAfter=4,
        ),
        "opp_tagline": ParagraphStyle(
            "opp_tagline",
            fontName="Helvetica-Oblique",
            fontSize=10.5,
            textColor=SLATE,
            leading=15,
            spaceAfter=10,
        ),
        "highlight_box": ParagraphStyle(
            "highlight_box",
            fontName="Helvetica-Bold",
            fontSize=10,
            textColor=NAVY,
            leading=15,
            leftIndent=10,
            rightIndent=10,
        ),
        "footer": ParagraphStyle(
            "footer",
            fontName="Helvetica",
            fontSize=8,
            textColor=MED_GRAY,
            leading=10,
            alignment=TA_CENTER,
        ),
        "toc_entry": ParagraphStyle(
            "toc_entry",
            fontName="Helvetica",
            fontSize=10.5,
            textColor=DARK_GRAY,
            leading=16,
            spaceAfter=4,
        ),
        "toc_section": ParagraphStyle(
            "toc_section",
            fontName="Helvetica-Bold",
            fontSize=11,
            textColor=NAVY,
            leading=16,
            spaceBefore=10,
            spaceAfter=2,
        ),
    }
    return styles

# ── Page Template (header/footer) ─────────────────────────────────────────────
def on_page(canvas, doc):
    canvas.saveState()
    # Footer bar
    canvas.setFillColor(NAVY)
    canvas.rect(0, 0, PAGE_W, 28, fill=1, stroke=0)
    canvas.setFont("Helvetica", 7.5)
    canvas.setFillColor(colors.white)
    canvas.drawString(0.6*inch, 10, "AI Hospitality Startup Opportunities — Canada 2026")
    canvas.drawRightString(PAGE_W - 0.6*inch, 10, f"Page {doc.page}")
    # Top accent line
    canvas.setFillColor(GOLD)
    canvas.rect(0, PAGE_H - 4, PAGE_W, 4, fill=1, stroke=0)
    canvas.restoreState()

def on_first_page(canvas, doc):
    # Cover page — no header/footer chrome
    pass

# ── Helper Builders ───────────────────────────────────────────────────────────
def hr(color=GOLD, thickness=1.5, width="100%"):
    return HRFlowable(width=width, thickness=thickness, color=color, spaceAfter=6, spaceBefore=6)

def section_header(text, styles, number=None):
    elems = []
    elems.append(hr(GOLD, 2))
    label = f"{number}  {text}" if number else text
    elems.append(Paragraph(label, styles["h1"]))
    return elems

def field_block(label, content, styles, bullet_list=False):
    elems = []
    elems.append(Paragraph(label.upper(), styles["label_gold"]))
    if bullet_list and isinstance(content, list):
        for item in content:
            elems.append(Paragraph(f"• {item}", styles["bullet"]))
    elif isinstance(content, list):
        elems.append(Paragraph(" | ".join(content), styles["body_left"]))
    else:
        elems.append(Paragraph(content, styles["body"]))
    return elems

def stat_table(stats, styles):
    """stats = list of (label, value) tuples — renders as a clean KPI row"""
    n = len(stats)
    col_w = (PAGE_W - 1.4*inch) / n
    header_row = [Paragraph(v, ParagraphStyle("sv", fontName="Helvetica-Bold",
                  fontSize=14, textColor=GOLD, alignment=TA_CENTER)) for _, v in stats]
    label_row  = [Paragraph(l, ParagraphStyle("sl", fontName="Helvetica",
                  fontSize=8, textColor=MED_GRAY, alignment=TA_CENTER)) for l, _ in stats]
    t = Table([header_row, label_row], colWidths=[col_w]*n)
    t.setStyle(TableStyle([
        ("BACKGROUND", (0,0), (-1,-1), LIGHT_BLUE),
        ("BOX", (0,0), (-1,-1), 0.5, SLATE),
        ("INNERGRID", (0,0), (-1,-1), 0.3, HexColor("#C5D5E0")),
        ("TOPPADDING", (0,0), (-1,-1), 8),
        ("BOTTOMPADDING", (0,0), (-1,-1), 8),
        ("LEFTPADDING", (0,0), (-1,-1), 6),
        ("RIGHTPADDING", (0,0), (-1,-1), 6),
    ]))
    return t

def scorecard_row(opportunities, styles):
    """Top-10 summary scorecard table"""
    headers = ["#", "Opportunity", "Tier", "Viability", "Speed to Revenue", "Founder Fit"]
    col_widths = [0.35*inch, 2.4*inch, 0.75*inch, 0.85*inch, 1.1*inch, 0.9*inch]
    rows = [[Paragraph(h, styles["table_header"]) for h in headers]]
    tier_colors = {"1": HexColor("#C9A84C"), "2": HexColor("#3D5A6C"), "3": HexColor("#6B7280")}
    for opp in opportunities:
        tc = tier_colors.get(opp["tier"], MED_GRAY)
        rows.append([
            Paragraph(str(opp["rank"]), styles["table_cell_bold"]),
            Paragraph(opp["name"], styles["table_cell_bold"]),
            Paragraph(f"Tier {opp['tier']}", ParagraphStyle("tc",fontName="Helvetica-Bold",
                      fontSize=8.5, textColor=tc, leading=12)),
            Paragraph(opp["viability"], styles["table_cell"]),
            Paragraph(opp["speed"], styles["table_cell"]),
            Paragraph(opp["founder_fit"], styles["table_cell"]),
        ])
    t = Table(rows, colWidths=col_widths)
    t.setStyle(TableStyle([
        ("BACKGROUND", (0,0), (-1,0), NAVY),
        ("ROWBACKGROUNDS", (0,1), (-1,-1), [colors.white, LIGHT_BLUE]),
        ("BOX", (0,0), (-1,-1), 0.5, SLATE),
        ("INNERGRID", (0,0), (-1,-1), 0.3, HexColor("#D1DCE3")),
        ("VALIGN", (0,0), (-1,-1), "MIDDLE"),
        ("TOPPADDING", (0,0), (-1,-1), 6),
        ("BOTTOMPADDING", (0,0), (-1,-1), 6),
        ("LEFTPADDING", (0,0), (-1,-1), 5),
        ("RIGHTPADDING", (0,0), (-1,-1), 5),
    ]))
    return t

def biz_model_table(data, styles):
    """2-column label/value table for business model block"""
    rows = []
    for label, value in data:
        rows.append([
            Paragraph(label, styles["table_cell_bold"]),
            Paragraph(value, styles["table_cell"]),
        ])
    t = Table(rows, colWidths=[1.6*inch, PAGE_W - 3.0*inch])
    t.setStyle(TableStyle([
        ("ROWBACKGROUNDS", (0,0), (-1,-1), [colors.white, LIGHT_BLUE]),
        ("BOX", (0,0), (-1,-1), 0.5, HexColor("#C5D5E0")),
        ("INNERGRID", (0,0), (-1,-1), 0.3, HexColor("#D1DCE3")),
        ("VALIGN", (0,0), (-1,-1), "TOP"),
        ("TOPPADDING", (0,0), (-1,-1), 5),
        ("BOTTOMPADDING", (0,0), (-1,-1), 5),
        ("LEFTPADDING", (0,0), (-1,-1), 7),
        ("RIGHTPADDING", (0,0), (-1,-1), 7),
    ]))
    return t

# ── Cover Page ────────────────────────────────────────────────────────────────
def build_cover(styles):
    from reportlab.platypus import FrameBreak
    elems = []

    # Full-bleed navy block via a large colored rectangle trick using Table
    cover_data = [[""]]
    cover_table = Table(cover_data, colWidths=[PAGE_W], rowHeights=[PAGE_H])
    cover_table.setStyle(TableStyle([
        ("BACKGROUND", (0,0), (-1,-1), NAVY),
    ]))

    # We'll do a canvas-based cover instead via a custom flowable
    elems.append(_CoverPage(styles))
    elems.append(PageBreak())
    return elems

class _CoverPage:
    """Custom cover page drawn directly on canvas"""
    def __init__(self, styles):
        self.styles = styles

    def wrap(self, availWidth, availHeight):
        return (availWidth, availHeight)

    def getKeepWithNext(self):
        return False

    def getSpaceAfter(self):
        return 0

    def getSpaceBefore(self):
        return 0

    def drawOn(self, canvas, x, y, _sW=0):
        self._draw(canvas)

    def _draw(self, c):
        W, H = PAGE_W, PAGE_H
        s = self.styles

        # Navy background
        c.setFillColor(NAVY)
        c.rect(0, 0, W, H, fill=1, stroke=0)

        # Gold top bar
        c.setFillColor(GOLD)
        c.rect(0, H - 8, W, 8, fill=1, stroke=0)

        # Gold left accent stripe
        c.setFillColor(GOLD)
        c.rect(0.55*inch, 0.12*H, 4, 0.58*H, fill=1, stroke=0)

        # Report category label
        c.setFont("Helvetica-Bold", 9)
        c.setFillColor(GOLD)
        c.drawString(0.75*inch, H - 1.0*inch, "MARKET INTELLIGENCE REPORT  •  CONFIDENTIAL")

        # Main title
        c.setFont("Helvetica-Bold", 32)
        c.setFillColor(colors.white)
        c.drawString(0.75*inch, H - 1.9*inch, "AI Hospitality")
        c.drawString(0.75*inch, H - 2.45*inch, "Startup")
        c.drawString(0.75*inch, H - 3.0*inch, "Opportunities")

        # Subtitle
        c.setFont("Helvetica-Bold", 16)
        c.setFillColor(GOLD)
        c.drawString(0.75*inch, H - 3.55*inch, "Canada 2026")

        # Divider
        c.setStrokeColor(GOLD)
        c.setLineWidth(1)
        c.line(0.75*inch, H - 3.75*inch, W - 0.75*inch, H - 3.75*inch)

        # Subtitle description
        c.setFont("Helvetica", 11)
        c.setFillColor(HexColor("#C8D6E0"))
        c.drawString(0.75*inch, H - 4.05*inch,
                     "Top 10 AI-Driven Opportunities for Independent Hotels,")
        c.drawString(0.75*inch, H - 4.28*inch,
                     "Boutique Properties & Small Hotel Groups")

        # Meta block
        meta_y = H - 5.3*inch
        c.setFont("Helvetica-Bold", 8)
        c.setFillColor(GOLD)
        c.drawString(0.75*inch, meta_y, "RESEARCH LENS")
        c.setFont("Helvetica", 9)
        c.setFillColor(colors.white)
        c.drawString(0.75*inch, meta_y - 0.18*inch,
                     "Hotel IT Leadership  •  AI Strategy  •  SaaS Go-to-Market")

        c.setFont("Helvetica-Bold", 8)
        c.setFillColor(GOLD)
        c.drawString(0.75*inch, meta_y - 0.55*inch, "FOCUS MARKET")
        c.setFont("Helvetica", 9)
        c.setFillColor(colors.white)
        c.drawString(0.75*inch, meta_y - 0.73*inch,
                     "Canada — Independent, Boutique & Mid-Scale Hotel Groups")

        c.setFont("Helvetica-Bold", 8)
        c.setFillColor(GOLD)
        c.drawString(0.75*inch, meta_y - 1.1*inch, "REPORT DATE")
        c.setFont("Helvetica", 9)
        c.setFillColor(colors.white)
        c.drawString(0.75*inch, meta_y - 1.28*inch, "March 2026")

        # Bottom strip
        c.setFillColor(HexColor("#0A1520"))
        c.rect(0, 0, W, 0.7*inch, fill=1, stroke=0)
        c.setFont("Helvetica", 8)
        c.setFillColor(MED_GRAY)
        c.drawString(0.75*inch, 0.28*inch,
                     "For internal use and investor presentation only. Not for redistribution.")
        c.setFont("Helvetica-Bold", 8)
        c.setFillColor(GOLD)
        c.drawRightString(W - 0.75*inch, 0.28*inch, "hospitality-ai.ca")


# ── Opportunity Card Builder (Tier 1 full depth) ──────────────────────────────
def build_opportunity_full(opp, rank, styles):
    """Full 4-page deep-dive for Tier 1 opportunities"""
    elems = []

    tier_color = {1: GOLD, 2: SLATE, 3: MED_GRAY}[opp["tier_num"]]
    tier_bg    = {1: TIER1_BG, 2: TIER2_BG, 3: TIER3_BG}[opp["tier_num"]]

    # ── Header band ───────────────────────────────────────────────────────────
    badge_data = [[
        Paragraph(f"#{rank}", ParagraphStyle("rn", fontName="Helvetica-Bold",
                  fontSize=20, textColor=colors.white, alignment=TA_CENTER)),
        Paragraph(opp["name"], styles["opp_title"]),
        Paragraph(f"TIER {opp['tier_num']}\nLAUNCH NOW", ParagraphStyle("tb",
                  fontName="Helvetica-Bold", fontSize=9, textColor=tier_color,
                  alignment=TA_CENTER, leading=13)),
    ]]
    badge_t = Table(badge_data, colWidths=[0.55*inch, 5.1*inch, 0.9*inch])
    badge_t.setStyle(TableStyle([
        ("BACKGROUND", (0,0), (0,0), NAVY),
        ("BACKGROUND", (1,0), (1,0), tier_bg),
        ("BACKGROUND", (2,0), (2,0), tier_bg),
        ("BOX", (0,0), (-1,-1), 1, tier_color),
        ("VALIGN", (0,0), (-1,-1), "MIDDLE"),
        ("TOPPADDING", (0,0), (-1,-1), 10),
        ("BOTTOMPADDING", (0,0), (-1,-1), 10),
        ("LEFTPADDING", (0,0), (-1,-1), 8),
        ("RIGHTPADDING", (0,0), (-1,-1), 8),
    ]))
    elems.append(badge_t)
    elems.append(Spacer(1, 4))
    elems.append(Paragraph(opp["tagline"], styles["opp_tagline"]))

    # ── KPI stats bar ─────────────────────────────────────────────────────────
    elems.append(stat_table(opp["stats"], styles))
    elems.append(Spacer(1, 10))

    # ── Problem + Why Now (2-col) ─────────────────────────────────────────────
    left_content = (
        field_block("The Problem", opp["problem"], styles) +
        [Spacer(1, 6)] +
        field_block("Why This Matters Now", opp["why_now"], styles)
    )
    right_content = (
        field_block("Existing Weak Solutions", opp["existing_solutions"], styles,
                    bullet_list=True) +
        [Spacer(1, 6)] +
        field_block("What AI Changes", opp["ai_changes"], styles)
    )

    two_col = Table(
        [[left_content, right_content]],
        colWidths=[(PAGE_W - 1.4*inch) * 0.52, (PAGE_W - 1.4*inch) * 0.48]
    )
    two_col.setStyle(TableStyle([
        ("VALIGN", (0,0), (-1,-1), "TOP"),
        ("LEFTPADDING", (0,0), (-1,-1), 0),
        ("RIGHTPADDING", (0,0), (-1,-1), 8),
        ("TOPPADDING", (0,0), (-1,-1), 0),
        ("BOTTOMPADDING", (0,0), (-1,-1), 0),
    ]))
    elems.append(two_col)
    elems.append(Spacer(1, 6))
    elems.append(hr(LIGHT_BLUE, 1))

    # ── Target segment + Use cases ────────────────────────────────────────────
    elems += field_block("Target Customer Segment", opp["target_segment"], styles)
    elems += field_block("Example Use Cases Inside Hotel Operations",
                         opp["use_cases"], styles, bullet_list=True)
    elems.append(Spacer(1, 6))

    # ── Data & Integrations ───────────────────────────────────────────────────
    elems += field_block("Data & Integrations Required",
                         opp["integrations"], styles, bullet_list=True)
    elems.append(Spacer(1, 6))
    elems.append(hr(LIGHT_BLUE, 1))

    # ── Business model table ──────────────────────────────────────────────────
    elems.append(Paragraph("BUSINESS MODEL", styles["label_gold"]))
    elems.append(biz_model_table(opp["biz_model"], styles))
    elems.append(Spacer(1, 8))

    # ── Risks ─────────────────────────────────────────────────────────────────
    elems += field_block("Risks & Limitations", opp["risks"], styles, bullet_list=True)
    elems.append(Spacer(1, 6))

    # ── Pilot playbook ────────────────────────────────────────────────────────
    elems.append(Paragraph("PILOT VALIDATION PLAYBOOK", styles["label_gold"]))
    for step in opp["pilot_steps"]:
        elems.append(Paragraph(f"• {step}", styles["bullet"]))
    elems.append(Spacer(1, 6))

    # ── Founder fit ───────────────────────────────────────────────────────────
    founder_data = [[
        Paragraph("FOUNDER FIT SCORE", ParagraphStyle("ffl", fontName="Helvetica-Bold",
                  fontSize=8, textColor=GOLD, alignment=TA_CENTER)),
        Paragraph("WHY HOTEL IT BACKGROUND WINS HERE", ParagraphStyle("ffl2",
                  fontName="Helvetica-Bold", fontSize=8, textColor=SLATE, alignment=TA_LEFT)),
    ],[
        Paragraph(opp["founder_fit_score"], styles["score_big"]),
        Paragraph(opp["founder_fit_why"], styles["body"]),
    ]]
    founder_t = Table(founder_data, colWidths=[1.1*inch, PAGE_W - 2.5*inch])
    founder_t.setStyle(TableStyle([
        ("BACKGROUND", (0,0), (-1,-1), LIGHT_BLUE),
        ("BOX", (0,0), (-1,-1), 0.75, GOLD),
        ("SPAN", (0,0), (0,0)),
        ("VALIGN", (0,0), (-1,-1), "MIDDLE"),
        ("TOPPADDING", (0,0), (-1,-1), 8),
        ("BOTTOMPADDING", (0,0), (-1,-1), 8),
        ("LEFTPADDING", (0,0), (-1,-1), 8),
        ("RIGHTPADDING", (0,0), (-1,-1), 8),
    ]))
    elems.append(founder_t)
    elems.append(Spacer(1, 12))
    return elems


def build_opportunity_standard(opp, rank, styles):
    """Standard 1.5-page treatment for Tier 2 opportunities"""
    elems = []
    tier_bg = TIER2_BG

    # Header
    badge_data = [[
        Paragraph(f"#{rank}", ParagraphStyle("rn2", fontName="Helvetica-Bold",
                  fontSize=16, textColor=colors.white, alignment=TA_CENTER)),
        Paragraph(opp["name"], styles["opp_title"]),
        Paragraph(f"TIER {opp['tier_num']}\n12-18 MONTHS", ParagraphStyle("tb2",
                  fontName="Helvetica-Bold", fontSize=8, textColor=SLATE,
                  alignment=TA_CENTER, leading=12)),
    ]]
    badge_t = Table(badge_data, colWidths=[0.55*inch, 5.1*inch, 0.9*inch])
    badge_t.setStyle(TableStyle([
        ("BACKGROUND", (0,0), (0,0), SLATE),
        ("BACKGROUND", (1,0), (1,0), tier_bg),
        ("BACKGROUND", (2,0), (2,0), tier_bg),
        ("BOX", (0,0), (-1,-1), 1, SLATE),
        ("VALIGN", (0,0), (-1,-1), "MIDDLE"),
        ("TOPPADDING", (0,0), (-1,-1), 8),
        ("BOTTOMPADDING", (0,0), (-1,-1), 8),
        ("LEFTPADDING", (0,0), (-1,-1), 8),
        ("RIGHTPADDING", (0,0), (-1,-1), 8),
    ]))
    elems.append(badge_t)
    elems.append(Spacer(1, 4))
    elems.append(Paragraph(opp["tagline"], styles["opp_tagline"]))

    elems += field_block("The Problem", opp["problem"], styles)
    elems += field_block("What AI Changes", opp["ai_changes"], styles)
    elems += field_block("Target Segment", opp["target_segment"], styles)
    elems += field_block("Use Cases", opp["use_cases"], styles, bullet_list=True)
    elems.append(Paragraph("BUSINESS MODEL", styles["label_gold"]))
    elems.append(biz_model_table(opp["biz_model"], styles))
    elems += field_block("Risks", opp["risks"], styles, bullet_list=True)
    elems.append(Spacer(1, 10))
    return elems


def build_opportunity_brief(opp, rank, styles):
    """Brief 1-page watch-list entry for Tier 3"""
    elems = []

    badge_data = [[
        Paragraph(f"#{rank}", ParagraphStyle("rn3", fontName="Helvetica-Bold",
                  fontSize=14, textColor=colors.white, alignment=TA_CENTER)),
        Paragraph(opp["name"], styles["h2"]),
        Paragraph(f"TIER {opp['tier_num']}\nWATCH LIST", ParagraphStyle("tb3",
                  fontName="Helvetica-Bold", fontSize=8, textColor=MED_GRAY,
                  alignment=TA_CENTER, leading=12)),
    ]]
    badge_t = Table(badge_data, colWidths=[0.55*inch, 5.1*inch, 0.9*inch])
    badge_t.setStyle(TableStyle([
        ("BACKGROUND", (0,0), (0,0), MED_GRAY),
        ("BACKGROUND", (1,0), (1,0), TIER3_BG),
        ("BACKGROUND", (2,0), (2,0), TIER3_BG),
        ("BOX", (0,0), (-1,-1), 0.75, MED_GRAY),
        ("VALIGN", (0,0), (-1,-1), "MIDDLE"),
        ("TOPPADDING", (0,0), (-1,-1), 7),
        ("BOTTOMPADDING", (0,0), (-1,-1), 7),
        ("LEFTPADDING", (0,0), (-1,-1), 8),
        ("RIGHTPADDING", (0,0), (-1,-1), 8),
    ]))
    elems.append(badge_t)
    elems.append(Spacer(1, 4))
    elems.append(Paragraph(opp["tagline"], styles["opp_tagline"]))
    elems += field_block("Investment Thesis", opp["thesis"], styles)
    elems += field_block("Why Watch", opp["why_watch"], styles)
    elems += field_block("Timing Signal", opp["timing"], styles)
    elems.append(Spacer(1, 10))
    return elems


# ── Report Data ───────────────────────────────────────────────────────────────
OPPORTUNITIES = [

    # ════════════════════════════════════════════════════════════════════════
    # TIER 1 — LAUNCH NOW
    # ════════════════════════════════════════════════════════════════════════
    {
        "rank": 1,
        "tier_num": 1,
        "tier": "1",
        "name": "AI Guest Communication & Multilingual Concierge",
        "tagline": "Always-on, multilingual guest engagement that independent hotels cannot afford to staff",
        "viability": "★★★★★",
        "speed": "3–6 months",
        "founder_fit": "★★★★★",
        "stats": [
            ("Canadian Hotels (Independent)", "~3,200"),
            ("Avg. Staff Turnover", "70%+/yr"),
            ("Guests Wanting 24/7 Chat", "68%"),
            ("TAM (Canada)", "$180M+"),
        ],
        "problem": (
            "Independent hotels in Canada operate with lean front-desk teams — often 1–2 agents overnight. "
            "Guests arrive from 40+ countries expecting answers in their language, on any channel (WhatsApp, "
            "SMS, email, web chat), at any hour. The result: unanswered messages, missed upsell moments, "
            "negative reviews citing 'unresponsive staff,' and front-desk staff overwhelmed with repetitive "
            "questions (check-in time, Wi-Fi password, parking directions) that consume 60–70% of their shift."
        ),
        "why_now": (
            "Three forces are colliding in 2026: (1) Labor costs in hospitality have risen 22% since 2022 "
            "with no relief in sight. (2) LLMs now handle nuanced, context-aware conversation across 95+ "
            "languages without translation latency. (3) Canadian hotel guests — especially in Toronto, "
            "Vancouver, and Montreal — are among the most internationally diverse in North America, making "
            "multilingual capability a genuine operational necessity, not a feature."
        ),
        "existing_solutions": [
            "Whistle (now Cloudbeds Messaging) — US-centric, SMS only, weak AI",
            "HiJiffy — European; multilingual but not Canada-specific",
            "Quicktext — multilingual AI concierge; European origin, limited CA presence",
            "Benbria/Loop — Canadian (Ottawa); feedback-focused, limited AI depth",
            "Kipsu — basic chat, no true LLM, chain-focused pricing",
            "Revinate — US-based CRM/messaging; enterprise pricing out of reach",
        ],
        "ai_changes": (
            "A purpose-built LLM layer trained on hospitality SOPs, property FAQs, and booking data can "
            "resolve 70–80% of guest queries autonomously — in the guest's language — while escalating "
            "edge cases to staff with full context. AI enables proactive outreach (pre-arrival, upsell, "
            "post-stay recovery), real-time translation, sentiment detection, and integration with PMS "
            "data to personalize every response. The cost per resolved interaction drops from $4–8 "
            "(staff-handled) to under $0.15."
        ),
        "target_segment": (
            "Independent hotels (30–200 rooms), boutique hotel groups (2–15 properties), and B&Bs with "
            "ambitions to professionalize operations. Primary concentration: Ontario, BC, Quebec. "
            "Secondary: Alberta, Atlantic Canada."
        ),
        "use_cases": [
            "Answer 'what time is check-in?' in French, Mandarin, or Arabic — automatically",
            "Proactive pre-arrival message with room upgrade upsell and local recommendations",
            "Late-night maintenance issue triage — log ticket and reassure guest without waking manager",
            "Post-stay survey trigger + Google Review prompt if sentiment is positive",
            "Restaurant reservation booking, spa inquiry, and local activity suggestions via chat",
        ],
        "integrations": [
            "PMS: Cloudbeds, WebRezPro (Calgary — largest Canadian-built PMS for independents), Mews, Maestro (Markham ON), Opera Cloud",
            "Channels: WhatsApp Business API, SMS (Twilio), email, web widget",
            "Booking data: OTA webhooks (Booking.com, Expedia) for guest profile enrichment",
            "Review platforms: Google Business API, TripAdvisor for post-stay routing",
        ],
        "risks": [
            "Hallucination risk: AI must be tightly grounded to property-specific data — generic LLM answers damage trust",
            "Quebec Law 25 (Bill 64): stricter than PIPEDA — mandatory consent, Canadian data residency, fines up to CAD $25M; US-built competitors routinely fail this requirement",
            "PMS integration complexity: WebRezPro and Maestro have limited open API ecosystems vs. Cloudbeds — requires deeper integration work",
            "Guest adoption: some demographics (60+) prefer phone; need graceful human handoff",
            "PIPEDA + Law 25 compliance: guest conversation data requires Canadian data residency and breach reporting capability",
        ],
        "biz_model": [
            ("Model", "SaaS — Monthly subscription per property"),
            ("Pricing", "$299–$699/month per property based on room count + channel volume"),
            ("Setup Fee", "$500–$1,500 one-time onboarding and PMS integration"),
            ("Rev. Potential", "$3,600–$8,400 ARR per property; 500 properties = $3M+ ARR"),
            ("Upsell", "Advanced analytics, custom AI persona, multi-property dashboards"),
            ("Gross Margin", "75–82% at scale (LLM API costs declining)"),
        ],
        "pilot_steps": [
            "Identify 3 boutique hotels in Toronto or Vancouver with multilingual guest mix",
            "Offer 60-day free pilot: set up web chat + WhatsApp on their existing Cloudbeds/Mews",
            "Train AI on their FAQ doc, house rules, and top 50 guest questions from past reviews",
            "Track: response rate, resolution rate, staff time saved, upsell conversions",
            "Convert to paid at end of pilot with case study evidence",
        ],
        "founder_fit_score": "9.5/10",
        "founder_fit_why": (
            "Hotel IT leaders know exactly what data is accessible in each PMS, understand the "
            "integration landscape from the inside, and have credibility walking into GM offices. "
            "You know the daily pain — the 2am WhatsApp that goes unanswered, the check-in rush "
            "chaos, the review that tanks from a language barrier. That operational empathy is "
            "impossible to fake and directly accelerates sales cycles with independent operators."
        ),
    },

    {
        "rank": 2,
        "tier_num": 1,
        "tier": "1",
        "name": "Predictive Maintenance & AI Ticket Prioritization",
        "tagline": "Stop reacting to broken equipment — predict, prioritize, and prevent failures before guests notice",
        "viability": "★★★★★",
        "speed": "3–5 months",
        "founder_fit": "★★★★★",
        "stats": [
            ("Reactive Maintenance Cost Premium", "3–5x"),
            ("Avg. Negative Review Cause", "35% maintenance"),
            ("Canadian Hotel Maintenance Budget", "$8–18K/room/yr"),
            ("TAM (Canada + US)", "$1.2B"),
        ],
        "problem": (
            "Independent hotels run maintenance reactively. A broken HVAC is discovered when a guest "
            "complains. A leaking pipe is found during a room inspection. Elevators fail on peak Friday "
            "nights. Maintenance staff — already stretched thin — spend their day triaging a flood of "
            "equal-priority tickets with no data on what's urgent, what's a guest-facing issue, and "
            "what can wait until Tuesday. The cost of a reactive model is staggering: emergency repairs "
            "run 3–5x the cost of planned maintenance, and every guest-visible failure is a potential "
            "1-star review."
        ),
        "why_now": (
            "IoT sensors are now cheap enough ($15–40/unit) for independents to deploy in HVAC, "
            "elevators, and water systems. Edge AI can process sensor telemetry locally with minimal "
            "latency. LLMs can read free-text maintenance logs and extract failure patterns that "
            "structured systems miss. And critically — hotel maintenance software (HotSOS, Quore, "
            "Flexkeeping) has poor or no predictive capability, creating a clear wedge opportunity "
            "for an AI layer that sits on top."
        ),
        "existing_solutions": [
            "HotSOS (Amadeus) — reactive ticketing only, no AI prediction, enterprise pricing",
            "Quore — housekeeping + maintenance workflow; minimal predictive capability",
            "Flexkeeping — strong mobile UX, no predictive layer, European-origin",
            "Limble CMMS — growing hotel vertical; US-focused, no Canadian-specific features",
            "Infraspeak — European; IoT-capable but not hospitality-specific",
            "IBM Maximo / Siemens — enterprise only, $200K+ implementations; no independent hotel path",
        ],
        "ai_changes": (
            "AI ingests sensor data, historical ticket patterns, PMS occupancy data, and maintenance "
            "logs to: (1) predict equipment failures 48–72 hours before they occur, (2) auto-prioritize "
            "tickets by guest impact and safety risk, (3) recommend the right technician based on skills "
            "and availability, (4) generate work orders with parts needed, and (5) learn failure "
            "signatures over time. The result: 30–40% reduction in emergency repair costs and "
            "measurable improvement in guest satisfaction scores."
        ),
        "target_segment": (
            "Independent and boutique hotels (50–300 rooms), select-service hotel groups, "
            "resort properties with complex mechanical systems, and multi-property operators "
            "who need portfolio-level maintenance visibility."
        ),
        "use_cases": [
            "HVAC unit shows anomalous vibration pattern at 2am — AI flags for next-morning check before failure",
            "Elevator maintenance ticket auto-escalated to urgent when occupancy is 90%+",
            "Seasonal boiler pre-inspection alert triggered 3 weeks before winter peak season",
            "Guest complaint about hot water in room 412 auto-correlated with 3 prior tickets on same floor",
            "Maintenance spend dashboard showing cost-per-room vs. industry benchmark",
        ],
        "integrations": [
            "IoT sensors: optional hardware layer (HVAC, elevators, water, power monitoring) — can start without",
            "Existing CMMS: HotSOS, Quore, Flexkeeping API or CSV data export",
            "PMS: Cloudbeds, WebRezPro, Mews — occupancy and room status data for impact scoring",
            "Parts suppliers: API for automated parts ordering (Phase 2 roadmap)",
        ],
        "risks": [
            "Sensor deployment friction: hardware installation requires upfront investment from hotel",
            "Can start without IoT — text analysis on existing tickets is strong enough for V1",
            "Integration depth varies: some hotels use paper-based or spreadsheet maintenance logs",
            "Maintenance staff adoption: change management required; mobile-first UX is critical",
        ],
        "biz_model": [
            ("Model", "SaaS + optional IoT hardware margin"),
            ("Pricing", "$399–$899/month per property; enterprise tier for multi-property groups"),
            ("Hardware", "Optional IoT sensor kits at cost + 20% margin for hotels wanting full prediction"),
            ("Rev. Potential", "$4,800–$10,800 ARR per property; 300 hotels = $2.4M+ ARR"),
            ("Upsell", "Portfolio analytics dashboard, API access, custom integrations"),
            ("Gross Margin", "68–78% (SaaS only); 55–65% (with hardware)"),
        ],
        "pilot_steps": [
            "Target hotels with 80+ rooms that use HotSOS or Quore — data already exists",
            "Offer free 90-day pilot: connect to their maintenance ticket history, no hardware required",
            "Use AI to analyze 12 months of historical tickets — show failure patterns they didn't know existed",
            "Present ROI: quantify the cost of their last 5 emergency repairs vs. predicted prevention cost",
            "Expand to IoT sensors in Phase 2 after trust is established",
        ],
        "founder_fit_score": "9/10",
        "founder_fit_why": (
            "Hotel IT and operations leaders understand the maintenance software landscape intimately — "
            "they've fought with HotSOS integrations, managed vendor escalations, and explained to "
            "ownership why the HVAC just failed during peak season. This domain knowledge means you "
            "can design the right product (not just a generic IoT platform) and speak the language "
            "of chief engineers, directors of facilities, and GMs. The sales cycle here is "
            "ops-leader to ops-leader — your background is the pitch."
        ),
    },

    {
        "rank": 3,
        "tier_num": 1,
        "tier": "1",
        "name": "AI Staff SOP Copilot & Productivity Layer",
        "tagline": "Give every hotel employee an always-available expert for procedures, compliance, and daily decisions",
        "viability": "★★★★☆",
        "speed": "2–4 months",
        "founder_fit": "★★★★★",
        "stats": [
            ("Hotel Staff Turnover (Canada)", "73%/yr"),
            ("Onboarding Cost per New Hire", "$1,200–$3,500"),
            ("SOP Compliance Gap", "~40% of properties"),
            ("TAM (Canada)", "$280M"),
        ],
        "problem": (
            "With 73% annual turnover in Canadian hospitality, hotels are in a perpetual state of "
            "onboarding. New hires spend their first weeks asking the same questions their predecessors "
            "asked. SOPs are buried in binders, shared drives, or the GM's head. Compliance training "
            "is done once and forgotten. When a guest has a complex request or a staff member faces "
            "an unusual situation — a noise complaint at 2am, a fire alarm procedure, a food allergy "
            "escalation — they either guess, escalate unnecessarily, or handle it poorly. "
            "The result is inconsistent service, liability exposure, and burned-out managers."
        ),
        "why_now": (
            "RAG (Retrieval-Augmented Generation) makes it possible to build a hotel-specific AI "
            "that knows your SOPs, brand standards, and compliance requirements — and answers questions "
            "accurately in plain language. Mobile-first deployment means it works on the devices "
            "hotel staff already carry. And with labor costs at record highs, reducing onboarding "
            "time by even 30% has a measurable dollar impact that GMs can calculate immediately."
        ),
        "existing_solutions": [
            "Typsy — hospitality video LMS (Australian); growing in North America but no AI Q&A",
            "7shifts — Canadian company (Saskatoon); scheduling + team comms, not SOP-focused",
            "Axonify — Canadian company (Waterloo); microlearning, not hospitality-specific",
            "Wisetail / 360Learning — US/European LMS; enterprise pricing, no hospitality tailoring",
            "Guru / Notion AI — generic knowledge bases; not hospitality-aware, no compliance tracking",
            "SharePoint intranet — not mobile-friendly, zero AI capability, poor adoption",
        ],
        "ai_changes": (
            "An AI copilot ingests the hotel's SOPs, brand standards, health and safety documents, "
            "and operational playbooks to create a searchable, conversational knowledge base. "
            "Staff ask in plain language: 'What's the procedure if a guest requests an early check-in "
            "and we're sold out?' The AI answers with policy, escalation path, and guest communication "
            "script — in seconds. Managers get alerts when staff repeatedly ask the same question "
            "(a training gap signal). New hires reach competency 40% faster."
        ),
        "target_segment": (
            "Independent hotels and small groups with 15–200 staff, franchise properties that need "
            "local SOP customization beyond brand standards, and multi-property operators standardizing "
            "procedures across locations."
        ),
        "use_cases": [
            "New housekeeper asks 'how do I handle a room with biohazard?' — gets step-by-step procedure",
            "Front desk staff asks 'what's our policy on late checkout fees?' — AI answers with exact rate and script",
            "Night auditor asks 'who do I call if the PMS goes down?' — gets escalation contact list",
            "GM uses AI to draft updated SOP after a service incident — turns notes into formatted document",
            "Training gap report: AI surfaces top 10 most-asked questions by department this week",
        ],
        "integrations": [
            "Document ingestion: Google Drive, SharePoint, PDF/Word SOP uploads",
            "HR systems: optional integration with ADP, Dayforce for onboarding triggers",
            "PMS: read-only access for room status, reservation context in answers",
            "Mobile: iOS/Android app + web interface; push notifications for compliance reminders",
        ],
        "risks": [
            "SOP content quality varies wildly — many hotels have no written SOPs; content creation service needed as entry point",
            "Staff trust: hourly employees may resist 'AI monitoring' — must be positioned as empowerment, not surveillance",
            "Bilingual mandate: Canadian hotels need EN/FR support; Quebec AODA equivalent + French Language Services Act compliance",
            "Accuracy liability: SOP AI must be grounded strictly to hotel documents — generic LLM answers create liability",
            "WHMIS and provincial H&S compliance: AI answers on safety procedures must be current and jurisdiction-specific",
        ],
        "biz_model": [
            ("Model", "SaaS — per-property monthly subscription"),
            ("Pricing", "$199–$449/month per property based on staff count and document volume"),
            ("Setup Fee", "$800–$2,000 for SOP digitization and AI training assistance"),
            ("Rev. Potential", "$2,400–$5,400 ARR per property; 600 hotels = $2.8M ARR"),
            ("Upsell", "Content creation service, multi-language SOP translation, compliance audit module"),
            ("Gross Margin", "80–85% — pure software, low variable costs"),
        ],
        "pilot_steps": [
            "Target hotels currently using paper binders or fragmented Google Drive SOPs",
            "Offer free SOP digitization for first 3 departments in exchange for 60-day pilot",
            "Measure: time-to-competency for new hires, manager escalation rate, SOP query volume",
            "Show the GM a 'training gap heatmap' — questions staff asked that revealed SOP holes",
            "Expand to full property + pitch to other properties in owner's portfolio",
        ],
        "founder_fit_score": "9/10",
        "founder_fit_why": (
            "Hotel IT leaders have lived the SOP chaos — they've written, lost, rewritten, and "
            "searched for procedures under pressure. You understand what documentation actually "
            "exists in hotels (often less than ideal) and what staff actually need in the moment. "
            "More importantly, you have relationships with GMs and department heads who trust "
            "operational recommendations from people who've worked the floor. This is a "
            "founder-market fit that is very hard to replicate from outside hospitality."
        ),
    },

    # ════════════════════════════════════════════════════════════════════════
    # TIER 2 — BUILD IN 12–18 MONTHS
    # ════════════════════════════════════════════════════════════════════════
    {
        "rank": 4,
        "tier_num": 2,
        "tier": "2",
        "name": "Revenue & Dynamic Pricing Intelligence for Independents",
        "tagline": "Democratize the revenue management tools that only enterprise chains can currently afford",
        "viability": "★★★★☆",
        "speed": "6–9 months",
        "founder_fit": "★★★★☆",
        "problem": (
            "Independent hotels compete against OTAs and branded chains without access to the revenue "
            "management systems (IDeaS, Duetto) that cost $30,000–$150,000/year. Estimated 70%+ of "
            "Canadian independent hotels set room rates manually — weekly, using gut feel and "
            "Booking.com competitor checks. They leave 15–25% of potential RevPAR on the table "
            "every single day. Canadian-specific demand signals (Quebec Carnival, BC ski season, "
            "Atlantic lobster season, CAD/USD fluctuations) are not captured by US-built tools."
        ),
        "ai_changes": (
            "A lightweight AI revenue layer connects to the hotel's channel manager and PMS "
            "(Cloudbeds, WebRezPro, Maestro), pulls local Canadian event data, competitor rates, "
            "weather, and historical demand patterns, then generates daily rate recommendations "
            "with confidence scores. No PhD required — GMs get: 'Raise rates 12% this weekend — "
            "Leafs playoff game + sold-out comp set.' One-click apply across all channels. "
            "Closest existing competitor: RoomPriceGenie (~$200–500/month) — but not Canada-specific "
            "and lacks WebRezPro/Maestro integrations."
        ),
        "target_segment": (
            "Independent hotels (30–150 rooms) without dedicated revenue managers — the GM "
            "currently does revenue management as a side task alongside 6 other jobs. "
            "Primary markets: urban Ontario, BC, Alberta. Secondary: Quebec, Atlantic Canada."
        ),
        "use_cases": [
            "Auto-detect local events (concerts, conferences, sports) and pre-adjust rates 14 days out",
            "Daily rate recommendation email: 'Your comp set raised by 18% for this Saturday — you haven't'",
            "Pace report showing booking velocity vs. same period last year",
            "Shoulder period discount triggers when pickup is behind pace",
        ],
        "biz_model": [
            ("Model", "SaaS — monthly per property"),
            ("Pricing", "$249–$599/month per property"),
            ("Key Integration", "Channel managers: SiteMinder, Cloudbeds, RateGain"),
            ("Rev. Potential", "$2,988–$7,188 ARR/property; 400 hotels = $2M+ ARR"),
            ("Competitive Moat", "Hyperlocal Canadian event data + PMS deep integration"),
        ],
        "risks": [
            "Requires trust in AI pricing — initial skepticism from traditional hoteliers is high",
            "Competitors: Cloudbeds has a built-in RMS feature; must differentiate on depth and simplicity",
            "Revenue lift is measurable but attribution to AI is debatable early in pilot",
        ],
    },

    {
        "rank": 5,
        "tier_num": 2,
        "tier": "2",
        "name": "AI Housekeeping Optimization Engine",
        "tagline": "Transform housekeeping from a scheduling nightmare into a data-driven, labor-efficient operation",
        "viability": "★★★★☆",
        "speed": "6–9 months",
        "founder_fit": "★★★★☆",
        "problem": (
            "Housekeeping is the largest labor cost in a hotel (30–40% of total labor spend) and the "
            "least optimized. Room assignments are made manually each morning, ignoring checkout "
            "patterns, room proximity, staff skill levels, and expected inspection times. "
            "Overtime is rampant. Early checkouts are missed. Rooms sit dirty for 3 hours while "
            "guests wait in the lobby. The direct cost: guest complaints, labor overruns, and "
            "managers spending 2+ hours per day on scheduling."
        ),
        "ai_changes": (
            "AI ingests real-time PMS room status, checkout forecasts, and staff rosters to generate "
            "optimized room assignments each morning — and update them dynamically as checkouts and "
            "stayovers change. It predicts which rooms will take longer to clean (based on historical "
            "data), flags rooms for inspection priority, and alerts managers when a floor is falling "
            "behind pace before it impacts check-in time."
        ),
        "target_segment": "Hotels with 40+ rooms, resort properties with complex housekeeping, small groups needing multi-property housekeeping visibility.",
        "use_cases": [
            "Morning AI assignment: 18 rooms clustered by floor proximity to minimize travel time",
            "Real-time alert: 'Floor 4 is 45 minutes behind pace — 6 arrivals expected at 3pm'",
            "Checkout prediction: flag the 8 rooms most likely to check out early for priority cleaning",
            "Linen usage forecasting for laundry scheduling and supply ordering",
        ],
        "biz_model": [
            ("Model", "SaaS per property"),
            ("Pricing", "$199–$449/month per property"),
            ("Key Integration", "PMS: Mews, Cloudbeds, Opera; housekeeping apps: Flexkeeping, Quore"),
            ("Rev. Potential", "$2,388–$5,388 ARR/property; 500 hotels = $2M+ ARR"),
            ("Upsell", "Multi-property dashboard, linen management module, inspection scoring"),
        ],
        "risks": [
            "Housekeeping staff skepticism about AI monitoring — require careful change management",
            "Real-time PMS room status data quality is inconsistent across systems",
            "Requires buy-in from Executive Housekeeper, not just GM",
        ],
    },

    {
        "rank": 6,
        "tier_num": 2,
        "tier": "2",
        "name": "AI Review Intelligence & Reputation Management",
        "tagline": "Turn thousands of guest reviews into actionable operational insights and automated response",
        "viability": "★★★★☆",
        "speed": "4–7 months",
        "founder_fit": "★★★☆☆",
        "problem": (
            "Independent hotels receive reviews across Google, TripAdvisor, Booking.com, Expedia, "
            "and Yelp — and respond to maybe 30% of them, days or weeks late, with generic replies. "
            "The real opportunity is buried in the text: themes in negative reviews reveal systemic "
            "operational problems (always the same room, always the same staff, always the HVAC) "
            "that GMs only see when a consultant runs a quarterly analysis. Reviews are data. "
            "Most hotels treat them as chores."
        ),
        "ai_changes": (
            "AI aggregates all reviews across platforms, performs sentiment and topic analysis, "
            "surfaces operational insights ('Room 214 mentioned in 23 negative reviews this year'), "
            "auto-drafts personalized review responses for GM approval, and benchmarks the property "
            "against local competitors. The weekly 'reputation briefing' becomes a 5-minute AI "
            "digest instead of a 3-hour manual exercise."
        ),
        "target_segment": "Independent hotels with 15+ reviews/month, boutique groups needing portfolio-level reputation reporting.",
        "use_cases": [
            "Weekly email: 'Top 3 complaint themes this week: noise, slow check-in, pool temperature'",
            "Auto-drafted Google review response ready for one-click publish",
            "Alert: 'Your TripAdvisor score dropped 0.3 points this month — root cause: breakfast quality'",
            "Competitor benchmarking: 'Your score is 0.4 below the local average on cleanliness'",
        ],
        "biz_model": [
            ("Model", "SaaS per property"),
            ("Pricing", "$149–$349/month per property"),
            ("Key Integration", "Google Business API, TripAdvisor, Booking.com, Expedia review APIs"),
            ("Rev. Potential", "$1,788–$4,188 ARR/property; 800 hotels = $2.4M ARR"),
            ("Moat", "Proprietary hospitality sentiment taxonomy + operational insight layer"),
        ],
        "risks": [
            "Market is more crowded here: TrustYou, ReviewPro, Revinate have established bases",
            "Must go deeper than review response — operational insight layer is the real differentiator",
            "Platform API access can be restricted or changed by Google/TripAdvisor without notice",
        ],
    },

    {
        "rank": 7,
        "tier_num": 2,
        "tier": "2",
        "name": "Hotel Performance Copilot & GM Intelligence Dashboard",
        "tagline": "Replace the weekly Excel dashboard with an AI that explains what happened, why, and what to do next",
        "viability": "★★★★☆",
        "speed": "5–8 months",
        "founder_fit": "★★★★★",
        "problem": (
            "Independent hotel GMs manage their business through a patchwork of disconnected reports: "
            "PMS night audit, channel manager pickup report, accounting export, payroll summary — "
            "all in different formats, all pulling them in different directions. There's no single "
            "view of hotel performance, no AI to explain anomalies, and no system to connect "
            "RevPAR to labor costs to guest satisfaction to maintenance spend. GMs are data-rich "
            "and insight-poor. Owners are even more in the dark."
        ),
        "ai_changes": (
            "A unified AI dashboard pulls data from PMS, channel manager, accounting, and review "
            "platforms into a single performance view — then adds an AI layer that explains what the "
            "numbers mean. 'Your ADR is up 8% but RevPAR is flat — your occupancy dropped 4 points "
            "because your rates pushed out price-sensitive segments during a slow midweek period.' "
            "GMs get daily briefings, anomaly alerts, and recommendation cards. Owners get a "
            "clean investor-style portfolio view."
        ),
        "target_segment": "Independent hotels with 30+ rooms, multi-property owners needing portfolio rollup, asset managers representing 5–20 properties.",
        "use_cases": [
            "Daily GM briefing: yesterday's performance vs. budget, forecast variance, key actions",
            "Anomaly alert: 'ADR dropped 22% last Tuesday — rate parity breach detected on Expedia'",
            "Owner dashboard: monthly portfolio performance with AI-written narrative summary",
            "Budget vs. actual analysis with AI-explained variance for every line item",
        ],
        "biz_model": [
            ("Model", "SaaS per property + portfolio tier"),
            ("Pricing", "$299–$699/month per property; $999–$2,499/month for portfolio of 5+ properties"),
            ("Key Integration", "PMS, channel manager, accounting (QuickBooks, Sage), payroll"),
            ("Rev. Potential", "$3,588–$8,388 ARR/property; portfolio tier significantly higher"),
            ("Upsell", "Custom reporting API, benchmarking data subscription, board-level report generation"),
        ],
        "risks": [
            "Integration complexity is high — connecting 4–6 data sources per property is engineering-heavy",
            "Established players: Duetto, M3 Accounting — but none serve independents affordably",
            "Data standardization across different PMS formats requires significant ETL work",
        ],
    },

    # ════════════════════════════════════════════════════════════════════════
    # TIER 3 — WATCH LIST
    # ════════════════════════════════════════════════════════════════════════
    {
        "rank": 8,
        "tier_num": 3,
        "tier": "3",
        "name": "AI Cybersecurity Anomaly Detection for Hotels",
        "tagline": "Purpose-built threat detection for the unique attack surface of hospitality networks",
        "viability": "★★★☆☆",
        "speed": "12–18 months",
        "founder_fit": "★★★★☆",
        "thesis": (
            "Hotels are among the most-breached industry verticals globally — PCI scope, guest Wi-Fi "
            "attack surfaces, PMS credential theft, and property management backdoors make them "
            "attractive targets. Yet independent Canadian hotels have no hospitality-specific security "
            "monitoring. Generic tools like Darktrace or SentinelOne are enterprise-priced and "
            "require security expertise to interpret. A hotel-specific AI anomaly detection layer "
            "that understands normal hospitality traffic patterns (PMS sync, POS activity, guest Wi-Fi "
            "patterns) and flags deviations without requiring a CISO to interpret results is a "
            "clear gap — especially as Canadian privacy regulations tighten."
        ),
        "why_watch": (
            "The opportunity is real but the sales motion is hard. Hotel GMs don't buy security "
            "proactively — they buy it after an incident. The better near-term play is bundling "
            "a cybersecurity module inside a broader hotel IT platform (e.g., the IT helpdesk "
            "automation tool at rank 10) rather than selling it standalone. Market maturity is "
            "18–24 months away for standalone viability at this segment."
        ),
        "timing": (
            "Watch for: Canadian hotels being named in PCI breach settlements, PIPEDA enforcement "
            "actions against hotel chains, or a major Canadian hotel group breach that drives "
            "industry-wide demand. That event will compress the sales cycle dramatically."
        ),
    },

    {
        "rank": 9,
        "tier_num": 3,
        "tier": "3",
        "name": "AI Energy Optimization & Sustainability Intelligence",
        "tagline": "Reduce hotel energy spend 15–25% while meeting Canada's tightening sustainability mandates",
        "viability": "★★★☆☆",
        "speed": "12–24 months",
        "founder_fit": "★★★☆☆",
        "thesis": (
            "Hotels are energy-intensive — HVAC, hot water, lighting, and kitchen systems account "
            "for CAD $200,000–$400,000/year in a 100-room Canadian property. Canada's federal "
            "carbon tax stands at $65/tonne CO2 in 2024, rising to $170/tonne by 2030 — a direct "
            "operating cost increase of $30,000–$80,000/year for a mid-size property. NRCan's "
            "ENERGY STAR for Hotels and HAC's Green Key program provide frameworks but no AI "
            "tooling. Canadian startups Parity (Toronto) and Switch Automation (Edmonton) have "
            "positioned in commercial buildings but haven't penetrated the independent hotel "
            "segment. Ontario's Time-of-Use pricing and BC Hydro/Hydro-Quebec demand response "
            "programs offer cash rebates for load-shifting that AI can automate. Ecobee (Toronto) "
            "offers commercial thermostats — a potential hardware partnership."
        ),
        "why_watch": (
            "Hardware dependency is the main blocker — energy AI requires BAS (Building Automation "
            "System) integration that most independent Canadian hotels don't have. HVAC in older "
            "Atlantic Canada and rural Ontario properties may predate digital controls entirely. "
            "Sales cycles are 6–18 months, selling to property owners not GMs. Best launched as "
            "a module add-on to the predictive maintenance platform (#2) after hardware trust "
            "is established, not as a standalone product."
        ),
        "timing": (
            "Watch for: federal carbon tax step-up to $80/tonne (2025) and $95/tonne (2026), "
            "provincial mandatory energy reporting for commercial buildings (BC and Ontario leading), "
            "NRCan ENERGY STAR rebate programs expanding to hotels, and Ecobee or similar "
            "launching a hotel-specific commercial offering that creates a distribution channel."
        ),
    },

    {
        "rank": 10,
        "tier_num": 3,
        "tier": "3",
        "name": "AI IT Helpdesk & Support Automation for Hotels",
        "tagline": "Replace the external IT MSP model with an AI-first hotel tech support layer",
        "viability": "★★★☆☆",
        "speed": "9–15 months",
        "founder_fit": "★★★★★",
        "thesis": (
            "Independent hotels pay CAD $500–$2,000/month to MSPs for IT support — and still wait "
            "4–8 hours for a Cloudbeds or WebRezPro outage response. An AI helpdesk that knows "
            "the hotel's tech stack (PMS, channel manager, POS, Wi-Fi, door locks), auto-resolves "
            "common issues (PMS login reset, printer restart, TV system reboot, Wi-Fi auth fix), "
            "and escalates with full context to a human tech is a compelling MSP replacement. "
            "The founder's hotel IT background is the most credible pitch imaginable: "
            "'I used to be the person you'd call at 3am. Here's the product I wish existed.'"
        ),
        "why_watch": (
            "The standalone IT helpdesk market is moderately crowded (Freshdesk, Zendesk, "
            "ServiceNow) and doesn't command premium SaaS pricing on its own for this segment. "
            "The strongest play is bundling this as a 'hotel tech ops' platform alongside "
            "predictive maintenance and the SOP copilot — creating a 'Hotel IT-in-a-box' "
            "offering that displaces the MSP relationship entirely."
        ),
        "timing": (
            "Watch for: MSP pricing increases (currently happening due to technician shortages), "
            "PMS vendor consolidation reducing integration complexity, and AI agents becoming "
            "capable enough to handle Tier 2 hotel IT issues autonomously (12–18 month horizon)."
        ),
    },
]

# ── Scorecard data ─────────────────────────────────────────────────────────────
SCORECARD_DATA = [
    {"rank": 1, "name": "AI Guest Communication & Multilingual Concierge", "tier": "1",
     "viability": "★★★★★", "speed": "3–6 months", "founder_fit": "★★★★★"},
    {"rank": 2, "name": "Predictive Maintenance & AI Ticket Prioritization", "tier": "1",
     "viability": "★★★★★", "speed": "3–5 months", "founder_fit": "★★★★★"},
    {"rank": 3, "name": "AI Staff SOP Copilot & Productivity Layer", "tier": "1",
     "viability": "★★★★☆", "speed": "2–4 months", "founder_fit": "★★★★★"},
    {"rank": 4, "name": "Revenue & Dynamic Pricing Intelligence", "tier": "2",
     "viability": "★★★★☆", "speed": "6–9 months", "founder_fit": "★★★★☆"},
    {"rank": 5, "name": "AI Housekeeping Optimization Engine", "tier": "2",
     "viability": "★★★★☆", "speed": "6–9 months", "founder_fit": "★★★★☆"},
    {"rank": 6, "name": "AI Review Intelligence & Reputation Management", "tier": "2",
     "viability": "★★★★☆", "speed": "4–7 months", "founder_fit": "★★★☆☆"},
    {"rank": 7, "name": "Hotel Performance Copilot & GM Dashboard", "tier": "2",
     "viability": "★★★★☆", "speed": "5–8 months", "founder_fit": "★★★★★"},
    {"rank": 8, "name": "AI Cybersecurity Anomaly Detection", "tier": "3",
     "viability": "★★★☆☆", "speed": "12–18 months", "founder_fit": "★★★★☆"},
    {"rank": 9, "name": "AI Energy Optimization & Sustainability", "tier": "3",
     "viability": "★★★☆☆", "speed": "12–24 months", "founder_fit": "★★★☆☆"},
    {"rank": 10, "name": "AI IT Helpdesk & Support Automation", "tier": "3",
     "viability": "★★★☆☆", "speed": "9–15 months", "founder_fit": "★★★★★"},
]


# ── Main Build Function ────────────────────────────────────────────────────────
def build_report(output_path):
    styles = make_styles()
    doc = SimpleDocTemplate(
        output_path,
        pagesize=letter,
        leftMargin=0.7*inch,
        rightMargin=0.7*inch,
        topMargin=0.65*inch,
        bottomMargin=0.55*inch,
        title="AI Hospitality Startup Opportunities — Canada 2026",
        author="Hotel IT & AI Strategy Research",
        subject="Market Intelligence Report",
    )

    story = []

    # ── Cover ─────────────────────────────────────────────────────────────────
    story += build_cover(styles)

    # ── Table of Contents ─────────────────────────────────────────────────────
    story += section_header("Table of Contents", styles)
    toc_items = [
        ("Section 1", "Executive Summary & Investment Thesis"),
        ("Section 2", "Canadian Hospitality Market Context"),
        ("Section 3", "Top 10 Opportunity Scorecard"),
        ("Section 4", "TIER 1 — Launch Now (Opportunities #1–3)"),
        ("  #1", "AI Guest Communication & Multilingual Concierge"),
        ("  #2", "Predictive Maintenance & AI Ticket Prioritization"),
        ("  #3", "AI Staff SOP Copilot & Productivity Layer"),
        ("Section 5", "TIER 2 — Build in 12–18 Months (Opportunities #4–7)"),
        ("  #4", "Revenue & Dynamic Pricing Intelligence"),
        ("  #5", "AI Housekeeping Optimization Engine"),
        ("  #6", "AI Review Intelligence & Reputation Management"),
        ("  #7", "Hotel Performance Copilot & GM Dashboard"),
        ("Section 6", "TIER 3 — Watch List (Opportunities #8–10)"),
        ("Section 7", "Founder Playbook: Validation & Go-to-Market"),
        ("Section 8", "AI Readiness by Hotel Function"),
    ]
    for num, title in toc_items:
        is_section = num.startswith("Section")
        style = styles["toc_section"] if is_section else styles["toc_entry"]
        indent = 0 if is_section else 0.3*inch
        story.append(Paragraph(
            f'<font color="#C9A84C"><b>{num}</b></font>&nbsp;&nbsp;&nbsp;{title}',
            ParagraphStyle("toc_i", parent=style, leftIndent=indent)
        ))
    story.append(PageBreak())

    # ── Section 1: Executive Summary ──────────────────────────────────────────
    story += section_header("Executive Summary & Investment Thesis", styles, "01")
    story.append(Paragraph(
        "Canada's independent hotel sector is entering a critical inflection point. With over 8,400 "
        "independent properties — representing roughly 60% of all Canadian hotel rooms — operating "
        "with legacy technology, structural labor shortages, and rising guest expectations, the "
        "conditions for AI disruption are more favorable than at any prior point in the industry's history.",
        styles["body"]
    ))
    story.append(Spacer(1, 6))
    story.append(Paragraph(
        "This report identifies and ranks the top 10 AI-driven startup opportunities specifically "
        "scoped for Canadian independents, boutique properties, and small hotel groups — the segment "
        "that enterprise hospitality technology companies systematically underserve. Each opportunity "
        "has been evaluated through the lens of a founder with hotel IT leadership experience: "
        "the most powerful unfair advantage in this market.",
        styles["body"]
    ))
    story.append(Spacer(1, 10))

    # Core thesis callout
    thesis_data = [[Paragraph(
        "<b>The Core Thesis:</b> Canadian independent hotels are running 2010-era technology "
        "stacks in a 2026 labor and guest-experience environment. Enterprise AI tools exist for "
        "Marriott and Hilton. Nothing purpose-built exists for the ~3,200 independent Canadian "
        "properties — and most US tools fail on Quebec Law 25 compliance, CAD billing, and "
        "French-language requirements. The founder who builds affordable AI layers on top of "
        "Cloudbeds, WebRezPro, and Maestro — the systems these hotels already use — and who "
        "walks into a GM's office with hotel operations credibility — has a 3–5 year head "
        "start on any VC-backed competitor who has never worked a hotel night shift.",
        styles["highlight_box"]
    )]]
    thesis_t = Table(thesis_data, colWidths=[PAGE_W - 1.4*inch])
    thesis_t.setStyle(TableStyle([
        ("BACKGROUND", (0,0), (-1,-1), TIER1_BG),
        ("BOX", (0,0), (-1,-1), 2, GOLD),
        ("LEFTPADDING", (0,0), (-1,-1), 14),
        ("RIGHTPADDING", (0,0), (-1,-1), 14),
        ("TOPPADDING", (0,0), (-1,-1), 12),
        ("BOTTOMPADDING", (0,0), (-1,-1), 12),
    ]))
    story.append(thesis_t)
    story.append(Spacer(1, 12))

    story.append(Paragraph("Three Strategic Pillars", styles["h2"]))
    pillars = [
        ("Labor Replacement & Augmentation",
         "With 73% annual turnover and minimum wage increases of 18% since 2022, hotels are "
         "desperate for technology that does more with fewer people. AI guest communication, "
         "SOP copilots, and housekeeping optimization directly address this pain."),
        ("Operational Intelligence Gap",
         "Independent hotels generate enormous amounts of data across their PMS, channel "
         "manager, maintenance logs, and reviews — but lack any system to synthesize it. "
         "AI dashboards and performance copilots turn this data into daily decisions."),
        ("Service Consistency at Scale",
         "Branded chains win on consistency. AI can give independents the same SOPs, "
         "training infrastructure, and guest communication quality as a 5,000-property brand — "
         "without losing their boutique character."),
    ]
    for title, desc in pillars:
        story.append(Paragraph(f"<b>{title}</b>", styles["h3"]))
        story.append(Paragraph(desc, styles["body"]))

    story.append(PageBreak())

    # ── Section 2: Market Context ──────────────────────────────────────────────
    story += section_header("Canadian Hospitality Market Context", styles, "02")

    story.append(Paragraph("Market Scale & Structure", styles["h2"]))
    story.append(stat_table([
        ("Canadian Hotels (Total)", "~9,000"),
        ("Independent Properties", "~3,200 (35%)"),
        ("Hotel Rooms (Canada)", "~440,000"),
        ("Annual Revenue (2025E)", "CAD $22–24B"),
    ], styles))
    story.append(Spacer(1, 10))

    story.append(Paragraph(
        "Canada's hotel industry is structurally different from the United States. Independent and "
        "non-branded properties represent approximately 35% of all Canadian hotels — roughly 3,200 "
        "properties — concentrated in BC resort markets, Quebec's auberge/boutique sector, Ontario "
        "cottage country, and Atlantic Canada. Many operate as family businesses with 20–80 rooms, "
        "without dedicated IT staff, revenue managers, or technology budgets. These characteristics "
        "make the market deeply underserved by enterprise solutions — and perfectly suited for "
        "affordable, lightweight SaaS built by someone who understands the operations from the inside.",
        styles["body"]
    ))

    story.append(Paragraph("Key Market Drivers in 2026", styles["h2"]))
    drivers = [
        ("Labor Crisis", "Canadian hospitality reported 73% average turnover in 2024–2025. "
         "Open positions averaged 47 days to fill. Minimum wage increases have compressed "
         "margins by 8–12% since 2022. Labor is the #1 pain point cited by independent GMs."),
        ("Technology Debt", "Most independent Canadian hotels use fragmented, often aging PMS systems. "
         "The dominant platforms for independents are Cloudbeds (US, cloud-native, largest global "
         "independent PMS), WebRezPro (Canadian, Calgary-based, most prominent CA-built cloud PMS "
         "with HST/GST and bilingual compliance), Maestro PMS (Canadian, Markham ON, mid-market "
         "resorts), and Little Hotelier (Australian, very small properties). Most have limited open "
         "APIs, zero AI capability, and no data warehouse. The typical independent hotel manages "
         "operations via PMS exports, WhatsApp group chats, and paper binders."),
        ("OTA Dependency", "Independent hotels pay 15–25% commission to OTAs (Booking.com, Expedia) "
         "on the majority of their bookings. Direct booking rate averages 22–28% vs. 40%+ for "
         "branded chains. AI-driven guest communication and direct booking tools directly address "
         "this margin leak."),
        ("Guest Expectation Gap", "Post-COVID travelers expect instant responses, mobile-first "
         "service, and personalized experiences. Independent hotels, understaffed and under-tooled, "
         "are failing to meet this standard — and the reviews are showing it."),
        ("Canadian AI Readiness", "Canada's federal AI strategy (Pan-Canadian AI Strategy, $2.4B "
         "investment) and world-class AI research ecosystem (Toronto, Montreal, Waterloo) create a "
         "favorable environment for AI startups. SR&ED tax credits reduce R&D costs by 35–65%. "
         "Quebec Law 25 (Bill 64) — stricter than PIPEDA — creates a strong Canadian regulatory moat: "
         "US-built competitors routinely fail its data residency and consent requirements, creating "
         "a defensible advantage for a CA-built solution. Carbon pricing rising to $170/tonne by 2030 "
         "also accelerates energy AI adoption."),
    ]
    for title, desc in drivers:
        story.append(Paragraph(f"<b>{title}</b>", styles["h3"]))
        story.append(Paragraph(desc, styles["body"]))

    story.append(PageBreak())

    # ── Section 3: Scorecard ───────────────────────────────────────────────────
    story += section_header("Top 10 Opportunity Scorecard", styles, "03")
    story.append(Paragraph(
        "Summary ranking of all 10 AI hospitality startup opportunities, evaluated on commercial "
        "viability, speed to first revenue, and founder fit for a hotel IT background.",
        styles["body"]
    ))
    story.append(Spacer(1, 8))
    story.append(scorecard_row(SCORECARD_DATA, styles))
    story.append(Spacer(1, 12))

    # Tier legend
    legend_data = [[
        Paragraph("<b>TIER 1 — Launch Now</b>: Clear problem, proven market, lightweight AI layer possible today. "
                  "First revenue achievable in 3–6 months.", styles["body_left"]),
        Paragraph("<b>TIER 2 — Build in 12–18 Months</b>: Strong opportunity but requires deeper "
                  "integration work, additional market education, or a longer sales cycle.", styles["body_left"]),
        Paragraph("<b>TIER 3 — Watch List</b>: Structurally valid opportunity but timing, "
                  "hardware dependency, or sales motion creates a 1–2 year delay to viability.", styles["body_left"]),
    ]]
    legend_t = Table(legend_data, colWidths=[(PAGE_W - 1.4*inch)/3]*3)
    legend_t.setStyle(TableStyle([
        ("BACKGROUND", (0,0), (0,0), TIER1_BG),
        ("BACKGROUND", (1,0), (1,0), TIER2_BG),
        ("BACKGROUND", (2,0), (2,0), TIER3_BG),
        ("BOX", (0,0), (-1,-1), 0.5, SLATE),
        ("INNERGRID", (0,0), (-1,-1), 0.3, HexColor("#C5D5E0")),
        ("VALIGN", (0,0), (-1,-1), "TOP"),
        ("TOPPADDING", (0,0), (-1,-1), 8),
        ("BOTTOMPADDING", (0,0), (-1,-1), 8),
        ("LEFTPADDING", (0,0), (-1,-1), 8),
        ("RIGHTPADDING", (0,0), (-1,-1), 8),
    ]))
    story.append(legend_t)
    story.append(PageBreak())

    # ── Section 4: Tier 1 ─────────────────────────────────────────────────────
    story += section_header("TIER 1 — Launch Now", styles, "04")
    story.append(Paragraph(
        "These three opportunities are commercially viable today. The AI technology is mature "
        "enough, the integration paths are well-understood, and the customer pain is acute enough "
        "that a determined founder with hotel IT experience can reach first revenue in under "
        "6 months. Each can be launched as a lightweight SaaS layer on top of existing hotel systems "
        "with minimal upfront engineering.",
        styles["body"]
    ))
    story.append(Spacer(1, 8))

    tier1_opps = [o for o in OPPORTUNITIES if o["tier_num"] == 1]
    for opp in tier1_opps:
        story += build_opportunity_full(opp, opp["rank"], styles)
        story.append(PageBreak())

    # ── Section 5: Tier 2 ─────────────────────────────────────────────────────
    story += section_header("TIER 2 — Build in 12–18 Months", styles, "05")
    story.append(Paragraph(
        "These four opportunities require deeper integration work, longer sales cycles, or "
        "additional market education before reaching commercial velocity. They are strong "
        "long-term bets and natural expansion moves from Tier 1 products — building from an "
        "existing customer base rather than starting cold.",
        styles["body"]
    ))
    story.append(Spacer(1, 8))

    tier2_opps = [o for o in OPPORTUNITIES if o["tier_num"] == 2]
    for opp in tier2_opps:
        story += build_opportunity_standard(opp, opp["rank"], styles)

    story.append(PageBreak())

    # ── Section 6: Tier 3 ─────────────────────────────────────────────────────
    story += section_header("TIER 3 — Watch List", styles, "06")
    story.append(Paragraph(
        "Structurally valid opportunities that are 1–2 years from commercial viability as "
        "standalone products. Monitor the market signals noted in each entry. Best pursued "
        "as module add-ons to an existing platform rather than standalone startups.",
        styles["body"]
    ))
    story.append(Spacer(1, 8))

    tier3_opps = [o for o in OPPORTUNITIES if o["tier_num"] == 3]
    for opp in tier3_opps:
        story += build_opportunity_brief(opp, opp["rank"], styles)

    story.append(PageBreak())

    # ── Section 7: Founder Playbook ────────────────────────────────────────────
    story += section_header("Founder Playbook: Validation & Go-to-Market", styles, "07")

    story.append(Paragraph("Which Opportunity to Start With", styles["h2"]))
    story.append(Paragraph(
        "If launching from zero with hotel IT experience, <b>Opportunity #1 (AI Guest Communication "
        "& Multilingual Concierge)</b> is the strongest first product. It has the shortest path "
        "to revenue, the clearest guest-facing ROI, and the lowest technical risk. "
        "It also creates the data relationships (PMS access, guest data flows) that every "
        "subsequent product will need.",
        styles["body"]
    ))
    story.append(Spacer(1, 6))
    story.append(Paragraph(
        "The long-term moat is a <b>hotel operating system</b>: start with guest communication, "
        "add the SOP copilot (same buyers, different pain), then layer in the performance "
        "dashboard and maintenance prediction. Each product deepens the data integration and "
        "increases switching costs. The end state is a platform that replaces 4–6 point solutions "
        "a hotel currently pays for separately.",
        styles["body"]
    ))
    story.append(Spacer(1, 8))

    story.append(Paragraph("90-Day Validation Plan", styles["h2"]))
    steps = [
        ("Days 1–14", "Conduct 20 discovery interviews with GMs of independent hotels in Toronto, "
         "Vancouver, and Montreal. Validate the top 3 pain points. Confirm willingness to pay "
         "and current spend on related tools."),
        ("Days 15–30", "Build a no-code prototype using existing LLM APIs (Claude/GPT-4) + "
         "Cloudbeds or Mews sandbox. Demonstrate multilingual guest chat with live PMS lookup. "
         "Not production-ready — validation-ready."),
        ("Days 31–60", "Land 3 unpaid pilots at properties where you have direct relationships. "
         "Run the prototype in live hotel environments. Collect data on resolution rate, "
         "staff time saved, and guest response rate."),
        ("Days 61–90", "Convert 2 of 3 pilots to paid ($299/month). Use case studies to approach "
         "hotel associations (TIAO, Tourism Industry Association of BC) for member introductions. "
         "Apply for SR&ED tax credit and any available provincial tech grants."),
    ]
    for period, desc in steps:
        story.append(Paragraph(f"<b>{period}</b>", styles["h3"]))
        story.append(Paragraph(desc, styles["body"]))

    story.append(Spacer(1, 8))
    story.append(Paragraph("Key Distribution Channels in Canada", styles["h2"]))
    channels = [
        "Hotel Associations: TIAO (Ontario), BCHA (BC), HAC (national), Restaurants Canada — membership access and trade shows",
        "PMS Vendor Partnerships: Cloudbeds Marketplace, WebRezPro integrations page, Mews App Store — critical for discovery by target customers",
        "Canadian-Built Leverage: WebRezPro (Calgary) and Maestro (Markham) are Canadian companies — partnership conversations are easier, PIPEDA/Law 25 compliance is a shared value",
        "Hotel Management Companies: firms managing 5–30 independent Canadian properties are ideal POCs — one sale = multiple properties",
        "Tourism Industry Association of Canada (TIAC) + provincial bodies — grant programs, buyer introductions, policy influence",
        "Direct LinkedIn outreach: target GMs, DOOs, and owners of 40–200 room independents in Toronto, Vancouver, Montreal, Calgary",
    ]
    for ch in channels:
        story.append(Paragraph(f"• {ch}", styles["bullet"]))

    story.append(Spacer(1, 8))
    story.append(Paragraph("Canadian Funding & Support Ecosystem", styles["h2"]))
    funding = [
        ("SR&ED Tax Credit", "35–65% refundable tax credit on qualifying R&D expenses — significant for AI product development"),
        ("IRAP (NRC)", "Industrial Research Assistance Program — up to $50K–$500K in non-dilutive R&D funding"),
        ("BDC Venture Capital", "BDC has active hospitality tech interest — Canadian-first mandate aligns well"),
        ("MaRS / Communitech", "Toronto and Waterloo accelerators with hospitality and SaaS cohorts"),
        ("CDAP", "Canada Digital Adoption Program — subsidizes tech adoption for SMBs, potential channel for hotel customers"),
    ]
    story.append(biz_model_table(funding, styles))

    story.append(PageBreak())

    # ── Section 8: AI Readiness by Function ───────────────────────────────────
    story += section_header("AI Readiness by Hotel Function", styles, "08")
    story.append(Paragraph(
        "Not all hotel departments are equally ready to adopt AI. This assessment reflects "
        "the current state of Canadian independent hotels in early 2026 — based on technology "
        "infrastructure, staff digital literacy, data availability, and organizational appetite.",
        styles["body"]
    ))
    story.append(Spacer(1, 10))

    readiness_headers = [
        Paragraph(h, styles["table_header"])
        for h in ["Hotel Function", "AI Readiness", "Key Blocker", "Best First AI Use Case"]
    ]
    readiness_rows = [readiness_headers] + [
        [
            Paragraph(f, ParagraphStyle("rf", fontName="Helvetica-Bold", fontSize=9,
                      textColor=DARK_GRAY, leading=12)),
            Paragraph(r, ParagraphStyle("rr", fontName="Helvetica-Bold", fontSize=9,
                      textColor=GREEN if "High" in r else (GOLD if "Medium" in r else RED_SOFT),
                      leading=12)),
            Paragraph(b, styles["table_cell"]),
            Paragraph(u, styles["table_cell"]),
        ]
        for f, r, b, u in [
            ("Front Desk / Guest Services", "HIGH", "PMS API limitations",
             "Multilingual guest chat + pre-arrival automation"),
            ("Housekeeping", "HIGH", "Change management / staff adoption",
             "AI room assignment + checkout prediction"),
            ("Maintenance / Engineering", "MEDIUM-HIGH", "Lack of structured ticket data",
             "Ticket prioritization layer on existing CMMS"),
            ("Revenue Management", "MEDIUM-HIGH", "Low data literacy among GMs",
             "Daily rate recommendation email with one-click apply"),
            ("Food & Beverage", "MEDIUM", "Complex menu/inventory data",
             "AI-assisted upsell at reservation booking step"),
            ("Human Resources / Training", "MEDIUM", "Resistance to digital onboarding",
             "SOP copilot for new hire onboarding acceleration"),
            ("Sales & Marketing", "MEDIUM", "Fragmented CRM data",
             "Review response automation + reputation tracking"),
            ("Finance / Accounting", "LOW-MEDIUM", "Manual processes, legacy systems",
             "AI variance explanation in night audit reports"),
            ("IT Operations", "LOW", "Minimal in-house IT staff",
             "AI helpdesk for common issue resolution"),
            ("Security / Compliance", "LOW", "No security awareness culture",
             "PCI anomaly alerting as part of broader platform"),
        ]
    ]
    readiness_t = Table(readiness_rows, colWidths=[1.7*inch, 1.0*inch, 1.5*inch, 2.55*inch])
    readiness_t.setStyle(TableStyle([
        ("BACKGROUND", (0,0), (-1,0), NAVY),
        ("ROWBACKGROUNDS", (0,1), (-1,-1), [colors.white, LIGHT_BLUE]),
        ("BOX", (0,0), (-1,-1), 0.5, SLATE),
        ("INNERGRID", (0,0), (-1,-1), 0.3, HexColor("#D1DCE3")),
        ("VALIGN", (0,0), (-1,-1), "TOP"),
        ("TOPPADDING", (0,0), (-1,-1), 6),
        ("BOTTOMPADDING", (0,0), (-1,-1), 6),
        ("LEFTPADDING", (0,0), (-1,-1), 6),
        ("RIGHTPADDING", (0,0), (-1,-1), 6),
    ]))
    story.append(readiness_t)
    story.append(Spacer(1, 12))

    # Practical vs. Hype assessment
    story.append(Paragraph("Practical Today vs. Hype in Hospitality AI", styles["h2"]))
    story.append(Paragraph(
        "The following assessment separates AI capabilities that are genuinely deployable in "
        "Canadian independent hotels today from those that remain 2–4 years from practical adoption.",
        styles["body"]
    ))
    story.append(Spacer(1, 6))

    hype_rows = [[
        Paragraph("PRACTICAL TODAY", ParagraphStyle("pt", fontName="Helvetica-Bold",
                  fontSize=10, textColor=GREEN, alignment=TA_CENTER)),
        Paragraph("HYPE / NOT YET READY", ParagraphStyle("hn", fontName="Helvetica-Bold",
                  fontSize=10, textColor=RED_SOFT, alignment=TA_CENTER)),
    ]] + [
        [Paragraph(f"✓ {p}", ParagraphStyle("pp", fontName="Helvetica", fontSize=9,
                   textColor=GREEN, leading=13)),
         Paragraph(f"✗ {h}", ParagraphStyle("hp", fontName="Helvetica", fontSize=9,
                   textColor=RED_SOFT, leading=13))]
        for p, h in [
            ("Multilingual guest chat (LLM-based)", "Fully autonomous AI front desk agent"),
            ("Review response drafting & sentiment analysis", "AI replacing the GM role"),
            ("Ticket prioritization from text logs", "Real-time voice AI at check-in"),
            ("Dynamic pricing recommendations with one-click apply", "AI that negotiates with OTAs autonomously"),
            ("SOP Q&A via RAG on hotel documents", "AI that manages hotel P&L independently"),
            ("Housekeeping assignment optimization", "Robot housekeeping (10+ years out)"),
            ("Maintenance anomaly detection (with data)", "Full predictive maintenance without IoT sensors"),
            ("Energy setpoint optimization (with BAS)", "AI guest avatars and holographic concierge"),
        ]
    ]
    hype_t = Table(hype_rows, colWidths=[(PAGE_W - 1.4*inch) * 0.5] * 2)
    hype_t.setStyle(TableStyle([
        ("BACKGROUND", (0,0), (0,0), HexColor("#E8F5EE")),
        ("BACKGROUND", (1,0), (1,0), HexColor("#FBE8E8")),
        ("ROWBACKGROUNDS", (0,1), (-1,-1), [colors.white, HexColor("#F8F8F8")]),
        ("BOX", (0,0), (-1,-1), 0.5, SLATE),
        ("INNERGRID", (0,0), (-1,-1), 0.3, HexColor("#E0E0E0")),
        ("VALIGN", (0,0), (-1,-1), "TOP"),
        ("TOPPADDING", (0,0), (-1,-1), 6),
        ("BOTTOMPADDING", (0,0), (-1,-1), 6),
        ("LEFTPADDING", (0,0), (-1,-1), 8),
        ("RIGHTPADDING", (0,0), (-1,-1), 8),
    ]))
    story.append(hype_t)
    story.append(Spacer(1, 12))

    # Closing statement
    closing_data = [[Paragraph(
        "<b>Final Recommendation:</b> The single highest-ROI action for a founder with hotel IT "
        "experience in Canada in 2026 is to build a lightweight, multilingual AI guest communication "
        "layer that sits on top of Cloudbeds or Mews, price it at $299–$499/month, and land 10 "
        "paying independent hotels in the first 6 months. From that beachhead — with real PMS "
        "integrations, real guest data, and real hotel relationships — every other opportunity "
        "on this list becomes a natural expansion. The founder who gets there first will not "
        "easily be displaced by a VC-backed team that has never worked a hotel night shift.",
        styles["highlight_box"]
    )]]
    closing_t = Table(closing_data, colWidths=[PAGE_W - 1.4*inch])
    closing_t.setStyle(TableStyle([
        ("BACKGROUND", (0,0), (-1,-1), NAVY),
        ("BOX", (0,0), (-1,-1), 2, GOLD),
        ("LEFTPADDING", (0,0), (-1,-1), 14),
        ("RIGHTPADDING", (0,0), (-1,-1), 14),
        ("TOPPADDING", (0,0), (-1,-1), 14),
        ("BOTTOMPADDING", (0,0), (-1,-1), 14),
    ]))
    # Override text color for dark background
    closing_data2 = [[Paragraph(
        "<b>Final Recommendation:</b> The single highest-ROI action for a founder with hotel IT "
        "experience in Canada in 2026 is to build a lightweight, multilingual AI guest communication "
        "layer that sits on top of Cloudbeds or Mews, price it at $299–$499/month, and land 10 "
        "paying independent hotels in the first 6 months. From that beachhead — with real PMS "
        "integrations, real guest data, and real hotel relationships — every other opportunity "
        "on this list becomes a natural expansion. The founder who gets there first will not "
        "easily be displaced by a VC-backed team that has never worked a hotel night shift.",
        ParagraphStyle("closing", fontName="Helvetica", fontSize=10, textColor=colors.white,
                       leading=16, leftIndent=0, rightIndent=0)
    )]]
    closing_t2 = Table(closing_data2, colWidths=[PAGE_W - 1.4*inch])
    closing_t2.setStyle(TableStyle([
        ("BACKGROUND", (0,0), (-1,-1), NAVY),
        ("BOX", (0,0), (-1,-1), 2, GOLD),
        ("LEFTPADDING", (0,0), (-1,-1), 14),
        ("RIGHTPADDING", (0,0), (-1,-1), 14),
        ("TOPPADDING", (0,0), (-1,-1), 14),
        ("BOTTOMPADDING", (0,0), (-1,-1), 14),
    ]))
    story.append(closing_t2)

    # ── Build ─────────────────────────────────────────────────────────────────
    doc.build(story, onFirstPage=on_first_page, onLaterPages=on_page)
    print(f"Report generated: {output_path}")


if __name__ == "__main__":
    out = os.path.join(
        os.path.dirname(os.path.abspath(__file__)),
        "AI_Hospitality_Startup_Opportunities_Canada_2026.pdf"
    )
    build_report(out)
