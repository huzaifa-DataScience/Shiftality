import { combineReducers } from '@reduxjs/toolkit';
import surveyReducer from './surveyReducer';

const rootReducer = combineReducers({
  survey: surveyReducer,
});

export default rootReducer;
export type RootState = ReturnType<typeof rootReducer>;
