const { LRUCache } = require('lru-cache');

// Initialize LRU cache
const userCache = new LRUCache({
    max: 1000,
    ttl: 1000 * 60 * 60, // 1 hour
    allowStale: false,
    updateAgeOnGet: false
});

module.exports = { userCache };