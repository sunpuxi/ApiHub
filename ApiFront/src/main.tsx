import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ConfigProvider, theme } from 'antd'
import zhCN from 'antd/locale/zh_CN'
import App from './App.tsx'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ConfigProvider
      locale={zhCN}
      theme={{
        // ── 全局设计 Token ──
        token: {
          colorPrimary: '#667eea',
          borderRadius: 8,
          colorLink: '#667eea',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        },
        // ── 组件级覆盖 ──
        components: {
          Layout: {
            headerBg: 'rgba(20, 20, 20, 0.95)',
            siderBg: '#ffffff',
            bodyBg: '#f0f2f5',
          },
          Card: {
            paddingLG: 24,
            boxShadowTertiary: '0 2px 8px rgba(0,0,0,0.04)',
            borderRadiusLG: 12,
          },
          Table: {
            headerBg: '#f8f9fc',
            headerColor: '#8c8c8c',
            rowHoverBg: '#f0f7ff',
          },
          Tree: {
            nodeHoverBg: '#f5f7ff',
            nodeSelectedBg: '#e6f7ff',
          },
          Tabs: {
            inkBarColor: '#667eea',
            itemHoverColor: '#667eea',
            itemSelectedColor: '#667eea',
          },
          Button: {
            primaryShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
          },
        },
      }}
    >
      <App />
    </ConfigProvider>
  </StrictMode>,
)
