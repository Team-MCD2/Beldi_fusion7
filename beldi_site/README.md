# Beldi Fusion Toulouse - Site vitrine immersif

Site **multi-pages** statique avec direction artistique marocaine assum&eacute;e :
sc&egrave;ne d&eacute;sert anim&eacute;e, motifs zellige et moucharabieh authentiques, illustrations
cartoon dessin&eacute;es &agrave; la main, calligraphie arabe, palette Majorelle / terracotta /
safran, vid&eacute;os de fond optionnelles avec fallback robuste.

## Pages

| Fichier          | Page                                      |
|------------------|-------------------------------------------|
| `index.html`     | Accueil (hero d&eacute;sert + 7 chapitres narratifs) |
| `carte.html`     | La carte (5 cat&eacute;gories, onglets)              |
| `histoire.html`  | Notre histoire (4 chapitres &eacute;ditoriaux)       |
| `galerie.html`   | Galerie (collage + scroll horizontal)     |
| `contact.html`   | Contact, horaires, itin&eacute;raire, formulaire     |

## Lancer en local

```bash
python -m http.server 8765
# ou
npx serve .
```

Puis ouvre <http://localhost:8765>.

## Ce qui rend le site unique (vs template IA g&eacute;n&eacute;rique)

### 1. Sc&egrave;ne d&eacute;sert anim&eacute;e en SVG pur (`assets/desert-scene.svg`)

- Ciel cr&eacute;puscule d&eacute;grad&eacute; (violet &rarr; orange &rarr; dor&eacute;).
- Soleil qui pulse, &eacute;toiles qui scintillent, oiseaux qui volent.
- **Caravane de 3 dromadaires** qui traverse l'horizon en 70 secondes.
- 3 couches de dunes avec parallaxe de profondeur.
- Palmiers qui oscillent, tente berb&egrave;re au loin.
- Grain textureux subtil.
- **Anim&eacute; via SMIL SVG** : pas de d&eacute;pendance externe, ultra-l&eacute;ger (<15 KB).

### 2. Motifs marocains authentiques tuileables

- `assets/zellige.svg` : &eacute;toile &agrave; 8 branches classique des palais marocains.
- `assets/moucharabieh.svg` : treillis ajour&eacute;, sceau de Salomon.
- `assets/divider.svg` : arabesque s&eacute;paratrice.
- Utilis&eacute;s en **background tuileable** via `.pattern-overlay` + `.pattern-zellige` /
  `.pattern-moucharabieh` avec variant `.pattern-spin` pour rotation lente.

### 3. Illustrations cartoon dessin&eacute;es &agrave; la main

Aucune illustration g&eacute;n&eacute;rique, toutes vectoris&eacute;es sur mesure :

- `illus-tajine.svg` : tajine avec vapeur anim&eacute;e.
- `illus-teapot.svg` : th&eacute;i&egrave;re marocaine qui verse du th&eacute; (jet anim&eacute;).
- `illus-lantern.svg` : lanterne avec flamme vacillante et halo lumineux pulsant.
- `illus-camel.svg` : dromadaire avec tapis de selle color&eacute;.
- `illus-mint.svg` : branche de menthe fra&icirc;che.

Toutes utilis&eacute;es avec `.illus-float` (animation `gentle-bob`) pour un effet
flottant naturel.

### 4. Vid&eacute;os de fond avec fallback robuste

Deux emplacements strat&eacute;giques :

- **Hero accueil** : couche de vid&eacute;o par-dessus la sc&egrave;ne SVG anim&eacute;e.
- **Section &laquo; Nos saveurs &raquo;** : vid&eacute;o d'&eacute;pices ou th&eacute; par-dessus un poster
  Unsplash.

Le JS (`js/main.js`) essaie plusieurs URLs candidates. Si aucune ne charge
en 6 secondes, la vid&eacute;o est masqu&eacute;e et le fallback (SVG anim&eacute; ou image poster)
prend le relais. Respecte aussi `prefers-reduced-motion` et `saveData`.

**Pour mettre tes propres vid&eacute;os**, remplace dans l'HTML :

```html
<video data-video-candidates='["https://ton-cdn.com/desert.mp4"]' ...>
```

Ou en local :

```html
<video data-video-candidates='["assets/video/hero.mp4"]' ...>
```

### 5. Typographie expressive

- **Fraunces** (serif variable, axes `opsz` / `SOFT` / `WONK` pour les italiques).
- **Reem Kufi** (calligraphie arabe stylis&eacute;e).
- **Inter** (corps de texte).
- **Chiffres arabes-indiens** `&#1632;&#1633; &#1632;&#1634; &#1632;&#1635;` pour les num&eacute;ros de chapitre.

### 6. Palette &eacute;quilibr&eacute;e

| Couleur               | Usage                                   |
|-----------------------|-----------------------------------------|
| Noir aubergine `#1C1412` | Texte, sections sombres              |
| Cr&egrave;me chaude `#FBF4E4`   | Fond principal                       |
| Sable `#F2E6D3`       | Fond sections alternes                  |
| **Terracotta `#C84B31`** | Accent signature (titres, liens)    |
| **Bleu Majorelle `#2B3F8E`** | Section livraison, signature     |
| **Safran `#E9A23B`**  | Accent secondaire, illustrations        |
| Vert palmier `#2F4F2E` | Menthe, feuillages                     |
| Or `#D4AF37`          | Liser&eacute;s d&eacute;coratifs                    |

### 7. Narration &eacute;ditoriale

L'accueil ne suit pas la structure g&eacute;n&eacute;rique "hero + features + reviews + CTA".
C'est un **r&eacute;cit en 7 chapitres num&eacute;rot&eacute;s** (&#1632;&#1633; &rarr; &#1632;&#1639;) :

