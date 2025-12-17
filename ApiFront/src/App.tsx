import { useState } from 'react';
import { Layout } from 'antd';
import { ProjectNavigation } from './components/ProjectNavigation';
import { ProjectDetail } from './components/ProjectDetail';
import { ApiDetail } from './components/ApiDetail';
import { ProjectModal } from './components/ProjectModal';
import { ApiModal } from './components/ApiModal';
import { ApiEditForm } from './components/ApiEditForm';
import type { ProjectItem, ApiInfoItem } from './types/api';
import './App.css';

const { Header, Sider, Content } = Layout;

function App() {
  const [selectedProject, setSelectedProject] = useState<ProjectItem | null>(null);
  const [selectedApi, setSelectedApi] = useState<ApiInfoItem | null>(null);
  const [projectModalOpen, setProjectModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<ProjectItem | null>(null);
  const [apiModalOpen, setApiModalOpen] = useState(false);
  const [editingApi, setEditingApi] = useState<ApiInfoItem | null>(null);
  const [showApiEdit, setShowApiEdit] = useState(false);
  const [editingApiForDetail, setEditingApiForDetail] = useState<ApiInfoItem | null>(null);

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
    setSelectedApi(null);
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
    window.location.reload();
  };

  const handleApiModalSuccess = () => {
    setApiModalOpen(false);
    setEditingApi(null);
    window.location.reload();
  };

  return (
    <Layout style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header style={{ 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
        padding: '0 24px', 
        flexShrink: 0,
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)'
      }}>
        <div style={{ 
          color: '#fff', 
          fontSize: '20px', 
          fontWeight: 'bold', 
          lineHeight: '64px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <span style={{ fontSize: '24px' }}>🚀</span>
          ApiHub - API 接口文档管理平台
        </div>
      </Header>
      <Layout style={{ flex: 1, overflow: 'hidden' }}>
        <Sider 
          width={320} 
          style={{ 
            background: '#fff',
            overflow: 'hidden',
            flexShrink: 0
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
          />
        </Sider>
        <Content style={{ overflow: 'hidden', background: '#f0f2f5' }}>
          {showApiEdit ? (
            <ApiEditForm
              editingApi={editingApiForDetail}
              defaultProjectId={selectedProject?.id}
              onSave={() => {
                setShowApiEdit(false);
                setEditingApiForDetail(null);
                window.location.reload();
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
