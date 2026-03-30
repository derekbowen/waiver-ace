import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `You are a contract risk analysis engine. You will receive the text of a legal contract or agreement. Analyze it thoroughly and return a structured risk assessment.

Your analysis MUST cover:

1. CONTRACT TYPE — Identify what kind of agreement this is (NDA, service agreement, lease, employment, SaaS terms, etc.)
2. PARTIES — Identify all parties to the agreement
3. KEY DATES — Effective date, expiration, renewal dates, notice periods
4. CLAUSE EXTRACTION — For each clause found, provide:
   - clause_type (from: termination, indemnity, limitation_of_liability, governing_law, auto_renewal, exclusivity, assignment, confidentiality, payment_terms, data_processing, non_compete, force_majeure, dispute_resolution, intellectual_property, warranty, insurance, other)
   - summary (1-2 sentences)
   - risk_level ("low", "medium", "high", "critical")
   - risk_reason (why this clause is risky or favorable)
   - location (approximate section or paragraph reference)
5. MISSING CLAUSES — Standard clauses that SHOULD be present but are NOT found
6. RED FLAGS — One-sided terms, unusual obligations, vague language, conflicting provisions
7. NEGOTIATION POINTS — Specific suggestions for improving the contract from the reader's perspective
8. EXECUTIVE SUMMARY — A 3-5 sentence plain-English summary of the contract's overall risk profile
9. OVERALL RISK SCORE — Integer 1-100 where 1 is very safe and 100 is extremely risky`;

const REDLINE_PROMPT = `You are a contract redlining specialist. Given the original contract text AND risk analysis, generate specific redline suggestions. For each suggestion provide:
- original_text: the exact text to change
- suggested_text: what it should be changed to
- reason: why this change protects the reader
- priority: "must_change", "should_change", or "nice_to_have"`;

const VERIFICATION_PROMPT = `You are a senior legal AI reviewer. You have received a contract analysis produced by a junior AI. Your job is to:
1. Verify each identified risk is real and correctly categorized
2. Find any risks the first pass missed
3. Check for logical inconsistencies in the analysis
4. Upgrade or downgrade risk levels where appropriate
5. Add a confidence_score (0-100) for the overall analysis quality
6. Provide a verification_summary explaining what you confirmed, corrected, or added`;

const EXEC_BRIEF_PROMPT = `You are a business communications expert. Given a contract analysis, create a concise executive brief suitable for C-level executives or board members who need to understand contract risk in 60 seconds. Include:
- one_liner: single sentence verdict
- recommendation: "proceed", "proceed_with_changes", "negotiate", or "reject"
- top_3_concerns: the three most important issues
- financial_exposure: estimated financial risk description
- timeline_pressure: any deadline-related urgency
- action_items: specific next steps (max 5)`;

const toolSchema = {
  type: "function" as const,
  function: {
    name: "submit_contract_analysis",
    description: "Submit the structured contract risk analysis",
    parameters: {
      type: "object",
      properties: {
        contract_type: { type: "string" },
        parties: {
          type: "array",
          items: {
            type: "object",
            properties: { name: { type: "string" }, role: { type: "string" } },
            required: ["name", "role"],
          },
        },
        key_dates: {
          type: "array",
          items: {
            type: "object",
            properties: { label: { type: "string" }, value: { type: "string" } },
            required: ["label", "value"],
          },
        },
        clauses: {
          type: "array",
          items: {
            type: "object",
            properties: {
              clause_type: { type: "string" },
              summary: { type: "string" },
              risk_level: { type: "string", enum: ["low", "medium", "high", "critical"] },
              risk_reason: { type: "string" },
              location: { type: "string" },
            },
            required: ["clause_type", "summary", "risk_level", "risk_reason"],
          },
        },
        missing_clauses: {
          type: "array",
          items: {
            type: "object",
            properties: {
              clause_type: { type: "string" },
              importance: { type: "string", enum: ["recommended", "important", "critical"] },
              explanation: { type: "string" },
            },
            required: ["clause_type", "importance", "explanation"],
          },
        },
        red_flags: {
          type: "array",
          items: {
            type: "object",
            properties: {
              title: { type: "string" },
              description: { type: "string" },
              severity: { type: "string", enum: ["warning", "danger", "critical"] },
            },
            required: ["title", "description", "severity"],
          },
        },
        negotiation_points: {
          type: "array",
          items: {
            type: "object",
            properties: {
              point: { type: "string" },
              suggestion: { type: "string" },
              priority: { type: "string", enum: ["low", "medium", "high"] },
            },
            required: ["point", "suggestion", "priority"],
          },
        },
        executive_summary: { type: "string" },
        risk_score: { type: "integer" },
      },
      required: [
        "contract_type", "parties", "key_dates", "clauses",
        "missing_clauses", "red_flags", "negotiation_points",
        "executive_summary", "risk_score",
      ],
    },
  },
};