1. **Hero d&eacute;sert** (sc&egrave;ne SVG + vid&eacute;o)
2. **Bandeau caravane** (dromadaires qui traversent)
3. **Marquee** italique d&eacute;filant
4. **Ch. I** : Notre approche (split &eacute;ditorial + lettrine + illustrations flottantes)
5. **Divider arabesque**
6. **Ch. II** : Trois rituels (cards avec illustrations cartoon)
7. **Ch. III** : Nos saveurs (video background)
8. **Ch. IV** : Nos principes (4 feature cards avec illustrations)
9. **Ch. V** : Livraison (section Majorelle + motif moucharabieh + dromadaire)
10. **Ch. VI** : Citation g&eacute;ante (section dark + zellige en fond)
11. **Ch. VII** : L'adresse (+ Google Maps embed)

Les autres pages reprennent le m&ecirc;me vocabulaire (bandeau caravane, motifs
zellige/moucharabieh, illustrations flottantes, kicker avec chiffres arabes).

## Arborescence

```
beldi_site/
|-- index.html          Accueil (7 chapitres narratifs)
|-- carte.html
|-- histoire.html
|-- galerie.html
|-- contact.html
|-- css/style.css       Tout le style (1340 lignes)
|-- js/main.js          Interactions, video loader intelligent
|-- assets/
|   |-- logo.svg        Logo Beldi (minaret + arche)
|   |-- favicon.svg
|   |-- desert-scene.svg    SCENE DESERT ANIMEE (hero)
|   |-- zellige.svg         Motif etoile 8 branches tuileable
|   |-- moucharabieh.svg    Motif treillis tuileable
|   |-- divider.svg         Arabesque separatrice
|   |-- illus-tajine.svg    Illustration cartoon tajine
|   |-- illus-teapot.svg    Illustration cartoon theiere
|   |-- illus-lantern.svg   Illustration cartoon lanterne
|   |-- illus-camel.svg     Illustration cartoon dromadaire
|   |-- illus-mint.svg      Illustration cartoon menthe
|   |-- ornament.svg        Etoile marocaine (footer)
|-- partials/           Header + footer (futurs composants Astro)
|-- robots.txt
|-- sitemap.xml
|-- site.webmanifest
|-- README.md
```

## Infos r&eacute;elles Beldi Fusion int&eacute;gr&eacute;es

- **Adresse** : 43 avenue de Muret, 31300 Toulouse (Patte d'Oie).
- **Note** : 4,6 / 5 (80+ avis Uber Eats).
- **Horaires** : 9h - 23h59 (jusqu'&agrave; 2h ven, 3h sam).
- **Livraison** : Uber Eats, Deliveroo.
- **Prix** : Brunchs 16,10 - 20,10&nbsp;&euro; / Sandwichs 13,50&nbsp;&euro; /
  Grillades 16,10 - 20,10&nbsp;&euro; / Th&eacute; 3&nbsp;&euro;.

## SEO en place

- Titres / descriptions uniques par page, canonical, Open Graph.
- Schema.org `Restaurant` + `Menu` + `BreadcrumbList` + `AggregateRating`.
- `sitemap.xml`, `robots.txt`, `site.webmanifest`, `geo.position`.
- HTML s&eacute;mantique, accessibilit&eacute; (`aria-*`, skip-link, focus visible).

## Performance

- 0 JS framework, 0 dependency externe (sauf Google Fonts + photos Unsplash
  optionnelles).
- SVG inline pour les sc&egrave;nes : charge quasi-instantan&eacute;e.
- Vid&eacute;os charg&eacute;es uniquement quand **visibles &agrave; l'&eacute;cran** (IntersectionObserver),
  avec timeout 6s.
- Respecte `prefers-reduced-motion` et `navigator.connection.saveData`.

## &Agrave; faire avant mise en ligne

1. Remplacer `assets/logo.svg` par le **vrai logo** du restaurant.
2. Remplacer les URLs vid&eacute;os dans `data-video-candidates` par des vid&eacute;os
   locales (`assets/video/...`) ou des URLs vid&eacute;o v&eacute;rifi&eacute;es.
3. Remplacer les photos Unsplash par les **photos r&eacute;elles du restaurant**
   (plats, d&eacute;cor, &eacute;quipe).
4. Mettre le **vrai num&eacute;ro** : `+33-5-...` dans le JSON-LD et
   `tel:+33...` dans `contact.html`.
5. Remplacer `beldifusion-toulouse.fr` par le vrai domaine.
6. Cr&eacute;er / revendiquer la **fiche Google Business Profile**.
7. Ajouter la propri&eacute;t&eacute; &agrave; **Google Search Console** et soumettre
   `sitemap.xml`.

## &Eacute;tape suivante (apr&egrave;s validation du design)

Portage vers **Astro + Tailwind** :

- D&eacute;coupage en composants `.astro` : `Header`, `HeroDesert`, `CaravanStrip`,
  `Marquee`, `EditorialSplit`, `Ritual`, `FeatureIllus`, `SectionVideo`,
  `ArabesqueDivider`, `PullQuote`, `DeliveryMajorelle`, `Footer`.
- Config Tailwind avec la palette Beldi + fontes variables Fraunces / Reem Kufi.
- Collection de contenu `menu/*.md(x)` pour g&eacute;rer les plats.
- Images optimis&eacute;es via `astro:assets` (avif/webp auto).
- Vid&eacute;os locales dans `public/video/`.
- `@astrojs/sitemap` pour g&eacute;n&eacute;ration auto.
