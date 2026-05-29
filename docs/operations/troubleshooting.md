# Troubleshooting

## Le backend quitte au démarrage

Vérifier les variables obligatoires :

```bash
echo "$MONGODB_URI"
echo "$SESSION_SECRET"
```

Le backend quitte si une des deux est absente.

## Le frontend ne contacte pas le backend en développement

Définir `VITE_URL` :

```bash
VITE_URL=http://localhost:9000 npm run dev
```

Sans `VITE_URL`, le frontend utilise l'origine courante du navigateur.

## Erreurs CORS

En développement, vérifier que :

- le backend n'est pas lancé avec `NODE_ENV=production`;
- `VITE_URL` pointe bien vers le backend;
- le backend écoute sur l'adresse et le port attendus.

En Docker production, passer par Nginx sur le même domaine.

## Token invalide après redémarrage

Si `SESSION_SECRET` change, les JWT existants deviennent invalides. Fournir un secret stable en production.

## Les tests AVA échouent

Vérifier que :

- le backend est démarré;
- `URL` pointe vers le backend;
- le backend a été rebuild;
- MongoDB est accessible.

```bash
cd backend
npm run build
URL=http://localhost:9000 npx ava
```

## Les personnalisations Docker ne changent pas

Vérifier les logs de `start.sh` et le contenu substitué de `env-config.js`.

Variables supportées :

- `VITE_CUSTOM_APP_NAME`
- `VITE_CUSTOM_FAVICON_URL`
- `VITE_CUSTOM_LOGO_URL`
- `VITE_CUSTOM_LOGO_ALT`
- `VITE_CUSTOM_THEME_COLOR`
- `VITE_CUSTOM_NAVIGATION_COLOR`

