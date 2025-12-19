import { useEffect, useState } from 'react';
import { Form, Input, Select, message, Card, Button, Space } from 'antd';
import { SaveOutlined, CloseOutlined } from '@ant-design/icons';
import { apiInfoApi, projectApi } from '../services/api';
import type { CreateApiRequest, ApiInfoItem } from '../types/api';
import { SchemaEditor } from './SchemaEditor';

const { TextArea } = Input;
const { Option } = Select;

interface ApiEditFormProps {
  editingApi?: ApiInfoItem | null;
  defaultProjectId?: number;
  onSave?: (apiId?: number) => void;
  onCancel?: () => void;
}

const httpMethods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'];

export const ApiEditForm = ({ editingApi, defaultProjectId, onSave, onCancel }: ApiEditFormProps) => {
  const [form] = Form.useForm();
  const [projects, setProjects] = useState<Array<{ id: number; name: string }>>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadProjects();
    if (editingApi) {
      form.setFieldsValue({
        project_id: editingApi.project_id,
        path: editingApi.path,
        method: editingApi.method,
        title: editingApi.title,
        version: editingApi.version,
        req_schema: editingApi.req_schema,
        resp_schema: editingApi.resp_schema,
        mock_data: editingApi.mock_data,
        description: editingApi.description,
        editor: editingApi.editor,
        creator: editingApi.creator,
      });
    } else {
      form.resetFields();
      if (defaultProjectId) {
        form.setFieldsValue({ project_id: defaultProjectId });
      }
    }
  }, [editingApi, defaultProjectId, form]);

  const loadProjects = async () => {
    try {
      const response = await projectApi.query({ page: 1, page_size: 1000 });
      setProjects(
        response.items.map((item) => ({
          id: item.id,
          name: item.name,
        }))
      );
    } catch (error) {
      console.error('加载项目列表失败', error);
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      // 判断响应参数是否发生变化
      let isUpdateRespSchema = false;
      if (!editingApi) {
        // 新增模式：只要填写了响应参数就视为更新
        isUpdateRespSchema = !!values.resp_schema && values.resp_schema.trim() !== '';
      } else {
        // 编辑模式：判断是否与原有 schema 不同
        isUpdateRespSchema = values.resp_schema !== editingApi.resp_schema;
      }

      const apiData: CreateApiRequest = {
        id: editingApi?.id,
        project_id: values.project_id,
        path: values.path,
        method: values.method,
        title: values.title,
        version: values.version,
        req_schema: values.req_schema,
        resp_schema: values.resp_schema,
        mock_data: values.mock_data,
        description: values.description,
        editor: values.editor,
        creator: values.creator,
        is_update_resp_schema: isUpdateRespSchema,
      };

      setLoading(true);
      const response = await apiInfoApi.create(apiData);
      message.success(editingApi ? '接口更新成功' : '接口创建成功');

      form.resetFields();
      onSave?.(response.id);
    } catch (error: any) {
      if (error.errorFields) {
        return;
      }
      message.error(error.response?.data?.error || (editingApi ? '接口更新失败' : '接口创建失败'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ height: '100%', overflow: 'auto', background: '#f0f2f5', padding: '24px' }}>
      <Card
        title={
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '20px', fontWeight: 600 }}>
              {editingApi ? '编辑接口' : '新增接口'}
            </span>
            <Space>
              <Button icon={<CloseOutlined />} onClick={onCancel}>
                取消
              </Button>
              <Button
                type="primary"
                icon={<SaveOutlined />}
                onClick={handleSubmit}
                loading={loading}
              >
                保存
              </Button>
            </Space>
          </div>
        }
        style={{ borderRadius: '8px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)' }}
      >
        <Form
          form={form}
          layout="vertical"
          autoComplete="off"
        >
          <Form.Item
            label="所属项目"
            name="project_id"
            rules={[{ required: true, message: '请选择项目' }]}
          >
            <Select placeholder="请选择项目" disabled={!!editingApi}>
              {projects.map((project) => (
                <Option key={project.id} value={project.id}>
                  {project.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="接口路径"
            name="path"
            rules={[{ required: true, message: '请输入接口路径' }]}
          >
            <Input placeholder="例如：/api/users" />
          </Form.Item>

          <Form.Item
            label="请求方法"
            name="method"
            rules={[{ required: true, message: '请选择请求方法' }]}
          >
            <Select placeholder="请选择请求方法">
              {httpMethods.map((method) => (
                <Option key={method} value={method}>
                  {method}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="接口标题"
            name="title"
            rules={[{ required: true, message: '请输入接口标题' }]}
          >
            <Input placeholder="请输入接口标题" />
          </Form.Item>

          <Form.Item
            label="接口版本"
            name="version"
            rules={[{ required: true, message: '请输入接口版本' }]}
          >
            <Input placeholder="例如：v1.0.0" />
          </Form.Item>

          <Form.Item
            label="请求参数"
            name="req_schema"
            getValueFromEvent={(value) => value}
          >
            <SchemaEditor form={form} fieldName="req_schema" />
          </Form.Item>

          <Form.Item
            label="响应参数Schema"
            name="resp_schema"
            getValueFromEvent={(value) => value}
          >
            <SchemaEditor form={form} fieldName="resp_schema" />
          </Form.Item>

          <Form.Item
            label="Mock 数据"
            name="mock_data"
          >
            <TextArea 
              rows={6} 
              placeholder='请输入 JSON 格式的 Mock 数据'
              style={{ fontFamily: 'monospace' }}
            />
          </Form.Item>

          <Form.Item
            label="接口描述"
            name="description"
          >
            <TextArea rows={3} placeholder="请输入接口描述（可选）" />
          </Form.Item>

          <Form.Item
            label="编辑者"
            name="editor"
            rules={[{ required: true, message: '请输入编辑者' }]}
          >
            <Input placeholder="请输入编辑者" />
          </Form.Item>

          <Form.Item
            label="创建者"
            name="creator"
            rules={[{ required: true, message: '请输入创建者' }]}
          >
            <Input placeholder="请输入创建者" />
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

