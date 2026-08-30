# Tyorus

Personal site of **Suwignyo Prasetyo** — CV-first homepage with projects and a blog.

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
- Projects: `src/content/projects/*.md`
- Downloadable resume (Typst): `cv/resume.typ` → `public/files/suwignyo-prasetyo-resume.pdf`

```bash
typst compile cv/resume.typ public/files/suwignyo-prasetyo-resume.pdf
```

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
- `/blog` · `/blog/<slug>`
- `/services` — freelance automation
- `/contact` — contact form
- `/posts/<slug>` · `/tutorials/<slug>` — legacy redirects → blog

## Contact form

The `/contact` page submits to a Supabase Edge Function that stores submissions, sends email via [Resend](https://resend.com), and notifies Telegram.

### Local env

```bash
cp .env.example .env
```

Fill in:

- `PUBLIC_SUPABASE_URL` — Supabase project URL
- `PUBLIC_SUPABASE_ANON_KEY` — Supabase anon/public key
- `PUBLIC_SUPABASE_CONTACT_FUNCTION` — edge function slug (default: `rapid-action`)

Email and Telegram are **not** read from this file. They are configured for the edge function — see [`supabase/functions/.env.example`](supabase/functions/.env.example).

### Supabase setup

1. Create a project at [supabase.com](https://supabase.com).
2. Run the migration in `supabase/migrations/001_contact_submissions.sql` (SQL editor or `supabase db push`).
3. Deploy the edge function:

```bash
supabase functions deploy contact-submit
```

4. Set edge function secrets — copy [`supabase/functions/.env.example`](supabase/functions/.env.example) and set values via **Dashboard → Edge Functions → Secrets**, or locally:

```bash
cp supabase/functions/.env.example supabase/functions/.env
# edit supabase/functions/.env, then for local testing:
supabase functions serve rapid-action --env-file supabase/functions/.env
```

| Secret | Example |
|--------|---------|
| `RESEND_API_KEY` | Resend API key |
| `CONTACT_TO_EMAIL` | `tyo.suwignyo@gmail.com` |
| `CONTACT_FROM_EMAIL` | Verified sender on Resend (e.g. `contact@tyorus.com`) |
| `TELEGRAM_BOT_TOKEN` | From [@BotFather](https://t.me/BotFather) |
| `TELEGRAM_CHAT_ID` | Your chat ID (`getUpdates` after messaging the bot) |

`SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are available automatically inside edge functions.

### GitHub Pages build

Add repository secrets for the static site build:

- `PUBLIC_SUPABASE_URL`
- `PUBLIC_SUPABASE_ANON_KEY`

These are injected at build time in `.github/workflows/pages-deploy.yml`.

### Resend

Sign up, verify your domain (or use the sandbox sender for testing), and create an API key. The `CONTACT_FROM_EMAIL` must be a verified sender/domain in Resend.

### Telegram

1. Create a bot via BotFather and copy the token.
2. Send a message to the bot.
3. Open `https://api.telegram.org/bot<TOKEN>/getUpdates` and copy your `chat.id`.

## Custom domain

`public/CNAME` → `tyorus.com`. In the domain registrar, point DNS to GitHub Pages (A/`A`/`AAAA` or CNAME per [GitHub docs](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site)). In the repo **Settings → Pages**, set custom domain `tyorus.com` and enable HTTPS.

## SEO / Google Search Console

`tyorus.com` is the canonical host. Prefer verifying the **Domain** property (DNS TXT) — you own the DNS now.

1. Search Console → Add property → **Domain** → `tyorus.com` → add the TXT record at your registrar → Verify.
2. (Or URL prefix `https://tyorus.com` + HTML file upload to `public/`.)
3. Submit sitemap: `https://tyorus.com/sitemap-index.xml` (also try `sitemap-0.xml` if the index fails to fetch).
4. URL Inspection → Request indexing for `/`, `/resume/`, `/services/`.
5. Fix **www**: add a `www` CNAME → `tyorus.github.io` in DNS so HTTPS/redirect to apex works (avoid split `www` vs non-www indexing).
6. LinkedIn + GitHub bio → `https://tyorus.com`; headline aligned with Data Engineer · Python Backend Developer · Workflow Automation.

## License

[MIT](LICENSE) © 2026 Suwignyo Prasetyo
