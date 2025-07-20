const express = require('express');
const router = express.Router();
const multer = require('multer');
const fs = require('fs').promises;
const path = require('path');

// Configure multer for visual assets
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../uploads/visuals');
    try {
      await fs.mkdir(uploadPath, { recursive: true });
      cb(null, uploadPath);
    } catch (error) {
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `visual-${uniqueSuffix}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB limit for visual content
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.jpg', '.jpeg', '.png', '.gif', '.mp4', '.mov', '.avi'];
    const ext = path.extname(file.originalname).toLowerCase();

    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only image and video files are allowed.'));
    }
  }
});

// Mock data storage for visual assets
let visualData = {
  assets: [],
  templates: [
    {
      id: 1,
      name: 'Social Media Post',
      type: 'image',
      size: '1080x1080',
      category: 'social',
      thumbnail: '/api/visual/template-thumbnail/1',
      description: 'Perfect square format for Instagram and Facebook posts'
    },
    {
      id: 2,
      name: 'Instagram Story',
      type: 'image',
      size: '1080x1920',
      category: 'social',
      thumbnail: '/api/visual/template-thumbnail/2',
      description: 'Vertical format optimized for Instagram and Facebook stories'
    },
    {
      id: 3,
      name: 'Blog Header',
      type: 'image',
      size: '1200x600',
      category: 'blog',
      thumbnail: '/api/visual/template-thumbnail/3',
      description: 'Wide format perfect for blog headers and website banners'
    },
    {
      id: 4,
      name: 'Product Showcase',
      type: 'video',
      duration: 15,
      category: 'product',
      thumbnail: '/api/visual/template-thumbnail/4',
      description: 'Short video template for product demonstrations'
    }
  ]
};

// Load initial data
const loadData = async () => {
  try {
    const dataPath = path.join(__dirname, '../data/visual.json');
    try {
      const data = await fs.readFile(dataPath, 'utf8');
      visualData = { ...visualData, ...JSON.parse(data) };
    } catch (error) {
      console.log('No existing visual data found, using defaults');
    }
  } catch (error) {
    console.error('Error loading visual data:', error);
  }
};

// Save data
const saveData = async () => {
  try {
    const dataPath = path.join(__dirname, '../data/visual.json');
    await fs.mkdir(path.dirname(dataPath), { recursive: true });
    await fs.writeFile(dataPath, JSON.stringify(visualData, null, 2));
  } catch (error) {
    console.error('Error saving visual data:', error);
  }
};

// Initialize data
loadData();

// GET /api/visual/assets - Get all visual assets
router.get('/assets', async (req, res) => {
  try {
    const { type, category, page = 1, limit = 20 } = req.query;

    let filteredAssets = [...visualData.assets];

    // Filter by type
    if (type && type !== 'all') {
      filteredAssets = filteredAssets.filter(asset => asset.type === type);
    }

    // Filter by category
    if (category && category !== 'all') {
      filteredAssets = filteredAssets.filter(asset => asset.category === category);
    }

    // Sort by creation date (newest first)
    filteredAssets.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedAssets = filteredAssets.slice(startIndex, endIndex);

    res.json({
      assets: paginatedAssets,
      total: filteredAssets.length,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(filteredAssets.length / limit)
    });
  } catch (error) {
    console.error('Error getting visual assets:', error);
    res.status(500).json({ error: 'Failed to get visual assets' });
  }
});

// GET /api/visual/templates - Get all templates
router.get('/templates', async (req, res) => {
  try {
    const { type, category } = req.query;

    let filteredTemplates = [...visualData.templates];

    if (type && type !== 'all') {
      filteredTemplates = filteredTemplates.filter(template => template.type === type);
    }

    if (category && category !== 'all') {
      filteredTemplates = filteredTemplates.filter(template => template.category === category);
    }

    res.json(filteredTemplates);
  } catch (error) {
    console.error('Error getting templates:', error);
    res.status(500).json({ error: 'Failed to get templates' });
  }
});

// POST /api/visual/generate-image - Generate AI image
router.post('/generate-image', async (req, res) => {
  try {
    const { prompt, style = 'realistic', size = '1024x1024', quantity = 1 } = req.body;

    if (!prompt || prompt.trim().length === 0) {
      return res.status(400).json({ error: 'Prompt is required for image generation' });
    }

    // Simulate AI image generation (in production, integrate with OpenAI DALL-E, Midjourney, or Stable Diffusion)
    const generatedImages = [];

    for (let i = 0; i < Math.min(quantity, 4); i++) {
      // Create a placeholder image data
      const imageId = `img-${Date.now()}-${i}`;
      const filename = `generated-${imageId}.png`;
      const filePath = path.join(__dirname, '../uploads/visuals', filename);

      // In production, this would be the actual generated image from AI service
      const placeholderImage = await generatePlaceholderImage(prompt, style, size);
      await fs.writeFile(filePath, placeholderImage);

      const asset = {
        id: imageId,
        type: 'image',
        filename,
        originalPrompt: prompt,
        style,
        size,
        url: `/uploads/visuals/${filename}`,
        thumbnail: `/uploads/visuals/${filename}`,
        fileSize: placeholderImage.length,
        category: 'generated',
        createdAt: new Date().toISOString(),
        metadata: {
          prompt,
          style,
          size,
          generationType: 'ai-generated'
        }
      };

      visualData.assets.push(asset);
      generatedImages.push(asset);
    }

    await saveData();

    res.json({
      message: `Generated ${generatedImages.length} image(s) successfully`,
      images: generatedImages
    });
  } catch (error) {
    console.error('Error generating image:', error);
    res.status(500).json({ error: 'Failed to generate image' });
  }
});

// POST /api/visual/generate-video - Generate AI video
router.post('/generate-video', async (req, res) => {
  try {
    const { script, style = 'animated', duration = 30, voiceover = 'female' } = req.body;

    if (!script || script.trim().length === 0) {
      return res.status(400).json({ error: 'Script is required for video generation' });
    }

    // Simulate AI video generation (in production, integrate with services like Synthesia, Lumen5, or Runway)
    const videoId = `vid-${Date.now()}`;
    const filename = `generated-${videoId}.mp4`;
    const filePath = path.join(__dirname, '../uploads/visuals', filename);
    const thumbnailFilename = `thumbnail-${videoId}.jpg`;
    const thumbnailPath = path.join(__dirname, '../uploads/visuals', thumbnailFilename);

    // Create placeholder video and thumbnail
    const placeholderVideo = await generatePlaceholderVideo(script, style, duration);
    const placeholderThumbnail = await generatePlaceholderImage(`Video thumbnail: ${script.substring(0, 50)}`, 'realistic', '1920x1080');

    await fs.writeFile(filePath, placeholderVideo);
    await fs.writeFile(thumbnailPath, placeholderThumbnail);

    const asset = {
      id: videoId,
      type: 'video',
      filename,
      originalScript: script,
      style,
      duration,
      voiceover,
      url: `/uploads/visuals/${filename}`,
      thumbnail: `/uploads/visuals/${thumbnailFilename}`,
      fileSize: placeholderVideo.length,
      category: 'generated',
      createdAt: new Date().toISOString(),
      metadata: {
        script,
        style,
        duration,
        voiceover,
        generationType: 'ai-generated'
      }
    };

    visualData.assets.push(asset);
    await saveData();

    res.json({
      message: 'Video generated successfully',
      video: asset
    });
  } catch (error) {
    console.error('Error generating video:', error);
    res.status(500).json({ error: 'Failed to generate video' });
  }
});

// POST /api/visual/customize-template - Customize template
router.post('/customize-template', async (req, res) => {
  try {
    const { templateId, customization } = req.body;

    const template = visualData.templates.find(t => t.id === parseInt(templateId));
    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }

    // Generate customized asset based on template
    const assetId = `custom-${Date.now()}`;
    const filename = `customized-${assetId}.${template.type === 'video' ? 'mp4' : 'png'}`;
    const filePath = path.join(__dirname, '../uploads/visuals', filename);

    // Create customized content based on template and customization options
    const customContent = await generateCustomizedContent(template, customization);
    await fs.writeFile(filePath, customContent);

    const asset = {
      id: assetId,
      type: template.type,
      filename,
      templateId: template.id,
      templateName: template.name,
      url: `/uploads/visuals/${filename}`,
      thumbnail: `/uploads/visuals/${filename}`,
      fileSize: customContent.length,
      category: 'customized',
      customization,
      createdAt: new Date().toISOString(),
      metadata: {
        baseTemplate: template.name,
        customization,
        generationType: 'template-customized'
      }
    };

    visualData.assets.push(asset);
    await saveData();

    res.json({
      message: 'Template customized successfully',
      asset
    });
  } catch (error) {
    console.error('Error customizing template:', error);
    res.status(500).json({ error: 'Failed to customize template' });
  }
});

// POST /api/visual/upload - Upload custom visual asset
router.post('/upload', upload.single('visual'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No visual file uploaded' });
    }

    const { category = 'uploaded', description = '' } = req.body;

    const asset = {
      id: Date.now().toString(),
      type: req.file.mimetype.startsWith('video/') ? 'video' : 'image',
      filename: req.file.filename,
      originalName: req.file.originalname,
      url: `/uploads/visuals/${req.file.filename}`,
      thumbnail: `/uploads/visuals/${req.file.filename}`, // For images, same as URL
      fileSize: req.file.size,
      category,
      description,
      createdAt: new Date().toISOString(),
      metadata: {
        generationType: 'user-uploaded',
        originalFilename: req.file.originalname
      }
    };

    visualData.assets.push(asset);
    await saveData();

    res.status(201).json({
      message: 'Visual asset uploaded successfully',
      asset
    });
  } catch (error) {
    console.error('Error uploading visual asset:', error);
    res.status(500).json({ error: 'Failed to upload visual asset' });
  }
});

// DELETE /api/visual/assets/:id - Delete visual asset
router.delete('/assets/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const assetIndex = visualData.assets.findIndex(asset => asset.id === id);
    if (assetIndex === -1) {
      return res.status(404).json({ error: 'Visual asset not found' });
    }

    const asset = visualData.assets[assetIndex];

    // Delete the file
    try {
      const filePath = path.join(__dirname, '..', asset.url);
      await fs.unlink(filePath);

      // Delete thumbnail if different from main file
      if (asset.thumbnail && asset.thumbnail !== asset.url) {
        const thumbnailPath = path.join(__dirname, '..', asset.thumbnail);
        await fs.unlink(thumbnailPath);
      }
    } catch (error) {
      console.warn('Could not delete asset file:', error.message);
    }

    // Remove from data
    visualData.assets.splice(assetIndex, 1);
    await saveData();

    res.json({ message: 'Visual asset deleted successfully' });
  } catch (error) {
    console.error('Error deleting visual asset:', error);
    res.status(500).json({ error: 'Failed to delete visual asset' });
  }
});

// GET /api/visual/template-thumbnail/:id - Get template thumbnail
router.get('/template-thumbnail/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Generate a simple placeholder thumbnail for templates
    const placeholderThumbnail = await generatePlaceholderImage(`Template ${id}`, 'minimalist', '400x300');

    res.set('Content-Type', 'image/png');
    res.send(placeholderThumbnail);
  } catch (error) {
    console.error('Error getting template thumbnail:', error);
    res.status(500).json({ error: 'Failed to get template thumbnail' });
  }
});

// Helper function to generate placeholder image
async function generatePlaceholderImage(text, style, size) {
  // This is a simple placeholder implementation
  // In production, integrate with actual AI image generation services

  const [width, height] = size.split('x').map(Number);

  // Create a simple SVG placeholder
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="#f0f2f5"/>
  <rect x="10%" y="10%" width="80%" height="80%" fill="#1890ff" opacity="0.1"/>
  <text x="50%" y="45%" text-anchor="middle" font-family="Arial, sans-serif" font-size="16" fill="#666">
    AI Generated Image
  </text>
  <text x="50%" y="55%" text-anchor="middle" font-family="Arial, sans-serif" font-size="12" fill="#999">
    ${text.substring(0, 50)}...
  </text>
  <text x="50%" y="70%" text-anchor="middle" font-family="Arial, sans-serif" font-size="10" fill="#ccc">
    Style: ${style} | Size: ${size}
  </text>
</svg>`;

  return Buffer.from(svg, 'utf8');
}

