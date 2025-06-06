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
        offset: {
          type: 'number',
          description: 'Offset for pagination',
          minimum: 0,
          default: 0,
        },
        statusFilter: {
          type: 'array',
          description: 'Filter projects by status',
          items: {
            type: 'string',
            enum: ['published', 'draft', 'scheduled'],
          },
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
];