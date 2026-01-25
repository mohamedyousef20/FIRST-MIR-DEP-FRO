import { apiClient } from '@/lib/api/core/axios';
import { ApiResponse } from '@/lib/api/core/types';

export type Rating = {
  id: string;
  rating: number;
  comment?: string;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    name: string;
  };
};

export type RatingPayload = {
  rating: number;
  comment?: string;
};

export type RatingListResponse = {
  ratings: Rating[];
  averageRating: number;
  total: number;
};

export type RatingMutationResponse = {
  rating: Rating;
  productAverage: number;
};

export const createRating = async (
  productId: string,
  payload: RatingPayload
): Promise<RatingMutationResponse> => {
  const response = await apiClient.post<ApiResponse<RatingMutationResponse>>(
    `/api/products/${productId}/ratings`,
    payload
  );
  return response.data.data;
};

export const getProductRatings = async (
  productId: string
): Promise<RatingListResponse> => {
  const response = await apiClient.get<ApiResponse<RatingListResponse>>(
    `/api/products/${productId}/ratings`
  );
  return response.data.data;
};

export const updateRating = async (
  productId: string,
  ratingId: string,
  payload: RatingPayload
): Promise<RatingMutationResponse> => {
  const response = await apiClient.patch<ApiResponse<RatingMutationResponse>>(
    `/api/products/${productId}/ratings/${ratingId}`,
    payload
  );
  return response.data.data;
};

export const deleteRating = async (
  productId: string,
  ratingId: string
): Promise<RatingMutationResponse> => {
  const response = await apiClient.delete<ApiResponse<RatingMutationResponse>>(
    `/api/products/${productId}/ratings/${ratingId}`
  );
  return response.data.data;
};
