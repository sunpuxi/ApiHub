package service

import (
	"context"
	"fmt"
	"strings"

	"ApiBack/internal/application/command"
	"ApiBack/internal/application/interfaces"
	"ApiBack/internal/application/query"
	"ApiBack/internal/domian/entity"
	"ApiBack/internal/domian/repository"
	domainService "ApiBack/internal/domian/service"

	"github.com/modelcontextprotocol/go-sdk/mcp"
)

// ---------- query_apis ----------

type QueryAPIsInput struct {
	ProjectID int64  `json:"project_id,omitempty" jsonschema:"按项目 ID 过滤，0 表示不限定"`
	Path      string `json:"path,omitempty" jsonschema:"接口路径模糊匹配"`
	Method    string `json:"method,omitempty" jsonschema:"HTTP 方法，如 GET/POST/PUT/DELETE"`
	Page      int    `json:"page,omitempty" jsonschema:"页码，默认 1"`
	PageSize  int    `json:"page_size,omitempty" jsonschema:"每页条数，默认 10"`
}

type QueryAPIsOutput struct {
	Total int64                       `json:"total"`
	Items []*query.ApiInfoQueryResult `json:"items"`
}

// ---------- upsert_api_info ----------

type UpsertAPIInfoInput struct {
	ID                 *int64 `json:"id,omitempty" jsonschema:"可选：更新时传接口 ID"`
	ProjectID          *int64 `json:"project_id,omitempty" jsonschema:"可选：项目 ID；若不传则使用 project_name_id 查询"`
	ProjectNameID      string `json:"project_name_id,omitempty" jsonschema:"可选：项目唯一标识。当 project_id 未提供时，会先查询项目再创建接口"`
	Path               string `json:"path" jsonschema:"必填：接口路径，如 /api/users"`
	Method             string `json:"method" jsonschema:"必填：HTTP 方法，如 GET/POST"`
	Title              string `json:"title" jsonschema:"必填：接口标题"`
	ReqSchema          string `json:"req_schema,omitempty" jsonschema:"可选：请求 JSON Schema（字符串）"`
	RespSchema         string `json:"resp_schema,omitempty" jsonschema:"可选：响应 JSON Schema（字符串）"`
	Version            string `json:"version" jsonschema:"必填：版本号，如 1.0 或 v1.0.0"`
	Description        string `json:"description,omitempty" jsonschema:"可选：接口描述"`
	Editor             string `json:"editor" jsonschema:"必填：编辑者"`
	Creator            string `json:"creator" jsonschema:"必填：创建者"`
	MockData           string `json:"mock_data,omitempty" jsonschema:"可选：mock_data（通常留空，交给后端异步生成）"`
	IsUpdateRespSchema bool   `json:"is_update_resp_schema,omitempty" jsonschema:"当 resp_schema 发生变化时设为 true（用于触发异步生成）"`
}

type UpsertAPIInfoOutput struct {
	ID                   int64  `json:"id"`
	MockGenerationStatus string `json:"mock_generation_status"`
}

// ---------- MCP Server 构造 ----------

