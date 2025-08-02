import {
  FETCH_PRODUCTS_SUCCESS,
  ADD_PRODUCT,
  FETCH_STATS_SUCCESS
} from '../actions/actionTypes';

const initialState = {
  products: [],
  stats: []
};

export default function productReducer(state = initialState, action) {
  switch (action.type) {
    case FETCH_PRODUCTS_SUCCESS:
      return { ...state, products: action.payload };
    case ADD_PRODUCT:
      return { ...state, products: [action.payload, ...state.products] };
    case FETCH_STATS_SUCCESS:
      return { ...state, stats: action.payload };
    default:
      return state;
  }
}