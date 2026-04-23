#!/bin/bash
set -e

# 1. 포트폴리오 정적 파일을 dist/ 루트로 복사
mkdir -p dist
cp -r assets dist/
cp -r data dist/
cp -r _posts dist/
cp -r pages dist/
cp -r forms dist/ 2>/dev/null || true

for f in *.html; do
  cp "$f" dist/ 2>/dev/null || true
done

cp CNAME dist/ 2>/dev/null || true
cp .nojekyll dist/ 2>/dev/null || true
cp robots.txt dist/ 2>/dev/null || true
cp sitemap.xml dist/ 2>/dev/null || true

# 2. Astro 블로그 빌드 → dist/blog/ 로 출력됨
cd blog
npm install
npm run build
cd ..

echo "Build complete. Output: dist/"
