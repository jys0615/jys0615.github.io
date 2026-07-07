# Yoonsuh Jung - Personal Portfolio & Blog

> [yoonsuh.com](https://yoonsuh.com)

A personal portfolio and blog site built with vanilla HTML/CSS/JavaScript, hosted on Cloudflare Pages.

---

## Overview

This site serves as my personal space to showcase projects, share technical writing, and document my journey as a Computer Science and engineering student at Kyung Hee University. I focus on LLM-based AI systems, full-stack development, and Human-Computer Interaction research.

---

## Features

- **Portfolio** — showcases 6 projects with detailed case study pages. You can find more in Github links
- **Blog** — markdown-based writing system with category/tag filtering, search, and syntax highlighting
- **Google Analytics 4** — traffic and engagement tracking
- **Firebase** — real-time view counter for blog posts
- **Responsive design** — mobile-first layout built with Bootstrap 5

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | HTML5, CSS3, JavaScript (ES6+) |
| Styling | Bootstrap 5, custom CSS |
| Blog rendering | Marked.js, Prism.js |
| Backend / DB | Firebase Firestore |
| Analytics | Google Analytics 4 |
| Hosting | Cloudflare Pages |
| Domain | Cloudflare DNS |

---

## Project Structure

```
├── index.html           # Homepage (includes a "Latest Blog Posts" preview)
├── blog.html            # Legacy blog list page
├── blog-post.html       # Legacy blog post detail page
├── _posts/              # Markdown source for the legacy blog (blog.html / homepage preview)
├── data/                # Pre-built post index for the legacy blog (auto-generated, do not edit)
├── blog/                # Astro project — the real, live blog at yoonsuh.com/blog
│   └── src/data/blog/   # Markdown source for the live blog
├── pages/               # Project detail pages
├── assets/              # CSS, JS, images
└── scripts/             # Build utilities
```

> ⚠️ There are **two separate blog systems** in this repo (see below). The **Astro blog** (`blog/src/data/blog/`) is the one linked from the main nav (`/blog`) and is the one that matters. The legacy `_posts/` system only feeds `blog.html` and the homepage's "Latest Blog Posts" preview widget.

---

## Blog Workflow (VS Code)

### A. Astro blog — `blog/src/data/blog/` (the real `/blog`)

1. In VS Code, create a new file under `blog/src/data/blog/`, e.g. `blog/src/data/blog/my-new-post.md`.
2. Add frontmatter at the top (schema defined in `blog/src/content.config.ts`):

   ```markdown
   ---
   title: 글 제목
   author: Yoonsuh Jung
   pubDatetime: 2026-07-08T09:00:00.000Z
   slug: my-new-post
   featured: false
   draft: false
   tags: [태그1, 태그2]
   description: "글 요약"
   ---

   본문을 마크다운으로 작성합니다.
   ```
3. No index file to regenerate — Astro scans `src/data/blog/` automatically at build time.
4. Preview locally: `cd blog && npm run dev`
5. Commit & push. The deploy pipeline runs `build.sh`, which builds this Astro project into `dist/blog/`.

To delete a post, just delete its `.md` file from `blog/src/data/blog/` and push.

### B. Legacy blog — `_posts/` (`blog.html` + homepage preview)

1. In VS Code, create a new file in `_posts/`, named `YYYY-MM-DD-title.md` (use an **English filename** — Korean filenames can break the URL).
2. Add frontmatter:

   ```markdown
   ---
   title: "글 제목"
   date: "2026-07-08T09:00:00.000Z"
   author: "Yoonsuh Jung"
   excerpt: "블로그 목록에서 보일 한 줄 요약"
   category: "Development"
   tags:
     - AI
     - Web
   ---

   본문을 마크다운으로 작성합니다.
   ```

   > This repo has the [Front Matter](https://marketplace.visualstudio.com/items?itemName=eliostruyf.vscode-front-matter) VS Code extension configured (`frontmatter.json`) for this folder, so you can also create/edit posts through its panel instead of writing frontmatter by hand.
3. Regenerate the index (**required** — this is what actually publishes the post):
   ```bash
   node scripts/update-posts-index.js
   ```
4. Commit & push:
   ```bash
   git add .
   git commit -m "feat: add new post - 글 제목"
   git push origin main
   ```
   Or just run `./scripts/blog.sh new "글 제목"`, which does steps 3–4 for you.

To delete a post: delete its `.md` file from `_posts/`, re-run `node scripts/update-posts-index.js`, then commit & push (or `./scripts/blog.sh delete "글 제목"`).

---

## Contact

- Email: yoonuh0615@khu.ac.kr
- GitHub: [github.com/jys0615](https://github.com/jys0615)
- LinkedIn: [linkedin.com/in/yoonsuh-jung](https://linkedin.com/in/yoonsuh-jung)
