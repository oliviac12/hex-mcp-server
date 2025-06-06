#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ErrorCode,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';
import type { Tool } from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';
import { HexApiClient } from './hex-client.js';
import { projectTools } from './tools/projects.js';
import { runTools } from './tools/runs.js';
import { embedTools } from './tools/embed.js';

// Get API token from environment
const apiToken = process.env.HEX_API_TOKEN;
if (!apiToken) {
  console.error('Error: HEX_API_TOKEN environment variable is required');
  process.exit(1);
}

// Initialize Hex client
const hexClient = new HexApiClient(apiToken);

// Create server instance
const server = new Server(
  {
    name: 'hex-mcp-server',
    version: '0.1.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Define all available tools
const allTools: Tool[] = [
  ...projectTools,
  ...runTools,
  ...embedTools,
];

// Handle list tools request
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: allTools,
  };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      // Project tools
      case 'hex_list_projects': {
        const validated = z.object({
          limit: z.number().min(1).max(100).optional(),
          offset: z.number().min(0).optional(),
          statusFilter: z.array(z.string()).optional(),
        }).parse(args);

        const result = await hexClient.listProjects(validated);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case 'hex_get_project': {
        const validated = z.object({
          projectId: z.string(),
        }).parse(args);

        const project = await hexClient.getProject(validated.projectId);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(project, null, 2),
            },
          ],
        };
      }

      // Run tools
      case 'hex_run_project': {
        const validated = z.object({
          projectId: z.string(),
          inputs: z.record(z.any()).optional(),
          updateCache: z.boolean().optional(),
          notifyWhenNotPending: z.boolean().optional(),
          dryRun: z.boolean().optional(),
        }).parse(args);

        const run = await hexClient.runProject(validated.projectId, validated);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(run, null, 2),
            },
          ],
        };
      }

      case 'hex_get_run_status': {
        const validated = z.object({
          projectId: z.string(),
          runId: z.string(),
        }).parse(args);

        const status = await hexClient.getRunStatus(validated.projectId, validated.runId);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(status, null, 2),
            },
          ],
        };
      }

      case 'hex_cancel_run': {
        const validated = z.object({
          projectId: z.string(),
          runId: z.string(),
        }).parse(args);

        await hexClient.cancelRun(validated.projectId, validated.runId);
        return {
          content: [
            {
              type: 'text',
              text: `Successfully canceled run ${validated.runId} for project ${validated.projectId}`,
            },
          ],
        };
      }

      // Embed tools
      case 'hex_create_embed_url': {
        const validated = z.object({
          projectId: z.string(),
          viewMode: z.enum(['app', 'edit', 'readOnly']).optional(),
          borderless: z.boolean().optional(),
          colorMode: z.enum(['light', 'dark']).optional(),
          hideHeader: z.boolean().optional(),
          hideSidebar: z.boolean().optional(),
          inputs: z.record(z.any()).optional(),
        }).parse(args);

        const result = await hexClient.createProjectEmbedUrl(
          validated.projectId,
          validated
        );
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case 'hex_rate_limit_status': {
        const info = hexClient.getRateLimitInfo();
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(info, null, 2),
            },
          ],
        };
      }

      default:
        throw new McpError(
          ErrorCode.MethodNotFound,
          `Unknown tool: ${name}`
        );
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new McpError(
        ErrorCode.InvalidParams,
        `Invalid parameters: ${error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')}`
      );
    }
    
    if (error instanceof McpError) {
      throw error;
    }

    throw new McpError(
      ErrorCode.InternalError,
      `Tool execution failed: ${error instanceof Error ? error.message : String(error)}`
    );
  }
});

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Hex MCP server started successfully');
}

main().catch((error) => {
  console.error('Fatal error starting server:', error);
  process.exit(1);
});