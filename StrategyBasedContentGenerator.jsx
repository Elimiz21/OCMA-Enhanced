import React, { useState, useEffect } from 'react';
import { 
  Card, Button, Upload, Modal, Input, Select, Progress, 
  notification, Row, Col, Spin, Divider, Tag, Alert,
  List, Typography, Space, Collapse, Tabs 
} from 'antd';
import { 
  UploadOutlined, BulbOutlined, RocketOutlined,
  FileTextOutlined, BarChartOutlined, TargetOutlined,
  CheckCircleOutlined, ExclamationCircleOutlined,
  ReloadOutlined, DownloadOutlined
} from '@ant-design/icons';

const { TextArea } = Input;
const { Option } = Select;
const { Title, Text, Paragraph } = Typography;
const { Panel } = Collapse;
const { TabPane } = Tabs;

const StrategyBasedContentGenerator = ({ onStatsUpdate }) => {
  const [activeTab, setActiveTab] = useState('upload');
  const [strategies, setStrategies] = useState([]);
  const [selectedStrategy, setSelectedStrategy] = useState(null);
  const [strategyAnalysis, setStrategyAnalysis] = useState(null);
  const [generatedContent, setGeneratedContent] = useState([]);
  const [loading, setLoading] = useState(false);
  const [analysisLoading, setAnalysisLoading] = useState(false);

  // Content generation options
  const [generationOptions, setGenerationOptions] = useState({
    contentTypes: ['post', 'story'],
    platforms: ['instagram', 'facebook'],
    quantity: 5,
    timeframe: 'week'
  });

  const contentTypes = [
    { value: 'post', label: 'Social Media Posts' },
    { value: 'story', label: 'Stories' },
    { value: 'video_script', label: 'Video Scripts' },
    { value: 'blog_outline', label: 'Blog Outlines' },
    { value: 'email', label: 'Email Content' }
  ];

  const platforms = [
    { value: 'facebook', label: 'Facebook', color: '#4267B2' },
    { value: 'instagram', label: 'Instagram', color: '#E4405F' },
    { value: 'twitter', label: 'Twitter', color: '#1DA1F2' },
    { value: 'linkedin', label: 'LinkedIn', color: '#0077B5' },
    { value: 'tiktok', label: 'TikTok', color: '#000000' },
    { value: 'youtube', label: 'YouTube', color: '#FF0000' }
  ];

  useEffect(() => {
    fetchStrategies();
  }, []);

  const fetchStrategies = async () => {
    try {
      const response = await fetch('/api/strategy/list');
      const data = await response.json();
      setStrategies(data);
    } catch (error) {
      console.error('Error fetching strategies:', error);
      notification.error({
        message: 'Error',
        description: 'Failed to load marketing strategies'
      });
    }
  };

  const handleStrategyUpload = async ({ file }) => {
    const formData = new FormData();
    formData.append('strategy', file);

    setLoading(true);
    try {
      const response = await fetch('/api/strategy/upload', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        const result = await response.json();
        notification.success({
          message: 'Success',
          description: 'Marketing strategy uploaded successfully'
        });
        fetchStrategies();
        setActiveTab('analyze');
      } else {
        throw new Error('Upload failed');
      }
    } catch (error) {
      console.error('Error uploading strategy:', error);
      notification.error({
        message: 'Error',
        description: 'Failed to upload marketing strategy'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStrategyAnalysis = async (strategy) => {
    setSelectedStrategy(strategy);
    setAnalysisLoading(true);

    try {
      const response = await fetch(`/api/strategy/analyze/${strategy.id}`, {
        method: 'POST'
      });

      if (response.ok) {
        const analysis = await response.json();
        setStrategyAnalysis(analysis);
        setActiveTab('generate');

        notification.success({
          message: 'Analysis Complete',
          description: 'Marketing strategy analyzed successfully'
        });
      } else {
        throw new Error('Analysis failed');
      }
    } catch (error) {
      console.error('Error analyzing strategy:', error);
      notification.error({
        message: 'Error',
        description: 'Failed to analyze marketing strategy'
      });
    } finally {
      setAnalysisLoading(false);
    }
  };

  const handleContentGeneration = async () => {
    if (!selectedStrategy || !strategyAnalysis) {
      notification.error({
        message: 'Error',
        description: 'Please select and analyze a strategy first'
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/strategy/generate-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          strategyId: selectedStrategy.id,
          analysis: strategyAnalysis,
          options: generationOptions
        })
      });

      if (response.ok) {
        const content = await response.json();
        setGeneratedContent(content);
        onStatsUpdate();

        notification.success({
          message: 'Content Generated',
          description: `Generated ${content.length} pieces of content based on your strategy`
        });
        setActiveTab('review');
      } else {
        throw new Error('Content generation failed');
      }
    } catch (error) {
      console.error('Error generating content:', error);
      notification.error({
        message: 'Error',
        description: 'Failed to generate strategy-based content'
      });
    } finally {
      setLoading(false);
    }
  };

  const renderUploadTab = () => (
    <Card className="upload-card">
      <div style={{ textAlign: 'center', padding: '40px 20px' }}>
        <RocketOutlined style={{ fontSize: 64, color: '#1890ff', marginBottom: 16 }} />
        <Title level={3}>Upload Your Marketing Strategy</Title>
        <Paragraph style={{ marginBottom: 32 }}>
          Upload your marketing strategy document (PDF, DOCX, or TXT) and our AI will 
          analyze it to generate perfectly aligned content for all your campaigns.
        </Paragraph>

        <Upload.Dragger
          name="strategy"
          customRequest={handleStrategyUpload}
          accept=".pdf,.docx,.txt"
          showUploadList={false}
          style={{ marginBottom: 24 }}
        >
          <p className="ant-upload-drag-icon">
            <UploadOutlined />
          </p>
          <p className="ant-upload-text">Click or drag file to upload</p>
          <p className="ant-upload-hint">
            Supports PDF, Word documents, and text files
          </p>
        </Upload.Dragger>

        {strategies.length > 0 && (
          <div>
            <Divider>Or select an existing strategy</Divider>
            <List
              dataSource={strategies}
              renderItem={strategy => (
                <List.Item 
                  actions={[
                    <Button 
                      type="primary" 
                      onClick={() => handleStrategyAnalysis(strategy)}
                      loading={analysisLoading}
                    >
                      Analyze
                    </Button>
                  ]}
                >
                  <List.Item.Meta
                    avatar={<FileTextOutlined style={{ fontSize: 24 }} />}
                    title={strategy.name}
                    description={`Uploaded ${new Date(strategy.uploadDate).toLocaleDateString()}`}
                  />
                </List.Item>
              )}
            />
          </div>
        )}
      </div>
    </Card>
  );

  const renderAnalysisTab = () => (
    <div className="analysis-tab">
      {!strategyAnalysis ? (
        <Card>
          <div style={{ textAlign: 'center', padding: '40px 20px' }}>
            <BulbOutlined style={{ fontSize: 64, color: '#faad14', marginBottom: 16 }} />
            <Title level={3}>Strategy Analysis Required</Title>
            <Paragraph>
              Please upload and analyze a marketing strategy to view insights and generate content.
            </Paragraph>
          </div>
        </Card>
      ) : (
        <div>
          <Card title="Strategy Analysis Results" className="analysis-results">
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={8}>
                <Card size="small">
                  <div style={{ textAlign: 'center' }}>
                    <TargetOutlined style={{ fontSize: 24, color: '#52c41a' }} />
                    <Title level={4}>{strategyAnalysis.clarity_score}/100</Title>
                    <Text>Clarity Score</Text>
                  </div>
                </Card>
              </Col>
              <Col xs={24} sm={8}>
                <Card size="small">
                  <div style={{ textAlign: 'center' }}>
                    <CheckCircleOutlined style={{ fontSize: 24, color: '#1890ff' }} />
                    <Title level={4}>{strategyAnalysis.completeness_score}/100</Title>
                    <Text>Completeness</Text>
                  </div>
                </Card>
              </Col>
              <Col xs={24} sm={8}>
                <Card size="small">
                  <div style={{ textAlign: 'center' }}>
                    <BarChartOutlined style={{ fontSize: 24, color: '#722ed1' }} />
                    <Title level={4}>{strategyAnalysis.actionability_score}/100</Title>
                    <Text>Actionability</Text>
                  </div>
                </Card>
              </Col>
            </Row>
          </Card>

          <Row gutter={16}>
            <Col xs={24} lg={12}>
              <Card title="Key Insights" className="insights-card">
                <Collapse>
                  <Panel header="Target Audience" key="audience">
                    <div>
                      {strategyAnalysis.target_audience?.map((audience, index) => (
                        <Tag key={index} color="blue" style={{ marginBottom: 8 }}>
                          {audience}
                        </Tag>
                      ))}
                    </div>
                  </Panel>

                  <Panel header="Content Pillars" key="pillars">
                    <List
                      size="small"
                      dataSource={strategyAnalysis.content_pillars}
                      renderItem={pillar => (
                        <List.Item>
                          <Text strong>{pillar.name}:</Text> {pillar.description}
                        </List.Item>
                      )}
                    />
                  </Panel>

                  <Panel header="Key Messages" key="messages">
                    <List
                      size="small"
                      dataSource={strategyAnalysis.key_messages}
                      renderItem={message => <List.Item>{message}</List.Item>}
                    />
                  </Panel>
                </Collapse>
              </Card>
            </Col>

            <Col xs={24} lg={12}>
              <Card title="Recommendations" className="recommendations-card">
                {strategyAnalysis.recommendations?.map((rec, index) => (
                  <Alert
                    key={index}
                    message={rec.title}
                    description={rec.description}
                    type={rec.priority === 'high' ? 'warning' : 'info'}
                    style={{ marginBottom: 8 }}
                    showIcon
                  />
                ))}
              </Card>
            </Col>
          </Row>
        </div>
      )}
    </div>
  );

  const renderGenerateTab = () => (
    <div className="generate-tab">
      {!strategyAnalysis ? (
        <Card>
          <div style={{ textAlign: 'center', padding: '40px 20px' }}>
            <ExclamationCircleOutlined style={{ fontSize: 64, color: '#faad14', marginBottom: 16 }} />
            <Title level={3}>Strategy Analysis Required</Title>
            <Paragraph>
              Please analyze a marketing strategy before generating content.
            </Paragraph>
          </div>
        </Card>
      ) : (
        <Row gutter={16}>
          <Col xs={24} lg={8}>
            <Card title="Generation Options" className="options-card">
              <div style={{ marginBottom: 16 }}>
                <label>Content Types:</label>
                <Select
                  mode="multiple"
                  value={generationOptions.contentTypes}
                  onChange={(value) => setGenerationOptions({ 
                    ...generationOptions, 
                    contentTypes: value 
                  })}
                  style={{ width: '100%' }}
                  placeholder="Select content types"
                >
                  {contentTypes.map(type => (
                    <Option key={type.value} value={type.value}>
                      {type.label}
                    </Option>
                  ))}
                </Select>
              </div>

              <div style={{ marginBottom: 16 }}>
                <label>Platforms:</label>
                <Select
                  mode="multiple"
                  value={generationOptions.platforms}
                  onChange={(value) => setGenerationOptions({ 
                    ...generationOptions, 
                    platforms: value 
                  })}
                  style={{ width: '100%' }}
                  placeholder="Select platforms"
                >
                  {platforms.map(platform => (
                    <Option key={platform.value} value={platform.value}>
                      <Tag color={platform.color}>{platform.label}</Tag>
                    </Option>
                  ))}
                </Select>
              </div>

              <div style={{ marginBottom: 16 }}>
                <label>Quantity: {generationOptions.quantity}</label>
                <input
                  type="range"
                  min="1"
                  max="20"
                  value={generationOptions.quantity}
                  onChange={(e) => setGenerationOptions({ 
                    ...generationOptions, 
                    quantity: parseInt(e.target.value) 
                  })}
                  style={{ width: '100%' }}
                />
              </div>

              <div style={{ marginBottom: 24 }}>
                <label>Timeframe:</label>
                <Select
                  value={generationOptions.timeframe}
                  onChange={(value) => setGenerationOptions({ 
                    ...generationOptions, 
                    timeframe: value 
                  })}
                  style={{ width: '100%' }}
                >
                  <Option value="day">Daily</Option>
                  <Option value="week">Weekly</Option>
                  <Option value="month">Monthly</Option>
                  <Option value="campaign">Campaign-based</Option>
                </Select>
              </div>

              <Button 
                type="primary" 
                size="large"
                icon={<RocketOutlined />}
                onClick={handleContentGeneration}
                loading={loading}
                block
              >
                Generate Strategy-Aligned Content
              </Button>
            </Card>
          </Col>

          <Col xs={24} lg={16}>
            <Card title="Strategy Preview" className="preview-card">
              <div style={{ marginBottom: 16 }}>
                <Text strong>Selected Strategy:</Text> {selectedStrategy?.name}
              </div>

              <Row gutter={16}>
                <Col span={12}>
                  <div>
                    <Text strong>Primary Goals:</Text>
                    <ul>
                      {strategyAnalysis.goals?.map((goal, index) => (
                        <li key={index}>{goal}</li>
                      ))}
                    </ul>
                  </div>
                </Col>
                <Col span={12}>
                  <div>
                    <Text strong>Content Themes:</Text>
                    <div style={{ marginTop: 8 }}>
                      {strategyAnalysis.content_pillars?.map((pillar, index) => (
                        <Tag key={index} color="purple" style={{ marginBottom: 4 }}>
                          {pillar.name}
                        </Tag>
                      ))}
                    </div>
                  </div>
                </Col>
              </Row>

              <Divider />

              <div>
                <Text strong>Brand Voice:</Text> {strategyAnalysis.brand_voice || 'Professional'}
              </div>
              <div style={{ marginTop: 8 }}>
                <Text strong>Target Demographics:</Text>
                <div style={{ marginTop: 4 }}>
                  {strategyAnalysis.target_audience?.map((audience, index) => (
                    <Tag key={index} style={{ marginBottom: 4 }}>
                      {audience}
                    </Tag>
                  ))}
                </div>
              </div>
            </Card>
          </Col>
        </Row>
      )}
    </div>
  );

  const renderReviewTab = () => (
    <div className="review-tab">
      {generatedContent.length === 0 ? (
        <Card>
          <div style={{ textAlign: 'center', padding: '40px 20px' }}>
            <FileTextOutlined style={{ fontSize: 64, color: '#ccc', marginBottom: 16 }} />
            <Title level={3}>No Content Generated Yet</Title>
            <Paragraph>
              Generate strategy-aligned content to review and approve here.
            </Paragraph>
          </div>
        </Card>
      ) : (
        <div>
          <div style={{ marginBottom: 24, textAlign: 'right' }}>
            <Space>
              <Button icon={<DownloadOutlined />}>
                Export All
              </Button>
              <Button type="primary">
                Approve All ({generatedContent.length})
              </Button>
            </Space>
          </div>

          <Row gutter={[16, 16]}>
            {generatedContent.map((content, index) => (
              <Col xs={24} sm={12} lg={8} key={index}>
                <Card
                  title={
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>{content.type}</span>
                      <Tag color={platforms.find(p => p.value === content.platform)?.color}>
                        {content.platform}
                      </Tag>
                    </div>
                  }
                  actions={[
                    <Button type="text" icon={<CheckCircleOutlined />}>Approve</Button>,
                    <Button type="text" icon={<ReloadOutlined />}>Regenerate</Button>,
                    <Button type="text" icon={<FileTextOutlined />}>Edit</Button>
                  ]}
                  className="content-card"
                >
                  <Paragraph ellipsis={{ rows: 4, expandable: true }}>
                    {content.content}
                  </Paragraph>

                  <div style={{ marginTop: 8 }}>
                    <Text strong>Quality Score:</Text>
                    <Progress 
                      percent={content.quality_score} 
                      size="small"
                      strokeColor={{
                        '0%': '#ff4d4f',
                        '50%': '#faad14',
                        '100%': '#52c41a',
                      }}
                    />
                  </div>

                  {content.hashtags && (
                    <div style={{ marginTop: 8 }}>
                      <Text type="secondary">{content.hashtags}</Text>
                    </div>
                  )}
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      )}
    </div>
  );

  return (
    <div className="strategy-content-generator">
      <div className="generator-header">
        <Title level={2}>Strategy-Based Content Engine</Title>
        <Paragraph>
          Transform your marketing strategy into perfectly aligned content across all platforms
        </Paragraph>
      </div>

      <Tabs activeKey={activeTab} onChange={setActiveTab} type="card">
        <TabPane 
          tab={<span><UploadOutlined />Upload Strategy</span>} 
          key="upload"
        >
          {renderUploadTab()}
        </TabPane>

        <TabPane 
          tab={<span><BulbOutlined />Analyze Strategy</span>} 
          key="analyze"
        >
          {renderAnalysisTab()}
        </TabPane>

        <TabPane 
          tab={<span><RocketOutlined />Generate Content</span>} 
          key="generate"
        >
          {renderGenerateTab()}
        </TabPane>

        <TabPane 
          tab={
            <span>
              <CheckCircleOutlined />
              Review & Approve
              {generatedContent.length > 0 && (
                <span style={{ 
                  marginLeft: 8, 
                  background: '#f50', 
                  borderRadius: '50%', 
                  padding: '0 6px', 
                  color: 'white', 
                  fontSize: '12px' 
                }}>
                  {generatedContent.length}
                </span>
              )}
            </span>
          } 
          key="review"
        >
          {renderReviewTab()}
        </TabPane>
      </Tabs>
    </div>
  );
};

export default StrategyBasedContentGenerator;