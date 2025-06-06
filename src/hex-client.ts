#!/usr/bin/env node

import fetch, { RequestInit as NodeFetchRequestInit } from 'node-fetch';
import { z } from 'zod';
import type { HexProject, HexProjectRun, HexProjectInput, HexApiError, PageInfo } from './types.js';

export class HexApiClient {
  private apiToken: string;
  private baseUrl: string;
  private rateLimitRemaining: number = 60;
  private rateLimitReset: Date = new Date();

  constructor(apiToken: string, baseUrl: string = 'https://app.hex.tech/api/v1') {
    if (!apiToken) {
      throw new Error('HEX_API_TOKEN is required');
    }
    this.apiToken = apiToken;
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: any = {}
  ): Promise<T> {
    const url = `${this.baseUrl}/${endpoint}`;
    
    const fetchOptions: NodeFetchRequestInit = {
      method: options.method || 'GET',
      headers: {
        'Authorization': `Bearer ${this.apiToken}`,
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
    };

    if (options.body) {
      fetchOptions.body = options.body;
    }
    
    const response = await fetch(url, fetchOptions as any);

    // Update rate limit info
    const remaining = response.headers.get('x-ratelimit-remaining');
    const reset = response.headers.get('x-ratelimit-reset');
    if (remaining) this.rateLimitRemaining = parseInt(remaining);
    if (reset) this.rateLimitReset = new Date(parseInt(reset) * 1000);

    if (!response.ok) {
      let errorDetails;
      try {
        errorDetails = await response.json();
      } catch {
        errorDetails = await response.text();
      }
      
      const error: HexApiError = {
        statusCode: response.status,
        message: response.statusText,
        details: errorDetails,
      };
      
      throw new Error(`Hex API Error ${error.statusCode}: ${error.message}${error.details ? ` - ${JSON.stringify(error.details)}` : ''}`);
    }

    return response.json() as Promise<T>;
  }

  async listProjects(params?: {
    limit?: number;
    after?: string;
    statuses?: string[];
  }): Promise<{ projects: HexProject[]; pageInfo: any }> {
    const queryParams = new URLSearchParams();
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.after) queryParams.append('after', params.after);
    if (params?.statuses?.length) {
      params.statuses.forEach(status => queryParams.append('statuses', status));
    }

    const response = await this.request<any>(`projects?${queryParams.toString()}`);
    
    return {
      projects: response.values || [],
      pageInfo: {
        after: response.pagination?.after || null,
        before: response.pagination?.before || null,
      },
    };
  }

  async getProject(projectId: string): Promise<HexProject> {
    const response = await this.request<any>(`projects/${projectId}`);
    return response;
  }

  async runProject(
    projectId: string,
    params?: {
      inputs?: Record<string, any>;
      updateCache?: boolean;
      useCachedSqlResults?: boolean;
      updatePublishedResults?: boolean;
      notifyWhenNotPending?: boolean;
      dryRun?: boolean;
    }
  ): Promise<HexProjectRun> {
    const body: any = {};
    if (params?.inputs) body.inputs = params.inputs;
    if (params?.updateCache !== undefined) body.updateCache = params.updateCache;
    if (params?.useCachedSqlResults !== undefined) body.useCachedSqlResults = params.useCachedSqlResults;
    if (params?.updatePublishedResults !== undefined) body.updatePublishedResults = params.updatePublishedResults;
    if (params?.notifyWhenNotPending !== undefined) body.notifyWhenNotPending = params.notifyWhenNotPending;
    if (params?.dryRun !== undefined) body.dryRun = params.dryRun;

    const response = await this.request<any>(`project/${projectId}/run`, {
      method: 'POST',
      body: JSON.stringify(body),
    });
    
    return response;
  }

  async getRunStatus(projectId: string, runId: string): Promise<HexProjectRun> {
    const response = await this.request<any>(`project/${projectId}/run/${runId}`);
    return response;
  }

  async cancelRun(projectId: string, runId: string): Promise<void> {
    await this.request(`project/${projectId}/run/${runId}/cancel`, {
      method: 'POST',
    });
  }

  async createProjectEmbedUrl(
    projectId: string,
    params?: {
      viewMode?: 'app' | 'edit' | 'readOnly';
      borderless?: boolean;
      colorMode?: 'light' | 'dark';
      hideHeader?: boolean;
      hideSidebar?: boolean;
      inputs?: Record<string, any>;
    }
  ): Promise<{ embedUrl: string }> {
    const queryParams = new URLSearchParams();
    if (params?.viewMode) queryParams.append('viewMode', params.viewMode);
    if (params?.borderless !== undefined) queryParams.append('borderless', params.borderless.toString());
    if (params?.colorMode) queryParams.append('colorMode', params.colorMode);
    if (params?.hideHeader !== undefined) queryParams.append('hideHeader', params.hideHeader.toString());
    if (params?.hideSidebar !== undefined) queryParams.append('hideSidebar', params.hideSidebar.toString());
    if (params?.inputs) {
      Object.entries(params.inputs).forEach(([key, value]) => {
        queryParams.append(`inputs[${key}]`, String(value));
      });
    }

    const url = `${this.baseUrl}/project/${projectId}/embed?${queryParams.toString()}`;
    return { embedUrl: url };
  }

  async getProjectInputs(projectId: string): Promise<HexProjectInput[]> {
    const project = await this.getProject(projectId);
    // Note: The actual Hex API doesn't provide a direct endpoint for inputs,
    // so this would need to be extracted from the project metadata
    // This is a placeholder implementation
    return [];
  }

  getRateLimitInfo(): { remaining: number; reset: Date } {
    return {
      remaining: this.rateLimitRemaining,
      reset: this.rateLimitReset,
    };
  }
}