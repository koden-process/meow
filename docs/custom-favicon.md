# Configuration de l'Apparence Personnalisée

## Vue d'ensemble

Cette application permet de personnaliser l'apparence (nom, favicon et logo) via des variables d'environnement. Si aucune variable n'est définie, les éléments par défaut seront utilisés.

- **Nom de l'application** : Par défaut "Meow Sales Pipeline"
- **Favicon** : Par défaut `/meow-logo-reduced.svg`
- **Logo de navigation** : Aucun logo par défaut (zone libre dans le menu)

## Configuration

### Variables d'environnement

Créez un fichier `.env.local` dans le dossier `frontend/` et ajoutez :

#### Nom de l'application personnalisé

```bash
VITE_CUSTOM_APP_NAME=Mon Application CRM
```

#### Favicon personnalisé

```bash
VITE_CUSTOM_FAVICON_URL=https://example.com/votre-favicon.svg
```

#### Logo de navigation personnalisé

```bash
# URL du logo (obligatoire pour afficher le logo)
VITE_CUSTOM_LOGO_URL=https://example.com/votre-logo.svg

# Texte alternatif (optionnel, par défaut "Logo")
VITE_CUSTOM_LOGO_ALT=Mon Logo

# Dimensions maximales en pixels (optionnel)
VITE_CUSTOM_LOGO_MAX_WIDTH=120
VITE_CUSTOM_LOGO_MAX_HEIGHT=60
```

### Formats supportés

- SVG (recommandé)
- PNG
- ICO
- JPEG

### Exemples d'utilisation

#### Nom d'application personnalisé

```bash
VITE_CUSTOM_APP_NAME=Sales CRM Pro
```

#### Favicon à partir d'une URL externe

```bash
VITE_CUSTOM_FAVICON_URL=https://cdn.example.com/mon-favicon.svg
```

#### Favicon à partir d'un fichier local (dans public/)

```bash
VITE_CUSTOM_FAVICON_URL=/mon-favicon-custom.png
```

#### Logo de navigation complet

```bash
VITE_CUSTOM_LOGO_URL=https://cdn.example.com/logo-entreprise.svg
VITE_CUSTOM_LOGO_ALT=Logo de Mon Entreprise
VITE_CUSTOM_LOGO_MAX_WIDTH=100
VITE_CUSTOM_LOGO_MAX_HEIGHT=50
```

## Fonctionnement

### Nom de l'application

1. Au démarrage de l'application, la fonction `setDynamicAppName()` est appelée
2. Elle vérifie si `VITE_CUSTOM_APP_NAME` est définie
3. Si oui, elle utilise ce nom pour le titre de la page
4. Si non, elle utilise le nom par défaut "Meow Sales Pipeline"

### Favicon

1. Au démarrage de l'application, la fonction `setDynamicFavicon()` est appelée
2. Elle vérifie si `VITE_CUSTOM_FAVICON_URL` est définie
3. Si oui, elle utilise cette URL comme favicon
4. Si non, elle utilise le favicon par défaut

### Logo de navigation

1. Le composant `<Logo />` vérifie si `VITE_CUSTOM_LOGO_URL` est définie
2. Si oui, il affiche le logo dans la zone libre du menu de navigation
3. Si non, la zone reste vide (comportement par défaut)
4. Le logo est automatiquement dimensionné selon les paramètres configurés

## Développement

### Tester localement

1. Copiez `.env.example` vers `.env.local`
2. Décommentez et modifiez les variables selon vos besoins :
   - `VITE_CUSTOM_APP_NAME` pour le nom de l'application
   - `VITE_CUSTOM_FAVICON_URL` pour le favicon
   - `VITE_CUSTOM_LOGO_URL` pour le logo de navigation
3. Redémarrez le serveur de développement
4. Les nouveaux éléments devraient apparaître

### Changer le favicon à l'exécution

Vous pouvez également changer le favicon dynamiquement :

```typescript
import { updateFavicon } from './helpers/FaviconHelper';

// Changer le favicon
updateFavicon('https://example.com/nouveau-favicon.svg');
```

### Gestion des erreurs

- Si le favicon personnalisé ne se charge pas, le favicon par défaut reste affiché
- Si le logo personnalisé ne se charge pas, il est automatiquement masqué et la zone reste vide
- Les erreurs de chargement sont loggées dans la console pour faciliter le débogage

## Production

En production, définissez les variables d'environnement dans votre système de déploiement (Vercel, Netlify, Docker, etc.) :

- `VITE_CUSTOM_APP_NAME` : Nom personnalisé de l'application (optionnel)
- `VITE_CUSTOM_FAVICON_URL` : URL du favicon personnalisé
- `VITE_CUSTOM_LOGO_URL` : URL du logo de navigation
- `VITE_CUSTOM_LOGO_ALT` : Texte alternatif du logo (optionnel)
- `VITE_CUSTOM_LOGO_MAX_WIDTH` : Largeur maximale du logo en pixels (optionnel)
- `VITE_CUSTOM_LOGO_MAX_HEIGHT` : Hauteur maximale du logo en pixels (optionnel)

## Caractéristiques techniques

### Formats d'images supportés

- **Favicon** : SVG (recommandé), PNG, ICO, JPEG
- **Logo** : SVG (recommandé), PNG, JPEG, WebP

### Performance

- Les images sont chargées de manière asynchrone
- Gestion automatique des erreurs de chargement
- Optimisation CSS avec `object-fit: contain`
- Transitions CSS fluides pour l'interaction

### Responsive Design

- Le logo s'adapte automatiquement aux dimensions configurées
- Compatible avec les écrans de toutes tailles
- Styles optimisés pour la navigation mobile
