# Field Notes — starter blog

A minimal Astro blog, ready to deploy on GitHub Pages, pre-wired with three
post categories: `field` (work/SE life), `log` (hobbies/learning), `route`
(travel).

## 1. Local setup

You'll need [Node.js](https://nodejs.org) (v18+) installed.

```bash
npm install
npm run dev
```

Visit `http://localhost:4321` to see it live as you edit.

## 2. Put it on GitHub

1. Create a new repo on GitHub — since you're using a custom domain, the
   name doesn't need to be `username.github.io`. `blog` or
   `shreyasramakrishna-dev` both work fine. (Username: `shreyasramakrishnadev`)
2. In this project folder:
   ```bash
   git init
   git add .
   git commit -m "first commit"
   git branch -M main
   git remote add origin https://github.com/shreyasramakrishnadev/YOUR-REPO-NAME.git
   git push -u origin main
   ```
3. On GitHub, go to your repo → **Settings → Pages** → under "Build and
   deployment," set **Source** to **GitHub Actions**.
4. Push again (or re-run the workflow from the Actions tab) to trigger
   the first deploy.

## 3. Point your domain (shreyasramakrishna.dev) at GitHub Pages

**In Cloudflare's DNS dashboard for shreyasramakrishna.dev, add these
records:**

| Type | Name | Content |
|------|------|---------|
| A | @ | 185.199.108.153 |
| A | @ | 185.199.109.153 |
| A | @ | 185.199.110.153 |
| A | @ | 185.199.111.153 |
| CNAME | www | shreyasramakrishnadev.github.io |

A note on proxying: Cloudflare will likely default these to "Proxied"
(orange cloud). For GitHub Pages, set them to **DNS only** (grey cloud) —
otherwise GitHub's automatic SSL certificate step can fail. You can
switch to proxied later once everything's confirmed working.

**Back on GitHub**, in your repo → **Settings → Pages**:
1. Under "Custom domain," enter `shreyasramakrishna.dev` and save
   (this also confirms the `CNAME` file in your repo — one's already
   included in this starter at `public/CNAME`)
2. Wait a few minutes for DNS to propagate, then check **Enforce HTTPS**
   once GitHub shows the certificate as ready

Once that's done, `https://shreyasramakrishna.dev` serves this site
directly — no `.github.io` in the URL at all.

## 4. Write a post

Add a new `.md` file to `src/content/blog/`. Copy the frontmatter format
from any existing post:

```md
---
title: "Your post title"
date: "2026-07-15"
category: "field"   # field | log | route
excerpt: "One sentence that shows up in the list view."
draft: false
---

Your post content in markdown.
```

Save, commit, push — the site rebuilds and deploys automatically.

## 5. Personalize it

- `src/pages/about.astro` — replace the placeholder bio
- `src/layouts/Layout.astro` — change the site title/tagline in the `<header>`
- `src/styles/global.css` — colors and fonts are all CSS variables at the top
  if you want to adjust the palette later
- Delete the three sample posts in `src/content/blog/` once you've written
  your own (or keep them as templates and just edit in place)
