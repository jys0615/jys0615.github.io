# Yoonsuh Jung — Personal Portfolio & Blog

> [yoonsuh.com](https://yoonsuh.com)

A personal portfolio and blog site built with vanilla HTML/CSS/JavaScript, hosted on Cloudflare Pages.

---

## Overview

This site serves as my personal space to showcase projects, share technical writing, and document my journey as a software engineering student at Kyung Hee University. I focus on LLM-based AI systems, full-stack development, and Human-Computer Interaction research.

---

## Features

- **Portfolio** — showcases 6 projects with detailed case study pages
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
├── index.html          # Homepage
├── blog.html           # Blog list
├── blog-post.html      # Blog post detail
├── _posts/             # Markdown blog posts
├── data/               # Pre-built post index (auto-generated)
├── pages/              # Project detail pages
├── assets/             # CSS, JS, images
└── scripts/            # Build utilities
```

---

## Blog Workflow

Posts are written in Markdown inside `_posts/`, then compiled into `data/posts-data.json` via a local Node.js script before pushing to GitHub. Cloudflare Pages deploys automatically on push.

---

## Contact

- Email: yoonuh0615@khu.ac.kr
- GitHub: [github.com/jys0615](https://github.com/jys0615)
- LinkedIn: [linkedin.com/in/yoonsuh-jung](https://linkedin.com/in/yoonsuh-jung)
