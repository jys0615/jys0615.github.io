/**
 * _posts/ 폴더를 스캔해서 data/posts-index.json 자동 갱신
 * 사용법: node scripts/update-posts-index.js
 */

const fs = require('fs');
const path = require('path');

const postsDir = path.join(__dirname, '..', '_posts');
const indexFile = path.join(__dirname, '..', 'data', 'posts-index.json');

// _posts/ 안의 .md 파일만 필터링, 날짜 내림차순 정렬
const posts = fs.readdirSync(postsDir)
  .filter(f => f.endsWith('.md'))
  .sort()
  .reverse();

const index = { posts };

fs.writeFileSync(indexFile, JSON.stringify(index, null, 2), 'utf-8');

console.log(`✅ posts-index.json 업데이트 완료 (${posts.length}개 글)`);
posts.forEach(p => console.log(`  - ${p}`));
