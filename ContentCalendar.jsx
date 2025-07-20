import React, { useState, useEffect } from 'react';
import { Calendar, Badge, Modal, Form, Input, Select, DatePicker, TimePicker, Button, notification, Popover, Card, Tag } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, CopyOutlined, EyeOutlined } from '@ant-design/icons';
import moment from 'moment';

const { TextArea } = Input;
const { Option } = Select;

const ContentCalendar = ({ onStatsUpdate }) => {
  const [events, setEvents] = useState([]);
  const [selectedDate, setSelectedDate] = useState(moment());
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [form] = Form.useForm();
  const [viewMode, setViewMode] = useState('month');

  const platforms = [
    { value: 'facebook', label: 'Facebook', color: '#4267B2' },
    { value: 'instagram', label: 'Instagram', color: '#E4405F' },
    { value: 'twitter', label: 'Twitter', color: '#1DA1F2' },
    { value: 'linkedin', label: 'LinkedIn', color: '#0077B5' },
    { value: 'tiktok', label: 'TikTok', color: '#000000' },
    { value: 'youtube', label: 'YouTube', color: '#FF0000' }
  ];

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await fetch('/api/content/calendar');
      const data = await response.json();
      setEvents(data);
    } catch (error) {
      console.error('Error fetching events:', error);
      notification.error({
        message: 'Error',
        description: 'Failed to load calendar events'
      });
    }
  };

  const getEventsForDate = (date) => {
    return events.filter(event => 
      moment(event.scheduledDate).format('YYYY-MM-DD') === date.format('YYYY-MM-DD')
    );
  };

  const dateCellRender = (date) => {
    const dayEvents = getEventsForDate(date);

    return (
      <div className="calendar-cell">
        {dayEvents.slice(0, 3).map(event => {
          const platform = platforms.find(p => p.value === event.platform);
          return (
            <Badge
              key={event.id}
              status="processing"
              color={platform?.color}
              text={
                <span 
                  className="event-badge"
                  onClick={() => handleEventClick(event)}
                >
                  {event.title.substring(0, 15)}...
                </span>
              }
            />
          );
        })}
        {dayEvents.length > 3 && (
          <div className="more-events">+{dayEvents.length - 3} more</div>
        )}
      </div>
    );
  };

  const handleEventClick = (event) => {
    setEditingEvent(event);
    form.setFieldsValue({
      ...event,
      scheduledDate: moment(event.scheduledDate),
      scheduledTime: moment(event.scheduledTime, 'HH:mm')
    });
    setIsModalVisible(true);
  };

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    setEditingEvent(null);
    form.resetFields();
    form.setFieldsValue({
      scheduledDate: date,
      scheduledTime: moment('09:00', 'HH:mm')
    });
    setIsModalVisible(true);
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      const eventData = {
        ...values,
        scheduledDate: values.scheduledDate.format('YYYY-MM-DD'),
        scheduledTime: values.scheduledTime.format('HH:mm'),
        id: editingEvent ? editingEvent.id : Date.now()
      };

      const url = editingEvent ? `/api/content/calendar/${editingEvent.id}` : '/api/content/calendar';
      const method = editingEvent ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eventData)
      });

      if (response.ok) {
        notification.success({
          message: 'Success',
          description: `Content ${editingEvent ? 'updated' : 'scheduled'} successfully`
        });
        fetchEvents();
        onStatsUpdate();
        setIsModalVisible(false);
        form.resetFields();
      }
    } catch (error) {
      console.error('Error saving event:', error);
      notification.error({
        message: 'Error',
        description: 'Failed to save content'
      });
    }
  };

  const handleDeleteEvent = async (eventId) => {
    try {
      const response = await fetch(`/api/content/calendar/${eventId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        notification.success({
          message: 'Success',
          description: 'Content deleted successfully'
        });
        fetchEvents();
        onStatsUpdate();
      }
    } catch (error) {
      console.error('Error deleting event:', error);
      notification.error({
        message: 'Error',
        description: 'Failed to delete content'
      });
    }
  };

  const handleBulkGenerate = async () => {
    try {
      const response = await fetch('/api/content/bulk-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          startDate: selectedDate.format('YYYY-MM-DD'),
          days: 7,
          platforms: ['facebook', 'instagram', 'twitter']
        })
      });

      if (response.ok) {
        notification.success({
          message: 'Success',
          description: 'Bulk content generated successfully'
        });
        fetchEvents();
        onStatsUpdate();
      }
    } catch (error) {
      console.error('Error generating bulk content:', error);
      notification.error({
        message: 'Error',
        description: 'Failed to generate bulk content'
      });
    }
  };

  return (
    <div className="content-calendar">
      <div className="calendar-header">
        <div className="calendar-controls">
          <Button type="primary" icon={<PlusOutlined />} onClick={() => handleDateSelect(moment())}>
            Schedule Content
          </Button>
          <Button icon={<CopyOutlined />} onClick={handleBulkGenerate}>
            Bulk Generate
          </Button>
          <Select 
            defaultValue="month" 
            style={{ width: 120 }} 
            onChange={setViewMode}
          >
            <Option value="month">Month</Option>
            <Option value="week">Week</Option>
          </Select>
        </div>
      </div>

      <Calendar
        value={selectedDate}
        onSelect={handleDateSelect}
        dateCellRender={dateCellRender}
        mode={viewMode === 'month' ? 'month' : 'year'}
        className="enhanced-calendar"
      />

      <Modal
        title={editingEvent ? "Edit Scheduled Content" : "Schedule New Content"}
        visible={isModalVisible}
        onOk={handleModalOk}
        onCancel={() => setIsModalVisible(false)}
        width={600}
        footer={[
          <Button key="cancel" onClick={() => setIsModalVisible(false)}>
            Cancel
          </Button>,
          editingEvent && (
            <Button 
              key="delete" 
              danger 
              icon={<DeleteOutlined />}
              onClick={() => handleDeleteEvent(editingEvent.id)}
            >
              Delete
            </Button>
          ),
          <Button key="submit" type="primary" onClick={handleModalOk}>
            {editingEvent ? 'Update' : 'Schedule'}
          </Button>
        ]}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="title"
            label="Content Title"
            rules={[{ required: true, message: 'Please enter a title' }]}
          >
            <Input placeholder="Enter content title..." />
          </Form.Item>

          <Form.Item
            name="content"
            label="Content"
            rules={[{ required: true, message: 'Please enter content' }]}
          >
            <TextArea 
              rows={4} 
              placeholder="Enter your content here..."
              showCount
              maxLength={500}
            />
          </Form.Item>

          <Form.Item
            name="platform"
            label="Platform"
            rules={[{ required: true, message: 'Please select a platform' }]}
          >
            <Select placeholder="Select platform">
              {platforms.map(platform => (
                <Option key={platform.value} value={platform.value}>
                  <Tag color={platform.color}>{platform.label}</Tag>
                </Option>
              ))}
            </Select>
          </Form.Item>

          <div style={{ display: 'flex', gap: '16px' }}>
            <Form.Item
              name="scheduledDate"
              label="Date"
              rules={[{ required: true, message: 'Please select a date' }]}
              style={{ flex: 1 }}
            >
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>

            <Form.Item
              name="scheduledTime"
              label="Time"
              rules={[{ required: true, message: 'Please select a time' }]}
              style={{ flex: 1 }}
            >
              <TimePicker style={{ width: '100%' }} format="HH:mm" />
            </Form.Item>
          </div>

          <Form.Item name="hashtags" label="Hashtags">
            <Input placeholder="#marketing #socialmedia #content" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ContentCalendar;