const express = require('express');
const router = express.Router();
const fs = require('fs').promises;
const path = require('path');

// Mock data storage (in production, use a proper database)
let contentData = {
  drafts: [],
  calendar: [],
  stats: {
    totalDrafts: 0,
    publishedPosts: 0,
    scheduledPosts: 0,
    generatedImages: 0
  }
};

// Load initial data
const loadData = async () => {
  try {
    const dataPath = path.join(__dirname, '../data/content.json');
    try {
      const data = await fs.readFile(dataPath, 'utf8');
      contentData = JSON.parse(data);
    } catch (error) {
      // File doesn't exist, use default data
      console.log('No existing content data found, using defaults');
    }
  } catch (error) {
    console.error('Error loading content data:', error);
  }
};

// Save data
const saveData = async () => {
  try {
    const dataPath = path.join(__dirname, '../data/content.json');
    await fs.mkdir(path.dirname(dataPath), { recursive: true });
    await fs.writeFile(dataPath, JSON.stringify(contentData, null, 2));
  } catch (error) {
    console.error('Error saving content data:', error);
  }
};

// Initialize data
loadData();

// GET /api/content/stats - Get content statistics
router.get('/stats', async (req, res) => {
  try {
    const stats = {
      totalDrafts: contentData.drafts.length,
      publishedPosts: contentData.drafts.filter(d => d.status === 'published').length,
      scheduledPosts: contentData.calendar.length,
      generatedImages: contentData.stats.generatedImages || 0
    };

    res.json(stats);
  } catch (error) {
    console.error('Error getting stats:', error);
    res.status(500).json({ error: 'Failed to get statistics' });
  }
});

// GET /api/content/drafts - Get all drafts
router.get('/drafts', async (req, res) => {
  try {
    const { status, search, sort = 'created_desc', page = 1, limit = 50 } = req.query;

    let filteredDrafts = [...contentData.drafts];

    // Filter by status
    if (status && status !== 'all') {
      filteredDrafts = filteredDrafts.filter(draft => draft.status === status);
    }

    // Filter by search term
    if (search) {
      const searchLower = search.toLowerCase();
      filteredDrafts = filteredDrafts.filter(draft => 
        (draft.title && draft.title.toLowerCase().includes(searchLower)) ||
        (draft.content && draft.content.toLowerCase().includes(searchLower))
      );
    }

    // Sort drafts
    filteredDrafts.sort((a, b) => {
      switch (sort) {
        case 'created_desc':
          return new Date(b.createdAt) - new Date(a.createdAt);
        case 'created_asc':
          return new Date(a.createdAt) - new Date(b.createdAt);
        case 'quality_desc':
          return (b.qualityScore || 0) - (a.qualityScore || 0);
        case 'title_asc':
          return (a.title || '').localeCompare(b.title || '');
        default:
          return 0;
      }
    });

    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedDrafts = filteredDrafts.slice(startIndex, endIndex);

    res.json({
      drafts: paginatedDrafts,
      total: filteredDrafts.length,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(filteredDrafts.length / limit)
    });
  } catch (error) {
    console.error('Error getting drafts:', error);
    res.status(500).json({ error: 'Failed to get drafts' });
  }
});

// POST /api/content/drafts - Create new draft
router.post('/drafts', async (req, res) => {
  try {
    const { title, content, platform, status = 'draft', hashtags, tone } = req.body;

    if (!content) {
      return res.status(400).json({ error: 'Content is required' });
    }

    const newDraft = {
      id: Date.now().toString(),
      title: title || `Draft ${contentData.drafts.length + 1}`,
      content,
      platform,
      status,
      hashtags,
      tone,
      qualityScore: calculateQualityScore(content),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    contentData.drafts.push(newDraft);
    await saveData();

    res.status(201).json(newDraft);
  } catch (error) {
    console.error('Error creating draft:', error);
    res.status(500).json({ error: 'Failed to create draft' });
  }
});

// PUT /api/content/drafts/:id - Update draft
router.put('/drafts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const draftIndex = contentData.drafts.findIndex(draft => draft.id === id);

    if (draftIndex === -1) {
      return res.status(404).json({ error: 'Draft not found' });
    }

    contentData.drafts[draftIndex] = {
      ...contentData.drafts[draftIndex],
      ...updates,
      qualityScore: updates.content ? calculateQualityScore(updates.content) : contentData.drafts[draftIndex].qualityScore,
      updatedAt: new Date().toISOString()
    };

    await saveData();
    res.json(contentData.drafts[draftIndex]);
  } catch (error) {
    console.error('Error updating draft:', error);
    res.status(500).json({ error: 'Failed to update draft' });
  }
});

