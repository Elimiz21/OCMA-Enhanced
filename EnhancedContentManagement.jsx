import React, { useState, useEffect } from 'react';
import { Tabs, Card, Statistic, Row, Col, Button, Badge, Spin, notification } from 'antd';
import {
  CalendarOutlined,
  FileTextOutlined,
  PictureOutlined,
  BulbOutlined,
  PlusOutlined,
  BarChartOutlined
} from '@ant-design/icons';
import ContentCalendar from './ContentCalendar';
import ContentDrafts from './ContentDrafts';
import VisualContentCreator from './VisualContentCreator';
import StrategyBasedContentGenerator from './StrategyBasedContentGenerator';
import '../styles/enhanced-content-styles.css';

const { TabPane } = Tabs;

const EnhancedContentManagement = () => {
  const [activeTab, setActiveTab] = useState('calendar');
  const [stats, setStats] = useState({
    totalDrafts: 0,
    publishedPosts: 0,
    scheduledPosts: 0,
    generatedImages: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/content/stats');
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
      notification.error({
        message: 'Error',
        description: 'Failed to load statistics'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (key) => {
    setActiveTab(key);
  };

  const quickActions = [
    {
      title: 'Create Post',
      icon: <PlusOutlined />,
      action: () => setActiveTab('drafts'),
      color: '#1890ff'
    },
    {
      title: 'Schedule Content',
      icon: <CalendarOutlined />,
      action: () => setActiveTab('calendar'),
      color: '#52c41a'
    },
    {
      title: 'Generate Visual',
      icon: <PictureOutlined />,
      action: () => setActiveTab('visual'),
      color: '#fa8c16'
    },
    {
      title: 'Strategy Analysis',
      icon: <BulbOutlined />,
      action: () => setActiveTab('strategy'),
      color: '#722ed1'
    }
  ];

  if (loading) {
    return (
      <div className="content-loading">
        <Spin size="large" />
        <p>Loading Enhanced Content Management...</p>
      </div>
    );
  }

  return (
    <div className="enhanced-content-management">
      <div className="content-header">
        <h1>Enhanced Content Management</h1>
        <p>Complete content creation, scheduling, and optimization platform</p>
      </div>

      {/* Statistics Overview */}
      <Row gutter={[16, 16]} className="stats-row">
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="Total Drafts"
              value={stats.totalDrafts}
              prefix={<FileTextOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="Published Posts"
              value={stats.publishedPosts}
              prefix={<BarChartOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="Scheduled Posts"
              value={stats.scheduledPosts}
              prefix={<CalendarOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="Generated Images"
              value={stats.generatedImages}
              prefix={<PictureOutlined />}
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Quick Actions */}
      <div className="quick-actions">
        <h3>Quick Actions</h3>
        <Row gutter={[16, 16]}>
          {quickActions.map((action, index) => (
            <Col xs={12} sm={6} key={index}>
              <Button
                type="primary"
                size="large"
                icon={action.icon}
                onClick={action.action}
                className="quick-action-btn"
                style={{ backgroundColor: action.color, borderColor: action.color }}
              >
                {action.title}
              </Button>
            </Col>
          ))}
        </Row>
      </div>

      {/* Main Content Tabs */}
      <div className="content-tabs">
        <Tabs activeKey={activeTab} onChange={handleTabChange} type="card">
          <TabPane
            tab={
              <span>
                <CalendarOutlined />
                Content Calendar
                <Badge count={stats.scheduledPosts} style={{ marginLeft: 8 }} />
              </span>
            }
            key="calendar"
          >
            <ContentCalendar onStatsUpdate={fetchStats} />
          </TabPane>

          <TabPane
            tab={
              <span>
                <FileTextOutlined />
                Content Drafts
                <Badge count={stats.totalDrafts} style={{ marginLeft: 8 }} />
              </span>
            }
            key="drafts"
          >
            <ContentDrafts onStatsUpdate={fetchStats} />
          </TabPane>

          <TabPane
            tab={
              <span>
                <PictureOutlined />
                Visual Creator
              </span>
            }
            key="visual"
          >
            <VisualContentCreator onStatsUpdate={fetchStats} />
          </TabPane>

          <TabPane
            tab={
              <span>
                <BulbOutlined />
                Strategy Engine
              </span>
            }
            key="strategy"
          >
            <StrategyBasedContentGenerator onStatsUpdate={fetchStats} />
          </TabPane>
        </Tabs>
      </div>
    </div>
  );
};

export default EnhancedContentManagement;