// NewMCPServer 创建一个内嵌的 MCP Server，注册 query_apis / upsert_api_info 两个工具。
//
// 参数说明：
//   - apiInfoService: 接口查询/创建的 Application Service
//   - apiProjectService: 项目查询的 Domain Service（用于 project_name_id → project_id 解析）
func NewMCPServer(
	apiInfoService interfaces.ApiInfoAppService,
	apiProjectService *domainService.ApiProjectService,
) *mcp.Server {
	server := mcp.NewServer(&mcp.Implementation{
		Name:    "apihub",
		Version: "1.0.0",
	}, nil)

	// --- 工具 1: query_apis ---
	mcp.AddTool(server, &mcp.Tool{
		Name:        "query_apis",
		Description: "从 ApiHub 查询接口列表（支持按项目、路径、方法过滤，分页）",
	}, func(ctx context.Context, _ *mcp.CallToolRequest, in QueryAPIsInput) (*mcp.CallToolResult, QueryAPIsOutput, error) {
		page := in.Page
		if page < 1 {
			page = 1
		}
		pageSize := in.PageSize
		if pageSize < 1 {
			pageSize = 10
		}

		q := &query.ApiInfoQuery{
			ProjectID: in.ProjectID,
			Path:      in.Path,
			Method:    in.Method,
			Page:      page,
			PageSize:  pageSize,
		}
		items, total, err := apiInfoService.QueryApiInfos(q)
		if err != nil {
			return nil, QueryAPIsOutput{}, fmt.Errorf("查询接口列表失败: %w", err)
		}

		// items 已经是 []*query.ApiInfoQueryResult
		resultItems := make([]*query.ApiInfoQueryResult, 0, len(items))
		for _, item := range items {
			resultItems = append(resultItems, item)
		}

		out := QueryAPIsOutput{
			Total: total,
			Items: resultItems,
		}
		return nil, out, nil
	})

// ---------- query_project_by_name ----------

type QueryProjectByNameInput struct {
	Name string `json:"name" jsonschema:"必填：项目名称（展示名），如 ApiBack"`
}

// --- 工具 2: query_project_by_name ---
	mcp.AddTool(server, &mcp.Tool{
		Name:        "query_project_by_name",
		Description: "根据项目名称（展示名 name）查询项目信息",
	}, func(ctx context.Context, _ *mcp.CallToolRequest, in QueryProjectByNameInput) (*mcp.CallToolResult, query.ApiProjectQueryResult, error) {
		name := strings.TrimSpace(in.Name)
		if name == "" {
			return nil, query.ApiProjectQueryResult{}, fmt.Errorf("项目名称不能为空")
		}

		// 1) 尝试按 project_name_id 精确匹配
		projects, total, err := apiProjectService.QueryApiProjects(&repository.ApiProjectFilter{
			ProjectNameID: name,
			Page:          1,
			PageSize:      10,
		})
		if err != nil {
			return nil, query.ApiProjectQueryResult{}, fmt.Errorf("查询项目失败: %w", err)
		}
		if total == 1 && len(projects) > 0 {
			return nil, toProjectResult(projects[0]), nil
		}
		if total > 1 {
			return nil, query.ApiProjectQueryResult{}, fmt.Errorf("project_name_id 不唯一: %s", name)
		}

		// 2) 兜底：按展示名 name 精确匹配（服务端精确查询）
		projects2, total2, err := apiProjectService.QueryApiProjects(&repository.ApiProjectFilter{
			Name:     name,
			Page:     1,
			PageSize: 10,
		})
		if err != nil {
			return nil, query.ApiProjectQueryResult{}, fmt.Errorf("按名称查询项目失败: %w", err)
		}
		if total2 == 1 && len(projects2) > 0 {
			return nil, toProjectResult(projects2[0]), nil
		}
		if total2 > 1 {
			return nil, query.ApiProjectQueryResult{}, fmt.Errorf("项目名称不唯一: %s", name)
		}
		return nil, query.ApiProjectQueryResult{}, fmt.Errorf("未找到项目: %s", name)
	})

	// --- 工具 3: upsert_api_info ---
	mcp.AddTool(server, &mcp.Tool{
		Name:        "upsert_api_info",
		Description: "创建/更新接口信息。用于从 IDE/Agent 同步接口信息到 ApiHub 平台。",
	}, func(ctx context.Context, _ *mcp.CallToolRequest, in UpsertAPIInfoInput) (*mcp.CallToolResult, UpsertAPIInfoOutput, error) {
		// 1. 轻量校验
		if (in.ProjectID == nil || *in.ProjectID <= 0) && strings.TrimSpace(in.ProjectNameID) == "" {
			return nil, UpsertAPIInfoOutput{}, fmt.Errorf("missing required fields: project_id or project_name_id")
		}
		if strings.TrimSpace(in.Path) == "" || strings.TrimSpace(in.Method) == "" || strings.TrimSpace(in.Title) == "" || strings.TrimSpace(in.Version) == "" {
			return nil, UpsertAPIInfoOutput{}, fmt.Errorf("missing required fields: path/method/title/version")
		}
		if strings.TrimSpace(in.Editor) == "" || strings.TrimSpace(in.Creator) == "" {
			return nil, UpsertAPIInfoOutput{}, fmt.Errorf("missing required fields: editor/creator")
		}

		// 2. 若未提供 project_id，则通过 project_name_id 查询项目
		projectID := int64(0)
		if in.ProjectID != nil && *in.ProjectID > 0 {
			projectID = *in.ProjectID
		} else {
			pid, err := resolveProjectID(apiProjectService, in.ProjectNameID)
			if err != nil {
				return nil, UpsertAPIInfoOutput{}, err
			}
			projectID = pid
		}

		// 3. 构建 CreateApiInfoCmd 并调用
		cmd := &command.CreateApiInfoCmd{
			ID: func() int64 {
				if in.ID != nil {
					return *in.ID
				}
				return 0
			}(),
			ProjectID:          projectID,
			Path:               strings.TrimSpace(in.Path),
			Method:             strings.TrimSpace(in.Method),
			Title:              strings.TrimSpace(in.Title),
			ReqSchema:          in.ReqSchema,
			RespSchema:         in.RespSchema,
			Version:            strings.TrimSpace(in.Version),
			Description:        in.Description,
			Editor:             strings.TrimSpace(in.Editor),
			Creator:            strings.TrimSpace(in.Creator),
			MockData:           in.MockData,
			IsUpdateRespSchema: in.IsUpdateRespSchema,
		}
		result, err := apiInfoService.CreateApiInfo(cmd)
		if err != nil {
			return nil, UpsertAPIInfoOutput{}, fmt.Errorf("创建/更新接口失败: %w", err)
		}

		out := UpsertAPIInfoOutput{
			ID:                   result.ID,
			MockGenerationStatus: result.MockGenerationStatus,
		}
		return nil, out, nil
	})

	return server
}

