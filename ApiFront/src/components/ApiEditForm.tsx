import { useEffect, useState } from 'react';
import { Form, Input, Select, message, Card, Button, Space, Row, Col, Typography } from 'antd';
import { SaveOutlined, CloseOutlined, SettingOutlined, CodeOutlined, FileTextOutlined, InboxOutlined } from '@ant-design/icons';
import { apiInfoApi, projectApi } from '../services/api';
import type { CreateApiRequest, ApiInfoItem } from '../types/api';
import { SchemaEditor } from './SchemaEditor';

const { TextArea } = Input;
const { Option } = Select;
const { Text } = Typography;

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
      
      let isUpdateRespSchema = false;
      if (!editingApi) {
        isUpdateRespSchema = !!values.resp_schema && values.resp_schema.trim() !== '';
      } else {
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
      if (response.mock_generation_status === 'pending') {
        message.info('Mock 数据正在后台生成，请稍后手动刷新列表或重新展开项目后再查看。');
      }

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

  const sectionTitle = (icon: React.ReactNode, text: string) => (
    <Space size={8}>
      {icon}
      <Text strong style={{ fontSize: '15px' }}>{text}</Text>
    </Space>
  );

  return (
    <div className="api-edit-form" style={{
      height: '100%', overflow: 'auto', background: '#f0f2f5', padding: '24px 32px',
      animation: 'fadeInUp 0.35s cubic-bezier(0.23, 1, 0.32, 1)'
    }}>
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .api-edit-form .ant-card { border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.04); }
        .api-edit-form .ant-card-head { padding: 16px 24px; min-height: 0; }
        .api-edit-form .ant-card-body { padding: 20px 24px; }
      `}</style>

      {/* ── 页头操作栏 ── */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px'
      }}>
        <Text strong style={{ fontSize: '20px' }}>
          {editingApi ? '编辑接口' : '新增接口'}
        </Text>
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

      <Form
        form={form}
        layout="vertical"
        autoComplete="off"
        style={{ maxWidth: '1000px' }}
      >
        {/* ── 基本配置 ── */}
        <Card
          title={sectionTitle(<SettingOutlined style={{ color: '#667eea' }} />, '基本配置')}
          style={{ marginBottom: '20px' }}
        >
          <Row gutter={24}>
            <Col span={12}>
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
            </Col>
            <Col span={12}>
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
            </Col>
          </Row>
          <Row gutter={24}>
            <Col span={12}>
              <Form.Item
                label="接口路径"
                name="path"
                rules={[{ required: true, message: '请输入接口路径' }]}
              >
                <Input placeholder="例如：/api/users" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="接口版本"
                name="version"
                rules={[{ required: true, message: '请输入接口版本' }]}
              >
                <Input placeholder="例如：v1.0.0" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item
            label="接口标题"
            name="title"
            rules={[{ required: true, message: '请输入接口标题' }]}
          >
            <Input placeholder="请输入接口标题" />
          </Form.Item>
        </Card>

        {/* ── 请求参数 ── */}
        <Card
          title={sectionTitle(<CodeOutlined style={{ color: '#667eea' }} />, '请求参数')}
          style={{ marginBottom: '20px' }}
        >
          <Form.Item
            name="req_schema"
            getValueFromEvent={(value) => value}
            style={{ marginBottom: 0 }}
          >
            <SchemaEditor form={form} fieldName="req_schema" />
          </Form.Item>
        </Card>

        {/* ── 响应参数 ── */}
        <Card
          title={sectionTitle(<CodeOutlined style={{ color: '#667eea' }} />, '响应参数')}
          style={{ marginBottom: '20px' }}
        >
          <Form.Item
            name="resp_schema"
            getValueFromEvent={(value) => value}
            style={{ marginBottom: 0 }}
          >
            <SchemaEditor form={form} fieldName="resp_schema" />
          </Form.Item>
        </Card>

        {/* ── 其他信息 ── */}
        <Card
          title={sectionTitle(<InboxOutlined style={{ color: '#667eea' }} />, '其他信息')}
          style={{ marginBottom: '20px' }}
        >
          <Row gutter={24}>
            <Col span={12}>
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
            </Col>
            <Col span={12}>
              <Form.Item
                label="接口描述"
                name="description"
              >
                <TextArea rows={6} placeholder="请输入接口描述（可选）" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={24}>
            <Col span={12}>
              <Form.Item
                label="编辑者"
                name="editor"
                rules={[{ required: true, message: '请输入编辑者' }]}
              >
                <Input placeholder="请输入编辑者" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="创建者"
                name="creator"
                rules={[{ required: true, message: '请输入创建者' }]}
              >
                <Input placeholder="请输入创建者" />
              </Form.Item>
            </Col>
          </Row>
        </Card>
      </Form>
    </div>
  );
};


