import {
  FETCH_DEFECTS_SUCCESS,
  ADD_DEFECT,
  RESOLVE_DEFECT
} from '../actions/actionTypes';

const initialState = {
  defects: []
};

export default function defectReducer(state = initialState, action) {
  switch (action.type) {
    case FETCH_DEFECTS_SUCCESS:
      return { ...state, defects: action.payload };
    case ADD_DEFECT:
      return { ...state, defects: [action.payload, ...state.defects] };
    case RESOLVE_DEFECT:
      return {
        ...state,
        defects: state.defects.filter(defect => defect._id !== action.payload)
      };
    default:
      return state;
  }
}