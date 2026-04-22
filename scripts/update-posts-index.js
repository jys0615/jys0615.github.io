/**
 * _posts/ 폴더를 스캔해서 data/posts-data.json 자동 생성
 * 사용법: node scripts/update-posts-index.js
 */

const fs = require('fs');
const path = require('path');

const postsDir = path.join(__dirname, '..', '_posts');
const dataDir = path.join(__dirname, '..', 'data');

// frontmatter 파싱
function parseFrontmatter(content) {
  const match = content.match(/^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/);
  if (!match) return { frontmatter: {}, body: content };

  const frontmatter = {};
  const lines = match[1].split('\n');
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    const colonIndex = line.indexOf(':');
    if (colonIndex > -1) {
      const key = line.substring(0, colonIndex).trim();
      let value = line.substring(colonIndex + 1).trim();

      // 멀티라인 배열 (tags: \n  - item)
      if (value === '') {
        const arr = [];
        i++;
        while (i < lines.length && lines[i].trim().startsWith('-')) {
          arr.push(lines[i].trim().replace(/^-\s*/, '').replace(/['"]/g, ''));
          i++;
        }
        frontmatter[key] = arr;
        continue;
      }

      // 인라인 배열 ["a", "b"]
      if (value.startsWith('[') && value.endsWith(']')) {
        value = value.slice(1, -1).split(',').map(v => v.trim().replace(/['"]/g, '')).filter(Boolean);
      } else {
        // 따옴표 제거
        if ((value.startsWith('"') && value.endsWith('"')) ||
            (value.startsWith("'") && value.endsWith("'"))) {
          value = value.slice(1, -1);
        }
      }
      frontmatter[key] = value;
    }
    i++;
  }

  return { frontmatter, body: match[2] };
}

// _posts/ 안의 .md 파일 스캔
const files = fs.readdirSync(postsDir)
  .filter(f => f.endsWith('.md'))
  .sort()
  .reverse();

const posts = files.map(filename => {
  const content = fs.readFileSync(path.join(postsDir, filename), 'utf-8');
  const { frontmatter, body } = parseFrontmatter(content);
  const id = filename.replace('.md', '');

  return {
    id,
    filename,
    title: frontmatter.title || 'Untitled',
    date: frontmatter.date || new Date().toISOString(),
    author: frontmatter.author || 'Yoonsuh Jung',
    excerpt: frontmatter.excerpt || body.trim().substring(0, 150) + '...',
    image: frontmatter.image || '',
    tags: Array.isArray(frontmatter.tags) ? frontmatter.tags : [],
    category: frontmatter.category || 'Uncategorized',
    content: body.trim(),
  };
});

// posts-data.json 저장
fs.writeFileSync(
  path.join(dataDir, 'posts-data.json'),
  JSON.stringify({ posts }, null, 2),
  'utf-8'
);

// 하위 호환용 posts-index.json도 유지
fs.writeFileSync(
  path.join(dataDir, 'posts-index.json'),
  JSON.stringify({ posts: files }, null, 2),
  'utf-8'
);

console.log(`✅ ${posts.length}개 글 처리 완료`);
posts.forEach(p => console.log(`  - [${p.title}] ${p.filename}`));
