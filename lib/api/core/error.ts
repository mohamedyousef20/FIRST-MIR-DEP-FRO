export class ApiError extends Error {
  constructor(
    public message: string,
    public status: number,
    public code?: string,
    public details?: any
  ) {
    super(message);
    this.name = 'ApiError';
    Object.setPrototypeOf(this, ApiError.prototype);
  }

  static fromHttpError(error: any): ApiError {
    if (error.response) {
      const { status, data } = error.response;
      return new ApiError(
        data.message || 'An error occurred',
        status,
        data.code,
        data.details
      );
    } else if (error.request) {
      return new ApiError('No response from server', 0, 'NO_RESPONSE');
    } else {
      return new ApiError(error.message || 'An error occurred', 0, 'REQUEST_ERROR');
    }
  }
}

export const handleApiError = (error: any): never => {
  if (error instanceof ApiError) {
    throw error;
  }
  throw ApiError.fromHttpError(error);
};

export const isApiError = (error: any): error is ApiError => {
  return error instanceof ApiError || error?.name === 'ApiError';
};

export const createErrorHandler = (defaultMessage = 'An error occurred') => {
  return (error: any): never => {
    if (isApiError(error)) {
      throw error;
    }
    throw new ApiError(
      error.response?.data?.message || defaultMessage,
      error.response?.status || 0,
      error.response?.data?.code || 'UNKNOWN_ERROR',
      error.response?.data?.details
    );
  };
};
