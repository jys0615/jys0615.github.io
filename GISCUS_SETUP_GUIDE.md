# Giscus Setup Guide

이 가이드는 블로그에 GitHub Discussions 기반 댓글 시스템(giscus)을 설정하는 방법을 안내합니다.

## 1. GitHub Discussions 활성화

1. GitHub 리포지토리로 이동: https://github.com/jys0615/jys0615.github.io
2. **Settings** 탭 클릭
3. 왼쪽 메뉴에서 **General** 선택
4. **Features** 섹션에서 **Discussions** 체크박스 활성화

## 2. Giscus 설정

1. giscus 설정 페이지 방문: https://giscus.app/ko
2. **저장소** 섹션에서:
   - 저장소 입력: `jys0615/jys0615.github.io`
   - 리포지토리가 공개(public)인지 확인
   - giscus 앱이 설치되어 있는지 확인

3. **페이지 ↔️ Discussions 매핑** 섹션에서:
   - 권장: **pathname** 선택 (각 페이지의 경로를 기반으로 discussion 생성)

4. **Discussion 카테고리** 섹션에서:
   - 권장: **General** 또는 **Announcements** 선택
   - 또는 새로운 카테고리 생성

5. **기능** 섹션에서:
   - ✅ 반응 활성화 (좋아요, 하트 등)
   - ✅ 댓글 입력란을 토론 위에 배치
   - 기타 원하는 기능 선택

6. **테마** 선택:
   - 권장: **light** (블로그 디자인과 잘 어울림)
   - 다크모드 지원시: **preferred_color_scheme** 선택 가능

## 3. 생성된 스크립트 태그 복사

giscus 설정 페이지 하단에서 자동 생성된 스크립트 태그를 확인하세요:

```html
<script src="https://giscus.app/client.js"
        data-repo="jys0615/jys0615.github.io"
        data-repo-id="YOUR_REPO_ID_HERE"
        data-category="General"
        data-category-id="YOUR_CATEGORY_ID_HERE"
        data-mapping="pathname"
        data-strict="0"
        data-reactions-enabled="1"
        data-emit-metadata="0"
        data-input-position="top"
        data-theme="light"
        data-lang="ko"
        crossorigin="anonymous"
        async>
</script>
```

## 4. blog-post.html 업데이트

위에서 복사한 스크립트의 `data-repo-id`와 `data-category-id` 값을 복사하여 `blog-post.html` 파일의 giscus 스크립트 부분을 업데이트하세요.

현재 위치: **blog-post.html** 파일 하단 (약 249-264줄)

교체할 값:
- `YOUR_REPO_ID` → giscus에서 생성된 실제 repo ID
- `YOUR_CATEGORY_ID` → giscus에서 생성된 실제 category ID

예시:
```html
<script src="https://giscus.app/client.js"
        data-repo="jys0615/jys0615.github.io"
        data-repo-id="R_kgDOK1234567"  <!-- 실제 값으로 교체 -->
        data-category="General"
        data-category-id="DIC_kwDOK1234567"  <!-- 실제 값으로 교체 -->
        ...
</script>
```

## 5. 테스트

1. 변경사항을 GitHub에 push
2. 블로그 포스트 페이지 방문 (예: `https://yoonsuh.com/blog-post.html?id=...`)
3. 페이지 하단에 댓글 섹션이 표시되는지 확인
4. GitHub 계정으로 로그인하여 테스트 댓글 작성

## 기능 설명

### 좋아요 (Like) 기능
- localStorage 기반으로 작동
- 각 사용자의 브라우저에 좋아요 정보 저장
- 버튼 클릭시 하트 애니메이션 효과
- 좋아요 수 실시간 표시

### 댓글 (Comments) 기능
- GitHub Discussions 기반
- GitHub 계정으로 로그인 필요
- 마크다운 지원
- 반응(이모지) 추가 가능
- 답글 기능
- 실시간 알림

## 문제 해결

### 댓글이 표시되지 않는 경우
1. GitHub Discussions가 활성화되어 있는지 확인
2. 리포지토리가 public인지 확인
3. giscus 앱이 설치되어 있는지 확인: https://github.com/apps/giscus
4. 브라우저 콘솔에서 에러 메시지 확인

### giscus 앱 설치
https://github.com/apps/giscus 에서 "Install" 버튼 클릭 후 `jys0615/jys0615.github.io` 리포지토리 선택

## 참고 자료
- giscus 공식 사이트: https://giscus.app/ko
- giscus GitHub: https://github.com/giscus/giscus
- GitHub Discussions 문서: https://docs.github.com/en/discussions
