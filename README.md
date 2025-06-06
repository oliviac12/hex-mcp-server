# Hex MCP Server

An MCP (Model Context Protocol) server that provides LLMs with access to the Hex API, enabling AI assistants to interact with Hex projects, run analyses, and manage data workflows.

## Features

- **Project Management**: List and retrieve Hex projects
- **Project Execution**: Run projects with custom inputs and monitor execution status
- **Embed Generation**: Create customizable embed URLs for Hex projects
- **Rate Limit Monitoring**: Track API usage to stay within limits

## Installation

### Via NPX (Recommended)
```bash
npx @olivia/hex-mcp-server
```

### Local Installation
```bash
npm install @olivia/hex-mcp-server
```

## Prerequisites

1. **Hex API Token**: You need a Hex API token. You can create one from:
   - Personal tokens: Your Hex account settings
   - Workspace tokens: Workspace admin settings (for programmatic access)

2. **Node.js**: Version 18 or higher

## Configuration

### Environment Variable
Set your Hex API token as an environment variable:
```bash
export HEX_API_TOKEN="your-hex-api-token"
```

### Claude Desktop Configuration

Add the server to your Claude Desktop configuration file:

**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "hex": {
      "command": "npx",
      "args": ["@olivia/hex-mcp-server"],
      "env": {
        "HEX_API_TOKEN": "your-hex-api-token"
      }
    }
  }
}
```

## Available Tools

### Project Operations

#### `hex_list_projects`
List all viewable Hex projects with pagination support.

**Parameters:**
- `limit` (optional): Maximum number of projects to return (1-100, default: 50)
- `offset` (optional): Offset for pagination (default: 0)
- `statusFilter` (optional): Filter by project status ["published", "draft", "scheduled"]

**Example:**
```json
{
  "limit": 10,
  "offset": 0,
  "statusFilter": ["published"]
}
```

#### `hex_get_project`
Get detailed information about a specific Hex project.

**Parameters:**
- `projectId` (required): The ID of the project to retrieve

### Run Operations

#### `hex_run_project`
Execute a published Hex project with optional input parameters.

**Parameters:**
- `projectId` (required): The ID of the project to run
- `inputs` (optional): Input parameters for the project run
- `updateCache` (optional): Whether to update the cache (default: true)
- `notifyWhenNotPending` (optional): Send notifications when run is no longer pending
- `dryRun` (optional): Simulate the run without executing

**Example:**
```json
{
  "projectId": "abc123",
  "inputs": {
    "date_range": "last_7_days",
    "customer_segment": "enterprise"
  }
}
```

#### `hex_get_run_status`
Get the status of a project run.

**Parameters:**
- `projectId` (required): The ID of the project
- `runId` (required): The ID of the run to check

#### `hex_cancel_run`
Cancel an active project run.

**Parameters:**
- `projectId` (required): The ID of the project
- `runId` (required): The ID of the run to cancel

#### `hex_rate_limit_status`
Get current API rate limit status.

### Embed Operations

#### `hex_create_embed_url`
Generate an embed URL for a Hex project with customization options.

**Parameters:**
- `projectId` (required): The ID of the project to embed
- `viewMode` (optional): The view mode ["app", "edit", "readOnly"] (default: "app")
- `borderless` (optional): Remove borders from the embedded view
- `colorMode` (optional): Color mode ["light", "dark"]
- `hideHeader` (optional): Hide the header in the embedded view
- `hideSidebar` (optional): Hide the sidebar in the embedded view
- `inputs` (optional): Pre-filled input values for the embedded project

**Example:**
```json
{
  "projectId": "abc123",
  "viewMode": "app",
  "colorMode": "dark",
  "inputs": {
    "metric": "revenue"
  }
}
```

## Usage Examples

### With Claude Desktop

Once configured, you can ask Claude to:

- "List my Hex projects"
- "Run the sales dashboard project with last month's data"
- "Check the status of the running analysis"
- "Create an embed URL for the customer analytics dashboard"

### Programmatic Usage

```javascript
import { HexApiClient } from '@olivia/hex-mcp-server';

const client = new HexApiClient(process.env.HEX_API_TOKEN);

// List projects
const { projects } = await client.listProjects({ limit: 10 });

// Run a project
const run = await client.runProject('project-id', {
  inputs: { date: '2024-01-01' }
});

// Check run status
const status = await client.getRunStatus('project-id', run.runId);
```

## Rate Limits

The Hex API has the following rate limits:
- General: 60 requests per minute
- Project runs: 20 requests per minute
- Maximum 25 concurrent running kernels

Use the `hex_rate_limit_status` tool to monitor your current usage.

## Error Handling

The server provides detailed error messages for:
- Invalid API tokens
- Rate limit exceeded (429 errors)
- Invalid project IDs
- Malformed requests
- Network issues

## Development

### Building from Source
```bash
npm install
npm run build
```

### Running in Development
```bash
npm run dev
```

### Running Tests
```bash
npm test
```

## Security

- API tokens are passed via environment variables, not command line arguments
- The server only has access to projects visible to the API token
- All API communications are over HTTPS

## Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Add tests for new functionality
4. Submit a pull request

## License

MIT

## Support

For issues and feature requests, please use the GitHub issue tracker.

For Hex API documentation, visit: https://learn.hex.tech/docs/api/api-overview