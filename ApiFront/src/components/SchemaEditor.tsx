import { useState, useEffect, useCallback, useRef } from 'react';
import { Button, Input, Select, Space, Card, Modal, message } from 'antd';
import { PlusOutlined, DeleteOutlined, CodeOutlined } from '@ant-design/icons';
import type { FormInstance } from 'antd';
import React from 'react';

const { Option } = Select;
const { TextArea } = Input;

// JSON 转 Schema 的辅助逻辑
const jsonToSchema = (json: any): any => {
  if (json === null) return { type: 'string' };
  const type = typeof json;

  if (type === 'string') return { type: 'string', example: json };
  if (type === 'number') return { type: 'number', example: json };
  if (type === 'boolean') return { type: 'boolean', example: json };

  if (Array.isArray(json)) {
    const itemSchema = json.length > 0 ? jsonToSchema(json[0]) : { type: 'string' };
    return {
      type: 'array',
      items: itemSchema.type === 'object' ? itemSchema : { type: itemSchema.type }
    };
  }

  if (type === 'object') {
    const properties: any = {};
    const required: string[] = [];
    Object.keys(json).forEach(key => {
      properties[key] = jsonToSchema(json[key]);
      required.push(key);
    });
    return {
      type: 'object',
      properties,
      required
    };
  }

  return { type: 'string' };
};

export interface Parameter {
  id: string;
  name: string;
  type: string;
  example: string;
  required?: boolean;
  children?: Parameter[];
}

interface SchemaEditorProps {
  value?: string;
  onChange?: (value: string) => void;
  form?: FormInstance;
  fieldName?: string;
}

const PARAM_TYPES = ['string', 'number', 'integer', 'boolean', 'object', 'array'];

