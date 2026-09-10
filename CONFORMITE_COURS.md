# Conformité au cours React TypeScript

Ce document relie les choix du projet aux règles du support L3/B3.

## TypeScript utile

- Le mode `strict` est activé dans les deux projets.
- Les erreurs et les données réseau entrent dans le code avec le type `unknown`, jamais `any`.
- Les unions discriminées représentent les états d'écran exclusifs (`loading`, `error`, `empty`, `success`).
- Les props, réponses API et fonctions asynchrones ont des types explicites.
- Les listes React utilisent les identifiants métier comme `key`.

## React

- L'interface est une fonction de l'état ; aucune modification manuelle du DOM.
- Les formulaires sont contrôlés.
- Les mises à jour de tableaux sont immuables avec la forme fonctionnelle des setters.
- Les effets réseau utilisent un `AbortController` et un cleanup.
- Les valeurs dérivées, comme les compteurs de listes, sont calculées pendant le rendu.
- Le projet est organisé par feature ; seuls les composants réellement communs sont dans `shared`.

## Frontières API et sécurité

- Les réponses du backend sont validées à l'exécution avec Zod avant leur utilisation par React.
- Le token est stocké dans `localStorage`, choix accepté pour ce projet : simple et non exposé au CSRF, mais à protéger contre les XSS.
- Un interceptor ajoute le JWT et transforme tout 401 protégé en logout + redirection sans boucle.
- L'ownership est toujours contrôlé dans l'API. Cacher un bouton dans React n'est qu'une règle d'affichage.
- Le mot de passe est haché et n'est jamais inclus dans une réponse API.

## Tests demandés par le cours

| Niveau | Outil | Couverture |
| --- | --- | --- |
| Composants | Vitest + Testing Library | Comportements visibles et formulaires, avec requêtes par rôle et label. |
| Réseau frontend | MSW | Handlers distincts loading, error, empty, success et réponse invalide. |
| Backend | Vitest + Supertest | Authentification et ownership des suppressions. |
| Bout en bout | Playwright | Un parcours : login, publication, apparition dans le feed. |

Commandes à lancer avant chaque commit :

```bash
npm test
npm run lint
npm run build
npm run test:e2e
```

Dans le backend :

```bash
npm test
npm run build
```

## Points à savoir expliquer à l'oral

1. Pourquoi un type TypeScript ne suffit pas à valider une réponse HTTP, et pourquoi Zod est utilisé.
2. Comment l'union `FeedState` empêche des états contradictoires.
3. Pourquoi les requêtes de pages et de profils sont annulées au démontage.
4. Comment le like optimiste est appliqué puis annulé si l'API échoue.
5. Pourquoi l'unicité `(postId, userId)` doit être garantie par la base.
6. Pourquoi un contrôle d'ownership backend est indispensable même si le bouton Delete est masqué.
7. Pourquoi `localStorage` est acceptable ici et quel risque XSS il implique.
