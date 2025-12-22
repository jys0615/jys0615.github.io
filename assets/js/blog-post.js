/**
 * Blog Post Detail Page JavaScript
 * Handles loading and displaying individual blog posts
 */

let allPosts = [];
let currentPost = null;

// Parse frontmatter from markdown
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

      // Remove quotes
      if ((value.startsWith('"') && value.endsWith('"')) ||
          (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }

      // Parse arrays (tags)
      if (value.startsWith('[') && value.endsWith(']')) {
        value = value.slice(1, -1).split(',').map(v => v.trim().replace(/['"]/g, ''));
      }

      frontmatter[key] = value;
    }
  });

  return { frontmatter, content: bodyContent };
}

// Format date
function formatDate(dateString) {
  const date = new Date(dateString);
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return date.toLocaleDateString('en-US', options);
}

// Load all posts index
async function loadPostsIndex() {
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
        const { frontmatter, content } = parseFrontmatter(postContent);

        const id = postFile.replace('.md', '');

        return {
          id: id,
          filename: postFile,
          title: frontmatter.title || 'Untitled',
          date: frontmatter.date || new Date().toISOString(),
          author: frontmatter.author || 'Yoonsuh Jung',
          excerpt: frontmatter.excerpt || content.substring(0, 150) + '...',
          image: frontmatter.image || '',
          tags: Array.isArray(frontmatter.tags) ? frontmatter.tags : [],
          category: frontmatter.category || 'Uncategorized',
          content: content
        };
      } catch (error) {
        console.error(`Error loading post ${postFile}:`, error);
        return null;
      }
    });

    allPosts = (await Promise.all(postPromises)).filter(post => post !== null);
    allPosts.sort((a, b) => new Date(b.date) - new Date(a.date));

  } catch (error) {
    console.error('Error loading posts index:', error);
  }
}

// Load and render the current post
async function loadBlogPost() {
  const urlParams = new URLSearchParams(window.location.search);
  const postId = urlParams.get('id');

  if (!postId) {
    showError('No post ID specified');
    return;
  }

  try {
    // Load all posts first
    await loadPostsIndex();

    // Find the current post
    currentPost = allPosts.find(post => post.id === postId);

    if (!currentPost) {
      showError('Post not found');
      return;
    }

    // Render the post
    renderPost(currentPost);

    // Initialize view counter for this post (Firebase version)
    if (typeof initFirebaseViewCounter === 'function') {
      initFirebaseViewCounter(postId);
    } else if (typeof initViewCounter === 'function') {
      // Fallback to localStorage version
      initViewCounter(postId);
    }

    // Load recent posts and tags for sidebar
    loadRecentPosts();
    loadTags();

    // Load navigation (previous/next posts)
    loadPostNavigation();

  } catch (error) {
    console.error('Error loading blog post:', error);
    showError('Error loading post');
  }
}

