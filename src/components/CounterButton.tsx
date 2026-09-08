import React, { useRef } from 'react';
import { StyleSheet, Text, View, Pressable, Animated } from 'react-native';
import { triggerHaptic, soundEffects } from '../utils/soundAndHaptics';
import { Colors, Borders } from '../theme/colors';

interface Props {
  label: string;
  subtitle?: string;
  value: number;
  min: number;
  max: number;
  onChange: (val: number) => void;
  accentColor?: string;
  iconEmoji?: string;
}

export const CounterButton: React.FC<Props> = ({
  label,
  subtitle,
  value,
  min,
  max,
  onChange,
  accentColor = Colors.sky,
  iconEmoji,
}) => {
  const decAnim = useRef(new Animated.Value(0)).current;
  const incAnim = useRef(new Animated.Value(0)).current;
  const numAnim = useRef(new Animated.Value(1)).current;

  const pressDown = (anim: Animated.Value) => {
    Animated.timing(anim, { toValue: 3, duration: 60, useNativeDriver: true }).start();
  };
  const pressUp = (anim: Animated.Value) => {
    Animated.spring(anim, { toValue: 0, useNativeDriver: true, speed: 30, bounciness: 8 }).start();
  };

  const pulseNumber = () => {
    Animated.sequence([
      Animated.timing(numAnim, { toValue: 1.35, duration: 80, useNativeDriver: true }),
      Animated.spring(numAnim, { toValue: 1, friction: 3, tension: 100, useNativeDriver: true }),
    ]).start();
  };

  const handleDecrement = () => {
    if (value > min) {
      pulseNumber();
      triggerHaptic.light();
      soundEffects.playClick();
      onChange(value - 1);
    }
  };

  const handleIncrement = () => {
    if (value < max) {
      pulseNumber();
      triggerHaptic.light();
      soundEffects.playClick();
      onChange(value + 1);
    }
  };

  const canDec = value > min;
  const canInc = value < max;

  return (
    <View style={styles.card}>
      {/* Label */}
      <View style={styles.labelSection}>
        <View style={styles.titleRow}>
          {iconEmoji && <Text style={styles.emoji}>{iconEmoji}</Text>}
          <Text style={styles.label}>{label}</Text>
        </View>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>

      {/* Controls */}
      <View style={styles.controls}>
        {/* Decrement */}
        <View style={[styles.btnShadow, { backgroundColor: canDec ? Colors.dark : Colors.muted }]}>
          <Animated.View style={{ transform: [{ translateY: decAnim }] }}>
            <Pressable
              disabled={!canDec}
              onPressIn={() => pressDown(decAnim)}
              onPressOut={() => pressUp(decAnim)}
              onPress={handleDecrement}
              style={[
                styles.btn,
                {
                  backgroundColor: canDec ? Colors.bgCard : Colors.bgWarm,
                  borderColor: canDec ? Colors.dark : Colors.muted,
                  opacity: canDec ? 1 : 0.5,
                },
              ]}
            >
              <Text style={[styles.btnSymbol, { color: canDec ? Colors.dark : Colors.muted }]}>
                −
              </Text>
            </Pressable>
          </Animated.View>
        </View>

        {/* Value display */}
        <Animated.View style={[styles.valueBox, { transform: [{ scale: numAnim }] }]}>
          <Text style={[styles.valueText, { color: accentColor }]}>{value}</Text>
        </Animated.View>

        {/* Increment */}
        <View style={[styles.btnShadow, { backgroundColor: canInc ? Colors.dark : Colors.muted }]}>
          <Animated.View style={{ transform: [{ translateY: incAnim }] }}>
            <Pressable
              disabled={!canInc}
              onPressIn={() => pressDown(incAnim)}
              onPressOut={() => pressUp(incAnim)}
              onPress={handleIncrement}
              style={[
                styles.btn,
                {
                  backgroundColor: canInc ? accentColor : Colors.bgWarm,
                  borderColor: canInc ? Colors.dark : Colors.muted,
                  opacity: canInc ? 1 : 0.5,
                },
              ]}
            >
              <Text style={[styles.btnSymbol, { color: canInc ? Colors.bgCard : Colors.muted }]}>
                +
              </Text>
            </Pressable>
          </Animated.View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.bgCard,
    borderWidth: Borders.width,
    borderColor: Colors.dark,
    borderRadius: Borders.radius,
    paddingVertical: 14,
    paddingHorizontal: 18,
    shadowColor: Colors.dark,
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  labelSection: { flex: 1, paddingRight: 10 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  emoji: { fontSize: 20 },
  label: { color: Colors.dark, fontSize: 16, fontWeight: '800' },
  subtitle: { color: Colors.muted, fontSize: 12, fontWeight: '600', marginTop: 2 },

  controls: { flexDirection: 'row', alignItems: 'center', gap: 6 },

  btnShadow: {
    borderRadius: Borders.radiusSm,
  },
  btn: {
    width: 44,
    height: 44,
    borderRadius: Borders.radiusSm,
    borderWidth: Borders.width,
    justifyContent: 'center',
    alignItems: 'center',
    transform: [{ translateY: -4 }],
  },
  btnSymbol: { fontSize: 22, fontWeight: '900', lineHeight: 26 },

  valueBox: {
    minWidth: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  valueText: {
    fontSize: 30,
    fontWeight: '900',
  },
});
