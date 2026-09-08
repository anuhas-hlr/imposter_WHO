import React, { useRef } from 'react';
import { StyleSheet, Text, Pressable, ViewStyle, TextStyle, View, Animated } from 'react-native';
import { triggerHaptic, soundEffects } from '../utils/soundAndHaptics';

interface Props {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'danger' | 'success' | 'secondary' | 'warning' | 'outline';
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
}

export const PrimaryButton: React.FC<Props> = ({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  style,
  textStyle,
  icon,
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    if (disabled) return;
    Animated.spring(scaleAnim, {
      toValue: 0.96,
      useNativeDriver: true,
      speed: 30,
      bounciness: 6,
    }).start();
  };

  const handlePressOut = () => {
    if (disabled) return;
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 30,
      bounciness: 8,
    }).start();
  };

  const handlePress = () => {
    if (disabled) return;
    triggerHaptic.medium();
    soundEffects.playClick();
    onPress();
  };

  const getColors = () => {
    if (disabled) {
      return {
        bg: '#e2e8f0',
        borderBottom: '#cbd5e1',
        text: '#94a3b8',
      };
    }
    switch (variant) {
      case 'danger':
        return {
          bg: '#ff4d6d',
          borderBottom: '#c9184a',
          text: '#ffffff',
        };
      case 'success':
        return {
          bg: '#10b981',
          borderBottom: '#059669',
          text: '#ffffff',
        };
      case 'warning':
        return {
          bg: '#f59e0b',
          borderBottom: '#d97706',
          text: '#ffffff',
        };
      case 'secondary':
        return {
          bg: '#f1f5f9',
          borderBottom: '#cbd5e1',
          text: '#334155',
        };
      case 'outline':
        return {
          bg: '#ffffff',
          borderBottom: '#e2e8f0',
          text: '#3b82f6',
        };
      case 'primary':
      default:
        return {
          bg: '#3b82f6',
          borderBottom: '#1d4ed8',
          text: '#ffffff',
        };
    }
  };

  const colors = getColors();

  return (
    <Animated.View style={[{ transform: [{ scale: scaleAnim }] }, style]}>
      <Pressable
        disabled={disabled}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={handlePress}
        style={[
          styles.button,
          {
            backgroundColor: colors.bg,
            borderBottomColor: colors.borderBottom,
            borderBottomWidth: disabled ? 0 : 5,
            borderWidth: variant === 'outline' ? 2 : 0,
            borderColor: variant === 'outline' ? '#3b82f6' : undefined,
          },
        ]}
      >
        <View style={styles.content}>
          {icon && <View style={styles.iconContainer}>{icon}</View>}
          <Text style={[styles.text, { color: colors.text }, textStyle]}>
            {title}
          </Text>
        </View>
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingVertical: 16,
    paddingHorizontal: 26,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    marginRight: 10,
  },
  text: {
    fontSize: 17,
    fontWeight: '900',
    letterSpacing: 0.5,
    textAlign: 'center',
  },
});
