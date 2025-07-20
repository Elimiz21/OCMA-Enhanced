import React, { useState, useEffect } from 'react';
import { 
  Card, List, Button, Modal, Input, Select, Tag, Popover, 
  Rate, notification, Space, Dropdown, Menu, Progress, 
  Avatar, Tooltip, Badge, Empty, Pagination 
} from 'antd';
import { 
  EditOutlined, DeleteOutlined, ShareAltOutlined, 
  CopyOutlined, EyeOutlined, CheckOutlined, 
  CloseOutlined, ReloadOutlined, StarOutlined,
  FilterOutlined, SortAscendingOutlined
} from '@ant-design/icons';
import moment from 'moment';

const { TextArea } = Input;
const { Option } = Select;
const { Search } = Input;

const ContentDrafts = ({ onStatsUpdate }) => {
  const [drafts, setDrafts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingDraft, setEditingDraft] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('created_desc');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(12);

  const statuses = [
    { value: 'draft', label: 'Draft', color: 'orange' },
    { value: 'approved', label: 'Approved', color: 'green' },
    { value: 'rejected', label: 'Rejected', color: 'red' },
    { value: 'scheduled', label: 'Scheduled', color: 'blue' },
    { value: 'published', label: 'Published', color: 'purple' }
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
    fetchDrafts();
  }, []);

  const fetchDrafts = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/content/drafts');
      const data = await response.json();
      setDrafts(data);
    } catch (error) {
      console.error('Error fetching drafts:', error);
      notification.error({
        message: 'Error',
        description: 'Failed to load drafts'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDraft = async () => {
    setEditingDraft(null);
    setIsModalVisible(true);
  };

  const handleEditDraft = (draft) => {
    setEditingDraft(draft);
    setIsModalVisible(true);
  };

  const handleSaveDraft = async (draftData) => {
    try {
      const url = editingDraft ? `/api/content/drafts/${editingDraft.id}` : '/api/content/drafts';
      const method = editingDraft ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...draftData,
          id: editingDraft ? editingDraft.id : Date.now(),
          createdAt: editingDraft ? editingDraft.createdAt : new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          qualityScore: calculateQualityScore(draftData.content)
        })
      });

      if (response.ok) {
        notification.success({
          message: 'Success',
          description: `Draft ${editingDraft ? 'updated' : 'created'} successfully`
        });
        fetchDrafts();
        onStatsUpdate();
        setIsModalVisible(false);
      }
    } catch (error) {
      console.error('Error saving draft:', error);
      notification.error({
        message: 'Error',
        description: 'Failed to save draft'
      });
    }
  };

  const handleDeleteDraft = async (draftId) => {
    try {
      const response = await fetch(`/api/content/drafts/${draftId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        notification.success({
          message: 'Success',
          description: 'Draft deleted successfully'
        });
        fetchDrafts();
        onStatsUpdate();
      }
    } catch (error) {
      console.error('Error deleting draft:', error);
      notification.error({
        message: 'Error',
        description: 'Failed to delete draft'
      });
    }
  };

  const handleStatusChange = async (draftId, newStatus) => {
    try {
      const response = await fetch(`/api/content/drafts/${draftId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        notification.success({
          message: 'Success',
          description: `Draft status updated to ${newStatus}`
        });
        fetchDrafts();
        onStatsUpdate();
      }
    } catch (error) {
      console.error('Error updating status:', error);
      notification.error({
        message: 'Error',
        description: 'Failed to update status'
      });
    }
  };

  const handleRegenerate = async (draft) => {
    try {
      const response = await fetch('/api/content/regenerate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          originalContent: draft.content,
          platform: draft.platform,
          tone: draft.tone || 'professional'
        })
      });

      if (response.ok) {
        const newContent = await response.json();
        handleSaveDraft({
          ...draft,
          content: newContent.content,
          title: newContent.title || draft.title,
          status: 'draft'
        });
      }
    } catch (error) {
      console.error('Error regenerating content:', error);
      notification.error({
        message: 'Error',
        description: 'Failed to regenerate content'
      });
    }
  };

  const calculateQualityScore = (content) => {
    let score = 0;

    // Length check
    if (content.length > 50 && content.length < 300) score += 2;
    else if (content.length >= 300) score += 1;

    // Hashtag check
    if (content.includes('#')) score += 1;

    // Call to action check
    const ctas = ['click', 'learn', 'discover', 'visit', 'follow', 'share'];
    if (ctas.some(cta => content.toLowerCase().includes(cta))) score += 1;

    // Emoji check - using simpler regex
    if (content.match(/[\u{1f300}-\u{1f5ff}]/u) || content.match(/[\u{1f600}-\u{1f64f}]/u)) {
      score += 1;
    }

    return Math.min(score, 5);
  };

  const filteredDrafts = drafts.filter(draft => {
    const matchesStatus = filterStatus === 'all' || draft.status === filterStatus;
    const matchesSearch = searchTerm === '' || 
      draft.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      draft.content?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const sortedDrafts = [...filteredDrafts].sort((a, b) => {
    switch (sortBy) {
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

  const paginatedDrafts = sortedDrafts.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const renderDraftCard = (draft) => {
    const platform = platforms.find(p => p.value === draft.platform);
    const status = statuses.find(s => s.value === draft.status);

    const actionMenu = (
      <Menu>
        <Menu.Item key="edit" icon={<EditOutlined />} onClick={() => handleEditDraft(draft)}>
          Edit
        </Menu.Item>
        <Menu.Item key="regenerate" icon={<ReloadOutlined />} onClick={() => handleRegenerate(draft)}>
          Regenerate
        </Menu.Item>
        <Menu.Item key="duplicate" icon={<CopyOutlined />}>
          Duplicate
        </Menu.Item>
        <Menu.Divider />
        <Menu.Item key="delete" danger icon={<DeleteOutlined />} onClick={() => handleDeleteDraft(draft.id)}>
          Delete
        </Menu.Item>
      </Menu>
    );

    return (
      <Card
        key={draft.id}
        className="draft-card"
        actions={[
          <Tooltip title="Quality Score">
            <Rate disabled value={draft.qualityScore || 0} style={{ fontSize: 14 }} />
          </Tooltip>,
          <Dropdown overlay={actionMenu} trigger={['click']}>
            <Button type="text" icon={<EditOutlined />} />
          </Dropdown>,
          <Button 
            type="text" 
            icon={status?.value === 'approved' ? <CheckOutlined /> : <ShareAltOutlined />}
            onClick={() => handleStatusChange(draft.id, 'approved')}
          />
        ]}
      >
        <Card.Meta
          avatar={
            <Avatar style={{ backgroundColor: platform?.color || '#ccc' }}>
              {platform?.label.charAt(0)}
            </Avatar>
          }
          title={
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>{draft.title || 'Untitled'}</span>
              <Tag color={status?.color}>{status?.label}</Tag>
            </div>
          }
          description={
            <div>
              <p className="draft-content-preview">
                {draft.content?.substring(0, 100)}...
              </p>
              <div className="draft-meta">
                <small>Created: {moment(draft.createdAt).fromNow()}</small>
                {draft.updatedAt !== draft.createdAt && (
                  <small>Updated: {moment(draft.updatedAt).fromNow()}</small>
                )}
              </div>
            </div>
          }
        />
      </Card>
    );
  };

  return (
    <div className="content-drafts">
      <div className="drafts-header">
        <div className="drafts-controls">
          <Button type="primary" icon={<EditOutlined />} onClick={handleCreateDraft}>
            Create Draft
          </Button>

          <Search
            placeholder="Search drafts..."
            allowClear
            style={{ width: 300 }}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          <Select
            value={filterStatus}
            style={{ width: 150 }}
            onChange={setFilterStatus}
            placeholder="Filter by status"
          >
            <Option value="all">All Status</Option>
            {statuses.map(status => (
              <Option key={status.value} value={status.value}>
                <Tag color={status.color}>{status.label}</Tag>
              </Option>
            ))}
          </Select>

          <Select
            value={sortBy}
            style={{ width: 180 }}
            onChange={setSortBy}
            placeholder="Sort by"
          >
            <Option value="created_desc">Newest First</Option>
            <Option value="created_asc">Oldest First</Option>
            <Option value="quality_desc">Quality Score</Option>
            <Option value="title_asc">Title A-Z</Option>
          </Select>
        </div>
      </div>

      {paginatedDrafts.length === 0 ? (
        <Empty
          description="No drafts found"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        >
          <Button type="primary" onClick={handleCreateDraft}>
            Create Your First Draft
          </Button>
        </Empty>
      ) : (
        <>
          <div className="drafts-grid">
            {paginatedDrafts.map(renderDraftCard)}
          </div>

          <div className="drafts-pagination">
            <Pagination
              current={currentPage}
              pageSize={pageSize}
              total={sortedDrafts.length}
              onChange={setCurrentPage}
              showSizeChanger={false}
              showQuickJumper
              showTotal={(total, range) => `${range[0]}-${range[1]} of ${total} drafts`}
            />
          </div>
        </>
      )}

      <DraftModal
        visible={isModalVisible}
        draft={editingDraft}
        onSave={handleSaveDraft}
        onCancel={() => setIsModalVisible(false)}
        platforms={platforms}
        statuses={statuses}
      />
    </div>
  );
};

const DraftModal = ({ visible, draft, onSave, onCancel, platforms, statuses }) => {
  const [form, setForm] = useState({
    title: '',
    content: '',
    platform: '',
    status: 'draft',
    hashtags: '',
    tone: 'professional'
  });

  useEffect(() => {
    if (draft) {
      setForm({
        title: draft.title || '',
        content: draft.content || '',
        platform: draft.platform || '',
        status: draft.status || 'draft',
        hashtags: draft.hashtags || '',
        tone: draft.tone || 'professional'
      });
    } else {
      setForm({
        title: '',
        content: '',
        platform: '',
        status: 'draft',
        hashtags: '',
        tone: 'professional'
      });
    }
  }, [draft, visible]);

  const handleSave = () => {
    if (!form.content.trim()) {
      notification.error({
        message: 'Error',
        description: 'Content is required'
      });
      return;
    }

    onSave(form);
    setForm({
      title: '',
      content: '',
      platform: '',
      status: 'draft',
      hashtags: '',
      tone: 'professional'
    });
  };

  return (
    <Modal
      title={draft ? "Edit Draft" : "Create New Draft"}
      visible={visible}
      onOk={handleSave}
      onCancel={onCancel}
      width={700}
      okText={draft ? "Update" : "Create"}
    >
      <div style={{ marginBottom: 16 }}>
        <Input
          placeholder="Draft title..."
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
        />
      </div>

      <div style={{ marginBottom: 16 }}>
        <TextArea
          rows={6}
          placeholder="Write your content here..."
          value={form.content}
          onChange={(e) => setForm({ ...form, content: e.target.value })}
          showCount
          maxLength={2000}
        />
      </div>

      <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
        <Select
          placeholder="Select platform"
          value={form.platform}
          onChange={(value) => setForm({ ...form, platform: value })}
          style={{ flex: 1 }}
        >
          {platforms.map(platform => (
            <Option key={platform.value} value={platform.value}>
              <Tag color={platform.color}>{platform.label}</Tag>
            </Option>
          ))}
        </Select>

        <Select
          placeholder="Select status"
          value={form.status}
          onChange={(value) => setForm({ ...form, status: value })}
          style={{ flex: 1 }}
        >
          {statuses.map(status => (
            <Option key={status.value} value={status.value}>
              <Tag color={status.color}>{status.label}</Tag>
            </Option>
          ))}
        </Select>
      </div>

      <div style={{ display: 'flex', gap: 16 }}>
        <Input
          placeholder="Hashtags: #marketing #social"
          value={form.hashtags}
          onChange={(e) => setForm({ ...form, hashtags: e.target.value })}
          style={{ flex: 1 }}
        />

        <Select
          value={form.tone}
          onChange={(value) => setForm({ ...form, tone: value })}
          style={{ width: 150 }}
        >
          <Option value="professional">Professional</Option>
          <Option value="casual">Casual</Option>
          <Option value="friendly">Friendly</Option>
          <Option value="urgent">Urgent</Option>
        </Select>
      </div>
    </Modal>
  );
};

export default ContentDrafts;