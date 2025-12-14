import { Card, Descriptions, Button, Tag, Space, Tabs } from 'antd';
import { EditOutlined, CalendarOutlined, UserOutlined, ApiOutlined } from '@ant-design/icons';
import type { ApiInfoItem } from '../types/api';

interface ApiDetailProps {
  api: ApiInfoItem | null;
  onEdit?: (api: ApiInfoItem) => void;
}

const getMethodTagColor = (method: string) => {
  const methodLower = method.toLowerCase();
  const colorMap: Record<string, string> = {
    get: '#52c41a',
    post: '#1890ff',
    put: '#faad14',
    delete: '#ff4d4f',
    patch: '#722ed1',
    head: '#13c2c2',
    options: '#eb2f96',
  };
  return colorMap[methodLower] || '#666';
};

export const ApiDetail = ({ api, onEdit }: ApiDetailProps) => {

  if (!api) {
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
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔌</div>
          <div style={{ fontSize: '16px' }}>请从左侧选择一个接口查看详情</div>
        </div>
      </div>
    );
  }

  const tabItems = [
    {
      key: 'basic',
      label: '基本信息',
      children: (
        <Descriptions bordered column={1} size="middle">
          <Descriptions.Item label="接口ID">
            <Tag color="blue">{api.id}</Tag>
          </Descriptions.Item>

          <Descriptions.Item label="接口标题">
            <strong>{api.title}</strong>
          </Descriptions.Item>

          <Descriptions.Item label="请求方法">
            <Tag color={getMethodTagColor(api.method)} style={{ fontSize: '12px', padding: '2px 8px' }}>
              {api.method}
            </Tag>
          </Descriptions.Item>

          <Descriptions.Item label="接口路径">
            <code style={{ 
              background: '#f5f5f5', 
              padding: '4px 8px', 
              borderRadius: '4px',
              fontFamily: 'monospace'
            }}>
              {api.path}
            </code>
          </Descriptions.Item>

          <Descriptions.Item label="项目ID">
            <Tag color="purple">{api.project_id}</Tag>
          </Descriptions.Item>

          <Descriptions.Item label="版本">
            <Tag>{api.version}</Tag>
          </Descriptions.Item>

          <Descriptions.Item label="接口描述">
            {api.description || <span style={{ color: '#999' }}>暂无描述</span>}
          </Descriptions.Item>

          <Descriptions.Item label="创建者">
            <Space>
              <UserOutlined />
              {api.creator}
            </Space>
          </Descriptions.Item>

          <Descriptions.Item label="编辑者">
            <Space>
              <UserOutlined />
              {api.editor}
            </Space>
          </Descriptions.Item>

          <Descriptions.Item label="创建时间">
            <Space>
              <CalendarOutlined />
              {new Date(api.ctime).toLocaleString('zh-CN')}
            </Space>
          </Descriptions.Item>

          <Descriptions.Item label="更新时间">
            <Space>
              <CalendarOutlined />
              {new Date(api.mtime).toLocaleString('zh-CN')}
            </Space>
          </Descriptions.Item>
        </Descriptions>
      ),
    },
    {
      key: 'request',
      label: '请求参数',
      children: (
        <Card title="请求参数Schema" style={{ marginTop: '16px' }}>
          <div style={{ 
            background: '#fff', 
            padding: '16px', 
            border: '1px solid #e8e8e8', 
            borderRadius: '4px',
            whiteSpace: 'pre-wrap',
            fontFamily: 'monospace',
            fontSize: '12px',
            maxHeight: '600px',
            overflow: 'auto'
          }}>
            {api.req_schema ? (
              <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                {(() => {
                  try {
                    return JSON.stringify(JSON.parse(api.req_schema || '{}'), null, 2);
                  } catch {
                    return api.req_schema;
                  }
                })()}
              </pre>
            ) : (
              <span style={{ color: '#999' }}>暂无请求参数</span>
            )}
          </div>
        </Card>
      ),
    },
    {
      key: 'response',
      label: '响应参数',
      children: (
        <Card title="响应参数Schema" style={{ marginTop: '16px' }}>
          <div style={{ 
            background: '#fff', 
            padding: '16px', 
            border: '1px solid #e8e8e8', 
            borderRadius: '4px',
            whiteSpace: 'pre-wrap',
            fontFamily: 'monospace',
            fontSize: '12px',
            maxHeight: '600px',
            overflow: 'auto'
          }}>
            {api.resp_schema ? (
              <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                {(() => {
                  try {
                    return JSON.stringify(JSON.parse(api.resp_schema || '{}'), null, 2);
                  } catch {
                    return api.resp_schema;
                  }
                })()}
              </pre>
            ) : (
              <span style={{ color: '#999' }}>暂无响应参数</span>
            )}
          </div>
        </Card>
      ),
    },
  ];

  return (
    <div style={{ height: '100%', overflow: 'auto', background: '#f0f2f5', padding: '24px' }}>
      <Card
        title={
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Space>
              <ApiOutlined style={{ fontSize: '20px', color: '#1890ff' }} />
              <span style={{ fontSize: '20px', fontWeight: 600 }}>{api.title}</span>
              <Tag color={getMethodTagColor(api.method)} style={{ fontSize: '12px', padding: '2px 8px' }}>
                {api.method}
              </Tag>
              <code style={{ 
                background: '#f5f5f5', 
                padding: '4px 8px', 
                borderRadius: '4px',
                fontFamily: 'monospace',
                fontSize: '14px'
              }}>
                {api.path}
              </code>
            </Space>
            <Button
              type="primary"
              icon={<EditOutlined />}
              onClick={() => onEdit?.(api)}
            >
              编辑接口
            </Button>
          </div>
        }
        style={{ borderRadius: '8px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)' }}
      >
        <Tabs items={tabItems} size="middle" />
      </Card>
    </div>
  );
};

