/**
 * Blog Interactions UI Handler
 * Handles like and comment UI updates
 */

let currentPostId = null;
let likeCleanup = null;
let commentCleanup = null;

/**
 * Initialize interactions for the current post
 */
async function initializePostInteractions(postId) {
  currentPostId = postId;

  // Initialize Firebase interactions
  if (typeof initializeInteractions === 'function') {
    const initialized = initializeInteractions();
    if (!initialized) {
      console.warn('Firebase interactions not available');
      return;
    }
  } else {
    console.warn('Firebase interactions not loaded');
    return;
  }

  // Initialize likes
  await initializeLikes(postId);

  // Initialize comments
  await initializeComments(postId);

  // Setup character counter for comment textarea
  setupCommentCharCounter();
}

/**
 * Initialize like button and counter
 */
async function initializeLikes(postId) {
  if (typeof getLikeStatus !== 'function') return;

  try {
    // Get initial like status
    const { liked, count } = await getLikeStatus(postId);
    updateLikeUI(liked, count);

    // Setup real-time listener
    if (typeof setupLikeListener === 'function') {
      likeCleanup = setupLikeListener(postId, (data) => {
        if (data.liked !== undefined || data.count !== undefined) {
          const likeButton = document.getElementById('likeButton');
          const currentLiked = likeButton?.classList.contains('liked');
          const likeCount = document.getElementById('likeCount');
          const currentCount = parseInt(likeCount?.textContent) || 0;

          updateLikeUI(
            data.liked !== undefined ? data.liked : currentLiked,
            data.count !== undefined ? data.count : currentCount
          );
        }
      });
    }
  } catch (error) {
    console.error('Error initializing likes:', error);
  }
}

/**
 * Update like button UI
 */
function updateLikeUI(liked, count) {
  const likeButton = document.getElementById('likeButton');
  const likeText = document.getElementById('likeText');
  const likeCount = document.getElementById('likeCount');

  if (!likeButton || !likeText || !likeCount) return;

  if (liked) {
    likeButton.classList.add('liked');
    likeText.textContent = 'Liked';
  } else {
    likeButton.classList.remove('liked');
    likeText.textContent = 'Like';
  }

  likeCount.textContent = count === 1 ? '1 like' : `${count} likes`;
}

/**
 * Handle like button click
 */
async function handleLikeClick() {
  if (!currentPostId || typeof toggleLike !== 'function') return;

  const likeButton = document.getElementById('likeButton');
  if (!likeButton) return;

  // Disable button during request
  likeButton.disabled = true;

  try {
    const result = await toggleLike(currentPostId);
    if (result) {
      updateLikeUI(result.liked, result.count);

      // Add animation
      likeButton.classList.add('liked-animation');
      setTimeout(() => {
        likeButton.classList.remove('liked-animation');
      }, 600);
    }
  } catch (error) {
    console.error('Error toggling like:', error);
  } finally {
    likeButton.disabled = false;
  }
}

/**
 * Initialize comments section
 */
async function initializeComments(postId) {
  if (typeof getComments !== 'function') return;

  try {
    // Setup real-time listener
    if (typeof setupCommentListener === 'function') {
      commentCleanup = setupCommentListener(postId, (comments) => {
        renderComments(comments);
        updateCommentCount(comments.length);
      });
    } else {
      // Fallback to one-time fetch
      const comments = await getComments(postId);
      renderComments(comments);
      updateCommentCount(comments.length);
    }
  } catch (error) {
    console.error('Error initializing comments:', error);
  }
}

/**
 * Render comments list
 */
function renderComments(comments) {
  const commentsList = document.getElementById('commentsList');
  if (!commentsList) return;

  if (comments.length === 0) {
    commentsList.innerHTML = `
      <div class="no-comments">
        <i class="bi bi-chat-dots"></i>
        <p>No comments yet. Be the first to comment!</p>
      </div>
    `;
    return;
  }

  commentsList.innerHTML = comments.map(comment => `
    <div class="comment-item ${comment.isOwn ? 'own-comment' : ''}" data-comment-id="${comment.id}" data-user-id="${comment.userId}">
      <div class="comment-header">
        <div class="comment-author">
          <i class="bi bi-person-circle"></i>
          <strong>${escapeHtml(comment.author || 'Anonymous')}</strong>
          ${comment.isOwn ? '<span class="own-badge">You</span>' : ''}
        </div>
        <div class="comment-meta">
          <span class="comment-date">${formatCommentDate(comment.timestamp)}</span>
          ${comment.edited ? '<span class="edited-badge">edited</span>' : ''}
          ${comment.isOwn ? `
            <div class="comment-actions">
              <button class="btn-edit-comment" onclick="handleEditComment('${comment.id}', '${comment.userId}', '${escapeHtml(comment.text).replace(/'/g, "\\'")}')">
                <i class="bi bi-pencil"></i>
              </button>
              <button class="btn-delete-comment" onclick="handleDeleteComment('${comment.id}', '${comment.userId}')">
                <i class="bi bi-trash"></i>
              </button>
            </div>
          ` : ''}
        </div>
      </div>
      <div class="comment-text">${escapeHtml(comment.text)}</div>
    </div>
  `).join('');
}