// PATCH /api/content/drafts/:id/status - Update draft status
router.patch('/drafts/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const draftIndex = contentData.drafts.findIndex(draft => draft.id === id);

    if (draftIndex === -1) {
      return res.status(404).json({ error: 'Draft not found' });
    }

    contentData.drafts[draftIndex].status = status;
    contentData.drafts[draftIndex].updatedAt = new Date().toISOString();

    await saveData();
    res.json(contentData.drafts[draftIndex]);
  } catch (error) {
    console.error('Error updating draft status:', error);
    res.status(500).json({ error: 'Failed to update draft status' });
  }
});

// DELETE /api/content/drafts/:id - Delete draft
router.delete('/drafts/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const draftIndex = contentData.drafts.findIndex(draft => draft.id === id);

    if (draftIndex === -1) {
      return res.status(404).json({ error: 'Draft not found' });
    }

    contentData.drafts.splice(draftIndex, 1);
    await saveData();

    res.json({ message: 'Draft deleted successfully' });
  } catch (error) {
    console.error('Error deleting draft:', error);
    res.status(500).json({ error: 'Failed to delete draft' });
  }
});

// GET /api/content/calendar - Get calendar events
router.get('/calendar', async (req, res) => {
  try {
    res.json(contentData.calendar);
  } catch (error) {
    console.error('Error getting calendar events:', error);
    res.status(500).json({ error: 'Failed to get calendar events' });
  }
});

// POST /api/content/calendar - Create calendar event
router.post('/calendar', async (req, res) => {
  try {
    const { title, content, platform, scheduledDate, scheduledTime, hashtags } = req.body;

    if (!title || !content || !scheduledDate) {
      return res.status(400).json({ error: 'Title, content, and scheduled date are required' });
    }

    const newEvent = {
      id: Date.now().toString(),
      title,
      content,
      platform,
      scheduledDate,
      scheduledTime,
      hashtags,
      status: 'scheduled',
      createdAt: new Date().toISOString()
    };

    contentData.calendar.push(newEvent);
    await saveData();

    res.status(201).json(newEvent);
  } catch (error) {
    console.error('Error creating calendar event:', error);
    res.status(500).json({ error: 'Failed to create calendar event' });
  }
});

// PUT /api/content/calendar/:id - Update calendar event
router.put('/calendar/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const eventIndex = contentData.calendar.findIndex(event => event.id === id);

    if (eventIndex === -1) {
      return res.status(404).json({ error: 'Calendar event not found' });
    }

    contentData.calendar[eventIndex] = {
      ...contentData.calendar[eventIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    await saveData();
    res.json(contentData.calendar[eventIndex]);
  } catch (error) {
    console.error('Error updating calendar event:', error);
    res.status(500).json({ error: 'Failed to update calendar event' });
  }
});

// DELETE /api/content/calendar/:id - Delete calendar event
router.delete('/calendar/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const eventIndex = contentData.calendar.findIndex(event => event.id === id);

    if (eventIndex === -1) {
      return res.status(404).json({ error: 'Calendar event not found' });
    }

    contentData.calendar.splice(eventIndex, 1);
    await saveData();

    res.json({ message: 'Calendar event deleted successfully' });
  } catch (error) {
    console.error('Error deleting calendar event:', error);
    res.status(500).json({ error: 'Failed to delete calendar event' });
  }
});

