---
name: UI improvements 6 tasks
overview: 'Six corrections UI : visibilite des textes post-reveal, effet 3D Pokemon sur les cartes de role, retrait d''icones et de texte sur la landing, contraste du bouton "Rejoindre par code", et titre sur une ligne.'
todos:
  - id: fix-reveal-texts
    content: Sortir les textes post-confirmation du conteneur GSAP floute dans lobby.$code.reveal.tsx
    status: pending
  - id: 3d-pokemon-cards
    content: Ajouter effet 3D holographique brillant (tilt + reflet) aux cartes de role dans role-reveal.tsx
    status: pending
  - id: remove-icons
    content: Supprimer les icones Sword/Skull et leur animation GSAP de la landing page index.tsx
    status: pending
  - id: remove-stats-text
    content: Supprimer le texte '3 joueurs minimum...' de la landing page index.tsx
    status: pending
  - id: button-contrast
    content: Ameliorer le contraste du bouton 'Rejoindre par code' dans index.tsx
    status: pending
  - id: title-one-line
    content: Mettre le titre 'Who Is The Impostor' sur une seule ligne dans index.tsx
    status: pending
isProject: false
---

# Corrections UI - 6 taches

## 1. Textes post-confirmation quasi invisibles sur la page reveal

**Probleme** : Dans [`app/routes/lobby.$code.reveal.tsx`](app/routes/lobby.$code.reveal.tsx), apres le clic sur "C'est parti", le conteneur parent est anime par GSAP avec `opacity: 0.5` et `filter: blur(4px)` (lignes 52-56). Ensuite, les textes de fin s'affichent **a l'interieur** de ce meme conteneur floute. Ils heritent donc du blur et de l'opacite reduite, ce qui les rend quasiment illisibles.

**Solution** : Sortir les textes de confirmation du conteneur floute. Restructurer le JSX pour que :

- Le `containerRef` (floute) ne contienne que la `<RoleReveal>`
- Les textes de fin soient dans un element frere, a l'exterieur du conteneur floute
- Ajouter une animation GSAP d'apparition (fade-in) sur les textes de fin
- Augmenter egalement les tailles de texte pour une meilleure lisibilite (`text-xl` pour "Bonne chance", `text-base` pour le texte Dofus, `text-sm` pour "Tu peux fermer")

**Fichier** : [`app/routes/lobby.$code.reveal.tsx`](app/routes/lobby.$code.reveal.tsx) lignes 48-96

## 2. Effet carte Pokemon brillant 3D sur les cartes de role

**Probleme** : Les cartes de role dans [`app/components/role-reveal.tsx`](app/components/role-reveal.tsx) n'ont pas d'effet visuel special au survol.

**Solution** : Ajouter un effet 3D holographique/brillant inspire de l'Aceternity 3D Card Effect, **sans installer de dependance** (le projet utilise deja GSAP). L'implementation :

- **Tilt 3D au survol** : sur `onMouseMove`, calculer la position relative de la souris et appliquer `rotateX` / `rotateY` via GSAP (perspective deja presente a `1000px`)
- **Reflet holographique** : ajouter un overlay avec un `background: linear-gradient(...)` dynamique qui suit la souris, simulant un reflet brillant de carte Pokemon (effet arc-en-ciel / holographique avec `mix-blend-mode: overlay` ou `screen`)
- **Reset au mouseLeave** : retour fluide a la position initiale
- L'effet s'active uniquement **apres** le flip (quand `revealed === true`), pour ne pas interferer avec l'animation de retournement
- Ajouter un leger effet de `scale: 1.05` au hover pour amplifier la 3D

**Fichier** : [`app/components/role-reveal.tsx`](app/components/role-reveal.tsx)

## 3. Retirer les icones epee/tete de mort de la landing page

**Probleme** : Les icones `Sword` et `Skull` (lignes 54-58 de [`app/routes/index.tsx`](app/routes/index.tsx)) sont a retirer.

**Solution** :

- Supprimer le `<div ref={iconsRef}>` entier (lignes 54-58)
- Supprimer l'import `Sword, Skull` de `lucide-react` (ligne 7)
- Supprimer la ref `iconsRef` (ligne 21)
- Retirer l'animation GSAP de `iconsRef` dans la timeline (lignes 37-42)

**Fichier** : [`app/routes/index.tsx`](app/routes/index.tsx)

## 4. Retirer le texte "3 joueurs minimum . 1 imposteur . 1 donjon"

**Probleme** : Le texte aux lignes 110-112 de [`app/routes/index.tsx`](app/routes/index.tsx) est a supprimer.

**Solution** : Supprimer le `<p>` entier (lignes 110-112).

**Fichier** : [`app/routes/index.tsx`](app/routes/index.tsx)

## 5. Bouton "Rejoindre par code" manque de contraste

**Probleme** : Le bouton utilise `variant="outline"` qui donne `border border-border bg-transparent` -- avec `--color-border: #1f1f1f` sur fond noir, le contraste est tres faible.

**Solution** : Augmenter le contraste du bouton "Rejoindre par code" :

- Changer le variant de `outline` a `secondary` (fond `bg-secondary` = `#1a1a1a` + texte blanc) **OU**
- Garder `outline` mais ajouter des classes personnalisees pour forcer une bordure plus visible : `border-muted-foreground/40 hover:border-muted-foreground/60 hover:bg-secondary`
- Option recommandee : utiliser `variant="secondary"` avec une bordure ajoutee (`border border-muted-foreground/30`) pour un bon compromis visibilite/hierarchie entre les deux boutons

**Fichier** : [`app/routes/index.tsx`](app/routes/index.tsx) ligne 99-106

## 6. Titre "Who Is The Impostor" sur une seule ligne

**Probleme** : Le titre est actuellement coupe en deux lignes avec un `<br />` explicite (ligne 65). Le titre est deja en anglais ("Who Is The Impostor"), donc pas de traduction necessaire.

**Solution** :

- Supprimer le `<br />` a la ligne 65
- Ajouter un espace entre les deux `<span>` ou combiner en un seul element
- Reduire la taille de police si necessaire pour que tout tienne sur une ligne (`text-4xl sm:text-6xl` au lieu de `text-5xl sm:text-7xl`)
- Optionnel : ajouter `whitespace-nowrap` pour forcer une seule ligne

**Fichier** : [`app/routes/index.tsx`](app/routes/index.tsx) lignes 60-69
