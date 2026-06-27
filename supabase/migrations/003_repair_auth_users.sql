-- ═══════════════════════════════════════════════════════════════════════════════
-- RÉPARATION AUTH.USERS — Corriger les utilisateurs @helene2026.com
-- Exécuter dans Supabase SQL Editor AVANT de relancer l'application
-- ═══════════════════════════════════════════════════════════════════════════════

-- ÉTAPE 1 : Supprimer les profils liés aux utilisateurs corrompus
DELETE FROM public.profiles
WHERE id IN (
  SELECT id FROM auth.users
  WHERE email LIKE '%@helene2026.com'
);

-- ÉTAPE 2 : Supprimer les utilisateurs corrompus de auth.users
DELETE FROM auth.users WHERE email LIKE '%@helene2026.com';

-- ÉTAPE 3 : Recréer les utilisateurs avec un schéma complet et compatible
-- (inclut toutes les colonnes requises par Supabase GoTrue v2.x)

INSERT INTO auth.users (
  id,
  instance_id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  last_sign_in_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  created_at,
  updated_at,
  phone,
  phone_confirmed_at,
  email_change,
  email_change_sent_at,
  email_change_confirm_status,
  email_change_token_new,
  email_change_token_current,
  recovery_token,
  recovery_sent_at,
  reauthentication_token,
  reauthentication_sent_at,
  confirmation_token,
  confirmation_sent_at,
  invited_at,
  is_sso_user,
  deleted_at,
  is_anonymous
)
VALUES
  -- Super Admin (principal)
  ('186ed800-3b5e-4704-b25d-a8506d93d5d9','00000000-0000-0000-0000-000000000000',
   'authenticated','authenticated','admin@helene2026.com',
   crypt('SyndicAdmin2026', gen_salt('bf', 10)),
   now(), now(),
   '{"provider":"email","providers":["email"]}','{}',
   false, now(), now(), NULL, NULL, '', NULL, 0, '', '', '', NULL, '', NULL, '', NULL, NULL, false, NULL, false),
  -- Super Admin 2
  ('18c0c918-835f-467f-8d03-02bdc911e163','00000000-0000-0000-0000-000000000000',
   'authenticated','authenticated','admin2@helene2026.com',
   crypt('SyndicAdmin2026', gen_salt('bf', 10)),
   now(), now(),
   '{"provider":"email","providers":["email"]}','{}',
   false, now(), now(), NULL, NULL, '', NULL, 0, '', '', '', NULL, '', NULL, '', NULL, NULL, false, NULL, false),
  -- Concierge
  ('5577e1e6-67ac-4dd8-a5a3-e07ec89bc755','00000000-0000-0000-0000-000000000000',
   'authenticated','authenticated','concierge@helene2026.com',
   crypt('SyndicConcierg2026', gen_salt('bf', 10)),
   now(), now(),
   '{"provider":"email","providers":["email"]}','{}',
   false, now(), now(), NULL, NULL, '', NULL, 0, '', '', '', NULL, '', NULL, '', NULL, NULL, false, NULL, false),
  -- Babacar Diop (Lots 1+2)
  ('75984ebc-ff0a-43b4-a4d6-355fd48343cf','00000000-0000-0000-0000-000000000000',
   'authenticated','authenticated','babacar.diop@helene2026.com',
   crypt('SyndicLot01', gen_salt('bf', 10)),
   now(), now(),
   '{"provider":"email","providers":["email"]}','{}',
   false, now(), now(), NULL, NULL, '', NULL, 0, '', '', '', NULL, '', NULL, '', NULL, NULL, false, NULL, false),
  -- Absatou Touré (Lot 3)
  ('b43daec7-67ab-4398-a4d8-c0509a872fa6','00000000-0000-0000-0000-000000000000',
   'authenticated','authenticated','absatou.toure@helene2026.com',
   crypt('SyndicLot03', gen_salt('bf', 10)),
   now(), now(),
   '{"provider":"email","providers":["email"]}','{}',
   false, now(), now(), NULL, NULL, '', NULL, 0, '', '', '', NULL, '', NULL, '', NULL, NULL, false, NULL, false),
  -- Oumoul Faye (Lot 4)
  ('33a25ad3-488d-40e2-b7a1-052567dd18ad','00000000-0000-0000-0000-000000000000',
   'authenticated','authenticated','oumoul.faye@helene2026.com',
   crypt('SyndicLot04', gen_salt('bf', 10)),
   now(), now(),
   '{"provider":"email","providers":["email"]}','{}',
   false, now(), now(), NULL, NULL, '', NULL, 0, '', '', '', NULL, '', NULL, '', NULL, NULL, false, NULL, false),
  -- Zeinab Diop (Lot 5)
  ('b2504c4c-c5d6-495d-98ba-3db146362a32','00000000-0000-0000-0000-000000000000',
   'authenticated','authenticated','zeinab.diop@helene2026.com',
   crypt('SyndicLot05', gen_salt('bf', 10)),
   now(), now(),
   '{"provider":"email","providers":["email"]}','{}',
   false, now(), now(), NULL, NULL, '', NULL, 0, '', '', '', NULL, '', NULL, '', NULL, NULL, false, NULL, false),
  -- Birane Gueye (Lot 6)
  ('93f4fb26-e218-4a00-b26e-e82b53afa4a8','00000000-0000-0000-0000-000000000000',
   'authenticated','authenticated','birane.gueye@helene2026.com',
   crypt('SyndicLot06', gen_salt('bf', 10)),
   now(), now(),
   '{"provider":"email","providers":["email"]}','{}',
   false, now(), now(), NULL, NULL, '', NULL, 0, '', '', '', NULL, '', NULL, '', NULL, NULL, false, NULL, false),
  -- Wore Diop (Lot 7)
  ('b1e04ae2-ee7e-49a9-b537-8667cc86577c','00000000-0000-0000-0000-000000000000',
   'authenticated','authenticated','wore.diop@helene2026.com',
   crypt('SyndicLot07', gen_salt('bf', 10)),
   now(), now(),
   '{"provider":"email","providers":["email"]}','{}',
   false, now(), now(), NULL, NULL, '', NULL, 0, '', '', '', NULL, '', NULL, '', NULL, NULL, false, NULL, false),
  -- Yves (Lot 8)
  ('da071274-fde9-4d71-b1f0-2f3da7499502','00000000-0000-0000-0000-000000000000',
   'authenticated','authenticated','yves@helene2026.com',
   crypt('SyndicLot08', gen_salt('bf', 10)),
   now(), now(),
   '{"provider":"email","providers":["email"]}','{}',
   false, now(), now(), NULL, NULL, '', NULL, 0, '', '', '', NULL, '', NULL, '', NULL, NULL, false, NULL, false),
  -- Mariama Touré (Lot 9)
  ('3a35f3ea-aa40-4001-b65c-dcf2859718f3','00000000-0000-0000-0000-000000000000',
   'authenticated','authenticated','mariama.toure@helene2026.com',
   crypt('SyndicLot09', gen_salt('bf', 10)),
   now(), now(),
   '{"provider":"email","providers":["email"]}','{}',
   false, now(), now(), NULL, NULL, '', NULL, 0, '', '', '', NULL, '', NULL, '', NULL, NULL, false, NULL, false),
  -- Ndiaye Samb (Lot 10)
  ('f05f7ec0-abf3-4b61-892c-1b6b1d59bd9c','00000000-0000-0000-0000-000000000000',
   'authenticated','authenticated','ndiaye.samb@helene2026.com',
   crypt('SyndicLot10', gen_salt('bf', 10)),
   now(), now(),
   '{"provider":"email","providers":["email"]}','{}',
   false, now(), now(), NULL, NULL, '', NULL, 0, '', '', '', NULL, '', NULL, '', NULL, NULL, false, NULL, false),
  -- Marie Dieye (Lot 11)
  ('5447378c-8b7e-4d09-8f57-f037b446c235','00000000-0000-0000-0000-000000000000',
   'authenticated','authenticated','marie.dieye@helene2026.com',
   crypt('SyndicLot11', gen_salt('bf', 10)),
   now(), now(),
   '{"provider":"email","providers":["email"]}','{}',
   false, now(), now(), NULL, NULL, '', NULL, 0, '', '', '', NULL, '', NULL, '', NULL, NULL, false, NULL, false),
  -- M. Diop et fils (Lot 12)
  ('5bcace1f-8d63-485a-9618-04f3e49e0179','00000000-0000-0000-0000-000000000000',
   'authenticated','authenticated','diop.fils@helene2026.com',
   crypt('SyndicLot12', gen_salt('bf', 10)),
   now(), now(),
   '{"provider":"email","providers":["email"]}','{}',
   false, now(), now(), NULL, NULL, '', NULL, 0, '', '', '', NULL, '', NULL, '', NULL, NULL, false, NULL, false),
  -- Mme Fall (Lot 13)
  ('80dc63cc-3b86-4ca3-8e87-15e6c54dd7b8','00000000-0000-0000-0000-000000000000',
   'authenticated','authenticated','mme.fall@helene2026.com',
   crypt('SyndicLot13', gen_salt('bf', 10)),
   now(), now(),
   '{"provider":"email","providers":["email"]}','{}',
   false, now(), now(), NULL, NULL, '', NULL, 0, '', '', '', NULL, '', NULL, '', NULL, NULL, false, NULL, false)
