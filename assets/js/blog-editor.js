/**
 * Blog Editor with GitHub API Integration
 * Allows creating, editing, and deleting blog posts directly from the web
 */

// Configuration - UPDATE THESE VALUES
const CONFIG = {
  GITHUB_OWNER: 'jys0615', // Your GitHub username
  GITHUB_REPO: 'jys0615.github.io', // Your repository name
  GITHUB_BRANCH: 'main', // Your branch name (main or master)
  AUTHORIZED_USERS: ['jys0615'], // List of GitHub usernames who can access the editor
  CLIENT_ID: 'YOUR_GITHUB_OAUTH_APP_CLIENT_ID' // Will be set up later
};

let accessToken = null;
let currentUser = null;
let editor = null;
let currentEditingPost = null;
let allPosts = [];

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  // Check if user is already logged in
  const token = localStorage.getItem('github_token');
  const user = localStorage.getItem('github_user');

  if (token && user) {
    accessToken = token;
    currentUser = JSON.parse(user);
    checkAuthorization();
  }

  // Check for OAuth callback
  const urlParams = new URLSearchParams(window.location.search);
  const code = urlParams.get('code');
  if (code) {
    handleOAuthCallback(code);
  }

  // Initialize excerpt counter
  const excerptField = document.getElementById('postExcerpt');
  if (excerptField) {
    excerptField.addEventListener('input', updateExcerptCount);
  }

  // Initialize tag input
  const tagInput = document.getElementById('tagInput');
  if (tagInput) {
    tagInput.addEventListener('keydown', handleTagInput);
  }
});

// Update excerpt character count
function updateExcerptCount() {
  const excerptField = document.getElementById('postExcerpt');
  const count = excerptField.value.length;
  document.getElementById('excerptCount').textContent = count;
}

// Handle tag input
const tags = [];

function handleTagInput(event) {
  if (event.key === 'Enter') {
    event.preventDefault();
    const input = event.target;
    const value = input.value.trim();

    if (value && !tags.includes(value)) {
      tags.push(value);
      renderTags();
      input.value = '';
    }
  }
}

function removeTag(tag) {
  const index = tags.indexOf(tag);
  if (index > -1) {
    tags.splice(index, 1);
    renderTags();
  }
}

function renderTags() {
  const container = document.getElementById('tagContainer');
  const tagInput = document.getElementById('tagInput');

  // Clear container except input
  container.innerHTML = '';

  // Render tags
  tags.forEach(tag => {
    const tagElement = document.createElement('div');
    tagElement.className = 'tag-item';
    tagElement.innerHTML = `
      <span>${tag}</span>
      <span class="remove-tag" onclick="removeTag('${tag}')">&times;</span>
    `;
    container.appendChild(tagElement);
  });

  // Re-append input
  container.appendChild(tagInput);
}

// GitHub OAuth Login
function loginWithGitHub() {
  // For development: simple prompt for Personal Access Token
  // In production, use proper OAuth flow
  showTokenPrompt();
}

function showTokenPrompt() {
  const token = prompt(
    'GitHub Personal Access Token이 필요합니다.\n\n' +
    '1. GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)\n' +
    '2. Generate new token (classic)\n' +
    '3. 권한 선택: repo (전체)\n' +
    '4. 생성된 토큰을 아래에 입력하세요:\n\n' +
    '토큰:'
  );

  if (token) {
    verifyAndStoreToken(token);
  }
}

