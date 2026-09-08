import React, { useRef, ReactNode } from 'react';
import {
  StyleSheet,
  Text,
  Pressable,
  Animated,
  View,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { Colors, Borders } from '../theme/colors';
import { triggerHaptic, soundEffects } from '../utils/soundAndHaptics';

interface Props {
  title: string;
  onPress: () => void;
  color?: string;
  shadowColor?: string;
  textColor?: string;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: ReactNode;
  /** How many pixels to depress on press (default 5) */
  depth?: number;
}

export const ChunkyButton: React.FC<Props> = ({
  title,
  onPress,
  color = Colors.sky,
  shadowColor,
  textColor = Colors.bgCard,
  disabled = false,
  style,
  textStyle,
  icon,
  depth = 5,
}) => {
  const shadow = shadowColor ?? Colors.dark;
  const translateY = useRef(new Animated.Value(0)).current;

  const pressIn = () => {
    if (disabled) return;
    Animated.timing(translateY, {
      toValue: depth,
      duration: 60,
      useNativeDriver: true,
    }).start();
  };

  const pressOut = () => {
    Animated.spring(translateY, {
      toValue: 0,
      useNativeDriver: true,
      speed: 40,
      bounciness: 6,
    }).start();
  };

  const handlePress = () => {
    if (disabled) return;
    triggerHaptic.medium();
    soundEffects.playClick();
    onPress();
  };

  return (
    // The static "shadow" block sits below
    <View
      style={[
        styles.shadowLayer,
        {
          backgroundColor: disabled ? Colors.muted : shadow,
          borderRadius: Borders.radius,
          marginBottom: depth,
        },
        style,
      ]}
    >
      <Animated.View style={{ transform: [{ translateY }] }}>
        <Pressable
          disabled={disabled}
          onPressIn={pressIn}
          onPressOut={pressOut}
          onPress={handlePress}
          style={[
            styles.button,
            {
              backgroundColor: disabled ? Colors.muted : color,
              borderRadius: Borders.radius,
              borderColor: disabled ? Colors.muted : shadow,
            },
          ]}
        >
          <View style={styles.inner}>
            {icon && <View style={styles.iconWrap}>{icon}</View>}
            <Text style={[styles.label, { color: disabled ? Colors.bgCard : textColor }, textStyle]}>
              {title}
            </Text>
          </View>
        </Pressable>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  shadowLayer: {
    // The "physical" bottom of the button
    width: '100%',
  },
  button: {
    paddingVertical: 16,
    paddingHorizontal: 28,
    borderWidth: Borders.width,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 58,
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  iconWrap: {},
  label: {
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 0.6,
    textAlign: 'center',
  },
});
