import { useState } from 'react';
import { Form, Input, Button, Card, message } from 'antd';
import { projectApi } from '../services/api';
import type { CreateProjectRequest } from '../types/api';

const { TextArea } = Input;

export const CreateProject = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values: CreateProjectRequest) => {
    setLoading(true);
    try {
      await projectApi.create(values);
      message.success('项目创建成功');
      form.resetFields();
    } catch (error: any) {
      message.error(error.response?.data?.error || '项目创建失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card title="创建项目" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        autoComplete="off"
      >
        <Form.Item
          label="项目名称"
          name="name"
          rules={[{ required: true, message: '请输入项目名称' }]}
        >
          <Input placeholder="请输入项目名称" />
        </Form.Item>

        <Form.Item
          label="项目描述"
          name="description"
        >
          <TextArea rows={4} placeholder="请输入项目描述（可选）" />
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
            创建项目
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};

