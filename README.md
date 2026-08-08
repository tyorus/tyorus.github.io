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

`tyorus.com` is the canonical host. Prefer verifying the **Domain** property (DNS TXT) — you own the DNS now.

1. Search Console → Add property → **Domain** → `tyorus.com` → add the TXT record at your registrar → Verify.
2. (Or URL prefix `https://tyorus.com` + HTML file upload to `public/`.)
3. Submit sitemap: `https://tyorus.com/sitemap-index.xml` (also try `sitemap-0.xml` if the index fails to fetch).
4. URL Inspection → Request indexing for `/`, `/resume/`, `/services/`.
5. Fix **www**: add a `www` CNAME → `tyorus.github.io` in DNS so HTTPS/redirect to apex works (avoid split `www` vs non-www indexing).
6. LinkedIn + GitHub bio → `https://tyorus.com`; headline aligned with Metocean Data Engineer / Data Engineer.

## License

[MIT](LICENSE) © 2026 Suwignyo Prasetyo
