# Font Size Preferences Implementation

## Overview
The app now supports user-configurable font sizes (Small, Normal, Large) that apply throughout the application.

## How to Use

### Option 1: Using `scaledFontSize` in inline styles (Recommended)
```tsx
import { useFontSize } from '../theme/FontSizeProvider';

function MyComponent() {
  const { scaledFontSize } = useFontSize();
  
  return (
    <Text style={[styles.title, { fontSize: scaledFontSize(18) }]}>
      Title
    </Text>
  );
}
```

### Option 2: Using `ScaledText` component
```tsx
import ScaledText from '../components/ScaledText';

function MyComponent() {
  return (
    <ScaledText baseFontSize={18} style={styles.title}>
      Title
    </ScaledText>
  );
}
```

### Option 3: Using `useScaledFontSizes` hook for multiple sizes
```tsx
import { useScaledFontSizes } from '../theme/useScaledStyles';

function MyComponent() {
  const fontSizes = useScaledFontSizes({
    title: 24,
    subtitle: 18,
    body: 14,
  });
  
  return (
    <>
      <Text style={{ fontSize: fontSizes.title }}>Title</Text>
      <Text style={{ fontSize: fontSizes.subtitle }}>Subtitle</Text>
      <Text style={{ fontSize: fontSizes.body }}>Body</Text>
    </>
  );
}
```

## Font Size Multipliers
- **Small**: 0.85x (15% smaller)
- **Normal**: 1.0x (default)
- **Large**: 1.15x (15% larger)

## Default Behavior
- All fonts default to "Normal" size
- Font size preference is persisted in AsyncStorage
- Changes apply immediately when user selects a new size in Settings

