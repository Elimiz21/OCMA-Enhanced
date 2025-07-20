/**
 * OCMA Enhanced Platform - Database Schema Documentation
 * 
 * This file documents the complete database structure for the enhanced OCMA platform.
 * Current implementation uses JSON file storage for development.
 * Production deployment should use MongoDB or PostgreSQL.
 */

// =============================================================================
// CONTENT MANAGEMENT SCHEMA
// =============================================================================

const ContentDraftSchema = {
  id: "string", // Unique identifier
  title: "string", // Draft title
  content: "string", // Main content text
  platform: "string", // Target platform (facebook, instagram, twitter, etc.)
  status: "string", // draft, approved, rejected, scheduled, published
  hashtags: "string", // Space-separated hashtags
  tone: "string", // professional, casual, friendly, urgent
  qualityScore: "number", // 0-100 quality assessment
  createdAt: "ISO8601 string", // Creation timestamp
  updatedAt: "ISO8601 string", // Last modification timestamp
  metadata: {
    wordCount: "number",
    characterCount: "number",
    estimatedReach: "number",
    engagementPrediction: "number"
  }
};

const CalendarEventSchema = {
  id: "string", // Unique identifier
  title: "string", // Event title
  content: "string", // Content to be published
  platform: "string", // Target platform
  scheduledDate: "YYYY-MM-DD string", // Scheduled date
  scheduledTime: "HH:MM string", // Scheduled time
  hashtags: "string", // Space-separated hashtags
  status: "string", // scheduled, published, failed
  publishedAt: "ISO8601 string", // Actual publish timestamp
  createdAt: "ISO8601 string", // Creation timestamp
  updatedAt: "ISO8601 string", // Last modification timestamp
  metadata: {
    timezone: "string",
    autoPost: "boolean",
    publishAttempts: "number"
  }
};

// =============================================================================
// STRATEGY MANAGEMENT SCHEMA
// =============================================================================

const MarketingStrategySchema = {
  id: "string", // Unique identifier
  name: "string", // Strategy name
  filename: "string", // Original filename
  originalName: "string", // User-provided filename
  filePath: "string", // Server file path
  fileSize: "number", // File size in bytes
  mimeType: "string", // File MIME type
  uploadDate: "ISO8601 string", // Upload timestamp
  status: "string", // uploaded, analyzed, active, archived
  analysis: "StrategyAnalysisSchema", // Analysis results
  metadata: {
    extractedText: "string",
    pageCount: "number",
    wordCount: "number",
    language: "string"
  }
};

const StrategyAnalysisSchema = {
  id: "string", // Unique identifier
  strategyId: "string", // Reference to strategy
  clarity_score: "number", // 0-100 clarity assessment
  completeness_score: "number", // 0-100 completeness assessment
  actionability_score: "number", // 0-100 actionability assessment
  target_audience: ["string"], // Array of target audience segments
  content_pillars: [{
    name: "string",
    description: "string",
    priority: "number" // 1-5 priority rating
  }],
  key_messages: ["string"], // Array of key brand messages
  goals: ["string"], // Array of strategic goals
  brand_voice: "string", // Brand voice description
  recommendations: [{
    title: "string",
    description: "string",
    priority: "string" // high, medium, low
  }],
  analyzedAt: "ISO8601 string", // Analysis timestamp
  confidence: "number", // 0-100 analysis confidence
  metadata: {
    analysisVersion: "string",
    processingTime: "number",
    textComplexity: "number"
  }
};

const GeneratedContentSchema = {
  id: "string", // Unique identifier
  strategyId: "string", // Reference to source strategy
  type: "string", // post, story, video_script, blog_outline, email
  platform: "string", // Target platform
  content: "string", // Generated content
  title: "string", // Content title
  hashtags: "string", // Generated hashtags
  quality_score: "number", // 0-100 quality score
  generated_at: "ISO8601 string", // Generation timestamp
  approved: "boolean", // Approval status
  approved_at: "ISO8601 string", // Approval timestamp
  approved_by: "string", // Approver ID
  metadata: {
    generationMethod: "string",
    sourceTemplate: "string",
    customizations: "object",
    performance_prediction: "number"
  }
};

// =============================================================================
// VISUAL CONTENT SCHEMA
// =============================================================================

const VisualAssetSchema = {
  id: "string", // Unique identifier
  type: "string", // image, video
  filename: "string", // Server filename
  originalName: "string", // Original filename
  url: "string", // Public access URL
  thumbnail: "string", // Thumbnail URL
  fileSize: "number", // File size in bytes
  category: "string", // generated, uploaded, customized
  description: "string", // Asset description
  tags: ["string"], // Array of tags
  createdAt: "ISO8601 string", // Creation timestamp
  metadata: {
    dimensions: "string", // e.g., "1920x1080"
    duration: "number", // For videos, in seconds
    format: "string", // File format
    generationType: "string", // ai-generated, user-uploaded, template-customized
    prompt: "string", // Original generation prompt
    style: "string", // Generation style
    processing_status: "string" // pending, completed, failed
  }
};

const TemplateSchema = {
  id: "number", // Unique identifier
  name: "string", // Template name
  type: "string", // image, video
  size: "string", // Dimensions (e.g., "1080x1080")
  category: "string", // social, blog, product, etc.
  thumbnail: "string", // Thumbnail URL
  description: "string", // Template description
  customizable_elements: [{
    name: "string",
    type: "string", // text, color, image, position
    default_value: "string",
    options: ["string"] // Available options
  }],
  popularity: "number", // Usage count
  createdAt: "ISO8601 string",
  updatedAt: "ISO8601 string"
};

