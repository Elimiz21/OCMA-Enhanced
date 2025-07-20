const express = require('express');
const router = express.Router();
const multer = require('multer');
const fs = require('fs').promises;
const path = require('path');

// Configure multer for strategy file uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../uploads/strategies');
    try {
      await fs.mkdir(uploadPath, { recursive: true });
      cb(null, uploadPath);
    } catch (error) {
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `strategy-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.pdf', '.docx', '.doc', '.txt'];
    const ext = path.extname(file.originalname).toLowerCase();

    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, DOCX, DOC, and TXT files are allowed.'));
    }
  }
});

// Mock data storage
let strategyData = {
  strategies: [],
  analyses: {},
  generatedContent: {}
};

// Load initial data
const loadData = async () => {
  try {
    const dataPath = path.join(__dirname, '../data/strategy.json');
    try {
      const data = await fs.readFile(dataPath, 'utf8');
      strategyData = JSON.parse(data);
    } catch (error) {
      console.log('No existing strategy data found, using defaults');
    }
  } catch (error) {
    console.error('Error loading strategy data:', error);
  }
};

// Save data
const saveData = async () => {
  try {
    const dataPath = path.join(__dirname, '../data/strategy.json');
    await fs.mkdir(path.dirname(dataPath), { recursive: true });
    await fs.writeFile(dataPath, JSON.stringify(strategyData, null, 2));
  } catch (error) {
    console.error('Error saving strategy data:', error);
  }
};

// Initialize data
loadData();

// GET /api/strategy/list - Get all strategies
router.get('/list', async (req, res) => {
  try {
    res.json(strategyData.strategies);
  } catch (error) {
    console.error('Error getting strategies:', error);
    res.status(500).json({ error: 'Failed to get strategies' });
  }
});

// POST /api/strategy/upload - Upload new strategy
router.post('/upload', upload.single('strategy'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No strategy file uploaded' });
    }

    const strategy = {
      id: Date.now().toString(),
      name: req.file.originalname.replace(path.extname(req.file.originalname), ''),
      filename: req.file.filename,
      originalName: req.file.originalname,
      filePath: req.file.path,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      uploadDate: new Date().toISOString(),
      status: 'uploaded'
    };

    strategyData.strategies.push(strategy);
    await saveData();

    res.status(201).json({
      message: 'Strategy uploaded successfully',
      strategy
    });
  } catch (error) {
    console.error('Error uploading strategy:', error);
    res.status(500).json({ error: 'Failed to upload strategy' });
  }
});

// POST /api/strategy/analyze/:id - Analyze strategy
router.post('/analyze/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const strategy = strategyData.strategies.find(s => s.id === id);
    if (!strategy) {
      return res.status(404).json({ error: 'Strategy not found' });
    }

    // Simulate AI analysis (in production, integrate with OpenAI or similar)
    const analysis = {
      id: Date.now().toString(),
      strategyId: id,
      clarity_score: Math.floor(Math.random() * 30) + 70, // 70-100
      completeness_score: Math.floor(Math.random() * 25) + 75, // 75-100
      actionability_score: Math.floor(Math.random() * 20) + 80, // 80-100

      target_audience: [
        'Young professionals (25-35)',
        'Digital natives',
        'Health-conscious consumers',
        'Small business owners'
      ],

      content_pillars: [
        {
          name: 'Educational',
          description: 'Share knowledge and insights about your industry'
        },
        {
          name: 'Behind the Scenes',
          description: 'Show the human side of your brand'
        },
        {
          name: 'User Generated Content',
          description: 'Showcase customer success stories'
        },
        {
          name: 'Product Features',
          description: 'Highlight key product benefits'
        }
      ],

      key_messages: [
        'Quality and reliability are our core values',
        'Innovation drives everything we do',
        'Customer success is our success',
        'Sustainability matters for the future'
      ],

      goals: [
        'Increase brand awareness by 40%',
        'Generate 25% more qualified leads',
        'Improve customer engagement rates',
        'Build thought leadership in the industry'
      ],

      brand_voice: 'Professional yet approachable, knowledgeable but not overwhelming',

      recommendations: [
        {
          title: 'Strengthen Call-to-Actions',
          description: 'Include more specific CTAs to drive conversions',
          priority: 'high'
        },
        {
          title: 'Expand Content Variety',
          description: 'Consider adding video content and interactive posts',
          priority: 'medium'
        },
        {
          title: 'Define Success Metrics',
          description: 'Establish clear KPIs for measuring campaign success',
          priority: 'high'
        }
      ],

      analyzedAt: new Date().toISOString()
    };

    strategyData.analyses[id] = analysis;
    await saveData();

    res.json(analysis);
  } catch (error) {
    console.error('Error analyzing strategy:', error);
    res.status(500).json({ error: 'Failed to analyze strategy' });
  }
});

// GET /api/strategy/analysis/:id - Get strategy analysis
router.get('/analysis/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const analysis = strategyData.analyses[id];

    if (!analysis) {
      return res.status(404).json({ error: 'Strategy analysis not found' });
    }

    res.json(analysis);
  } catch (error) {
    console.error('Error getting analysis:', error);
    res.status(500).json({ error: 'Failed to get strategy analysis' });
  }
});

// POST /api/strategy/generate-content - Generate strategy-based content
router.post('/generate-content', async (req, res) => {
  try {
    const { strategyId, analysis, options } = req.body;

    if (!strategyId || !analysis) {
      return res.status(400).json({ error: 'Strategy ID and analysis are required' });
    }

    const { contentTypes, platforms, quantity, timeframe } = options;

    const generatedContent = [];

    // Content templates based on analysis
    const templates = {
      post: [
        "💡 {pillar}: {message} What's your experience with this? {hashtags}",
        "🌟 {insight} - Here's how we're making a difference: {example} {hashtags}",
        "📈 {statistic} Did you know this about {topic}? Share your thoughts! {hashtags}",
        "🎯 {goal} - We're committed to {action}. Join us on this journey! {hashtags}",
        "✨ {value_prop} - Why choose {brand_aspect}? {reasons} {hashtags}"
      ],

      story: [
        "Behind the scenes: {process}",
        "Quick tip: {advice}",
        "Today's focus: {priority}",
        "Team spotlight: {achievement}",
        "Customer love: {testimonial}"
      ],

      video_script: [
        "Hook: {attention_grabber}\nProblem: {pain_point}\nSolution: {our_approach}\nCall to action: {cta}",
        "Introduction: {brand_intro}\nValue proposition: {main_benefit}\nProof: {social_proof}\nNext steps: {cta}"
      ],

      blog_outline: [
        "1. Introduction to {topic}\n2. Why {problem} matters\n3. Our solution: {approach}\n4. Case study: {example}\n5. Implementation steps\n6. Conclusion and next steps",
        "1. The challenge of {industry_issue}\n2. Traditional approaches vs. innovation\n3. Our methodology\n4. Results and benefits\n5. Getting started"
      ],

      email: [
        "Subject: {compelling_subject}\n\nHi {name},\n\n{personal_intro}\n\n{value_proposition}\n\n{call_to_action}\n\nBest regards,\n{sender}"
      ]
    };

    // Generate content for each type and platform
    for (const contentType of contentTypes) {
      for (const platform of platforms) {
        for (let i = 0; i < Math.min(quantity, 5); i++) {
          const templateArray = templates[contentType] || templates.post;
          const template = templateArray[i % templateArray.length];

          const content = generateContentFromTemplate(template, analysis, platform);

          generatedContent.push({
            id: `${Date.now()}_${contentType}_${platform}_${i}`,
            type: contentType,
            platform,
            content,
            title: `${contentType} for ${platform}`,
            hashtags: generateHashtags(platform, analysis),
            quality_score: calculateQualityScore(content),
            generated_at: new Date().toISOString(),
            strategy_id: strategyId
          });
        }
      }
    }

    // Store generated content
    if (!strategyData.generatedContent[strategyId]) {
      strategyData.generatedContent[strategyId] = [];
    }
    strategyData.generatedContent[strategyId].push(...generatedContent);

    await saveData();

    res.json(generatedContent);
  } catch (error) {
    console.error('Error generating content:', error);
    res.status(500).json({ error: 'Failed to generate strategy-based content' });
  }
});

// GET /api/strategy/generated-content/:strategyId - Get generated content
router.get('/generated-content/:strategyId', async (req, res) => {
  try {
    const { strategyId } = req.params;
    const content = strategyData.generatedContent[strategyId] || [];

    res.json(content);
  } catch (error) {
    console.error('Error getting generated content:', error);
    res.status(500).json({ error: 'Failed to get generated content' });
  }
});

// DELETE /api/strategy/:id - Delete strategy
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const strategyIndex = strategyData.strategies.findIndex(s => s.id === id);
    if (strategyIndex === -1) {
      return res.status(404).json({ error: 'Strategy not found' });
    }

    const strategy = strategyData.strategies[strategyIndex];

    // Delete the file
    try {
      await fs.unlink(strategy.filePath);
    } catch (error) {
      console.warn('Could not delete strategy file:', error.message);
    }

    // Remove from data
    strategyData.strategies.splice(strategyIndex, 1);
    delete strategyData.analyses[id];
    delete strategyData.generatedContent[id];

    await saveData();

    res.json({ message: 'Strategy deleted successfully' });
  } catch (error) {
    console.error('Error deleting strategy:', error);
    res.status(500).json({ error: 'Failed to delete strategy' });
  }
});

// Helper function to generate content from template
function generateContentFromTemplate(template, analysis, platform) {
  const replacements = {
    '{pillar}': analysis.content_pillars?.[0]?.name || 'Innovation',
    '{message}': analysis.key_messages?.[0] || 'Quality is our commitment',
    '{insight}': analysis.goals?.[0] || 'Success through innovation',
    '{example}': 'delivering exceptional results for our clients',
    '{statistic}': '87% of our clients see improvement within 30 days',
    '{topic}': analysis.content_pillars?.[0]?.name?.toLowerCase() || 'our industry',
    '{goal}': analysis.goals?.[0] || 'excellence in everything we do',
    '{action}': 'providing outstanding value',
    '{value_prop}': analysis.key_messages?.[0] || 'Unmatched quality and service',
    '{brand_aspect}': 'our approach',
    '{reasons}': 'proven results, dedicated support, innovative solutions',
    '{process}': 'how we create amazing results',
    '{advice}': analysis.recommendations?.[0]?.description || 'focus on what matters most',
    '{priority}': analysis.content_pillars?.[0]?.name || 'customer success',
    '{achievement}': 'exceeding client expectations',
    '{testimonial}': 'amazing results that speak for themselves',
    '{attention_grabber}': 'Are you ready to transform your results?',
    '{pain_point}': 'the challenge you're facing',
    '{our_approach}': analysis.key_messages?.[0] || 'our proven methodology',
    '{cta}': 'Get started today!',
    '{brand_intro}': 'We're passionate about your success',
    '{main_benefit}': analysis.goals?.[0] || 'exceptional outcomes',
    '{social_proof}': '500+ satisfied clients',
    '{topic}': analysis.content_pillars?.[0]?.name || 'success strategies',
    '{problem}': 'common industry challenges',
    '{approach}': 'innovative solutions',
    '{example}': 'client success story',
    '{industry_issue}': 'market challenges',
    '{compelling_subject}': 'Transform your results today',
    '{personal_intro}': 'Hope you're having a great day!',
    '{value_proposition}': analysis.key_messages?.[0] || 'exclusive benefits',
    '{call_to_action}': 'Ready to get started? Let's talk!',
    '{name}': '[Name]',
    '{sender}': '[Your Name]'
  };

  let content = template;

  Object.entries(replacements).forEach(([placeholder, replacement]) => {
    content = content.replace(new RegExp(placeholder, 'g'), replacement);
  });

  return content;
}

// Helper function to generate platform-specific hashtags
function generateHashtags(platform, analysis) {
  const platformTags = {
    instagram: ['#instagood', '#photooftheday', '#follow', '#like4like'],
    facebook: ['#facebook', '#social', '#community', '#connect'],
    twitter: ['#twitter', '#trending', '#discussion', '#share'],
    linkedin: ['#linkedin', '#professional', '#business', '#networking'],
    tiktok: ['#fyp', '#viral', '#trending', '#creative'],
    youtube: ['#youtube', '#subscribe', '#video', '#watch']
  };

  const generalTags = ['#marketing', '#success', '#growth', '#innovation'];
  const contentTags = analysis.content_pillars?.map(pillar => 
    `#${pillar.name.toLowerCase().replace(/\s+/g, '')}`
  ) || [];

  const allTags = [
    ...generalTags,
    ...(platformTags[platform] || []),
    ...contentTags.slice(0, 2)
  ];

  return allTags.slice(0, 5).join(' ');
}

// Helper function to calculate quality score
function calculateQualityScore(content) {
  let score = 50; // Base score

  // Length optimization
  if (content.length > 100 && content.length < 500) score += 15;
  else if (content.length > 50) score += 10;

  // Engagement elements
  if (content.includes('?')) score += 10;
  if (content.includes('!')) score += 5;
  if (content.match(/#\w+/g)) score += 10;
  if (content.match(/[\u{1f300}-\u{1f5ff}]/gu)) score += 10;

  return Math.min(Math.max(score, 0), 100);
}

module.exports = router;