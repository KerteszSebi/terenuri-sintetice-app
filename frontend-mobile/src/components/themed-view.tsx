import { View, type ViewProps } from 'react-native';

import { ThemeColor } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { getViewBackgroundStyle } from '@/styles/themed-view';

export type ThemedViewProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
  type?: ThemeColor;
};

export function ThemedView({ style, lightColor, darkColor, type, ...otherProps }: ThemedViewProps) {
  const theme = useTheme();

  return (
    <View
      style={[getViewBackgroundStyle(theme[type ?? 'background']), style]}
      {...otherProps}
    />
  );
}