// =============================================================================
// USER MANAGEMENT SCHEMA
// =============================================================================

const UserSchema = {
  id: "string", // Unique identifier
  email: "string", // User email
  username: "string", // Username
  firstName: "string", // First name
  lastName: "string", // Last name
  role: "string", // admin, manager, creator, viewer
  status: "string", // active, inactive, pending
  preferences: {
    defaultPlatforms: ["string"],
    favoriteTemplates: ["number"],
    contentTone: "string",
    timezone: "string",
    notifications: {
      email: "boolean",
      inApp: "boolean",
      scheduling: "boolean",
      approvals: "boolean"
    }
  },
  createdAt: "ISO8601 string",
  lastLoginAt: "ISO8601 string",
  metadata: {
    loginCount: "number",
    contentCreated: "number",
    lastActivity: "ISO8601 string"
  }
};

// =============================================================================
// PLATFORM INTEGRATION SCHEMA
// =============================================================================

const PlatformIntegrationSchema = {
  id: "string", // Unique identifier
  userId: "string", // User who created the integration
  platform: "string", // facebook, instagram, twitter, linkedin, etc.
  accountName: "string", // Platform account name/handle
  accountId: "string", // Platform account ID
  status: "string", // active, inactive, error, pending
  permissions: ["string"], // Array of granted permissions
  credentials: {
    accessToken: "string", // Encrypted access token
    refreshToken: "string", // Encrypted refresh token
    expiresAt: "ISO8601 string", // Token expiration
    tokenType: "string" // bearer, oauth2, etc.
  },
  lastSyncAt: "ISO8601 string", // Last synchronization
  createdAt: "ISO8601 string",
  updatedAt: "ISO8601 string",
  metadata: {
    platformVersion: "string",
    syncErrors: "number",
    lastError: "string",
    rateLimitStatus: "object"
  }
};

// =============================================================================
// ANALYTICS SCHEMA
// =============================================================================

const ContentAnalyticsSchema = {
  id: "string", // Unique identifier
  contentId: "string", // Reference to content (draft or calendar event)
  platform: "string", // Platform where content was published
  publishedAt: "ISO8601 string", // Publication timestamp
  metrics: {
    impressions: "number",
    reach: "number",
    engagement: "number",
    likes: "number",
    shares: "number",
    comments: "number",
    clicks: "number",
    saves: "number"
  },
  demographics: {
    ageGroups: "object", // Age distribution
    genderDistribution: "object",
    locationData: "object",
    deviceTypes: "object"
  },
  performance: {
    engagementRate: "number", // Percentage
    clickThroughRate: "number", // Percentage
    conversionRate: "number", // Percentage
    costPerEngagement: "number", // If paid promotion
    roi: "number" // Return on investment
  },
  recordedAt: "ISO8601 string", // When metrics were recorded
  metadata: {
    dataSource: "string", // API, manual, estimated
    confidence: "number", // Data confidence level
    lastUpdated: "ISO8601 string"
  }
};

// =============================================================================
// DATABASE INDEXES (for production MongoDB/PostgreSQL)
// =============================================================================

const DatabaseIndexes = {
  ContentDrafts: [
    { fields: ["status"], background: true },
    { fields: ["platform"], background: true },
    { fields: ["createdAt"], background: true },
    { fields: ["qualityScore"], background: true }
  ],
  CalendarEvents: [
    { fields: ["scheduledDate", "scheduledTime"], background: true },
    { fields: ["platform"], background: true },
    { fields: ["status"], background: true }
  ],
  MarketingStrategies: [
    { fields: ["uploadDate"], background: true },
    { fields: ["status"], background: true }
  ],
  VisualAssets: [
    { fields: ["type"], background: true },
    { fields: ["category"], background: true },
    { fields: ["createdAt"], background: true }
  ],
  Users: [
    { fields: ["email"], unique: true, background: true },
    { fields: ["username"], unique: true, background: true }
  ],
  ContentAnalytics: [
    { fields: ["contentId"], background: true },
    { fields: ["platform"], background: true },
    { fields: ["publishedAt"], background: true }
  ]
};

// =============================================================================
// DATA RELATIONSHIPS
// =============================================================================

const Relationships = {
  "ContentDrafts -> CalendarEvents": "One draft can become one calendar event",
  "MarketingStrategies -> GeneratedContent": "One strategy can generate many content pieces", 
  "Users -> ContentDrafts": "One user can create many drafts",
  "Users -> PlatformIntegrations": "One user can have multiple platform integrations",
  "ContentDrafts -> ContentAnalytics": "One content piece can have multiple analytics records",
  "VisualAssets -> ContentDrafts": "Visual assets can be attached to content drafts",
  "Templates -> VisualAssets": "Templates can be used to create visual assets"
};

// =============================================================================
// EXPORT FOR DOCUMENTATION
// =============================================================================

module.exports = {
  ContentDraftSchema,
  CalendarEventSchema,
  MarketingStrategySchema,
  StrategyAnalysisSchema,
  GeneratedContentSchema,
  VisualAssetSchema,
  TemplateSchema,
  UserSchema,
  PlatformIntegrationSchema,
  ContentAnalyticsSchema,
  DatabaseIndexes,
  Relationships
};