/**
 * Simple caching utility using localStorage
 */

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const cache = {
  set: (key, data) => {
    try {
      const item = {
        data,
        timestamp: Date.now()
      };
      localStorage.setItem(key, JSON.stringify(item));
    } catch (e) {
      console.warn('Failed to cache data:', e);
    }
  },

  get: (key) => {
    try {
      const item = localStorage.getItem(key);
      if (!item) return null;

      const parsed = JSON.parse(item);
      const age = Date.now() - parsed.timestamp;

      // Check if cache is expired
      if (age > CACHE_DURATION) {
        localStorage.removeItem(key);
        return null;
      }

      return parsed.data;
    } catch (e) {
      console.warn('Failed to retrieve cached data:', e);
      return null;
    }
  },

  clear: (key) => {
    try {
      if (key) {
        localStorage.removeItem(key);
      } else {
        // Clear all nova cache keys
        const keys = Object.keys(localStorage);
        keys.forEach(k => {
          if (k.startsWith('nova_')) {
            localStorage.removeItem(k);
          }
        });
      }
    } catch (e) {
      console.warn('Failed to clear cache:', e);
    }
  }
};

