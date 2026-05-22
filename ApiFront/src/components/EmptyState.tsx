import { Typography, Space } from 'antd';
import type { ReactNode } from 'react';

const { Title, Text } = Typography;

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}

export const EmptyState = ({ icon, title, description, action }: EmptyStateProps) => (
  <div style={{
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#f0f2f5',
  }}>
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: '56px', marginBottom: '16px', opacity: 0.35, lineHeight: 1 }}>
        {icon}
      </div>
      <Title level={4} style={{ color: '#bfbfbf', fontWeight: 500, marginBottom: description ? 8 : 0 }}>
        {title}
      </Title>
      {description && (
        <Text type="secondary" style={{ display: 'block', marginBottom: action ? 20 : 0, fontSize: '14px' }}>
          {description}
        </Text>
      )}
      {action && <div style={{ marginTop: 16 }}>{action}</div>}
    </div>
  </div>
);
