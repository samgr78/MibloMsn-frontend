# Audit fonctionnel S1 à S8

Audit réalisé le 10 septembre 2026 sur le frontend React/TypeScript et l'API Express/Prisma.

## Résultat

| Story | Statut | Garanties vérifiées |
| --- | --- | --- |
| S1 — Inscription | Conforme | Champs contrôlés, validation front/back, erreurs associées aux champs, mot de passe masqué et absent de toutes les réponses API, lien de connexion. |
| S2 — Connexion/session | Conforme | Session persistée dans `localStorage`, routes front et API protégées, redirection vers le feed, interception globale des 401 sans boucle, déconnexion complète. |
| S3 — Feed | Conforme | Auteur, texte, image et date, ordre stable `createdAt DESC, id DESC`, pagination, états chargement/erreur/vide/succès, liste conservée pendant un changement de page. |
| S4 — Création | Conforme | Texte obligatoire limité à 1 000 caractères, image optionnelle, aperçu, formats JPEG/PNG/WebP/GIF, limite 5 Mo, bouton bloqué pendant l'envoi, insertion immédiate dans le feed, brouillon conservé en cas d'erreur. |
| S5 — Détail/commentaires | Conforme | URL directe, navigation depuis le feed, liste et ajout dynamique, 404 dédiée, gestion des erreurs, suppression dynamique des commentaires de l'auteur. |
| S6 — Like/unlike | Conforme | Mise à jour optimiste, rollback et message en cas d'échec, synchronisation par événement UI, état serveur retourné par chaque endpoint, contrainte unique `(postId, userId)` en base. |
| S7 — Profils | Conforme | Même composant pour `/profile` et `/profile/:userId`, données publiques minimales, posts de l'utilisateur, actions privées réservées au propriétaire, utilisateur absent géré, états chargement/erreur/introuvable/vide/succès. |
| S8 — Suppression | Conforme | Confirmation front, retrait sans rechargement, contrôle d'auteur backend pour posts et commentaires, réponses 403 aux requêtes forgées. |

## Vérifications exécutées

- `npm run build` sur le frontend et le backend.
- `npm run lint` sur le frontend, sans avertissement.
- `npm run test:audit` contre une copie temporaire de la base : 11 contrôles HTTP réussis.
- 12 tests frontend Vitest/Testing Library avec MSW : quatre états du feed, réponse API invalide, inscription, création, commentaires/404, rollback du like et profil tiers.
- 4 tests backend Vitest/Supertest consacrés à l'authentification et à l'ownership des suppressions.
- 1 test Playwright bout en bout : connexion, publication, apparition immédiate dans le feed, puis nettoyage du post.
- Parcours navigateur : inscription affichée, connexion, feed paginé, formulaire de post et validation, profil propriétaire, profil tiers sans actions privées, détail et commentaires, persistance après rechargement, déconnexion et blocage de `/feed` sans session.

## Rejouer le contrôle API

Lancer l'API sur le port 3100, puis exécuter dans le backend :

```bash
AUDIT_API_URL=http://localhost:3100 npm run test:audit
```

Le script crée des comptes et du contenu de test. Il doit donc être lancé sur une base de développement ou de test, jamais sur une base de production.
