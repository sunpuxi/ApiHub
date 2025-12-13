import { useState } from 'react';
import { Layout, Tabs } from 'antd';
import { ProjectOutlined, ApiOutlined } from '@ant-design/icons';
import { QueryProject } from './components/QueryProject';
import { QueryApi } from './components/QueryApi';
import './App.css';

const { Header, Content } = Layout;

function App() {
  const [activeTab, setActiveTab] = useState('project');

  const tabItems = [
    {
      key: 'project',
      label: (
        <span>
          <ProjectOutlined />
          项目
        </span>
      ),
      children: <QueryProject />,
    },
    {
      key: 'api',
      label: (
        <span>
          <ApiOutlined />
          接口
        </span>
      ),
      children: <QueryApi />,
    },
  ];

  return (
    <Layout style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header style={{ background: '#001529', padding: '0 24px', flexShrink: 0 }}>
        <div style={{ color: '#fff', fontSize: '20px', fontWeight: 'bold', lineHeight: '64px' }}>
          ApiHub - API 接口文档管理平台
        </div>
      </Header>
      <Content style={{ flex: 1, padding: '24px', background: '#f0f2f5', overflow: 'hidden' }}>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={tabItems}
          size="large"
          style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
          tabBarStyle={{ marginBottom: 0 }}
        />
      </Content>
    </Layout>
  );
}

export default App;