// toProjectResult 将 entity.ApiProject 转为 query.ApiProjectQueryResult
func toProjectResult(p *entity.ApiProject) query.ApiProjectQueryResult {
	return query.ApiProjectQueryResult{
		Id:          p.Id,
		ProjectID:   p.ProjectID,
		Name:        p.Name,
		Description: p.Description,
		CTime:       p.CTime,
		MTime:       p.MTime,
		IsDel:       p.IsDel,
		Editor:      p.Editor,
		Creator:     p.Creator,
	}
}

// resolveProjectID 根据 project_name_id 查找项目 ID。
// 1) 优先精确匹配 project_name_id。
// 2) 兜底按 project 展示名 name 匹配（所有项目拉取后本地过滤）。
func resolveProjectID(apiProjectService *domainService.ApiProjectService, projectNameID string) (int64, error) {
	projectNameID = strings.TrimSpace(projectNameID)
	if projectNameID == "" {
		return 0, fmt.Errorf("project_name_id is empty")
	}

	// 1) 按 project_name_id 精确查询
	projects, total, err := apiProjectService.QueryApiProjects(&repository.ApiProjectFilter{
		ProjectNameID: projectNameID,
		Page:          1,
		PageSize:      10,
	})
	if err != nil {
		return 0, fmt.Errorf("按 project_name_id 查询项目失败: %w", err)
	}
	if total == 1 && len(projects) > 0 && projects[0].Id > 0 {
		return projects[0].Id, nil
	}
	if total > 1 {
		return 0, fmt.Errorf("project_name_id 不唯一: %s (total=%d)", projectNameID, total)
	}

	// 2) 兜底：按项目展示名 name 做本地匹配
	allProjects, _, err := apiProjectService.QueryApiProjects(&repository.ApiProjectFilter{
		Page:     1,
		PageSize: 1000,
	})
	if err != nil {
		return 0, fmt.Errorf("查询所有项目列表失败: %w", err)
	}

	var matches []int64
	for _, p := range allProjects {
		if strings.TrimSpace(p.Name) == projectNameID && p.Id > 0 {
			matches = append(matches, p.Id)
		}
	}
	if len(matches) == 1 {
		return matches[0], nil
	}
	if len(matches) > 1 {
		return 0, fmt.Errorf("项目名称不唯一: %s (matches=%d)", projectNameID, len(matches))
	}
	return 0, fmt.Errorf("未找到项目: project_name_id/name=%s", projectNameID)
}
