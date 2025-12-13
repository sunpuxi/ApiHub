import { useState } from 'react';
import { Form, Input, Select, Button, Card, message } from 'antd';
import { apiInfoApi } from '../services/api';
import type { CreateApiRequest } from '../types/api';

const { TextArea } = Input;
const { Option } = Select;

// 临时存储项目列表，实际应该从后端获取
const mockProjects = [
  { id: 1, name: '项目1' },
  { id: 2, name: '项目2' },
];

export const CreateApi = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [projects] = useState(mockProjects);

  const onFinish = async (values: CreateApiRequest) => {
    setLoading(true);
    try {
      await apiInfoApi.create(values);
      message.success('接口创建成功');
      form.resetFields();
    } catch (error: any) {
      message.error(error.response?.data?.error || '接口创建失败');
    } finally {
      setLoading(false);
    }
  };

  const httpMethods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'];

  return (
    <Card title="创建接口" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        autoComplete="off"
      >
        <Form.Item
          label="所属项目"
          name="project_id"
          rules={[{ required: true, message: '请选择项目' }]}
        >
          <Select placeholder="请选择项目">
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
          label="请求参数Schema"
          name="req_schema"
        >
          <TextArea
            rows={6}
            placeholder='请输入JSON格式的请求参数Schema，例如：{"type":"object","properties":{"name":{"type":"string"}}}'
          />
        </Form.Item>

        <Form.Item
          label="响应参数Schema"
          name="resp_schema"
        >
          <TextArea
            rows={6}
            placeholder='请输入JSON格式的响应参数Schema，例如：{"type":"object","properties":{"id":{"type":"integer"}}}'
          />
        </Form.Item>

        <Form.Item
          label="接口描述"
          name="description"
        >
          <TextArea rows={4} placeholder="请输入接口描述（可选）" />
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

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading} block>
            创建接口
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};

