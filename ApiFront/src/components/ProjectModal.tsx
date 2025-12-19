import { useEffect } from 'react';
import { Modal, Form, Input, message } from 'antd';
import { projectApi } from '../services/api';
import type { CreateProjectRequest, ProjectItem } from '../types/api';

const { TextArea } = Input;

interface ProjectModalProps {
  open: boolean;
  onCancel: () => void;
  onSuccess: () => void;
  editingProject?: ProjectItem | null;
}

export const ProjectModal = ({ open, onCancel, onSuccess, editingProject }: ProjectModalProps) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (open) {
      if (editingProject) {
        form.setFieldsValue({
          name: editingProject.name,
          description: editingProject.description,
          editor: editingProject.editor,
          creator: editingProject.creator,
        });
      } else {
        form.resetFields();
      }
    }
  }, [open, editingProject, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const projectData: CreateProjectRequest = {
        id: editingProject?.id,
        name: values.name,
        description: values.description,
        editor: values.editor,
        creator: values.creator,
      };

      await projectApi.create(projectData);
      message.success(editingProject ? '项目更新成功' : '项目创建成功');
      
      form.resetFields();
      onSuccess();
      onCancel();
    } catch (error: any) {
      if (error.errorFields) {
        return;
      }
      message.error(error.response?.data?.error || (editingProject ? '项目更新失败' : '项目创建失败'));
    }
  };

  return (
    <Modal
      title={editingProject ? '编辑项目' : '新增项目'}
      open={open}
      onCancel={onCancel}
      onOk={handleSubmit}
      destroyOnHidden
      width={600}
      styles={{
        body: { padding: '24px' }
      }}
    >
      <Form
        form={form}
        layout="vertical"
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
      </Form>
    </Modal>
  );
};

