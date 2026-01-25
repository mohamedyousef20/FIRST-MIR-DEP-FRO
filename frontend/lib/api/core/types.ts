import { AxiosRequestConfig, AxiosResponse } from 'axios';

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface ListQueryParams {
  page?: number;
  limit?: number;
  sort?: string;
  search?: string;
  [key: string]: any;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  code?: string;
}

export type ApiRequestConfig = AxiosRequestConfig;
export type ApiResponseType<T> = AxiosResponse<ApiResponse<T>>;

export interface ErrorResponse {
  statusCode: number;
  message: string;
  code?: string;
  details?: any;
  timestamp?: string;
  path?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}
