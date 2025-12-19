// API 类型定义
export interface CreateProjectRequest {
  id?: number;
  name: string;
  description?: string;
  editor: string;
  creator: string;
}

export interface CreateApiRequest {
  id?: number;
  project_id: number;
  path: string;
  method: string;
  title: string;
  req_schema?: string;
  resp_schema?: string;
  version: string;
  description?: string;
  editor: string;
  creator: string;
  mock_data?: string;
  is_update_resp_schema?: boolean;
}

export interface Project {
  id: number;
  name: string;
  description?: string;
}

export interface QueryProjectRequest {
  id?: number;
  project_name_id?: string;
  page?: number;
  page_size?: number;
}

export interface ProjectItem {
  id: number;
  project_id: string;
  name: string;
  description: string;
  ctime: string;
  mtime: string;
  is_del: boolean;
  editor: string;
  creator: string;
}

export interface QueryProjectResponse {
  items: ProjectItem[];
  total: number;
}

export interface QueryApiRequest {
  id?: number;
  project_id?: number;
  path?: string;
  method?: string;
  page?: number;
  page_size?: number;
}

export interface ApiInfoItem {
  id: number;
  project_id: number;
  path: string;
  method: string;
  api_name_id: string;
  title: string;
  req_schema: string;
  resp_schema: string;
  version: string;
  description: string;
  ctime: string;
  mtime: string;
  is_del: boolean;
  editor: string;
  creator: string;
  mock_data: string;
}

export interface QueryApiResponse {
  items: ApiInfoItem[];
  total: number;
}

