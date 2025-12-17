# 블로그 에디터 설정 가이드

## 웹 기반 블로그 에디터 사용법

이제 웹 브라우저에서 직접 블로그 글을 작성, 수정, 삭제할 수 있습니다!

## 🚀 빠른 시작

### 1단계: GitHub Personal Access Token 생성

블로그 에디터는 GitHub API를 사용하여 글을 저장합니다. 먼저 토큰을 발급받아야 합니다.

#### Token 생성 방법:

1. GitHub 로그인 후 [Settings](https://github.com/settings/tokens) → Developer settings → Personal access tokens → Tokens (classic)로 이동

2. "Generate new token (classic)" 클릭

3. Token 설정:
   - **Note**: `blog-editor` (토큰 이름)
   - **Expiration**: `No expiration` (또는 원하는 기간)
   - **Select scopes**:
     - ✅ `repo` (전체 체크) - 필수!

4. "Generate token" 클릭

5. **중요**: 생성된 토큰을 안전한 곳에 복사하여 저장하세요!
   - 형식: `ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
   - 다시 볼 수 없으므로 반드시 저장!

### 2단계: 에디터 접속

```
https://your-username.github.io/blog-editor.html
```

또는 로컬 테스트:
```
http://localhost:8000/blog-editor.html
```

### 3단계: 로그인

1. "GitHub으로 로그인" 버튼 클릭
2. 생성한 Personal Access Token 입력
3. 자동으로 권한 확인 후 에디터 화면 표시

## ✍️ 글 작성하기

### 새 글 작성:

1. 에디터에서 다음 정보 입력:
   - **제목**: 글 제목
   - **카테고리**: Development, AI, Tutorial 등
   - **요약**: 150자 이내 요약
   - **태그**: Enter 키로 추가
   - **대표 이미지**: 이미지 URL (선택사항)
   - **본문**: Markdown 에디터에서 작성

2. Markdown 에디터 기능:
   - 굵게, 기울임, 제목
   - 인용, 목록
   - 링크, 이미지
   - 코드 블록, 표
   - 미리보기, 전체화면

3. "발행하기" 버튼 클릭

4. 자동으로:
   - `_posts/YYYY-MM-DD-제목.md` 파일 생성
   - `data/posts-index.json` 업데이트
   - GitHub에 자동 커밋

5. 몇 초 후 사이트에 글이 표시됩니다!

### 기존 글 수정:

1. 페이지 하단 "작성된 글 관리" 섹션에서 수정할 글 찾기
2. "수정" 버튼 클릭
3. 내용 수정
4. "수정 완료" 버튼 클릭

### 글 삭제:

1. "작성된 글 관리"에서 삭제할 글 찾기
2. "삭제" 버튼 클릭
3. 확인 대화상자에서 "확인"

## 🔒 보안 설정

### 승인된 사용자 설정

`assets/js/blog-editor.js` 파일에서 승인된 사용자 목록을 관리할 수 있습니다:

```javascript
const CONFIG = {
  GITHUB_OWNER: 'jys0615',
  GITHUB_REPO: 'jys0615.github.io',
  GITHUB_BRANCH: 'main',
  AUTHORIZED_USERS: ['jys0615'], // 여기에 GitHub 사용자명 추가
  // ...
};
```

### Token 보안:

- ✅ Token은 브라우저의 localStorage에 저장됩니다
- ✅ 본인의 컴퓨터에서만 사용하세요
- ✅ 공용 컴퓨터에서는 사용 후 로그아웃 필수
- ✅ Token이 노출되면 즉시 GitHub에서 삭제하고 재발급

### 에디터 URL 보호:

에디터는 `/blog-editor.html` URL로만 접근 가능하며, 메인 네비게이션에는 표시되지 않습니다. URL을 아는 사람만 접근할 수 있습니다.

더 강력한 보호가 필요하면:
1. `.htaccess` 파일로 IP 제한
2. 별도의 비밀 URL 사용 (예: `/my-secret-editor-2024.html`)
3. Basic Authentication 추가

## 📝 Markdown 작성 팁

### 제목:
```markdown
# 제목 1
## 제목 2
### 제목 3
```

### 강조:
```markdown
**굵게**
*기울임*
~~취소선~~
```

### 링크와 이미지:
```markdown
[링크 텍스트](https://example.com)
![이미지 설명](https://example.com/image.jpg)
```

### 코드:
````markdown
인라인 코드: `code`

코드 블록:
```python
def hello():
    print("Hello, World!")
```
````

### 목록:
```markdown
- 순서 없는 목록
- 항목 2

1. 순서 있는 목록
2. 항목 2
```

### 인용:
```markdown
> 인용문입니다.
```

### 표:
```markdown
| 제목1 | 제목2 |
|------|------|
| 내용1 | 내용2 |
```

## 🎯 워크플로우

### 일반적인 글 작성 프로세스:

1. **에디터 접속** → `blog-editor.html`
2. **로그인** → GitHub Token 입력
3. **작성** → 제목, 카테고리, 태그, 본문 입력
4. **미리보기** → Markdown 에디터에서 실시간 확인
5. **발행** → "발행하기" 버튼 클릭
6. **확인** → 몇 초 후 블로그에서 확인
7. **공유** → URL 복사하여 공유

### 수정 프로세스:

1. **에디터 접속** → 로그인
2. **글 선택** → 하단 목록에서 "수정" 클릭
3. **수정** → 내용 변경
4. **완료** → "수정 완료" 클릭
5. **확인** → 블로그에서 변경사항 확인

## 🐛 문제 해결

### Token이 작동하지 않을 때:

1. Token 권한 확인:
   - `repo` 전체 체크되어 있는지 확인
2. Token 만료 확인:
   - GitHub Settings에서 확인
3. 새 Token 발급:
   - 기존 Token 삭제 후 재발급

### 글이 발행되지 않을 때:

1. 브라우저 콘솔 확인 (F12)
2. 네트워크 연결 확인
3. GitHub API 제한 확인:
   - 시간당 5000 요청 제한
4. Repository 권한 확인:
   - 본인의 Repository인지 확인

### 로그인이 안 될 때:

1. localStorage 삭제:
   ```javascript
   // 브라우저 콘솔에서 실행
   localStorage.clear();
   location.reload();
   ```
2. Token 재입력

### 글 목록이 로드되지 않을 때:

1. `data/posts-index.json` 파일 존재 확인
2. JSON 형식 오류 확인
3. 브라우저 캐시 삭제 (Ctrl+Shift+R)

## ⚙️ 고급 설정

### CONFIG 커스터마이징

`assets/js/blog-editor.js`:

```javascript
const CONFIG = {
  GITHUB_OWNER: 'jys0615',           // GitHub 사용자명
  GITHUB_REPO: 'jys0615.github.io',  // Repository 이름
  GITHUB_BRANCH: 'main',              // 브랜치 (main 또는 master)
  AUTHORIZED_USERS: ['jys0615'],      // 승인된 사용자 목록
};
```

### 다중 관리자 추가:

```javascript
AUTHORIZED_USERS: ['jys0615', 'friend1', 'friend2']
```

### 자동 저장:

Markdown 에디터는 자동으로 임시 저장됩니다:
- localStorage에 1초마다 저장
- 브라우저를 닫아도 복구 가능

## 📱 모바일 사용

블로그 에디터는 반응형으로 설계되어 모바일에서도 사용 가능합니다:

1. 모바일 브라우저에서 접속
2. Token 입력 (안전한 곳에 저장 권장)
3. 간단한 수정 가능
4. 긴 글은 PC 사용 권장

## 🎨 이미지 업로드

현재 이미지는 외부 URL로만 추가 가능합니다:

### 추천 이미지 호스팅:

1. **GitHub Repository**:
   - `assets/img/blog/` 폴더에 직접 업로드
   - URL: `/assets/img/blog/image.jpg`

2. **Imgur**:
   - https://imgur.com
   - 무료, 간단한 업로드

3. **Cloudinary**:
   - https://cloudinary.com
   - 무료 플랜 제공

### 이미지 추가 방법:

1. 이미지를 호스팅 서비스에 업로드
2. 이미지 URL 복사
3. Markdown에 삽입:
   ```markdown
   ![설명](/assets/img/blog/my-image.jpg)
   ```

## 📊 통계

에디터에서 확인 가능한 정보:

- 전체 글 개수
- 각 글의 제목과 파일명
- 작성/수정 날짜 (frontmatter)

## 🔄 백업

GitHub이 자동으로 버전 관리를 하므로:

- 모든 변경사항이 commit으로 저장됨
- 이전 버전 복구 가능
- Git history로 모든 수정 내역 확인 가능

수동 백업이 필요하면:
```bash
git clone https://github.com/jys0615/jys0615.github.io.git
```

## 🎓 추가 학습 자료

- [Markdown 가이드](https://www.markdownguide.org/)
- [GitHub API 문서](https://docs.github.com/en/rest)
- [EasyMDE 문서](https://github.com/Ionaru/easy-markdown-editor)

---

## 📞 지원

문제가 발생하면:

1. 이 가이드의 "문제 해결" 섹션 확인
2. 브라우저 콘솔 (F12) 에러 메시지 확인
3. GitHub Issues 작성

---

**즐거운 블로깅 되세요!** ✨