async function callAI(apiKey: string, systemPrompt: string, userPrompt: string, tools?: unknown[], toolChoice?: unknown) {
  const body: Record<string, unknown> = {
    model: "google/gemini-2.5-flash",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
  };
  if (tools) {
    body.tools = tools;
    body.tool_choice = toolChoice;
  }

  const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!resp.ok) {
    const t = await resp.text();
    console.error("AI error:", resp.status, t);
    throw new Error(resp.status === 429 ? "rate_limited" : `AI error: ${resp.status}`);
  }

  return resp.json();
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing authorization" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY");

    if (!lovableApiKey) {
      return new Response(JSON.stringify({ error: "AI not configured" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: authError } = await userClient.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { scanId, contractText, addons } = await req.json();

    if (!scanId || !contractText) {
      return new Response(JSON.stringify({ error: "Missing scanId or contractText" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (contractText.length > 200000) {
      return new Response(JSON.stringify({ error: "Contract text too long (max 200k characters)" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Parse addons
    const enabledAddons = {
      aiVerification: !!addons?.aiVerification,
      redlineSuggestions: !!addons?.redlineSuggestions,
      execBrief: !!addons?.execBrief,
      complianceCheck: !!addons?.complianceCheck,
      playbookComparison: !!addons?.playbookComparison,
      deepResearch: !!addons?.deepResearch,
      exitStrategy: !!addons?.exitStrategy,
    };

    const adminClient = createClient(supabaseUrl, supabaseServiceKey);
    await adminClient.from("contract_scans").update({ status: "processing" }).eq("id", scanId);

    // Calculate total credits: 10 per page base + addon costs
    const charCount = contractText.length;
    const estimatedPages = Math.max(1, Math.ceil(charCount / 3000));
    let creditsUsed = estimatedPages * 10; // base

    if (enabledAddons.aiVerification) creditsUsed += 10;
    if (enabledAddons.redlineSuggestions) creditsUsed += 10;
    if (enabledAddons.execBrief) creditsUsed += 5;
    if (enabledAddons.complianceCheck) creditsUsed += 10;
    if (enabledAddons.playbookComparison) creditsUsed += 10;
    if (enabledAddons.deepResearch) creditsUsed += 500;
    if (enabledAddons.exitStrategy) creditsUsed += 1000;

    // Get org
    const { data: profile } = await adminClient
      .from("profiles").select("org_id").eq("user_id", user.id).single();

    if (!profile?.org_id) {
      await adminClient.from("contract_scans").update({
        status: "failed", error_message: "No organization found",
      }).eq("id", scanId);
      return new Response(JSON.stringify({ error: "No organization" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Deduct credits
    const { data: deductResult } = await adminClient.rpc("deduct_credit", {
      p_org_id: profile.org_id,
      p_amount: creditsUsed,
      p_reference_id: scanId,
      p_type: "waiver_deduction",
      p_notes: `Contract scan: ${creditsUsed} credits (${estimatedPages} pages + addons)`,
    });

    const deduction = Array.isArray(deductResult) ? deductResult[0] : deductResult;
    if (!deduction?.success) {
      await adminClient.from("contract_scans").update({
        status: "failed", error_message: deduction?.error_message || "Insufficient credits",
      }).eq("id", scanId);
      return new Response(JSON.stringify({
        error: deduction?.error_message || "Insufficient credits",
        credits_required: creditsUsed,
      }), {
        status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // === STEP 1: Primary analysis ===
    const aiData = await callAI(
      lovableApiKey,
      SYSTEM_PROMPT,
      `Analyze the following contract and return your analysis.\n\n---CONTRACT TEXT---\n${contractText}`,
      [toolSchema],
      { type: "function", function: { name: "submit_contract_analysis" } }
    );

    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) {
      await adminClient.from("contract_scans").update({
        status: "failed", error_message: "AI returned no analysis",
      }).eq("id", scanId);
      return new Response(JSON.stringify({ error: "AI returned no analysis" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let analysis: Record<string, unknown>;
    try {
      analysis = JSON.parse(toolCall.function.arguments);
    } catch {
      await adminClient.from("contract_scans").update({
        status: "failed", error_message: "Failed to parse AI response",
      }).eq("id", scanId);
      return new Response(JSON.stringify({ error: "Failed to parse analysis" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // === STEP 2: Add-on passes (run in parallel where possible) ===
    const addonResults: Record<string, unknown> = {};
    const addonPromises: Promise<void>[] = [];

    if (enabledAddons.aiVerification) {
      addonPromises.push(
        callAI(lovableApiKey, VERIFICATION_PROMPT,
          `Original contract (first 5000 chars):\n${contractText.slice(0, 5000)}\n\nFirst-pass analysis:\n${JSON.stringify(analysis, null, 2)}`,
          [{
            type: "function",
            function: {
              name: "submit_verification",
              description: "Submit verification results",
              parameters: {
                type: "object",
                properties: {
                  confidence_score: { type: "integer" },
                  verification_summary: { type: "string" },
                  corrections: { type: "array", items: { type: "object", properties: {
                    original_finding: { type: "string" },
                    correction: { type: "string" },
                    severity_change: { type: "string" },
                  }, required: ["original_finding", "correction"] } },
                  missed_risks: { type: "array", items: { type: "object", properties: {
                    risk: { type: "string" },
                    severity: { type: "string" },
                    explanation: { type: "string" },
                  }, required: ["risk", "severity", "explanation"] } },
                },
                required: ["confidence_score", "verification_summary", "corrections", "missed_risks"],
              },
            },
          }],
          { type: "function", function: { name: "submit_verification" } }
        ).then(r => {
          const tc = r.choices?.[0]?.message?.tool_calls?.[0];
          if (tc) addonResults.verification = JSON.parse(tc.function.arguments);
        }).catch(e => { console.error("Verification addon error:", e); })
      );
    }

    if (enabledAddons.redlineSuggestions) {
      addonPromises.push(
        callAI(lovableApiKey, REDLINE_PROMPT,
          `Contract text:\n${contractText.slice(0, 10000)}\n\nRisk analysis:\n${JSON.stringify(analysis, null, 2)}`,
          [{
            type: "function",
            function: {
              name: "submit_redlines",
              description: "Submit redline suggestions",
              parameters: {
                type: "object",
                properties: {
                  redlines: { type: "array", items: { type: "object", properties: {
                    original_text: { type: "string" },
                    suggested_text: { type: "string" },
                    reason: { type: "string" },
                    priority: { type: "string", enum: ["must_change", "should_change", "nice_to_have"] },
                  }, required: ["original_text", "suggested_text", "reason", "priority"] } },
                },
                required: ["redlines"],
              },
            },
          }],
          { type: "function", function: { name: "submit_redlines" } }
        ).then(r => {
          const tc = r.choices?.[0]?.message?.tool_calls?.[0];
          if (tc) addonResults.redlines = JSON.parse(tc.function.arguments);
        }).catch(e => { console.error("Redlines addon error:", e); })
      );
    }

    if (enabledAddons.execBrief) {
      addonPromises.push(
        callAI(lovableApiKey, EXEC_BRIEF_PROMPT,
          `Analysis:\n${JSON.stringify(analysis, null, 2)}`,
          [{
            type: "function",
            function: {
              name: "submit_exec_brief",
              description: "Submit executive brief",
              parameters: {
                type: "object",
                properties: {
                  one_liner: { type: "string" },
                  recommendation: { type: "string", enum: ["proceed", "proceed_with_changes", "negotiate", "reject"] },
                  top_3_concerns: { type: "array", items: { type: "string" } },
                  financial_exposure: { type: "string" },
                  timeline_pressure: { type: "string" },
                  action_items: { type: "array", items: { type: "string" } },
                },
                required: ["one_liner", "recommendation", "top_3_concerns", "financial_exposure", "timeline_pressure", "action_items"],
              },
            },
          }],
          { type: "function", function: { name: "submit_exec_brief" } }
        ).then(r => {
          const tc = r.choices?.[0]?.message?.tool_calls?.[0];
          if (tc) addonResults.exec_brief = JSON.parse(tc.function.arguments);
        }).catch(e => { console.error("Exec brief addon error:", e); })
      );
    }

    if (enabledAddons.complianceCheck) {
      addonPromises.push(
        callAI(lovableApiKey,
          `You are a regulatory compliance specialist. Analyze the contract for compliance with common regulations: GDPR, CCPA, SOC2, HIPAA, PCI-DSS, ADA, and industry-specific regulations. Identify any compliance gaps.`,
          `Contract text:\n${contractText.slice(0, 8000)}\n\nIdentified clauses:\n${JSON.stringify((analysis as Record<string, unknown>).clauses, null, 2)}`,
          [{
            type: "function",
            function: {
              name: "submit_compliance",
              description: "Submit compliance check results",
              parameters: {
                type: "object",
                properties: {
                  applicable_regulations: { type: "array", items: { type: "object", properties: {
                    regulation: { type: "string" },
                    status: { type: "string", enum: ["compliant", "partially_compliant", "non_compliant", "not_applicable"] },
                    findings: { type: "string" },
                  }, required: ["regulation", "status", "findings"] } },
                  compliance_score: { type: "integer" },
                  critical_gaps: { type: "array", items: { type: "string" } },
                },
                required: ["applicable_regulations", "compliance_score", "critical_gaps"],
              },
            },
          }],
          { type: "function", function: { name: "submit_compliance" } }
        ).then(r => {
          const tc = r.choices?.[0]?.message?.tool_calls?.[0];
          if (tc) addonResults.compliance = JSON.parse(tc.function.arguments);
        }).catch(e => { console.error("Compliance addon error:", e); })
      );
    }

    if (enabledAddons.playbookComparison) {
      addonPromises.push(
        callAI(lovableApiKey,
          `You are a contract playbook analyst. Compare the contract against standard industry best practices and preferred language. For each clause, indicate whether it uses: preferred language, acceptable language, fallback language, or unacceptable language.`,
          `Contract text:\n${contractText.slice(0, 8000)}\n\nIdentified clauses:\n${JSON.stringify((analysis as Record<string, unknown>).clauses, null, 2)}`,
          [{
            type: "function",
            function: {
              name: "submit_playbook",
              description: "Submit playbook comparison",
              parameters: {
                type: "object",
                properties: {
                  clause_ratings: { type: "array", items: { type: "object", properties: {
                    clause_type: { type: "string" },
                    language_quality: { type: "string", enum: ["preferred", "acceptable", "fallback", "unacceptable"] },
                    standard_language: { type: "string" },
                    recommendation: { type: "string" },
                  }, required: ["clause_type", "language_quality", "recommendation"] } },
                  overall_grade: { type: "string", enum: ["A", "B", "C", "D", "F"] },
                },
                required: ["clause_ratings", "overall_grade"],
              },
            },
          }],
          { type: "function", function: { name: "submit_playbook" } }
        ).then(r => {
          const tc = r.choices?.[0]?.message?.tool_calls?.[0];
          if (tc) addonResults.playbook = JSON.parse(tc.function.arguments);
        }).catch(e => { console.error("Playbook addon error:", e); })
      );
    }

    // Deep Research add-on — uses reasoning model for thorough legal analysis
    if (enabledAddons.deepResearch) {
      const DEEP_RESEARCH_PROMPT = `You are a senior legal researcher and contract attorney with decades of experience. Conduct an exhaustive deep-dive legal research analysis of this contract. You must:

1. LEGAL FRAMEWORK ANALYSIS: Identify the applicable jurisdiction(s), governing law, and specific statutes/regulations that apply to this contract type. Cite actual laws by name and section number where possible (e.g., UCC Article 2, Restatement (Second) of Contracts §90, CCPA §1798.100).

2. CASE LAW & PRECEDENT: For each high-risk or critical clause, identify relevant landmark cases or legal precedents that have addressed similar provisions. Explain how courts have typically ruled on such clauses and what the implications are for the parties. Reference real, well-known cases where applicable.

3. ENFORCEABILITY ASSESSMENT: For each major clause, assess whether it would likely be enforced in court. Consider unconscionability, public policy, ambiguity doctrines, and contra proferentem. Rate enforceability as "highly_enforceable", "likely_enforceable", "uncertain", "likely_unenforceable", or "void".

4. JURISDICTION-SPECIFIC RISKS: Identify state/country-specific legal requirements that could affect the contract. Note any mandatory provisions required by law that are missing.

5. LIABILITY EXPOSURE ANALYSIS: Quantify or estimate the maximum potential liability exposure for each party based on the contract terms. Consider indemnification caps, limitation of liability, consequential damages, and insurance requirements.

6. REGULATORY LANDSCAPE: Map the current regulatory environment affecting this contract type. Note any pending legislation or recent regulatory changes that could impact the agreement.

7. STRATEGIC RECOMMENDATIONS: Provide detailed, legally-grounded recommendations for each party. Include specific language suggestions backed by legal reasoning.

This is a premium deep-dive analysis — be thorough, cite sources, and provide the level of detail a Fortune 500 general counsel would expect.`;

      addonPromises.push(
        callAI(lovableApiKey, DEEP_RESEARCH_PROMPT,
          `Full contract text:\n${contractText}\n\nPreliminary risk analysis:\n${JSON.stringify(analysis, null, 2)}`,
          [{
            type: "function",
            function: {
              name: "submit_deep_research",
              description: "Submit deep legal research analysis",
              parameters: {
                type: "object",
                properties: {
                  legal_framework: {
                    type: "object",
                    properties: {
                      governing_jurisdictions: { type: "array", items: { type: "string" } },
                      applicable_statutes: { type: "array", items: { type: "object", properties: {
                        statute: { type: "string" },
                        section: { type: "string" },
                        relevance: { type: "string" },
                      }, required: ["statute", "relevance"] } },
                      regulatory_bodies: { type: "array", items: { type: "string" } },
                    },
                    required: ["governing_jurisdictions", "applicable_statutes"],
                  },
                  case_law_analysis: {
                    type: "array",
                    items: { type: "object", properties: {
                      clause_type: { type: "string" },
                      case_name: { type: "string" },
                      citation: { type: "string" },
                      holding: { type: "string" },
                      relevance_to_contract: { type: "string" },
                      risk_implication: { type: "string", enum: ["favorable", "neutral", "unfavorable", "highly_unfavorable"] },
                    }, required: ["clause_type", "case_name", "holding", "relevance_to_contract", "risk_implication"] },
                  },
                  enforceability_assessment: {
                    type: "array",
                    items: { type: "object", properties: {
                      clause_type: { type: "string" },
                      enforceability: { type: "string", enum: ["highly_enforceable", "likely_enforceable", "uncertain", "likely_unenforceable", "void"] },
                      legal_basis: { type: "string" },
                      key_factors: { type: "array", items: { type: "string" } },
                    }, required: ["clause_type", "enforceability", "legal_basis", "key_factors"] },
                  },
                  liability_exposure: {
                    type: "array",
                    items: { type: "object", properties: {
                      risk_area: { type: "string" },
                      exposure_level: { type: "string", enum: ["minimal", "moderate", "significant", "severe", "catastrophic"] },
                      estimated_range: { type: "string" },
                      mitigating_factors: { type: "array", items: { type: "string" } },
                      aggravating_factors: { type: "array", items: { type: "string" } },
                    }, required: ["risk_area", "exposure_level", "estimated_range"] },
                  },
                  jurisdiction_risks: {
                    type: "array",
                    items: { type: "object", properties: {
                      jurisdiction: { type: "string" },
                      specific_risk: { type: "string" },
                      mandatory_provision: { type: "string" },
                      consequence_if_missing: { type: "string" },
                    }, required: ["jurisdiction", "specific_risk"] },
                  },
                  regulatory_landscape: {
                    type: "object",
                    properties: {
                      current_regulations: { type: "array", items: { type: "object", properties: {
                        regulation: { type: "string" },
                        impact: { type: "string" },
                        compliance_status: { type: "string" },
                      }, required: ["regulation", "impact"] } },
                      pending_legislation: { type: "array", items: { type: "object", properties: {
                        legislation: { type: "string" },
                        potential_impact: { type: "string" },
                        expected_timeline: { type: "string" },
                      }, required: ["legislation", "potential_impact"] } },
                    },
                    required: ["current_regulations"],
                  },
                  strategic_recommendations: {
                    type: "array",
                    items: { type: "object", properties: {
                      area: { type: "string" },
                      recommendation: { type: "string" },
                      legal_basis: { type: "string" },
                      priority: { type: "string", enum: ["critical", "high", "medium", "low"] },
                      suggested_language: { type: "string" },
                    }, required: ["area", "recommendation", "priority"] },
                  },
                  research_summary: { type: "string" },
                  overall_legal_risk_rating: { type: "string", enum: ["low", "moderate", "elevated", "high", "critical"] },
                },
                required: ["legal_framework", "case_law_analysis", "enforceability_assessment", "liability_exposure", "strategic_recommendations", "research_summary", "overall_legal_risk_rating"],
              },
            },
          }],
          { type: "function", function: { name: "submit_deep_research" } }
        ).then(r => {
          const tc = r.choices?.[0]?.message?.tool_calls?.[0];
          if (tc) addonResults.deep_research = JSON.parse(tc.function.arguments);
        }).catch(e => { console.error("Deep research addon error:", e); })
      );
    }

    // Exit Strategy add-on — premium escape analysis
    if (enabledAddons.exitStrategy) {
      const EXIT_STRATEGY_PROMPT = `You are an elite contract negotiation attorney and exit strategist. Your client wants to know EXACTLY how to get out of this contract. Analyze every possible legal exit route with brutal honesty. You must cover:

1. EXIT ROUTES: Every possible way to terminate or exit this contract — legal termination clauses, breach-based exits, mutual termination, assignment/novation, expiration strategies, regulatory-based exits, frustration of purpose, impossibility, unconscionability challenges. For each route provide: name, description, feasibility rating, estimated cost, timeline, legal basis, step-by-step instructions, and associated risks.

2. BREACH ANALYSIS: Has the other party potentially breached the contract already? What evidence would you need? How does this create exit leverage?

3. FORCE MAJEURE: Does the contract have a force majeure clause? What events qualify? Could current circumstances (economic, regulatory, pandemic, etc.) trigger it? What notice is required?

4. NEGOTIATION LEVERAGE: What leverage points does the client have to negotiate an exit or favorable termination? Consider the counterparty's motivations — what would make them AGREE to let the client go?

5. MUTUAL TERMINATION TEMPLATE: Draft a professional mutual termination letter template that the client could send to initiate exit negotiations.

6. EXIT RISKS & WARNINGS: What are the dangers of attempting to exit? Litigation risk, damages exposure, reputation harm, covenant violations.

Be specific, actionable, and thorough. This is a $1000-credit premium analysis — deliver Fortune 500 general counsel quality.`;

      addonPromises.push(
        callAI(lovableApiKey, EXIT_STRATEGY_PROMPT,
          `Full contract text:\n${contractText}\n\nPreliminary risk analysis:\n${JSON.stringify(analysis, null, 2)}`,
          [{
            type: "function",
            function: {
              name: "submit_exit_strategy",
              description: "Submit contract exit strategy analysis",
              parameters: {
                type: "object",
                properties: {
                  overall_difficulty: { type: "string", enum: ["easy", "moderate", "difficult", "very_difficult", "near_impossible"] },
                  estimated_cost_range: { type: "string" },
                  fastest_exit_timeline: { type: "string" },
                  exit_routes: {
                    type: "array",
                    items: { type: "object", properties: {
                      route_name: { type: "string" },
                      description: { type: "string" },
                      feasibility: { type: "string", enum: ["high", "moderate", "low", "very_low"] },
                      estimated_cost: { type: "string" },
                      timeline: { type: "string" },
                      legal_basis: { type: "string" },
                      steps: { type: "array", items: { type: "string" } },
                      risks: { type: "array", items: { type: "string" } },
                    }, required: ["route_name", "description", "feasibility", "estimated_cost", "timeline", "legal_basis", "steps", "risks"] },
                  },
                  breach_analysis: {
                    type: "array",
                    items: { type: "object", properties: {
                      party: { type: "string" },
                      potential_breaches: { type: "array", items: { type: "string" } },
                      evidence_needed: { type: "string" },
                      leverage_level: { type: "string", enum: ["strong", "moderate", "weak"] },
                    }, required: ["party", "potential_breaches", "evidence_needed", "leverage_level"] },
                  },
                  force_majeure_applicability: {
                    type: "object",
                    properties: {
                      applicable: { type: "boolean" },
                      qualifying_events: { type: "array", items: { type: "string" } },
                      notice_requirements: { type: "string" },
                      analysis: { type: "string" },
                    },
                    required: ["applicable", "qualifying_events", "notice_requirements", "analysis"],
                  },
                  negotiation_leverage: {
                    type: "array",
                    items: { type: "object", properties: {
                      leverage_point: { type: "string" },
                      strength: { type: "string", enum: ["strong", "moderate", "weak"] },
                      how_to_use: { type: "string" },
                      counterparty_motivation: { type: "string" },
                    }, required: ["leverage_point", "strength", "how_to_use", "counterparty_motivation"] },
                  },
                  mutual_termination_template: { type: "string" },
                  warning_risks: {
                    type: "array",
                    items: { type: "object", properties: {
                      risk: { type: "string" },
                      severity: { type: "string", enum: ["low", "medium", "high", "critical"] },
                      mitigation: { type: "string" },
                    }, required: ["risk", "severity", "mitigation"] },
                  },
                  exit_summary: { type: "string" },
                },
                required: ["overall_difficulty", "estimated_cost_range", "fastest_exit_timeline", "exit_routes", "breach_analysis", "force_majeure_applicability", "negotiation_leverage", "mutual_termination_template", "warning_risks", "exit_summary"],
              },
            },
          }],
          { type: "function", function: { name: "submit_exit_strategy" } }
        ).then(r => {
          const tc = r.choices?.[0]?.message?.tool_calls?.[0];
          if (tc) addonResults.exit_strategy = JSON.parse(tc.function.arguments);
        }).catch(e => { console.error("Exit strategy addon error:", e); })
      );
    }

    // Wait for all add-ons
    await Promise.allSettled(addonPromises);

    // Merge addon results into analysis
    const fullAnalysis = { ...analysis, addons: addonResults };

    // Save results
    await adminClient.from("contract_scans").update({
      status: "completed",
      analysis_json: fullAnalysis,
      risk_score: (analysis.risk_score as number) || null,
      contract_type: (analysis.contract_type as string) || null,
      credits_used: creditsUsed,
      completed_at: new Date().toISOString(),
    }).eq("id", scanId);

    return new Response(JSON.stringify({
      success: true,
      analysis: fullAnalysis,
      credits_used: creditsUsed,
      addons_completed: Object.keys(addonResults),
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    if (msg === "rate_limited") {
      return new Response(JSON.stringify({ error: "Rate limited, please try again later" }), {
        status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    console.error("analyze-contract error:", err);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
