#!/bin/bash

# 블로그 배포 스크립트
# 사용법:
#   ./scripts/blog.sh new "글 제목"     # 새 글 작성 후 배포
#   ./scripts/blog.sh update "글 제목"  # 글 수정 후 배포
#   ./scripts/blog.sh delete "글 제목"  # 글 삭제 후 배포
#   ./scripts/blog.sh publish           # 메시지 없이 그냥 배포

ACTION=$1
TITLE=$2

echo "📝 posts-data.json 업데이트 중..."
node scripts/update-posts-index.js

echo "📦 변경사항 스테이징..."
git add .

if [ "$ACTION" = "new" ]; then
  git commit -m "feat: add new post - $TITLE"
elif [ "$ACTION" = "update" ]; then
  git commit -m "fix: update post - $TITLE"
elif [ "$ACTION" = "delete" ]; then
  git commit -m "chore: remove post - $TITLE"
else
  git commit -m "chore: update blog posts"
fi

echo "🚀 GitHub에 푸시 중..."
git push origin main

echo "✅ 완료! 약 1~2분 후 yoonsuh.com에 반영됩니다."
