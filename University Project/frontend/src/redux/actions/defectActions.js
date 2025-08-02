import {
  FETCH_DEFECTS_SUCCESS,
  ADD_DEFECT,
  RESOLVE_DEFECT
} from './actionTypes';
import * as api from '../../services/api';

export const fetchDefects = () => async (dispatch) => {
  try {
    const defects = await api.getDefects();
    dispatch({ type: FETCH_DEFECTS_SUCCESS, payload: defects });
  } catch (error) {
    console.error('Error fetching defects:', error);
  }
};

export const addDefect = (defect) => ({
  type: ADD_DEFECT,
  payload: defect
});

export const resolveDefect = (id) => async (dispatch) => {
  try {
    await api.resolveDefect(id);
    dispatch({ type: RESOLVE_DEFECT, payload: id });
  } catch (error) {
    console.error('Error resolving defect:', error);
  }
};