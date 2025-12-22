/**
 * Firebase-based Blog Interactions (Likes & Comments)
 * Professional implementation with real-time updates
 */

// Initialize Firebase (uses existing config from firebase-view-counter.js)
let interactionsDb = null;
let currentUserId = null;

function initializeInteractions() {
  if (typeof firebase === 'undefined') {
    console.error('Firebase SDK not loaded for interactions');
    return false;
  }

  try {
    interactionsDb = firebase.database();

    // Generate or retrieve anonymous user ID
    currentUserId = getOrCreateUserId();

    console.log('Firebase interactions initialized successfully');
    return true;
  } catch (error) {
    console.error('Error initializing Firebase interactions:', error);
    return false;
  }
}

/**
 * Get or create anonymous user ID for tracking likes
 */
function getOrCreateUserId() {
  const STORAGE_KEY = 'blog_user_id';
  let userId = localStorage.getItem(STORAGE_KEY);

  if (!userId) {
    userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem(STORAGE_KEY, userId);
  }

  return userId;
}

/**
 * ==========================================
 * LIKE SYSTEM
 * ==========================================
 */

/**
 * Toggle like for a post
 */
async function toggleLike(postId) {
  if (!interactionsDb || !currentUserId) {
    console.error('Firebase interactions not initialized');
    return null;
  }

  try {
    const likeRef = interactionsDb.ref(`likes/${postId}/users/${currentUserId}`);
    const countRef = interactionsDb.ref(`likes/${postId}/count`);

    // Check current like status
    const snapshot = await likeRef.once('value');
    const isLiked = snapshot.val() === true;

    // Toggle like
    if (isLiked) {
      // Unlike
      await likeRef.remove();
      await countRef.transaction((current) => Math.max(0, (current || 0) - 1));
    } else {
      // Like
      await likeRef.set(true);
      await countRef.transaction((current) => (current || 0) + 1);
    }

    // Get updated count
    const countSnapshot = await countRef.once('value');
    const newCount = countSnapshot.val() || 0;

    return {
      liked: !isLiked,
      count: newCount
    };
  } catch (error) {
    console.error('Error toggling like:', error);
    return null;
  }
}

/**
 * Get like status and count for a post
 */
async function getLikeStatus(postId) {
  if (!interactionsDb || !currentUserId) {
    return { liked: false, count: 0 };
  }

  try {
    const likeRef = interactionsDb.ref(`likes/${postId}/users/${currentUserId}`);
    const countRef = interactionsDb.ref(`likes/${postId}/count`);

    const [likeSnapshot, countSnapshot] = await Promise.all([
      likeRef.once('value'),
      countRef.once('value')
    ]);

    return {
      liked: likeSnapshot.val() === true,
      count: countSnapshot.val() || 0
    };
  } catch (error) {
    console.error('Error getting like status:', error);
    return { liked: false, count: 0 };
  }
}

/**
 * Setup real-time like listener
 */
function setupLikeListener(postId, callback) {
  if (!interactionsDb) return null;

  const countRef = interactionsDb.ref(`likes/${postId}/count`);
  const userLikeRef = interactionsDb.ref(`likes/${postId}/users/${currentUserId}`);

  const countListener = countRef.on('value', (snapshot) => {
    const count = snapshot.val() || 0;
    callback({ count });
  });

  const userListener = userLikeRef.on('value', (snapshot) => {
    const liked = snapshot.val() === true;
    callback({ liked });
  });

  // Return cleanup function
  return () => {
    countRef.off('value', countListener);
    userLikeRef.off('value', userListener);
  };
}

/**
 * ==========================================
 * COMMENT SYSTEM
 * ==========================================
 */

/**
 * Add a comment to a post
 */
