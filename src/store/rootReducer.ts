import { combineReducers } from '@reduxjs/toolkit';
import surveyReducer from './reducers/surveyReducer';
import homeOnboardingReducer from './reducers/homeOnboardingReducer';

const rootReducer = combineReducers({
  survey: surveyReducer,
  homeOnboarding: homeOnboardingReducer,
});

export default rootReducer;
export type RootState = ReturnType<typeof rootReducer>;
