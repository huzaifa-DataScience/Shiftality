import React from 'react';
import { Platform, Image as RNImage, ImageProps } from 'react-native';

// Try to require fast-image. If it's not installed/linked, we'll just use RN Image.
let FastImage: any;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  FastImage = require('react-native-fast-image');
} catch {}

export default function AppImage(props: ImageProps) {
  if (Platform.OS === 'ios' && FastImage) {
    // Use FastImage only on iOS (or wherever it's available)
    const Comp = FastImage as React.ComponentType<any>;
    const { resizeMode, ...rest } = props as any;
    return (
      <Comp {...rest} resizeMode={resizeMode ?? Comp.resizeMode.contain} />
    );
  }
  // Fallback (all Android, or if FastImage isn't available)
  return <RNImage {...props} />;
}
