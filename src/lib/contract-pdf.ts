import jsPDF from "jspdf";

interface ContractAnalysis {
  contract_type: string;
  parties: { name: string; role: string }[];
  key_dates: { label: string; value: string }[];
  clauses: { clause_type: string; summary: string; risk_level: string; risk_reason: string; location?: string }[];
  missing_clauses: { clause_type: string; importance: string; explanation: string }[];
  red_flags: { title: string; description: string; severity: string }[];
  negotiation_points: { point: string; suggestion: string; priority: string }[];
  executive_summary: string;
  risk_score: number;
  addons?: {
    verification?: { confidence_score: number; verification_summary: string; corrections: any[]; missed_risks: any[] };
    redlines?: { redlines: { original_text: string; suggested_text: string; reason: string; priority: string }[] };
    exec_brief?: { one_liner: string; recommendation: string; top_3_concerns: string[]; financial_exposure: string; timeline_pressure: string; action_items: string[] };
    compliance?: { applicable_regulations: { regulation: string; status: string; findings: string }[]; compliance_score: number; critical_gaps: string[] };
    playbook?: { clause_ratings: { clause_type: string; language_quality: string; recommendation: string }[]; overall_grade: string };
    deep_research?: {
      legal_framework: { governing_jurisdictions: string[]; applicable_statutes: { statute: string; section?: string; relevance: string }[]; regulatory_bodies?: string[] };
      case_law_analysis: { clause_type: string; case_name: string; citation?: string; holding: string; relevance_to_contract: string; risk_implication: string }[];
      enforceability_assessment: { clause_type: string; enforceability: string; legal_basis: string; key_factors: string[] }[];
      liability_exposure: { risk_area: string; exposure_level: string; estimated_range: string; mitigating_factors?: string[]; aggravating_factors?: string[] }[];
      jurisdiction_risks?: { jurisdiction: string; specific_risk: string; mandatory_provision?: string; consequence_if_missing?: string }[];
      regulatory_landscape?: { current_regulations: { regulation: string; impact: string; compliance_status?: string }[]; pending_legislation?: { legislation: string; potential_impact: string; expected_timeline?: string }[] };
      strategic_recommendations: { area: string; recommendation: string; legal_basis?: string; priority: string; suggested_language?: string }[];
      research_summary: string; overall_legal_risk_rating: string;
    };
    exit_strategy?: {
      overall_difficulty: string; estimated_cost_range: string; fastest_exit_timeline: string; exit_summary: string;
      exit_routes: { route_name: string; description: string; feasibility: string; estimated_cost: string; timeline: string; legal_basis: string; steps: string[]; risks: string[] }[];
      breach_analysis: { party: string; potential_breaches: string[]; evidence_needed: string; leverage_level: string }[];
      force_majeure_applicability: { applicable: boolean; qualifying_events: string[]; notice_requirements: string; analysis: string };
      negotiation_leverage: { leverage_point: string; strength: string; how_to_use: string; counterparty_motivation: string }[];
      mutual_termination_template: string;
      warning_risks: { risk: string; severity: string; mitigation: string }[];
    };
  };
}

const MARGIN = 20;
const PAGE_W = 210;
const CONTENT_W = PAGE_W - MARGIN * 2;

