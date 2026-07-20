CREATE TYPE storage.buckettype AS ENUM ('VECTOR', 'ANALYTICS', 'STANDARD');
CREATE TYPE auth.oauth_client_type AS ENUM ('confidential', 'public');
CREATE TYPE auth.oauth_response_type AS ENUM ('code');
CREATE TYPE realtime.equality_op AS ENUM ('isdistinct', 'imatch', 'match', 'is', 'ilike', 'like', 'in', 'gte', 'gt', 'lte', 'lt', 'neq', 'eq');
CREATE TYPE auth.code_challenge_method AS ENUM ('plain', 's256');
CREATE TYPE auth.aal_level AS ENUM ('aal3', 'aal2', 'aal1');
CREATE TYPE auth.one_time_token_type AS ENUM ('phone_change_token', 'email_change_token_current', 'email_change_token_new', 'recovery_token', 'reauthentication_token', 'confirmation_token');
CREATE TYPE realtime.action AS ENUM ('ERROR', 'TRUNCATE', 'DELETE', 'UPDATE', 'INSERT');
CREATE TYPE auth.factor_type AS ENUM ('phone', 'webauthn', 'totp');
CREATE TYPE auth.oauth_registration_type AS ENUM ('manual', 'dynamic');
CREATE TYPE auth.oauth_authorization_status AS ENUM ('expired', 'denied', 'approved', 'pending');
CREATE TYPE auth.factor_status AS ENUM ('verified', 'unverified');
"CREATE TABLE IF NOT EXISTS auth.webauthn_credentials (
  aaguid uuid,
  transports jsonb DEFAULT '[]'::jsonb NOT NULL,
  credential_id bytea NOT NULL,
  last_used_at timestamptz,
  backup_eligible bool DEFAULT false NOT NULL,
  sign_count int8 DEFAULT 0 NOT NULL,
  public_key bytea NOT NULL,
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  friendly_name text DEFAULT ''::text NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  backed_up bool DEFAULT false NOT NULL,
  user_id uuid NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  attestation_type text DEFAULT ''::text NOT NULL
);"
"CREATE TABLE IF NOT EXISTS realtime.subscription (
  id int8 NOT NULL,
  subscription_id uuid NOT NULL,
  action_filter text DEFAULT '*'::text,
  selected_columns _text,
  filters _user_defined_filter DEFAULT '{}'::realtime.user_defined_filter[] NOT NULL,
  claims_role regrole NOT NULL,
  entity regclass NOT NULL,
  claims jsonb NOT NULL,
  created_at timestamp DEFAULT timezone('utc'::text, now()) NOT NULL
);"
"CREATE TABLE IF NOT EXISTS auth.sessions (
  aal aal_level,
  refreshed_at timestamp,
  created_at timestamptz,
  refresh_token_counter int8,
  user_agent text,
  not_after timestamptz,
  updated_at timestamptz,
  id uuid NOT NULL,
  tag text,
  ip inet,
  oauth_client_id uuid,
  user_id uuid NOT NULL,
  scopes text,
  refresh_token_hmac_key text,
  factor_id uuid
);"
"CREATE TABLE IF NOT EXISTS auth.flow_state (
  auth_code text,
  referrer text,
  created_at timestamptz,
  provider_access_token text,
  linking_target_id uuid,
  code_challenge_method code_challenge_method,
  id uuid NOT NULL,
  provider_type text NOT NULL,
  provider_refresh_token text,
  oauth_client_state_id uuid,
  invite_token text,
  code_challenge text,
  authentication_method text NOT NULL,
  email_optional bool DEFAULT false NOT NULL,
  updated_at timestamptz,
  auth_code_issued_at timestamptz,
  user_id uuid
);"
"CREATE TABLE IF NOT EXISTS extensions.pg_stat_statements (
  dbid oid,
  temp_blk_write_time float8,
  mean_plan_time float8,
  calls int8,
  rows int8,
  stddev_exec_time float8,
  temp_blk_read_time float8,
  local_blk_read_time float8,
  stddev_plan_time float8,
  jit_generation_time float8,
  temp_blks_read int8,
  local_blks_dirtied int8,
  local_blks_written int8,
  shared_blks_read int8,
  jit_functions int8,
  local_blk_write_time float8,
  local_blks_read int8,
  shared_blks_hit int8,
  wal_bytes numeric,
  shared_blks_dirtied int8,
  query text,
  total_exec_time float8,
  jit_deform_count int8,
  max_exec_time float8,
  jit_inlining_count int8,
  jit_deform_time float8,
  plans int8,
  shared_blk_read_time float8,
  jit_inlining_time float8,
  jit_optimization_count int8,
  stats_since timestamptz,
  temp_blks_written int8,
  shared_blk_write_time float8,
  min_plan_time float8,
  total_plan_time float8,
  max_plan_time float8,
  min_exec_time float8,
  wal_records int8,
  jit_optimization_time float8,
  toplevel bool,
  jit_emission_time float8,
  userid oid,
  shared_blks_written int8,
  minmax_stats_since timestamptz,
  wal_fpi int8,
  queryid int8,
  local_blks_hit int8,
  jit_emission_count int8,
  mean_exec_time float8
);"
"CREATE TABLE IF NOT EXISTS auth.sso_providers (
  id uuid NOT NULL,
  updated_at timestamptz,
  created_at timestamptz,
  disabled bool,
  resource_id text
);"
"CREATE TABLE IF NOT EXISTS extensions.pg_stat_statements_info (
  stats_reset timestamptz,
  dealloc int8
);"
"CREATE TABLE IF NOT EXISTS auth.audit_log_entries (
  payload json,
  created_at timestamptz,
  instance_id uuid,
  id uuid NOT NULL,
  ip_address varchar(64) DEFAULT ''::character varying NOT NULL
);"
"CREATE TABLE IF NOT EXISTS public.connection (
  profile_id uuid,
  is_accepted bool DEFAULT false,
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  connection_id uuid
);"
"CREATE TABLE IF NOT EXISTS auth.custom_oauth_providers (
  updated_at timestamptz DEFAULT now() NOT NULL,
  authorization_url text,
  email_optional bool DEFAULT false NOT NULL,
  client_id text NOT NULL,
  userinfo_url text,
  discovery_url text,
  discovery_cached_at timestamptz,
  attribute_mapping jsonb DEFAULT '{}'::jsonb NOT NULL,
  enabled bool DEFAULT true NOT NULL,
  provider_type text NOT NULL,
  authorization_params jsonb DEFAULT '{}'::jsonb NOT NULL,
  cached_discovery jsonb,
  custom_claims_allowlist _text DEFAULT '{}'::text[] NOT NULL,
  token_url text,
  pkce_enabled bool DEFAULT true NOT NULL,
  acceptable_client_ids _text DEFAULT '{}'::text[] NOT NULL,
  identifier text NOT NULL,
  issuer text,
  jwks_uri text,
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  skip_nonce_check bool DEFAULT false NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  name text NOT NULL,
  client_secret text NOT NULL,
  scopes _text DEFAULT '{}'::text[] NOT NULL
);"
"CREATE TABLE IF NOT EXISTS auth.identities (
  created_at timestamptz,
  email text,
  identity_data jsonb NOT NULL,
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  updated_at timestamptz,
  provider text NOT NULL,
  provider_id text NOT NULL,
  user_id uuid NOT NULL,
  last_sign_in_at timestamptz
);"
"CREATE TABLE IF NOT EXISTS auth.schema_migrations (
  version varchar(255) NOT NULL
);"
"CREATE TABLE IF NOT EXISTS auth.instances (
  uuid uuid,
  updated_at timestamptz,
  raw_base_config text,
  id uuid NOT NULL,
  created_at timestamptz
);"
"CREATE TABLE IF NOT EXISTS realtime.schema_migrations (
  version int8 NOT NULL,
  inserted_at timestamp
);"
"CREATE TABLE IF NOT EXISTS auth.users (
  phone_change text DEFAULT ''::character varying,
  reauthentication_sent_at timestamptz,
  is_super_admin bool,
  email_change_token_new varchar(255),
  email varchar(255),
  updated_at timestamptz,
  email_change_sent_at timestamptz,
  raw_user_meta_data jsonb,
  recovery_sent_at timestamptz,
  confirmation_sent_at timestamptz,
  deleted_at timestamptz,
  id uuid NOT NULL,
  recovery_token varchar(255),
  reauthentication_token varchar(255) DEFAULT ''::character varying,
  is_sso_user bool DEFAULT false NOT NULL,
  raw_app_meta_data jsonb,
  phone_change_sent_at timestamptz,
  phone_change_token varchar(255) DEFAULT ''::character varying,
  confirmed_at timestamptz,
  created_at timestamptz,
  confirmation_token varchar(255),
  email_confirmed_at timestamptz,
  aud varchar(255),
  is_anonymous bool DEFAULT false NOT NULL,
  email_change varchar(255),
  phone text DEFAULT NULL::character varying,
  instance_id uuid,
  last_sign_in_at timestamptz,
  phone_confirmed_at timestamptz,
  role varchar(255),
  email_change_confirm_status int2 DEFAULT 0,
  encrypted_password varchar(255),
  invited_at timestamptz,
  banned_until timestamptz,
  email_change_token_current varchar(255) DEFAULT ''::character varying
);"
"CREATE TABLE IF NOT EXISTS realtime.messages_2026_07_18 (
  updated_at timestamp DEFAULT now() NOT NULL,
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  binary_payload bytea,
  inserted_at timestamp DEFAULT now() NOT NULL,
  payload jsonb,
  topic text NOT NULL,
  event text,
  extension text NOT NULL,
  private bool DEFAULT false
);"
"CREATE TABLE IF NOT EXISTS storage.migrations (
  name varchar(100) NOT NULL,
  hash varchar(40) NOT NULL,
  executed_at timestamp DEFAULT CURRENT_TIMESTAMP,
  id int4 NOT NULL
);"
"CREATE TABLE IF NOT EXISTS public.last_smoke (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  last_smoke timestamptz,
  profile_id uuid
);"
"CREATE TABLE IF NOT EXISTS auth.webauthn_challenges (
  created_at timestamptz DEFAULT now() NOT NULL,
  user_id uuid,
  challenge_type text NOT NULL,
  session_data jsonb NOT NULL,
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  expires_at timestamptz NOT NULL
);"
"CREATE TABLE IF NOT EXISTS auth.mfa_challenges (
  otp_code text,
  id uuid NOT NULL,
  verified_at timestamptz,
  web_authn_session_data jsonb,
  created_at timestamptz NOT NULL,
  factor_id uuid NOT NULL,
  ip_address inet NOT NULL
);"
"CREATE TABLE IF NOT EXISTS auth.saml_providers (
  attribute_mapping jsonb,
  updated_at timestamptz,
  name_id_format text,
  created_at timestamptz,
  entity_id text NOT NULL,
  id uuid NOT NULL,
  metadata_xml text NOT NULL,
  sso_provider_id uuid NOT NULL,
  metadata_url text
);"
"CREATE TABLE IF NOT EXISTS realtime.messages_2026_07_15 (
  private bool DEFAULT false,
  extension text NOT NULL,
  event text,
  topic text NOT NULL,
  payload jsonb,
  binary_payload bytea,
  inserted_at timestamp DEFAULT now() NOT NULL,
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  updated_at timestamp DEFAULT now() NOT NULL
);"
"CREATE TABLE IF NOT EXISTS realtime.messages_2026_07_17 (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  updated_at timestamp DEFAULT now() NOT NULL,
  event text,
  topic text NOT NULL,
  payload jsonb,
  inserted_at timestamp DEFAULT now() NOT NULL,
  binary_payload bytea,
  extension text NOT NULL,
  private bool DEFAULT false
);"
"CREATE TABLE IF NOT EXISTS storage.s3_multipart_uploads (
  bucket_id text NOT NULL,
  id text NOT NULL,
  upload_signature text NOT NULL,
  user_metadata jsonb,
  owner_id text,
  created_at timestamptz DEFAULT now() NOT NULL,
  version text NOT NULL,
  key text NOT NULL,
  metadata jsonb,
  in_progress_size int8 DEFAULT 0 NOT NULL
);"
"CREATE TABLE IF NOT EXISTS auth.one_time_tokens (
  user_id uuid NOT NULL,
  relates_to text NOT NULL,
  created_at timestamp DEFAULT now() NOT NULL,
  id uuid NOT NULL,
  token_hash text NOT NULL,
  updated_at timestamp DEFAULT now() NOT NULL,
  token_type one_time_token_type NOT NULL
);"
"CREATE TABLE IF NOT EXISTS public.contact (
  whatsapp text,
  profile_id uuid NOT NULL,
  instagram text
);"
"CREATE TABLE IF NOT EXISTS realtime.messages_2026_07_14 (
  event text,
  topic text NOT NULL,
  payload jsonb,
  binary_payload bytea,
  inserted_at timestamp DEFAULT now() NOT NULL,
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  updated_at timestamp DEFAULT now() NOT NULL,
  private bool DEFAULT false,
  extension text NOT NULL
);"
"CREATE TABLE IF NOT EXISTS storage.buckets_vectors (
  type buckettype DEFAULT 'VECTOR'::storage.buckettype NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  id text NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);"
