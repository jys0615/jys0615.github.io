# 블로그 설정 가이드

## 개요

포트폴리오 사이트에 블로그 기능이 추가되었습니다. Decap CMS를 사용하여 웹 UI에서 편리하게 블로그 글을 작성할 수 있습니다.

## 주요 기능

- ✅ 웹 기반 에디터 (Decap CMS)
- ✅ Markdown 지원
- ✅ 검색 기능
- ✅ 태그/카테고리 필터링
- ✅ 댓글 시스템 (Disqus)
- ✅ 코드 하이라이팅
- ✅ 반응형 디자인

## 디렉토리 구조

```
.
├── admin/                    # Decap CMS 관리자 페이지
│   ├── index.html           # CMS 진입점
│   └── config.yml           # CMS 설정 파일
├── _posts/                  # 블로그 포스트 (Markdown)
│   └── 2025-12-17-welcome-to-my-blog.md
├── data/                    # 데이터 파일
│   └── posts-index.json     # 포스트 인덱스
├── assets/
│   ├── css/
│   │   └── blog.css         # 블로그 스타일
│   ├── js/
│   │   ├── blog.js          # 블로그 목록 페이지 로직
│   │   └── blog-post.js     # 블로그 상세 페이지 로직
│   └── img/
│       └── blog/            # 블로그 이미지
├── blog.html                # 블로그 목록 페이지
└── blog-post.html           # 블로그 상세 페이지
```

## 초기 설정

### 1. Netlify Identity 설정 (필수)

Decap CMS를 사용하려면 Netlify Identity 또는 GitHub OAuth가 필요합니다.

#### Netlify 사용 시 (권장):