// Helper function to generate placeholder video
async function generatePlaceholderVideo(script, style, duration) {
  // This is a placeholder implementation
  // In production, integrate with actual AI video generation services

  // Return a minimal MP4 header (this won't be a valid video, just for demo)
  const placeholder = Buffer.from(`Placeholder video: ${script.substring(0, 100)}...\nStyle: ${style}\nDuration: ${duration}s`, 'utf8');
  return placeholder;
}

// Helper function to generate customized content
async function generateCustomizedContent(template, customization) {
  // This would create customized content based on template and user preferences
  // For now, return a placeholder

  const customizationText = JSON.stringify(customization, null, 2);
  const content = `Customized ${template.name}\n\nCustomization Options:\n${customizationText}`;

  if (template.type === 'image') {
    return generatePlaceholderImage(content, 'customized', template.size || '1080x1080');
  } else {
    return generatePlaceholderVideo(content, 'customized', template.duration || 30);
  }
}

// GET /api/visual/stats - Get visual content statistics
router.get('/stats', async (req, res) => {
  try {
    const stats = {
      totalAssets: visualData.assets.length,
      imageAssets: visualData.assets.filter(a => a.type === 'image').length,
      videoAssets: visualData.assets.filter(a => a.type === 'video').length,
      generatedAssets: visualData.assets.filter(a => a.category === 'generated').length,
      uploadedAssets: visualData.assets.filter(a => a.category === 'uploaded').length,
      customizedAssets: visualData.assets.filter(a => a.category === 'customized').length,
      totalTemplates: visualData.templates.length
    };

    res.json(stats);
  } catch (error) {
    console.error('Error getting visual stats:', error);
    res.status(500).json({ error: 'Failed to get visual statistics' });
  }
});

module.exports = router;