/**
 * Update comment count
 */
function updateCommentCount(count) {
  const commentCount = document.getElementById('commentCount');
  if (commentCount) {
    commentCount.textContent = count;
  }
}

/**
 * Handle comment submission
 */
async function handleCommentSubmit() {
  if (!currentPostId || typeof addComment !== 'function') return;

  const commentText = document.getElementById('commentText');
  const commentAuthor = document.getElementById('commentAuthor');

  if (!commentText || !commentAuthor) return;

  const text = commentText.value.trim();
  if (!text) {
    showCommentError('Please write a comment');
    return;
  }

  if (text.length > 500) {
    showCommentError('Comment is too long (max 500 characters)');
    return;
  }

  const author = commentAuthor.value.trim() || 'Anonymous';

  try {
    // Disable form during submission
    commentText.disabled = true;
    commentAuthor.disabled = true;

    const result = await addComment(currentPostId, {
      text: text,
      author: author
    });

    if (result) {
      // Clear form
      commentText.value = '';
      commentAuthor.value = '';
      updateCharCount();

      // Show success message
      showCommentSuccess('Comment posted successfully!');
    } else {
      showCommentError('Failed to post comment');
    }
  } catch (error) {
    console.error('Error submitting comment:', error);
    showCommentError('Failed to post comment');
  } finally {
    commentText.disabled = false;
    commentAuthor.disabled = false;
  }
}

/**
 * Handle comment deletion
 */
async function handleDeleteComment(commentId, userId) {
  if (!currentPostId || typeof deleteComment !== 'function') return;

  if (!confirm('Are you sure you want to delete this comment?')) {
    return;
  }

  try {
    const success = await deleteComment(currentPostId, commentId, userId);
    if (success) {
      showCommentSuccess('Comment deleted');
    } else {
      showCommentError('Failed to delete comment');
    }
  } catch (error) {
    console.error('Error deleting comment:', error);
    showCommentError('Failed to delete comment');
  }
}

/**
 * Handle comment editing
 */
async function handleEditComment(commentId, userId, currentText) {
  if (!currentPostId || typeof editComment !== 'function') return;

  const newText = prompt('Edit your comment:', currentText);
  if (newText === null) return; // Cancelled
  if (!newText.trim()) {
    showCommentError('Comment cannot be empty');
    return;
  }
  if (newText.length > 500) {
    showCommentError('Comment is too long (max 500 characters)');
    return;
  }

  try {
    const success = await editComment(currentPostId, commentId, userId, newText.trim());
    if (success) {
      showCommentSuccess('Comment updated');
    } else {
      showCommentError('Failed to update comment');
    }
  } catch (error) {
    console.error('Error editing comment:', error);
    showCommentError('Failed to update comment');
  }
}

/**
 * Setup character counter for comment textarea
 */
function setupCommentCharCounter() {
  const commentText = document.getElementById('commentText');
  const charCount = document.getElementById('commentCharCount');

  if (commentText && charCount) {
    commentText.addEventListener('input', updateCharCount);
  }
}

/**
 * Update character count display
 */
function updateCharCount() {
  const commentText = document.getElementById('commentText');
  const charCount = document.getElementById('commentCharCount');

  if (commentText && charCount) {
    const length = commentText.value.length;
    charCount.textContent = length;

    if (length > 450) {
      charCount.style.color = '#dc3545';
    } else if (length > 400) {
      charCount.style.color = '#ffc107';
    } else {
      charCount.style.color = '#6c757d';
    }
  }
}

/**
 * Show comment error message
 */
function showCommentError(message) {
  // You can implement a toast notification here
  alert(message);
}

/**
 * Show comment success message
 */
function showCommentSuccess(message) {
  // You can implement a toast notification here
  console.log(message);
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Cleanup function - call when leaving the page
 */
function cleanupInteractions() {
  if (likeCleanup) {
    likeCleanup();
    likeCleanup = null;
  }
  if (commentCleanup) {
    commentCleanup();
    commentCleanup = null;
  }
}

// Cleanup on page unload
window.addEventListener('beforeunload', cleanupInteractions);