"CREATE TABLE IF NOT EXISTS auth.oauth_clients (
  client_type oauth_client_type DEFAULT 'confidential'::auth.oauth_client_type NOT NULL,
  redirect_uris text NOT NULL,
  deleted_at timestamptz,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  logo_uri text,
  client_name text,
  client_secret_hash text,
  token_endpoint_auth_method text NOT NULL,
  id uuid NOT NULL,
  registration_type oauth_registration_type NOT NULL,
  grant_types text NOT NULL,
  client_uri text
);"
"CREATE TABLE IF NOT EXISTS auth.refresh_tokens (
  parent varchar(255),
  created_at timestamptz,
  instance_id uuid,
  user_id varchar(255),
  session_id uuid,
  updated_at timestamptz,
  token varchar(255),
  id int8 DEFAULT nextval('auth.refresh_tokens_id_seq'::regclass) NOT NULL,
  revoked bool
);"
"CREATE TABLE IF NOT EXISTS storage.buckets_analytics (
  updated_at timestamptz DEFAULT now() NOT NULL,
  type buckettype DEFAULT 'ANALYTICS'::storage.buckettype NOT NULL,
  deleted_at timestamptz,
  format text DEFAULT 'ICEBERG'::text NOT NULL,
  name text NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  id uuid DEFAULT gen_random_uuid() NOT NULL
);"
"CREATE TABLE IF NOT EXISTS auth.oauth_authorizations (
  nonce text,
  response_type oauth_response_type DEFAULT 'code'::auth.oauth_response_type NOT NULL,
  authorization_id text NOT NULL,
  code_challenge_method code_challenge_method,
  status oauth_authorization_status DEFAULT 'pending'::auth.oauth_authorization_status NOT NULL,
  expires_at timestamptz DEFAULT (now() + '00:03:00'::interval) NOT NULL,
  redirect_uri text NOT NULL,
  authorization_code text,
  scope text NOT NULL,
  resource text,
  created_at timestamptz DEFAULT now() NOT NULL,
  client_id uuid NOT NULL,
  state text,
  code_challenge text,
  user_id uuid,
  approved_at timestamptz,
  id uuid NOT NULL
);"
"CREATE TABLE IF NOT EXISTS auth.oauth_consents (
  granted_at timestamptz DEFAULT now() NOT NULL,
  user_id uuid NOT NULL,
  scopes text NOT NULL,
  id uuid NOT NULL,
  client_id uuid NOT NULL,
  revoked_at timestamptz
);"
"CREATE TABLE IF NOT EXISTS storage.objects (
  last_accessed_at timestamptz DEFAULT now(),
  path_tokens _text,
  name text,
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  owner uuid,
  updated_at timestamptz DEFAULT now(),
  metadata jsonb,
  created_at timestamptz DEFAULT now(),
  bucket_id text,
  version text,
  user_metadata jsonb,
  owner_id text
);"
"CREATE TABLE IF NOT EXISTS auth.oauth_client_states (
  provider_type text NOT NULL,
  created_at timestamptz NOT NULL,
  id uuid NOT NULL,
  code_verifier text
);"
"CREATE TABLE IF NOT EXISTS auth.mfa_amr_claims (
  id uuid NOT NULL,
  created_at timestamptz NOT NULL,
  updated_at timestamptz NOT NULL,
  session_id uuid NOT NULL,
  authentication_method text NOT NULL
);"
"CREATE TABLE IF NOT EXISTS public.profile (
  full_name text,
  username text,
  email text,
  date_created timestamptz DEFAULT now(),
  id uuid NOT NULL,
  profile_photo text
);"
"CREATE TABLE IF NOT EXISTS storage.buckets (
  file_size_limit int8,
  public bool DEFAULT false,
  created_at timestamptz DEFAULT now(),
  id text NOT NULL,
  owner uuid,
  allowed_mime_types _text,
  avif_autodetection bool DEFAULT false,
  type buckettype DEFAULT 'STANDARD'::storage.buckettype NOT NULL,
  owner_id text,
  name text NOT NULL,
  updated_at timestamptz DEFAULT now()
);"
"CREATE TABLE IF NOT EXISTS auth.sso_domains (
  sso_provider_id uuid NOT NULL,
  updated_at timestamptz,
  domain text NOT NULL,
  created_at timestamptz,
  id uuid NOT NULL
);"
"CREATE TABLE IF NOT EXISTS auth.saml_relay_states (
  sso_provider_id uuid NOT NULL,
  redirect_to text,
  updated_at timestamptz,
  id uuid NOT NULL,
  for_email text,
  created_at timestamptz,
  flow_state_id uuid,
  request_id text NOT NULL
);"
"CREATE TABLE IF NOT EXISTS public.chat (
  sender text,
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  time_sent timestamp DEFAULT now(),
  chat_id uuid DEFAULT gen_random_uuid() NOT NULL,
  message text NOT NULL
);"
"CREATE TABLE IF NOT EXISTS realtime.messages_2026_07_16 (
  payload jsonb,
  inserted_at timestamp DEFAULT now() NOT NULL,
  binary_payload bytea,
  event text,
  topic text NOT NULL,
  updated_at timestamp DEFAULT now() NOT NULL,
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  private bool DEFAULT false,
  extension text NOT NULL
);"
"CREATE TABLE IF NOT EXISTS storage.s3_multipart_uploads_parts (
  owner_id text,
  key text NOT NULL,
  part_number int4 NOT NULL,
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  size int8 DEFAULT 0 NOT NULL,
  version text NOT NULL,
  etag text NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  upload_id text NOT NULL,
  bucket_id text NOT NULL
);"
"CREATE TABLE IF NOT EXISTS realtime.messages (
  binary_payload bytea,
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  payload jsonb,
  event text,
  updated_at timestamp DEFAULT now() NOT NULL,
  topic text NOT NULL,
  private bool DEFAULT false,
  inserted_at timestamp DEFAULT now() NOT NULL,
  extension text NOT NULL
);"
"CREATE TABLE IF NOT EXISTS storage.vector_indexes (
  dimension int4 NOT NULL,
  name text NOT NULL,
  bucket_id text NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  metadata_configuration jsonb,
  data_type text NOT NULL,
  id text DEFAULT gen_random_uuid() NOT NULL,
  distance_metric text NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);"
"CREATE TABLE IF NOT EXISTS auth.mfa_factors (
  last_webauthn_challenge_data jsonb,
  status factor_status NOT NULL,
  web_authn_aaguid uuid,
  last_challenged_at timestamptz,
  user_id uuid NOT NULL,
  web_authn_credential jsonb,
  phone text,
  updated_at timestamptz NOT NULL,
  friendly_name text,
  id uuid NOT NULL,
  factor_type factor_type NOT NULL,
  created_at timestamptz NOT NULL,
  secret text
);"
ALTER TABLE public.profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.last_smoke ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.connection ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact ENABLE ROW LEVEL SECURITY;
ALTER TABLE auth.refresh_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE auth.audit_log_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE auth.sso_domains ENABLE ROW LEVEL SECURITY;
ALTER TABLE auth.mfa_amr_claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE auth.identities ENABLE ROW LEVEL SECURITY;
ALTER TABLE auth.one_time_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE auth.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE auth.mfa_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE auth.sso_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE auth.mfa_factors ENABLE ROW LEVEL SECURITY;
ALTER TABLE auth.saml_relay_states ENABLE ROW LEVEL SECURITY;
ALTER TABLE auth.flow_state ENABLE ROW LEVEL SECURITY;
ALTER TABLE auth.saml_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE auth.instances ENABLE ROW LEVEL SECURITY;
ALTER TABLE auth.schema_migrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE storage.s3_multipart_uploads ENABLE ROW LEVEL SECURITY;
ALTER TABLE storage.migrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE storage.s3_multipart_uploads_parts ENABLE ROW LEVEL SECURITY;
ALTER TABLE storage.vector_indexes ENABLE ROW LEVEL SECURITY;
ALTER TABLE storage.buckets_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE storage.buckets ENABLE ROW LEVEL SECURITY;
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
ALTER TABLE storage.buckets_vectors ENABLE ROW LEVEL SECURITY;
ALTER TABLE realtime.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE auth.users ADD CONSTRAINT users_pkey PRIMARY KEY (id);
ALTER TABLE auth.refresh_tokens ADD CONSTRAINT refresh_tokens_pkey PRIMARY KEY (id);
ALTER TABLE auth.instances ADD CONSTRAINT instances_pkey PRIMARY KEY (id);
ALTER TABLE auth.audit_log_entries ADD CONSTRAINT audit_log_entries_pkey PRIMARY KEY (id);
ALTER TABLE vault.secrets ADD CONSTRAINT secrets_pkey PRIMARY KEY (id);
ALTER TABLE auth.identities ADD CONSTRAINT identities_user_id_fkey FOREIGN KEY (user_id);
ALTER TABLE auth.sessions ADD CONSTRAINT sessions_pkey PRIMARY KEY (id);
ALTER TABLE auth.sessions ADD CONSTRAINT sessions_user_id_fkey FOREIGN KEY (user_id);
ALTER TABLE auth.refresh_tokens ADD CONSTRAINT refresh_tokens_session_id_fkey FOREIGN KEY (session_id);
ALTER TABLE auth.mfa_factors ADD CONSTRAINT mfa_factors_pkey PRIMARY KEY (id);
ALTER TABLE auth.mfa_factors ADD CONSTRAINT mfa_factors_user_id_fkey FOREIGN KEY (user_id);
ALTER TABLE auth.mfa_challenges ADD CONSTRAINT mfa_challenges_pkey PRIMARY KEY (id);
ALTER TABLE auth.mfa_challenges ADD CONSTRAINT mfa_challenges_auth_factor_id_fkey FOREIGN KEY (factor_id);
ALTER TABLE auth.mfa_amr_claims ADD CONSTRAINT mfa_amr_claims_session_id_fkey FOREIGN KEY (session_id);
ALTER TABLE auth.mfa_amr_claims ADD CONSTRAINT amr_id_pk PRIMARY KEY (id);
ALTER TABLE auth.sso_providers ADD CONSTRAINT sso_providers_pkey PRIMARY KEY (id);
ALTER TABLE auth.sso_domains ADD CONSTRAINT sso_domains_pkey PRIMARY KEY (id);
ALTER TABLE auth.sso_domains ADD CONSTRAINT sso_domains_sso_provider_id_fkey FOREIGN KEY (sso_provider_id);
ALTER TABLE auth.saml_providers ADD CONSTRAINT saml_providers_pkey PRIMARY KEY (id);
ALTER TABLE auth.saml_providers ADD CONSTRAINT saml_providers_sso_provider_id_fkey FOREIGN KEY (sso_provider_id);
ALTER TABLE auth.saml_relay_states ADD CONSTRAINT saml_relay_states_pkey PRIMARY KEY (id);
ALTER TABLE auth.saml_relay_states ADD CONSTRAINT saml_relay_states_sso_provider_id_fkey FOREIGN KEY (sso_provider_id);
ALTER TABLE auth.flow_state ADD CONSTRAINT flow_state_pkey PRIMARY KEY (id);
ALTER TABLE auth.saml_relay_states ADD CONSTRAINT saml_relay_states_flow_state_id_fkey FOREIGN KEY (flow_state_id);
ALTER TABLE auth.identities ADD CONSTRAINT identities_pkey PRIMARY KEY (id);
ALTER TABLE auth.one_time_tokens ADD CONSTRAINT one_time_tokens_pkey PRIMARY KEY (id);
ALTER TABLE auth.one_time_tokens ADD CONSTRAINT one_time_tokens_user_id_fkey FOREIGN KEY (user_id);
ALTER TABLE auth.oauth_clients ADD CONSTRAINT oauth_clients_pkey PRIMARY KEY (id);
ALTER TABLE auth.oauth_authorizations ADD CONSTRAINT oauth_authorizations_pkey PRIMARY KEY (id);
ALTER TABLE auth.oauth_authorizations ADD CONSTRAINT oauth_authorizations_client_id_fkey FOREIGN KEY (client_id);
ALTER TABLE auth.oauth_authorizations ADD CONSTRAINT oauth_authorizations_user_id_fkey FOREIGN KEY (user_id);
ALTER TABLE auth.oauth_consents ADD CONSTRAINT oauth_consents_pkey PRIMARY KEY (id);
ALTER TABLE auth.oauth_consents ADD CONSTRAINT oauth_consents_user_id_fkey FOREIGN KEY (user_id);
ALTER TABLE auth.oauth_consents ADD CONSTRAINT oauth_consents_client_id_fkey FOREIGN KEY (client_id);
ALTER TABLE auth.sessions ADD CONSTRAINT sessions_oauth_client_id_fkey FOREIGN KEY (oauth_client_id);
ALTER TABLE auth.oauth_client_states ADD CONSTRAINT oauth_client_states_pkey PRIMARY KEY (id);
ALTER TABLE storage.s3_multipart_uploads_parts ADD CONSTRAINT s3_multipart_uploads_parts_upload_id_fkey FOREIGN KEY (upload_id);
ALTER TABLE auth.custom_oauth_providers ADD CONSTRAINT custom_oauth_providers_pkey PRIMARY KEY (id);
ALTER TABLE auth.webauthn_credentials ADD CONSTRAINT webauthn_credentials_pkey PRIMARY KEY (id);
ALTER TABLE auth.webauthn_credentials ADD CONSTRAINT webauthn_credentials_user_id_fkey FOREIGN KEY (user_id);
ALTER TABLE auth.webauthn_challenges ADD CONSTRAINT webauthn_challenges_pkey PRIMARY KEY (id);
ALTER TABLE auth.webauthn_challenges ADD CONSTRAINT webauthn_challenges_user_id_fkey FOREIGN KEY (user_id);
ALTER TABLE storage.buckets ADD CONSTRAINT buckets_pkey PRIMARY KEY (id);
ALTER TABLE storage.objects ADD CONSTRAINT objects_pkey PRIMARY KEY (id);
ALTER TABLE storage.objects ADD CONSTRAINT objects_bucketId_fkey FOREIGN KEY (bucket_id);
ALTER TABLE storage.s3_multipart_uploads ADD CONSTRAINT s3_multipart_uploads_pkey PRIMARY KEY (id);
ALTER TABLE storage.s3_multipart_uploads ADD CONSTRAINT s3_multipart_uploads_bucket_id_fkey FOREIGN KEY (bucket_id);
ALTER TABLE storage.s3_multipart_uploads_parts ADD CONSTRAINT s3_multipart_uploads_parts_pkey PRIMARY KEY (id);
ALTER TABLE storage.s3_multipart_uploads_parts ADD CONSTRAINT s3_multipart_uploads_parts_bucket_id_fkey FOREIGN KEY (bucket_id);
ALTER TABLE storage.buckets_analytics ADD CONSTRAINT buckets_analytics_pkey PRIMARY KEY (id);
ALTER TABLE realtime.subscription ADD CONSTRAINT pk_subscription PRIMARY KEY (id);
ALTER TABLE realtime.messages ADD CONSTRAINT messages_pkey PRIMARY KEY (id);
ALTER TABLE realtime.messages ADD CONSTRAINT messages_pkey PRIMARY KEY (inserted_at);
ALTER TABLE public.profile ADD CONSTRAINT profile_pkey PRIMARY KEY (id);
ALTER TABLE public.profile ADD CONSTRAINT profile_id_fkey FOREIGN KEY (id);
ALTER TABLE public.last_smoke ADD CONSTRAINT last_smoke_pkey PRIMARY KEY (id);
ALTER TABLE public.last_smoke ADD CONSTRAINT last_smoke_profile_id_fkey FOREIGN KEY (profile_id);
ALTER TABLE public.connection ADD CONSTRAINT connection_pkey PRIMARY KEY (id);
ALTER TABLE public.connection ADD CONSTRAINT connection_profile_id_fkey FOREIGN KEY (profile_id);
ALTER TABLE public.connection ADD CONSTRAINT connection_connection_id_fkey FOREIGN KEY (connection_id);
ALTER TABLE public.contact ADD CONSTRAINT contact_pkey PRIMARY KEY (profile_id);
ALTER TABLE public.contact ADD CONSTRAINT contact_profile_id_fkey FOREIGN KEY (profile_id);
ALTER TABLE public.chat ADD CONSTRAINT chat_id_fkey FOREIGN KEY (id);
ALTER TABLE realtime.messages_2026_07_14 ADD CONSTRAINT messages_2026_07_14_pkey PRIMARY KEY (id);
ALTER TABLE realtime.messages_2026_07_14 ADD CONSTRAINT messages_2026_07_14_pkey PRIMARY KEY (inserted_at);
ALTER TABLE realtime.messages_2026_07_15 ADD CONSTRAINT messages_2026_07_15_pkey PRIMARY KEY (id);
ALTER TABLE realtime.messages_2026_07_15 ADD CONSTRAINT messages_2026_07_15_pkey PRIMARY KEY (inserted_at);
ALTER TABLE realtime.messages_2026_07_16 ADD CONSTRAINT messages_2026_07_16_pkey PRIMARY KEY (id);
ALTER TABLE realtime.messages_2026_07_16 ADD CONSTRAINT messages_2026_07_16_pkey PRIMARY KEY (inserted_at);
ALTER TABLE realtime.messages_2026_07_18 ADD CONSTRAINT messages_2026_07_18_pkey PRIMARY KEY (id);
ALTER TABLE realtime.messages_2026_07_18 ADD CONSTRAINT messages_2026_07_18_pkey PRIMARY KEY (inserted_at);
ALTER TABLE realtime.messages_2026_07_17 ADD CONSTRAINT messages_2026_07_17_pkey PRIMARY KEY (id);
ALTER TABLE realtime.messages_2026_07_17 ADD CONSTRAINT messages_2026_07_17_pkey PRIMARY KEY (inserted_at);
ALTER TABLE public.chat ADD CONSTRAINT chat_pkey PRIMARY KEY (chat_id);
CREATE POLICY "Users can update their own profile" ON public.profile FOR UPDATE TO authenticated USING ((auth.uid() = id)) WITH CHECK ((auth.uid() = id));
CREATE POLICY "Allow public read access on profiles" ON public.profile FOR SELECT TO public USING (true);
CREATE POLICY "Users can update their own smoke data" ON public.last_smoke FOR UPDATE TO authenticated USING ((( SELECT auth.uid() AS uid) = profile_id)) WITH CHECK ((( SELECT auth.uid() AS uid) = profile_id));
CREATE POLICY "Users can insert their own smoke data" ON public.last_smoke FOR INSERT TO authenticated WITH CHECK ((( SELECT auth.uid() AS uid) = profile_id));
"CREATE POLICY ""Allow select for self and friends"" ON public.last_smoke FOR SELECT TO authenticated USING (((profile_id = auth.uid()) OR (EXISTS ( SELECT 1
   FROM connection
  WHERE (((connection.profile_id = auth.uid()) AND (connection.connection_id = last_smoke.profile_id)) OR ((connection.connection_id = auth.uid()) AND (connection.profile_id = last_smoke.profile_id)))))));"
