import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface UserContext {
  name: string;
  stage: number;
  onboarding: {
    academicBackground: { currentLevel: string; field: string; gpa: string; university: string };
    studyGoal: { degree: string; targetField: string; preferredCountries: string[]; intakeYear: string };
    budget: { totalBudget: string; fundingSource: string; needScholarship: boolean };
    exams: { gre: string; toefl: string; ielts: string; gmat: string };
    sopReadiness: string;
  };
  shortlistedCount: number;
  shortlistedUniversities: string[];
  lockedUniversity: string | null;
  taskProgress: { completed: number; total: number };
}

interface ActionRequest {
  action: "shortlist" | "lock" | "none";
  universityId?: string;
  universityName?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, context } = await req.json() as { message: string; context: UserContext };
    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");


    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are a concise, action-oriented study abroad counsellor AI. You help students apply to universities abroad.

USER CONTEXT:
- Name: ${context.name}
- Current Stage: ${context.stage} (1=Onboarding, 2=Discovery, 3=Locked, 4=Execution)
- Academic: ${context.onboarding.academicBackground.currentLevel} in ${context.onboarding.academicBackground.field}, GPA: ${context.onboarding.academicBackground.gpa}
- Goal: ${context.onboarding.studyGoal.degree} in ${context.onboarding.studyGoal.targetField}
- Countries: ${context.onboarding.studyGoal.preferredCountries.join(", ") || "Any"}
- Budget: ${context.onboarding.budget.totalBudget}, ${context.onboarding.budget.needScholarship ? "Needs scholarship" : "Self-funded"}
- Exams: GRE ${context.onboarding.exams.gre || "N/A"}, TOEFL ${context.onboarding.exams.toefl || "N/A"}, IELTS ${context.onboarding.exams.ielts || "N/A"}
- SOP: ${context.onboarding.sopReadiness}
- Shortlisted: ${context.shortlistedCount} universities (${context.shortlistedUniversities.join(", ") || "none"})
- Locked: ${context.lockedUniversity || "None"}
- Tasks: ${context.taskProgress.completed}/${context.taskProgress.total} completed

RULES:
1. Be SHORT and DIRECT. No generic motivation.
2. Give SPECIFIC advice based on their profile.
3. When recommending universities, use format: [UNIVERSITY:name|tier] where tier is dream/target/safe
4. If user wants to shortlist, respond with [ACTION:shortlist|university_name]
5. If user wants to lock a university, respond with [ACTION:lock|university_name]
6. Based on their stage, suggest clear next steps.
7. Point out profile gaps honestly but briefly.
8. Never say "I'm here to help" or similar filler.

STAGE-BASED BEHAVIOR:
- Stage 2 (Discovery): Focus on finding and shortlisting universities
- Stage 3 (Locked): They've committed. Focus on application tasks.
- Stage 4 (Execution): Track task completion, celebrate progress.

Available universities for actions:
MIT, Stanford, Harvard, Cambridge, Oxford, ETH Zurich, Caltech, Princeton, UC Berkeley, UCLA, NYU, University of Michigan, Georgia Tech, Purdue University, University of Toronto, McGill University, University of British Columbia, University of Melbourne, University of Sydney, National University of Singapore, TU Munich, Imperial College, UCL, University of Edinburgh, KTH Sweden

When suggesting universities, ALWAYS include the tier and be specific about WHY based on their profile.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message },
        ],
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const aiContent = data.choices?.[0]?.message?.content || "I couldn't process that request.";

    // Parse actions from response
    const actionMatch = aiContent.match(/\[ACTION:(shortlist|lock)\|([^\]]+)\]/);
    let parsedAction: ActionRequest = { action: "none" };
    
    if (actionMatch) {
      parsedAction = {
        action: actionMatch[1] as "shortlist" | "lock",
        universityName: actionMatch[2],
      };
    }

    // Clean the response by removing action markers
    const cleanContent = aiContent
      .replace(/\[ACTION:[^\]]+\]/g, "")
      .replace(/\[UNIVERSITY:[^\]]+\]/g, (match: string) => {
        const parts = match.slice(11, -1).split("|");
        return `**${parts[0]}** (${parts[1]})`;
      })
      .trim();

    return new Response(JSON.stringify({ 
      content: cleanContent,
      action: parsedAction,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("AI counsellor error:", e);
    return new Response(JSON.stringify({ 
      error: e instanceof Error ? e.message : "Unknown error",
      content: "Sorry, I encountered an issue. Please try again.",
      action: { action: "none" },
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
