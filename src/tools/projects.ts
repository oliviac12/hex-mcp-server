import type { Tool } from '@modelcontextprotocol/sdk/types.js';

export const projectTools: Tool[] = [
  {
    name: 'hex_list_projects',
    description: 'List all viewable Hex projects with pagination support',
    inputSchema: {
      type: 'object',
      properties: {
        limit: {
          type: 'number',
          description: 'Maximum number of projects to return (1-100)',
          minimum: 1,
          maximum: 100,
          default: 50,
        },
        after: {
          type: 'string',
          description: 'Pagination cursor from previous response',
        },
        statuses: {
          type: 'array',
          description: 'Filter by project status (default: ["Blessed"])',
          items: {
            type: 'string',
          },
          default: ['Blessed'],
        },
      },
    },
  },
  {
    name: 'hex_get_project',
    description: 'Get detailed information about a specific Hex project',
    inputSchema: {
      type: 'object',
      properties: {
        projectId: {
          type: 'string',
          description: 'The ID of the project to retrieve',
        },
      },
      required: ['projectId'],
    },
  },
  {
    name: 'hex_get_project_url',
    description: 'PREFERRED: Get URL to view a Hex project with its latest cached/scheduled results. Use this FIRST before running. Shows dashboards without triggering computation.',
    inputSchema: {
      type: 'object',
      properties: {
        projectId: {
          type: 'string',
          description: 'The ID of the project',
        },
        viewMode: {
          type: 'string',
          description: 'View mode: "app" for published view, "edit" for editor',
          enum: ['app', 'edit'],
          default: 'app',
        },
      },
      required: ['projectId'],
    },
  },
  {
    name: 'hex_view_dashboard',
    description: 'View a Hex dashboard/project using cached results. Use this for ANY request to "see", "show", "view", or "check" a dashboard. Returns both project info and viewing URL.',
    inputSchema: {
      type: 'object', 
      properties: {
        projectId: {
          type: 'string',
          description: 'The ID of the project to view',
        },
      },
      required: ['projectId'],
    },
  },
];