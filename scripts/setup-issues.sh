#!/usr/bin/env bash
# Setup script for augur-saas GitHub repo.
# Run from inside the augur-saas local directory after initial commit.
#
# Prerequisites:
#   - gh CLI authenticated
#   - Git repo initialized and pushed to GitHub
#
# Usage:
#   chmod +x scripts/setup-issues.sh
#   ./scripts/setup-issues.sh

set -euo pipefail

REPO="marubozu-fr/augur-saas"

echo "=== Creating labels ==="
gh label create "agent-designer" --color "D4C5F9" --description "Routes to ui-designer agent" --repo "$REPO" 2>/dev/null || echo "  label agent-designer exists"
gh label create "agent-frontend" --color "1D76DB" --description "Routes to frontend-dev agent" --repo "$REPO" 2>/dev/null || echo "  label agent-frontend exists"
gh label create "design"         --color "FBCA04" --description "Design mockup"               --repo "$REPO" 2>/dev/null || echo "  label design exists"
gh label create "foundation"     --color "0E8A16" --description "Project foundation"           --repo "$REPO" 2>/dev/null || echo "  label foundation exists"
gh label create "page"           --color "006B75" --description "Page implementation"          --repo "$REPO" 2>/dev/null || echo "  label page exists"

echo ""
echo "=== Creating milestones ==="
gh api repos/"$REPO"/milestones -f title="1 - Design"       -f description="HTML/CSS mockups for all key pages" --silent 2>/dev/null || echo "  milestone 1 exists"
gh api repos/"$REPO"/milestones -f title="2 - Foundation"    -f description="Scaffold, auth, payments, API client" --silent 2>/dev/null || echo "  milestone 2 exists"
gh api repos/"$REPO"/milestones -f title="3 - Public Pages"  -f description="Landing, pricing, auth flow" --silent 2>/dev/null || echo "  milestone 3 exists"
gh api repos/"$REPO"/milestones -f title="4 - Member Area"   -f description="Dashboard, stat detail, account" --silent 2>/dev/null || echo "  milestone 4 exists"

echo ""
echo "=== Creating issues ==="

# --- Milestone 1: Design ---

gh issue create --repo "$REPO" --title "Design: Landing page" \
  --label "agent-designer,design" --milestone "1 - Design" \
  --body "## Objectif
Mockup HTML/CSS pour la landing page publique.

