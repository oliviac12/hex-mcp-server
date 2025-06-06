export interface HexProject {
  id: string;
  name: string;
  projectHexId: string;
  publicUrl?: string;
  publishedVersion?: number;
  status: string;
  createdAt: string;
  updatedAt: string;
  owner: {
    id: string;
    email: string;
    name: string;
  };
}

export interface HexProjectRun {
  runId: string;
  runUrl: string;
  runHexId: string;
  projectId: string;
  status: 'running' | 'completed' | 'failed' | 'canceled' | 'pending';
  statusUpdatedAt: string;
  createdAt: string;
  completedAt?: string;
  elapsedTimeMs?: number;
}

export interface HexProjectInput {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'date' | 'select' | 'multi-select';
  value?: any;
  options?: string[];
  required?: boolean;
  description?: string;
}

export interface HexApiError {
  statusCode: number;
  message: string;
  details?: any;
}

export interface PageInfo {
  limit: number;
  offset: number;
  totalItems: number;
  hasMore: boolean;
}