import { Card, Button, Tag, Space, Tabs, Typography, message, Divider, Alert, Spin } from 'antd';
import { 
  EditOutlined, 
  UserOutlined, 
  ApiOutlined, 
  CopyOutlined, 
  CodeOutlined,
  LinkOutlined,
  FileTextOutlined,
  HistoryOutlined,
  CheckOutlined
} from '@ant-design/icons';
import type { ApiInfoItem } from '../types/api';
import { SchemaViewer } from './SchemaViewer';
import {
  mockGenerationStatusLabel,
  mockGenerationStatusTagColor,
  normalizeMockGenerationStatus,
} from '../utils/mockGenerationStatus';

const { Title, Text } = Typography;

interface ApiDetailProps {
  api: ApiInfoItem | null;
  onEdit?: (api: ApiInfoItem) => void;
}

const getMethodStyle = (method: string) => {
  const methodLower = method.toLowerCase();
  const colors: Record<string, { bg: string; text: string; border: string }> = {
    get: { bg: 'rgba(82, 196, 26, 0.1)', text: '#52c41a', border: '#b7eb8f' },
    post: { bg: 'rgba(24, 144, 255, 0.1)', text: '#1890ff', border: '#91d5ff' },
    put: { bg: 'rgba(250, 173, 20, 0.1)', text: '#faad14', border: '#ffd591' },
    delete: { bg: 'rgba(255, 77, 79, 0.1)', text: '#ff4d4f', border: '#ffa39e' },
    patch: { bg: 'rgba(114, 46, 209, 0.1)', text: '#722ed1', border: '#d3adf7' },
  };
  return colors[methodLower] || { bg: '#f5f5f5', text: '#595959', border: '#d9d9d9' };
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
          <div style={{ fontSize: '64px', marginBottom: '16px', opacity: 0.5 }}>🔌</div>
          <Title level={4} style={{ color: '#bfbfbf' }}>请从左侧选择一个接口查看详情</Title>
        </div>
      </div>
    );
  }

  const methodStyle = getMethodStyle(api.method);

  const tabItems = [
    {
      key: 'basic',
      label: '基本信息',
      children: (
        <div style={{ padding: '8px 0', maxWidth: '900px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
            {/* 核心路径卡片 - 跨两列 */}
            <div style={{ 
              gridColumn: 'span 2',
              background: '#fff', 
              border: '1px solid #f0f0f0', 
              borderRadius: '16px', 
              padding: '24px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
            }}>
              <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Space>
                  <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(102, 126, 234, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <LinkOutlined style={{ color: '#667eea' }} />
                  </div>
                  <Text strong style={{ fontSize: '15px' }}>接口路径</Text>
                </Space>
                <Tag bordered={false} color="blue">当前版本: {api.version}</Tag>
              </div>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '12px',
                background: '#f8f9fc',
                padding: '16px 20px',
                borderRadius: '10px',
                border: '1px solid #edf2f7'
              }}>
                <span style={{
                  padding: '4px 12px',
                  borderRadius: '6px',
                  background: methodStyle.bg,
                  color: methodStyle.text,
                  fontWeight: 800,
                  fontSize: '13px',
                  boxShadow: `0 2px 4px ${methodStyle.bg}`
                }}>
                  {api.method.toUpperCase()}
                </span>
                <Text 
                  copyable={{ icon: [<CopyOutlined key="copy" />, <CheckOutlined key="check" />] }} 
                  style={{ fontFamily: '"Cascadia Code", Consolas, monospace', fontSize: '16px', color: '#2d3748', flex: 1 }}
                >
                  {api.path}
                </Text>
              </div>
            </div>

            {/* 功能描述 */}
            <div style={{ 
              background: '#fff', 
              border: '1px solid #f0f0f0', 
              borderRadius: '16px', 
              padding: '24px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
            }}>
              <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FileTextOutlined style={{ color: '#667eea' }} />
                <Text strong style={{ fontSize: '15px' }}>功能描述</Text>
              </div>
              <div style={{ 
                color: '#4a5568',
                fontSize: '14px',
                lineHeight: '1.8',
                background: '#fcfcfd',
                padding: '12px',
                borderRadius: '8px',
                minHeight: '100px'
              }}>
                {api.description || <Text type="secondary" italic>暂无详细功能描述...</Text>}
              </div>
            </div>

            {/* 维护与时间 */}
            <div style={{ 
              background: '#fff', 
              border: '1px solid #f0f0f0', 
              borderRadius: '16px', 
              padding: '24px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
            }}>
              <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <HistoryOutlined style={{ color: '#667eea' }} />
                <Text strong style={{ fontSize: '15px' }}>维护信息</Text>
              </div>
              <div style={{ display: 'grid', gap: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Text type="secondary">创建者</Text>
                  <Space><UserOutlined style={{ color: '#bfbfbf' }} /><Text strong>{api.creator}</Text></Space>
                </div>
                <Divider style={{ margin: 0, opacity: 0.4 }} />
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Text type="secondary">最后编辑</Text>
                  <Space><EditOutlined style={{ color: '#bfbfbf' }} /><Text strong>{api.editor}</Text></Space>
                </div>
                <Divider style={{ margin: 0, opacity: 0.4 }} />
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Text type="secondary">更新时间</Text>
                  <Text style={{ color: '#718096', fontSize: '13px' }}>{new Date(api.mtime).toLocaleString()}</Text>
                </div>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'request',
      label: '请求参数',
      children: (
        <div style={{ marginTop: '8px' }}>
          <SchemaViewer schema={api.req_schema || ''} />
        </div>
      ),
    },
    {
      key: 'response',
      label: '响应参数',
      children: (
        <div style={{ marginTop: '8px' }}>
          <SchemaViewer schema={api.resp_schema || ''} />
        </div>
      ),
    },
    {
      key: 'mock',
      label: 'Mock 数据',
      children: (
        <div style={{ 
          height: '100%', 
          paddingTop: '8px',
          display: 'flex',
          flexDirection: 'column'
        }}>
          {(() => {
            const st = normalizeMockGenerationStatus(api.mock_generation_status);
            const inProgress = st === 'pending' || st === 'running';
            return (
              <Space direction="vertical" style={{ width: '100%', marginBottom: 12 }} size="small">
                <Space wrap align="center">
                  <Text type="secondary">生成状态</Text>
                  <Tag color={mockGenerationStatusTagColor(api.mock_generation_status)}>
                    {mockGenerationStatusLabel(api.mock_generation_status)}
                  </Tag>
                  {api.mock_generation_updated_at ? (
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      更新于 {new Date(api.mock_generation_updated_at).toLocaleString('zh-CN')}
                    </Text>
                  ) : null}
                </Space>
                {inProgress ? (
                  <Alert
                    type="info"
                    showIcon
                    message="Mock 正在后台生成"
                    description="保存后由服务端异步生成，请稍后点击左侧树重新展开项目或刷新列表，再选中本接口查看最新 Mock。"
                  />
                ) : null}
                {st === 'failed' && api.mock_generation_error ? (
                  <Alert type="error" showIcon message="生成失败" description={api.mock_generation_error} />
                ) : null}
              </Space>
            );
          })()}
          <Card 
            size="small" 
            title={
              <Space>
                <CodeOutlined />JSON Mock 示例
                {normalizeMockGenerationStatus(api.mock_generation_status) === 'running' ? (
                  <Spin size="small" />
                ) : null}
              </Space>
            }
            extra={
              <Button 
                type="link" 
                size="small" 
                onClick={() => {
                  navigator.clipboard.writeText(api.mock_data || '');
                  message.success('Mock数据已复制');
                }}
              >
                复制数据
              </Button>
            }
            style={{ 
              flex: 1, 
              display: 'flex', 
              flexDirection: 'column',
              overflow: 'hidden'
            }}
            styles={{ body: { flex: 1, overflow: 'hidden', padding: 0 } }}
          >
            <div style={{ 
              background: '#282c34', 
              padding: '16px', 
              height: '100%',
              boxSizing: 'border-box',
              overflow: 'auto'
            }}>
              <pre style={{ 
                margin: 0, 
                color: '#abb2bf', 
                fontFamily: '"Cascadia Code", Consolas, monospace',
                fontSize: '13px',
                lineHeight: 1.6
              }}>
                {api.mock_data ? (
                  (() => {
                    try {
                      return JSON.stringify(JSON.parse(api.mock_data), null, 2);
                    } catch (e) {
                      return api.mock_data;
                    }
                  })()
                ) : normalizeMockGenerationStatus(api.mock_generation_status) === 'pending' ||
                  normalizeMockGenerationStatus(api.mock_generation_status) === 'running' ? (
                  <span style={{ color: '#5c6370', fontStyle: 'italic' }}>// Mock 生成中，请手动刷新后再查看</span>
                ) : (
                  <span style={{ color: '#5c6370', fontStyle: 'italic' }}>// 暂无 Mock 数据</span>
                )}
              </pre>
            </div>
          </Card>
        </div>
      ),
    },
  ];

  return (
    <div className="api-detail-animate-container" style={{ 
      height: '100%', 
      display: 'flex',
      flexDirection: 'column',
      background: '#f8f9fc', // 稍微亮一点的背景
      padding: '0', // 移除外部 padding，由内部控制
      boxSizing: 'border-box',
      overflow: 'hidden'
    }}>
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .api-detail-animate-container {
          animation: fadeInUp 0.4s cubic-bezier(0.23, 1, 0.32, 1);
        }
        .api-detail-main-card .ant-tabs {
          display: flex;
          flex-direction: column;
          height: 100%;
        }
        .api-detail-main-card .ant-tabs-nav {
          margin-bottom: 0 !important;
          padding: 0 32px;
          background: #fff;
        }
        .api-detail-main-card .ant-tabs-content {
          flex: 1;
          height: 100%;
        }
        .api-detail-main-card .ant-tabs-tabpane {
          height: 100%;
          overflow: auto;
          padding: 24px 32px !important;
        }
        /* 隐藏滚动条但保留功能 */
        .api-detail-main-card .ant-tabs-tabpane::-webkit-scrollbar {
          width: 6px;
        }
        .api-detail-main-card .ant-tabs-tabpane::-webkit-scrollbar-thumb {
          background: #e8e8e8;
          border-radius: 3px;
        }
      `}</style>

      {/* Hero Header 区域 */}
      <div style={{ 
        background: '#fff',
        padding: '32px 32px 24px',
        borderBottom: '1px solid #f0f0f0',
        flexShrink: 0,
        position: 'relative',
        zIndex: 10
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <Space direction="vertical" size={12}>
            <Space align="center" size={16}>
              <div style={{ 
                width: '48px', 
                height: '48px', 
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
              }}>
                <ApiOutlined style={{ fontSize: '24px', color: '#fff' }} />
              </div>
              <div>
                <Title level={2} style={{ margin: 0, fontWeight: 700, letterSpacing: '-0.5px' }}>
                  {api.title}
                </Title>
                <div style={{ marginTop: '4px' }}>
                  <Space split={<Divider type="vertical" style={{ borderColor: '#e8e8e8' }} />}>
                    <Text type="secondary" style={{ fontSize: '13px', fontFamily: 'monospace' }}>
                      ID: {api.id}
                    </Text>
                    <Text type="secondary" style={{ fontSize: '13px' }}>
                      <UserOutlined style={{ marginRight: '4px' }} />
                      {api.editor}
                    </Text>
                    <Tag color={methodStyle.text === '#52c41a' ? 'success' : 'processing'} bordered={false} style={{ margin: 0 }}>
                      {api.version}
                    </Tag>
                  </Space>
                </div>
              </div>
            </Space>
          </Space>
          
          <Button
            type="primary"
            size="large"
            icon={<EditOutlined />}
            onClick={() => onEdit?.(api)}
            style={{ 
              height: '44px',
              padding: '0 24px',
              borderRadius: '8px', 
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              border: 'none',
              boxShadow: '0 4px 12px rgba(118, 75, 162, 0.3)',
              fontWeight: 600
            }}
          >
            编辑文档
          </Button>
        </div>
      </div>

      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        <Card
          className="api-detail-main-card"
          bordered={false}
          style={{ 
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            borderRadius: 0,
            background: 'transparent'
          }}
          styles={{ 
            body: { 
              padding: 0,
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden'
            } 
          }}
        >
          <Tabs 
            items={tabItems} 
            size="large" 
            indicator={{ size: (origin) => origin - 20, align: 'center' }}
            style={{ height: '100%' }}
          />
        </Card>
      </div>
    </div>
  );
};


