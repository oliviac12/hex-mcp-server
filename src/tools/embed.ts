import type { Tool } from '@modelcontextprotocol/sdk/types.js';

export const embedTools: Tool[] = [
  {
    name: 'hex_create_embed_url',
    description: 'Generate an embed URL for a Hex project with customization options',
    inputSchema: {
      type: 'object',
      properties: {
        projectId: {
          type: 'string',
          description: 'The ID of the project to embed',
        },
        viewMode: {
          type: 'string',
          description: 'The view mode for the embedded project',
          enum: ['app', 'edit', 'readOnly'],
          default: 'app',
        },
        borderless: {
          type: 'boolean',
          description: 'Remove borders from the embedded view',
          default: false,
        },
        colorMode: {
          type: 'string',
          description: 'Color mode for the embedded view',
          enum: ['light', 'dark'],
        },
        hideHeader: {
          type: 'boolean',
          description: 'Hide the header in the embedded view',
          default: false,
        },
        hideSidebar: {
          type: 'boolean',
          description: 'Hide the sidebar in the embedded view',
          default: false,
        },
        inputs: {
          type: 'object',
          description: 'Pre-filled input values for the embedded project',
          additionalProperties: true,
        },
      },
      required: ['projectId'],
    },
  },
];