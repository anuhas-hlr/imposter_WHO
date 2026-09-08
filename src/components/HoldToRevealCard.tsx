import React, { useRef, useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Pressable,
  Animated,
} from 'react-native';
import { Player } from '../types/game';
import {
  Colors,
  Borders,
  PLAYER_AVATARS,
  AVATAR_COLORS,
} from '../theme/colors';
import { triggerHaptic, soundEffects } from '../utils/soundAndHaptics';
import { ChunkyButton } from './ChunkyButton';

interface Props {
  player: Player;
  onFinished: () => void;
  isLast: boolean;
  playerIndex: number;
  totalPlayers: number;
}

export const HoldToRevealCard: React.FC<Props> = ({
  player,
  onFinished,
  isLast,
  playerIndex,
  totalPlayers,
}) => {
  const [isRevealed, setIsRevealed] = useState(false);
  const [hasRevealedOnce, setHasRevealedOnce] = useState(false);

  // Card scale anim (presses to 0.96)
  const cardScale = useRef(new Animated.Value(1)).current;
  // Subtle pulse on idle
  const pulseAnim = useRef(new Animated.Value(1)).current;
  // Finger-hold indicator fill
  const holdFill = useRef(new Animated.Value(0)).current;

  const avatarEmoji = PLAYER_AVATARS[playerIndex % PLAYER_AVATARS.length];
  const avatarColor = AVATAR_COLORS[playerIndex % AVATAR_COLORS.length];
  const isImposter = player.isImposter;

  // Idle pulse loop when not yet revealed
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.025, duration: 900, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 900, useNativeDriver: true }),
      ])
    );
    if (!isRevealed) loop.start();
    return () => loop.stop();
  }, [isRevealed]);

  const handlePressIn = () => {
    setIsRevealed(true);
    setHasRevealedOnce(true);
    // depress card
    Animated.spring(cardScale, {
      toValue: 0.96,
      useNativeDriver: true,
      speed: 40,
      bounciness: 4,
    }).start();
    // fill hold indicator
    Animated.timing(holdFill, {
      toValue: 1,
      duration: 250,
      useNativeDriver: false,
    }).start();
    triggerHaptic.heavy();
    soundEffects.playReveal();
  };

  const handlePressOut = () => {
    setIsRevealed(false);
    Animated.spring(cardScale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 30,
      bounciness: 8,
    }).start();
    Animated.timing(holdFill, {
      toValue: 0,
      duration: 150,
      useNativeDriver: false,
    }).start();
    triggerHaptic.light();
  };

  // Card face color
  const cardBg = isRevealed
    ? isImposter
      ? Colors.imposter
      : Colors.civilian
    : '#FFFFFF';
  const cardBorder = isRevealed
    ? isImposter
      ? Colors.coralDark
      : Colors.skyDark
    : Colors.dark;

  return (
    <View style={styles.wrapper}>
      {/* ── Round pill ───────────────────────────────────── */}
      <View style={styles.pillBadge}>
        <Text style={styles.pillText}>
          {playerIndex + 1} / {totalPlayers}   👀 SECRET PEEK
        </Text>
      </View>

      {/* ── Avatar ───────────────────────────────────────── */}
      <View
        style={[
          styles.avatarCircle,
          {
            backgroundColor: avatarColor.bg,
            borderColor: avatarColor.border,
          },
        ]}
      >
        <Text style={styles.avatarEmoji}>{avatarEmoji}</Text>
      </View>

      <Text style={styles.passLabel}>Pass the phone to:</Text>
      <Text style={styles.playerName}>{player.name}</Text>

      {/* ── Reveal Card ──────────────────────────────────── */}
      <Animated.View
        style={[
          styles.cardOuter,
          {
            borderColor: cardBorder,
            backgroundColor: cardBg,
            // hard shadow shifts color on reveal
            shadowColor: isRevealed
              ? isImposter
                ? Colors.coralDark
                : Colors.skyDark
              : Colors.dark,
          },
          { transform: [{ scale: isRevealed ? cardScale : pulseAnim }] },
        ]}
      >
        <Pressable
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          style={styles.cardPressable}
        >
          {isRevealed ? (
            /* ── REVEALED FACE ── */
            <View style={styles.revealedContent}>
              {/* Role badge */}
              <View
                style={[
                  styles.roleBadge,
                  {
                    backgroundColor: isImposter ? Colors.coral : Colors.sky,
                    borderColor: isImposter ? Colors.coralDark : Colors.skyDark,
                  },
                ]}
              >
                <Text style={styles.roleBadgeText}>
                  {isImposter ? '🎭 YOU ARE THE IMPOSTER' : '⭐ YOUR SECRET WORD'}
                </Text>
              </View>

              {/* Main word */}
              <Text
                style={[
                  styles.secretWord,
                  { color: isImposter ? Colors.coralDark : Colors.skyDark },
                ]}
                adjustsFontSizeToFit
                numberOfLines={2}
              >
                {player.word}
              </Text>

              {/* Sub-tip */}
              <Text style={styles.roleTip}>
                {isImposter
                  ? '🤫 Blend in! Listen carefully and fake it!'
                  : '🕵️ Give a sneaky clue — not too obvious!'}
              </Text>

              {/* Animated hold indicator bar */}
              <View style={styles.holdBar}>
                <Animated.View
                  style={[
                    styles.holdBarFill,
                    {
                      flex: holdFill,
                      backgroundColor: isImposter ? Colors.coral : Colors.sky,
                    },
                  ]}
                />
              </View>
              <Text style={styles.holdHint}>👆 Lift finger to hide card</Text>
            </View>
          ) : (
            /* ── HIDDEN FACE ── */
            <View style={styles.hiddenContent}>
              <Text style={styles.hiddenEmoji}>🔒</Text>
              <Text style={styles.hiddenTitle}>PRESS & HOLD</Text>
              <Text style={styles.hiddenSub}>Only you should look!</Text>
            </View>
          )}
        </Pressable>
      </Animated.View>

      {/* ── Next Button ──────────────────────────────────── */}
      {hasRevealedOnce && (
        <View style={styles.nextArea}>
          <ChunkyButton
            title={isLast ? 'Start Clue Round! 🎤' : 'Next Player ➡️'}
            onPress={onFinished}
            color={Colors.mint}
            shadowColor={Colors.mintDark}
            textColor={Colors.dark}
          />
        </View>
      )}

      {!hasRevealedOnce && (
        <View style={styles.instructionPill}>
          <Text style={styles.instructionText}>
            Hold the card above to see your secret role 👆
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: Colors.bgWarm,
  },

  // Pill badge
  pillBadge: {
    backgroundColor: Colors.gold,
    borderWidth: Borders.width,
    borderColor: Colors.dark,
    borderRadius: Borders.radiusFull,
    paddingVertical: 6,
    paddingHorizontal: 18,
    marginBottom: 18,
    shadowColor: Colors.dark,
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 3,
  },
  pillText: {
    fontSize: 13,
    fontWeight: '900',
    color: Colors.dark,
    letterSpacing: 0.8,
  },

  // Avatar
  avatarCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: Borders.width + 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    shadowColor: Colors.dark,
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  avatarEmoji: {
    fontSize: 44,
  },

  passLabel: {
    fontSize: 14,
    color: Colors.slate,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  playerName: {
    fontSize: 32,
    fontWeight: '900',
    color: Colors.dark,
    marginTop: 2,
    marginBottom: 22,
    textAlign: 'center',
  },

  // Reveal card
  cardOuter: {
    width: '100%',
    maxWidth: 380,
    minHeight: 290,
    borderRadius: Borders.radiusLg,
    borderWidth: Borders.width + 1,
    shadowOffset: { width: 6, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 6,
  },
  cardPressable: {
    flex: 1,
    borderRadius: Borders.radiusLg - 1,
    padding: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Hidden face
  hiddenContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  hiddenEmoji: {
    fontSize: 52,
    marginBottom: 12,
  },
  hiddenTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: Colors.dark,
    letterSpacing: 2,
  },
  hiddenSub: {
    fontSize: 14,
    color: Colors.slate,
    marginTop: 6,
    fontWeight: '700',
  },

  // Revealed face
  revealedContent: {
    alignItems: 'center',
    width: '100%',
  },
  roleBadge: {
    borderWidth: Borders.width,
    borderRadius: Borders.radiusFull,
    paddingVertical: 6,
    paddingHorizontal: 16,
    marginBottom: 16,
    shadowColor: Colors.dark,
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 3,
  },
  roleBadgeText: {
    color: Colors.dark,
    fontWeight: '900',
    fontSize: 13,
    letterSpacing: 0.8,
  },
  secretWord: {
    fontSize: 34,
    fontWeight: '900',
    textAlign: 'center',
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  roleTip: {
    fontSize: 13,
    color: Colors.slate,
    textAlign: 'center',
    fontWeight: '700',
    lineHeight: 20,
    marginBottom: 14,
  },
  holdBar: {
    width: '80%',
    height: 6,
    backgroundColor: '#E2E8F0',
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: Colors.dark,
    overflow: 'hidden',
    flexDirection: 'row',
    marginBottom: 6,
  },
  holdBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  holdHint: {
    fontSize: 12,
    color: Colors.muted,
    fontWeight: '700',
    fontStyle: 'italic',
  },

  // Bottom controls
  nextArea: {
    marginTop: 28,
    width: '100%',
    maxWidth: 380,
  },
  instructionPill: {
    marginTop: 28,
    backgroundColor: Colors.bgCard,
    borderWidth: Borders.width,
    borderColor: Colors.dark,
    borderRadius: Borders.radiusFull,
    paddingVertical: 12,
    paddingHorizontal: 22,
    shadowColor: Colors.dark,
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 3,
  },
  instructionText: {
    color: Colors.slate,
    fontWeight: '700',
    fontSize: 14,
    textAlign: 'center',
  },
});
