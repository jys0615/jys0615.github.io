/**
 * Firebase-based View Counter
 * Real view counting shared across all users
 */

// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyCtSxbdIglznMFpvtKGB1YH03mK1DoGVek",
  authDomain: "jys0615-blog.firebaseapp.com",
  databaseURL: "https://jys0615-blog-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "jys0615-blog",
  storageBucket: "jys0615-blog.firebasestorage.app",
  messagingSenderId: "123855757302",
  appId: "1:123855757302:web:1f2b404b69ab0f615c71d7",
  measurementId: "G-91QJDD8YXJ"
};

// Initialize Firebase
let db = null;
let firebaseInitialized = false;

function initializeFirebase() {
  if (firebaseInitialized) return;

  try {
    // Check if Firebase is loaded
    if (typeof firebase === 'undefined') {
      console.error('Firebase SDK not loaded');
      return false;
    }

    // Initialize Firebase
    if (!firebase.apps.length) {
      firebase.initializeApp(firebaseConfig);
    }

    db = firebase.database();
    firebaseInitialized = true;
    console.log('Firebase initialized successfully');
    return true;
  } catch (error) {
    console.error('Error initializing Firebase:', error);
    return false;
  }
}

/**
 * Local storage for duplicate visit prevention
 */
const LOCAL_VISIT_KEY = 'blog_firebase_visits';
const DUPLICATE_THRESHOLD = 24 * 60 * 60 * 1000; // 24 hours

function getLocalVisitHistory() {
  const stored = localStorage.getItem(LOCAL_VISIT_KEY);
  return stored ? JSON.parse(stored) : {};
}

function saveLocalVisitHistory(history) {
  localStorage.setItem(LOCAL_VISIT_KEY, JSON.stringify(history));
}

function isDuplicateVisit(postId) {
  const history = getLocalVisitHistory();
  const lastVisit = history[postId];

  if (!lastVisit) return false;

  const now = Date.now();
  const timeSinceLastVisit = now - lastVisit;

  return timeSinceLastVisit < DUPLICATE_THRESHOLD;
}

function recordLocalVisit(postId) {
  const history = getLocalVisitHistory();
  history[postId] = Date.now();
  saveLocalVisitHistory(history);
}

/**
 * Increment view count in Firebase
 */
async function incrementFirebaseViewCount(postId) {
  if (!db) {
    console.error('Firebase not initialized');
    return null;
  }

  try {
    // Check for duplicate visit
    if (isDuplicateVisit(postId)) {
      console.log(`Duplicate visit to ${postId} - not counting`);
      return await getFirebaseViewCount(postId);
    }

    // Reference to the post's view count
    const viewCountRef = db.ref(`viewCounts/${postId}`);

    // Use transaction to safely increment
    const result = await viewCountRef.transaction((currentValue) => {
      return (currentValue || 0) + 1;
    });

    // Record local visit
    recordLocalVisit(postId);

    if (result.committed) {
      console.log(`View count for ${postId}: ${result.snapshot.val()}`);
      return result.snapshot.val();
    }

    return null;
  } catch (error) {
    console.error('Error incrementing view count:', error);
    return null;
  }
}

/**
 * Get view count from Firebase
 */
async function getFirebaseViewCount(postId) {
  if (!db) {
    console.error('Firebase not initialized');
    return 0;
  }

  try {
    const snapshot = await db.ref(`viewCounts/${postId}`).once('value');
    return snapshot.val() || 0;
  } catch (error) {
    console.error('Error getting view count:', error);
    return 0;
  }
}

/**
 * Initialize view counter for current page (Firebase version)
 */
async function initFirebaseViewCounter(postId) {
  if (!postId) {
    console.error('Post ID is required for view counter');
    return;
  }

  // Initialize Firebase
  if (!initializeFirebase()) {
    console.error('Failed to initialize Firebase - falling back to local storage');
    // Fallback to local storage version
    if (typeof initViewCounter === 'function') {
      return initViewCounter(postId);
    }
    return;
  }

  try {
    // Increment and get new count
    const viewCount = await incrementFirebaseViewCount(postId);

    if (viewCount !== null) {
      // Update UI elements with class 'view-count'
      const viewCountElements = document.querySelectorAll('.view-count');
      viewCountElements.forEach(el => {
        el.textContent = formatViewCount(viewCount);
      });
    }

    return viewCount;
  } catch (error) {
    console.error('Error in initFirebaseViewCounter:', error);
  }
}

/**
 * Display view counts for multiple posts (Firebase version)
 */
async function displayFirebaseViewCounts(postIds) {
  if (!db) {
    console.error('Firebase not initialized');
    return;
  }

  try {
    // Fetch all view counts in parallel
    const countPromises = postIds.map(postId => getFirebaseViewCount(postId));
    const counts = await Promise.all(countPromises);

    // Update UI
    postIds.forEach((postId, index) => {
      const count = counts[index] || 0;
      const element = document.querySelector(`[data-post-id="${postId}"] .view-count`);
      if (element) {
        element.textContent = formatViewCount(count);
      }
    });
  } catch (error) {
    console.error('Error displaying view counts:', error);
  }
}

/**
 * Format view count with abbreviations
 */
function formatViewCount(count) {
  if (count >= 1000000) {
    return (count / 1000000).toFixed(1) + 'M';
  } else if (count >= 1000) {
    return (count / 1000).toFixed(1) + 'K';
  }
  return count.toLocaleString();
}

/**
 * Get all view counts (for admin/analytics)
 */
async function getAllViewCounts() {
  if (!db) {
    console.error('Firebase not initialized');
    return {};
  }

  try {
    const snapshot = await db.ref('viewCounts').once('value');
    return snapshot.val() || {};
  } catch (error) {
    console.error('Error getting all view counts:', error);
    return {};
  }
}

// Export functions
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    initFirebaseViewCounter,
    getFirebaseViewCount,
    incrementFirebaseViewCount,
    displayFirebaseViewCounts,
    formatViewCount,
    getAllViewCounts
  };
}
