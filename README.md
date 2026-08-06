# Tyolabs

Personal site of **Suwignyo Prasetyo** — CV-first homepage with projects, tutorials, and a blog.

Built with [Astro](https://astro.build). Deployed to GitHub Pages.

## Develop

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
npm run preview
```

## Content

- Resume data: `src/data/resume.ts`
- Site meta / links: `src/data/site.ts`
- Blog: `src/content/blog/*.md`
- Tutorials: `src/content/tutorials/*.md`
- Projects: `src/content/projects/*.md`

New entry — same front matter in any of those folders:

```yaml
---
title: "Title"
description: ""
pubDate: 2026-08-02
tags: []
categories: []
math: false
---
```

## URLs

- `/` — home (CV welcome)
- `/resume` — resume
- `/projects` · `/projects/<slug>`
- `/tutorials` · `/tutorials/<slug>`
- `/blog` · `/blog/<slug>`
- `/posts/<slug>` — legacy redirects

## SEO / Google Search Console

After deploy:

1. Confirm the Search Console property for `https://tyolabs.github.io`.
2. Submit the sitemap: `https://tyolabs.github.io/sitemap-index.xml`.
3. Request indexing for `/`, `/resume`, and `/services`.
4. Keep LinkedIn and GitHub profile name/headline aligned with site roles (Metocean Data Engineer / Data Engineer) so `sameAs` entity signals stay consistent.

## License

[MIT](LICENSE) © 2026 Suwignyo Prasetyo
