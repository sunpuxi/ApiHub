import { useState, useEffect } from 'react';
import { Card, Table, Form, Input, Button, Space, message, Pagination, Select } from 'antd';
import { SearchOutlined, ReloadOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import { apiInfoApi } from '../services/api';
import type { QueryApiRequest, ApiInfoItem } from '../types/api';
import { ApiModal } from './ApiModal';

const { Option } = Select;

export const QueryApi = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [apis, setApis] = useState<ApiInfoItem[]>([]);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingApi, setEditingApi] = useState<ApiInfoItem | null>(null);

  const loadApis = async (page: number = 1, size: number = 10, searchParams?: QueryApiRequest) => {
    setLoading(true);
    try {
      const params: QueryApiRequest = {
        page,
        page_size: size,
        ...searchParams,
      };
      const response = await apiInfoApi.query(params);
      setApis(response.items);
      setTotal(response.total);
      setCurrentPage(page);
      setPageSize(size);
    } catch (error: any) {
      message.error(error.response?.data?.error || '查询接口失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadApis();
  }, []);

  const onSearch = () => {
    const values = form.getFieldsValue();
    const searchParams: QueryApiRequest = {};
    if (values.id) {
      searchParams.id = values.id;
    }
    if (values.project_id) {
      searchParams.project_id = values.project_id;
    }
    if (values.path) {
      searchParams.path = values.path;
    }
    if (values.method) {
      searchParams.method = values.method;
    }
    loadApis(1, pageSize, searchParams);
  };

  const onReset = () => {
    form.resetFields();
    loadApis(1, pageSize);
  };

  const onPageChange = (page: number, size: number) => {
    const values = form.getFieldsValue();
    const searchParams: QueryApiRequest = {};
    if (values.id) {
      searchParams.id = values.id;
    }
    if (values.project_id) {
      searchParams.project_id = values.project_id;
    }
    if (values.path) {
      searchParams.path = values.path;
    }
    if (values.method) {
      searchParams.method = values.method;
    }
    loadApis(page, size, searchParams);
  };

  const handleAdd = () => {
    setEditingApi(null);
    setModalOpen(true);
  };

  const handleEdit = (api: ApiInfoItem) => {
    setEditingApi(api);
    setModalOpen(true);
  };

  const handleModalSuccess = () => {
    loadApis(currentPage, pageSize, form.getFieldsValue());
  };

  const httpMethods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'];

  const columns = [
    {
      title: '接口ID',
      dataIndex: 'id',
      key: 'id',
      width: 100,
    },
    {
      title: '项目ID',
      dataIndex: 'project_id',
      key: 'project_id',
      width: 120,
    },
    {
      title: '接口路径',
      dataIndex: 'path',
      key: 'path',
      width: 200,
    },
    {
      title: '请求方法',
      dataIndex: 'method',
      key: 'method',
      width: 100,
    },
    {
      title: '接口标题',
      dataIndex: 'title',
      key: 'title',
      width: 200,
    },
    {
      title: '版本',
      dataIndex: 'version',
      key: 'version',
      width: 100,
    },
    {
      title: '接口描述',
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
      render: (_: any, record: ApiInfoItem) => (
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
    <Card title="查询接口" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Form form={form} layout="inline" style={{ marginBottom: 16 }}>
        <Form.Item label="接口ID" name="id">
          <Input placeholder="请输入接口ID" type="number" style={{ width: 150 }} />
        </Form.Item>
        <Form.Item label="项目ID" name="project_id">
          <Input placeholder="请输入项目ID" type="number" style={{ width: 150 }} />
        </Form.Item>
        <Form.Item label="接口路径" name="path">
          <Input placeholder="请输入接口路径" style={{ width: 200 }} />
        </Form.Item>
        <Form.Item label="请求方法" name="method">
          <Select placeholder="请选择请求方法" style={{ width: 120 }} allowClear>
            {httpMethods.map((method) => (
              <Option key={method} value={method}>
                {method}
              </Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item>
          <Space>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
              新增接口
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
          dataSource={apis}
          rowKey="id"
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

      <ApiModal
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onSuccess={handleModalSuccess}
        editingApi={editingApi}
      />
    </Card>
  );
};