CREATE POLICY "Users can view their own smoke data" ON public.last_smoke FOR SELECT TO authenticated USING ((auth.uid() = id));
CREATE POLICY "Pengguna dapat menghapus last_smoke milik sendiri" ON public.last_smoke FOR DELETE TO public USING ((auth.uid() = profile_id));
CREATE POLICY "Pengguna dapat memperbarui last_smoke milik sendiri" ON public.last_smoke FOR UPDATE TO public USING ((auth.uid() = profile_id));
CREATE POLICY "Pengguna dapat menambahkan last_smoke milik sendiri" ON public.last_smoke FOR INSERT TO public WITH CHECK ((auth.uid() = profile_id));
CREATE POLICY "Pengguna dapat melihat last_smoke milik sendiri" ON public.last_smoke FOR SELECT TO public USING ((auth.uid() = profile_id));
CREATE POLICY "Enable insert for authenticated users only" ON public.connection FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow update for recipients" ON public.connection FOR UPDATE TO authenticated USING ((auth.uid() = connection_id)) WITH CHECK ((auth.uid() = connection_id));
CREATE POLICY "Allow select for involved users" ON public.connection FOR SELECT TO authenticated USING (((profile_id = auth.uid()) OR (connection_id = auth.uid())));
"CREATE POLICY ""Allow friends to view contact"" ON public.contact FOR SELECT TO authenticated USING ((EXISTS ( SELECT 1
   FROM connection
  WHERE (((connection.profile_id = auth.uid()) AND (connection.connection_id = contact.profile_id)) OR ((connection.connection_id = auth.uid()) AND (connection.profile_id = contact.profile_id))))));"
CREATE POLICY "Users can manage their own contact" ON public.contact FOR ALL TO authenticated USING ((profile_id = auth.uid())) WITH CHECK ((profile_id = auth.uid()));
CREATE POLICY "Allow delete only for owner" ON public.contact FOR DELETE TO authenticated USING ((profile_id = auth.uid()));
CREATE POLICY "Allow update only for owner" ON public.contact FOR UPDATE TO authenticated USING ((profile_id = auth.uid())) WITH CHECK ((profile_id = auth.uid()));
CREATE POLICY "Allow insert only for owner" ON public.contact FOR INSERT TO authenticated WITH CHECK ((profile_id = auth.uid()));
"CREATE POLICY ""Allow view if owner or connected friend"" ON public.contact FOR SELECT TO authenticated USING (((profile_id = auth.uid()) OR (profile_id IN ( SELECT connection.connection_id
   FROM connection
  WHERE (connection.profile_id = auth.uid())
UNION
 SELECT connection.profile_id
   FROM connection
  WHERE (connection.connection_id = auth.uid())))));"
CREATE POLICY "pengguna terautentikasi bisa unggah, baca, hapus 1oj01fe_3" ON storage.objects FOR DELETE TO public USING ((auth.role() = 'authenticated'::text));
CREATE POLICY "pengguna terautentikasi bisa unggah, baca, hapus 1oj01fe_2" ON storage.objects FOR SELECT TO public USING ((auth.role() = 'authenticated'::text));
CREATE POLICY "pengguna terautentikasi bisa unggah, baca, hapus 1oj01fe_1" ON storage.objects FOR UPDATE TO public USING ((auth.role() = 'authenticated'::text));
CREATE POLICY "pengguna terautentikasi bisa unggah, baca, hapus 1oj01fe_0" ON storage.objects FOR INSERT TO public WITH CHECK ((auth.role() = 'authenticated'::text));
"CREATE POLICY ""Pengguna bisa mengirim chat ke koneksi mereka"" ON public.chat FOR INSERT TO public WITH CHECK ((((auth.uid())::text = sender) AND (EXISTS ( SELECT 1
   FROM connection c
  WHERE (((c.id)::text = (chat.id)::text) AND (((c.profile_id)::text = (auth.uid())::text) OR ((c.connection_id)::text = (auth.uid())::text)))))));"
"CREATE POLICY ""Pengguna bisa melihat chat di koneksi mereka"" ON public.chat FOR SELECT TO public USING ((EXISTS ( SELECT 1
   FROM connection c
  WHERE (((c.id)::text = (chat.id)::text) AND (((c.profile_id)::text = (auth.uid())::text) OR ((c.connection_id)::text = (auth.uid())::text))))));"