async function addComment(postId, commentData) {
  if (!interactionsDb || !currentUserId) {
    console.error('Firebase interactions not initialized');
    return null;
  }

  try {
    const commentsRef = interactionsDb.ref(`comments/${postId}`);
    const newCommentRef = commentsRef.push();

    const comment = {
      id: newCommentRef.key,
      text: commentData.text,
      author: commentData.author || 'Anonymous',
      userId: currentUserId,
      timestamp: firebase.database.ServerValue.TIMESTAMP,
      edited: false
    };

    await newCommentRef.set(comment);

    return comment;
  } catch (error) {
    console.error('Error adding comment:', error);
    return null;
  }
}

/**
 * Get all comments for a post
 */
async function getComments(postId) {
  if (!interactionsDb) {
    return [];
  }

  try {
    const commentsRef = interactionsDb.ref(`comments/${postId}`);
    const snapshot = await commentsRef.orderByChild('timestamp').once('value');

    const comments = [];
    snapshot.forEach((childSnapshot) => {
      const comment = childSnapshot.val();
      comment.id = childSnapshot.key;
      comment.isOwn = comment.userId === currentUserId;
      comments.push(comment);
    });

    // Sort by timestamp (newest first)
    return comments.reverse();
  } catch (error) {
    console.error('Error getting comments:', error);
    return [];
  }
}

/**
 * Delete a comment (only if user owns it)
 */
async function deleteComment(postId, commentId, userId) {
  if (!interactionsDb || !currentUserId) {
    console.error('Firebase interactions not initialized');
    return false;
  }

  // Verify ownership
  if (userId !== currentUserId) {
    console.error('Cannot delete comment: not the owner');
    return false;
  }

  try {
    const commentRef = interactionsDb.ref(`comments/${postId}/${commentId}`);
    await commentRef.remove();
    return true;
  } catch (error) {
    console.error('Error deleting comment:', error);
    return false;
  }
}

/**
 * Edit a comment (only if user owns it)
 */
async function editComment(postId, commentId, userId, newText) {
  if (!interactionsDb || !currentUserId) {
    console.error('Firebase interactions not initialized');
    return false;
  }

  // Verify ownership
  if (userId !== currentUserId) {
    console.error('Cannot edit comment: not the owner');
    return false;
  }

  try {
    const commentRef = interactionsDb.ref(`comments/${postId}/${commentId}`);
    await commentRef.update({
      text: newText,
      edited: true,
      editedAt: firebase.database.ServerValue.TIMESTAMP
    });
    return true;
  } catch (error) {
    console.error('Error editing comment:', error);
    return false;
  }
}

/**
 * Setup real-time comment listener
 */
function setupCommentListener(postId, callback) {
  if (!interactionsDb) return null;

  const commentsRef = interactionsDb.ref(`comments/${postId}`);

  const listener = commentsRef.on('value', async (snapshot) => {
    const comments = [];
    snapshot.forEach((childSnapshot) => {
      const comment = childSnapshot.val();
      comment.id = childSnapshot.key;
      comment.isOwn = comment.userId === currentUserId;
      comments.push(comment);
    });

    // Sort by timestamp (newest first)
    comments.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

    callback(comments);
  });

  // Return cleanup function
  return () => {
    commentsRef.off('value', listener);
  };
}

/**
 * Format timestamp to readable date
 */
function formatCommentDate(timestamp) {
  if (!timestamp) return 'Just now';

  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;

  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

/**
 * Get comment count for a post
 */
async function getCommentCount(postId) {
  if (!interactionsDb) return 0;

  try {
    const commentsRef = interactionsDb.ref(`comments/${postId}`);
    const snapshot = await commentsRef.once('value');
    return snapshot.numChildren();
  } catch (error) {
    console.error('Error getting comment count:', error);
    return 0;
  }
}

// Export functions
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    initializeInteractions,
    toggleLike,
    getLikeStatus,
    setupLikeListener,
    addComment,
    getComments,
    deleteComment,
    editComment,
    setupCommentListener,
    formatCommentDate,
    getCommentCount
  };
}
