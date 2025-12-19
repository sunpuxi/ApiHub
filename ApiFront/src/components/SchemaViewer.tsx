import { Table, Typography, Space } from 'antd';
import { 
  RightOutlined, 
  DownOutlined,
  BlockOutlined,
  FieldStringOutlined,
  FieldNumberOutlined,
  CheckSquareOutlined,
  BarsOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import React, { useState, useEffect } from 'react';

const { Text } = Typography;

interface SchemaField {
  key: string;
  fieldName: string;
  type: string;
  required: boolean;
  description: string;
  example: string;
  level: number;
  isLast?: boolean;
  parentKey?: string;
  children?: SchemaField[];
}

interface SchemaViewerProps {
  schema: string;
}

// 获取类型的图标
const getTypeIcon = (type: string) => {
  const t = type.toLowerCase();
  if (t.includes('object')) return <BlockOutlined style={{ color: '#1890ff', fontSize: '12px' }} />;
  if (t.includes('array')) return <BarsOutlined style={{ color: '#722ed1', fontSize: '12px' }} />;
  if (t.includes('string')) return <FieldStringOutlined style={{ color: '#52c41a', fontSize: '12px' }} />;
  if (t.includes('number') || t.includes('integer')) return <FieldNumberOutlined style={{ color: '#faad14', fontSize: '12px' }} />;
  if (t.includes('boolean')) return <CheckSquareOutlined style={{ color: '#ff4d4f', fontSize: '12px' }} />;
  return null;
};

const convertToTree = (properties: any, requiredFields: string[] = [], level: number = 0, parentKey: string = 'root'): SchemaField[] => {
  if (!properties) return [];

  const keys = Object.keys(properties);
  return keys.map((key, index) => {
    const prop = properties[key];
    const isRequired = requiredFields.includes(key);
    const currentKey = `${parentKey}-${key}-${index}`;
    const isLast = index === keys.length - 1;
    
    let type = prop.type || 'unknown';
    let example = '';
    let description = prop.description || '';
    
    if (prop.example !== undefined) {
      example = typeof prop.example === 'object' ? JSON.stringify(prop.example) : String(prop.example);
    } else if (prop.default !== undefined) {
      example = typeof prop.default === 'object' ? JSON.stringify(prop.default) : String(prop.default);
    } else {
      switch (type) {
        case 'string': example = '"..."'; break;
        case 'number':
        case 'integer': example = '0'; break;
        case 'boolean': example = 'true'; break;
        case 'array': example = '[]'; break;
        case 'object': example = '{...}'; break;
        default: example = '-';
      }
    }

    const field: SchemaField = {
      key: currentKey,
      fieldName: key,
      type: prop.type === 'array' && prop.items?.type ? `array<${prop.items.type}>` : type,
      required: isRequired,
      description: description || (type === 'object' ? '嵌套对象' : ''),
      example,
      level,
      isLast,
      parentKey,
    };

    if (type === 'object' && prop.properties) {
      field.children = convertToTree(prop.properties, prop.required || [], level + 1, currentKey);
    }
    
    if (type === 'array' && prop.items?.type === 'object' && prop.items.properties) {
      field.children = convertToTree(prop.items.properties, prop.items.required || [], level + 1, currentKey);
    }

    return field;
  });
};

const TreeLine = ({ level, isLast }: { level: number; isLast?: boolean }) => {
  if (level === 0) return null;
  const lines = [];
  for (let i = 0; i < level; i++) {
    const isCurrentLevel = i === level - 1;
    lines.push(
      <div key={i} style={{ width: '16px', height: '100%', position: 'relative', flexShrink: 0 }}>
        <div style={{
          position: 'absolute',
          left: '8px',
          top: 0,
          bottom: isCurrentLevel && isLast ? '50%' : 0,
          width: '1px',
          background: '#e8e8e8',
        }} />
        {isCurrentLevel && (
          <div style={{
            position: 'absolute',
            left: '8px',
            top: '50%',
            width: '6px',
            height: '1px',
            background: '#e8e8e8'
          }} />
        )}
      </div>
    );
  }
  return <div style={{ display: 'flex', height: '24px', alignItems: 'center' }}>{lines}</div>;
};

export const SchemaViewer = ({ schema }: SchemaViewerProps) => {
  const [expandedRowKeys, setExpandedRowKeys] = useState<React.Key[]>([]);

  // 初次加载时展开所有行
  useEffect(() => {
    if (!schema) return;
    try {
      const parsed = JSON.parse(schema);
      const properties = parsed.properties || (Array.isArray(parsed) ? null : parsed);
      const tree = convertToTree(properties, parsed.required || []);
      
      const getAllKeys = (data: SchemaField[]): React.Key[] => {
        let keys: React.Key[] = [];
        data.forEach(item => {
          if (item.children) {
            keys.push(item.key);
            keys = [...keys, ...getAllKeys(item.children)];
          }
        });
        return keys;
      };
      setExpandedRowKeys(getAllKeys(tree));
    } catch (e) {
      // 忽略解析错误
    }
  }, [schema]);

  if (!schema || schema.trim() === '') {
    return (
      <div style={{ textAlign: 'center', padding: '32px', color: '#bfbfbf', background: '#fafafa', borderRadius: '12px', border: '1px dashed #f0f0f0' }}>
        暂无字段定义
      </div>
    );
  }

  let treeData: SchemaField[] = [];
  try {
    const parsed = JSON.parse(schema);
    const properties = parsed.properties || (Array.isArray(parsed) ? null : parsed);
    treeData = convertToTree(properties, parsed.required || []);
  } catch (e) {
    return <pre style={{ padding: '12px', background: '#f5f5f5', borderRadius: '4px', fontSize: '12px' }}>{schema}</pre>;
  }

  const toggleExpand = (key: React.Key) => {
    setExpandedRowKeys(prev => 
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  };

  const columns: ColumnsType<SchemaField> = [
    {
      title: '字段定义',
      dataIndex: 'fieldName',
      key: 'fieldName',
      width: 400,
      render: (text: string, record: SchemaField) => {
        const isExpanded = expandedRowKeys.includes(record.key);
        const hasChildren = !!record.children;

        return (
          <div style={{ display: 'flex', alignItems: 'center', whiteSpace: 'nowrap' }}>
            {/* 连接线 */}
            <TreeLine level={record.level} isLast={record.isLast} />
            
            {/* 展开/收起 图标 - 放置在名称左侧 */}
            <div 
              style={{ 
                width: '16px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                marginRight: '4px',
                cursor: hasChildren ? 'pointer' : 'default',
                color: '#bfbfbf',
                transition: 'all 0.3s'
              }}
              onClick={() => hasChildren && toggleExpand(record.key)}
            >
              {hasChildren ? (
                isExpanded ? <DownOutlined style={{ fontSize: '10px' }} /> : <RightOutlined style={{ fontSize: '10px' }} />
              ) : null}
            </div>

            <Space size={8} style={{ padding: '4px 4px' }}>
              {getTypeIcon(record.type)}
              <Text style={{ 
                color: record.required ? '#cf1322' : '#262626',
                fontWeight: record.required ? 700 : 500,
                fontSize: '14.5px', // 增大字号
                fontFamily: '"Cascadia Code", "Fira Code", "SFMono-Regular", Consolas, monospace',
              }}>
                {text}
              </Text>
              {record.required && (
                <span style={{ 
                  color: '#ff4d4f', 
                  fontSize: '12px', 
                  background: 'rgba(255, 77, 79, 0.08)',
                  padding: '1px 6px',
                  borderRadius: '4px',
                  fontWeight: 600,
                  marginLeft: 4
                }}>必填</span>
              )}
            </Space>
          </div>
        );
      },
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      width: 120,
      render: (type: string) => (
        <div style={{
          display: 'inline-block',
          padding: '2px 8px',
          borderRadius: '6px',
          background: '#f5f5f5',
          border: '1px solid #f0f0f0',
        }}>
          <Text style={{ 
            fontSize: '12px', 
            color: '#666', 
            textTransform: 'uppercase', 
            fontWeight: 700,
            fontFamily: 'monospace',
            whiteSpace: 'nowrap'
          }}>
            {type}
          </Text>
        </div>
      ),
    },
    {
      title: '示例',
      dataIndex: 'example',
      key: 'example',
      width: 250,
      render: (example: string) => (
        <Text ellipsis={{ tooltip: example }} style={{ 
          color: '#0958d9', 
          fontSize: '13px', // 增大字号
          background: 'rgba(9, 88, 217, 0.04)',
          padding: '2px 8px',
          borderRadius: '4px',
          fontFamily: 'monospace',
          whiteSpace: 'nowrap',
          display: 'inline-block',
          maxWidth: '220px'
        }}>
          {example}
        </Text>
      ),
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      width: 250,
      render: (description: string) => (
        <Text type="secondary" style={{ fontSize: '13.5px', color: '#595959', whiteSpace: 'nowrap' }}>
          {description || '-'}
        </Text>
      ),
    },
  ];

  return (
    <div className="schema-viewer-elegant">
      <style>{`
        .schema-viewer-elegant .ant-table { background: transparent !important; }
        .schema-viewer-elegant .ant-table-thead > tr > th {
          background: transparent !important;
          border-bottom: 1px solid #f0f0f0 !important;
          color: #8c8c8c !important; // 加深颜色
          font-size: 12px !important; // 增大字号
          text-transform: uppercase !important;
          letter-spacing: 1.2px !important;
          padding: 16px 16px !important; // 增加间距
          white-space: nowrap !important;
          fontWeight: 700 !important;
        }
        .schema-viewer-elegant .ant-table-tbody > tr > td {
          border-bottom: 1px solid #f9f9f9 !important;
          padding: 12px 16px !important; // 增加行间距
          white-space: nowrap !important;
        }
        
        /* 彻底隐藏 antd 默认的展开列和缩进 */
        .schema-viewer-elegant .ant-table-row-indent,
        .schema-viewer-elegant .ant-table-expand-icon-col,
        .schema-viewer-elegant .ant-table-row-expand-icon-cell {
          display: none !important;
        }
        
        .schema-viewer-elegant .ant-table-tbody > tr:hover > td {
          background: #f0f7ff !important;
        }

        .ant-table-row-level-0 { background-color: #ffffff; }
        .ant-table-row-level-1 { background-color: #fafafa; }
        .ant-table-row-level-2 { background-color: #f5f5f5; }
        .ant-table-row-level-3 { background-color: #f0f0f0; }
      `}</style>
      
      <Table
        columns={columns}
        dataSource={treeData}
        pagination={false}
        size="small"
        bordered={false}
        rowKey="key"
        expandedRowKeys={expandedRowKeys}
        onExpandedRowsChange={setExpandedRowKeys}
        scroll={{ x: 'max-content' }}
        rowClassName={(record) => `ant-table-row-level-${record.level}`}
      />
    </div>
  );
};
