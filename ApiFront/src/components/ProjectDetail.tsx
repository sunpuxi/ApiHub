import { Card, Descriptions, Button, Tag, Space, Typography, Divider } from 'antd';
import { EditOutlined, CalendarOutlined, UserOutlined, ProjectOutlined } from '@ant-design/icons';
import type { ProjectItem } from '../types/api';

const { Title, Text } = Typography;

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
          <div style={{ fontSize: '64px', marginBottom: '16px', opacity: 0.5 }}>📋</div>
          <Title level={4} style={{ color: '#bfbfbf' }}>请从左侧选择一个项目查看详情</Title>
        </div>
      </div>
    );
  }

  return (
    <div className="project-detail-animate-container" style={{ height: '100%', overflow: 'auto', background: '#f0f2f5', padding: '24px' }}>
      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .project-detail-animate-container {
          animation: fadeInUp 0.4s cubic-bezier(0.23, 1, 0.32, 1);
        }
      `}</style>

      {/* 页头区域 */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <Space direction="vertical" size={4}>
            <Title level={2} style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '12px' }}>
              <ProjectOutlined style={{ color: '#667eea' }} />
              {project.name}
            </Title>
            <Space split={<Text type="secondary">|</Text>}>
              <Text type="secondary">项目 ID: {project.project_id}</Text>
              <Text type="secondary">创建者: {project.creator}</Text>
            </Space>
          </Space>
          <Button
            type="primary"
            size="large"
            icon={<EditOutlined />}
            onClick={() => onEdit?.(project)}
            style={{ 
              borderRadius: '6px', 
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              border: 'none',
              boxShadow: '0 4px 10px rgba(102, 126, 234, 0.3)'
            }}
          >
            编辑项目
          </Button>
        </div>
      </div>

      <Card
        bordered={false}
        style={{ borderRadius: '12px', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)' }}
        styles={{ body: { padding: '24px' } }}
      >
        <Descriptions 
          title={<Space><Text strong style={{ fontSize: '16px' }}>基本配置</Text></Space>}
          bordered 
          column={{ xxl: 2, xl: 2, lg: 1, md: 1, sm: 1, xs: 1 }}
          size="middle"
          labelStyle={{ background: '#fafafa', fontWeight: 500, width: '120px' }}
        >
          <Descriptions.Item label="项目名称" span={2}>
            <Text strong>{project.name}</Text>
          </Descriptions.Item>
          
          <Descriptions.Item label="项目 ID">
            <Tag color="blue" style={{ borderRadius: '4px' }}>{project.project_id}</Tag>
          </Descriptions.Item>

          <Descriptions.Item label="数据库 ID">
            <Text type="secondary">{project.id}</Text>
          </Descriptions.Item>

          <Descriptions.Item label="项目描述" span={2}>
            <div style={{ color: '#595959', minHeight: '60px', whiteSpace: 'pre-wrap' }}>
              {project.description || <Text type="secondary" italic>暂无项目详细描述信息</Text>}
            </div>
          </Descriptions.Item>
        </Descriptions>

        <Divider style={{ margin: '32px 0' }} />

        <Descriptions 
          title={<Space><Text strong style={{ fontSize: '16px' }}>维护记录</Text></Space>}
          bordered 
          column={{ xxl: 2, xl: 2, lg: 1, md: 1, sm: 1, xs: 1 }}
          size="middle"
          labelStyle={{ background: '#fafafa', fontWeight: 500, width: '120px' }}
        >
          <Descriptions.Item label="管理员信息">
            <Space direction="vertical" size={4}>
              <Space><UserOutlined style={{ color: '#8c8c8c' }} /><Text type="secondary">创建人:</Text> {project.creator}</Space>
              <Space><EditOutlined style={{ color: '#8c8c8c' }} /><Text type="secondary">最近编辑:</Text> {project.editor}</Space>
            </Space>
          </Descriptions.Item>

          <Descriptions.Item label="状态节点">
            <Tag color={project.is_del ? 'default' : 'success'}>
              {project.is_del ? '已归档' : '活跃中'}
            </Tag>
          </Descriptions.Item>

          <Descriptions.Item label="关键时间点">
            <Space direction="vertical" size={4}>
              <Space><CalendarOutlined style={{ color: '#8c8c8c' }} /><Text type="secondary">立项时间:</Text> {new Date(project.ctime).toLocaleString('zh-CN')}</Space>
              <Space><CalendarOutlined style={{ color: '#8c8c8c' }} /><Text type="secondary">最后更新:</Text> {new Date(project.mtime).toLocaleString('zh-CN')}</Space>
            </Space>
          </Descriptions.Item>
        </Descriptions>
      </Card>
    </div>
  );
};