1. [Netlify](https://www.netlify.com/)에서 계정 생성
2. GitHub 저장소 연결
3. Site settings → Identity 활성화
4. Settings → Identity → Services → Git Gateway 활성화
5. Identity → Registration → Invite only로 설정 (보안)

#### index.html에 Netlify Identity Widget 추가:

`index.html`, `blog.html`, `blog-post.html`의 `</body>` 태그 앞에 추가:

```html
<!-- Netlify Identity Widget -->
<script src="https://identity.netlify.com/v1/netlify-identity-widget.js"></script>
<script>
  if (window.netlifyIdentity) {
    window.netlifyIdentity.on("init", user => {
      if (!user) {
        window.netlifyIdentity.on("login", () => {
          document.location.href = "/admin/";
        });
      }
    });
  }
</script>
```

### 2. Disqus 설정 (댓글 기능)

1. [Disqus](https://disqus.com/)에서 계정 생성
2. "Get Started" → "I want to install Disqus on my site"
3. Website Name 입력 (예: yoonsuh-jung-blog)
4. Category 선택 후 Create Site
5. Shortname 기록 (예: yoonsuh-jung-blog)

#### blog-post.html에서 Disqus Shortname 변경:

`blog-post.html` 파일의 하단 스크립트에서:

```javascript
s.src = 'https://YOUR-DISQUS-SHORTNAME.disqus.com/embed.js';
```

위 코드에서 `YOUR-DISQUS-SHORTNAME`을 실제 Disqus shortname으로 변경:

```javascript
s.src = 'https://yoonsuh-jung-blog.disqus.com/embed.js';
```

### 3. admin/config.yml 확인

`admin/config.yml` 파일이 올바르게 설정되었는지 확인:

```yaml
backend:
  name: git-gateway
  branch: main  # 또는 master

media_folder: "assets/img/blog"
public_folder: "/assets/img/blog"
```

## 블로그 글 작성 방법

### 방법 1: Decap CMS 웹 UI 사용 (추천)

1. `https://your-site.com/admin/` 접속
2. Netlify Identity로 로그인
3. "New Blog" 클릭
4. 제목, 내용, 태그 등 입력
5. "Publish" 클릭

### 방법 2: 직접 Markdown 파일 작성

1. `_posts/` 디렉토리에 새 파일 생성
2. 파일명 형식: `YYYY-MM-DD-title.md` (예: `2025-12-17-my-first-post.md`)
3. Frontmatter 작성:

```markdown
---
title: "글 제목"
date: "2025-12-17T10:00:00Z"
author: "Yoonsuh Jung"
excerpt: "글 요약 (150자 이내)"
tags: ["태그1", "태그2"]
category: "카테고리명"
image: "/assets/img/blog/image.jpg"  # 선택사항
---

# 본문 시작

여기에 Markdown으로 글을 작성합니다...
```

4. `data/posts-index.json`에 파일명 추가:

```json
{
  "posts": [
    "2025-12-17-my-first-post.md",
    "2025-12-17-welcome-to-my-blog.md"
  ]
}
```

5. Git commit & push

## 포스트 frontmatter 필드 설명

- `title`: 글 제목 (필수)
- `date`: 작성 날짜 (ISO 8601 형식, 필수)
- `author`: 작성자 (기본값: "Yoonsuh Jung")
- `excerpt`: 글 요약 (필수)
- `tags`: 태그 배열 (선택사항)
- `category`: 카테고리 (선택사항)
- `image`: 대표 이미지 경로 (선택사항)

## 이미지 업로드

### CMS에서 업로드:

1. Decap CMS 에디터에서 "Featured Image" 필드 사용
2. 이미지가 자동으로 `assets/img/blog/`에 저장됨

### 수동 업로드:

1. `assets/img/blog/` 디렉토리에 이미지 파일 추가
2. Markdown에서 사용:

```markdown
![이미지 설명](/assets/img/blog/image.jpg)
```

## 로컬 테스트

### 로컬 서버 실행:

간단한 HTTP 서버로 테스트할 수 있습니다.

```bash
# Python 3
python -m http.server 8000

# 또는 Node.js
npx http-server -p 8000
```

브라우저에서 `http://localhost:8000` 접속

**주의**: Decap CMS는 로컬에서 작동하지 않습니다. CMS 테스트는 배포 후에 가능합니다.

## 배포

### GitHub Pages 배포:

1. 모든 변경사항 commit & push:

```bash
git add .
git commit -m "Add blog feature"
git push origin main
```

2. GitHub 저장소 Settings → Pages에서 확인
3. 몇 분 후 `https://username.github.io`에서 확인 가능

### Netlify 배포 (CMS 사용 시):

1. Netlify에서 GitHub 저장소 연결
2. Build settings:
   - Build command: (비워두기)
   - Publish directory: `/`
3. Deploy

## 문제 해결

### 블로그 포스트가 표시되지 않을 때:

1. `data/posts-index.json`에 파일명이 추가되었는지 확인
2. `_posts/` 디렉토리에 `.md` 파일이 있는지 확인
3. Frontmatter 형식이 올바른지 확인
4. 브라우저 콘솔에서 오류 확인

### CMS에 접속할 수 없을 때:

1. Netlify Identity가 활성화되었는지 확인
2. Git Gateway가 활성화되었는지 확인
3. `admin/config.yml`의 branch 이름 확인 (main vs master)

### 댓글이 표시되지 않을 때:

1. Disqus shortname이 올바르게 설정되었는지 확인
2. Disqus 사이트 설정에서 Trusted Domains에 도메인 추가

## 글 작성 팁

### Markdown 문법:

```markdown
# 제목 1
## 제목 2
### 제목 3

**굵게**
*기울임*

- 목록 1
- 목록 2

1. 번호 목록 1
2. 번호 목록 2

[링크](https://example.com)

![이미지](image.jpg)

> 인용문

\```python
# 코드 블록
def hello():
    print("Hello")
\```
```

### 코드 하이라이팅:

지원 언어: Python, JavaScript, Java, C++, HTML, CSS 등

```markdown
\```python
def example():
    return "Hello"
\```
```

## 네비게이션 업데이트

메인 페이지(`index.html`)의 네비게이션에 Blog 메뉴가 추가되었습니다.

다른 페이지들도 동일하게 업데이트하려면:

```html
<li><a href="blog.html"><i class="bi bi-pencil-square navicon"></i> Blog</a></li>
```

## 추가 기능 (선택사항)

### RSS 피드 추가:

블로그 구독을 위한 RSS 피드를 추가할 수 있습니다.

### Google Analytics:

방문자 추적을 위해 Google Analytics를 추가할 수 있습니다.

### SEO 최적화:

각 포스트의 메타 태그를 최적화하여 검색 엔진 노출을 개선할 수 있습니다.

## 지원

문제가 발생하면:

1. 브라우저 콘솔 확인
2. GitHub Issues 확인
3. Decap CMS 문서 참조: https://decapcms.org/docs/
4. Disqus 문서 참조: https://help.disqus.com/

---

**블로그를 즐겁게 운영하세요!**
