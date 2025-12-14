import { Card, Descriptions, Button, Tag, Space, Divider } from 'antd';
import { EditOutlined, CalendarOutlined, UserOutlined } from '@ant-design/icons';
import type { ProjectItem } from '../types/api';

interface ProjectDetailProps {
  project: ProjectItem | null;
  onEdit?: (project: ProjectItem) => void;
}

export const ProjectDetail = ({ project, onEdit }: ProjectDetailProps) => {
  if (!project) {
    return (
      <div style={{ 
        height: '100%', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: '#fff',
        color: '#999'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📋</div>
          <div style={{ fontSize: '16px' }}>请从左侧选择一个项目查看详情</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ height: '100%', overflow: 'auto', background: '#f0f2f5', padding: '24px' }}>
      <Card
        title={
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '20px', fontWeight: 600 }}>{project.name}</span>
            <Button
              type="primary"
              icon={<EditOutlined />}
              onClick={() => onEdit?.(project)}
            >
              编辑项目
            </Button>
          </div>
        }
        style={{ borderRadius: '8px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)' }}
      >
        <Descriptions bordered column={1} size="middle">
          <Descriptions.Item label="项目ID">
            <Tag color="blue">{project.project_id}</Tag>
          </Descriptions.Item>
          
          <Descriptions.Item label="项目描述">
            {project.description || <span style={{ color: '#999' }}>暂无描述</span>}
          </Descriptions.Item>

          <Descriptions.Item label="创建者">
            <Space>
              <UserOutlined />
              {project.creator}
            </Space>
          </Descriptions.Item>

          <Descriptions.Item label="编辑者">
            <Space>
              <UserOutlined />
              {project.editor}
            </Space>
          </Descriptions.Item>

          <Descriptions.Item label="创建时间">
            <Space>
              <CalendarOutlined />
              {new Date(project.ctime).toLocaleString('zh-CN')}
            </Space>
          </Descriptions.Item>

          <Descriptions.Item label="更新时间">
            <Space>
              <CalendarOutlined />
              {new Date(project.mtime).toLocaleString('zh-CN')}
            </Space>
          </Descriptions.Item>
        </Descriptions>
      </Card>
    </div>
  );
};