async function verifyAndStoreToken(token) {
  try {
    const response = await fetch('https://api.github.com/user', {
      headers: {
        'Authorization': `token ${token}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    });

    if (response.ok) {
      const user = await response.json();
      accessToken = token;
      currentUser = user;

      localStorage.setItem('github_token', token);
      localStorage.setItem('github_user', JSON.stringify(user));

      checkAuthorization();
    } else {
      alert('유효하지 않은 토큰입니다. 다시 시도해주세요.');
    }
  } catch (error) {
    console.error('Token verification failed:', error);
    alert('토큰 검증 중 오류가 발생했습니다.');
  }
}

// Check if user is authorized
function checkAuthorization() {
  if (!currentUser) return;

  const username = currentUser.login;

  if (CONFIG.AUTHORIZED_USERS.includes(username)) {
    showEditor();
  } else {
    alert(`접근 권한이 없습니다. 승인된 사용자: ${CONFIG.AUTHORIZED_USERS.join(', ')}`);
    logout();
  }
}

// Show editor interface
function showEditor() {
  document.getElementById('authSection').style.display = 'none';
  document.getElementById('editorSection').style.display = 'block';

  // Set user info
  document.getElementById('userAvatar').src = currentUser.avatar_url;
  document.getElementById('userName').textContent = currentUser.name || currentUser.login;
  document.getElementById('userEmail').textContent = currentUser.email || currentUser.login;

  // Initialize Markdown editor
  editor = new EasyMDE({
    element: document.getElementById('postContent'),
    spellChecker: false,
    placeholder: '여기에 Markdown으로 글을 작성하세요...',
    autosave: {
      enabled: true,
      uniqueId: 'blog-post-draft',
      delay: 1000
    },
    toolbar: [
      'bold', 'italic', 'heading', '|',
      'quote', 'unordered-list', 'ordered-list', '|',
      'link', 'image', '|',
      'code', 'table', '|',
      'preview', 'side-by-side', 'fullscreen', '|',
      'guide'
    ]
  });

  // Load existing posts
  loadExistingPosts();
}

// Logout
function logout() {
  localStorage.removeItem('github_token');
  localStorage.removeItem('github_user');
  accessToken = null;
  currentUser = null;
  location.reload();
}

// Publish post
async function publishPost(event) {
  event.preventDefault();

  const title = document.getElementById('postTitle').value.trim();
  const excerpt = document.getElementById('postExcerpt').value.trim();
  const category = document.getElementById('postCategory').value.trim() || 'General';
  const author = document.getElementById('postAuthor').value.trim();
  const image = document.getElementById('postImage').value.trim();
  const content = editor.value().trim();

  if (!title || !excerpt || !content) {
    showStatus('제목, 요약, 본문은 필수 항목입니다.', 'error');
    return;
  }

  // Disable button
  const publishBtn = document.getElementById('publishBtn');
  publishBtn.disabled = true;
  publishBtn.innerHTML = '<i class="bi bi-hourglass-split"></i> 발행 중...';

  try {
    // Generate filename
    const date = new Date().toISOString().split('T')[0];
    const slug = title.toLowerCase()
      .replace(/[^a-z0-9가-힣\s-]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 50);
    const filename = `${date}-${slug}.md`;

    // Create frontmatter
    const frontmatter = [
      '---',
      `title: "${title}"`,
      `date: "${new Date().toISOString()}"`,
      `author: "${author}"`,
      `excerpt: "${excerpt}"`,
      `tags: [${tags.map(t => `"${t}"`).join(', ')}]`,
      `category: "${category}"`,
      image ? `image: "${image}"` : '',
      '---',
      ''
    ].filter(line => line !== '').join('\n');

    const fileContent = frontmatter + '\n' + content;

    // Commit to GitHub
    if (currentEditingPost) {
      await updatePostOnGitHub(currentEditingPost.filename, fileContent, filename);
    } else {
      await createPostOnGitHub(filename, fileContent);
    }

    showStatus('글이 성공적으로 발행되었습니다!', 'success');
    resetForm();
    loadExistingPosts();

  } catch (error) {
    console.error('Publish error:', error);
    showStatus('발행 중 오류가 발생했습니다: ' + error.message, 'error');
  } finally {
    publishBtn.disabled = false;
    publishBtn.innerHTML = '<i class="bi bi-upload"></i> 발행하기';
  }
}

// Create post on GitHub
async function createPostOnGitHub(filename, content) {
  const path = `_posts/${filename}`;

  // Create post file
  await createOrUpdateFile(path, content, `Add new post: ${filename}`);

  // Update posts-index.json
  await updatePostsIndex('add', filename);
}

// Update post on GitHub
async function updatePostOnGitHub(oldFilename, content, newFilename) {
  const oldPath = `_posts/${oldFilename}`;
  const newPath = `_posts/${newFilename}`;

  if (oldFilename !== newFilename) {
    // Delete old file
    await deleteFile(oldPath, `Delete old post: ${oldFilename}`);
    // Create new file
    await createOrUpdateFile(newPath, content, `Update post: ${newFilename}`);
    // Update index
    await updatePostsIndex('update', newFilename, oldFilename);
  } else {
    // Just update the file
    await createOrUpdateFile(oldPath, content, `Update post: ${oldFilename}`);
  }
}

// Create or update file on GitHub
async function createOrUpdateFile(path, content, message) {
  const url = `https://api.github.com/repos/${CONFIG.GITHUB_OWNER}/${CONFIG.GITHUB_REPO}/contents/${path}`;

  // Get current file SHA if exists
  let sha = null;
  try {
    const response = await fetch(url, {
      headers: {
        'Authorization': `token ${accessToken}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    });
    if (response.ok) {
      const data = await response.json();
      sha = data.sha;
    }
  } catch (error) {
    // File doesn't exist, that's okay
  }

  // Create/update file
  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      'Authorization': `token ${accessToken}`,
      'Accept': 'application/vnd.github.v3+json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      message: message,
      content: btoa(unescape(encodeURIComponent(content))),
      sha: sha,
      branch: CONFIG.GITHUB_BRANCH
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'GitHub API error');
  }

  return await response.json();
}

// Delete file on GitHub
async function deleteFile(path, message) {
  const url = `https://api.github.com/repos/${CONFIG.GITHUB_OWNER}/${CONFIG.GITHUB_REPO}/contents/${path}`;

  // Get file SHA
  const getResponse = await fetch(url, {
    headers: {
      'Authorization': `token ${accessToken}`,
      'Accept': 'application/vnd.github.v3+json'
    }
  });

  if (!getResponse.ok) {
    if (getResponse.status === 404) {
      console.warn(`File not found on GitHub: ${path}. It may have been already deleted.`);
      throw new Error('File not found on GitHub. It may have been already deleted.');
    }
    throw new Error(`Failed to get file info: ${getResponse.status}`);
  }

  const fileData = await getResponse.json();

  // Delete file
  const deleteResponse = await fetch(url, {
    method: 'DELETE',
    headers: {
      'Authorization': `token ${accessToken}`,
      'Accept': 'application/vnd.github.v3+json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      message: message,
      sha: fileData.sha,
      branch: CONFIG.GITHUB_BRANCH
    })
  });

  if (!deleteResponse.ok) {
    const error = await deleteResponse.json();
    throw new Error(error.message || 'Delete failed');
  }
}

// Update posts-index.json
async function updatePostsIndex(action, filename, oldFilename = null) {
  const indexPath = 'data/posts-index.json';
  const url = `https://api.github.com/repos/${CONFIG.GITHUB_OWNER}/${CONFIG.GITHUB_REPO}/contents/${indexPath}`;

  // Get current index
  const response = await fetch(url, {
    headers: {
      'Authorization': `token ${accessToken}`,
      'Accept': 'application/vnd.github.v3+json'
    }
  });

  const indexData = await response.json();
  const currentContent = JSON.parse(decodeURIComponent(escape(atob(indexData.content))));

  let posts = currentContent.posts || [];

  if (action === 'add') {
    // Add to beginning
    posts.unshift(filename);
  } else if (action === 'update' && oldFilename) {
    // Replace old with new
    const index = posts.indexOf(oldFilename);
    if (index > -1) {
      posts[index] = filename;
    } else {
      posts.unshift(filename);
    }
  } else if (action === 'delete') {
    // Remove
    posts = posts.filter(p => p !== filename);
  }

  // Update index
  const newContent = JSON.stringify({ posts }, null, 2);

  await createOrUpdateFile(indexPath, newContent, `Update posts index: ${action} ${filename}`);
}

// Load existing posts
async function loadExistingPosts() {
  try {
    // Add cache-busting parameter to always get the latest posts-index.json
    const timestamp = new Date().getTime();
    const response = await fetch(`data/posts-index.json?v=${timestamp}`);

    if (!response.ok) {
      throw new Error(`Failed to load posts index: ${response.status}`);
    }

    const postsIndex = await response.json();

    const postPromises = postsIndex.posts.map(async (postFile) => {
      try {
        const postResponse = await fetch(`_posts/${postFile}`);

        if (!postResponse.ok) {
          console.warn(`Post file not found: ${postFile} (${postResponse.status})`);
          return null;
        }

        const postContent = await postResponse.text();
        return { filename: postFile, content: postContent };
      } catch (error) {
        console.error(`Error loading post ${postFile}:`, error);
        return null;
      }
    });

    allPosts = (await Promise.all(postPromises)).filter(p => p !== null);

    renderPostsList();

  } catch (error) {
    console.error('Error loading posts:', error);
    document.getElementById('loadingPosts').innerHTML = '<p class="text-danger">글 목록을 불러올 수 없습니다.</p>';
  }
}

// Render posts list
function renderPostsList() {
  const container = document.getElementById('postsList');
  document.getElementById('loadingPosts').style.display = 'none';

  if (allPosts.length === 0) {
    container.innerHTML = '<p class="text-muted">아직 작성된 글이 없습니다.</p>';
    return;
  }

  container.innerHTML = allPosts.map(post => {
    const { frontmatter } = parseFrontmatter(post.content);
    return `
      <div class="post-item">
        <div>
          <strong>${frontmatter.title || post.filename}</strong>
          <div style="font-size: 12px; color: #666;">${post.filename}</div>
        </div>
        <div class="post-item-actions">
          <button class="edit-btn" onclick='editPost(${JSON.stringify(post.filename)})'>
            <i class="bi bi-pencil"></i> 수정
          </button>
          <button class="delete-btn" onclick='deletePost(${JSON.stringify(post.filename)})'>
            <i class="bi bi-trash"></i> 삭제
          </button>
        </div>
      </div>
    `;
  }).join('');
}

// Parse frontmatter
function parseFrontmatter(content) {
  const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/;
  const match = content.match(frontmatterRegex);

  if (!match) {
    return { frontmatter: {}, content: content };
  }

  const frontmatterText = match[1];
  const bodyContent = match[2];

  const frontmatter = {};
  const lines = frontmatterText.split('\n');

  lines.forEach(line => {
    const colonIndex = line.indexOf(':');
    if (colonIndex > -1) {
      const key = line.substring(0, colonIndex).trim();
      let value = line.substring(colonIndex + 1).trim();

      if ((value.startsWith('"') && value.endsWith('"')) ||
          (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }

      if (value.startsWith('[') && value.endsWith(']')) {
        value = value.slice(1, -1).split(',').map(v => v.trim().replace(/['"]/g, ''));
      }

      frontmatter[key] = value;
    }
  });

  return { frontmatter, content: bodyContent };
}

// Edit post
function editPost(filename) {
  const post = allPosts.find(p => p.filename === filename);
  if (!post) return;

  const { frontmatter, content } = parseFrontmatter(post.content);

  // Fill form
  document.getElementById('postTitle').value = frontmatter.title || '';
  document.getElementById('postExcerpt').value = frontmatter.excerpt || '';
  document.getElementById('postCategory').value = frontmatter.category || '';
  document.getElementById('postAuthor').value = frontmatter.author || 'Yoonsuh Jung';
  document.getElementById('postImage').value = frontmatter.image || '';

  // Set tags
  tags.length = 0;
  if (Array.isArray(frontmatter.tags)) {
    tags.push(...frontmatter.tags);
  }
  renderTags();

  // Set content
  editor.value(content);

  // Set editing mode
  currentEditingPost = post;

  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' });

  // Update button text
  document.getElementById('publishBtn').innerHTML = '<i class="bi bi-pencil"></i> 수정 완료';

  showStatus('수정 모드: 변경 후 "수정 완료"를 클릭하세요.', 'success');
}

// Delete post
async function deletePost(filename) {
  if (!confirm(`"${filename}" 글을 정말 삭제하시겠습니까?\n\n이 작업은 되돌릴 수 없습니다.`)) {
    return;
  }

  try {
    const path = `_posts/${filename}`;
    let fileDeleteSuccess = false;

    // Try to delete the file from GitHub
    try {
      await deleteFile(path, `Delete post: ${filename}`);
      fileDeleteSuccess = true;
    } catch (error) {
      // If file not found on GitHub, just log it and continue to remove from index
      if (error.message.includes('not found')) {
        console.warn(`File ${filename} not found on GitHub, removing from index only.`);
      } else {
        // If it's a different error, rethrow it
        throw error;
      }
    }

    // Always try to remove from posts-index.json
    await updatePostsIndex('delete', filename);

    if (fileDeleteSuccess) {
      showStatus('글이 삭제되었습니다.', 'success');
    } else {
      showStatus('인덱스에서 제거되었습니다. (파일은 이미 삭제되어 있었습니다)', 'success');
    }

    loadExistingPosts();

  } catch (error) {
    console.error('Delete error:', error);
    showStatus('삭제 중 오류가 발생했습니다: ' + error.message, 'error');
  }
}

// Reset form
function resetForm() {
  document.getElementById('postForm').reset();
  editor.value('');
  tags.length = 0;
  renderTags();
  currentEditingPost = null;
  document.getElementById('publishBtn').innerHTML = '<i class="bi bi-upload"></i> 발행하기';
  updateExcerptCount();
}

// Show status message
function showStatus(message, type) {
  const statusEl = document.getElementById('statusMessage');
  statusEl.textContent = message;
  statusEl.className = `status-message ${type}`;
  statusEl.style.display = 'block';

  setTimeout(() => {
    statusEl.style.display = 'none';
  }, 5000);
}

// Handle OAuth callback (for future OAuth implementation)
async function handleOAuthCallback(code) {
  // This would be implemented with a backend service
  // For now, we use Personal Access Tokens
  console.log('OAuth callback received:', code);
}
