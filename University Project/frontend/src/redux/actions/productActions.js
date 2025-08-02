import {
  FETCH_PRODUCTS_SUCCESS,
  ADD_PRODUCT,
  FETCH_STATS_SUCCESS
} from './actionTypes';
import * as api from '../../services/api';

export const fetchProducts = (limit = 50, line = null) => async (dispatch) => {
  try {
    const products = await api.getProducts(limit, line);
    dispatch({ type: FETCH_PRODUCTS_SUCCESS, payload: products });
  } catch (error) {
    console.error('Error fetching products:', error);
  }
};

export const addProduct = (product) => ({
  type: ADD_PRODUCT,
  payload: product
});

export const fetchProductionStats = () => async (dispatch) => {
  try {
    const stats = await api.getProductionStats();
    dispatch({ type: FETCH_STATS_SUCCESS, payload: stats });
  } catch (error) {
    console.error('Error fetching production stats:', error);
  }
};