ON CONFLICT (id) DO UPDATE SET
  encrypted_password = EXCLUDED.encrypted_password,
  email_confirmed_at = EXCLUDED.email_confirmed_at,
  updated_at = now();

-- ÉTAPE 4 : Recréer les profils avec le bon format
INSERT INTO public.profiles (id, syndicat_id, immeuble_id, immeubles_ids, role, nom_complet, lots_ids, created_at)
VALUES
  ('186ed800-3b5e-4704-b25d-a8506d93d5d9','aaaaaaaa-0000-0000-0000-000000000001',NULL,ARRAY['bbbbbbbb-0000-0000-0000-000000000001'::uuid],'superadmin','Super Admin',ARRAY[]::uuid[],'2026-05-17T17:08:58+00:00'),
  ('18c0c918-835f-467f-8d03-02bdc911e163','aaaaaaaa-0000-0000-0000-000000000001',NULL,ARRAY['bbbbbbbb-0000-0000-0000-000000000001'::uuid],'superadmin','Super Admin',ARRAY[]::uuid[],'2026-05-17T17:03:54+00:00'),
  ('5577e1e6-67ac-4dd8-a5a3-e07ec89bc755','aaaaaaaa-0000-0000-0000-000000000001',NULL,ARRAY['bbbbbbbb-0000-0000-0000-000000000001'::uuid],'concierge','Mamadou Sarr',ARRAY[]::uuid[],'2026-05-17T17:20:46+00:00'),
  ('75984ebc-ff0a-43b4-a4d6-355fd48343cf','aaaaaaaa-0000-0000-0000-000000000001',NULL,ARRAY['bbbbbbbb-0000-0000-0000-000000000001'::uuid],'proprietaire','Babacar Diop',ARRAY['cccccccc-0000-0000-0000-000000000001'::uuid,'cccccccc-0000-0000-0000-000000000002'::uuid],'2026-05-17T17:31:21+00:00'),
  ('b43daec7-67ab-4398-a4d8-c0509a872fa6','aaaaaaaa-0000-0000-0000-000000000001',NULL,ARRAY['bbbbbbbb-0000-0000-0000-000000000001'::uuid],'proprietaire','Absatou Touré',ARRAY['cccccccc-0000-0000-0000-000000000003'::uuid],'2026-05-17T17:31:21+00:00'),
  ('33a25ad3-488d-40e2-b7a1-052567dd18ad','aaaaaaaa-0000-0000-0000-000000000001',NULL,ARRAY['bbbbbbbb-0000-0000-0000-000000000001'::uuid],'proprietaire','Oumoul Faye',ARRAY['cccccccc-0000-0000-0000-000000000004'::uuid],'2026-05-17T17:31:21+00:00'),
  ('b2504c4c-c5d6-495d-98ba-3db146362a32','aaaaaaaa-0000-0000-0000-000000000001',NULL,ARRAY['bbbbbbbb-0000-0000-0000-000000000001'::uuid],'proprietaire','Zeinab Diop',ARRAY['cccccccc-0000-0000-0000-000000000005'::uuid],'2026-05-17T17:31:21+00:00'),
  ('93f4fb26-e218-4a00-b26e-e82b53afa4a8','aaaaaaaa-0000-0000-0000-000000000001',NULL,ARRAY['bbbbbbbb-0000-0000-0000-000000000001'::uuid],'proprietaire','Birane Gueye',ARRAY['cccccccc-0000-0000-0000-000000000006'::uuid],'2026-05-17T17:31:21+00:00'),
  ('b1e04ae2-ee7e-49a9-b537-8667cc86577c','aaaaaaaa-0000-0000-0000-000000000001',NULL,ARRAY['bbbbbbbb-0000-0000-0000-000000000001'::uuid],'proprietaire','Wore Diop',ARRAY['cccccccc-0000-0000-0000-000000000007'::uuid],'2026-05-17T17:31:21+00:00'),
  ('da071274-fde9-4d71-b1f0-2f3da7499502','aaaaaaaa-0000-0000-0000-000000000001',NULL,ARRAY['bbbbbbbb-0000-0000-0000-000000000001'::uuid],'proprietaire','Yves',ARRAY['cccccccc-0000-0000-0000-000000000008'::uuid],'2026-05-17T17:31:21+00:00'),
  ('3a35f3ea-aa40-4001-b65c-dcf2859718f3','aaaaaaaa-0000-0000-0000-000000000001',NULL,ARRAY['bbbbbbbb-0000-0000-0000-000000000001'::uuid],'proprietaire','Mariama Touré',ARRAY['cccccccc-0000-0000-0000-000000000009'::uuid],'2026-05-17T17:31:21+00:00'),
  ('f05f7ec0-abf3-4b61-892c-1b6b1d59bd9c','aaaaaaaa-0000-0000-0000-000000000001',NULL,ARRAY['bbbbbbbb-0000-0000-0000-000000000001'::uuid],'proprietaire','Ndiaye Samb',ARRAY['cccccccc-0000-0000-0000-000000000010'::uuid],'2026-05-17T17:31:21+00:00'),
  ('5447378c-8b7e-4d09-8f57-f037b446c235','aaaaaaaa-0000-0000-0000-000000000001',NULL,ARRAY['bbbbbbbb-0000-0000-0000-000000000001'::uuid],'proprietaire','Marie Dieye',ARRAY['cccccccc-0000-0000-0000-000000000011'::uuid],'2026-05-17T17:31:21+00:00'),
  ('5bcace1f-8d63-485a-9618-04f3e49e0179','aaaaaaaa-0000-0000-0000-000000000001',NULL,ARRAY['bbbbbbbb-0000-0000-0000-000000000001'::uuid],'proprietaire','M. Diop et fils',ARRAY['cccccccc-0000-0000-0000-000000000012'::uuid],'2026-05-17T17:31:21+00:00'),
  ('80dc63cc-3b86-4ca3-8e87-15e6c54dd7b8','aaaaaaaa-0000-0000-0000-000000000001',NULL,ARRAY['bbbbbbbb-0000-0000-0000-000000000001'::uuid],'proprietaire','Mme Fall',ARRAY['cccccccc-0000-0000-0000-000000000013'::uuid],'2026-05-17T17:31:21+00:00')
ON CONFLICT (id) DO UPDATE SET
  syndicat_id   = EXCLUDED.syndicat_id,
  immeubles_ids = EXCLUDED.immeubles_ids,
  role          = EXCLUDED.role,
  nom_complet   = EXCLUDED.nom_complet,
  lots_ids      = EXCLUDED.lots_ids;

-- ÉTAPE 5 : Vérification
SELECT
  u.email,
  u.email_confirmed_at IS NOT NULL AS email_confirmed,
  p.role,
  p.nom_complet
FROM auth.users u
LEFT JOIN public.profiles p ON p.id = u.id
WHERE u.email LIKE '%@helene2026.com'
ORDER BY u.email;
