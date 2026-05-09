package api

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/modelcontextprotocol/go-sdk/mcp"
)

// MCPController 将 MCP Server 以 Gin Handler 的形式暴露。
// 客户端通过 HTTP GET|POST /mcp 使用 MCP 协议进行 SSE 通信。
type MCPController struct {
	sseHandler *mcp.SSEHandler
}

// NewMCPController 创建一个 MCPController。
//
// server 是 Step 1 中通过 NewMCPServer 创建的 *mcp.Server。
// MCP SDK 的 SSEHandler 会自动处理：
//   - GET → 建立 SSE 长连接（客户端持续接收事件）
//   - POST → 接收 JSON-RPC 消息（如 tool call 请求）
//   - 响应通过 SSE 流返回给客户端
func NewMCPController(server *mcp.Server) *MCPController {
	handler := mcp.NewSSEHandler(func(req *http.Request) *mcp.Server {
		return server // 返回单例 Server
	}, nil)
	return &MCPController{sseHandler: handler}
}

// HandleMCP 是 /mcp 端点的统一入口。
// SSEHandler 内部根据 HTTP Method 自行分发：
//   - GET → 建立 SSE 连接
//   - POST → 接收 JSON-RPC 消息
func (c *MCPController) HandleMCP(ctx *gin.Context) {
	c.sseHandler.ServeHTTP(ctx.Writer, ctx.Request)
}