// POST /api/content/bulk-generate - Bulk generate content
router.post('/bulk-generate', async (req, res) => {
  try {
    const { startDate, days = 7, platforms = ['facebook', 'instagram'] } = req.body;

    const generatedEvents = [];
    const contentTemplates = [
      "🌟 Monday Motivation: {topic} #MondayMotivation #Inspiration",
      "📝 Tip Tuesday: Did you know {tip}? #TipTuesday #Knowledge", 
      "💡 Wisdom Wednesday: {quote} #WisdomWednesday #Success",
      "🎯 Thursday Thoughts: {insight} #ThursdayThoughts #Growth",
      "🎉 Friday Feature: Celebrating {achievement} #FridayFeature #Celebration"
    ];

    for (let i = 0; i < days; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);

      for (const platform of platforms) {
        const template = contentTemplates[i % contentTemplates.length];
        const content = template
          .replace('{topic}', 'your success journey')
          .replace('{tip}', 'consistency beats perfection')
          .replace('{quote}', 'Success is a journey, not a destination')
          .replace('{insight}', 'small steps lead to big changes')
          .replace('{achievement}', 'another milestone reached');

        const event = {
          id: `${Date.now()}_${i}_${platform}`,
          title: `Auto-generated ${platform} post`,
          content,
          platform,
          scheduledDate: date.toISOString().split('T')[0],
          scheduledTime: '09:00',
          status: 'scheduled',
          createdAt: new Date().toISOString()
        };

        generatedEvents.push(event);
      }
    }

    contentData.calendar.push(...generatedEvents);
    await saveData();

    res.json({
      message: `Generated ${generatedEvents.length} calendar events`,
      events: generatedEvents
    });
  } catch (error) {
    console.error('Error bulk generating content:', error);
    res.status(500).json({ error: 'Failed to bulk generate content' });
  }
});

// POST /api/content/regenerate - Regenerate content
router.post('/regenerate', async (req, res) => {
  try {
    const { originalContent, platform, tone = 'professional' } = req.body;

    // Simulate AI regeneration with variations
    const variations = [
      `🚀 ${originalContent.replace(/[.!?]$/, '')} - let's make it happen! #Success #Growth`,
      `💡 Here's a fresh perspective: ${originalContent.toLowerCase()} #Innovation #Ideas`,
      `✨ Transform your approach: ${originalContent} What's your next step? #Transformation #Action`,
      `🎯 Focus on this: ${originalContent.replace(/^[^a-zA-Z]*/, '')} #Focus #Results`
    ];

    const regenerated = variations[Math.floor(Math.random() * variations.length)];

    res.json({
      content: regenerated,
      title: `Regenerated ${platform} content`,
      qualityScore: calculateQualityScore(regenerated)
    });
  } catch (error) {
    console.error('Error regenerating content:', error);
    res.status(500).json({ error: 'Failed to regenerate content' });
  }
});

// Utility function to calculate quality score
function calculateQualityScore(content) {
  let score = 0;

  // Length check (20 points)
  if (content.length > 50 && content.length < 300) score += 20;
  else if (content.length >= 300) score += 15;
  else if (content.length > 20) score += 10;

  // Hashtag presence (15 points)
  const hashtagCount = (content.match(/#\w+/g) || []).length;
  if (hashtagCount > 0) score += Math.min(hashtagCount * 5, 15);

  // Emoji presence (10 points)
  if (/[\u{1f300}-\u{1f5ff}\u{1f900}-\u{1f9ff}\u{1f600}-\u{1f64f}\u{1f680}-\u{1f6ff}\u{2600}-\u{26ff}\u{2700}-\u{27bf}]/u.test(content)) {
    score += 10;
  }

  // Call to action (20 points)
  const ctas = ['click', 'learn', 'discover', 'visit', 'follow', 'share', 'subscribe', 'download'];
  if (ctas.some(cta => content.toLowerCase().includes(cta))) score += 20;

  // Question presence (10 points)
  if (content.includes('?')) score += 10;

  // Exclamation presence (5 points)
  if (content.includes('!')) score += 5;

  return Math.min(score, 100);
}

module.exports = router;