"CREATE OR REPLACE FUNCTION extensions.uuid_generate_v1()
RETURNS uuid
LANGUAGE c
AS $function$
uuid_generate_v1
$function$;"
"CREATE OR REPLACE FUNCTION extensions.uuid_generate_v1mc()
RETURNS uuid
LANGUAGE c
AS $function$
uuid_generate_v1mc
$function$;"
"CREATE OR REPLACE FUNCTION extensions.uuid_generate_v3()
RETURNS uuid
LANGUAGE c
AS $function$
uuid_generate_v3
$function$;"
"CREATE OR REPLACE FUNCTION extensions.uuid_generate_v4()
RETURNS uuid
LANGUAGE c
AS $function$
uuid_generate_v4
$function$;"
"CREATE OR REPLACE FUNCTION extensions.uuid_generate_v5()
RETURNS uuid
LANGUAGE c
AS $function$
uuid_generate_v5
$function$;"
"CREATE OR REPLACE FUNCTION extensions.digest()
RETURNS bytea
LANGUAGE c
AS $function$
pg_digest
$function$;"
"CREATE OR REPLACE FUNCTION extensions.digest()
RETURNS bytea
LANGUAGE c
AS $function$
pg_digest
$function$;"
"CREATE OR REPLACE FUNCTION auth.uid()
RETURNS uuid
LANGUAGE sql
AS $function$

  select 
  coalesce(
    nullif(current_setting('request.jwt.claim.sub', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'sub')
  )::uuid

$function$;"
"CREATE OR REPLACE FUNCTION auth.role()
RETURNS text
LANGUAGE sql
AS $function$

  select 
  coalesce(
    nullif(current_setting('request.jwt.claim.role', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'role')
  )::text

$function$;"
"CREATE OR REPLACE FUNCTION auth.email()
RETURNS text
LANGUAGE sql
AS $function$

  select 
  coalesce(
    nullif(current_setting('request.jwt.claim.email', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'email')
  )::text

$function$;"
"CREATE OR REPLACE FUNCTION extensions.uuid_nil()
RETURNS uuid
LANGUAGE c
AS $function$
uuid_nil
$function$;"
"CREATE OR REPLACE FUNCTION extensions.uuid_ns_dns()
RETURNS uuid
LANGUAGE c
AS $function$
uuid_ns_dns
$function$;"
"CREATE OR REPLACE FUNCTION extensions.uuid_ns_url()
RETURNS uuid
LANGUAGE c
AS $function$
uuid_ns_url
$function$;"
"CREATE OR REPLACE FUNCTION extensions.uuid_ns_oid()
RETURNS uuid
LANGUAGE c
AS $function$
uuid_ns_oid
$function$;"
"CREATE OR REPLACE FUNCTION extensions.uuid_ns_x500()
RETURNS uuid
LANGUAGE c
AS $function$
uuid_ns_x500
$function$;"
"CREATE OR REPLACE FUNCTION extensions.pgp_sym_decrypt_bytea()
RETURNS bytea
LANGUAGE c
AS $function$
pgp_sym_decrypt_bytea
$function$;"
"CREATE OR REPLACE FUNCTION extensions.pgp_sym_decrypt()
RETURNS text
LANGUAGE c
AS $function$
pgp_sym_decrypt_text
$function$;"
"CREATE OR REPLACE FUNCTION extensions.encrypt_iv()
RETURNS bytea
LANGUAGE c
AS $function$
pg_encrypt_iv
$function$;"
"CREATE OR REPLACE FUNCTION extensions.decrypt_iv()
RETURNS bytea
LANGUAGE c
AS $function$
pg_decrypt_iv
$function$;"
"CREATE OR REPLACE FUNCTION extensions.gen_random_bytes()
RETURNS bytea
LANGUAGE c
AS $function$
pg_random_bytes
$function$;"
"CREATE OR REPLACE FUNCTION extensions.gen_random_uuid()
RETURNS uuid
LANGUAGE c
AS $function$
pg_random_uuid
$function$;"
"CREATE OR REPLACE FUNCTION extensions.pgp_sym_encrypt()
RETURNS bytea
LANGUAGE c
AS $function$
pgp_sym_encrypt_text
$function$;"
"CREATE OR REPLACE FUNCTION extensions.pgp_sym_encrypt_bytea()
RETURNS bytea
LANGUAGE c
AS $function$
pgp_sym_encrypt_bytea
$function$;"
"CREATE OR REPLACE FUNCTION extensions.pgp_sym_encrypt()
RETURNS bytea
LANGUAGE c
AS $function$
pgp_sym_encrypt_text
$function$;"
"CREATE OR REPLACE FUNCTION extensions.pgp_sym_encrypt_bytea()
RETURNS bytea
LANGUAGE c
AS $function$
pgp_sym_encrypt_bytea
$function$;"
"CREATE OR REPLACE FUNCTION extensions.pgp_sym_decrypt()
RETURNS text
LANGUAGE c
AS $function$
pgp_sym_decrypt_text
$function$;"
"CREATE OR REPLACE FUNCTION extensions.hmac()
RETURNS bytea
LANGUAGE c
AS $function$
pg_hmac
$function$;"
"CREATE OR REPLACE FUNCTION extensions.hmac()
RETURNS bytea
LANGUAGE c
AS $function$
pg_hmac
$function$;"
"CREATE OR REPLACE FUNCTION extensions.pgp_pub_encrypt()
RETURNS bytea
LANGUAGE c
AS $function$
pgp_pub_encrypt_text
$function$;"
"CREATE OR REPLACE FUNCTION extensions.pgp_pub_decrypt()
RETURNS text
LANGUAGE c
AS $function$
pgp_pub_decrypt_text
$function$;"
"CREATE OR REPLACE FUNCTION extensions.pgp_pub_decrypt_bytea()
RETURNS bytea
LANGUAGE c
AS $function$
pgp_pub_decrypt_bytea
$function$;"
"CREATE OR REPLACE FUNCTION extensions.pgp_pub_decrypt()
RETURNS text
LANGUAGE c
AS $function$
pgp_pub_decrypt_text
$function$;"
"CREATE OR REPLACE FUNCTION extensions.pgp_pub_decrypt_bytea()
RETURNS bytea
LANGUAGE c
AS $function$
pgp_pub_decrypt_bytea
$function$;"
"CREATE OR REPLACE FUNCTION extensions.pgp_key_id()
RETURNS text
LANGUAGE c
AS $function$
pgp_key_id_w
$function$;"
"CREATE OR REPLACE FUNCTION extensions.armor()
RETURNS text
LANGUAGE c
AS $function$
pg_armor
$function$;"
"CREATE OR REPLACE FUNCTION extensions.armor()
RETURNS text
LANGUAGE c
AS $function$
pg_armor
$function$;"
"CREATE OR REPLACE FUNCTION extensions.dearmor()
RETURNS bytea
LANGUAGE c
AS $function$
pg_dearmor
$function$;"
"CREATE OR REPLACE FUNCTION extensions.pgrst_drop_watch()
RETURNS event_trigger
LANGUAGE plpgsql
AS $function$

DECLARE
  obj record;
BEGIN
  FOR obj IN SELECT * FROM pg_event_trigger_dropped_objects()
  LOOP
    IF obj.object_type IN (
      'schema'
    , 'table'
    , 'foreign table'
    , 'view'
    , 'materialized view'
    , 'function'
    , 'trigger'
    , 'type'
    , 'rule'
    )
    AND obj.is_temporary IS false -- no pg_temp objects
    THEN
      NOTIFY pgrst, 'reload schema';
    END IF;
  END LOOP;
END; 
$function$;"
"CREATE OR REPLACE FUNCTION extensions.pgp_armor_headers()
RETURNS SETOF record
LANGUAGE c
AS $function$
pgp_armor_headers
$function$;"
"CREATE OR REPLACE FUNCTION extensions.pg_stat_statements_info()
RETURNS record
LANGUAGE c
AS $function$
pg_stat_statements_info
$function$;"
"CREATE OR REPLACE FUNCTION extensions.pgrst_ddl_watch()
RETURNS event_trigger
LANGUAGE plpgsql
AS $function$

DECLARE
  cmd record;
BEGIN
  FOR cmd IN SELECT * FROM pg_event_trigger_ddl_commands()
  LOOP
    IF cmd.command_tag IN (
      'CREATE SCHEMA', 'ALTER SCHEMA'
    , 'CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO', 'ALTER TABLE'
    , 'CREATE FOREIGN TABLE', 'ALTER FOREIGN TABLE'
    , 'CREATE VIEW', 'ALTER VIEW'
    , 'CREATE MATERIALIZED VIEW', 'ALTER MATERIALIZED VIEW'
    , 'CREATE FUNCTION', 'ALTER FUNCTION'
    , 'CREATE TRIGGER'
    , 'CREATE TYPE', 'ALTER TYPE'
    , 'CREATE RULE'
    , 'COMMENT'
    )
    -- don't notify in case of CREATE TEMP table or other objects created on pg_temp
    AND cmd.schema_name is distinct from 'pg_temp'
    THEN
      NOTIFY pgrst, 'reload schema';
    END IF;
  END LOOP;
END; 
$function$;"
"CREATE OR REPLACE FUNCTION storage.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
AS $function$

BEGIN
    NEW.updated_at = now();
    RETURN NEW; 
END;

$function$;"
"CREATE OR REPLACE FUNCTION extensions.grant_pg_graphql_access()
RETURNS event_trigger
LANGUAGE plpgsql
AS $function$

begin
    if not exists (
        select 1
        from pg_event_trigger_ddl_commands() ev
        join pg_catalog.pg_extension e on ev.objid = e.oid
        where e.extname = 'pg_graphql'
    ) then
        return;
    end if;

    drop function if exists graphql_public.graphql;
    create or replace function graphql_public.graphql(
        ""operationName"" text default null,
        query text default null,
        variables jsonb default null,
        extensions jsonb default null
    )
        returns jsonb
        language sql
    as $$
        select graphql.resolve(
            query := query,
            variables := coalesce(variables, '{}'),
            ""operationName"" := ""operationName"",
            extensions := extensions
        );
    $$;

    -- Attach the wrapper to the extension so DROP EXTENSION cascades to it,
    -- which in turn triggers set_graphql_placeholder to reinstall the ""not enabled"" stub.
    alter extension pg_graphql add function graphql_public.graphql(text, text, jsonb, jsonb);

    grant usage on schema graphql to postgres, anon, authenticated, service_role;
    grant execute on function graphql.resolve to postgres, anon, authenticated, service_role;
    grant usage on schema graphql to postgres with grant option;
    grant usage on schema graphql_public to postgres with grant option;
end;

$function$;"
"CREATE OR REPLACE FUNCTION storage.can_insert_object()
RETURNS void
LANGUAGE plpgsql
AS $function$

BEGIN
  INSERT INTO ""storage"".""objects"" (""bucket_id"", ""name"", ""owner"", ""metadata"") VALUES (bucketid, name, owner, metadata);
  -- hack to rollback the successful insert
  RAISE sqlstate 'PT200' using
  message = 'ROLLBACK',
  detail = 'rollback successful insert';
END

$function$;"
"CREATE OR REPLACE FUNCTION realtime.cast()
RETURNS jsonb
LANGUAGE plpgsql
AS $function$

declare
  res jsonb;
begin
  if type_::text = 'bytea' then
    return to_jsonb(val);
  end if;
  execute format('select to_jsonb(%L::'|| type_::text || ')', val) into res;
  return res;
end

$function$;"
"CREATE OR REPLACE FUNCTION realtime.check_equality_op()
RETURNS boolean
LANGUAGE plpgsql
AS $function$

/*
Casts *val_1* and *val_2* as type *type_* and check the *op* condition for truthiness
*/
declare
    op_symbol text = (
        case
            when op = 'eq' then '='
            when op = 'neq' then '!='
            when op = 'lt' then '<'
            when op = 'lte' then '<='
            when op = 'gt' then '>'
            when op = 'gte' then '>='
            when op = 'in' then '= any'
            else 'UNKNOWN OP'
        end
    );
    res boolean;
begin
    execute format(
        'select %L::'|| type_::text || ' ' || op_symbol
        || ' ( %L::'
        || (
            case
                when op = 'in' then type_::text || '[]'
                else type_::text end
        )
        || ')', val_1, val_2) into res;
    return res;
end;

$function$;"
"CREATE OR REPLACE FUNCTION vault._crypto_aead_det_noncegen()
RETURNS bytea
LANGUAGE c
AS $function$
pgsodium_crypto_aead_det_noncegen
$function$;"
"CREATE OR REPLACE FUNCTION realtime.broadcast_changes()
RETURNS void
LANGUAGE plpgsql
AS $function$

DECLARE
    -- Declare a variable to hold the JSONB representation of the row
    row_data jsonb := '{}'::jsonb;
BEGIN
    IF level = 'STATEMENT' THEN
        RAISE EXCEPTION 'function can only be triggered for each row, not for each statement';
    END IF;
    -- Check the operation type and handle accordingly
    IF operation = 'INSERT' OR operation = 'UPDATE' OR operation = 'DELETE' THEN
        row_data := jsonb_build_object('old_record', OLD, 'record', NEW, 'operation', operation, 'table', table_name, 'schema', table_schema);
        PERFORM realtime.send (row_data, event_name, topic_name);
    ELSE
        RAISE EXCEPTION 'Unexpected operation type: %', operation;
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Failed to process the row: %', SQLERRM;
END;


$function$;"
"CREATE OR REPLACE FUNCTION vault._crypto_aead_det_encrypt()
RETURNS bytea
LANGUAGE c
AS $function$
pgsodium_crypto_aead_det_encrypt_by_id
$function$;"
"CREATE OR REPLACE FUNCTION vault.create_secret()
RETURNS uuid
LANGUAGE plpgsql
AS $function$

DECLARE
  rec record;
BEGIN
  INSERT INTO vault.secrets (secret, name, description)
  VALUES (
    new_secret,
    new_name,
    new_description
  )
  RETURNING * INTO rec;
  UPDATE vault.secrets s
  SET secret = encode(vault._crypto_aead_det_encrypt(
    message := convert_to(rec.secret, 'utf8'),
    additional := convert_to(s.id::text, 'utf8'),
    key_id := 0,
    context := 'pgsodium'::bytea,
    nonce := rec.nonce
  ), 'base64')
  WHERE id = rec.id;
  RETURN rec.id;
END

$function$;"
"CREATE OR REPLACE FUNCTION vault.update_secret()
RETURNS void
LANGUAGE plpgsql
AS $function$

DECLARE
  decrypted_secret text := (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE id = secret_id);
BEGIN
  UPDATE vault.secrets s
  SET
    secret = CASE WHEN new_secret IS NULL THEN s.secret
                  ELSE encode(vault._crypto_aead_det_encrypt(
                    message := convert_to(new_secret, 'utf8'),
                    additional := convert_to(s.id::text, 'utf8'),
                    key_id := 0,
                    context := 'pgsodium'::bytea,
                    nonce := s.nonce
                  ), 'base64') END,
    name = coalesce(new_name, s.name),
    description = coalesce(new_description, s.description),
    updated_at = now()
  WHERE s.id = secret_id;
END

$function$;"
"CREATE OR REPLACE FUNCTION vault._crypto_aead_det_decrypt()
RETURNS bytea
LANGUAGE c
AS $function$
pgsodium_crypto_aead_det_decrypt_by_id
$function$;"
"CREATE OR REPLACE FUNCTION extensions.pg_stat_statements_reset()
RETURNS timestamp with time zone
LANGUAGE c
AS $function$
pg_stat_statements_reset_1_11
$function$;"
"CREATE OR REPLACE FUNCTION extensions.crypt()
RETURNS text
LANGUAGE c
AS $function$
pg_crypt
$function$;"
"CREATE OR REPLACE FUNCTION extensions.gen_salt()
RETURNS text
LANGUAGE c
AS $function$
pg_gen_salt
$function$;"
"CREATE OR REPLACE FUNCTION extensions.gen_salt()
RETURNS text
LANGUAGE c
AS $function$
pg_gen_salt_rounds
$function$;"
"CREATE OR REPLACE FUNCTION extensions.encrypt()
RETURNS bytea
LANGUAGE c
AS $function$
pg_encrypt
$function$;"
"CREATE OR REPLACE FUNCTION extensions.decrypt()
RETURNS bytea
LANGUAGE c
AS $function$
pg_decrypt
$function$;"
"CREATE OR REPLACE FUNCTION extensions.pgp_sym_decrypt_bytea()
RETURNS bytea
LANGUAGE c
AS $function$
pgp_sym_decrypt_bytea
$function$;"
"CREATE OR REPLACE FUNCTION extensions.pgp_pub_encrypt_bytea()
RETURNS bytea
LANGUAGE c
AS $function$
pgp_pub_encrypt_bytea
$function$;"
"CREATE OR REPLACE FUNCTION extensions.pgp_pub_encrypt()
RETURNS bytea
LANGUAGE c
AS $function$
pgp_pub_encrypt_text
$function$;"
"CREATE OR REPLACE FUNCTION extensions.pgp_pub_encrypt_bytea()
RETURNS bytea
LANGUAGE c
AS $function$
pgp_pub_encrypt_bytea
$function$;"
"CREATE OR REPLACE FUNCTION extensions.pgp_pub_decrypt()
RETURNS text
LANGUAGE c
AS $function$
pgp_pub_decrypt_text
$function$;"
"CREATE OR REPLACE FUNCTION extensions.pgp_pub_decrypt_bytea()
RETURNS bytea
LANGUAGE c
AS $function$
pgp_pub_decrypt_bytea
$function$;"
"CREATE OR REPLACE FUNCTION extensions.pg_stat_statements()
RETURNS SETOF record
LANGUAGE c
AS $function$
pg_stat_statements_1_11
$function$;"
"CREATE OR REPLACE FUNCTION extensions.set_graphql_placeholder()
RETURNS event_trigger
LANGUAGE plpgsql
AS $function$

    DECLARE
    graphql_is_dropped bool;
    BEGIN
    graphql_is_dropped = (
        SELECT ev.schema_name = 'graphql_public'
        FROM pg_event_trigger_dropped_objects() AS ev
        WHERE ev.schema_name = 'graphql_public'
    );

    IF graphql_is_dropped
    THEN
        create or replace function graphql_public.graphql(
            ""operationName"" text default null,
            query text default null,
            variables jsonb default null,
            extensions jsonb default null
        )
            returns jsonb
            language plpgsql
        as $$
            DECLARE
                server_version float;
            BEGIN
                server_version = (SELECT (SPLIT_PART((select version()), ' ', 2))::float);

                IF server_version >= 14 THEN
                    RETURN jsonb_build_object(
                        'errors', jsonb_build_array(
                            jsonb_build_object(
                                'message', 'pg_graphql extension is not enabled.'
                            )
                        )
                    );
                ELSE
                    RETURN jsonb_build_object(
                        'errors', jsonb_build_array(
                            jsonb_build_object(
                                'message', 'pg_graphql is only available on projects running Postgres 14 onwards.'
                            )
                        )
                    );
                END IF;
            END;
        $$;
    END IF;

    END;

$function$;"
"CREATE OR REPLACE FUNCTION extensions.grant_pg_cron_access()
RETURNS event_trigger
LANGUAGE plpgsql
AS $function$

BEGIN
  IF EXISTS (
    SELECT
    FROM pg_event_trigger_ddl_commands() AS ev
    JOIN pg_extension AS ext
    ON ev.objid = ext.oid
    WHERE ext.extname = 'pg_cron'
  )
  THEN
    grant usage on schema cron to postgres with grant option;

    alter default privileges in schema cron grant all on tables to postgres with grant option;
    alter default privileges in schema cron grant all on functions to postgres with grant option;
    alter default privileges in schema cron grant all on sequences to postgres with grant option;

    alter default privileges for user supabase_admin in schema cron grant all
        on sequences to postgres with grant option;
    alter default privileges for user supabase_admin in schema cron grant all
        on tables to postgres with grant option;
    alter default privileges for user supabase_admin in schema cron grant all
        on functions to postgres with grant option;

    grant all privileges on all tables in schema cron to postgres with grant option;
    revoke all on table cron.job from postgres;
    grant select on table cron.job to postgres with grant option;
  END IF;
END;

$function$;"
"CREATE OR REPLACE FUNCTION extensions.grant_pg_net_access()
RETURNS event_trigger
LANGUAGE plpgsql
AS $function$

BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_event_trigger_ddl_commands() AS ev
    JOIN pg_extension AS ext
    ON ev.objid = ext.oid
    WHERE ext.extname = 'pg_net'
  )
  THEN
    IF NOT EXISTS (
      SELECT 1
      FROM pg_roles
      WHERE rolname = 'supabase_functions_admin'
    )
    THEN
      CREATE USER supabase_functions_admin NOINHERIT CREATEROLE LOGIN NOREPLICATION;
    END IF;

    GRANT USAGE ON SCHEMA net TO supabase_functions_admin, postgres, anon, authenticated, service_role;

    IF EXISTS (
      SELECT FROM pg_extension
      WHERE extname = 'pg_net'
      -- all versions in use on existing projects as of 2025-02-20
      -- version 0.12.0 onwards don't need these applied
      AND extversion IN ('0.2', '0.6', '0.7', '0.7.1', '0.8', '0.10.0', '0.11.0')
    ) THEN
      ALTER function net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) SECURITY DEFINER;
      ALTER function net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) SECURITY DEFINER;

      ALTER function net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) SET search_path = net;
      ALTER function net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) SET search_path = net;

      REVOKE ALL ON FUNCTION net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) FROM PUBLIC;
      REVOKE ALL ON FUNCTION net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) FROM PUBLIC;

      GRANT EXECUTE ON FUNCTION net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) TO supabase_functions_admin, postgres, anon, authenticated, service_role;
      GRANT EXECUTE ON FUNCTION net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) TO supabase_functions_admin, postgres, anon, authenticated, service_role;
    END IF;
  END IF;
END;

$function$;"
"CREATE OR REPLACE FUNCTION storage.filename()
RETURNS text
LANGUAGE plpgsql
AS $function$

DECLARE
_parts text[];
BEGIN
	select string_to_array(name, '/') into _parts;
	return _parts[array_length(_parts,1)];
END

$function$;"
"CREATE OR REPLACE FUNCTION graphql_public.graphql()
RETURNS jsonb
LANGUAGE plpgsql
AS $function$

            DECLARE
                server_version float;
            BEGIN
                server_version = (SELECT (SPLIT_PART((select version()), ' ', 2))::float);

                IF server_version >= 14 THEN
                    RETURN jsonb_build_object(
                        'errors', jsonb_build_array(
                            jsonb_build_object(
                                'message', 'pg_graphql extension is not enabled.'
                            )
                        )
                    );
                ELSE
                    RETURN jsonb_build_object(
                        'errors', jsonb_build_array(
                            jsonb_build_object(
                                'message', 'pg_graphql is only available on projects running Postgres 14 onwards.'
                            )
                        )
                    );
                END IF;
            END;
        
$function$;"
"CREATE OR REPLACE FUNCTION auth.jwt()
RETURNS jsonb
LANGUAGE sql
AS $function$

  select 
    coalesce(
        nullif(current_setting('request.jwt.claim', true), ''),
        nullif(current_setting('request.jwt.claims', true), '')
    )::jsonb

$function$;"
"CREATE OR REPLACE FUNCTION pgbouncer.get_auth()
RETURNS TABLE(username text, password text)
LANGUAGE plpgsql
AS $function$

  BEGIN
      RAISE DEBUG 'PgBouncer auth request: %', p_usename;

      RETURN QUERY
      SELECT
          rolname::text,
          CASE WHEN rolvaliduntil < now()
              THEN null
              ELSE rolpassword::text
          END
      FROM pg_authid
      WHERE rolname=$1 and rolcanlogin;
  END;
  
$function$;"
"CREATE OR REPLACE FUNCTION storage.extension()
RETURNS text
LANGUAGE plpgsql
AS $function$

DECLARE
    _parts text[];
    _filename text;
BEGIN
    -- Split on ""/"" to get path segments
    SELECT string_to_array(name, '/') INTO _parts;
    -- Get the last path segment (the actual filename)
    SELECT _parts[array_length(_parts, 1)] INTO _filename;
    -- Extract extension: reverse, split on '.', then reverse again
    RETURN reverse(split_part(reverse(_filename), '.', 1));
END

$function$;"
"CREATE OR REPLACE FUNCTION storage.foldername()
RETURNS text[]
LANGUAGE plpgsql
AS $function$

