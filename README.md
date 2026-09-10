# MiBLo Messenger - frontend

Réseau social réalisé en React, TypeScript et Vite pour le sprint fullstack L3/B3.

## Démarrage

```bash
npm install
npm run dev
```

L'API doit être disponible sur `http://localhost:3000`. La variable publique `VITE_API_URL` peut modifier cette URL ; elle ne doit jamais contenir de secret.

## Vérifications avant un commit

```bash
npm test
npm run lint
npm run build
npm run test:e2e
```

- Vitest + Testing Library testent les comportements visibles.
- MSW simule les réponses réseau, notamment les états loading, error, empty et success.
- Playwright couvre un seul parcours complet : connexion, publication, apparition dans le feed.
- Le test E2E attend une base backend seedée avec `alice@test.com` / `password123` et supprime le post créé à la fin.

## Architecture

Le code est organisé par feature dans `src/features`. Les composants réellement partagés restent dans `src/shared`. Les réponses API sont reçues comme `unknown`, puis validées à l'exécution avec Zod avant d'entrer dans l'état React.

Voir aussi [AUDIT_S1-S8.md](./AUDIT_S1-S8.md) pour la couverture fonctionnelle complète.
