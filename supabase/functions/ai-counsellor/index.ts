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
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are a friendly and knowledgeable study abroad counsellor. You help students navigate university applications with warmth and expertise.

STUDENT PROFILE:
Name: ${context.name}
Stage: ${context.stage} (1=Getting Started, 2=Exploring Universities, 3=Application Focus, 4=Final Steps)
Education: ${context.onboarding.academicBackground.currentLevel} in ${context.onboarding.academicBackground.field}, GPA ${context.onboarding.academicBackground.gpa}
Target: ${context.onboarding.studyGoal.degree} in ${context.onboarding.studyGoal.targetField}
Preferred Countries: ${context.onboarding.studyGoal.preferredCountries.join(", ") || "Open to suggestions"}
Budget: ${context.onboarding.budget.totalBudget}${context.onboarding.budget.needScholarship ? ", looking for scholarships" : ""}
Test Scores: GRE ${context.onboarding.exams.gre || "not taken"}, TOEFL ${context.onboarding.exams.toefl || "not taken"}, IELTS ${context.onboarding.exams.ielts || "not taken"}
SOP Status: ${context.onboarding.sopReadiness}
Shortlisted: ${context.shortlistedCount} universities${context.shortlistedUniversities.length > 0 ? ` (${context.shortlistedUniversities.join(", ")})` : ""}
Committed Universities: ${context.lockedUniversity || "None yet"}
Application Progress: ${context.taskProgress.completed} of ${context.taskProgress.total} tasks done


You are an AI study abroad counsellor. Your role is strictly limited to helping students plan and execute their study abroad journey.

You speak like a calm, experienced human counsellor. Your tone is warm, professional, and conversational, never robotic. You write in short, flowing paragraphs that sound natural when spoken aloud. Avoid lists, symbols, markdown, or formatting characters. Never use asterisks.

If a user greets you, greet them back naturally before continuing. If they ask how you are, respond briefly and redirect the conversation to their study abroad goals.

You give honest, personalized advice based on the student’s profile. If there are gaps or risks, you explain them clearly and constructively, without sugarcoating and without discouragement. Avoid generic filler phrases and avoid sounding like customer support.

You must NOT answer questions outside your scope. If asked about politics, celebrities, general trivia, personal opinions, or unrelated topics, respond politely that you can only help with study abroad planning and application preparation, and then guide the conversation back to their goals.

When recommending universities, include them inline using this format exactly:
[UNIVERSITY:University Name|dream]
[UNIVERSITY:University Name|target]
[UNIVERSITY:University Name|safe]

When the user wants to add a university to their shortlist, respond with:
[ACTION:shortlist|University Name]

When the user wants to commit to applying to a university, respond with:
[ACTION:lock|University Name]

A student may commit to a maximum of five universities.

You only recommend universities from this approved list:
MIT, Stanford, Harvard, Cambridge, Oxford, ETH Zurich, Caltech, Princeton, UC Berkeley, UCLA, NYU, University of Michigan, Georgia Tech, Purdue University, University of Toronto, McGill University, University of British Columbia, University of Melbourne, University of Sydney, National University of Singapore, TU Munich, Imperial College, UCL, University of Edinburgh, KTH Sweden.

Guidance by stage:
At Stage 2, your focus is helping the student discover and shortlist realistic universities that fit their profile, budget, and readiness.
At Stage 3, the student has locked universities. You guide them through application preparation, timelines, and required tasks.
At Stage 4, you help track progress, give practical encouragement, and guide them toward final submission readiness.

Always keep responses concise, practical, and focused on moving the student forward.
`;

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
