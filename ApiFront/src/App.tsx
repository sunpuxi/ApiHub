import { useState } from 'react';
import { Layout, Typography, Space, Tag, Button, Tooltip, Divider } from 'antd';
import { 
  GithubOutlined, 
  BookOutlined, 
  QuestionCircleOutlined,
  ThunderboltFilled 
} from '@ant-design/icons';
import { ProjectNavigation } from './components/ProjectNavigation';
import { ProjectDetail } from './components/ProjectDetail';
import { ApiDetail } from './components/ApiDetail';
import { ProjectModal } from './components/ProjectModal';
import { ApiModal } from './components/ApiModal';
import { ApiEditForm } from './components/ApiEditForm';
import type { ProjectItem, ApiInfoItem } from './types/api';
import { apiInfoApi } from './services/api';
import './App.css';

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

function App() {
  const [selectedProject, setSelectedProject] = useState<ProjectItem | null>(null);
  const [selectedApi, setSelectedApi] = useState<ApiInfoItem | null>(null);
  const [projectModalOpen, setProjectModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<ProjectItem | null>(null);
  const [apiModalOpen, setApiModalOpen] = useState(false);
  const [editingApi, setEditingApi] = useState<ApiInfoItem | null>(null);
  const [showApiEdit, setShowApiEdit] = useState(false);
  const [editingApiForDetail, setEditingApiForDetail] = useState<ApiInfoItem | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleSelectProject = (project: ProjectItem | null) => {
    setSelectedProject(project);
    // 明确选择项目时，清空接口选择
    setSelectedApi(null);
  };

  const handleSelectApi = (api: ApiInfoItem | null) => {
    setSelectedApi(api);
    // 如果选择了接口，同时设置对应的项目（用于展开节点等，但不应该清空接口选择）
    if (api) {
      // 通过接口的 project_id 查找项目并设置，但不触发 handleSelectProject（避免清空接口选择）
      // 这里不需要额外操作，因为项目信息可以通过接口的 project_id 获取
    }
  };

  const handleProjectEdit = (project: ProjectItem) => {
    setEditingProject(project);
    setProjectModalOpen(true);
  };

  const handleApiEdit = (api: ApiInfoItem) => {
    setEditingApiForDetail(api);
    setShowApiEdit(true);
    // 不再调用 setSelectedApi(null)，保留当前接口的选中状态，以便取消编辑时回退
  };

  const handleAddApi = (project: ProjectItem) => {
    setSelectedProject(project);
    setSelectedApi(null);
    setEditingApiForDetail(null);
    setShowApiEdit(true);
  };

  const handleProjectModalSuccess = () => {
    setProjectModalOpen(false);
    setEditingProject(null);
    setRefreshTrigger(prev => prev + 1);
  };

  const handleApiModalSuccess = async (apiId?: number) => {
    setApiModalOpen(false);
    setEditingApi(null);
    setRefreshTrigger(prev => prev + 1);
    if (apiId) {
      try {
        const api = await apiInfoApi.getDetail(apiId);
        setSelectedApi(api);
      } catch (e) {
        console.error('获取详情失败', e);
      }
    }
  };

  return (
    <Layout style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header style={{ 
        background: 'rgba(20, 20, 20, 0.95)', // 半透明
        backdropFilter: 'blur(10px)', // 磨砂玻璃
        padding: '0 24px', 
        flexShrink: 0,
        height: '64px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)', // 更柔和的投影
        zIndex: 1000,
        position: 'relative'
      }}>
        {/* 背景动态装饰 */}
        <div style={{
          position: 'absolute',
          top: '-100%',
          left: '0',
          width: '100%',
          height: '200%',
          background: 'linear-gradient(to bottom, rgba(102, 126, 234, 0.05) 0%, transparent 100%)',
          zIndex: 0,
          pointerEvents: 'none'
        }} />

        <div style={{ 
          zIndex: 1,
          display: 'flex',
          alignItems: 'center',
          gap: '16px'
        }}>
          {/* Logo 区域 */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            background: 'rgba(255, 255, 255, 0.03)',
            padding: '4px 12px',
            borderRadius: '8px',
            border: '1px solid rgba(255, 255, 255, 0.08)'
          }}>
            <ThunderboltFilled style={{ 
              fontSize: '18px', 
              color: '#764ba2', 
              marginRight: '8px',
              filter: 'drop-shadow(0 0 8px rgba(118, 75, 162, 0.6))' 
            }} />
            <div style={{ fontSize: '18px', letterSpacing: '1.5px' }}>
              <span style={{ color: '#fff', fontWeight: 800 }}>API</span>
              <span style={{ 
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontWeight: 800,
                marginLeft: '2px'
              }}>HUB</span>
            </div>
          </div>
          
          <Divider type="vertical" style={{ borderColor: 'rgba(255, 255, 255, 0.15)', height: '20px' }} />
          
          <div style={{ display: 'flex', flexDirection: 'column', lineHeight: '1.1' }}>
            <Text style={{ color: 'rgba(255, 255, 255, 0.8)', fontWeight: 500, fontSize: '13px' }}>
              接口管理平台
            </Text>
            <Text style={{ color: 'rgba(255, 255, 255, 0.3)', fontSize: '10px', fontFamily: 'monospace', letterSpacing: '0.5px' }}>
              INTERNAL OPS V1.0
            </Text>
          </div>
        </div>

        {/* 右侧工具栏 */}
        <div style={{ zIndex: 1, display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Space size={4}>
            <Tooltip title="使用帮助">
              <Button type="text" size="small" icon={<BookOutlined style={{ color: 'rgba(255, 255, 255, 0.45)' }} />} />
            </Tooltip>
            <Tooltip title="反馈问题">
              <Button type="text" size="small" icon={<QuestionCircleOutlined style={{ color: 'rgba(255, 255, 255, 0.45)' }} />} />
            </Tooltip>
            <Tooltip title="Github">
              <Button type="text" size="small" icon={<GithubOutlined style={{ color: 'rgba(255, 255, 255, 0.45)' }} />} />
            </Tooltip>
          </Space>
          
          <div style={{ 
            background: 'rgba(82, 196, 26, 0.1)', 
            padding: '2px 10px',
            borderRadius: '20px',
            border: '1px solid rgba(82, 196, 26, 0.2)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <span className="online-pulse" style={{ 
              width: '6px', 
              height: '6px', 
              background: '#52c41a', 
              borderRadius: '50%',
              boxShadow: '0 0 8px #52c41a'
            }} />
            <span style={{ color: '#52c41a', fontSize: '11px', fontWeight: 600, letterSpacing: '0.5px' }}>ONLINE</span>
          </div>
        </div>
        <style>{`
          @keyframes pulse {
            0% { transform: scale(0.95); opacity: 0.7; }
            50% { transform: scale(1.05); opacity: 1; }
            100% { transform: scale(0.95); opacity: 0.7; }
          }
          .online-pulse { animation: pulse 2s infinite ease-in-out; }
        `}</style>
      </Header>
      <Layout style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
        {/* 顶部发光装饰，平滑 Header 与 Content 的过渡 */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '1px',
          background: 'linear-gradient(to right, transparent, rgba(102, 126, 234, 0.5), transparent)',
          zIndex: 1001,
          boxShadow: '0 0 15px rgba(102, 126, 234, 0.3)'
        }} />
        
        <Sider 
          width={320} 
          style={{ 
            background: '#fff',
            overflow: 'hidden',
            flexShrink: 0,
            borderRight: '1px solid #f0f0f0'
          }}
        >
          <ProjectNavigation
            onSelectProject={handleSelectProject}
            onSelectApi={handleSelectApi}
            onAddApi={handleAddApi}
            onCreateProject={() => {
              setEditingProject(null);
              setProjectModalOpen(true);
            }}
            selectedProjectId={selectedProject?.project_id}
            selectedApiId={selectedApi?.id}
            refreshTrigger={refreshTrigger}
          />
        </Sider>
        <Content style={{ overflow: 'hidden', background: '#f0f2f5' }}>
          {showApiEdit ? (
            <ApiEditForm
              editingApi={editingApiForDetail}
              defaultProjectId={selectedProject?.id}
              onSave={async (apiId) => {
                setShowApiEdit(false);
                setEditingApiForDetail(null);
                setRefreshTrigger(prev => prev + 1); // 触发侧边栏刷新
                if (apiId) {
                  try {
                    const api = await apiInfoApi.getDetail(apiId);
                    setSelectedApi(api);
                  } catch (e) {
                    console.error('获取详情失败', e);
                  }
                }
              }}
              onCancel={() => {
                setShowApiEdit(false);
                setEditingApiForDetail(null);
              }}
            />
          ) : selectedApi ? (
            <ApiDetail api={selectedApi} onEdit={handleApiEdit} />
          ) : (
            <ProjectDetail project={selectedProject} onEdit={handleProjectEdit} />
          )}
        </Content>
      </Layout>

      <ProjectModal
        open={projectModalOpen}
        onCancel={() => {
          setProjectModalOpen(false);
          setEditingProject(null);
        }}
        onSuccess={handleProjectModalSuccess}
        editingProject={editingProject}
      />

      <ApiModal
        open={apiModalOpen}
        onCancel={() => {
          setApiModalOpen(false);
          setEditingApi(null);
        }}
        onSuccess={handleApiModalSuccess}
        editingApi={editingApi}
      />
    </Layout>
  );
}

export default App;
