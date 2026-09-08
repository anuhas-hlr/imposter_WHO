import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet, Text, View, SafeAreaView,
  Pressable, ScrollView, Animated,
} from 'react-native';
import { Player, Category } from '../types/game';
import { ChunkyButton } from '../components/ChunkyButton';
import { triggerHaptic, soundEffects } from '../utils/soundAndHaptics';
import { Colors, Borders } from '../theme/colors';

interface Props {
  players: Player[];
  firstSpeakerIndex: number;
  category: Category;
  categories?: Category[];
  onProceedToVoting: () => void;
}

export const DiscussionScreen: React.FC<Props> = ({
  players,
  firstSpeakerIndex,
  category,
  categories,
  onProceedToVoting,
}) => {
  const [timeLeft, setTimeLeft] = useState(120);
  const [isRunning, setIsRunning] = useState(false);
  const [hasStartedOnce, setHasStartedOnce] = useState(false);
  const timerScale = useRef(new Animated.Value(1)).current;

  const firstSpeaker = players[firstSpeakerIndex] || players[0];
  const isMultiTheme = categories && categories.length > 1;

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            triggerHaptic.warning();
            soundEffects.playBuzzer();
            setIsRunning(false);
            return 0;
          }
          if (prev <= 5) {
            Animated.sequence([
              Animated.timing(timerScale, { toValue: 1.2, duration: 130, useNativeDriver: true }),
              Animated.spring(timerScale, { toValue: 1, friction: 3, tension: 100, useNativeDriver: true }),
            ]).start();
            soundEffects.playTimerTick();
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => { if (interval) clearInterval(interval); };
  }, [isRunning, timeLeft]);

  const toggleTimer = () => {
    triggerHaptic.light();
    soundEffects.playClick();
    setIsRunning(!isRunning);
    setHasStartedOnce(true);
  };

  const resetTimer = () => {
    triggerHaptic.light();
    setIsRunning(false);
    setTimeLeft(120);
  };

  const addThirty = () => {
    triggerHaptic.light();
    setTimeLeft((p) => p + 30);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const timerColor =
    timeLeft === 0 ? Colors.coral :
    timeLeft <= 10 ? Colors.gold :
    Colors.sky;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>

        {/* ── Phase Badge ─────────────────────────────── */}
        <View style={styles.header}>
          <View style={styles.phasePill}>
            <Text style={styles.phasePillText}>🗣️  PHASE 2 · GIVE CLUES</Text>
          </View>
          <Text style={styles.themeNote}>
            {isMultiTheme
              ? categories!.map((c) => `${c.icon ?? '🎯'} ${c.name}`).join('  ·  ')
              : `${category.icon ?? '🎯'} ${category.name}`}
          </Text>
        </View>

        {/* ── First Speaker Banner ─────────────────────── */}
        <View style={styles.speakerCard}>
          <View style={styles.micBubble}>
            <Text style={{ fontSize: 34 }}>🎤</Text>
          </View>
          <Text style={styles.speakerLabel}>FIRST CLUE GIVER</Text>
          <Text style={styles.speakerName}>{firstSpeaker.name}</Text>
          <Text style={styles.speakerTip}>
            Say 1 word or 1 short clue, then go clockwise! 🔄
          </Text>
        </View>

        {/* ── Clue Rules ──────────────────────────────── */}
        <View style={styles.rulesCard}>
          <Text style={styles.rulesTitle}>💡 HOW TO GIVE CLUES</Text>
          {[
            ['⭐', 'Civilians:', Colors.sky, 'Prove you know the word without being too obvious!'],
            ['🎭', 'Imposters:', Colors.coral, 'Listen carefully and blend in with a fake clue!'],
            ['🚫', 'NO:', Colors.muted, "Don't say the actual word or rhyme with it!"],
          ].map(([icon, bold, boldColor, rest]) => (
            <View key={bold as string} style={styles.ruleRow}>
              <Text style={styles.ruleIcon}>{icon}</Text>
              <Text style={styles.ruleText}>
                <Text style={{ fontWeight: '900', color: boldColor as string }}>{bold} </Text>
                {rest}
              </Text>
            </View>
          ))}
        </View>

        {/* ── Timer Card ──────────────────────────────── */}
        <View style={[
          styles.timerCard,
          { borderColor: timerColor, shadowColor: timerColor },
        ]}>
          <Text style={[styles.timerLabel, { color: timerColor }]}>
            {timeLeft === 0 ? "⏰ TIME'S UP — VOTE NOW!" : '⏱ DISCUSSION TIMER'}
          </Text>

          <Animated.Text
            style={[styles.timerDigits, { color: timerColor, transform: [{ scale: timerScale }] }]}
          >
            {formatTime(timeLeft)}
          </Animated.Text>

          <View style={styles.timerControls}>
            {/* Play / Pause */}
            <View style={[
              styles.timerBtnShadow,
              { backgroundColor: isRunning ? Colors.coralDark : Colors.mintDark },
            ]}>
              <Pressable
                style={[
                  styles.timerBtn,
                  { backgroundColor: isRunning ? Colors.coral : Colors.mint },
                ]}
                onPress={toggleTimer}
              >
                <Text style={styles.timerBtnText}>
                  {isRunning ? '⏸ Pause' : hasStartedOnce ? '▶ Resume' : '▶ Start'}
                </Text>
              </Pressable>
            </View>

            {/* +30s */}
            <View style={[styles.smallBtnShadow]}>
              <Pressable style={styles.smallBtn} onPress={addThirty}>
                <Text style={styles.smallBtnText}>+30s</Text>
              </Pressable>
            </View>

            {/* Reset */}
            <View style={[styles.smallBtnShadow]}>
              <Pressable style={styles.smallBtn} onPress={resetTimer}>
                <Text style={styles.smallBtnText}>↺</Text>
              </Pressable>
            </View>
          </View>
        </View>

        {/* ── Proceed Button ───────────────────────────── */}
        <View style={styles.bottomArea}>
          <ChunkyButton
            title="Time to Vote! 🗳️"
            onPress={() => {
              triggerHaptic.heavy();
              soundEffects.playClick();
              onProceedToVoting();
            }}
            color={Colors.gold}
            shadowColor={Colors.goldDark}
            textColor={Colors.dark}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.bgWarm },
  container: { padding: 20, paddingBottom: 48 },

  header: { alignItems: 'center', marginVertical: 10 },
  phasePill: {
    backgroundColor: Colors.gold,
    borderWidth: Borders.width,
    borderColor: Colors.dark,
    borderRadius: Borders.radiusFull,
    paddingVertical: 7,
    paddingHorizontal: 20,
    marginBottom: 8,
    shadowColor: Colors.dark,
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 3,
  },
  phasePillText: {
    color: Colors.dark,
    fontWeight: '900',
    fontSize: 13,
    letterSpacing: 1,
  },
  themeNote: {
    color: Colors.slate,
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
  },

  speakerCard: {
    backgroundColor: Colors.bgCard,
    borderWidth: Borders.width + 1,
    borderColor: Colors.dark,
    borderRadius: Borders.radiusLg,
    padding: 24,
    alignItems: 'center',
    marginVertical: 14,
    shadowColor: Colors.dark,
    shadowOffset: { width: 5, height: 5 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 5,
  },
  micBubble: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: Colors.bgWarm,
    borderWidth: Borders.width,
    borderColor: Colors.dark,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: Colors.dark,
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 3,
  },
  speakerLabel: {
    color: Colors.sky,
    fontWeight: '900',
    fontSize: 12,
    letterSpacing: 2,
  },
  speakerName: {
    color: Colors.dark,
    fontSize: 36,
    fontWeight: '900',
    marginVertical: 4,
    textAlign: 'center',
  },
  speakerTip: {
    color: Colors.slate,
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
    maxWidth: 280,
    lineHeight: 20,
  },

  rulesCard: {
    backgroundColor: Colors.bgCard,
    borderWidth: Borders.width,
    borderColor: Colors.dark,
    borderRadius: Borders.radius,
    padding: 18,
    marginVertical: 10,
    shadowColor: Colors.dark,
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  rulesTitle: {
    color: Colors.dark,
    fontWeight: '900',
    fontSize: 13,
    letterSpacing: 1,
    marginBottom: 12,
  },
  ruleRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 8, gap: 8 },
  ruleIcon: { fontSize: 16, marginTop: 1 },
  ruleText: { color: Colors.slate, fontSize: 14, fontWeight: '600', flex: 1, lineHeight: 20 },

  timerCard: {
    backgroundColor: Colors.bgCard,
    borderWidth: Borders.width,
    borderRadius: Borders.radius,
    padding: 22,
    alignItems: 'center',
    marginVertical: 12,
    shadowOffset: { width: 5, height: 5 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 5,
  },
  timerLabel: {
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1.5,
    marginBottom: 6,
  },
  timerDigits: {
    fontSize: 60,
    fontWeight: '900',
    letterSpacing: 3,
    marginBottom: 18,
    fontVariant: ['tabular-nums'],
  },
  timerControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },

  // Play/Pause button shadow wrapper
  timerBtnShadow: {
    borderRadius: Borders.radiusSm,
    marginBottom: 4,
  },
  timerBtn: {
    paddingVertical: 11,
    paddingHorizontal: 22,
    borderRadius: Borders.radiusSm,
    borderWidth: Borders.width,
    borderColor: Colors.dark,
    transform: [{ translateY: -4 }],
  },
  timerBtnText: {
    color: Colors.dark,
    fontWeight: '900',
    fontSize: 15,
  },

  smallBtnShadow: {
    backgroundColor: Colors.dark,
    borderRadius: Borders.radiusSm,
    marginBottom: 4,
  },
  smallBtn: {
    backgroundColor: Colors.bgCard,
    borderWidth: Borders.width,
    borderColor: Colors.dark,
    borderRadius: Borders.radiusSm,
    paddingVertical: 11,
    paddingHorizontal: 16,
    transform: [{ translateY: -4 }],
  },
  smallBtnText: {
    color: Colors.dark,
    fontWeight: '900',
    fontSize: 14,
  },

  bottomArea: { marginTop: 18 },
});