export const SchemaEditor = ({ value, onChange, form, fieldName }: SchemaEditorProps) => {
  const [parameters, setParameters] = useState<Parameter[]>([]);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [jsonInput, setJsonInput] = useState('');
  const updateTimerRef = useRef<number | null>(null);
  const isInternalUpdateRef = useRef(false);
  const lastValueRef = useRef<string>('');

  useEffect(() => {
    // 如果是内部更新触发的 value 变化，不处理
    if (isInternalUpdateRef.current) {
      isInternalUpdateRef.current = false;
      return;
    }

    // 如果 value 没有真正变化，不处理
    if (value === lastValueRef.current) {
      return;
    }

    lastValueRef.current = value || '';

    if (value && value.trim()) {
      try {
        const parsed = JSON.parse(value);
        const params = parseSchemaToParameters(parsed);
        setParameters((prevParams) => {
          // 如果有空参数正在编辑，保留它们
          const hasEmptyParams = prevParams.some(p => !p.name || !p.name.trim());
          if (hasEmptyParams) {
            return prevParams;
          }
          return params;
        });
      } catch (error) {
        console.error('解析Schema失败', error);
      }
    } else if (!value || !value.trim()) {
      setParameters((prevParams) => {
        // 如果有空参数正在编辑，不清空
        const hasEmptyParams = prevParams.some(p => !p.name || !p.name.trim());
        if (hasEmptyParams) {
          return prevParams;
        }
        return [];
      });
    }
  }, [value]);

  const parseSchemaToParameters = (schema: any): Parameter[] => {
    if (!schema || schema.type !== 'object' || !schema.properties) {
      return [];
    }

    const params: Parameter[] = [];
    const required = schema.required || [];

    Object.keys(schema.properties).forEach((key, index) => {
      const prop = schema.properties[key];
      const param: Parameter = {
        id: `${key}-${index}`,
        name: key,
        type: prop.type || 'string',
        example: prop.example || '',
        required: required.includes(key),
      };

      if (prop.type === 'object' && prop.properties) {
        param.children = parseSchemaToParameters(prop);
      } else if (prop.type === 'array' && prop.items?.type === 'object' && prop.items?.properties) {
        param.children = parseSchemaToParameters(prop.items);
      }

      params.push(param);
    });

    return params;
  };

  const convertParametersToSchema = (params: Parameter[]): string => {
    const validParams = params.filter((p) => p.name && p.name.trim());
    
    if (validParams.length === 0) {
      return JSON.stringify({ type: 'object', properties: {} }, null, 2);
    }

    const schema: any = {
      type: 'object',
      properties: {},
      required: [],
    };

    validParams.forEach((param) => {
      const prop: any = {
        type: param.type,
      };

      if (param.example) {
        prop.example = param.example;
      }

      if (param.type === 'object' && param.children && param.children.length > 0) {
        const childrenSchema = JSON.parse(convertParametersToSchema(param.children));
        prop.properties = childrenSchema.properties || {};
        if (childrenSchema.required && childrenSchema.required.length > 0) {
          prop.required = childrenSchema.required;
        }
      } else if (param.type === 'array') {
        if (param.children && param.children.length > 0) {
          const childrenSchema = JSON.parse(convertParametersToSchema(param.children));
          prop.items = {
            type: 'object',
            properties: childrenSchema.properties || {},
          };
          if (childrenSchema.required && childrenSchema.required.length > 0) {
            prop.items.required = childrenSchema.required;
          }
        } else {
          prop.items = { type: 'string' };
        }
      }

      schema.properties[param.name.trim()] = prop;

      if (param.required) {
        schema.required.push(param.name.trim());
      }
    });

    return JSON.stringify(schema, null, 2);
  };

  const syncToForm = useCallback((params: Parameter[]) => {
    if (updateTimerRef.current) {
      clearTimeout(updateTimerRef.current);
    }
    
    updateTimerRef.current = setTimeout(() => {
      // 只同步有名称的参数到 schema，但保留所有参数在列表中
      const schemaJson = convertParametersToSchema(params);
      isInternalUpdateRef.current = true;
      onChange?.(schemaJson);
      if (form && fieldName) {
        form.setFieldValue(fieldName, schemaJson);
      }
    }, 300); // 防抖300ms
  }, [form, fieldName, onChange]);

  const handleParameterChange = useCallback((id: string, field: keyof Parameter, fieldValue: any) => {
    const updateParameter = (params: Parameter[]): Parameter[] => {
      return params.map((param) => {
        if (param.id === id) {
          return { ...param, [field]: fieldValue };
        }
        if (param.children) {
          return { ...param, children: updateParameter(param.children) };
        }
        return param;
      });
    };

    setParameters((prevParams) => {
      const updated = updateParameter(prevParams);
      syncToForm(updated);
      return updated;
    });
  }, [syncToForm]);

  const handleAddParameter = useCallback((parentId?: string) => {
    const newParam: Parameter = {
      id: `param-${Date.now()}`,
      name: '',
      type: 'string',
      example: '',
      required: false,
    };

    setParameters((prevParams) => {
      let updated: Parameter[];
      
      if (parentId) {
        const addToParent = (params: Parameter[]): Parameter[] => {
          return params.map((param) => {
            if (param.id === parentId) {
              return {
                ...param,
                children: [...(param.children || []), newParam],
              };
            }
            if (param.children) {
              return { ...param, children: addToParent(param.children) };
            }
            return param;
          });
        };
        updated = addToParent(prevParams);
      } else {
        updated = [...prevParams, newParam];
      }
      
      syncToForm(updated);
      return updated;
    });
  }, [syncToForm]);

  const handleDeleteParameter = useCallback((id: string) => {
    const deleteParameter = (params: Parameter[]): Parameter[] => {
      return params.filter((param) => {
        if (param.id === id) {
          return false;
        }
        if (param.children) {
          param.children = deleteParameter(param.children);
        }
        return true;
      });
    };

    setParameters((prevParams) => {
      const updated = deleteParameter(prevParams);
      syncToForm(updated);
      return updated;
    });
  }, [syncToForm]);

  const handleImportJson = () => {
    try {
      const parsed = JSON.parse(jsonInput);
      const schema = jsonToSchema(parsed);
      const schemaJson = JSON.stringify(schema, null, 2);
      
      // 更新状态
      const newParams = parseSchemaToParameters(schema);
      setParameters(newParams);
      
      // 同步到外部
      isInternalUpdateRef.current = true;
      onChange?.(schemaJson);
      if (form && fieldName) {
        form.setFieldValue(fieldName, schemaJson);
      }
      
      setImportModalOpen(false);
      setJsonInput('');
      message.success('JSON 导入成功，已推导出结构');
    } catch (e) {
      message.error('无效的 JSON 格式');
    }
  };

  interface ParameterItemProps {
    param: Parameter;
    level: number;
    onChange: (id: string, field: keyof Parameter, value: any) => void;
    onAddChild: (parentId: string) => void;
    onDelete: (id: string) => void;
  }

  const ParameterItem = React.memo(({ param, level, onChange, onAddChild, onDelete }: ParameterItemProps) => {
    const [localName, setLocalName] = useState(() => param.name);
    const [localExample, setLocalExample] = useState(() => param.example);
    const lastParamIdRef = useRef(param.id);

    // 只在 param.id 变化时更新（新参数项或参数被替换）
    // 完全移除对 param.name 和 param.example 的监听，避免编辑时被覆盖
    useEffect(() => {
      if (lastParamIdRef.current !== param.id) {
        lastParamIdRef.current = param.id;
        setLocalName(param.name);
        setLocalExample(param.example);
      }
    }, [param.id]);

    // 输入时只更新本地状态，不触发任何父组件更新
    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setLocalName(value);
    };

    const handleExampleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setLocalExample(value);
    };

    // 失去焦点时才同步到父组件
    const handleNameBlur = () => {
      if (localName !== param.name) {
        onChange(param.id, 'name', localName);
      }
    };

    const handleExampleBlur = () => {
      if (localExample !== param.example) {
        onChange(param.id, 'example', localExample);
      }
    };

    const hasChildren = (param.type === 'object' || param.type === 'array') && param.children && param.children.length > 0;
    const indentStyle = { marginLeft: `${level * 24}px` };

    return (
      <div style={{ marginBottom: 12, ...indentStyle }}>
        <Card 
          size="small" 
          className={level > 0 ? 'schema-editor-card schema-editor-card-nested' : 'schema-editor-card'}
          style={{ backgroundColor: level > 0 ? '#fafafa' : '#fff' }}
        >
          <Space direction="vertical" style={{ width: '100%' }} size="small">
            <Space wrap>
              <Input
                placeholder="参数名称"
                value={localName}
                onChange={handleNameChange}
                onBlur={handleNameBlur}
                style={{ width: 150 }}
              />
              <Select
                value={param.type}
                onChange={(val) => {
                  onChange(param.id, 'type', val);
                  if (val !== 'object' && val !== 'array') {
                    onChange(param.id, 'children', undefined);
                  }
                }}
                style={{ width: 120 }}
              >
                {PARAM_TYPES.map((type) => (
                  <Option key={type} value={type}>
                    {type}
                  </Option>
                ))}
              </Select>
              <Input
                placeholder="参数示例"
                value={localExample}
                onChange={handleExampleChange}
                onBlur={handleExampleBlur}
                style={{ width: 200 }}
              />
              <Select
                value={param.required ? 'required' : 'optional'}
                onChange={(val) => onChange(param.id, 'required', val === 'required')}
                style={{ width: 100 }}
              >
                <Option value="required">
                  <span style={{ color: '#ff4d4f' }}>必填</span>
                </Option>
                <Option value="optional">
                  <span style={{ color: '#52c41a' }}>可选</span>
                </Option>
              </Select>
              {(param.type === 'object' || param.type === 'array') && (
                <Button
                  type="link"
                  icon={<PlusOutlined />}
                  size="small"
                  onClick={() => onAddChild(param.id)}
                  style={{ color: '#1890ff' }}
                >
                  添加子参数
                </Button>
              )}
              <Button
                type="link"
                danger
                icon={<DeleteOutlined />}
                size="small"
                onClick={() => onDelete(param.id)}
              >
                删除
              </Button>
            </Space>
            {hasChildren && (
              <div style={{ marginTop: 8, paddingLeft: 16, borderLeft: '2px solid #d9d9d9' }}>
                {param.children!.map((child) => (
                  <ParameterItem
                    key={child.id}
                    param={child}
                    level={level + 1}
                    onChange={onChange}
                    onAddChild={onAddChild}
                    onDelete={onDelete}
                  />
                ))}
              </div>
            )}
          </Space>
        </Card>
      </div>
    );
  }, (prevProps, nextProps) => {
    // 自定义比较：检查 id、level 和 children 的长度
    // children 长度的变化需要重新渲染以显示/隐藏子参数列表
    const prevChildrenLength = prevProps.param.children?.length || 0;
    const nextChildrenLength = nextProps.param.children?.length || 0;
    
    return prevProps.param.id === nextProps.param.id && 
           prevProps.level === nextProps.level &&
           prevChildrenLength === nextChildrenLength;
  });

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', gap: '8px' }}>
        <Button
          type="dashed"
          icon={<PlusOutlined />}
          onClick={() => handleAddParameter()}
          style={{ 
            flex: 1,
            borderRadius: '6px',
            height: '40px',
            borderColor: '#1890ff',
            color: '#1890ff'
          }}
        >
          添加参数
        </Button>
        <Button
          icon={<CodeOutlined />}
          onClick={() => setImportModalOpen(true)}
          style={{ 
            height: '40px',
            borderRadius: '6px'
          }}
        >
          JSON 导入
        </Button>
      </div>
      <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
        {parameters.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            padding: '60px 20px', 
            color: '#999',
            background: '#fafafa',
            borderRadius: '8px',
            border: '2px dashed #d9d9d9'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📝</div>
            <div style={{ fontSize: '14px' }}>暂无参数，点击上方按钮添加</div>
          </div>
        ) : (
          parameters.map((param) => (
            <ParameterItem
              key={param.id}
              param={param}
              level={0}
              onChange={handleParameterChange}
              onAddChild={handleAddParameter}
              onDelete={handleDeleteParameter}
            />
          ))
        )}
      </div>

      <Modal
        title="从 JSON 示例导入结构"
        open={importModalOpen}
        onOk={handleImportJson}
        onCancel={() => setImportModalOpen(false)}
        destroyOnClose
        width={600}
        okText="立即推导并导入"
        cancelText="取消"
      >
        <div style={{ marginBottom: 16 }}>
          <p style={{ color: '#8c8c8c', fontSize: '13px' }}>
            粘贴你接口的真实响应或请求 JSON，系统将自动识别类型、层级和示例值。
          </p>
          <TextArea
            rows={12}
            value={jsonInput}
            onChange={(e) => setJsonInput(e.target.value)}
            placeholder='例如：{"name": "Jack", "age": 18, "data": {"tags": ["AI"]}}'
            style={{ fontFamily: 'monospace', fontSize: '12px' }}
          />
        </div>
      </Modal>
    </div>
  );
};

