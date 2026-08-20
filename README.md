# Aaron Bandado - Portfolio

A fast, accessible, static portfolio built with semantic HTML, CSS, and vanilla JavaScript. No build step, no dependencies deployable straight to GitHub Pages.

## Design system

- **Type:** Space Grotesk (display), Inter (body), JetBrains Mono (metadata)
- **Color:** paper + ink with a single cobalt accent (`--accent: #2f43e0`), full light/dark theming via `data-theme`
- **Tokens:** all color, type, spacing, radius, and motion values live as CSS custom properties at the top of `styles/main.css`

## Features

- Responsive, left-aligned editorial layout
- Light/dark theme with system-preference detection and no flash on load
- Data-driven projects presented as engineering case studies (`data/projects.json`)
- Deep-linkable case-study modal (`/#billa`) with image carousel, keyboard nav, and focus trap
- Scroll-reveal with `prefers-reduced-motion` support
- Semantic HTML, skip link, ARIA labels, visible focus states
- SEO: descriptive metadata, Open Graph tags, JSON-LD `Person`, SVG favicon

## Structure

```
├── index.html            # Markup for all sections + modal
├── styles/main.css       # Design tokens + all component styles
├── scripts/main.js       # Nav, theme, project rendering, modal, carousel
├── data/projects.json    # Project + case-study content
└── assets/
    ├── Aaron Aminu Bandado Resume.pdf
    ├── about-pic.jpg      # (add) About-section portrait
    └── projects/<slug>/   # (add) Screenshots, named 1.png, 2.png, …
```

## Run locally

Open `index.html` directly, or serve the folder:

```bash
python3 -m http.server 8000   # then visit http://localhost:8000
```

## Editing projects

Each entry in `data/projects.json` supports:

| Field | Type | Notes |
|-------|------|-------|
| `id` | string | kebab-case slug; also the modal deep-link hash |
| `title`, `tagline` | string | |
| `year`, `role`, `status` | string | shown as monospaced metadata |
| `featured` | boolean | `true` → full case-study row; `false` → "More on GitHub" card linking to the repo |
| `shortDescription` | string | card summary |
| `tech` | string[] | stack tags |
| `repoUrl`, `liveUrl` | string | `liveUrl` may be empty |
| `images` | string[] | screenshots; empty shows a branded placard |
| `caseStudy` | object | `overview`, `problem`, `constraints`, `approach`, `architecture`, `decisions[]`, `challenges`, `results`, `lessons` |

Fields beginning with `TODO` render in a muted style as visible placeholders fill them in as the content becomes available.

## Adding images

1. Drop screenshots into `assets/projects/<slug>/` (recommended 1200×750, PNG/JPG).
2. List them in the project's `images` array.
3. The first image is the card thumbnail and the first carousel slide.

Add your portrait as `assets/about-pic.jpg`; until then the About section shows an initials placard.

## Deploy (GitHub Pages)

Settings → Pages → Source: `main` branch. All paths are relative, so it works from a project subpath too.
