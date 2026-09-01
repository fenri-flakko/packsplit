-- PackSplit: esquema inicial + funciones RPC

-- ============================================================
-- TABLAS
-- ============================================================

CREATE TABLE IF NOT EXISTS workspaces (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text NOT NULL DEFAULT 'PackSplit',
  share_code  text NOT NULL UNIQUE,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS app_settings (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id      uuid NOT NULL UNIQUE REFERENCES workspaces(id) ON DELETE CASCADE,
  price_per_package numeric(10,2) NOT NULL DEFAULT 1.20 CHECK (price_per_package >= 0),
  split_mode        text NOT NULL DEFAULT 'equal' CHECK (split_mode IN ('equal', 'custom')),
  updated_at        timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS persons (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  name         text NOT NULL,
  percentage   numeric(5,2) NOT NULL DEFAULT 0 CHECK (percentage >= 0 AND percentage <= 100),
  sort_order   int NOT NULL DEFAULT 0,
  is_active    boolean NOT NULL DEFAULT true,
  created_at   timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS work_days (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  day_of_week  int NOT NULL CHECK (day_of_week BETWEEN 1 AND 7),
  is_active    boolean NOT NULL DEFAULT true,
  UNIQUE (workspace_id, day_of_week)
);

CREATE TABLE IF NOT EXISTS weeks (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  week_start   date NOT NULL,
  week_end     date NOT NULL,
  UNIQUE (workspace_id, week_start)
);

CREATE TABLE IF NOT EXISTS daily_records (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id   uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  week_id        uuid NOT NULL REFERENCES weeks(id) ON DELETE CASCADE,
  record_date    date NOT NULL,
  packages_count int NOT NULL DEFAULT 0 CHECK (packages_count >= 0),
  updated_at     timestamptz NOT NULL DEFAULT now(),
  UNIQUE (workspace_id, record_date)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_persons_workspace ON persons(workspace_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_work_days_workspace ON work_days(workspace_id);
CREATE INDEX IF NOT EXISTS idx_weeks_workspace_start ON weeks(workspace_id, week_start DESC);
CREATE INDEX IF NOT EXISTS idx_daily_records_week ON daily_records(week_id);
CREATE INDEX IF NOT EXISTS idx_daily_records_date ON daily_records(workspace_id, record_date);
CREATE INDEX IF NOT EXISTS idx_workspaces_share_code ON workspaces(share_code);

-- ============================================================
-- RLS: denegar acceso directo, todo vía RPC
-- ============================================================

ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE persons ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_days ENABLE ROW LEVEL SECURITY;
ALTER TABLE weeks ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_records ENABLE ROW LEVEL SECURITY;

-- Sin políticas = acceso denegado para anon/authenticated

-- ============================================================
-- HELPERS INTERNOS
-- ============================================================

CREATE OR REPLACE FUNCTION internal_generate_share_code()
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  v_chars  text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  v_code   text := '';
  v_i      int;
  v_exists boolean;
BEGIN
  LOOP
    v_code := '';
    FOR v_i IN 1..8 LOOP
      v_code := v_code || substr(v_chars, floor(random() * length(v_chars) + 1)::int, 1);
    END LOOP;
    SELECT EXISTS(SELECT 1 FROM workspaces WHERE share_code = v_code) INTO v_exists;
    EXIT WHEN NOT v_exists;
  END LOOP;
  RETURN v_code;
END;
$$;

CREATE OR REPLACE FUNCTION internal_verify_share_code(p_share_code text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_workspace_id uuid;
BEGIN
  SELECT id INTO v_workspace_id
  FROM workspaces
  WHERE share_code = upper(trim(p_share_code));

  IF v_workspace_id IS NULL THEN
    RAISE EXCEPTION 'INVALID_SHARE_CODE';
  END IF;

  RETURN v_workspace_id;
END;
$$;

CREATE OR REPLACE FUNCTION internal_iso_week_start(p_date date)
RETURNS date
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT (p_date - ((extract(isodow FROM p_date)::int - 1) || ' days')::interval)::date;
$$;

-- ============================================================
-- RPCs PÚBLICAS (accesibles desde anon)
-- ============================================================

-- Crear workspace
CREATE OR REPLACE FUNCTION create_workspace()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_workspace_id uuid;
  v_share_code   text;
BEGIN
  v_share_code := internal_generate_share_code();

  INSERT INTO workspaces (name, share_code)
  VALUES ('PackSplit', v_share_code)
  RETURNING id INTO v_workspace_id;

  INSERT INTO app_settings (workspace_id)
  VALUES (v_workspace_id);

  INSERT INTO persons (workspace_id, name, percentage, sort_order) VALUES
    (v_workspace_id, 'Persona 1', 50, 1),
    (v_workspace_id, 'Persona 2', 50, 2);

  INSERT INTO work_days (workspace_id, day_of_week, is_active) VALUES
    (v_workspace_id, 1, true),
    (v_workspace_id, 2, true),
    (v_workspace_id, 3, true),
    (v_workspace_id, 4, true),
    (v_workspace_id, 5, true),
    (v_workspace_id, 6, true),
    (v_workspace_id, 7, false);

  RETURN json_build_object(
    'workspace_id', v_workspace_id,
    'share_code', v_share_code
  );
END;
$$;

-- Unirse a workspace
CREATE OR REPLACE FUNCTION join_workspace(p_share_code text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
DECLARE
  v_workspace_id uuid;
  v_share_code   text;
BEGIN
  SELECT id, share_code
  INTO v_workspace_id, v_share_code
  FROM workspaces
  WHERE share_code = upper(trim(p_share_code));

  IF v_workspace_id IS NULL THEN
    RETURN NULL;
  END IF;

  RETURN json_build_object(
    'workspace_id', v_workspace_id,
    'share_code', v_share_code
  );
END;
$$;

-- Obtener configuración completa del workspace
CREATE OR REPLACE FUNCTION get_workspace_data(p_share_code text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
DECLARE
  v_workspace_id uuid;
BEGIN
  v_workspace_id := internal_verify_share_code(p_share_code);

  RETURN json_build_object(
    'workspace_id', v_workspace_id,
    'share_code', upper(trim(p_share_code)),
    'settings', (
      SELECT json_build_object(
        'price_per_package', price_per_package,
        'split_mode', split_mode
      )
      FROM app_settings WHERE workspace_id = v_workspace_id
    ),
    'persons', (
      SELECT coalesce(json_agg(
        json_build_object(
          'id', id,
          'name', name,
          'percentage', percentage,
          'sort_order', sort_order,
          'is_active', is_active
        ) ORDER BY sort_order
      ), '[]'::json)
      FROM persons WHERE workspace_id = v_workspace_id AND is_active = true
    ),
    'work_days', (
      SELECT coalesce(json_agg(
        json_build_object(
          'day_of_week', day_of_week,
          'is_active', is_active
        ) ORDER BY day_of_week
      ), '[]'::json)
      FROM work_days WHERE workspace_id = v_workspace_id
    )
  );
END;
$$;

-- Regenerar código de compartir
CREATE OR REPLACE FUNCTION regenerate_share_code(p_share_code text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_workspace_id uuid;
  v_new_code     text;
BEGIN
  v_workspace_id := internal_verify_share_code(p_share_code);
  v_new_code := internal_generate_share_code();

  UPDATE workspaces
  SET share_code = v_new_code
  WHERE id = v_workspace_id;

  RETURN json_build_object(
    'workspace_id', v_workspace_id,
    'share_code', v_new_code
  );
END;
$$;

-- Obtener o crear semana
CREATE OR REPLACE FUNCTION get_or_create_week(p_share_code text, p_date date)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_workspace_id uuid;
  v_week_start   date;
  v_week_end     date;
  v_week_id      uuid;
BEGIN
  v_workspace_id := internal_verify_share_code(p_share_code);
  v_week_start := internal_iso_week_start(p_date);
  v_week_end := v_week_start + 6;

  INSERT INTO weeks (workspace_id, week_start, week_end)
  VALUES (v_workspace_id, v_week_start, v_week_end)
  ON CONFLICT (workspace_id, week_start) DO NOTHING;

  SELECT id INTO v_week_id
  FROM weeks
  WHERE workspace_id = v_workspace_id AND week_start = v_week_start;

  RETURN json_build_object(
    'week_id', v_week_id,
    'week_start', v_week_start,
    'week_end', v_week_end
  );
END;
$$;

-- Obtener registro diario
CREATE OR REPLACE FUNCTION get_daily_record(p_share_code text, p_date date)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
DECLARE
  v_workspace_id uuid;
  v_record       daily_records%ROWTYPE;
BEGIN
  v_workspace_id := internal_verify_share_code(p_share_code);

  SELECT * INTO v_record
  FROM daily_records
  WHERE workspace_id = v_workspace_id AND record_date = p_date;

  IF v_record.id IS NULL THEN
    RETURN json_build_object(
      'id', null,
      'record_date', p_date,
      'packages_count', 0
    );
  END IF;

  RETURN json_build_object(
    'id', v_record.id,
    'record_date', v_record.record_date,
    'packages_count', v_record.packages_count
  );
END;
$$;

-- Guardar paquetes del día
CREATE OR REPLACE FUNCTION upsert_daily_record(
  p_share_code text,
  p_date date,
  p_packages int
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_workspace_id uuid;
  v_week_id      uuid;
  v_week_start   date;
  v_record       daily_records%ROWTYPE;
BEGIN
  IF p_packages < 0 THEN
    RAISE EXCEPTION 'INVALID_PACKAGES';
  END IF;

  v_workspace_id := internal_verify_share_code(p_share_code);
  v_week_start := internal_iso_week_start(p_date);

  INSERT INTO weeks (workspace_id, week_start, week_end)
  VALUES (v_workspace_id, v_week_start, v_week_start + 6)
  ON CONFLICT (workspace_id, week_start) DO NOTHING;

  SELECT id INTO v_week_id
  FROM weeks
  WHERE workspace_id = v_workspace_id AND week_start = v_week_start;

  INSERT INTO daily_records (workspace_id, week_id, record_date, packages_count, updated_at)
  VALUES (v_workspace_id, v_week_id, p_date, p_packages, now())
  ON CONFLICT (workspace_id, record_date)
  DO UPDATE SET
    packages_count = EXCLUDED.packages_count,
    updated_at = now()
  RETURNING * INTO v_record;

  RETURN json_build_object(
    'id', v_record.id,
    'record_date', v_record.record_date,
    'packages_count', v_record.packages_count
  );
END;
$$;

-- Permisos para rol anon
GRANT EXECUTE ON FUNCTION create_workspace() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION join_workspace(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_workspace_data(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION regenerate_share_code(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_or_create_week(text, date) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_daily_record(text, date) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION upsert_daily_record(text, date, int) TO anon, authenticated;
