/**
 * Blog List Page JavaScript
 * Handles loading, filtering, and displaying blog posts
 */

let allPosts = [];
let filteredPosts = [];
let currentPage = 1;
const postsPerPage = 6;

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

// Load all blog posts
async function loadBlogPosts() {
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

        // Extract filename without extension for ID
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

    // Sort by date (newest first)
    allPosts.sort((a, b) => new Date(b.date) - new Date(a.date));

    filteredPosts = [...allPosts];

    populateFilters();
    renderPosts();

  } catch (error) {
    console.error('Error loading blog posts:', error);
    document.getElementById('postsGrid').innerHTML = `
      <div class="col-12">
        <div class="alert alert-warning" role="alert">
          No blog posts found. Posts will appear here once you create them.
        </div>
      </div>
    `;
  }
}

// Populate category and tag filters
function populateFilters() {
  const categories = new Set();
  const tags = new Set();

  allPosts.forEach(post => {
    if (post.category) categories.add(post.category);
    if (post.tags) post.tags.forEach(tag => tags.add(tag));
  });

  const categoryFilter = document.getElementById('categoryFilter');
  const tagFilter = document.getElementById('tagFilter');

  categories.forEach(category => {
    const option = document.createElement('option');
    option.value = category;
    option.textContent = category;
    categoryFilter.appendChild(option);
  });

  tags.forEach(tag => {
    const option = document.createElement('option');
    option.value = tag;
    option.textContent = tag;
    tagFilter.appendChild(option);
  });
}

// Format date
function formatDate(dateString) {
  const date = new Date(dateString);
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return date.toLocaleDateString('en-US', options);
}

// Render posts
function renderPosts() {
  const postsGrid = document.getElementById('postsGrid');

  if (filteredPosts.length === 0) {
    postsGrid.innerHTML = `
      <div class="col-12">
        <div class="alert alert-info" role="alert">
          No posts found matching your criteria.
        </div>
      </div>
    `;
    return;
  }

  const startIndex = (currentPage - 1) * postsPerPage;
  const endIndex = startIndex + postsPerPage;
  const postsToShow = filteredPosts.slice(startIndex, endIndex);

  postsGrid.innerHTML = postsToShow.map(post => `
    <div class="col-lg-4 col-md-6">
      <article class="blog-card">
        ${post.image ? `
          <div class="blog-card-img">
            <img src="${post.image}" alt="${post.title}" class="img-fluid">
          </div>
        ` : ''}
        <div class="blog-card-content p-4">
          <h3 class="blog-card-title">
            <a href="blog-post.html?id=${post.id}">${post.title}</a>
          </h3>
          <div class="blog-card-meta mb-3" data-post-id="${post.id}">
            <span><i class="bi bi-calendar"></i> ${formatDate(post.date)}</span>
            ${post.category ? `<span class="ms-3"><i class="bi bi-folder"></i> ${post.category}</span>` : ''}
            <span class="ms-3"><i class="bi bi-eye"></i> <span class="view-count">0</span></span>
          </div>
          <p class="blog-card-excerpt">${post.excerpt}</p>
          ${post.tags && post.tags.length > 0 ? `
            <div class="blog-card-tags mt-3">
              ${post.tags.map(tag => `<span class="badge bg-secondary me-1">${tag}</span>`).join('')}
            </div>
          ` : ''}
          <div class="mt-3">
            <a href="blog-post.html?id=${post.id}" class="btn btn-primary btn-sm">Read More <i class="bi bi-arrow-right"></i></a>
          </div>
        </div>
      </article>
    </div>
  `).join('');

  renderPagination();

  // Display view counts for all posts (Firebase version)
  const postIds = postsToShow.map(post => post.id);
  if (typeof displayFirebaseViewCounts === 'function') {
    displayFirebaseViewCounts(postIds);
  } else if (typeof displayViewCounts === 'function') {
    // Fallback to localStorage version
    displayViewCounts(postIds);
  }
}

// Render pagination
function renderPagination() {
  const pagination = document.getElementById('pagination');
  const totalPages = Math.ceil(filteredPosts.length / postsPerPage);

  if (totalPages <= 1) {
    pagination.innerHTML = '';
    return;
  }

  let paginationHTML = '';

  // Previous button
  paginationHTML += `
    <li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
      <a class="page-link" href="#" data-page="${currentPage - 1}">Previous</a>
    </li>
  `;

  // Page numbers
  for (let i = 1; i <= totalPages; i++) {
    paginationHTML += `
      <li class="page-item ${i === currentPage ? 'active' : ''}">
        <a class="page-link" href="#" data-page="${i}">${i}</a>
      </li>
    `;
  }

  // Next button
  paginationHTML += `
    <li class="page-item ${currentPage === totalPages ? 'disabled' : ''}">
      <a class="page-link" href="#" data-page="${currentPage + 1}">Next</a>
    </li>
  `;

  pagination.innerHTML = paginationHTML;

  // Add click handlers
  pagination.querySelectorAll('.page-link').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const page = parseInt(e.target.dataset.page);
      if (page && page !== currentPage && page >= 1 && page <= totalPages) {
        currentPage = page;
        renderPosts();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  });
}

// Filter posts
function filterPosts() {
  const searchTerm = document.getElementById('searchInput').value.toLowerCase();
  const selectedCategory = document.getElementById('categoryFilter').value;
  const selectedTag = document.getElementById('tagFilter').value;

  filteredPosts = allPosts.filter(post => {
    const matchesSearch = !searchTerm ||
      post.title.toLowerCase().includes(searchTerm) ||
      post.excerpt.toLowerCase().includes(searchTerm);

    const matchesCategory = !selectedCategory || post.category === selectedCategory;

    const matchesTag = !selectedTag || (post.tags && post.tags.includes(selectedTag));

    return matchesSearch && matchesCategory && matchesTag;
  });

  currentPage = 1;
  renderPosts();
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  loadBlogPosts();

  // Add event listeners for filters
  document.getElementById('searchInput').addEventListener('input', filterPosts);
  document.getElementById('categoryFilter').addEventListener('change', filterPosts);
  document.getElementById('tagFilter').addEventListener('change', filterPosts);
});
