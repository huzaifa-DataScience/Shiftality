// src/lib/navigationRef.ts
import { createNavigationContainerRef } from '@react-navigation/native';
import { CommonActions } from '@react-navigation/native';

export const navigationRef = createNavigationContainerRef();

export function navigate(name: string, params?: any) {
  if (navigationRef.isReady()) {
    navigationRef.dispatch(CommonActions.navigate({ name, params }));
  }
}

export function resetToAuth() {
  if (navigationRef.isReady()) {
    try {
      // Navigate to Auth stack, then to Login screen
      // RootNavigator will automatically show Auth stack when isAuthenticated is false
      // We need to navigate to Login within the Auth stack
      const rootState = navigationRef.getRootState();
      
      // Check if we're already in Auth stack
      if (rootState?.routes?.[rootState.index]?.name === 'Auth') {
        // Navigate to Login within Auth stack
        navigationRef.navigate('Auth', { screen: 'Login' });
      } else {
        // Reset to Auth stack with Login screen
        navigationRef.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [
              {
                name: 'Auth',
                state: {
                  routes: [{ name: 'Login' }],
                  index: 0,
                },
              },
            ],
          }),
        );
      }
    } catch (error) {
      console.error('Error navigating to login:', error);
      // Fallback: just navigate to Auth, user can navigate to Login manually
      if (navigationRef.isReady()) {
        navigationRef.navigate('Auth');
      }
    }
  }
}

