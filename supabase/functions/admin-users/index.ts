// ═══════════════════════════════════════════════════════════════════════════════
// Supabase Edge Function : admin-users
// Gestion des utilisateurs Supabase Auth via service_role (côté serveur)
//
// Déploiement :
//   supabase functions deploy admin-users --project-ref orgrwqsxtzvnezzealrd
//
// Secret requis dans Supabase Dashboard → Settings → Edge Functions → Secrets :
//   SUPABASE_SERVICE_ROLE_KEY = <valeur depuis Settings → API>
// ═══════════════════════════════════════════════════════════════════════════════

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin":  "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // ── Client admin (service_role) — jamais exposé côté frontend ──────────────
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    // ── Vérifier l'identité du demandeur ──────────────────────────────────────
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return json({ success: false, error: "Authentification requise" }, 401);
    }

    const supabaseAnon = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabaseAnon.auth.getUser();
    if (authError || !user) {
      return json({ success: false, error: "Token invalide" }, 401);
    }

    // ── Parser le body AVANT la vérification de rôle ─────────────────────────
    const body = await req.json();
    const { action } = body;

    // ── Profil de l'appelant ──────────────────────────────────────────────────
    const { data: callerProfile } = await supabaseAdmin
      .from("profiles")
      .select("role, syndicat_id")
      .eq("id", user.id)
      .single();

    // ══════════════════════════════════════════════════════════════════════
    // ACTION : create_syndicat_full
    // Crée syndicat + immeuble + lots via service_role (bypass RLS).
    // Autorisé pour les nouveaux utilisateurs (onboarding) ET les superadmins.
    // ══════════════════════════════════════════════════════════════════════
    if (action === "create_syndicat_full") {
      const isNewUser    = !callerProfile || !callerProfile.syndicat_id;
      const isSuperadmin = callerProfile?.role === "superadmin";

      if (!isNewUser && !isSuperadmin) {
        return json({ success: false, error: "Action non autorisée" }, 403);
      }

      const { syndicatNom, syndicatAdresse, pays, devise, immeubleNom, immeubleAdr, immeubleRef, immeubleBudget, immeubleModeCotisation, lots: lotsData, utilisateurs } = body;

      if (!syndicatNom || !immeubleNom) {
        return json({ success: false, error: "syndicatNom et immeubleNom sont requis" }, 400);
      }

      const modeCotisation = immeubleModeCotisation === "tantieme" ? "tantieme" : "fixe";

      // Créer le syndicat (avec devise)
      const { data: syndicat, error: synErr } = await supabaseAdmin
        .from("syndicats")
        .insert({
          nom:    syndicatNom,
          adresse: syndicatAdresse || null,
          devise:  devise || "FCFA",
          plan:   "starter",
          actif:  true,
        })
        .select().single();
      if (synErr) return json({ success: false, error: synErr.message }, 500);

      // Créer l'immeuble (budget mensuel + base de cotisation)
      const { data: immeuble, error: immErr } = await supabaseAdmin
        .from("immeubles")
        .insert({
          syndicat_id:     syndicat.id,
          nom:             immeubleNom,
          adresse:         immeubleAdr || null,
          reference_tf:    immeubleRef || null,
          budget_mensuel:  immeubleBudget ? Number(immeubleBudget) : 0,
          mode_cotisation: modeCotisation,
          nb_lots:         lotsData?.length || 0,
        })
        .select().single();
      if (immErr) {
        await supabaseAdmin.from("syndicats").delete().eq("id", syndicat.id);
        return json({ success: false, error: immErr.message }, 500);
      }

      // Créer les lots (retourne les ids pour le mapping utilisateurs)
      let insertedLots: { id: string; numero: number }[] = [];
      if (lotsData && lotsData.length > 0) {
        const rows = lotsData.map((l: Record<string, unknown>) => ({
          immeuble_id:          immeuble.id,
          syndicat_id:          syndicat.id,
          numero:               Number(l.numero),
          appartement:          String(l.appart || l.appartement || ""),
          proprio:              String(l.proprio || ""),
          etage:                String(l.etage   || ""),
          email:                l.email ? String(l.email) : null,
          telephone:            l.telephone ? String(l.telephone) : null,
          tantieme:             Number(l.tantieme  || 0),
          cotisation_mensuelle: Number(l.cotisation || 0),
        }));
        const { data: lotsInserted, error: lotsErr } = await supabaseAdmin.from("lots").insert(rows).select("id, numero");
        if (lotsErr) {
          await supabaseAdmin.from("syndicats").delete().eq("id", syndicat.id);
          return json({ success: false, error: lotsErr.message }, 500);
        }
        insertedLots = lotsInserted || [];
      }

      // Créer les utilisateurs optionnels (import Excel). Les échecs unitaires
      // n'annulent pas la création du syndicat — ils sont remontés en warnings.
      const warnings: string[] = [];
      if (Array.isArray(utilisateurs) && utilisateurs.length > 0) {
        const lotIdByNum: Record<number, string> = {};
        insertedLots.forEach((l) => { lotIdByNum[l.numero] = l.id; });

        for (const u of utilisateurs) {
          if (!u?.email || !u?.password) { warnings.push(`Utilisateur ignoré (email/mot de passe manquant)`); continue; }
          const role = ["superadmin", "concierge", "proprietaire"].includes(u.role) ? u.role : "proprietaire";
          const { data: newUser, error: cErr } = await supabaseAdmin.auth.admin.createUser({
            email: String(u.email).trim(),
            password: String(u.password),
            email_confirm: true,
            user_metadata: { nom_complet: u.nomComplet || "" },
          });
          if (cErr || !newUser?.user) { warnings.push(`${u.email} : ${cErr?.message || "création échouée"}`); continue; }

          const lotsIds = role === "proprietaire"
            ? (Array.isArray(u.lotsNumeros) ? u.lotsNumeros.map((n: number) => lotIdByNum[Number(n)]).filter(Boolean) : [])
            : [];
          const { error: pErr } = await supabaseAdmin.from("profiles").insert({
            id:            newUser.user.id,
            syndicat_id:   syndicat.id,
            role,
            nom_complet:   u.nomComplet || "",
            immeubles_ids: role === "proprietaire" ? [] : [immeuble.id],
            lots_ids:      lotsIds,
          });
          if (pErr) {
            await supabaseAdmin.auth.admin.deleteUser(newUser.user.id);
            warnings.push(`${u.email} : ${pErr.message}`);
          }
        }
      }

      return json({ success: true, syndicat, immeuble, warnings });
    }

    // ── Pour toutes les autres actions : rôle superadmin requis ───────────────
    if (!callerProfile || callerProfile.role !== "superadmin") {
      return json({ success: false, error: "Accès réservé aux superadmins" }, 403);
    }

    // ══════════════════════════════════════════════════════════════════════
    // ACTION : list_all_syndicats
    // Liste tous les syndicats de la plateforme avec le nb d'immeubles.
    // Réservé aux superadmins.
    // ══════════════════════════════════════════════════════════════════════
    if (action === "list_all_syndicats") {
      const { data: syndicats, error: synErr } = await supabaseAdmin
        .from("syndicats")
        .select("id, nom, adresse, ville, plan, actif, devise, created_at")
        .order("created_at");
      if (synErr) return json({ success: false, error: synErr.message }, 500);

      // Compter les immeubles par syndicat
      const { data: immeubles } = await supabaseAdmin
        .from("immeubles")
        .select("id, syndicat_id");

      const nbImmeubles: Record<string, number> = {};
      (immeubles || []).forEach((i: { syndicat_id: string }) => {
        nbImmeubles[i.syndicat_id] = (nbImmeubles[i.syndicat_id] || 0) + 1;
      });

      // Compter les utilisateurs par syndicat
      const { data: profiles } = await supabaseAdmin
        .from("profiles")
        .select("id, syndicat_id");

      const nbUsers: Record<string, number> = {};
      (profiles || []).forEach((p: { syndicat_id: string }) => {
        if (p.syndicat_id) nbUsers[p.syndicat_id] = (nbUsers[p.syndicat_id] || 0) + 1;
      });

      const result = (syndicats || []).map((s: Record<string, unknown>) => ({
        ...s,
        nb_immeubles: nbImmeubles[s.id as string] || 0,
        nb_users:     nbUsers[s.id as string]     || 0,
      }));

      return json({ success: true, syndicats: result });
    }

    // ══════════════════════════════════════════════════════════════════════
    // ACTION : list — lister les utilisateurs d'un syndicat
    // Superadmin peut lister n'importe quel syndicat (pas seulement le sien)
    // ══════════════════════════════════════════════════════════════════════
    if (action === "list") {
      const sid = body.syndicatId || callerProfile.syndicat_id;
      if (!sid) return json({ success: false, error: "syndicatId requis" }, 400);

      const { data: profiles, error: profError } = await supabaseAdmin
        .from("profiles")
        .select("id, role, nom_complet, telephone, lots_ids, immeubles_ids, created_at")
        .eq("syndicat_id", sid)
        .order("created_at");

      if (profError) return json({ success: false, error: profError.message }, 500);

      const { data: { users: allAuthUsers }, error: usersError } = await supabaseAdmin.auth.admin.listUsers({ perPage: 1000 });
      const profileIds = new Set((profiles || []).map((p: { id: string }) => p.id));
      const emailMap: Record<string, string> = {};
      if (!usersError && allAuthUsers) {
        allAuthUsers
          .filter((u: { id: string }) => profileIds.has(u.id))
          .forEach((u: { id: string; email?: string }) => { emailMap[u.id] = u.email || ""; });
      }

      const result = (profiles || []).map((p: {
        id: string; role: string; nom_complet: string | null;
        telephone: string | null; lots_ids: string[] | null;
        immeubles_ids: string[] | null; created_at: string;
      }) => ({
        id:          p.id,
        email:       emailMap[p.id] || "(email inconnu)",
        role:        p.role,
        nomComplet:  p.nom_complet   || "",
        telephone:   p.telephone     || "",
        lotsIds:     p.lots_ids      || [],
        immeubleIds: p.immeubles_ids || [],
        createdAt:   p.created_at,
      }));

      return json({ success: true, users: result });
    }

    // ══════════════════════════════════════════════════════════════════════
    // ACTION : create — créer un nouvel utilisateur
    // Superadmin peut créer dans n'importe quel syndicat
    // ══════════════════════════════════════════════════════════════════════
    if (action === "create") {
      const { email, password, nomComplet, role, syndicatId, immeubleIds, lotsIds } = body;

      if (!email || !password || !nomComplet || !role) {
        return json({ success: false, error: "email, password, nomComplet et role requis" }, 400);
      }

      const targetSyndicatId = syndicatId || callerProfile.syndicat_id;
      if (!targetSyndicatId) {
        return json({ success: false, error: "syndicatId requis" }, 400);
      }

      const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { nom_complet: nomComplet },
      });

      if (createError || !newUser.user) {
        return json({ success: false, error: createError?.message || "Création échouée" }, 400);
      }

      const { error: profileError } = await supabaseAdmin.from("profiles").insert({
        id:            newUser.user.id,
        syndicat_id:   targetSyndicatId,
        role,
        nom_complet:   nomComplet,
        immeubles_ids: immeubleIds || [],
        lots_ids:      lotsIds     || [],
      });

      if (profileError) {
        await supabaseAdmin.auth.admin.deleteUser(newUser.user.id);
        return json({ success: false, error: profileError.message }, 500);
      }

      return json({ success: true, userId: newUser.user.id, email: newUser.user.email });
    }

    // ══════════════════════════════════════════════════════════════════════
    // ACTION : update_password — changer le mot de passe
    // Superadmin peut modifier n'importe quel utilisateur
    // ══════════════════════════════════════════════════════════════════════
    if (action === "update_password") {
      const { userId, newPassword } = body;
      if (!userId || !newPassword) {
        return json({ success: false, error: "userId et newPassword requis" }, 400);
      }

      const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, { password: newPassword });
      if (error) return json({ success: false, error: error.message }, 400);
      return json({ success: true });
    }

    // ══════════════════════════════════════════════════════════════════════
    // ACTION : update_email — changer l'email
    // Superadmin peut modifier n'importe quel utilisateur
    // ══════════════════════════════════════════════════════════════════════
    if (action === "update_email") {
      const { userId, newEmail } = body;
      if (!userId || !newEmail) {
        return json({ success: false, error: "userId et newEmail requis" }, 400);
      }

      const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, { email: newEmail, email_confirm: true });
      if (error) return json({ success: false, error: error.message }, 400);
      return json({ success: true });
    }

    // ══════════════════════════════════════════════════════════════════════
    // ACTION : delete — supprimer un utilisateur
    // Superadmin peut supprimer n'importe quel utilisateur (pas lui-même)
    // ══════════════════════════════════════════════════════════════════════
    if (action === "delete") {
      const { userId } = body;
      if (!userId) {
        return json({ success: false, error: "userId requis" }, 400);
      }
      if (userId === user.id) {
        return json({ success: false, error: "Vous ne pouvez pas supprimer votre propre compte" }, 400);
      }

      await supabaseAdmin.from("profiles").delete().eq("id", userId);
      const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);
      if (error) return json({ success: false, error: error.message }, 400);

      return json({ success: true });
    }

    return json({ success: false, error: `Action inconnue : ${action}` }, 400);

  } catch (err) {
    console.error("Edge Function error:", err);
    return json({ success: false, error: err instanceof Error ? err.message : "Erreur interne" }, 500);
  }
});

// ── Helper ────────────────────────────────────────────────────────────────────

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
