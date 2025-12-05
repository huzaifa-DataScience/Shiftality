// src/lib/toastConfig.tsx
import { BaseToast, ErrorToast } from 'react-native-toast-message';
import { moderateScale as ms, scale } from 'react-native-size-matters';
import React from 'react';
import { Platform } from 'react-native';

export const toastConfig = {
  /*
    Overwrite 'success' type, adding the default config plus custom styling
  */
  success: (props: React.ComponentProps<typeof BaseToast>) => (
    <BaseToast
      {...props}
      style={{
        borderLeftColor: '#22C55E',
        borderLeftWidth: 4,
        backgroundColor: '#1A1E2A',
        height: 60,
        borderRadius: 12,
        paddingHorizontal: 16,
        top: Platform.OS === 'ios' ? scale(20) : scale(5),
      }}
      contentContainerStyle={{ paddingHorizontal: 12 }}
      text1Style={{
        fontSize: ms(16),
        fontWeight: '600',
        color: '#FFFFFF',
        fontFamily: 'SourceSansPro-Regular',
      }}
      text2Style={{
        fontSize: ms(14),
        color: '#B0B6C3',
        fontFamily: 'SourceSansPro-Regular',
      }}
    />
  ),
  /*
    Overwrite 'error' type, adding the default config plus custom styling
  */
  error: (props: React.ComponentProps<typeof ErrorToast>) => (
    <ErrorToast
      {...props}
      style={{
        borderLeftColor: '#EF4444',
        borderLeftWidth: 4,
        backgroundColor: '#1A1E2A',
        height: 60,
        borderRadius: 12,
        paddingHorizontal: 16,
        top: Platform.OS === 'ios' ? scale(20) : scale(5),
      }}
      contentContainerStyle={{ paddingHorizontal: 12 }}
      text1Style={{
        fontSize: ms(16),
        fontWeight: '600',
        color: '#FFFFFF',
        fontFamily: 'SourceSansPro-Regular',
      }}
      text2Style={{
        fontSize: ms(14),
        color: '#B0B6C3',
        fontFamily: 'SourceSansPro-Regular',
      }}
    />
  ),
  /*
    Overwrite 'info' type, adding the default config plus custom styling
  */
  info: (props: React.ComponentProps<typeof BaseToast>) => (
    <BaseToast
      {...props}
      style={{
        borderLeftColor: '#3DA9FF',
        borderLeftWidth: 4,
        backgroundColor: '#1A1E2A',
        height: 60,
        borderRadius: 12,
        paddingHorizontal: 16,
      }}
      contentContainerStyle={{ paddingHorizontal: 12 }}
      text1Style={{
        fontSize: ms(16),
        fontWeight: '600',
        color: '#FFFFFF',
        fontFamily: 'SourceSansPro-Regular',
      }}
      text2Style={{
        fontSize: ms(14),
        color: '#B0B6C3',
        fontFamily: 'SourceSansPro-Regular',
      }}
    />
  ),
};
