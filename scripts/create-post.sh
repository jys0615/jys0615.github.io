#!/bin/bash

# 블로그 포스트 생성 스크립트
# 사용법: ./scripts/create-post.sh "포스트 제목"

if [ -z "$1" ]; then
  echo "사용법: ./scripts/create-post.sh \"포스트 제목\""
  exit 1
fi

# 제목을 slug로 변환 (공백을 하이픈으로)
TITLE="$1"
SLUG=$(echo "$TITLE" | tr '[:upper:]' '[:lower:]' | sed 's/ /-/g' | sed 's/[^a-z0-9-]//g')

# 현재 날짜
DATE=$(date +%Y-%m-%d)
DATETIME=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

# 파일명
FILENAME="${DATE}-${SLUG}.md"
FILEPATH="_posts/${FILENAME}"

# 파일이 이미 존재하는지 확인
if [ -f "$FILEPATH" ]; then
  echo "오류: 파일이 이미 존재합니다: $FILEPATH"
  exit 1
fi

# frontmatter 템플릿 생성
cat > "$FILEPATH" << EOF
---
title: "$TITLE"
date: "$DATETIME"
author: "Yoonsuh Jung"
excerpt: "여기에 글 요약을 작성하세요 (150자 이내)"
tags: ["태그1", "태그2"]
category: "General"
image: ""
---

# $TITLE

여기에 글 내용을 작성하세요.

## 소제목

내용...

\`\`\`python
# 코드 예제
def example():
    print("Hello, World!")
\`\`\`

## 결론

마무리...
EOF

echo "✅ 새 포스트 생성됨: $FILEPATH"

# posts-index.json 업데이트
TEMP_FILE=$(mktemp)
jq --arg filename "$FILENAME" '.posts = [$filename] + .posts' data/posts-index.json > "$TEMP_FILE"
mv "$TEMP_FILE" data/posts-index.json

echo "✅ posts-index.json 업데이트 완료"
echo ""
echo "다음 단계:"
echo "1. $FILEPATH 파일을 편집하여 내용을 작성하세요"
echo "2. 로컬 서버에서 확인: http://localhost:8000/blog.html"
echo "3. 완료 후: git add . && git commit -m \"Add new post: $TITLE\" && git push"
