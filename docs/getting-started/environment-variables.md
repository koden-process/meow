# Variables d'environnement

## Backend

| Variable | Obligatoire | Défaut | Description |
|---|---:|---|---|
| `MONGODB_URI` | Oui | Aucun | URI de connexion MongoDB. Le backend quitte si elle est absente. |
| `SESSION_SECRET` | Oui | Aucun | Secret utilisé pour signer et vérifier les JWT. |
| `PORT` | Non | `9000` | Port d'écoute du backend. |
| `IP_ADDRESS` | Non | `127.0.0.1` | Adresse d'écoute du backend. |
| `LOG_LEVEL` | Non | `info` | Niveau de logs Pino. |
| `NODE_ENV` | Non | Aucun | En `production`, CORS est désactivé côté backend. |

Exemple :

```bash
export MONGODB_URI=mongodb://localhost:27017/meow
export SESSION_SECRET=change-me
export PORT=9000
export LOG_LEVEL=debug
```

## Frontend

| Variable | Obligatoire | Défaut | Description |
|---|---:|---|---|
| `VITE_URL` | Non | Origine du navigateur | URL de base utilisée par `RequestHelper` pour appeler le backend. Recommandée en développement. |
| `VITE_CUSTOM_APP_NAME` | Non | Nom par défaut | Nom affiché dans le titre de l'application. |
| `VITE_CUSTOM_FAVICON_URL` | Non | Favicon par défaut | URL du favicon. |
| `VITE_CUSTOM_LOGO_URL` | Non | Aucun logo personnalisé | URL du logo affiché dans la navigation. |
| `VITE_CUSTOM_LOGO_ALT` | Non | `Logo` | Texte alternatif du logo. |
| `VITE_CUSTOM_THEME_COLOR` | Non | Thème par défaut | Couleur principale. |
| `VITE_CUSTOM_NAVIGATION_COLOR` | Non | Couleur par défaut | Couleur de navigation. |
| `VITE_CUSTOM_OPPORTUNITY_PDF_TEMPLATE_URL` | Non | PDF générique | URL publique d'un template HTML Mustache utilisé pour l'export d'une opportunité. |

Le frontend lit les variables Vite au build et, en Docker, via `frontend/public/env-config.js` substitué par `start.sh`.

### Template PDF d'opportunité

Le template reçoit un contexte JSON générique versionné (`version: "1"`) contenant
l'opportunité, son montant, son responsable, son étape, son équipe et les attributs
du schéma. Les attributs sont disponibles dans l'ordre sous `attributes` et par clé
sous `attributesByKey`.

Exemple :

```html
<h1>{{opportunity.name}}</h1>
<p>{{opportunity.amount.display}}</p>
{{#owner}}<p>{{name}}</p>{{/owner}}
<p>{{attributesByKey.attribute-key.displayValue}}</p>
```

Seules les interpolations Mustache échappées (`{{...}}`) et les sections sont
acceptées. Le HTML rendu est assaini avant sa conversion en PDF. Le serveur du
template ainsi que ceux des images et polices qu'il référence doivent autoriser
CORS. Si l'URL est absente, non substituée ou inaccessible, l'application produit
automatiquement le PDF générique et journalise un avertissement technique.

## Personnalisation runtime Docker

```bash
docker run -d \
  -e MONGODB_URI="mongodb://host.docker.internal:27017/meow" \
  -e SESSION_SECRET="change-me" \
  -e VITE_CUSTOM_APP_NAME="Sales CRM" \
  -e VITE_CUSTOM_LOGO_URL="https://example.com/logo.svg" \
  -e VITE_CUSTOM_OPPORTUNITY_PDF_TEMPLATE_URL="https://example.com/opportunity-template.html" \
  -p 8080:80 \
  meow:local
```

Ne jamais committer de valeurs réelles pour `MONGODB_URI` ou `SESSION_SECRET`.