## Livrables
- \`docs/mockups/landing.html\`
- Mise à jour de \`docs/mockups/styles.css\` (tokens partagés)
- Mise à jour de \`docs/mockups/README.md\`

## Sections
- Hero : value proposition + CTA principal
- Features : 3-4 bénéfices clés avec icônes
- How it works : 3 étapes
- Social proof (testimonials ou métriques)
- CTA secondaire
- Footer

## Contraintes
- Dark theme
- Mobile responsive
- Données réalistes (pas de lorem ipsum)
- Commentaires HTML mappant les sections aux composants shadcn/ui"

gh issue create --repo "$REPO" --title "Design: Pricing page" \
  --label "agent-designer,design" --milestone "1 - Design" \
  --body "## Objectif
Mockup HTML/CSS pour la page pricing.

## Livrables
- \`docs/mockups/pricing.html\`

## Sections
- 4 tiers côte à côte : Starter, Pro, Premium, Enterprise
- Tableau de comparaison des features (quelles stats dans quel tier)
- Highlight du plan recommandé
- Toggle mensuel/annuel
- FAQ

## Contraintes
- Dark theme
- Mobile : cards stackées
- Prix réalistes"

gh issue create --repo "$REPO" --title "Design: Auth pages" \
  --label "agent-designer,design" --milestone "1 - Design" \
  --body "## Objectif
Mockup HTML/CSS pour les pages d'authentification.

## Livrables
- \`docs/mockups/auth.html\`

## Pages
- Sign in (email/password + boutons OAuth)
- Sign up (email/password + boutons OAuth)
- Forgot password

## Contraintes
- Layout centré, card propre
- Cohérent avec l'esthétique de la landing
- Dark theme"

gh issue create --repo "$REPO" --title "Design: Member dashboard" \
  --label "agent-designer,design" --milestone "1 - Design" \
  --body "## Objectif
Mockup HTML/CSS pour le dashboard membre (post-login).

## Livrables
- \`docs/mockups/dashboard.html\`

## Sections
- Grid de stat family cards (nom, description courte, badge tier)
- Stat cards lockées (tier insuffisant) avec overlay + CTA upgrade
- Navigation : sidebar ou top-nav (Dashboard, Account, Logout)
- Indicateur de tier d'abonnement
- Sélecteur d'instrument (NQ, ES)
- Recherche/filtre de stats

## Contraintes
- Dark theme
- States : loading, empty, populated, locked
- Données stats réalistes"

gh issue create --repo "$REPO" --title "Design: Stat detail page" \
  --label "agent-designer,design" --milestone "1 - Design" \
  --body "## Objectif
Mockup HTML/CSS pour la page de détail d'une stat.

## Livrables
- \`docs/mockups/stat-detail.html\`

## Sections
- Titre, définition, badge tier
- Magnitudes résumées (valeurs clés)
- Table de probabilités (condition, outcome, probabilité, baseline, N, edge)
- Probas color-codées (vert > baseline, rouge < baseline)
- Slices en accordion (weekday, size bucket, etc.)
- Sélecteur instrument + timeframe
- Breadcrumb → dashboard

## Contraintes
- Dark theme
- Utiliser des données réelles depuis les fichiers results/ du repo augur
- Green = above baseline, Red = below baseline — toujours"

gh issue create --repo "$REPO" --title "Design: Account page" \
  --label "agent-designer,design" --milestone "1 - Design" \
  --body "## Objectif
Mockup HTML/CSS pour la page Account & Billing.

## Livrables
- \`docs/mockups/account.html\`

## Sections
- Info plan actuel (nom, prix, date renouvellement)
- Détails billing (prochaine date de paiement, carte enregistrée)
- Bouton \"Manage subscription\" (→ Stripe Customer Portal)
- Paramètres profil (email, changement mot de passe)

## Contraintes
- Dark theme
- Layout simple et clean"

# --- Milestone 2: Foundation ---

gh issue create --repo "$REPO" --title "Scaffold: Project setup from starter" \
  --label "agent-frontend,foundation" --milestone "2 - Foundation" \
  --body "## Objectif
Initialiser le projet depuis le starter Supabase + Stripe.

## Livrables
- Projet fonctionnel : \`pnpm dev\`, \`pnpm build\`, \`pnpm lint\` passent clean
- Structure de dossiers conforme à CLAUDE.md
- Tailwind + shadcn/ui configurés
- ESLint, Prettier, tsconfig stricts
- Starter boilerplate nettoyé (pages démo supprimées)

## Scope
- Backend-only (pas de pages custom, juste le scaffold)
- Ne pas configurer Supabase/Stripe (issues séparées)"

gh issue create --repo "$REPO" --title "Foundation: Supabase auth integration" \
  --label "agent-frontend,foundation" --milestone "2 - Foundation" \
  --body "## Objectif
Auth complète via Supabase.

## Livrables
- \`@supabase/ssr\` configuré avec cookies
- Middleware session refresh (\`src/middleware.ts\`)
- Helpers client Supabase (server + client)
- Route group \`(auth)\` avec sign-in, sign-up, forgot-password (pages minimales)
- Route group \`(dashboard)\` protégée — redirect si non-authentifié
- Migration Supabase : table \`profiles\`

## Dépendances
- #7 (scaffold)"

gh issue create --repo "$REPO" --title "Foundation: Stripe subscription setup" \
  --label "agent-frontend,foundation" --milestone "2 - Foundation" \
  --body "## Objectif
Intégration Stripe pour les abonnements.

## Livrables
- \`stripe-fixtures.json\` : 4 produits (Starter, Pro, Premium, Enterprise) avec metadata tier
- Webhook handler : \`src/app/api/webhooks/stripe/route.ts\`
- Sync subscription → Supabase table \`subscriptions\`
- Events gérés : \`checkout.session.completed\`, \`customer.subscription.updated\`, \`customer.subscription.deleted\`
- Vérification signature webhook
- Migration Supabase : table \`subscriptions\`

## Dépendances
- #7 (scaffold)
- #8 (Supabase auth)"

gh issue create --repo "$REPO" --title "Foundation: Augur API client" \
  --label "agent-frontend,foundation" --milestone "2 - Foundation" \
  --body "## Objectif
Client server-side pour l'API Augur.

## Livrables
- \`src/services/augur.ts\` (server-only — jamais importé côté client)
- Fonctions : \`getStatCatalog()\`, \`getStatDetail(statId)\`, \`getHealth()\`
- Types dans \`src/types/stats.ts\` (interfaces TS matchant le schema API Augur)
- Transformation snake_case → camelCase
- Gestion d'erreurs typée
- Cache ISR via \`next: { revalidate }\`

## Dépendances
- #7 (scaffold)

## Notes
- L'API Augur est à \`augur.marubozu.ovh\`
- Auth par header \`X-API-Key\`
- Envelope : \`{ data, error }\`"

gh issue create --repo "$REPO" --title "Foundation: Tier-gating middleware" \
  --label "agent-frontend,foundation" --milestone "2 - Foundation" \
  --body "## Objectif
Contrôle d'accès par tier d'abonnement.

## Livrables
- Extension du middleware pour vérifier le statut d'abonnement sur \`(dashboard)\`
- Redirect vers pricing si pas d'abonnement actif
- Utilitaire \`canAccessStat(userTier, statTier)\` dans \`src/lib/subscription.ts\`
- Vérification côté serveur avant de servir les données stats
- Hook \`useSubscription()\` pour l'affichage côté client

## Dépendances
- #8 (Supabase auth)
- #9 (Stripe setup)"

# --- Milestone 3: Public Pages ---

gh issue create --repo "$REPO" --title "Page: Landing page" \
  --label "agent-frontend,page" --milestone "3 - Public Pages" \
  --body "## Objectif
Implémenter la landing page depuis le mockup.

## Référence
- Mockup : \`docs/mockups/landing.html\`

## Contraintes
- Server Component (pas de JS client nécessaire)
- CTA → sign-up ou pricing
- Matcher le mockup pixel-perfect

## Dépendances
- #1 (design landing)
- #7 (scaffold)"

gh issue create --repo "$REPO" --title "Page: Pricing page" \
  --label "agent-frontend,page" --milestone "3 - Public Pages" \
  --body "## Objectif
Implémenter la page pricing depuis le mockup.

## Référence
- Mockup : \`docs/mockups/pricing.html\`

## Contraintes
- Boutons \"Subscribe\" → Stripe Checkout session
- Toggle mensuel/annuel (client component)
- Feature comparison table

## Dépendances
- #2 (design pricing)
- #9 (Stripe setup)"

gh issue create --repo "$REPO" --title "Page: Auth flow" \
  --label "agent-frontend,page" --milestone "3 - Public Pages" \
  --body "## Objectif
Implémenter les pages auth depuis le mockup.

## Référence
- Mockup : \`docs/mockups/auth.html\`

## Pages
- Sign in, Sign up, Forgot password
- Boutons OAuth (Google minimum)
- Redirect → dashboard après auth réussie

## Dépendances
- #3 (design auth)
- #8 (Supabase auth)"

# --- Milestone 4: Member Area ---

gh issue create --repo "$REPO" --title "Page: Member dashboard" \
  --label "agent-frontend,page" --milestone "4 - Member Area" \
  --body "## Objectif
Implémenter le dashboard membre depuis le mockup.

## Référence
- Mockup : \`docs/mockups/dashboard.html\`

## Contraintes
- Fetch stat catalog côté serveur (Augur API)
- Stat family cards avec lock overlay si tier insuffisant
- Sélecteur d'instrument
- Loading + empty + error states

## Dépendances
- #4 (design dashboard)
- #10 (API client)
- #11 (tier-gating)"

gh issue create --repo "$REPO" --title "Page: Stat detail" \
  --label "agent-frontend,page" --milestone "4 - Member Area" \
  --body "## Objectif
Implémenter la page de détail d'une stat depuis le mockup.

## Référence
- Mockup : \`docs/mockups/stat-detail.html\`

## Contraintes
- Fetch stat data côté serveur (Augur API)
- Vérification tier côté serveur avant rendering
- Table de probabilités, magnitudes, accordion slices
- Color-coded edge (vert/rouge)
- Sélecteur instrument + timeframe

## Dépendances
- #5 (design stat detail)
- #10 (API client)
- #11 (tier-gating)"

gh issue create --repo "$REPO" --title "Page: Account & billing" \
  --label "agent-frontend,page" --milestone "4 - Member Area" \
  --body "## Objectif
Implémenter la page account depuis le mockup.

## Référence
- Mockup : \`docs/mockups/account.html\`

## Contraintes
- Info plan actuel depuis Supabase
- \"Manage subscription\" → Stripe Customer Portal
- Paramètres profil via Supabase Auth

## Dépendances
- #6 (design account)
- #9 (Stripe setup)"

echo ""
echo "=== Terminé ==="
echo "Labels, milestones, et 17 issues créés."
echo ""
echo "Résumé :"
echo "  Milestone 1 (Design)       : 6 issues (#1–#6)   — agent-designer"
echo "  Milestone 2 (Foundation)   : 5 issues (#7–#11)  — agent-frontend"
echo "  Milestone 3 (Public Pages) : 3 issues (#12–#14) — agent-frontend"
echo "  Milestone 4 (Member Area)  : 3 issues (#15–#17) — agent-frontend"
