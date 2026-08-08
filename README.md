# Tyorus

Personal site of **Suwignyo Prasetyo** — CV-first homepage with projects, tutorials, and a blog.

Built with [Astro](https://astro.build). Live at [tyorus.com](https://tyorus.com) (GitHub Pages).

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
lang: en
---
```

## URLs

- `/` — home (CV welcome)
- `/resume` — resume
- `/projects` · `/projects/<slug>`
- `/tutorials` · `/tutorials/<slug>`
- `/blog` · `/blog/<slug>`
- `/services` — freelance automation
- `/posts/<slug>` — legacy redirects

## Custom domain

`public/CNAME` → `tyorus.com`. In the domain registrar, point DNS to GitHub Pages (A/`A`/`AAAA` or CNAME per [GitHub docs](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site)). In the repo **Settings → Pages**, set custom domain `tyorus.com` and enable HTTPS.

## SEO / Google Search Console

After the custom domain is live:

1. Add a **URL prefix** property for `https://tyorus.com` and verify (HTML file or DNS TXT on tyorus.com).
2. Submit sitemap: `https://tyorus.com/sitemap-index.xml`.
3. Request indexing for `/`, `/resume`, and `/services`.
4. Optionally keep `tyorus.github.io` as the GitHub Pages host; custom domain `tyorus.com` is the public URL.
5. Keep LinkedIn / GitHub display aligned with **Tyorus** + roles (Metocean Data Engineer / Data Engineer).

## License

[MIT](LICENSE) © 2026 Suwignyo Prasetyo
