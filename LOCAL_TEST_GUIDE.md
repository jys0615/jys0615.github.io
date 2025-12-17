# 로컬 테스트 가이드

## 로컬 서버 실행

### 방법 1: Python (추천)
```bash
# 프로젝트 디렉토리에서
python3 -m http.server 8000
```

브라우저에서 접속:
- 메인 페이지: http://localhost:8000
- 블로그 목록: http://localhost:8000/blog.html

### 방법 2: Node.js
```bash
# npx 사용 (설치 불필요)
npx http-server -p 8000

# 또는 전역 설치
npm install -g http-server
http-server -p 8000
```

### 방법 3: VS Code Live Server
VS Code 확장 프로그램 "Live Server" 설치 후:
1. index.html 우클릭
2. "Open with Live Server" 선택

---

## 새 블로그 글 작성하기

### 자동 스크립트 사용 (가장 간단)

```bash
./scripts/create-post.sh "내 첫 번째 글"
```

이 스크립트는:
- ✅ 날짜가 포함된 파일명 자동 생성
- ✅ Frontmatter 템플릿 자동 생성
- ✅ posts-index.json 자동 업데이트

### 수동으로 작성

#### 1. 새 Markdown 파일 생성

```bash
# _posts 디렉토리에 파일 생성
# 형식: YYYY-MM-DD-제목.md
touch _posts/2025-12-17-my-new-post.md
```

#### 2. Frontmatter 작성

`_posts/2025-12-17-my-new-post.md`:

```markdown
---
title: "내 새로운 블로그 글"
date: "2025-12-17T15:30:00Z"
author: "Yoonsuh Jung"
excerpt: "이 글은 로컬에서 작성한 테스트 글입니다."
tags: ["테스트", "개발"]
category: "Development"
image: "/assets/img/blog/my-image.jpg"
---

# 내 새로운 블로그 글

여기에 내용을 작성합니다...

## 코드 예제

\`\`\`python
def hello():
    print("Hello from local!")
\`\`\`

## 결론

로컬 테스트 완료!
```

#### 3. posts-index.json 업데이트

`data/posts-index.json`:

```json
{
  "posts": [
    "2025-12-17-my-new-post.md",
    "2025-12-17-welcome-to-my-blog.md"
  ]
}
```

**중요**: 최신 글이 배열의 **맨 위**에 와야 합니다!

---

## 로컬 테스트 워크플로우

### 전체 과정:

```bash
# 1. 로컬 서버 실행
python3 -m http.server 8000

# 2. 새 터미널에서 글 작성
./scripts/create-post.sh "AI Agent 개발 경험"

# 3. 에디터로 파일 열기
code _posts/2025-12-17-ai-agent-개발-경험.md

# 4. 내용 작성 후 저장

# 5. 브라우저에서 확인
# http://localhost:8000/blog.html

# 6. 문제 없으면 Git commit
git add .
git commit -m "Add new post: AI Agent 개발 경험"
git push origin main
```

---

## 빠른 테스트 방법

### 테스트용 포스트 생성 스크립트

```bash
# scripts/quick-test.sh 실행
cat > _posts/2025-12-17-test-post.md << 'EOF'
---
title: "테스트 포스트"
date: "2025-12-17T12:00:00Z"
author: "Yoonsuh Jung"
excerpt: "로컬 테스트용 포스트입니다."
tags: ["테스트"]
category: "Test"
---

# 테스트 포스트

이 포스트는 로컬 테스트용입니다.

## 코드 테스트

\`\`\`javascript
console.log("테스트 중!");
\`\`\`

**굵은 글씨**와 *기울임* 테스트
EOF

# posts-index.json에 추가
echo '{"posts":["2025-12-17-test-post.md","2025-12-17-welcome-to-my-blog.md"]}' > data/posts-index.json

echo "✅ 테스트 포스트 생성 완료"
```

---

## 이미지 테스트

### 로컬 이미지 추가:

```bash
# 1. 이미지를 blog 폴더에 복사
cp ~/Downloads/my-image.jpg assets/img/blog/

# 2. Markdown에서 사용
![설명](/assets/img/blog/my-image.jpg)
```

---

## 문제 해결

### 포스트가 표시되지 않을 때:

```bash
# 1. 브라우저 콘솔 확인 (F12)
# 2. 파일 구조 확인
ls -la _posts/
cat data/posts-index.json

# 3. Frontmatter 형식 확인
head -20 _posts/your-post.md

# 4. 서버 재시작
# Ctrl+C로 종료 후 다시 실행
python3 -m http.server 8000
```

### JSON 파싱 오류:

```bash
# posts-index.json 검증
cat data/posts-index.json | python3 -m json.tool

# 문제가 있다면 수동으로 수정
code data/posts-index.json
```

### 캐시 문제:

브라우저에서:
- Windows/Linux: `Ctrl + Shift + R`
- Mac: `Cmd + Shift + R`

---

## 에디터 추천 설정

### VS Code 확장 프로그램:

1. **Markdown All in One** - Markdown 편집
2. **Markdown Preview Enhanced** - 실시간 미리보기
3. **Live Server** - 로컬 서버
4. **Prettier** - 코드 포맷팅

### VS Code에서 빠른 작업:

```json
// .vscode/tasks.json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "Start Local Server",
      "type": "shell",
      "command": "python3 -m http.server 8000",
      "problemMatcher": [],
      "presentation": {
        "reveal": "always",
        "panel": "new"
      }
    },
    {
      "label": "Create New Post",
      "type": "shell",
      "command": "./scripts/create-post.sh \"${input:postTitle}\"",
      "problemMatcher": []
    }
  ],
  "inputs": [
    {
      "id": "postTitle",
      "type": "promptString",
      "description": "포스트 제목을 입력하세요"
    }
  ]
}
```

---

## 체크리스트

새 글 작성 전:

- [ ] 로컬 서버 실행 중
- [ ] 이전 글들이 정상적으로 표시됨
- [ ] `_posts/` 디렉토리 존재 확인
- [ ] `data/posts-index.json` 파일 존재 확인

새 글 작성 후:

- [ ] Frontmatter 형식 올바름
- [ ] 날짜 형식: ISO 8601 (`YYYY-MM-DDTHH:MM:SSZ`)
- [ ] `posts-index.json`에 파일명 추가됨
- [ ] 블로그 목록에 새 글 표시됨
- [ ] 글 상세 페이지 정상 작동
- [ ] 이미지가 있다면 정상 표시됨
- [ ] 코드 하이라이팅 정상 작동

배포 전:

- [ ] 로컬에서 모든 기능 테스트 완료
- [ ] Git status 확인
- [ ] Commit 메시지 작성
- [ ] Push to GitHub

---

## 유용한 명령어

```bash
# 모든 포스트 목록 보기
ls -1 _posts/

# 최신 포스트 내용 미리보기
head -50 _posts/$(ls -t _posts/ | head -1)

# 포스트 개수 확인
ls -1 _posts/ | wc -l

# 특정 태그를 가진 포스트 찾기
grep -l "태그명" _posts/*.md

# Frontmatter만 추출
sed -n '/^---$/,/^---$/p' _posts/your-post.md
```

---

**즐거운 로컬 개발 되세요!** 🚀
