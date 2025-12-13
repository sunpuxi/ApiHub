import { useState, useEffect } from 'react';
import { Card, Table, Form, Input, Button, Space, message, Pagination } from 'antd';
import { SearchOutlined, ReloadOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import { projectApi } from '../services/api';
import type { QueryProjectRequest, ProjectItem } from '../types/api';
import { ProjectModal } from './ProjectModal';

export const QueryProject = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<ProjectItem | null>(null);

  const loadProjects = async (page: number = 1, size: number = 10, searchParams?: QueryProjectRequest) => {
    setLoading(true);
    try {
      const params: QueryProjectRequest = {
        page,
        page_size: size,
        ...searchParams,
      };
      const response = await projectApi.query(params);
      setProjects(response.items);
      setTotal(response.total);
      setCurrentPage(page);
      setPageSize(size);
    } catch (error: any) {
      message.error(error.response?.data?.error || '查询项目失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const onSearch = () => {
    const values = form.getFieldsValue();
    const searchParams: QueryProjectRequest = {};
    if (values.id) {
      searchParams.id = values.id;
    }
    if (values.project_name_id) {
      searchParams.project_name_id = values.project_name_id;
    }
    loadProjects(1, pageSize, searchParams);
  };

  const onReset = () => {
    form.resetFields();
    loadProjects(1, pageSize);
  };

  const onPageChange = (page: number, size: number) => {
    const values = form.getFieldsValue();
    const searchParams: QueryProjectRequest = {};
    if (values.id) {
      searchParams.id = values.id;
    }
    if (values.project_name_id) {
      searchParams.project_name_id = values.project_name_id;
    }
    loadProjects(page, size, searchParams);
  };

  const handleAdd = () => {
    setEditingProject(null);
    setModalOpen(true);
  };

  const handleEdit = (project: ProjectItem) => {
    setEditingProject(project);
    setModalOpen(true);
  };

  const handleModalSuccess = () => {
    loadProjects(currentPage, pageSize, form.getFieldsValue());
  };

  const columns = [
    {
      title: '项目ID',
      dataIndex: 'project_id',
      key: 'project_id',
      width: 200,
    },
    {
      title: '项目名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '项目描述',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: '创建者',
      dataIndex: 'creator',
      key: 'creator',
      width: 120,
    },
    {
      title: '编辑者',
      dataIndex: 'editor',
      key: 'editor',
      width: 120,
    },
    {
      title: '创建时间',
      dataIndex: 'ctime',
      key: 'ctime',
      width: 180,
      render: (text: string) => new Date(text).toLocaleString('zh-CN'),
    },
    {
      title: '操作',
      key: 'action',
      width: 100,
      render: (_: any, record: ProjectItem) => (
        <Button
          type="link"
          icon={<EditOutlined />}
          onClick={() => handleEdit(record)}
        >
          编辑
        </Button>
      ),
    },
  ];

  return (
    <Card title="查询项目" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Form form={form} layout="inline" style={{ marginBottom: 16 }}>
        <Form.Item label="项目ID" name="id">
          <Input placeholder="请输入项目ID" type="number" style={{ width: 150 }} />
        </Form.Item>
        <Form.Item label="项目名称ID" name="project_name_id">
          <Input placeholder="请输入项目名称ID" style={{ width: 200 }} />
        </Form.Item>
        <Form.Item>
          <Space>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
              新增项目
            </Button>
            <Button type="primary" icon={<SearchOutlined />} onClick={onSearch}>
              查询
            </Button>
            <Button icon={<ReloadOutlined />} onClick={onReset}>
              重置
            </Button>
          </Space>
        </Form.Item>
      </Form>

      <div style={{ flex: 1, overflow: 'auto', minHeight: 0 }}>
        <Table
          columns={columns}
          dataSource={projects}
          rowKey="project_id"
          loading={loading}
          pagination={false}
        />
      </div>

      <div style={{ marginTop: 16, textAlign: 'right' }}>
        <Pagination
          current={currentPage}
          pageSize={pageSize}
          total={total}
          showSizeChanger
          showQuickJumper
          showTotal={(total) => `共 ${total} 条`}
          onChange={onPageChange}
          onShowSizeChange={onPageChange}
        />
      </div>

      <ProjectModal
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onSuccess={handleModalSuccess}
        editingProject={editingProject}
      />
    </Card>
  );
};

