import type { Tool } from '@modelcontextprotocol/sdk/types.js';

export const runTools: Tool[] = [
  {
    name: 'hex_run_project',
    description: 'Execute a published Hex project with optional input parameters',
    inputSchema: {
      type: 'object',
      properties: {
        projectId: {
          type: 'string',
          description: 'The ID of the project to run',
        },
        inputs: {
          type: 'object',
          description: 'Input parameters for the project run',
          additionalProperties: true,
        },
        updateCache: {
          type: 'boolean',
          description: 'Whether to update the cache (default: true)',
          default: true,
        },
        notifyWhenNotPending: {
          type: 'boolean',
          description: 'Send notifications when run is no longer pending',
          default: false,
        },
        dryRun: {
          type: 'boolean',
          description: 'Simulate the run without actually executing',
          default: false,
        },
      },
      required: ['projectId'],
    },
  },
  {
    name: 'hex_get_run_status',
    description: 'Get the status of a project run',
    inputSchema: {
      type: 'object',
      properties: {
        projectId: {
          type: 'string',
          description: 'The ID of the project',
        },
        runId: {
          type: 'string',
          description: 'The ID of the run to check',
        },
      },
      required: ['projectId', 'runId'],
    },
  },
  {
    name: 'hex_cancel_run',
    description: 'Cancel an active project run',
    inputSchema: {
      type: 'object',
      properties: {
        projectId: {
          type: 'string',
          description: 'The ID of the project',
        },
        runId: {
          type: 'string',
          description: 'The ID of the run to cancel',
        },
      },
      required: ['projectId', 'runId'],
    },
  },
  {
    name: 'hex_rate_limit_status',
    description: 'Get current API rate limit status',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
];