export function generateContractPdf(analysis: ContractAnalysis, creditsUsed: number) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  let y = MARGIN;

  const checkPage = (needed: number) => {
    if (y + needed > 280) { doc.addPage(); y = MARGIN; }
  };

  const heading = (text: string, size = 14) => {
    checkPage(12);
    doc.setFontSize(size).setFont("helvetica", "bold");
    doc.setTextColor(30, 64, 175);
    doc.text(text, MARGIN, y);
    y += size * 0.5 + 2;
    doc.setDrawColor(30, 64, 175);
    doc.line(MARGIN, y, PAGE_W - MARGIN, y);
    y += 4;
    doc.setTextColor(0, 0, 0);
  };

  const subHeading = (text: string) => {
    checkPage(8);
    doc.setFontSize(11).setFont("helvetica", "bold").setTextColor(50, 50, 50);
    doc.text(text, MARGIN, y);
    y += 6;
    doc.setTextColor(0, 0, 0);
  };

  const body = (text: string) => {
    doc.setFontSize(9).setFont("helvetica", "normal").setTextColor(60, 60, 60);
    const lines = doc.splitTextToSize(text, CONTENT_W);
    for (const line of lines) {
      checkPage(5);
      doc.text(line, MARGIN, y);
      y += 4;
    }
    y += 2;
    doc.setTextColor(0, 0, 0);
  };

  const labelValue = (label: string, value: string) => {
    checkPage(6);
    doc.setFontSize(9).setFont("helvetica", "bold");
    doc.text(`${label}: `, MARGIN, y);
    const lw = doc.getTextWidth(`${label}: `);
    doc.setFont("helvetica", "normal").setTextColor(60, 60, 60);
    const valLines = doc.splitTextToSize(value, CONTENT_W - lw);
    doc.text(valLines[0] || "", MARGIN + lw, y);
    y += 4;
    for (let i = 1; i < valLines.length; i++) {
      checkPage(5);
      doc.text(valLines[i], MARGIN, y);
      y += 4;
    }
    doc.setTextColor(0, 0, 0);
  };

  const bullet = (text: string, indent = 4) => {
    doc.setFontSize(9).setFont("helvetica", "normal").setTextColor(60, 60, 60);
    const lines = doc.splitTextToSize(text, CONTENT_W - indent);
    for (let i = 0; i < lines.length; i++) {
      checkPage(5);
      doc.text(i === 0 ? "•" : " ", MARGIN + indent - 4, y);
      doc.text(lines[i], MARGIN + indent, y);
      y += 4;
    }
    doc.setTextColor(0, 0, 0);
  };

  // ── Title page header ──
  doc.setFontSize(22).setFont("helvetica", "bold").setTextColor(30, 64, 175);
  doc.text("Contract Risk Analysis Report", MARGIN, y);
  y += 10;
  doc.setFontSize(10).setFont("helvetica", "normal").setTextColor(120, 120, 120);
  doc.text(`Generated: ${new Date().toLocaleDateString()} • Credits used: ${creditsUsed}`, MARGIN, y);
  y += 6;
  doc.setDrawColor(30, 64, 175).setLineWidth(0.5);
  doc.line(MARGIN, y, PAGE_W - MARGIN, y);
  y += 8;

  // Risk score
  const riskLabel = analysis.risk_score <= 25 ? "Low Risk" : analysis.risk_score <= 50 ? "Moderate Risk" : analysis.risk_score <= 75 ? "High Risk" : "Critical Risk";
  const riskColor: [number, number, number] = analysis.risk_score <= 25 ? [34, 197, 94] : analysis.risk_score <= 50 ? [234, 179, 8] : analysis.risk_score <= 75 ? [249, 115, 22] : [239, 68, 68];
  doc.setFontSize(36).setFont("helvetica", "bold").setTextColor(...riskColor);
  doc.text(`${analysis.risk_score}`, MARGIN, y + 2);
  const scoreW = doc.getTextWidth(`${analysis.risk_score}`);
  doc.setFontSize(12).setTextColor(100, 100, 100);
  doc.text(`/ 100 — ${riskLabel}`, MARGIN + scoreW + 2, y);
  y += 14;

  // Contract type + parties
  labelValue("Contract Type", analysis.contract_type);
  if (analysis.parties.length > 0) {
    labelValue("Parties", analysis.parties.map(p => `${p.name} (${p.role})`).join(", "));
  }
  if (analysis.key_dates.length > 0) {
    for (const d of analysis.key_dates) labelValue(d.label, d.value);
  }
  y += 4;

  // ── Executive Summary ──
  heading("Executive Summary");
  body(analysis.executive_summary);

  // ── Clauses ──
  heading("Clause Analysis");
  for (const c of analysis.clauses) {
    subHeading(`${c.clause_type.replace(/_/g, " ")} [${c.risk_level.toUpperCase()}]`);
    body(c.summary);
    if (c.risk_reason) { labelValue("Risk", c.risk_reason); }
    if (c.location) { labelValue("Location", c.location); }
    y += 2;
  }

  // ── Missing Clauses ──
  if (analysis.missing_clauses.length > 0) {
    heading("Missing Clauses");
    for (const m of analysis.missing_clauses) {
      subHeading(`${m.clause_type.replace(/_/g, " ")} [${m.importance.toUpperCase()}]`);
      body(m.explanation);
    }
  }

  // ── Red Flags ──
  if (analysis.red_flags.length > 0) {
    heading("Red Flags");
    for (const f of analysis.red_flags) {
      subHeading(`${f.title} [${f.severity.toUpperCase()}]`);
      body(f.description);
    }
  }

  // ── Negotiation Points ──
  if (analysis.negotiation_points.length > 0) {
    heading("Negotiation Points");
    for (const n of analysis.negotiation_points) {
      subHeading(`${n.point} [${n.priority.toUpperCase()}]`);
      body(n.suggestion);
    }
  }

  // ── Add-ons ──
  const addons = analysis.addons;

  if (addons?.exec_brief) {
    heading("Executive Brief");
    labelValue("Summary", addons.exec_brief.one_liner);
    labelValue("Recommendation", addons.exec_brief.recommendation);
    labelValue("Financial Exposure", addons.exec_brief.financial_exposure);
    labelValue("Timeline Pressure", addons.exec_brief.timeline_pressure);
    y += 2;
    subHeading("Top Concerns");
    for (const c of addons.exec_brief.top_3_concerns) bullet(c);
    y += 2;
    subHeading("Action Items");
    for (const a of addons.exec_brief.action_items) bullet(a);
  }

  if (addons?.redlines && addons.redlines.redlines.length > 0) {
    heading("Redline Suggestions");
    for (const r of addons.redlines.redlines) {
      subHeading(`[${r.priority.replace(/_/g, " ").toUpperCase()}] ${r.reason}`);
      labelValue("Original", r.original_text);
      labelValue("Suggested", r.suggested_text);
      y += 2;
    }
  }

  if (addons?.compliance) {
    heading("Compliance Check");
    labelValue("Compliance Score", `${addons.compliance.compliance_score}/100`);
    if (addons.compliance.critical_gaps.length > 0) {
      subHeading("Critical Gaps");
      for (const g of addons.compliance.critical_gaps) bullet(g);
    }
    y += 2;
    subHeading("Regulations");
    for (const r of addons.compliance.applicable_regulations) {
      labelValue(r.regulation, `${r.status} — ${r.findings}`);
    }
  }

  if (addons?.playbook) {
    heading("Playbook Comparison");
    labelValue("Overall Grade", addons.playbook.overall_grade);
    y += 2;
    for (const c of addons.playbook.clause_ratings) {
      subHeading(c.clause_type.replace(/_/g, " "));
      labelValue("Quality", c.language_quality);
      labelValue("Recommendation", c.recommendation);
      y += 2;
    }
  }

  if (addons?.verification) {
    heading("AI Verification");
    labelValue("Confidence Score", `${addons.verification.confidence_score}%`);
    body(addons.verification.verification_summary);
    if (addons.verification.corrections.length > 0) {
      subHeading("Corrections");
      for (const c of addons.verification.corrections) {
        bullet(`${c.original_finding} → ${c.correction}${c.severity_change ? ` (${c.severity_change})` : ""}`);
      }
    }
    if (addons.verification.missed_risks.length > 0) {
      subHeading("Missed Risks");
      for (const r of addons.verification.missed_risks) {
        bullet(`[${r.severity}] ${r.risk}: ${r.explanation}`);
      }
    }
  }

  if (addons?.deep_research) {
    const dr = addons.deep_research;
    heading("DEEP LEGAL RESEARCH REPORT", 16);
    labelValue("Overall Legal Risk Rating", dr.overall_legal_risk_rating.toUpperCase());
    y += 2;
    subHeading("Research Summary");
    body(dr.research_summary);

    // Legal Framework
    heading("Legal Framework");
    labelValue("Governing Jurisdictions", dr.legal_framework.governing_jurisdictions.join(", "));
    if (dr.legal_framework.regulatory_bodies?.length) {
      labelValue("Regulatory Bodies", dr.legal_framework.regulatory_bodies.join(", "));
    }
    y += 2;
    subHeading("Applicable Statutes");
    for (const s of dr.legal_framework.applicable_statutes) {
      bullet(`${s.statute}${s.section ? ` §${s.section}` : ""} — ${s.relevance}`);
    }

    // Case Law
    heading("Case Law & Precedent");
    for (const c of dr.case_law_analysis) {
      subHeading(`${c.case_name} [${c.risk_implication.toUpperCase()}]`);
      if (c.citation) labelValue("Citation", c.citation);
      labelValue("Clause", c.clause_type.replace(/_/g, " "));
      labelValue("Holding", c.holding);
      labelValue("Relevance", c.relevance_to_contract);
      y += 2;
    }

    // Enforceability
    heading("Enforceability Assessment");
    for (const e of dr.enforceability_assessment) {
      subHeading(`${e.clause_type.replace(/_/g, " ")} — ${e.enforceability.replace(/_/g, " ").toUpperCase()}`);
      body(e.legal_basis);
      if (e.key_factors.length > 0) {
        for (const f of e.key_factors) bullet(f);
      }
      y += 2;
    }

    // Liability Exposure
    heading("Liability Exposure");
    for (const l of dr.liability_exposure) {
      subHeading(`${l.risk_area} [${l.exposure_level.toUpperCase()}]`);
      labelValue("Estimated Range", l.estimated_range);
      if (l.mitigating_factors?.length) {
        for (const f of l.mitigating_factors) bullet(`✓ ${f}`);
      }
      if (l.aggravating_factors?.length) {
        for (const f of l.aggravating_factors) bullet(`⚠ ${f}`);
      }
      y += 2;
    }

    // Jurisdiction Risks
    if (dr.jurisdiction_risks?.length) {
      heading("Jurisdiction-Specific Risks");
      for (const jr of dr.jurisdiction_risks) {
        subHeading(jr.jurisdiction);
        body(jr.specific_risk);
        if (jr.mandatory_provision) labelValue("Required", jr.mandatory_provision);
        if (jr.consequence_if_missing) labelValue("Consequence", jr.consequence_if_missing);
        y += 2;
      }
    }

    // Regulatory Landscape
    if (dr.regulatory_landscape) {
      heading("Regulatory Landscape");
      for (const r of dr.regulatory_landscape.current_regulations) {
        labelValue(r.regulation, `${r.impact}${r.compliance_status ? ` (${r.compliance_status})` : ""}`);
      }
      if (dr.regulatory_landscape.pending_legislation?.length) {
        y += 2;
        subHeading("Pending Legislation");
        for (const p of dr.regulatory_landscape.pending_legislation) {
          bullet(`${p.legislation}${p.expected_timeline ? ` (${p.expected_timeline})` : ""} — ${p.potential_impact}`);
        }
      }
    }

    // Strategic Recommendations
    heading("Strategic Recommendations");
    for (const r of dr.strategic_recommendations) {
      subHeading(`[${r.priority.toUpperCase()}] ${r.area}`);
      body(r.recommendation);
      if (r.legal_basis) labelValue("Legal Basis", r.legal_basis);
      if (r.suggested_language) {
        checkPage(10);
        doc.setFontSize(8).setFont("helvetica", "italic").setTextColor(30, 64, 175);
        const langLines = doc.splitTextToSize(`"${r.suggested_language}"`, CONTENT_W - 8);
        for (const line of langLines) {
          checkPage(5);
          doc.text(line, MARGIN + 4, y);
          y += 3.5;
        }
        doc.setTextColor(0, 0, 0);
      }
      y += 2;
    }
  }

  if (addons?.exit_strategy) {
    const es = addons.exit_strategy;
    heading("CONTRACT EXIT STRATEGY", 16);
    labelValue("Exit Difficulty", es.overall_difficulty.replace(/_/g, " ").toUpperCase());
    labelValue("Estimated Cost Range", es.estimated_cost_range);
    labelValue("Fastest Exit Timeline", es.fastest_exit_timeline);
    y += 2;
    subHeading("Exit Summary");
    body(es.exit_summary);

    heading("Exit Routes");
    for (const route of es.exit_routes) {
      subHeading(`${route.route_name} [${route.feasibility.toUpperCase()} FEASIBILITY]`);
      body(route.description);
      labelValue("Cost", route.estimated_cost);
      labelValue("Timeline", route.timeline);
      labelValue("Legal Basis", route.legal_basis);
      if (route.steps.length > 0) {
        subHeading("Steps");
        route.steps.forEach((s, i) => bullet(`${i + 1}. ${s}`));
      }
      if (route.risks.length > 0) {
        subHeading("Risks");
        for (const r of route.risks) bullet(`⚠ ${r}`);
      }
      y += 2;
    }

    if (es.negotiation_leverage.length > 0) {
      heading("Negotiation Leverage");
      for (const lev of es.negotiation_leverage) {
        subHeading(`${lev.leverage_point} [${lev.strength.toUpperCase()}]`);
        body(lev.how_to_use);
        labelValue("Counterparty Motivation", lev.counterparty_motivation);
        y += 2;
      }
    }

    if (es.breach_analysis.length > 0) {
      heading("Breach Analysis");
      for (const b of es.breach_analysis) {
        subHeading(`${b.party} [${b.leverage_level.toUpperCase()} LEVERAGE]`);
        for (const pb of b.potential_breaches) bullet(pb);
        labelValue("Evidence Needed", b.evidence_needed);
        y += 2;
      }
    }

    heading("Force Majeure");
    labelValue("Applicable", es.force_majeure_applicability.applicable ? "Yes" : "No / Missing");
    body(es.force_majeure_applicability.analysis);
    if (es.force_majeure_applicability.qualifying_events.length > 0) {
      subHeading("Qualifying Events");
      for (const e of es.force_majeure_applicability.qualifying_events) bullet(e);
    }
    if (es.force_majeure_applicability.notice_requirements) {
      labelValue("Notice Requirements", es.force_majeure_applicability.notice_requirements);
    }

    if (es.warning_risks.length > 0) {
      heading("Exit Risks & Warnings");
      for (const w of es.warning_risks) {
        subHeading(`${w.risk} [${w.severity.toUpperCase()}]`);
        body(w.mitigation);
      }
    }

    heading("Mutual Termination Letter Template");
    body(es.mutual_termination_template);
  }

  // ── Footer on each page ──
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(7).setFont("helvetica", "normal").setTextColor(160, 160, 160);
    doc.text(`RentalWaivers Contract Scanner • Page ${i} of ${pageCount}`, MARGIN, 290);
    doc.text("AI-generated analysis — not legal advice", PAGE_W - MARGIN, 290, { align: "right" });
  }

  doc.save(`contract-analysis-${new Date().toISOString().slice(0, 10)}.pdf`);
}
