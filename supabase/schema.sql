-- SUPABASE DATABASE SCHEMA FOR PLUTO PROJECT PLANNER
-- This script sets up the tables, indexes, row-level security (RLS) policies, 
-- and automatic updated_at triggers required for saving user project history.

-- ============================================================================
-- 1. TABLES CREATION
-- ============================================================================

-- Table to store high-level project details and final generated plans
CREATE TABLE IF NOT EXISTS public.projects (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    original_prompt TEXT NOT NULL,
    final_plan JSONB DEFAULT NULL, -- Stores: { plan, schema, schemaFileName, hasBackend, dbType }
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Table to store intermediate agent execution logs for real-time tracking
CREATE TABLE IF NOT EXISTS public.agent_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
    agent_name TEXT NOT NULL,
    status TEXT NOT NULL,          -- e.g., 'processing', 'completed', 'waiting_user_input', 'error'
    output_data JSONB DEFAULT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ============================================================================
-- 2. INDEXES FOR PERFORMANCE OPTIMIZATION
-- ============================================================================

CREATE INDEX IF NOT EXISTS projects_user_id_idx ON public.projects(user_id);
CREATE INDEX IF NOT EXISTS agent_logs_project_id_idx ON public.agent_logs(project_id);

-- ============================================================================
-- 3. ROW LEVEL SECURITY (RLS) & POLICIES
-- ============================================================================

ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_logs ENABLE ROW LEVEL SECURITY;

-- --- Policies for 'projects' table ---

CREATE POLICY "Users can select their own projects" 
    ON public.projects FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own projects" 
    ON public.projects FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own projects" 
    ON public.projects FOR UPDATE 
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own projects" 
    ON public.projects FOR DELETE 
    USING (auth.uid() = user_id);

-- --- Policies for 'agent_logs' table ---

CREATE POLICY "Users can select logs of their own projects" 
    ON public.agent_logs FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM public.projects 
            WHERE projects.id = agent_logs.project_id 
            AND projects.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert logs to their own projects" 
    ON public.agent_logs FOR INSERT 
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.projects 
            WHERE projects.id = agent_logs.project_id 
            AND projects.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update logs of their own projects" 
    ON public.agent_logs FOR UPDATE 
    USING (
        EXISTS (
            SELECT 1 FROM public.projects 
            WHERE projects.id = agent_logs.project_id 
            AND projects.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete logs of their own projects" 
    ON public.agent_logs FOR DELETE 
    USING (
        EXISTS (
            SELECT 1 FROM public.projects 
            WHERE projects.id = agent_logs.project_id 
            AND projects.user_id = auth.uid()
        )
    );

-- ============================================================================
-- 4. TRIGGERS FOR AUTO-UPDATING UPDATED_AT
-- ============================================================================

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_projects_updated_at
    BEFORE UPDATE ON public.projects
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();
