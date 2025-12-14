import { useState, useEffect } from 'react';
import { Tree, Input, Button, message, Empty, Spin, Tooltip } from 'antd';
import { ProjectOutlined, ApiOutlined, PlusOutlined, ReloadOutlined } from '@ant-design/icons';
import { projectApi, apiInfoApi } from '../services/api';
import type { ProjectItem, ApiInfoItem, QueryApiRequest } from '../types/api';
import type { DataNode } from 'antd/es/tree';

interface ProjectNavigationProps {
  onSelectProject?: (project: ProjectItem | null) => void;
  onSelectApi?: (api: ApiInfoItem | null) => void;
  onAddApi?: (project: ProjectItem) => void;
  selectedProjectId?: string;
  selectedApiId?: number;
}

interface ProjectNode extends DataNode {
  project?: ProjectItem;
  api?: ApiInfoItem;
  isProject: boolean;
}

export const ProjectNavigation = ({ 
  onSelectProject, 
  onSelectApi, 
  onAddApi,
  selectedProjectId,
  selectedApiId 
}: ProjectNavigationProps) => {
  const [loading, setLoading] = useState(false);
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [apiMap, setApiMap] = useState<Map<string, ApiInfoItem[]>>(new Map()); // key: project.id (as string)
  const [expandedKeys, setExpandedKeys] = useState<React.Key[]>([]);
  const [searchValue, setSearchValue] = useState('');

  const loadProjects = async () => {
    setLoading(true);
    try {
      const response = await projectApi.query({ page: 1, page_size: 1000 });
      setProjects(response.items);
    } catch (error: any) {
      message.error(error.response?.data?.error || '加载项目列表失败');
    } finally {
      setLoading(false);
    }
  };

  const loadApisForProject = async (projectId: number): Promise<void> => {
    try {
      const params: QueryApiRequest = {
        project_id: projectId,
        page: 1,
        page_size: 1000,
      };
      const response = await apiInfoApi.query(params);
      setApiMap(prev => {
        const newMap = new Map(prev);
        newMap.set(String(projectId), response.items);
        return newMap;
      });
    } catch (error: any) {
      console.error('加载接口列表失败:', error);
      message.error(error.response?.data?.error || '加载接口列表失败');
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  useEffect(() => {
    if (selectedProjectId) {
      const project = projects.find(p => p.project_id === selectedProjectId);
      if (project) {
        const apis = apiMap.get(String(project.id));
        if (!apis) {
          loadApisForProject(project.id);
        }
      }
    }
  }, [selectedProjectId, projects]);

  const buildTreeData = (): ProjectNode[] => {
    return projects.map(project => {
      const apis = apiMap.get(String(project.id));
      const apiChildren: ProjectNode[] = apis ? apis.map(api => ({
        key: `api-${api.id}`,
        title: (
          <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ApiOutlined style={{ color: '#1890ff' }} />
            <span style={{ fontWeight: 500 }}>{api.method}</span>
            <span style={{ color: '#666' }}>{api.path}</span>
          </span>
        ),
        isProject: false,
        api,
      })) : [];

      return {
        key: `project-${project.project_id}`,
        title: (
          <div 
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              width: '100%',
              paddingRight: '8px'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, flex: 1 }}>
              <ProjectOutlined style={{ color: '#667eea' }} />
              {project.name}
            </span>
            <Tooltip title="添加接口" placement="right">
              <Button
                type="text"
                size="small"
                icon={<PlusOutlined />}
                onClick={(e) => {
                  e.stopPropagation();
                  onAddApi?.(project);
                }}
                style={{ 
                  padding: '0 4px',
                  height: '20px',
                  width: '20px',
                  minWidth: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              />
            </Tooltip>
          </div>
        ),
        isProject: true,
        project,
        children: apiChildren,
      };
    });
  };

  const handleSelect = async (selectedKeys: React.Key[], info: any) => {
    if (selectedKeys.length === 0) {
      onSelectProject?.(null);
      onSelectApi?.(null);
      return;
    }

    const key = selectedKeys[0] as string;
    const node = info.node as ProjectNode;
    
    if (key.startsWith('project-')) {
      const projectId = key.replace('project-', '');
      const project = node.project || projects.find(p => p.project_id === projectId);
      if (project) {
        onSelectProject?.(project);
        onSelectApi?.(null);
        
        // 先展开项目节点
        if (!expandedKeys.includes(key)) {
          setExpandedKeys([...expandedKeys, key]);
        }
        
        // 然后加载接口数据
        const apiKey = String(project.id);
        if (!apiMap.has(apiKey)) {
          await loadApisForProject(project.id);
        }
      }
    } else if (key.startsWith('api-')) {
      const api = node.api;
      
      if (api) {
        onSelectApi?.(api);
        const project = projects.find(p => p.id === api.project_id);
        if (project) {
          onSelectProject?.(project);
          const projectKey = `project-${project.project_id}`;
          if (!expandedKeys.includes(projectKey)) {
            setExpandedKeys([...expandedKeys, projectKey]);
          }
          const apiKey = String(project.id);
          if (!apiMap.has(apiKey)) {
            await loadApisForProject(project.id);
          }
        }
      } else {
        const apiId = parseInt(key.replace('api-', ''));
        const allApis = Array.from(apiMap.values()).flat();
        const foundApi = allApis.find(a => a.id === apiId);
        if (foundApi) {
          onSelectApi?.(foundApi);
          const project = projects.find(p => p.id === foundApi.project_id);
          if (project) {
            onSelectProject?.(project);
            const projectKey = `project-${project.project_id}`;
            if (!expandedKeys.includes(projectKey)) {
              setExpandedKeys([...expandedKeys, projectKey]);
            }
            const apiKey = String(project.id);
            if (!apiMap.has(apiKey)) {
              await loadApisForProject(project.id);
            }
          }
        } else {
          console.error('接口未找到，ID:', apiId);
        }
      }
    }
  };

  const handleExpand = async (expandedKeys: React.Key[]) => {
    setExpandedKeys(expandedKeys);
    for (const key of expandedKeys) {
      if (typeof key === 'string' && key.startsWith('project-')) {
        const projectIdStr = key.replace('project-', '');
        const project = projects.find(p => p.project_id === projectIdStr);
        if (project) {
          const apiKey = String(project.id);
          if (!apiMap.has(apiKey)) {
            await loadApisForProject(project.id);
          }
        }
      }
    }
  };

  const getSelectedKeys = (): React.Key[] => {
    if (selectedApiId) {
      return [`api-${selectedApiId}`];
    }
    if (selectedProjectId) {
      return [`project-${selectedProjectId}`];
    }
    return [];
  };

  const treeData = buildTreeData();

  return (
    <div style={{ 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column',
      background: '#fff',
      borderRight: '1px solid #e8e8e8'
    }}>
      <div style={{ padding: '16px', borderBottom: '1px solid #e8e8e8' }}>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
          <Input
            placeholder="搜索项目或接口"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            allowClear
            style={{ flex: 1 }}
          />
          <Button
            icon={<ReloadOutlined />}
            onClick={loadProjects}
            loading={loading}
          />
        </div>
      </div>
      <div style={{ flex: 1, overflow: 'auto', padding: '8px' }}>
        <Spin spinning={loading}>
          {treeData.length === 0 ? (
            <Empty 
              description="暂无项目" 
              style={{ padding: '40px 0' }}
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          ) : (
            <Tree
              treeData={treeData}
              selectedKeys={getSelectedKeys()}
              expandedKeys={expandedKeys}
              onSelect={handleSelect}
              onExpand={handleExpand}
              blockNode
              showLine={{ showLeafIcon: false }}
            />
          )}
        </Spin>
      </div>
    </div>
  );
};

