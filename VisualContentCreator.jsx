import React, { useState, useEffect } from 'react';
import { 
  Card, Button, Upload, Modal, Input, Select, Slider, 
  Radio, Tabs, notification, Row, Col, Spin, Image, 
  Tag, Divider, Progress, Space, Tooltip 
} from 'antd';
import { 
  PictureOutlined, VideoCameraOutlined, UploadOutlined,
  DownloadOutlined, EditOutlined, DeleteOutlined,
  ReloadOutlined, EyeOutlined, ShareAltOutlined,
  BgColorsOutlined, FontSizeOutlined
} from '@ant-design/icons';

const { TextArea } = Input;
const { Option } = Select;
const { TabPane } = Tabs;

const VisualContentCreator = ({ onStatsUpdate }) => {
  const [activeTab, setActiveTab] = useState('generate');
  const [generatedAssets, setGeneratedAssets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewAsset, setPreviewAsset] = useState(null);

  // Image generation state
  const [imageForm, setImageForm] = useState({
    prompt: '',
    style: 'realistic',
    size: '1024x1024',
    quantity: 1
  });

  // Video generation state
  const [videoForm, setVideoForm] = useState({
    script: '',
    style: 'animated',
    duration: 30,
    voiceover: 'female'
  });

  // Template state
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [templateCustomization, setTemplateCustomization] = useState({
    backgroundColor: '#ffffff',
    textColor: '#000000',
    fontSize: 24,
    fontFamily: 'Arial'
  });

  const imageStyles = [
    { value: 'realistic', label: 'Realistic Photo' },
    { value: 'illustration', label: 'Illustration' },
    { value: 'cartoon', label: 'Cartoon' },
    { value: 'minimalist', label: 'Minimalist' },
    { value: 'abstract', label: 'Abstract Art' },
    { value: 'vintage', label: 'Vintage' }
  ];

  const videoStyles = [
    { value: 'animated', label: 'Animated' },
    { value: 'slideshow', label: 'Slideshow' },
    { value: 'kinetic', label: 'Kinetic Typography' },
    { value: 'avatar', label: 'AI Avatar' }
  ];

  const templates = [
    {
      id: 1,
      name: 'Social Media Post',
      type: 'image',
      size: '1080x1080',
      thumbnail: '/templates/social-post.jpg',
      category: 'social'
    },
    {
      id: 2,
      name: 'Story Template',
      type: 'image',
      size: '1080x1920',
      thumbnail: '/templates/story.jpg',
      category: 'social'
    },
    {
      id: 3,
      name: 'Blog Header',
      type: 'image',
      size: '1200x600',
      thumbnail: '/templates/blog-header.jpg',
      category: 'blog'
    },
    {
      id: 4,
      name: 'Product Showcase',
      type: 'video',
      duration: 15,
      thumbnail: '/templates/product-video.jpg',
      category: 'product'
    }
  ];

  useEffect(() => {
    fetchGeneratedAssets();
  }, []);

  const fetchGeneratedAssets = async () => {
    try {
      const response = await fetch('/api/visual/assets');
      const data = await response.json();
      setGeneratedAssets(data);
    } catch (error) {
      console.error('Error fetching assets:', error);
      notification.error({
        message: 'Error',
        description: 'Failed to load visual assets'
      });
    }
  };

  const handleImageGeneration = async () => {
    if (!imageForm.prompt.trim()) {
      notification.error({
        message: 'Error',
        description: 'Please enter a prompt for image generation'
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/visual/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(imageForm)
      });

      if (response.ok) {
        const result = await response.json();
        notification.success({
          message: 'Success',
          description: `Generated ${result.images.length} image(s) successfully`
        });
        fetchGeneratedAssets();
        onStatsUpdate();
      } else {
        throw new Error('Generation failed');
      }
    } catch (error) {
      console.error('Error generating image:', error);
      notification.error({
        message: 'Error',
        description: 'Failed to generate image'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVideoGeneration = async () => {
    if (!videoForm.script.trim()) {
      notification.error({
        message: 'Error',
        description: 'Please enter a script for video generation'
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/visual/generate-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(videoForm)
      });

      if (response.ok) {
        const result = await response.json();
        notification.success({
          message: 'Success',
          description: 'Video generated successfully'
        });
        fetchGeneratedAssets();
        onStatsUpdate();
      } else {
        throw new Error('Generation failed');
      }
    } catch (error) {
      console.error('Error generating video:', error);
      notification.error({
        message: 'Error',
        description: 'Failed to generate video'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTemplateCustomization = async () => {
    if (!selectedTemplate) {
      notification.error({
        message: 'Error',
        description: 'Please select a template first'
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/visual/customize-template', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          templateId: selectedTemplate.id,
          customization: templateCustomization
        })
      });

      if (response.ok) {
        const result = await response.json();
        notification.success({
          message: 'Success',
          description: 'Template customized successfully'
        });
        fetchGeneratedAssets();
        onStatsUpdate();
      } else {
        throw new Error('Customization failed');
      }
    } catch (error) {
      console.error('Error customizing template:', error);
      notification.error({
        message: 'Error',
        description: 'Failed to customize template'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAsset = async (assetId) => {
    try {
      const response = await fetch(`/api/visual/assets/${assetId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        notification.success({
          message: 'Success',
          description: 'Asset deleted successfully'
        });
        fetchGeneratedAssets();
        onStatsUpdate();
      }
    } catch (error) {
      console.error('Error deleting asset:', error);
      notification.error({
        message: 'Error',
        description: 'Failed to delete asset'
      });
    }
  };

  const handlePreview = (asset) => {
    setPreviewAsset(asset);
    setPreviewVisible(true);
  };

  const handleDownload = (asset) => {
    // Create download link
    const link = document.createElement('a');
    link.href = asset.url;
    link.download = asset.filename;
    link.click();
  };

  const renderGenerationTab = () => (
    <div className="generation-tab">
      <Tabs defaultActiveKey="image" type="card">
        <TabPane tab={<span><PictureOutlined />Image Generation</span>} key="image">
          <Card title="AI Image Generator" className="generation-card">
            <div style={{ marginBottom: 16 }}>
              <label>Describe your image:</label>
              <TextArea
                rows={3}
                placeholder="A modern office space with plants and natural lighting..."
                value={imageForm.prompt}
                onChange={(e) => setImageForm({ ...imageForm, prompt: e.target.value })}
                showCount
                maxLength={500}
              />
            </div>

            <Row gutter={16} style={{ marginBottom: 16 }}>
              <Col span={8}>
                <label>Style:</label>
                <Select
                  value={imageForm.style}
                  onChange={(value) => setImageForm({ ...imageForm, style: value })}
                  style={{ width: '100%' }}
                >
                  {imageStyles.map(style => (
                    <Option key={style.value} value={style.value}>
                      {style.label}
                    </Option>
                  ))}
                </Select>
              </Col>

              <Col span={8}>
                <label>Size:</label>
                <Select
                  value={imageForm.size}
                  onChange={(value) => setImageForm({ ...imageForm, size: value })}
                  style={{ width: '100%' }}
                >
                  <Option value="1024x1024">Square (1024x1024)</Option>
                  <Option value="1024x768">Landscape (1024x768)</Option>
                  <Option value="768x1024">Portrait (768x1024)</Option>
                  <Option value="1080x1080">Instagram Square</Option>
                  <Option value="1080x1920">Instagram Story</Option>
                </Select>
              </Col>

              <Col span={8}>
                <label>Quantity:</label>
                <Slider
                  min={1}
                  max={4}
                  value={imageForm.quantity}
                  onChange={(value) => setImageForm({ ...imageForm, quantity: value })}
                  marks={{ 1: '1', 2: '2', 3: '3', 4: '4' }}
                />
              </Col>
            </Row>

            <Button 
              type="primary" 
              size="large" 
              icon={<PictureOutlined />}
              onClick={handleImageGeneration}
              loading={loading}
              block
            >
              Generate Images
            </Button>
          </Card>
        </TabPane>

        <TabPane tab={<span><VideoCameraOutlined />Video Generation</span>} key="video">
          <Card title="AI Video Generator" className="generation-card">
            <div style={{ marginBottom: 16 }}>
              <label>Video Script:</label>
              <TextArea
                rows={4}
                placeholder="Welcome to our new product launch. Today we're excited to introduce..."
                value={videoForm.script}
                onChange={(e) => setVideoForm({ ...videoForm, script: e.target.value })}
                showCount
                maxLength={1000}
              />
            </div>

            <Row gutter={16} style={{ marginBottom: 16 }}>
              <Col span={8}>
                <label>Style:</label>
                <Select
                  value={videoForm.style}
                  onChange={(value) => setVideoForm({ ...videoForm, style: value })}
                  style={{ width: '100%' }}
                >
                  {videoStyles.map(style => (
                    <Option key={style.value} value={style.value}>
                      {style.label}
                    </Option>
                  ))}
                </Select>
              </Col>

              <Col span={8}>
                <label>Duration (seconds):</label>
                <Slider
                  min={15}
                  max={180}
                  value={videoForm.duration}
                  onChange={(value) => setVideoForm({ ...videoForm, duration: value })}
                  marks={{ 15: '15s', 30: '30s', 60: '1m', 120: '2m', 180: '3m' }}
                />
              </Col>

              <Col span={8}>
                <label>Voiceover:</label>
                <Radio.Group
                  value={videoForm.voiceover}
                  onChange={(e) => setVideoForm({ ...videoForm, voiceover: e.target.value })}
                >
                  <Radio value="male">Male</Radio>
                  <Radio value="female">Female</Radio>
                  <Radio value="none">None</Radio>
                </Radio.Group>
              </Col>
            </Row>

            <Button 
              type="primary" 
              size="large" 
              icon={<VideoCameraOutlined />}
              onClick={handleVideoGeneration}
              loading={loading}
              block
            >
              Generate Video
            </Button>
          </Card>
        </TabPane>
      </Tabs>
    </div>
  );

  const renderTemplatesTab = () => (
    <div className="templates-tab">
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {templates.map(template => (
          <Col xs={12} sm={8} md={6} key={template.id}>
            <Card
              hoverable
              className={`template-card ${selectedTemplate?.id === template.id ? 'selected' : ''}`}
              cover={
                <img 
                  alt={template.name} 
                  src={template.thumbnail}
                  style={{ height: 120, objectFit: 'cover' }}
                />
              }
              onClick={() => setSelectedTemplate(template)}
            >
              <Card.Meta
                title={template.name}
                description={
                  <Space>
                    <Tag>{template.type}</Tag>
                    <Tag color="blue">{template.category}</Tag>
                  </Space>
                }
              />
            </Card>
          </Col>
        ))}
      </Row>

      {selectedTemplate && (
        <Card title="Customize Template" className="customization-card">
          <Row gutter={16}>
            <Col span={12}>
              <div style={{ marginBottom: 16 }}>
                <label>Background Color:</label>
                <Input
                  type="color"
                  value={templateCustomization.backgroundColor}
                  onChange={(e) => setTemplateCustomization({ 
                    ...templateCustomization, 
                    backgroundColor: e.target.value 
                  })}
                />
              </div>

              <div style={{ marginBottom: 16 }}>
                <label>Text Color:</label>
                <Input
                  type="color"
                  value={templateCustomization.textColor}
                  onChange={(e) => setTemplateCustomization({ 
                    ...templateCustomization, 
                    textColor: e.target.value 
                  })}
                />
              </div>
            </Col>

            <Col span={12}>
              <div style={{ marginBottom: 16 }}>
                <label>Font Size:</label>
                <Slider
                  min={12}
                  max={48}
                  value={templateCustomization.fontSize}
                  onChange={(value) => setTemplateCustomization({ 
                    ...templateCustomization, 
                    fontSize: value 
                  })}
                />
              </div>

              <div style={{ marginBottom: 16 }}>
                <label>Font Family:</label>
                <Select
                  value={templateCustomization.fontFamily}
                  onChange={(value) => setTemplateCustomization({ 
                    ...templateCustomization, 
                    fontFamily: value 
                  })}
                  style={{ width: '100%' }}
                >
                  <Option value="Arial">Arial</Option>
                  <Option value="Helvetica">Helvetica</Option>
                  <Option value="Georgia">Georgia</Option>
                  <Option value="Times New Roman">Times New Roman</Option>
                </Select>
              </div>
            </Col>
          </Row>

          <Button 
            type="primary" 
            icon={<EditOutlined />}
            onClick={handleTemplateCustomization}
            loading={loading}
            size="large"
          >
            Customize Template
          </Button>
        </Card>
      )}
    </div>
  );

  const renderAssetsTab = () => (
    <div className="assets-tab">
      {generatedAssets.length === 0 ? (
        <div className="empty-state">
          <PictureOutlined style={{ fontSize: 64, color: '#ccc' }} />
          <h3>No assets generated yet</h3>
          <p>Start by generating some images or videos!</p>
        </div>
      ) : (
        <Row gutter={[16, 16]}>
          {generatedAssets.map(asset => (
            <Col xs={12} sm={8} md={6} key={asset.id}>
              <Card
                hoverable
                className="asset-card"
                cover={
                  asset.type === 'video' ? (
                    <video 
                      width="100%" 
                      height={120}
                      style={{ objectFit: 'cover' }}
                      poster={asset.thumbnail}
                    >
                      <source src={asset.url} type="video/mp4" />
                    </video>
                  ) : (
                    <img 
                      alt={asset.filename}
                      src={asset.url}
                      style={{ height: 120, objectFit: 'cover', width: '100%' }}
                    />
                  )
                }
                actions={[
                  <Tooltip title="Preview">
                    <Button 
                      type="text" 
                      icon={<EyeOutlined />}
                      onClick={() => handlePreview(asset)}
                    />
                  </Tooltip>,
                  <Tooltip title="Download">
                    <Button 
                      type="text" 
                      icon={<DownloadOutlined />}
                      onClick={() => handleDownload(asset)}
                    />
                  </Tooltip>,
                  <Tooltip title="Delete">
                    <Button 
                      type="text" 
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() => handleDeleteAsset(asset.id)}
                    />
                  </Tooltip>
                ]}
              >
                <Card.Meta
                  title={asset.filename}
                  description={
                    <Space direction="vertical" size="small">
                      <Tag color={asset.type === 'video' ? 'red' : 'blue'}>
                        {asset.type.toUpperCase()}
                      </Tag>
                      <small>{asset.size}</small>
                      <small>Created: {new Date(asset.createdAt).toLocaleDateString()}</small>
                    </Space>
                  }
                />
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </div>
  );

  return (
    <div className="visual-content-creator">
      <div className="creator-header">
        <h2>AI-Powered Visual Content Creator</h2>
        <p>Generate stunning images, videos, and customize templates for your social media</p>
      </div>

      <Tabs activeKey={activeTab} onChange={setActiveTab} type="card">
        <TabPane tab="Generate Content" key="generate">
          {renderGenerationTab()}
        </TabPane>

        <TabPane tab="Templates" key="templates">
          {renderTemplatesTab()}
        </TabPane>

        <TabPane tab={`My Assets (${generatedAssets.length})`} key="assets">
          {renderAssetsTab()}
        </TabPane>
      </Tabs>

      <Modal
        visible={previewVisible}
        footer={null}
        onCancel={() => setPreviewVisible(false)}
        width={800}
        title="Asset Preview"
      >
        {previewAsset && (
          <div style={{ textAlign: 'center' }}>
            {previewAsset.type === 'video' ? (
              <video 
                width="100%" 
                controls 
                style={{ maxHeight: '500px' }}
              >
                <source src={previewAsset.url} type="video/mp4" />
              </video>
            ) : (
              <Image
                width="100%"
                src={previewAsset.url}
                style={{ maxHeight: '500px', objectFit: 'contain' }}
              />
            )}
            <div style={{ marginTop: 16 }}>
              <h4>{previewAsset.filename}</h4>
              <Space>
                <Button icon={<DownloadOutlined />} onClick={() => handleDownload(previewAsset)}>
                  Download
                </Button>
                <Button icon={<ShareAltOutlined />}>
                  Share
                </Button>
              </Space>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default VisualContentCreator;