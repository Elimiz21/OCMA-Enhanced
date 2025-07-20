// Enhanced Content Management Utilities

/**
 * Format date for display
 */
export const formatDate = (date, format = 'YYYY-MM-DD HH:mm') => {
  return new Date(date).toLocaleDateString();
};

/**
 * Calculate content quality score
 */
export const calculateQualityScore = (content) => {
  let score = 0;

  // Length check (20 points)
  if (content.length > 50 && content.length < 300) score += 20;
  else if (content.length >= 300) score += 15;
  else if (content.length > 20) score += 10;

  // Hashtag presence (15 points)
  const hashtagCount = (content.match(/#\w+/g) || []).length;
  if (hashtagCount > 0) score += Math.min(hashtagCount * 5, 15);

  // Call to action (20 points)
  const ctas = ['click', 'learn', 'discover', 'visit', 'follow', 'share', 'subscribe', 'download'];
  const ctaFound = ctas.some(cta => content.toLowerCase().includes(cta));
  if (ctaFound) score += 20;

  // Emoji presence (10 points)
  const emojiRegex = /[\u{1f300}-\u{1f5ff}\u{1f900}-\u{1f9ff}\u{1f600}-\u{1f64f}\u{1f680}-\u{1f6ff}\u{2600}-\u{26ff}\u{2700}-\u{27bf}]/gu;
  if (emojiRegex.test(content)) score += 10;

  // Question presence (10 points)
  if (content.includes('?')) score += 10;

  // Exclamation presence (5 points)
  if (content.includes('!')) score += 5;

  // Numbers/statistics (10 points)
  const numberRegex = /\d+(%|\+|x|times)/i;
  if (numberRegex.test(content)) score += 10;

  // URL presence (10 points)
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  if (urlRegex.test(content)) score += 10;

  return Math.min(score, 100);
};

/**
 * Generate platform-specific hashtags
 */
export const generateHashtags = (content, platform, count = 5) => {
  const commonTags = {
    general: ['#marketing', '#socialmedia', '#content', '#digital', '#brand'],
    instagram: ['#insta', '#instagood', '#photooftheday', '#follow', '#like'],
    twitter: ['#tweet', '#trending', '#news', '#discussion', '#share'],
    linkedin: ['#professional', '#business', '#networking', '#career', '#industry'],
    facebook: ['#facebook', '#community', '#share', '#connect', '#social'],
    tiktok: ['#viral', '#trending', '#fyp', '#challenge', '#creative'],
    youtube: ['#youtube', '#video', '#subscribe', '#watch', '#creator']
  };

  const platformTags = commonTags[platform] || commonTags.general;
  return platformTags.slice(0, count).join(' ');
};

/**
 * Optimize content for platform
 */
export const optimizeForPlatform = (content, platform) => {
  const platformLimits = {
    twitter: 280,
    instagram: 2200,
    facebook: 63206,
    linkedin: 3000,
    tiktok: 150,
    youtube: 5000
  };

  const limit = platformLimits[platform];

  if (limit && content.length > limit) {
    return content.substring(0, limit - 3) + '...';
  }

  return content;
};

/**
 * Extract keywords from content
 */
export const extractKeywords = (content, count = 10) => {
  const words = content.toLowerCase()
    .replace(/[^a-zA-Z\s]/g, '')
    .split(/\s+/)
    .filter(word => word.length > 3);

  const wordCount = {};
  words.forEach(word => {
    wordCount[word] = (wordCount[word] || 0) + 1;
  });

  return Object.entries(wordCount)
    .sort(([,a], [,b]) => b - a)
    .slice(0, count)
    .map(([word]) => word);
};

/**
 * Generate optimal posting times
 */
export const getOptimalPostingTimes = (platform, timezone = 'UTC') => {
  const times = {
    instagram: ['9:00', '11:00', '13:00', '17:00', '19:00'],
    facebook: ['9:00', '13:00', '15:00', '20:00', '21:00'],
    twitter: ['8:00', '12:00', '17:00', '19:00', '20:00'],
    linkedin: ['7:00', '8:00', '12:00', '17:00', '18:00'],
    tiktok: ['6:00', '10:00', '19:00', '20:00', '21:00'],
    youtube: ['14:00', '15:00', '20:00', '21:00', '22:00']
  };

  return times[platform] || times.instagram;
};

/**
 * Validate content requirements
 */
export const validateContent = (content, platform) => {
  const errors = [];

  if (!content || content.trim().length === 0) {
    errors.push('Content cannot be empty');
  }

  if (content.length < 10) {
    errors.push('Content is too short (minimum 10 characters)');
  }

  const platformLimits = {
    twitter: 280,
    instagram: 2200,
    facebook: 63206,
    linkedin: 3000,
    tiktok: 150,
    youtube: 5000
  };

  const limit = platformLimits[platform];
  if (limit && content.length > limit) {
    errors.push(`Content exceeds ${platform} limit of ${limit} characters`);
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Format file size
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Color utility functions
 */
export const getContrastColor = (hexColor) => {
  // Convert hex to RGB
  const r = parseInt(hexColor.slice(1, 3), 16);
  const g = parseInt(hexColor.slice(3, 5), 16);
  const b = parseInt(hexColor.slice(5, 7), 16);

  // Calculate relative luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

  return luminance > 0.5 ? '#000000' : '#ffffff';
};

/**
 * Debounce function for search inputs
 */
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * API error handler
 */
export const handleApiError = (error, fallbackMessage = 'An error occurred') => {
  console.error('API Error:', error);

  if (error.response) {
    return error.response.data.message || fallbackMessage;
  } else if (error.request) {
    return 'Network error - please check your connection';
  } else {
    return error.message || fallbackMessage;
  }
};

/**
 * Local storage utilities
 */
export const storage = {
  set: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.warn('LocalStorage not available:', error);
    }
  },

  get: (key, defaultValue = null) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.warn('LocalStorage read error:', error);
      return defaultValue;
    }
  },

  remove: (key) => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.warn('LocalStorage remove error:', error);
    }
  }
};

