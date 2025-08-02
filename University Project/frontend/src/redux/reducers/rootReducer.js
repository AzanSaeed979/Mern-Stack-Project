import { combineReducers } from 'redux';
import productReducer from './productReducer';
import defectReducer from './defectReducer';

export default combineReducers({
  production: productReducer,
  defects: defectReducer
});