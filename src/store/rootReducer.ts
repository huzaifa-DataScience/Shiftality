import { combineReducers } from '@reduxjs/toolkit';
import surveyReducer from './reducers/surveyReducer';
import homeOnboardingReducer from './reducers/homeOnboardingReducer';
import profileReducer from './reducers/profileReducer';

const rootReducer = combineReducers({
  survey: surveyReducer,
  homeOnboarding: homeOnboardingReducer,
  profile: profileReducer,
});

export default rootReducer;
export type RootState = ReturnType<typeof rootReducer>;