// Render the post content
function renderPost(post) {
  // Hide loading spinner
  document.getElementById('loadingSpinner').style.display = 'none';
  document.getElementById('postContent').style.display = 'block';

  // Set page title and meta
  document.getElementById('pageTitle').textContent = `${post.title} - Yoonsuh Jung`;
  document.getElementById('pageDescription').setAttribute('content', post.excerpt);

  // Set breadcrumb
  document.getElementById('breadcrumbTitle').textContent = post.title;
  document.getElementById('postTitleHeader').textContent = post.title;

  // Set post content
  document.getElementById('postTitle').textContent = post.title;
  document.getElementById('postAuthor').textContent = post.author;
  document.getElementById('postDate').textContent = formatDate(post.date);
  document.getElementById('postDate').setAttribute('datetime', post.date);

  if (post.category) {
    document.getElementById('postCategory').textContent = post.category;
  }

  // Set featured image
  if (post.image) {
    const imgElement = document.getElementById('postImage');
    imgElement.src = post.image;
    imgElement.style.display = 'block';
  }

  // Render markdown content
  if (typeof marked !== 'undefined') {
    marked.setOptions({
      breaks: true,
      gfm: true,
      sanitize: false,
      highlight: function(code, lang) {
        if (typeof Prism !== 'undefined' && lang && Prism.languages[lang]) {
          return Prism.highlight(code, Prism.languages[lang], lang);
        }
        return code;
      }
    });

    const htmlContent = marked.parse(post.content);

    // Remove any meta tags from the parsed content to prevent CSP errors
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlContent;
    const metaTags = tempDiv.querySelectorAll('meta');
    metaTags.forEach(tag => tag.remove());

    document.getElementById('postBody').innerHTML = tempDiv.innerHTML;
  } else {
    document.getElementById('postBody').innerHTML = post.content.replace(/\n/g, '<br>');
  }

  // Render tags
  if (post.tags && post.tags.length > 0) {
    document.getElementById('postTags').innerHTML = post.tags.map(tag =>
      `<li><a href="blog.html">${tag}</a></li>`
    ).join('');
  }

  // Apply syntax highlighting if Prism is loaded
  if (typeof Prism !== 'undefined') {
    Prism.highlightAll();
  }
}

// Show error message
function showError(message) {
  document.getElementById('loadingSpinner').style.display = 'none';
  document.getElementById('postContent').innerHTML = `
    <div class="alert alert-danger" role="alert">
      ${message}
    </div>
    <a href="blog.html" class="btn btn-primary">Back to Blog</a>
  `;
  document.getElementById('postContent').style.display = 'block';
}

// Load recent posts for sidebar
function loadRecentPosts() {
  const recentPosts = allPosts.slice(0, 5);
  const container = document.getElementById('recentPostsContainer');

  container.innerHTML = recentPosts.map(post => `
    <div class="post-item">
      ${post.image ? `
        <img src="${post.image}" alt="${post.title}" class="flex-shrink-0">
      ` : ''}
      <div>
        <h4><a href="blog-post.html?id=${post.id}">${post.title}</a></h4>
        <time datetime="${post.date}">${formatDate(post.date)}</time>
      </div>
    </div>
  `).join('');
}

// Load tags for sidebar
function loadTags() {
  const tagsSet = new Set();
  allPosts.forEach(post => {
    if (post.tags) {
      post.tags.forEach(tag => tagsSet.add(tag));
    }
  });

  const tagsContainer = document.getElementById('tagsWidget');
  tagsContainer.innerHTML = Array.from(tagsSet).map(tag =>
    `<li><a href="blog.html">${tag}</a></li>`
  ).join('');
}

// Load post navigation (previous/next)
function loadPostNavigation() {
  if (!currentPost || allPosts.length === 0) return;

  const currentIndex = allPosts.findIndex(post => post.id === currentPost.id);

  const prevPostContainer = document.getElementById('prevPostContainer');
  const nextPostContainer = document.getElementById('nextPostContainer');

  // Previous post (newer post)
  if (currentIndex > 0) {
    const prevPost = allPosts[currentIndex - 1];
    prevPostContainer.innerHTML = `
      <a href="blog-post.html?id=${prevPost.id}" class="post-nav-link">
        <i class="bi bi-chevron-left"></i>
        <div>
          <p class="post-nav-label">Previous</p>
          <h5>${prevPost.title}</h5>
        </div>
      </a>
    `;
  }

  // Next post (older post)
  if (currentIndex < allPosts.length - 1) {
    const nextPost = allPosts[currentIndex + 1];
    nextPostContainer.innerHTML = `
      <a href="blog-post.html?id=${nextPost.id}" class="post-nav-link">
        <div class="text-end">
          <p class="post-nav-label">Next</p>
          <h5>${nextPost.title}</h5>
        </div>
        <i class="bi bi-chevron-right"></i>
      </a>
    `;
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  loadBlogPost();
});
