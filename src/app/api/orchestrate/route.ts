import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { createAdminClient } from '@/lib/supabase';

function getGenAIClient(): { client: GoogleGenerativeAI; keyLabel: string } | null {
  const keyPool = [
    { name: 'GEMINI_API_KEY_1', value: process.env.GEMINI_API_KEY_1 },
    { name: 'GEMINI_API_KEY_2', value: process.env.GEMINI_API_KEY_2 },
    { name: 'GEMINI_API_KEY', value: process.env.GEMINI_API_KEY }
  ];

  const validKeys = keyPool.filter(k => k.value && k.value !== 'your-gemini-api-key' && k.value.trim() !== '');

  if (validKeys.length === 0) return null;

  // Random rotation for high efficiency, balanced rate limits, and stateless consistency.
  const randomIndex = Math.floor(Math.random() * validKeys.length);
  const selected = validKeys[randomIndex];

  console.log(`[Pluto Engine] Menggunakan API Key: ${selected.name}`);
  
  return {
    client: new GoogleGenerativeAI(selected.value!),
    keyLabel: selected.name
  };
}

const supabaseAdmin = createAdminClient();

async function logAgentAction(projectId: string | null, agentName: string, status: string, outputData: any = null) {
  if (!supabaseAdmin || !projectId) return;
  try {
    await supabaseAdmin.from('agent_logs').insert([
      { project_id: projectId, agent_name: agentName, status, output_data: outputData }
    ]);
  } catch (e) {
    console.error('Failed to log agent action:', e);
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { prompt, userId, additionalContext, projectId: existingProjectId, agentStep, previousContext } = body;

    if (!prompt) return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    
    const genAIInstance = getGenAIClient();
    if (!genAIInstance) {
      return NextResponse.json({ error: 'GEMINI_API_KEY not configured' }, { status: 500 });
    }

    const { client: genAI } = genAIInstance;

    let projectId = existingProjectId;
    
    // Create new project record if this is the first step (analyst) and no project exists
    if (!projectId && agentStep === 'analyst' && supabaseAdmin && userId) {
      const { data: projData } = await supabaseAdmin
        .from('projects')
        .insert([{ user_id: userId, title: 'Pluto Project', original_prompt: prompt }])
        .select()
        .single();
      if (projData) projectId = projData.id;
    }

    const model = genAI.getGenerativeModel({ model: "gemini-3.5-flash" });
    const currentStep = agentStep || 'analyst';

    let promptText = prompt;
    if (additionalContext) {
      promptText = `Original Context:\n${prompt}\n\nUser Clarifications:\n${Object.entries(additionalContext).map(([k, v]) => `- ${k}: ${v}`).join('\n')}`;
    }

    // ==========================================
    // STEP 1: ANALYST AGENT
    // ==========================================
    if (currentStep === 'analyst') {
      await logAgentAction(projectId, 'System Analyst Agent', 'processing');
      
      const analystPrompt = `
      You are an Expert System Analyst Agent for Pluto.
      Analyze this user request: "${promptText}"
      
      Tasks:
      1. Determine if the request is related to software development. If NOT, output EXACTLY this JSON:
      {"is_out_of_scope": true, "message": "Maaf, ini di luar lingkup Pluto."}
      
      2. If it IS related, check if it's detailed enough. If ambiguous (needs more core info), generate 1-3 questions. Output EXACTLY this JSON:
      {"is_out_of_scope": false, "needs_clarification": true, "questions": [{"id": "q1", "question": "..."}]}
      
      3. If detailed enough, output EXACTLY this JSON:
      {"is_out_of_scope": false, "needs_clarification": false, "output": "[YOUR FULL ANALYST PLAN HERE]"}

      IMPORTANT: Output ONLY valid raw JSON without markdown code blocks.
      `;

      const result = await model.generateContent(analystPrompt);
      const text = result.response.text().trim().replace(/^```json/i, '').replace(/```$/, '').trim();
      const parsed = JSON.parse(text);

      if (parsed.is_out_of_scope) {
        await logAgentAction(projectId, 'System Analyst Agent', 'out_of_scope', parsed);
        return NextResponse.json({ status: 'out_of_scope', message: parsed.message });
      }

      if (parsed.needs_clarification) {
        await logAgentAction(projectId, 'System Analyst Agent', 'waiting_user_input', parsed);
        return NextResponse.json({ status: 'waiting_user_input', projectId, questions: parsed.questions });
      }

      await logAgentAction(projectId, 'System Analyst Agent', 'completed', parsed);
      return NextResponse.json({ status: 'completed', projectId, output: parsed.output });
    }

    // ==========================================
    // STEP 2: FRONTEND AGENT
    // ==========================================
    if (currentStep === 'frontend') {
      await logAgentAction(projectId, 'UI/UX Frontend Agent', 'processing');
      
      const frontendPrompt = `
      You are the UI/UX Frontend Agent.
      Project Scope: "${prompt}"
      Analyst Plan: "${previousContext?.analyst}"
      Additional Context (if any): "${promptText}"
      
      Task:
      1. Check the Project Scope, Analyst Plan, and any clarifications. Determine if there is enough clear information about the layout, pages, or styling (like color palettes, themes, and general visual vibe).
      2. If crucial details are missing and you require user clarification, generate 1 to 2 targeted questions. Do NOT use static or generic questions (such as "What color palette do you want?" or "Tema warna apa yang Anda inginkan?"). The questions MUST be directly tailored to the specific application described.
         For example, if they want a dashboard, ask if they prefer sidebar-heavy layouts or grid-based layout. If they want a marketplace, ask about the product view layout.
         If it is already clear or can be reasonably inferred, do NOT request clarification.
      3. If clarification is needed, output EXACTLY this JSON:
         {"needs_clarification": true, "questions": [{"id": "fq1", "question": "..."}]}
      4. If it is clear, generate the Frontend Plan. Output EXACTLY this JSON:
         {"needs_clarification": false, "output": "[YOUR FULL FRONTEND PLAN HERE]"}

      IMPORTANT: Output ONLY valid raw JSON without markdown code blocks.
      `;

      const result = await model.generateContent(frontendPrompt);
      const text = result.response.text().trim().replace(/^```json/i, '').replace(/```$/, '').trim();
      const parsed = JSON.parse(text);

      if (parsed.needs_clarification) {
        await logAgentAction(projectId, 'UI/UX Frontend Agent', 'waiting_user_input', parsed);
        return NextResponse.json({ status: 'waiting_user_input', projectId, questions: parsed.questions });
      }

      await logAgentAction(projectId, 'UI/UX Frontend Agent', 'completed', parsed);
      return NextResponse.json({ status: 'completed', projectId, output: parsed.output });
    }

    // ==========================================
    // STEP 3: BACKEND AGENT
    // ==========================================
    if (currentStep === 'backend') {
      await logAgentAction(projectId, 'Database Backend Agent', 'processing');
      
      const backendPrompt = `
      You are the Database Backend Agent.
      Project Scope: "${prompt}"
      Analyst Plan: "${previousContext?.analyst}"
      Frontend Plan: "${previousContext?.frontend}"
      Additional Context (if any): "${promptText}"
      
      Task:
      1. Determine if this app needs a backend/database. If it is a purely static or local state only app (like a basic calculator or local portfolio), set needs_clarification to false and explain that no backend database is needed in the output.
      2. If it needs a backend, check if the data schema, auth provider, or integrations are clear.
      3. If details are ambiguous and require user clarification, generate 1 to 2 targeted questions. Do NOT use static or generic database questions (like "What database do you want?"). The questions MUST be directly relevant to the specific application described.
         For example, if it's an e-commerce, ask if they need guest checkout or user account history tracking.
         If it is clear or can be reasonably inferred, do NOT request clarification.
      4. If clarification is needed, output EXACTLY this JSON:
         {"needs_clarification": true, "questions": [{"id": "bq1", "question": "..."}]}
      5. If it's clear, generate the Backend Schema Plan. Output EXACTLY this JSON:
         {"needs_clarification": false, "output": "[YOUR FULL BACKEND PLAN HERE]"}

      IMPORTANT: Output ONLY valid raw JSON without markdown code blocks.
      `;

      const result = await model.generateContent(backendPrompt);
      const text = result.response.text().trim().replace(/^```json/i, '').replace(/```$/, '').trim();
      const parsed = JSON.parse(text);

      if (parsed.needs_clarification) {
        await logAgentAction(projectId, 'Database Backend Agent', 'waiting_user_input', parsed);
        return NextResponse.json({ status: 'waiting_user_input', projectId, questions: parsed.questions });
      }

      await logAgentAction(projectId, 'Database Backend Agent', 'completed', parsed);
      return NextResponse.json({ status: 'completed', projectId, output: parsed.output });
    }

    // ==========================================
    // STEP 4: QA AGENT (FINAL MERGE)
    // ==========================================
    if (currentStep === 'qa') {
      await logAgentAction(projectId, 'QA & DevOps Agent', 'processing');
      
      const qaPrompt = `
      You are the QA & DevOps Agent for Pluto.
      Project Scope: "${prompt}"
      Analyst Plan: "${previousContext?.analyst}"
      Frontend Plan: "${previousContext?.frontend}"
      Backend Plan: "${previousContext?.backend}"
      
      Task:
      1. Analyze the plans and determine if the application requires a backend/database (e.g. database schema is defined).
      2. Determine the appropriate database type (SQL like PostgreSQL/Supabase/SQLite, or NoSQL like MongoDB/Firebase/Redis).
      3. Compile everything into a unified development plan.
      4. If a backend is required, generate a separate database schema script/code:
         - For SQL: Output the clean SQL DDL script.
         - For NoSQL: Output the schema models or initialization scripts in Javascript or Typescript.
         - The script should be fully detailed, executable, and separate.
      5. Generate the final plan markdown (plan.md) detailing overview, pages, routing, business rules, and QA steps. The plan.md should NOT contain the database schema script itself, but rather explain that the database schema is generated in the accompanying schema file.

      You must return your output wrapped in XML tags as follows. Do NOT return JSON, and do NOT wrap the entire response in markdown code blocks:
      
      <has_backend>true or false</has_backend>
      <db_type>SQL or NoSQL or none</db_type>
      <schema_filename>name of the schema file, e.g. schema.sql or schema.js or schema.ts or schema.json (or null if has_backend is false)</schema_filename>
      <plan_md>
      [The markdown content of plan.md]
      </plan_md>
      <schema_code>
      [The schema script or code, empty if has_backend is false]
      </schema_code>
      `;

      const result = await model.generateContent(qaPrompt);
      const text = result.response.text().trim();
      
      // Helper function to extract content between XML-like tags
      const extractTag = (xmlStr: string, tag: string): string => {
        const regex = new RegExp(`<${tag}>([\\s\\S]*?)<\\/${tag}>`, 'i');
        const match = xmlStr.match(regex);
        return match ? match[1].trim() : '';
      };

      const hasBackendStr = extractTag(text, 'has_backend');
      const hasBackend = hasBackendStr.toLowerCase() === 'true';
      const dbType = extractTag(text, 'db_type') || null;
      let schemaFileName = extractTag(text, 'schema_filename') || null;
      if (schemaFileName === 'null' || schemaFileName === 'none') schemaFileName = null;
      
      let plan = extractTag(text, 'plan_md');
      let schema = extractTag(text, 'schema_code');

      // Fallback if model failed to follow XML structure
      if (!plan) {
        plan = text;
      }
      
      await logAgentAction(projectId, 'QA & DevOps Agent', 'completed');

      if (supabaseAdmin && projectId) {
        await supabaseAdmin.from('projects').update({ 
          final_plan: { 
            plan, 
            schema: hasBackend ? schema : null, 
            schemaFileName: hasBackend ? schemaFileName : null,
            hasBackend,
            dbType
          } 
        }).eq('id', projectId);
      }

      return NextResponse.json({ 
        status: 'completed', 
        projectId, 
        plan, 
        schema: hasBackend ? schema : null,
        schemaFileName: hasBackend ? schemaFileName : null,
        hasBackend,
        dbType
      });
    }

    return NextResponse.json({ error: 'Invalid agentStep' }, { status: 400 });

  } catch (error: any) {
    console.error('Orchestration error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