/**
 * Content performance predictor
 */
export const predictPerformance = (content, platform, audience) => {
  let score = 50; // Base score

  // Length optimization
  const optimalLengths = {
    twitter: [100, 200],
    instagram: [300, 500],
    facebook: [200, 400],
    linkedin: [400, 600],
    tiktok: [50, 100],
    youtube: [500, 1000]
  };

  const [min, max] = optimalLengths[platform] || [100, 300];
  if (content.length >= min && content.length <= max) {
    score += 15;
  }

  // Engagement elements
  if (content.includes('?')) score += 10; // Questions drive engagement
  if (content.match(/[\u{1f300}-\u{1f5ff}]/gu)) score += 8; // Emojis
  if (content.match(/#\w+/g)) score += 7; // Hashtags
  if (content.includes('!')) score += 5; // Excitement

  // Platform-specific optimization
  if (platform === 'instagram' && content.includes('#')) score += 10;
  if (platform === 'twitter' && content.length <= 200) score += 10;
  if (platform === 'linkedin' && content.includes('professional')) score += 8;

  return Math.min(Math.max(score, 0), 100);
};

/**
 * Content scheduler utilities
 */
export const scheduler = {
  getNextWeekDays: () => {
    const days = [];
    const today = new Date();

    for (let i = 1; i <= 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      days.push({
        date: date.toISOString().split('T')[0],
        dayName: date.toLocaleDateString('en-US', { weekday: 'long' })
      });
    }

    return days;
  },

  isOptimalTime: (platform, hour, dayOfWeek) => {
    const optimalTimes = {
      instagram: {
        weekday: [9, 11, 13, 17, 19],
        weekend: [10, 12, 14, 16, 18]
      },
      facebook: {
        weekday: [9, 13, 15, 20, 21],
        weekend: [12, 13, 14, 15, 16]
      },
      twitter: {
        weekday: [8, 12, 17, 19, 20],
        weekend: [9, 10, 11, 19, 20]
      },
      linkedin: {
        weekday: [7, 8, 12, 17, 18],
        weekend: [10, 11, 12, 13, 14]
      }
    };

    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const timeSlot = isWeekend ? 'weekend' : 'weekday';
    const platformTimes = optimalTimes[platform];

    return platformTimes && platformTimes[timeSlot].includes(hour);
  }
};

export default {
  formatDate,
  calculateQualityScore,
  generateHashtags,
  optimizeForPlatform,
  extractKeywords,
  getOptimalPostingTimes,
  validateContent,
  formatFileSize,
  getContrastColor,
  debounce,
  handleApiError,
  storage,
  predictPerformance,
  scheduler
};