DECLARE
    _parts text[];
BEGIN
    -- Split on ""/"" to get path segments
    SELECT string_to_array(name, '/') INTO _parts;
    -- Return everything except the last segment
    RETURN _parts[1 : array_length(_parts,1) - 1];
END

$function$;"
"CREATE OR REPLACE FUNCTION storage.get_size_by_bucket()
RETURNS TABLE(size bigint, bucket_id text)
LANGUAGE plpgsql
AS $function$

BEGIN
    return query
        select sum((metadata->>'size')::bigint)::bigint as size, obj.bucket_id
        from ""storage"".objects as obj
        group by obj.bucket_id;
END

$function$;"
"CREATE OR REPLACE FUNCTION storage.list_multipart_uploads_with_delimiter()
RETURNS TABLE(key text, id text, created_at timestamp with time zone)
LANGUAGE plpgsql
AS $function$

BEGIN
    RETURN QUERY EXECUTE
        'SELECT DISTINCT ON(key COLLATE ""C"") * from (
            SELECT
                CASE
                    WHEN position($2 IN substring(key from length($1) + 1)) > 0 THEN
                        substring(key from 1 for length($1) + position($2 IN substring(key from length($1) + 1)))
                    ELSE
                        key
                END AS key, id, created_at
            FROM
                storage.s3_multipart_uploads
            WHERE
                bucket_id = $5 AND
                key ILIKE $1 || ''%'' AND
                CASE
                    WHEN $4 != '''' AND $6 = '''' THEN
                        CASE
                            WHEN position($2 IN substring(key from length($1) + 1)) > 0 THEN
                                substring(key from 1 for length($1) + position($2 IN substring(key from length($1) + 1))) COLLATE ""C"" > $4
                            ELSE
                                key COLLATE ""C"" > $4
                            END
                    ELSE
                        true
                END AND
                CASE
                    WHEN $6 != '''' THEN
                        id COLLATE ""C"" > $6
                    ELSE
                        true
                    END
            ORDER BY
                key COLLATE ""C"" ASC, created_at ASC) as e order by key COLLATE ""C"" LIMIT $3'
        USING prefix_param, delimiter_param, max_keys, next_key_token, bucket_id, next_upload_token;
END;

$function$;"
"CREATE OR REPLACE FUNCTION storage.operation()
RETURNS text
LANGUAGE plpgsql
AS $function$

BEGIN
    RETURN current_setting('storage.operation', true);
END;

$function$;"
"CREATE OR REPLACE FUNCTION storage.enforce_bucket_name_length()
RETURNS trigger
LANGUAGE plpgsql
AS $function$

begin
    if length(new.name) > 100 then
        raise exception 'bucket name ""%"" is too long (% characters). Max is 100.', new.name, length(new.name);
    end if;
    return new;
end;

$function$;"
"CREATE OR REPLACE FUNCTION storage.get_common_prefix()
RETURNS text
LANGUAGE sql
AS $function$

SELECT CASE
    WHEN position(p_delimiter IN substring(p_key FROM length(p_prefix) + 1)) > 0
    THEN left(p_key, length(p_prefix) + position(p_delimiter IN substring(p_key FROM length(p_prefix) + 1)))
    ELSE NULL
END;

$function$;"
"CREATE OR REPLACE FUNCTION storage.list_objects_with_delimiter()
RETURNS TABLE(name text, id uuid, metadata jsonb, updated_at timestamp with time zone, created_at timestamp with time zone, last_accessed_at timestamp with time zone)
LANGUAGE plpgsql
AS $function$

DECLARE
    v_peek_name TEXT;
    v_current RECORD;
    v_common_prefix TEXT;

    -- Configuration
    v_is_asc BOOLEAN;
    v_prefix TEXT;
    v_start TEXT;
    v_upper_bound TEXT;
    v_file_batch_size INT;

    -- Seek state
    v_next_seek TEXT;
    v_count INT := 0;

    -- Dynamic SQL for batch query only
    v_batch_query TEXT;

BEGIN
    -- ========================================================================
    -- INITIALIZATION
    -- ========================================================================
    v_is_asc := lower(coalesce(sort_order, 'asc')) = 'asc';
    v_prefix := coalesce(prefix_param, '');
    v_start := CASE WHEN coalesce(next_token, '') <> '' THEN next_token ELSE coalesce(start_after, '') END;
    v_file_batch_size := LEAST(GREATEST(max_keys * 2, 100), 1000);

    -- Calculate upper bound for prefix filtering (bytewise, using COLLATE ""C"")
    IF v_prefix = '' THEN
        v_upper_bound := NULL;
    ELSIF right(v_prefix, 1) = delimiter_param THEN
        v_upper_bound := left(v_prefix, -1) || chr(ascii(delimiter_param) + 1);
    ELSE
        v_upper_bound := left(v_prefix, -1) || chr(ascii(right(v_prefix, 1)) + 1);
    END IF;

    -- Build batch query (dynamic SQL - called infrequently, amortized over many rows)
    IF v_is_asc THEN
        IF v_upper_bound IS NOT NULL THEN
            v_batch_query := 'SELECT o.name, o.id, o.updated_at, o.created_at, o.last_accessed_at, o.metadata ' ||
                'FROM storage.objects o WHERE o.bucket_id = $1 AND o.name COLLATE ""C"" >= $2 ' ||
                'AND o.name COLLATE ""C"" < $3 ORDER BY o.name COLLATE ""C"" ASC LIMIT $4';
        ELSE
            v_batch_query := 'SELECT o.name, o.id, o.updated_at, o.created_at, o.last_accessed_at, o.metadata ' ||
                'FROM storage.objects o WHERE o.bucket_id = $1 AND o.name COLLATE ""C"" >= $2 ' ||
                'ORDER BY o.name COLLATE ""C"" ASC LIMIT $4';
        END IF;
    ELSE
        IF v_upper_bound IS NOT NULL THEN
            v_batch_query := 'SELECT o.name, o.id, o.updated_at, o.created_at, o.last_accessed_at, o.metadata ' ||
                'FROM storage.objects o WHERE o.bucket_id = $1 AND o.name COLLATE ""C"" < $2 ' ||
                'AND o.name COLLATE ""C"" >= $3 ORDER BY o.name COLLATE ""C"" DESC LIMIT $4';
        ELSE
            v_batch_query := 'SELECT o.name, o.id, o.updated_at, o.created_at, o.last_accessed_at, o.metadata ' ||
                'FROM storage.objects o WHERE o.bucket_id = $1 AND o.name COLLATE ""C"" < $2 ' ||
                'ORDER BY o.name COLLATE ""C"" DESC LIMIT $4';
        END IF;
    END IF;

    -- ========================================================================
    -- SEEK INITIALIZATION: Determine starting position
    -- ========================================================================
    IF v_start = '' THEN
        IF v_is_asc THEN
            v_next_seek := v_prefix;
        ELSE
            -- DESC without cursor: find the last item in range
            IF v_upper_bound IS NOT NULL THEN
                SELECT o.name INTO v_next_seek FROM storage.objects o
                WHERE o.bucket_id = _bucket_id AND o.name COLLATE ""C"" >= v_prefix AND o.name COLLATE ""C"" < v_upper_bound
                ORDER BY o.name COLLATE ""C"" DESC LIMIT 1;
            ELSIF v_prefix <> '' THEN
                SELECT o.name INTO v_next_seek FROM storage.objects o
                WHERE o.bucket_id = _bucket_id AND o.name COLLATE ""C"" >= v_prefix
                ORDER BY o.name COLLATE ""C"" DESC LIMIT 1;
            ELSE
                SELECT o.name INTO v_next_seek FROM storage.objects o
                WHERE o.bucket_id = _bucket_id
                ORDER BY o.name COLLATE ""C"" DESC LIMIT 1;
            END IF;

            IF v_next_seek IS NOT NULL THEN
                v_next_seek := v_next_seek || delimiter_param;
            ELSE
                RETURN;
            END IF;
        END IF;
    ELSE
        -- Cursor provided: determine if it refers to a folder or leaf
        IF EXISTS (
            SELECT 1 FROM storage.objects o
            WHERE o.bucket_id = _bucket_id
              AND o.name COLLATE ""C"" LIKE v_start || delimiter_param || '%'
            LIMIT 1
        ) THEN
            -- Cursor refers to a folder
            IF v_is_asc THEN
                v_next_seek := v_start || chr(ascii(delimiter_param) + 1);
            ELSE
                v_next_seek := v_start || delimiter_param;
            END IF;
        ELSE
            -- Cursor refers to a leaf object
            IF v_is_asc THEN
                v_next_seek := v_start || delimiter_param;
            ELSE
                v_next_seek := v_start;
            END IF;
        END IF;
    END IF;

    -- ========================================================================
    -- MAIN LOOP: Hybrid peek-then-batch algorithm
    -- Uses STATIC SQL for peek (hot path) and DYNAMIC SQL for batch
    -- ========================================================================
    LOOP
        EXIT WHEN v_count >= max_keys;

        -- STEP 1: PEEK using STATIC SQL (plan cached, very fast)
        IF v_is_asc THEN
            IF v_upper_bound IS NOT NULL THEN
                SELECT o.name INTO v_peek_name FROM storage.objects o
                WHERE o.bucket_id = _bucket_id AND o.name COLLATE ""C"" >= v_next_seek AND o.name COLLATE ""C"" < v_upper_bound
                ORDER BY o.name COLLATE ""C"" ASC LIMIT 1;
            ELSE
                SELECT o.name INTO v_peek_name FROM storage.objects o
                WHERE o.bucket_id = _bucket_id AND o.name COLLATE ""C"" >= v_next_seek
                ORDER BY o.name COLLATE ""C"" ASC LIMIT 1;
            END IF;
        ELSE
            IF v_upper_bound IS NOT NULL THEN
                SELECT o.name INTO v_peek_name FROM storage.objects o
                WHERE o.bucket_id = _bucket_id AND o.name COLLATE ""C"" < v_next_seek AND o.name COLLATE ""C"" >= v_prefix
                ORDER BY o.name COLLATE ""C"" DESC LIMIT 1;
            ELSIF v_prefix <> '' THEN
                SELECT o.name INTO v_peek_name FROM storage.objects o
                WHERE o.bucket_id = _bucket_id AND o.name COLLATE ""C"" < v_next_seek AND o.name COLLATE ""C"" >= v_prefix
                ORDER BY o.name COLLATE ""C"" DESC LIMIT 1;
            ELSE
                SELECT o.name INTO v_peek_name FROM storage.objects o
                WHERE o.bucket_id = _bucket_id AND o.name COLLATE ""C"" < v_next_seek
                ORDER BY o.name COLLATE ""C"" DESC LIMIT 1;
            END IF;
        END IF;

        EXIT WHEN v_peek_name IS NULL;

        -- STEP 2: Check if this is a FOLDER or FILE
        v_common_prefix := storage.get_common_prefix(v_peek_name, v_prefix, delimiter_param);

        IF v_common_prefix IS NOT NULL THEN
            -- FOLDER: Emit and skip to next folder (no heap access needed)
            name := rtrim(v_common_prefix, delimiter_param);
            id := NULL;
            updated_at := NULL;
            created_at := NULL;
            last_accessed_at := NULL;
            metadata := NULL;
            RETURN NEXT;
            v_count := v_count + 1;

            -- Advance seek past the folder range
            IF v_is_asc THEN
                v_next_seek := left(v_common_prefix, -1) || chr(ascii(delimiter_param) + 1);
            ELSE
                v_next_seek := v_common_prefix;
            END IF;
        ELSE
            -- FILE: Batch fetch using DYNAMIC SQL (overhead amortized over many rows)
            -- For ASC: upper_bound is the exclusive upper limit (< condition)
            -- For DESC: prefix is the inclusive lower limit (>= condition)
            FOR v_current IN EXECUTE v_batch_query USING _bucket_id, v_next_seek,
                CASE WHEN v_is_asc THEN COALESCE(v_upper_bound, v_prefix) ELSE v_prefix END, v_file_batch_size
            LOOP
                v_common_prefix := storage.get_common_prefix(v_current.name, v_prefix, delimiter_param);

                IF v_common_prefix IS NOT NULL THEN
                    -- Hit a folder: exit batch, let peek handle it
                    v_next_seek := v_current.name;
                    EXIT;
                END IF;

                -- Emit file
                name := v_current.name;
                id := v_current.id;
                updated_at := v_current.updated_at;
                created_at := v_current.created_at;
                last_accessed_at := v_current.last_accessed_at;
                metadata := v_current.metadata;
                RETURN NEXT;
                v_count := v_count + 1;

                -- Advance seek past this file
                IF v_is_asc THEN
                    v_next_seek := v_current.name || delimiter_param;
                ELSE
                    v_next_seek := v_current.name;
                END IF;

                EXIT WHEN v_count >= max_keys;
            END LOOP;
        END IF;
    END LOOP;
END;

$function$;"
"CREATE OR REPLACE FUNCTION storage.search()
RETURNS TABLE(name text, id uuid, updated_at timestamp with time zone, created_at timestamp with time zone, last_accessed_at timestamp with time zone, metadata jsonb)
LANGUAGE plpgsql
AS $function$

DECLARE
    v_peek_name TEXT;
    v_current RECORD;
    v_common_prefix TEXT;
    v_delimiter CONSTANT TEXT := '/';

    -- Configuration
    v_limit INT;
    v_prefix TEXT;
    v_prefix_lower TEXT;
    v_is_asc BOOLEAN;
    v_order_by TEXT;
    v_sort_order TEXT;
    v_upper_bound TEXT;
    v_file_batch_size INT;

    -- Dynamic SQL for batch query only
    v_batch_query TEXT;

    -- Seek state
    v_next_seek TEXT;
    v_count INT := 0;
    v_skipped INT := 0;
BEGIN
    -- ========================================================================
    -- INITIALIZATION
    -- ========================================================================
    v_limit := LEAST(coalesce(limits, 100), 1500);
    v_prefix := coalesce(prefix, '') || coalesce(search, '');
    v_prefix_lower := lower(v_prefix);
    v_is_asc := lower(coalesce(sortorder, 'asc')) = 'asc';
    v_file_batch_size := LEAST(GREATEST(v_limit * 2, 100), 1000);

    -- Validate sort column
    CASE lower(coalesce(sortcolumn, 'name'))
        WHEN 'name' THEN v_order_by := 'name';
        WHEN 'updated_at' THEN v_order_by := 'updated_at';
        WHEN 'created_at' THEN v_order_by := 'created_at';
        WHEN 'last_accessed_at' THEN v_order_by := 'last_accessed_at';
        ELSE v_order_by := 'name';
    END CASE;

    v_sort_order := CASE WHEN v_is_asc THEN 'asc' ELSE 'desc' END;

    -- ========================================================================
    -- NON-NAME SORTING: Use path_tokens approach (unchanged)
    -- ========================================================================
    IF v_order_by != 'name' THEN
        RETURN QUERY EXECUTE format(
            $sql$
            WITH folders AS (
                SELECT path_tokens[$1] AS folder
                FROM storage.objects
                WHERE objects.name ILIKE $2 || '%%'
                  AND bucket_id = $3
                  AND array_length(objects.path_tokens, 1) <> $1
                GROUP BY folder
                ORDER BY folder %s
            )
            (SELECT folder AS ""name"",
                   NULL::uuid AS id,
                   NULL::timestamptz AS updated_at,
                   NULL::timestamptz AS created_at,
                   NULL::timestamptz AS last_accessed_at,
                   NULL::jsonb AS metadata FROM folders)
            UNION ALL
            (SELECT path_tokens[$1] AS ""name"",
                   id, updated_at, created_at, last_accessed_at, metadata
             FROM storage.objects
             WHERE objects.name ILIKE $2 || '%%'
               AND bucket_id = $3
               AND array_length(objects.path_tokens, 1) = $1
             ORDER BY %I %s)
            LIMIT $4 OFFSET $5
            $sql$, v_sort_order, v_order_by, v_sort_order
        ) USING levels, v_prefix, bucketname, v_limit, offsets;
        RETURN;
    END IF;

    -- ========================================================================
    -- NAME SORTING: Hybrid skip-scan with batch optimization
    -- ========================================================================

    -- Calculate upper bound for prefix filtering
    IF v_prefix_lower = '' THEN
        v_upper_bound := NULL;
    ELSIF right(v_prefix_lower, 1) = v_delimiter THEN
        v_upper_bound := left(v_prefix_lower, -1) || chr(ascii(v_delimiter) + 1);
    ELSE
        v_upper_bound := left(v_prefix_lower, -1) || chr(ascii(right(v_prefix_lower, 1)) + 1);
    END IF;

    -- Build batch query (dynamic SQL - called infrequently, amortized over many rows)
    IF v_is_asc THEN
        IF v_upper_bound IS NOT NULL THEN
            v_batch_query := 'SELECT o.name, o.id, o.updated_at, o.created_at, o.last_accessed_at, o.metadata ' ||
                'FROM storage.objects o WHERE o.bucket_id = $1 AND lower(o.name) COLLATE ""C"" >= $2 ' ||
                'AND lower(o.name) COLLATE ""C"" < $3 ORDER BY lower(o.name) COLLATE ""C"" ASC LIMIT $4';
        ELSE
            v_batch_query := 'SELECT o.name, o.id, o.updated_at, o.created_at, o.last_accessed_at, o.metadata ' ||
                'FROM storage.objects o WHERE o.bucket_id = $1 AND lower(o.name) COLLATE ""C"" >= $2 ' ||
                'ORDER BY lower(o.name) COLLATE ""C"" ASC LIMIT $4';
        END IF;
    ELSE
        IF v_upper_bound IS NOT NULL THEN
            v_batch_query := 'SELECT o.name, o.id, o.updated_at, o.created_at, o.last_accessed_at, o.metadata ' ||
                'FROM storage.objects o WHERE o.bucket_id = $1 AND lower(o.name) COLLATE ""C"" < $2 ' ||
                'AND lower(o.name) COLLATE ""C"" >= $3 ORDER BY lower(o.name) COLLATE ""C"" DESC LIMIT $4';
        ELSE
            v_batch_query := 'SELECT o.name, o.id, o.updated_at, o.created_at, o.last_accessed_at, o.metadata ' ||
                'FROM storage.objects o WHERE o.bucket_id = $1 AND lower(o.name) COLLATE ""C"" < $2 ' ||
                'ORDER BY lower(o.name) COLLATE ""C"" DESC LIMIT $4';
        END IF;
    END IF;

    -- Initialize seek position
    IF v_is_asc THEN
        v_next_seek := v_prefix_lower;
    ELSE
        -- DESC: find the last item in range first (static SQL)
        IF v_upper_bound IS NOT NULL THEN
            SELECT o.name INTO v_peek_name FROM storage.objects o
            WHERE o.bucket_id = bucketname AND lower(o.name) COLLATE ""C"" >= v_prefix_lower AND lower(o.name) COLLATE ""C"" < v_upper_bound
            ORDER BY lower(o.name) COLLATE ""C"" DESC LIMIT 1;
        ELSIF v_prefix_lower <> '' THEN
            SELECT o.name INTO v_peek_name FROM storage.objects o
            WHERE o.bucket_id = bucketname AND lower(o.name) COLLATE ""C"" >= v_prefix_lower
            ORDER BY lower(o.name) COLLATE ""C"" DESC LIMIT 1;
        ELSE
            SELECT o.name INTO v_peek_name FROM storage.objects o
            WHERE o.bucket_id = bucketname
            ORDER BY lower(o.name) COLLATE ""C"" DESC LIMIT 1;
        END IF;

        IF v_peek_name IS NOT NULL THEN
            v_next_seek := lower(v_peek_name) || v_delimiter;
        ELSE
            RETURN;
        END IF;
    END IF;

    -- ========================================================================
    -- MAIN LOOP: Hybrid peek-then-batch algorithm
    -- Uses STATIC SQL for peek (hot path) and DYNAMIC SQL for batch
    -- ========================================================================
    LOOP
        EXIT WHEN v_count >= v_limit;

        -- STEP 1: PEEK using STATIC SQL (plan cached, very fast)
        IF v_is_asc THEN
            IF v_upper_bound IS NOT NULL THEN
                SELECT o.name INTO v_peek_name FROM storage.objects o
                WHERE o.bucket_id = bucketname AND lower(o.name) COLLATE ""C"" >= v_next_seek AND lower(o.name) COLLATE ""C"" < v_upper_bound
                ORDER BY lower(o.name) COLLATE ""C"" ASC LIMIT 1;
            ELSE
                SELECT o.name INTO v_peek_name FROM storage.objects o
                WHERE o.bucket_id = bucketname AND lower(o.name) COLLATE ""C"" >= v_next_seek
                ORDER BY lower(o.name) COLLATE ""C"" ASC LIMIT 1;
            END IF;
        ELSE
            IF v_upper_bound IS NOT NULL THEN
                SELECT o.name INTO v_peek_name FROM storage.objects o
                WHERE o.bucket_id = bucketname AND lower(o.name) COLLATE ""C"" < v_next_seek AND lower(o.name) COLLATE ""C"" >= v_prefix_lower
                ORDER BY lower(o.name) COLLATE ""C"" DESC LIMIT 1;
            ELSIF v_prefix_lower <> '' THEN
                SELECT o.name INTO v_peek_name FROM storage.objects o
                WHERE o.bucket_id = bucketname AND lower(o.name) COLLATE ""C"" < v_next_seek AND lower(o.name) COLLATE ""C"" >= v_prefix_lower
                ORDER BY lower(o.name) COLLATE ""C"" DESC LIMIT 1;
            ELSE
                SELECT o.name INTO v_peek_name FROM storage.objects o
                WHERE o.bucket_id = bucketname AND lower(o.name) COLLATE ""C"" < v_next_seek
                ORDER BY lower(o.name) COLLATE ""C"" DESC LIMIT 1;
            END IF;
        END IF;

        EXIT WHEN v_peek_name IS NULL;

        -- STEP 2: Check if this is a FOLDER or FILE
        v_common_prefix := storage.get_common_prefix(lower(v_peek_name), v_prefix_lower, v_delimiter);

        IF v_common_prefix IS NOT NULL THEN
            -- FOLDER: Handle offset, emit if needed, skip to next folder
            IF v_skipped < offsets THEN
                v_skipped := v_skipped + 1;
            ELSE
                name := split_part(rtrim(storage.get_common_prefix(v_peek_name, v_prefix, v_delimiter), v_delimiter), v_delimiter, levels);
                id := NULL;
                updated_at := NULL;
                created_at := NULL;
                last_accessed_at := NULL;
                metadata := NULL;
                RETURN NEXT;
                v_count := v_count + 1;
            END IF;

            -- Advance seek past the folder range
            IF v_is_asc THEN
                v_next_seek := lower(left(v_common_prefix, -1)) || chr(ascii(v_delimiter) + 1);
            ELSE
                v_next_seek := lower(v_common_prefix);
            END IF;
        ELSE
            -- FILE: Batch fetch using DYNAMIC SQL (overhead amortized over many rows)
            -- For ASC: upper_bound is the exclusive upper limit (< condition)
            -- For DESC: prefix_lower is the inclusive lower limit (>= condition)
            FOR v_current IN EXECUTE v_batch_query
                USING bucketname, v_next_seek,
                    CASE WHEN v_is_asc THEN COALESCE(v_upper_bound, v_prefix_lower) ELSE v_prefix_lower END, v_file_batch_size
            LOOP
                v_common_prefix := storage.get_common_prefix(lower(v_current.name), v_prefix_lower, v_delimiter);

                IF v_common_prefix IS NOT NULL THEN
                    -- Hit a folder: exit batch, let peek handle it
                    v_next_seek := lower(v_current.name);
                    EXIT;
                END IF;

                -- Handle offset skipping
                IF v_skipped < offsets THEN
                    v_skipped := v_skipped + 1;
                ELSE
                    -- Emit file
                    name := split_part(v_current.name, v_delimiter, levels);
                    id := v_current.id;
                    updated_at := v_current.updated_at;
                    created_at := v_current.created_at;
                    last_accessed_at := v_current.last_accessed_at;
                    metadata := v_current.metadata;
                    RETURN NEXT;
                    v_count := v_count + 1;
                END IF;

                -- Advance seek past this file
                IF v_is_asc THEN
                    v_next_seek := lower(v_current.name) || v_delimiter;
                ELSE
                    v_next_seek := lower(v_current.name);
                END IF;

                EXIT WHEN v_count >= v_limit;
            END LOOP;
        END IF;
    END LOOP;
END;

$function$;"
"CREATE OR REPLACE FUNCTION storage.search_v2()
RETURNS TABLE(key text, name text, id uuid, updated_at timestamp with time zone, created_at timestamp with time zone, last_accessed_at timestamp with time zone, metadata jsonb)
LANGUAGE plpgsql
AS $function$

DECLARE
    v_sort_col text;
    v_sort_ord text;
    v_limit int;
BEGIN
    -- Cap limit to maximum of 1500 records
    v_limit := LEAST(coalesce(limits, 100), 1500);

    -- Validate and normalize sort_order
    v_sort_ord := lower(coalesce(sort_order, 'asc'));
    IF v_sort_ord NOT IN ('asc', 'desc') THEN
        v_sort_ord := 'asc';
    END IF;

    -- Validate and normalize sort_column
    v_sort_col := lower(coalesce(sort_column, 'name'));
    IF v_sort_col NOT IN ('name', 'updated_at', 'created_at') THEN
        v_sort_col := 'name';
    END IF;

    -- Route to appropriate implementation
    IF v_sort_col = 'name' THEN
        -- Use list_objects_with_delimiter for name sorting (most efficient: O(k * log n))
        RETURN QUERY
        SELECT
            split_part(l.name, '/', levels) AS key,
            l.name AS name,
            l.id,
            l.updated_at,
            l.created_at,
            l.last_accessed_at,
            l.metadata
        FROM storage.list_objects_with_delimiter(
            bucket_name,
            coalesce(prefix, ''),
            '/',
            v_limit,
            start_after,
            '',
            v_sort_ord
        ) l;
    ELSE
        -- Use aggregation approach for timestamp sorting
        -- Not efficient for large datasets but supports correct pagination
        RETURN QUERY SELECT * FROM storage.search_by_timestamp(
            prefix, bucket_name, v_limit, levels, start_after,
            v_sort_ord, v_sort_col, sort_column_after
        );
    END IF;
END;

$function$;"
"CREATE OR REPLACE FUNCTION storage.search_by_timestamp()
RETURNS TABLE(key text, name text, id uuid, updated_at timestamp with time zone, created_at timestamp with time zone, last_accessed_at timestamp with time zone, metadata jsonb)
LANGUAGE plpgsql
AS $function$

DECLARE
    v_cursor_op text;
    v_query text;
    v_prefix text;
BEGIN
    v_prefix := coalesce(p_prefix, '');

    IF p_sort_order = 'asc' THEN
        v_cursor_op := '>';
    ELSE
        v_cursor_op := '<';
    END IF;

    v_query := format($sql$
        WITH raw_objects AS (
            SELECT
                o.name AS obj_name,
                o.id AS obj_id,
                o.updated_at AS obj_updated_at,
                o.created_at AS obj_created_at,
                o.last_accessed_at AS obj_last_accessed_at,
                o.metadata AS obj_metadata,
                storage.get_common_prefix(o.name, $1, '/') AS common_prefix
            FROM storage.objects o
            WHERE o.bucket_id = $2
              AND o.name COLLATE ""C"" LIKE $1 || '%%'
        ),
        -- Aggregate common prefixes (folders)
        -- Both created_at and updated_at use MIN(obj_created_at) to match the old prefixes table behavior
        aggregated_prefixes AS (
            SELECT
                rtrim(common_prefix, '/') AS name,
                NULL::uuid AS id,
                MIN(obj_created_at) AS updated_at,
                MIN(obj_created_at) AS created_at,
                NULL::timestamptz AS last_accessed_at,
                NULL::jsonb AS metadata,
                TRUE AS is_prefix
            FROM raw_objects
            WHERE common_prefix IS NOT NULL
            GROUP BY common_prefix
        ),
        leaf_objects AS (
            SELECT
                obj_name AS name,
                obj_id AS id,
                obj_updated_at AS updated_at,
                obj_created_at AS created_at,
                obj_last_accessed_at AS last_accessed_at,
                obj_metadata AS metadata,
                FALSE AS is_prefix
            FROM raw_objects
            WHERE common_prefix IS NULL
        ),
        combined AS (
            SELECT * FROM aggregated_prefixes
            UNION ALL
            SELECT * FROM leaf_objects
        ),
        filtered AS (
            SELECT *
            FROM combined
            WHERE (
                $5 = ''
                OR ROW(
                    date_trunc('milliseconds', %I),
                    name COLLATE ""C""
                ) %s ROW(
                    COALESCE(NULLIF($6, '')::timestamptz, 'epoch'::timestamptz),
                    $5
                )
            )
        )
        SELECT
            split_part(name, '/', $3) AS key,
            name,
            id,
            updated_at,
            created_at,
            last_accessed_at,
            metadata
        FROM filtered
        ORDER BY
            COALESCE(date_trunc('milliseconds', %I), 'epoch'::timestamptz) %s,
            name COLLATE ""C"" %s
        LIMIT $4
    $sql$,
        p_sort_column,
        v_cursor_op,
        p_sort_column,
        p_sort_order,
        p_sort_order
    );

    RETURN QUERY EXECUTE v_query
    USING v_prefix, p_bucket_id, p_level, p_limit, p_start_after, p_sort_column_after;
END;

$function$;"
"CREATE OR REPLACE FUNCTION storage.protect_delete()
RETURNS trigger
LANGUAGE plpgsql
AS $function$

BEGIN
    -- Check if storage.allow_delete_query is set to 'true'
    IF COALESCE(current_setting('storage.allow_delete_query', true), 'false') != 'true' THEN
        RAISE EXCEPTION 'Direct deletion from storage tables is not allowed. Use the Storage API instead.'
            USING HINT = 'This prevents accidental data loss from orphaned objects.',
                  ERRCODE = '42501';
    END IF;
    RETURN NULL;
END;

$function$;"
"CREATE OR REPLACE FUNCTION storage.allow_only_operation()
RETURNS boolean
LANGUAGE sql
AS $function$

  WITH current_operation AS (
    SELECT storage.operation() AS raw_operation
  ),
  normalized AS (
    SELECT
      CASE
        WHEN raw_operation LIKE 'storage.%' THEN substr(raw_operation, 9)
        ELSE raw_operation
      END AS current_operation,
      CASE
        WHEN expected_operation LIKE 'storage.%' THEN substr(expected_operation, 9)
        ELSE expected_operation
      END AS requested_operation
    FROM current_operation
  )
  SELECT CASE
    WHEN requested_operation IS NULL OR requested_operation = '' THEN FALSE
    ELSE COALESCE(current_operation = requested_operation, FALSE)
  END
  FROM normalized;

$function$;"
"CREATE OR REPLACE FUNCTION storage.allow_any_operation()
RETURNS boolean
LANGUAGE sql
AS $function$

  WITH current_operation AS (
    SELECT storage.operation() AS raw_operation
  ),
  normalized AS (
    SELECT CASE
      WHEN raw_operation LIKE 'storage.%' THEN substr(raw_operation, 9)
      ELSE raw_operation
    END AS current_operation
    FROM current_operation
  )
  SELECT EXISTS (
    SELECT 1
    FROM normalized n
    CROSS JOIN LATERAL unnest(expected_operations) AS expected_operation
    WHERE expected_operation IS NOT NULL
      AND expected_operation <> ''
      AND n.current_operation = CASE
        WHEN expected_operation LIKE 'storage.%' THEN substr(expected_operation, 9)
        ELSE expected_operation
      END
  );

$function$;"
"CREATE OR REPLACE FUNCTION public.rls_auto_enable()
RETURNS event_trigger
LANGUAGE plpgsql
AS $function$

DECLARE
  cmd record;
BEGIN
  FOR cmd IN
    SELECT *
    FROM pg_event_trigger_ddl_commands()
    WHERE command_tag IN ('CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO')
      AND object_type IN ('table','partitioned table')
  LOOP
     IF cmd.schema_name IS NOT NULL AND cmd.schema_name IN ('public') AND cmd.schema_name NOT IN ('pg_catalog','information_schema') AND cmd.schema_name NOT LIKE 'pg_toast%' AND cmd.schema_name NOT LIKE 'pg_temp%' THEN
      BEGIN
        EXECUTE format('alter table if exists %s enable row level security', cmd.object_identity);
        RAISE LOG 'rls_auto_enable: enabled RLS on %', cmd.object_identity;
      EXCEPTION
        WHEN OTHERS THEN
          RAISE LOG 'rls_auto_enable: failed to enable RLS on %', cmd.object_identity;
      END;
     ELSE
        RAISE LOG 'rls_auto_enable: skip % (either system schema or not in enforced list: %.)', cmd.object_identity, cmd.schema_name;
     END IF;
  END LOOP;
END;

$function$;"
"CREATE OR REPLACE FUNCTION realtime.apply_rls()
RETURNS SETOF realtime.wal_rls
LANGUAGE plpgsql
AS $function$

declare
    -- Regclass of the table e.g. public.notes
    entity_ regclass = (quote_ident(wal ->> 'schema') || '.' || quote_ident(wal ->> 'table'))::regclass;

    -- I, U, D, T: insert, update ...
    action realtime.action = (
        case wal ->> 'action'
            when 'I' then 'INSERT'
            when 'U' then 'UPDATE'
            when 'D' then 'DELETE'
            else 'ERROR'
        end
    );

    -- Is row level security enabled for the table
    is_rls_enabled bool = relrowsecurity from pg_class where oid = entity_;

    subscriptions realtime.subscription[] = array_agg(subs)
        from
            realtime.subscription subs
        where
            subs.entity = entity_
            -- Filter by action early - only get subscriptions interested in this action
            -- action_filter column can be: '*' (all), 'INSERT', 'UPDATE', or 'DELETE'
            and (subs.action_filter = '*' or subs.action_filter = action::text);

    -- Subscription vars
    working_role regrole;
    working_selected_columns text[];
    claimed_role regrole;
    claims jsonb;

    subscription_id uuid;
    subscription_has_access bool;
    visible_to_subscription_ids uuid[] = '{}';

    -- structured info for wal's columns
    columns realtime.wal_column[];
    -- previous identity values for update/delete
    old_columns realtime.wal_column[];

    error_record_exceeds_max_size boolean = octet_length(wal::text) > max_record_bytes;

    -- Primary jsonb output for record
    output jsonb;

    -- Loop record for iterating unique roles (outer loop)
    role_record record;
    -- Loop record for iterating unique selected_columns within a role (inner loop)
    cols_record record;
    -- Subscription ids visible at the role level (before fanning out by selected_columns)
    visible_role_sub_ids uuid[] = '{}';

begin
    perform set_config('role', null, true);

    columns =
        array_agg(
            (
                x->>'name',
                x->>'type',
                x->>'typeoid',
                realtime.cast(
                    (x->'value') #>> '{}',
                    coalesce(
                        (x->>'typeoid')::regtype, -- null when wal2json version <= 2.4
                        (x->>'type')::regtype
                    )
                ),
                (pks ->> 'name') is not null,
                true
            )::realtime.wal_column
        )
        from
            jsonb_array_elements(wal -> 'columns') x
            left join jsonb_array_elements(wal -> 'pk') pks
                on (x ->> 'name') = (pks ->> 'name');

    old_columns =
        array_agg(
            (
                x->>'name',
                x->>'type',
                x->>'typeoid',
                realtime.cast(
                    (x->'value') #>> '{}',
                    coalesce(
                        (x->>'typeoid')::regtype, -- null when wal2json version <= 2.4
                        (x->>'type')::regtype
                    )
                ),
                (pks ->> 'name') is not null,
                true
            )::realtime.wal_column
        )
        from
            jsonb_array_elements(wal -> 'identity') x
            left join jsonb_array_elements(wal -> 'pk') pks
                on (x ->> 'name') = (pks ->> 'name');

    for role_record in
        select claims_role
        from (select distinct claims_role from unnest(subscriptions)) t
        order by claims_role::text
    loop
        working_role := role_record.claims_role;

        -- Update `is_selectable` for columns and old_columns (once per role)
        columns =
            array_agg(
                (
                    c.name,
                    c.type_name,
                    c.type_oid,
                    c.value,
                    c.is_pkey,
                    pg_catalog.has_column_privilege(working_role, entity_, c.name, 'SELECT')
                )::realtime.wal_column
            )
            from
                unnest(columns) c;

        old_columns =
                array_agg(
                    (
                        c.name,
                        c.type_name,
                        c.type_oid,
                        c.value,
                        c.is_pkey,
                        pg_catalog.has_column_privilege(working_role, entity_, c.name, 'SELECT')
                    )::realtime.wal_column
                )
                from
                    unnest(old_columns) c;

        if action <> 'DELETE' and count(1) = 0 from unnest(columns) c where c.is_pkey then
            -- Fan out 400 error per distinct selected_columns for this role
            for cols_record in
                select selected_columns
                from (select distinct selected_columns from unnest(subscriptions) s where s.claims_role = working_role) t
                order by coalesce(array_to_string(selected_columns, ','), '')
            loop
                working_selected_columns := cols_record.selected_columns;
                return next (
                    jsonb_build_object(
                        'schema', wal ->> 'schema',
                        'table', wal ->> 'table',
                        'type', action
                    ),
                    is_rls_enabled,
                    (select array_agg(s.subscription_id) from unnest(subscriptions) as s where s.claims_role = working_role and (s.selected_columns is not distinct from working_selected_columns)),
                    array['Error 400: Bad Request, no primary key']
                )::realtime.wal_rls;
            end loop;

        -- The claims role does not have SELECT permission to the primary key of entity
        elsif action <> 'DELETE' and sum(c.is_selectable::int) <> count(1) from unnest(columns) c where c.is_pkey then
            -- Fan out 401 error per distinct selected_columns for this role
            for cols_record in
                select selected_columns
                from (select distinct selected_columns from unnest(subscriptions) s where s.claims_role = working_role) t
                order by coalesce(array_to_string(selected_columns, ','), '')
            loop
                working_selected_columns := cols_record.selected_columns;
                return next (
                    jsonb_build_object(
                        'schema', wal ->> 'schema',
                        'table', wal ->> 'table',
                        'type', action
                    ),
                    is_rls_enabled,
                    (select array_agg(s.subscription_id) from unnest(subscriptions) as s where s.claims_role = working_role and (s.selected_columns is not distinct from working_selected_columns)),
                    array['Error 401: Unauthorized']
                )::realtime.wal_rls;
            end loop;

        else
            -- Create the prepared statement (once per role)
            if is_rls_enabled and action <> 'DELETE' then
                if (select 1 from pg_prepared_statements where name = 'walrus_rls_stmt' limit 1) > 0 then
                    deallocate walrus_rls_stmt;
                end if;
                execute realtime.build_prepared_statement_sql('walrus_rls_stmt', entity_, columns);
            end if;

            -- Collect all visible subscription IDs for this role (filter check + RLS check)
            visible_role_sub_ids = '{}';

            for subscription_id, claims in (
                    select
                        subs.subscription_id,
                        subs.claims
                    from
                        unnest(subscriptions) subs
                    where
                        subs.entity = entity_
                        and subs.claims_role = working_role
                        and (
                            realtime.is_visible_through_filters(columns, subs.filters)
                            or (
                              action = 'DELETE'
                              and realtime.is_visible_through_filters(old_columns, subs.filters)
                            )
                        )
            ) loop

                if not is_rls_enabled or action = 'DELETE' then
                    visible_role_sub_ids = visible_role_sub_ids || subscription_id;
                else
                    -- Check if RLS allows the role to see the record
                    perform
                        -- Trim leading and trailing quotes from working_role because set_config
                        -- doesn't recognize the role as valid if they are included
                        set_config('role', trim(both '""' from working_role::text), true),
                        set_config('request.jwt.claims', claims::text, true);

                    execute 'execute walrus_rls_stmt' into subscription_has_access;

                    -- Reset the role on every FOR..LOOP batch execution.
                    -- The first batch of 10 rows is pre-fetched using the current connection role (PG internal behaviour)
                    -- then we have to reset it again otherwise it would use the role defined in the `set_config` above
                    -- to fetch the remaining rows when rows>10, which could be a user-defined role that lacks execution grants.
                    -- The flow is:
                    --   1. run batch with conn role
                    --   2. set_config working_role
                    --   3. execute walrus
                    --   4. reset role (revert)
                    --   5. repeat
                    perform set_config('role', null, true);

                    if subscription_has_access then
                        visible_role_sub_ids = visible_role_sub_ids || subscription_id;
                    end if;
                end if;
            end loop;

            perform set_config('role', null, true);

            -- Inner loop: per distinct selected_columns for this role
            for cols_record in
                select selected_columns
                from (select distinct selected_columns from unnest(subscriptions) s where s.claims_role = working_role) t
                order by coalesce(array_to_string(selected_columns, ','), '')
            loop
                working_selected_columns := cols_record.selected_columns;

                output = jsonb_build_object(
                    'schema', wal ->> 'schema',
                    'table', wal ->> 'table',
                    'type', action,
                    'commit_timestamp', to_char(
                        ((wal ->> 'timestamp')::timestamptz at time zone 'utc'),
                        'YYYY-MM-DD""T""HH24:MI:SS.MS""Z""'
                    ),
                    'columns', (
                        select
                            jsonb_agg(
                                jsonb_build_object(
                                    'name', pa.attname,
                                    'type', pt.typname
                                )
                                order by pa.attnum asc
                            )
                        from
                            pg_attribute pa
                            join pg_type pt
                                on pa.atttypid = pt.oid
                            left join (
                                select unnest(conkey) as pkey_attnum
                                from pg_constraint
                                where conrelid = entity_ and contype = 'p'
                            ) pk on pk.pkey_attnum = pa.attnum
                        where
                            attrelid = entity_
                            and attnum > 0
                            and pg_catalog.has_column_privilege(working_role, entity_, pa.attname, 'SELECT')
                            and (working_selected_columns is null or pa.attname = any(working_selected_columns) or pk.pkey_attnum is not null)
                    )
                )
                -- Add ""record"" key for insert and update
                || case
                    when action in ('INSERT', 'UPDATE') then
                        jsonb_build_object(
                            'record',
                            (
                                select
                                    jsonb_object_agg(
                                        -- if unchanged toast, get column name and value from old record
                                        coalesce((c).name, (oc).name),
                                        case
                                            when (c).name is null then (oc).value
                                            else (c).value
                                        end
                                    )
                                from
                                    unnest(columns) c
                                    full outer join unnest(old_columns) oc
                                        on (c).name = (oc).name
                                where
                                    coalesce((c).is_selectable, (oc).is_selectable)
                                    and (working_selected_columns is null or coalesce((c).name, (oc).name) = any(working_selected_columns) or coalesce((c).is_pkey, (oc).is_pkey))
                                    and ( not error_record_exceeds_max_size or (octet_length((c).value::text) <= 64))
                            )
                        )
                    else '{}'::jsonb
                end
                -- Add ""old_record"" key for update and delete
                || case
                    when action = 'UPDATE' then
                        jsonb_build_object(
                                'old_record',
                                (
                                    select jsonb_object_agg((c).name, (c).value)
                                    from unnest(old_columns) c
                                    where
                                        (c).is_selectable
                                        and (working_selected_columns is null or (c).name = any(working_selected_columns) or (c).is_pkey)
                                        and ( not error_record_exceeds_max_size or (octet_length((c).value::text) <= 64))
                                )
                            )
                    when action = 'DELETE' then
                        jsonb_build_object(
                            'old_record',
                            (
                                select jsonb_object_agg((c).name, (c).value)
                                from unnest(old_columns) c
                                where
                                    (c).is_selectable
                                    and (working_selected_columns is null or (c).name = any(working_selected_columns) or (c).is_pkey)
                                    and ( not error_record_exceeds_max_size or (octet_length((c).value::text) <= 64))
                                    and ( not is_rls_enabled or (c).is_pkey ) -- if RLS enabled, we can't secure deletes so filter to pkey
                            )
                        )
                    else '{}'::jsonb
                end;

                -- Filter visible_role_sub_ids to those matching the current selected_columns group
                visible_to_subscription_ids = coalesce(
                    (
                        select array_agg(s.subscription_id)
                        from unnest(subscriptions) s
                        where s.claims_role = working_role
                          and (s.selected_columns is not distinct from working_selected_columns)
                          and s.subscription_id = any(visible_role_sub_ids)
                    ),
                    '{}'::uuid[]
                );

                return next (
                    output,
                    is_rls_enabled,
                    visible_to_subscription_ids,
                    case
                        when error_record_exceeds_max_size then array['Error 413: Payload Too Large']
                        else '{}'
                    end
                )::realtime.wal_rls;
            end loop;

        end if;
    end loop;

    perform set_config('role', null, true);
end;

$function$;"
"CREATE OR REPLACE FUNCTION realtime.subscription_check_filters()
RETURNS trigger
LANGUAGE plpgsql
AS $function$

declare
    col_names text[] = coalesce(
            array_agg(a.attname order by a.attnum),
            '{}'::text[]
        )
        from
            pg_catalog.pg_attribute a
        where
            a.attrelid = new.entity
            and a.attnum > 0
            and not a.attisdropped
            and pg_catalog.has_column_privilege(
                (new.claims ->> 'role'),
                a.attrelid,
                a.attnum,
                'SELECT'
            );
    filter realtime.user_defined_filter;
    col_type regtype;
    in_val jsonb;
    selected_col text;
begin
    for filter in select * from unnest(new.filters) loop
        if not filter.column_name = any(col_names) then
            raise exception 'invalid column for filter %', filter.column_name;
        end if;

        col_type = (
            select atttypid::regtype
            from pg_catalog.pg_attribute
            where attrelid = new.entity
                  and attname = filter.column_name
        );
        if col_type is null then
            raise exception 'failed to lookup type for column %', filter.column_name;
        end if;

        if filter.op = 'in'::realtime.equality_op then
            in_val = realtime.cast(filter.value, (col_type::text || '[]')::regtype);
            if coalesce(jsonb_array_length(in_val), 0) > 100 then
                raise exception 'too many values for `in` filter. Maximum 100';
            end if;
        elsif filter.op = 'is'::realtime.equality_op then
            -- `is` requires a keyword RHS rather than a typed literal
            if filter.value not in ('null', 'true', 'false', 'unknown') then
                raise exception 'invalid value for is filter: must be null, true, false, or unknown';
            end if;
            -- IS NULL works for any type, but IS TRUE/FALSE/UNKNOWN require a boolean
            -- operand. Reject the non-null keywords on non-boolean columns here so they
            -- don't abort apply_rls at WAL time.
            if filter.value <> 'null' and col_type <> 'boolean'::regtype then
                raise exception 'is % filter requires a boolean column, got %', filter.value, col_type::text;
            end if;
        elsif filter.op in ('like'::realtime.equality_op, 'ilike'::realtime.equality_op) then
            -- like/ilike apply the text pattern operator (~~); reject column types that
            -- have no such operator instead of failing at WAL time
            if not exists (
                select 1 from pg_catalog.pg_operator
                where oprname = '~~' and oprleft = col_type
            ) then
                raise exception 'operator % requires a text-compatible column type, got %', filter.op::text, col_type::text;
            end if;
        elsif filter.op in ('match'::realtime.equality_op, 'imatch'::realtime.equality_op) then
            -- match/imatch apply the regex operators ~ / ~*; reject column types that have
            -- no such operator (e.g. integer) instead of failing at WAL time, mirroring the
            -- like/ilike guard above.
            if not exists (
                select 1 from pg_catalog.pg_operator
                where oprname = case when filter.op = 'imatch'::realtime.equality_op then '~*' else '~' end
                  and oprleft = col_type
                  and oprright = col_type
                  and oprresult = 'boolean'::regtype
            ) then
                raise exception 'operator % requires a text-compatible column type, got %', filter.op::text, col_type::text;
            end if;
            -- validate the regex eagerly so a bad pattern is rejected here, not inside
            -- apply_rls where it would abort the WAL stream for the entity
            begin
                perform '' ~ filter.value;
            exception when others then
                raise exception 'invalid regular expression for % filter: %', filter.op::text, sqlerrm;
            end;
        else
            -- eq/neq/lt/lte/gt/gte: value must be coercable to the type
            perform realtime.cast(filter.value, col_type);
        end if;
    end loop;

    if new.selected_columns is not null then
        for selected_col in select * from unnest(new.selected_columns) loop
            if not selected_col = any(col_names) then
                raise exception 'invalid column for select %', selected_col;
            end if;
        end loop;
    end if;

    -- Apply consistent order to filters so the unique constraint can't be tricked by a
    -- different filter order. negate is part of the sort key.
    new.filters = coalesce(
        array_agg(f order by f.column_name, f.op, f.value, f.negate),
        '{}'
    ) from unnest(new.filters) f;

    new.selected_columns = (
        select array_agg(c order by c)
        from unnest(new.selected_columns) c
    );

    return new;
end;

$function$;"
"CREATE OR REPLACE FUNCTION realtime.to_regrole()
RETURNS regrole
LANGUAGE sql
AS $function$
 select role_name::regrole 
$function$;"
"CREATE OR REPLACE FUNCTION realtime.build_prepared_statement_sql()
RETURNS text
LANGUAGE sql
AS $function$

      /*
      Builds a sql string that, if executed, creates a prepared statement to
      tests retrive a row from *entity* by its primary key columns.
      Example
          select realtime.build_prepared_statement_sql('public.notes', '{""id""}'::text[], '{""bigint""}'::text[])
      */
          select
      'prepare ' || prepared_statement_name || ' as
          select
              exists(
                  select
                      1
                  from
                      ' || entity || '
                  where
                      ' || string_agg(quote_ident(pkc.name) || '=' || quote_nullable(pkc.value #>> '{}') , ' and ') || '
              )'
          from
              unnest(columns) pkc
          where
              pkc.is_pkey
          group by
              entity
      
$function$;"
"CREATE OR REPLACE FUNCTION realtime.quote_wal2json()
RETURNS text
LANGUAGE sql
AS $function$

  SELECT
    realtime.wal2json_escape_identifier(nsp.nspname::text)
    || '.'
    || realtime.wal2json_escape_identifier(pc.relname::text)
  FROM pg_class pc
  JOIN pg_namespace nsp ON pc.relnamespace = nsp.oid
  WHERE pc.oid = entity

$function$;"
"CREATE OR REPLACE FUNCTION realtime.topic()
RETURNS text
LANGUAGE sql
AS $function$

select nullif(current_setting('realtime.topic', true), '')::text;

$function$;"
"CREATE OR REPLACE FUNCTION realtime.wal2json_escape_identifier()
RETURNS text
LANGUAGE sql
AS $function$

  -- Prefix `\`, `,`, `.`, and any whitespace with `\`
  SELECT regexp_replace(name, '([\\,.[:space:]])', '\\\1', 'g')

$function$;"
"CREATE OR REPLACE FUNCTION realtime.check_equality_op()
RETURNS boolean
LANGUAGE plpgsql
AS $function$

declare
    op_symbol text;
    res boolean;
begin
    -- IS DISTINCT FROM / IS NOT DISTINCT FROM: infix, both sides typed literals
    if op = 'isdistinct' then
        execute format(
            'select %L::%s %s %L::%s',
            val_1,
            type_::text,
            case when negate then 'IS NOT DISTINCT FROM' else 'IS DISTINCT FROM' end,
            val_2,
            type_::text
        ) into res;
        return res;
    end if;

    -- IS requires a keyword RHS (NULL, TRUE, FALSE, UNKNOWN), not a typed literal
    if op = 'is' then
        if val_2 not in ('null', 'true', 'false', 'unknown') then
            raise exception 'invalid value for is filter: must be null, true, false, or unknown';
        end if;
        execute format(
            'select %L::%s %s %s',
            val_1,
            type_::text,
            case when negate then 'IS NOT' else 'IS' end,
            upper(val_2)
        ) into res;
        return res;
    end if;

    op_symbol = case
        when op = 'eq'    then '='
        when op = 'neq'   then '!='
        when op = 'lt'    then '<'
        when op = 'lte'   then '<='
        when op = 'gt'    then '>'
        when op = 'gte'   then '>='
        when op = 'in'    then '= any'
        when op = 'like'   then 'LIKE'
        when op = 'ilike'  then 'ILIKE'
        when op = 'match'  then '~'
        when op = 'imatch' then '~*'
        else null
    end;

    if op_symbol is null then
        raise exception 'unsupported equality operator: %', op::text;
    end if;

    execute format(
        'select %L::%s %s (%L::%s)',
        val_1,
        type_::text,
        op_symbol,
        val_2,
        case when op = 'in' then type_::text || '[]' else type_::text end
    ) into res;

    return case when negate then not res else res end;
end;

$function$;"
"CREATE OR REPLACE FUNCTION realtime.is_visible_through_filters()
RETURNS boolean
LANGUAGE sql
AS $function$

    select
        filters is null
        or array_length(filters, 1) is null
        or coalesce(
            count(col.name) = count(1)
            and sum(
                realtime.check_equality_op(
                    op:=f.op,
                    type_:=coalesce(col.type_oid::regtype, col.type_name::regtype),
                    val_1:=col.value #>> '{}',
                    val_2:=f.value,
                    negate:=coalesce(f.negate, false)
                )::int
            ) filter (where col.name is not null) = count(col.name),
            false
        )
    from
        unnest(filters) f
        left join unnest(columns) col
            on f.column_name = col.name;

$function$;"
"CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
AS $function$

BEGIN
    -- Masukkan ke tabel public.profile terlebih dahulu karena foreign key constraint
    INSERT INTO public.profile (id, full_name, username, email)
    VALUES (
        NEW.id,
        COALESCE(
            NEW.raw_user_meta_data->>'full_name', 
            NEW.raw_user_meta_data->>'fullName', 
            NEW.raw_user_meta_data->>'name', 
            NEW.raw_user_meta_data->>'nama'
        ),
        NEW.raw_user_meta_data->>'username',
        NEW.email -- Menyimpan email ke tabel profil agar bisa digunakan untuk login berbasis username
    );

    -- Masukkan ke tabel public.last_smoke setelah data profile terbuat
    IF NEW.raw_user_meta_data->>'last_smoke' IS NOT NULL THEN
        INSERT INTO public.last_smoke (profile_id, last_smoke)
        VALUES (
            NEW.id,
            (NEW.raw_user_meta_data->>'last_smoke')::TIMESTAMP WITH TIME ZONE
        );
    END IF;

    RETURN NEW;
END;

$function$;"
"CREATE OR REPLACE FUNCTION public.handle_new_profile_contact()
RETURNS trigger
LANGUAGE plpgsql
AS $function$

BEGIN
    INSERT INTO public.contact (profile_id)
    VALUES (NEW.id); -- NEW.id dari tabel profile dimasukkan ke profile_id tabel contact
    RETURN NEW;
END;

$function$;"
"CREATE OR REPLACE FUNCTION realtime.list_changes()
RETURNS TABLE(wal jsonb, is_rls_enabled boolean, subscription_ids uuid[], errors text[], slot_changes_count bigint)
LANGUAGE sql
AS $function$

  WITH pub AS (
    SELECT
      concat_ws(
        ',',
        CASE WHEN bool_or(pubinsert) THEN 'insert' ELSE NULL END,
        CASE WHEN bool_or(pubupdate) THEN 'update' ELSE NULL END,
        CASE WHEN bool_or(pubdelete) THEN 'delete' ELSE NULL END
      ) AS w2j_actions,
      coalesce(
        string_agg(
          realtime.quote_wal2json(format('%I.%I', schemaname, tablename)::regclass),
          ','
        ) filter (WHERE ppt.tablename IS NOT NULL),
        ''
      ) AS w2j_add_tables
    FROM pg_publication pp
    LEFT JOIN pg_publication_tables ppt ON pp.pubname = ppt.pubname
    WHERE pp.pubname = publication
    GROUP BY pp.pubname
    LIMIT 1
  ),
  -- MATERIALIZED ensures pg_logical_slot_get_changes is called exactly once
  w2j AS MATERIALIZED (
    SELECT x.*, pub.w2j_add_tables
    FROM pub,
         pg_logical_slot_get_changes(
           slot_name, null, max_changes,
           'include-pk', 'true',
           'include-transaction', 'false',
           'include-timestamp', 'true',
           'include-type-oids', 'true',
           'format-version', '2',
           'actions', pub.w2j_actions,
           'add-tables', pub.w2j_add_tables
         ) x
  ),
  slot_count AS (
    SELECT count(*)::bigint AS cnt
    FROM w2j
    WHERE w2j.w2j_add_tables <> ''
  ),
  rls_filtered AS (
    SELECT xyz.wal, xyz.is_rls_enabled, xyz.subscription_ids, xyz.errors
    FROM w2j,
         realtime.apply_rls(
           wal := w2j.data::jsonb,
           max_record_bytes := max_record_bytes
         ) xyz(wal, is_rls_enabled, subscription_ids, errors)
    WHERE w2j.w2j_add_tables <> ''
      AND xyz.subscription_ids[1] IS NOT NULL
  )
  SELECT rf.wal, rf.is_rls_enabled, rf.subscription_ids, rf.errors, sc.cnt
  FROM rls_filtered rf, slot_count sc

  UNION ALL

  SELECT null, null, null, null, sc.cnt
  FROM slot_count sc
  WHERE NOT EXISTS (SELECT 1 FROM rls_filtered)

$function$;"
"CREATE OR REPLACE FUNCTION realtime.send_binary()
RETURNS void
LANGUAGE plpgsql
AS $function$

DECLARE
  generated_id uuid;
BEGIN
  BEGIN
    generated_id := gen_random_uuid();

    EXECUTE format('SET LOCAL realtime.topic TO %L', topic);

    INSERT INTO realtime.messages (id, binary_payload, event, topic, private, extension)
    VALUES (generated_id, payload, event, topic, private, 'broadcast');
  EXCEPTION
    WHEN OTHERS THEN
      RAISE WARNING 'WarnSendingBroadcastMessage: %', SQLERRM;
  END;
END;

$function$;"
"CREATE OR REPLACE FUNCTION realtime.send()
RETURNS void
LANGUAGE plpgsql
AS $function$

DECLARE
  generated_id uuid;
  final_payload jsonb;
BEGIN
  BEGIN
    generated_id := gen_random_uuid();

    -- Check if payload has an 'id' key, if not, add the generated UUID
    IF payload ? 'id' THEN
      final_payload := payload;
    ELSE
      final_payload := jsonb_set(payload, '{id}', to_jsonb(generated_id));
    END IF;

    -- Set the topic configuration
    EXECUTE format('SET LOCAL realtime.topic TO %L', topic);

    INSERT INTO realtime.messages (id, payload, event, topic, private, extension)
    VALUES (generated_id, final_payload, event, topic, private, 'broadcast');
  EXCEPTION
    WHEN OTHERS THEN
      RAISE WARNING 'WarnSendingBroadcastMessage: %', SQLERRM;
  END;
END;

$function$;"
CREATE TRIGGER enforce_bucket_name_length_trigger BEFORE INSERT ON storage.buckets FOR EACH ROW EXECUTE FUNCTION storage.enforce_bucket_name_length();
CREATE TRIGGER tr_check_filters BEFORE INSERT ON realtime.subscription FOR EACH ROW EXECUTE FUNCTION realtime.subscription_check_filters();
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION handle_new_user();
CREATE TRIGGER on_profile_created AFTER INSERT ON public.profile FOR EACH ROW EXECUTE FUNCTION handle_new_profile_contact();
CREATE TRIGGER protect_buckets_delete BEFORE DELETE ON storage.buckets FOR EACH STATEMENT EXECUTE FUNCTION storage.protect_delete();
CREATE TRIGGER protect_objects_delete BEFORE DELETE ON storage.objects FOR EACH STATEMENT EXECUTE FUNCTION storage.protect_delete();
CREATE TRIGGER update_objects_updated_at BEFORE UPDATE ON storage.objects FOR EACH ROW EXECUTE FUNCTION storage.update_updated_at_column();
CREATE TRIGGER enforce_bucket_name_length_trigger BEFORE UPDATE ON storage.buckets FOR EACH ROW EXECUTE FUNCTION storage.enforce_bucket_name_length();
CREATE TRIGGER tr_check_filters BEFORE UPDATE ON realtime.subscription FOR EACH ROW EXECUTE FUNCTION realtime.subscription_check_filters();