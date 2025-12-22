/**
 * View Counter with localStorage-based tracking
 * Tracks page views with simple duplicate prevention
 */

// Configuration
const VIEW_COUNTER_CONFIG = {
  STORAGE_KEY: 'blog_view_counts',
  VISIT_HISTORY_KEY: 'blog_visit_history',
  DUPLICATE_THRESHOLD: 24 * 60 * 60 * 1000 // 24 hours in milliseconds
};

/**
 * Get all view counts from localStorage
 */
function getViewCounts() {
  const stored = localStorage.getItem(VIEW_COUNTER_CONFIG.STORAGE_KEY);
  return stored ? JSON.parse(stored) : {};
}

/**
 * Save view counts to localStorage
 */
function saveViewCounts(counts) {
  localStorage.setItem(VIEW_COUNTER_CONFIG.STORAGE_KEY, JSON.stringify(counts));
}

/**
 * Get visit history from localStorage
 */
function getVisitHistory() {
  const stored = localStorage.getItem(VIEW_COUNTER_CONFIG.VISIT_HISTORY_KEY);
  return stored ? JSON.parse(stored) : {};
}

/**
 * Save visit history to localStorage
 */
function saveVisitHistory(history) {
  localStorage.setItem(VIEW_COUNTER_CONFIG.VISIT_HISTORY_KEY, JSON.stringify(history));
}

/**
 * Check if this is a duplicate visit (within 24 hours)
 */
function isDuplicateVisit(postId) {
  const history = getVisitHistory();
  const lastVisit = history[postId];

  if (!lastVisit) return false;

  const now = Date.now();
  const timeSinceLastVisit = now - lastVisit;

  return timeSinceLastVisit < VIEW_COUNTER_CONFIG.DUPLICATE_THRESHOLD;
}

/**
 * Record a visit to a post
 */
function recordVisit(postId) {
  const history = getVisitHistory();
  history[postId] = Date.now();
  saveVisitHistory(history);
}

/**
 * Increment view count for a post
 */
function incrementViewCount(postId) {
  // Check for duplicate visit
  if (isDuplicateVisit(postId)) {
    console.log(`Duplicate visit to ${postId} within 24 hours - not counting`);
    return getViewCount(postId);
  }

  // Increment count
  const counts = getViewCounts();
  counts[postId] = (counts[postId] || 0) + 1;
  saveViewCounts(counts);

  // Record visit time
  recordVisit(postId);

  console.log(`View count for ${postId}: ${counts[postId]}`);
  return counts[postId];
}

/**
 * Get view count for a specific post
 */
function getViewCount(postId) {
  const counts = getViewCounts();
  return counts[postId] || 0;
}

/**
 * Initialize view counter for current page
 * Should be called when a blog post page loads
 */
function initViewCounter(postId) {
  if (!postId) {
    console.error('Post ID is required for view counter');
    return;
  }

  // Increment and get new count
  const viewCount = incrementViewCount(postId);

  // Update UI elements with class 'view-count'
  const viewCountElements = document.querySelectorAll('.view-count');
  viewCountElements.forEach(el => {
    el.textContent = viewCount.toLocaleString();
  });

  return viewCount;
}

/**
 * Display view counts for multiple posts (for blog list page)
 */
function displayViewCounts(postIds) {
  const counts = getViewCounts();

  postIds.forEach(postId => {
    const count = counts[postId] || 0;
    const element = document.querySelector(`[data-post-id="${postId}"] .view-count`);
    if (element) {
      element.textContent = count.toLocaleString();
    }
  });
}

/**
 * Format view count with abbreviations (like YouTube)
 * 1,234 -> 1.2K
 * 1,234,567 -> 1.2M
 */
function formatViewCount(count) {
  if (count >= 1000000) {
    return (count / 1000000).toFixed(1) + 'M';
  } else if (count >= 1000) {
    return (count / 1000).toFixed(1) + 'K';
  }
  return count.toLocaleString();
}

// Export functions for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    initViewCounter,
    getViewCount,
    incrementViewCount,
    displayViewCounts,
    formatViewCount
  };
}
