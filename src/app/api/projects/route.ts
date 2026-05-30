import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';

const supabaseAdmin = createAdminClient();

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Supabase is not configured' }, { status: 500 });
    }

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('projects')
      .select('id, title, original_prompt, final_plan, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ projects: data });
  } catch (error: any) {
    console.error('Failed to get projects:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { projectId, final_plan } = body;

    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Supabase is not configured' }, { status: 500 });
    }

    if (!projectId) {
      return NextResponse.json({ error: 'projectId is required' }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from('projects')
      .update({ final_plan })
      .eq('id', projectId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Failed to update project:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get('projectId');

    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Supabase is not configured' }, { status: 500 });
    }

    if (!projectId) {
      return NextResponse.json({ error: 'projectId is required' }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from('projects')
      .delete()
      .eq('id', projectId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Failed to delete project:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, projects } = body;

    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Supabase is not configured' }, { status: 500 });
    }

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    if (!projects || !Array.isArray(projects)) {
      return NextResponse.json({ error: 'projects array is required' }, { status: 400 });
    }

    // Insert all projects
    const insertData = projects.map((p: any) => ({
      id: p.id, // Keep the same UUID to prevent breaking active workspaces
      user_id: userId,
      title: p.title,
      original_prompt: p.prompt || p.original_prompt,
      final_plan: {
        plan: p.plan,
        schema: p.schema,
        schemaFileName: p.schemaFileName,
        hasBackend: p.hasBackend,
        dbType: p.dbType || null,
        readme: p.readme || null,
        boilerplate: p.boilerplate || null,
      },
      created_at: p.createdAt || p.created_at || new Date().toISOString()
    }));

    const { data, error } = await supabaseAdmin
      .from('projects')
      .upsert(insertData, { onConflict: 'id' })
      .select();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, projects: data });
  } catch (error: any) {
    console.error('Failed to migrate projects:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}


