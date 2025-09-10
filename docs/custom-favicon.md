# Configuration du Favicon Personnalisé

## Vue d'ensemble

Cette application permet de personnaliser le favicon via une variable d'environnement. Si aucune variable n'est définie, le favicon par défaut (`/meow-logo-reduced.svg`) sera utilisé.

## Configuration

### Variable d'environnement

Créez un fichier `.env.local` dans le dossier `frontend/` et ajoutez :

```bash
VITE_CUSTOM_FAVICON_URL=https://example.com/votre-favicon.svg
```

### Formats supportés

- SVG (recommandé)
- PNG
- ICO
- JPEG

### Exemples d'utilisation

#### Favicon à partir d'une URL externe

```bash
VITE_CUSTOM_FAVICON_URL=https://cdn.example.com/mon-favicon.svg
```

#### Favicon à partir d'un fichier local (dans public/)

```bash
VITE_CUSTOM_FAVICON_URL=/mon-favicon-custom.png
```

## Fonctionnement

1. Au démarrage de l'application, la fonction `setDynamicFavicon()` est appelée
2. Elle vérifie si `VITE_CUSTOM_FAVICON_URL` est définie
3. Si oui, elle utilise cette URL comme favicon
4. Si non, elle utilise le favicon par défaut

## Développement

### Tester localement

1. Copiez `.env.example` vers `.env.local`
2. Décommentez et modifiez `VITE_CUSTOM_FAVICON_URL`
3. Redémarrez le serveur de développement
4. Le nouveau favicon devrait apparaître

### Changer le favicon à l'exécution

Vous pouvez également changer le favicon dynamiquement :

```typescript
import { updateFavicon } from './helpers/FaviconHelper';

// Changer le favicon
updateFavicon('https://example.com/nouveau-favicon.svg');
```

## Production

En production, définissez la variable d'environnement `VITE_CUSTOM_FAVICON_URL` dans votre système de déploiement (Vercel, Netlify, Docker, etc.).
