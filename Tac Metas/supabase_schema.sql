-- 1. Cargos
CREATE TABLE IF NOT EXISTS public.cargos (
  id bigserial PRIMARY KEY,
  name text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 2. Profiles
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  username text NOT NULL UNIQUE,
  cargo_id bigint NOT NULL REFERENCES public.cargos(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 3. Logs
CREATE TABLE IF NOT EXISTS public.logs (
  id bigserial PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type text NOT NULL,
  cargo_id bigint NULL REFERENCES public.cargos(id),
  points_awarded integer NOT NULL,
  payload jsonb NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  client_uuid uuid NOT NULL,
  UNIQUE(user_id, client_uuid)
);

-- 4. RLS (Segurança)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT USING (id = auth.uid());
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT WITH CHECK (id = auth.uid());
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE USING (id = auth.uid()) WITH CHECK (id = auth.uid());

ALTER TABLE public.logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "logs_select_own" ON public.logs FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "logs_insert_own" ON public.logs FOR INSERT WITH CHECK (user_id = auth.uid());

ALTER TABLE public.cargos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "cargos_select_all" ON public.cargos FOR SELECT USING (true);

-- 5. Seed de Cargos (IMPORTANTE: Mesmos nomes do app)
INSERT INTO public.cargos (name) VALUES 
('TECNICO_MANUTENCAO'), 
('TECNICO_INSTALACAO'), 
('AJUDANTE_MANUTENCAO'), 
('AJUDANTE_INSTALACAO') 
ON CONFLICT DO NOTHING;

-- 6. Garantir unicidade do Username (Adicionado posteriormente)
ALTER TABLE public.profiles 
ADD CONSTRAINT IF NOT EXISTS profiles_username_unique UNIQUE (username);
