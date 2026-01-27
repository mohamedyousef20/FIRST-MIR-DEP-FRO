import { cartService } from './services/cartService';
import { productService } from './services/productService';
import { categoryService } from './services/categoryService';
import * as ratingService from './services/rating/rating.service';

export const apiServices = {
  cartService,
  productService,
  categoryService,
  ratingService,
};

export type ApiServices = typeof apiServices;
