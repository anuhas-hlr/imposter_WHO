import React, { useEffect, useRef } from 'react';
import {
  StyleSheet, Text, View, SafeAreaView,
  ScrollView, Animated,
} from 'react-native';
import { Player, Category } from '../types/game';
import { ChunkyButton } from '../components/ChunkyButton';
import { triggerHaptic, soundEffects } from '../utils/soundAndHaptics';
import { Colors, Borders, PLAYER_AVATARS, AVATAR_COLORS } from '../theme/colors';

interface Props {
  players: Player[];
  category: Category;
  secretWord: string;
  eliminatedPlayer: Player;
  imposterWon: boolean;
  imposterGuessedWord?: string;
  onPlayAgain: () => void;
  onReturnToLobby: () => void;
}

export const ResultScreen: React.FC<Props> = ({
  players,
  category,
  secretWord,
  eliminatedPlayer,
  imposterWon,
  imposterGuessedWord,
  onPlayAgain,
  onReturnToLobby,
}) => {
  const trophyScale = useRef(new Animated.Value(0.3)).current;
  const trophyY = useRef(new Animated.Value(0)).current;
  const confettiRotate = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Pop in
    Animated.spring(trophyScale, {
      toValue: 1,
      friction: 3,
      tension: 70,
      useNativeDriver: true,
    }).start();

    // Bob loop
    const bob = Animated.loop(
      Animated.sequence([
        Animated.timing(trophyY, { toValue: -10, duration: 700, useNativeDriver: true }),
        Animated.timing(trophyY, { toValue: 0, duration: 700, useNativeDriver: true }),
      ])
    );
    bob.start();

    // Rotation wobble for confetti
    const wobble = Animated.loop(
      Animated.sequence([
        Animated.timing(confettiRotate, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.timing(confettiRotate, { toValue: -1, duration: 500, useNativeDriver: true }),
        Animated.timing(confettiRotate, { toValue: 0, duration: 500, useNativeDriver: true }),
      ])
    );
    wobble.start();

    if (imposterWon) {
      triggerHaptic.warning();
      soundEffects.playBuzzer();
    } else {
      triggerHaptic.success();
      soundEffects.playFanfare();
    }
    return () => { bob.stop(); wobble.stop(); };
  }, []);

  const stolenWin = imposterWon && eliminatedPlayer.isImposter;
  const civilianWin = !imposterWon;

  const winBg = civilianWin ? Colors.civilian : Colors.imposter;
  const winAccent = civilianWin ? Colors.sky : Colors.coral;
  const winAccentDark = civilianWin ? Colors.skyDark : Colors.coralDark;
  const winEmoji = civilianWin ? '🏆' : '🎭';

  const confettiRotateDeg = confettiRotate.interpolate({
    inputRange: [-1, 1],
    outputRange: ['-15deg', '15deg'],
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>

        {/* ── Trophy Hero ─────────────────────────────────── */}
        <View style={[styles.heroCard, { backgroundColor: winBg, borderColor: winAccentDark }]}>
          {/* Floating confetti emoji */}
          <Animated.Text
            style={[styles.confetti, { transform: [{ rotate: confettiRotateDeg }] }]}
          >
            {civilianWin ? '🎊' : '😈'}
          </Animated.Text>

          <Animated.View
            style={[
              styles.trophyCircle,
              { backgroundColor: winAccent, borderColor: winAccentDark },
              { transform: [{ scale: trophyScale }, { translateY: trophyY }] },
            ]}
          >
            <Text style={{ fontSize: 48 }}>{winEmoji}</Text>
          </Animated.View>

          <Text style={[styles.winnerLabel, { color: winAccentDark }]}>
            {civilianWin ? '🎉 CIVILIANS WIN!' : '😈 IMPOSTER WINS!'}
          </Text>

          <Text style={styles.winnerDetail}>
            {stolenWin
              ? `${eliminatedPlayer.name} was caught but correctly guessed "${imposterGuessedWord}" and STOLE the win! 🌟`
              : civilianWin
              ? `Imposter ${eliminatedPlayer.name} was caught and couldn't guess the secret word! Great teamwork! 🙌`
              : `${eliminatedPlayer.name} was an innocent player — the imposters stayed hidden and won!`}
          </Text>
        </View>

        {/* ── Secret Word Reveal ──────────────────────────── */}
        <View style={styles.secretCard}>
          <Text style={styles.secretLabel}>THE SECRET WORD WAS</Text>
          <Text style={[styles.secretWord, { color: winAccentDark }]}>{secretWord}</Text>
          <View style={[styles.catPill, { backgroundColor: winBg, borderColor: winAccentDark }]}>
            <Text style={[styles.catPillText, { color: winAccentDark }]}>
              {category.icon ?? '🎯'}  {category.name}
            </Text>
          </View>
        </View>

        {/* ── Eliminated Player ───────────────────────────── */}
        <View style={styles.eliminatedCard}>
          <Text style={styles.sectionLabel}>ELIMINATED PLAYER</Text>
          <View style={styles.eliminatedRow}>
            <Text style={{ fontSize: 28 }}>
              {eliminatedPlayer.isImposter ? '🎭' : '⭐'}
            </Text>
            <Text style={styles.eliminatedName}>{eliminatedPlayer.name}</Text>
            <View style={[
              styles.rolePill,
              {
                backgroundColor: eliminatedPlayer.isImposter ? Colors.imposter : Colors.civilian,
                borderColor: eliminatedPlayer.isImposter ? Colors.coralDark : Colors.skyDark,
              },
            ]}>
              <Text style={[
                styles.rolePillText,
                { color: eliminatedPlayer.isImposter ? Colors.coralDark : Colors.skyDark },
              ]}>
                {eliminatedPlayer.isImposter ? '🕵️ IMPOSTER' : '⭐ CIVILIAN'}
              </Text>
            </View>
          </View>
        </View>

        {/* ── All Players Reveal ──────────────────────────── */}
        <View style={styles.rosterSection}>
          <Text style={styles.sectionLabel}>ALL PLAYERS & ROLES</Text>
          <View style={styles.rosterList}>
            {players.map((p, idx) => {
              const isEliminated = p.id === eliminatedPlayer.id;
              const avatarEmoji = PLAYER_AVATARS[idx % PLAYER_AVATARS.length];
              const avatarColor = AVATAR_COLORS[idx % AVATAR_COLORS.length];

              return (
                <View
                  key={p.id}
                  style={[
                    styles.rosterShadow,
                    {
                      backgroundColor: p.isImposter ? Colors.coralDark : Colors.dark,
                    },
                  ]}
                >
                  <View style={[
                    styles.rosterItem,
                    {
                      backgroundColor: p.isImposter ? Colors.imposter : Colors.bgCard,
                      borderColor: p.isImposter ? Colors.coralDark : Colors.dark,
                    },
                  ]}>
                    <View style={[
                      styles.rosterAvatar,
                      { backgroundColor: avatarColor.bg, borderColor: avatarColor.border },
                    ]}>
                      <Text style={{ fontSize: 22 }}>{avatarEmoji}</Text>
                    </View>

                    <Text style={styles.rosterName}>{p.name}</Text>

                    {isEliminated && (
                      <View style={styles.eliminatedTag}>
                        <Text style={styles.eliminatedTagText}>💥 OUT</Text>
                      </View>
                    )}

                    <View style={[
                      styles.rolePill,
                      {
                        backgroundColor: p.isImposter ? Colors.coral : Colors.sky,
                        borderColor: p.isImposter ? Colors.coralDark : Colors.skyDark,
                        marginLeft: 'auto',
                      },
                    ]}>
                      <Text style={styles.rolePillTextWhite}>
                        {p.isImposter ? '🎭' : '⭐'} {p.roleTitle}
                      </Text>
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        {/* ── Action Buttons ──────────────────────────────── */}
        <View style={styles.actionsArea}>
          <ChunkyButton
            title="Play Again! 🔄"
            onPress={() => {
              triggerHaptic.success();
              soundEffects.playFanfare();
              onPlayAgain();
            }}
            color={Colors.mint}
            shadowColor={Colors.mintDark}
            textColor={Colors.dark}
          />
          <View style={{ height: 14 }} />
          <ChunkyButton
            title="Back to Setup 🏠"
            onPress={onReturnToLobby}
            color={Colors.bgCard}
            shadowColor={Colors.dark}
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

  // Trophy hero
  heroCard: {
    borderWidth: Borders.width + 1,
    borderRadius: Borders.radiusLg,
    padding: 28,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: Colors.dark,
    shadowOffset: { width: 6, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 6,
    position: 'relative',
    overflow: 'hidden',
  },
  confetti: {
    position: 'absolute',
    top: 16,
    right: 20,
    fontSize: 36,
  },
  trophyCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: Borders.width + 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: Colors.dark,
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  winnerLabel: {
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: 0.5,
    textAlign: 'center',
    marginBottom: 8,
  },
  winnerDetail: {
    color: Colors.slate,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    fontWeight: '600',
    maxWidth: 310,
  },

  // Secret word
  secretCard: {
    backgroundColor: Colors.bgCard,
    borderWidth: Borders.width + 1,
    borderColor: Colors.dark,
    borderRadius: Borders.radius,
    padding: 22,
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: Colors.dark,
    shadowOffset: { width: 5, height: 5 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 5,
  },
  secretLabel: {
    color: Colors.muted,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 2,
    marginBottom: 6,
  },
  secretWord: {
    fontSize: 40,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 10,
  },
  catPill: {
    borderWidth: Borders.width,
    borderRadius: Borders.radiusFull,
    paddingVertical: 6,
    paddingHorizontal: 18,
  },
  catPillText: { fontWeight: '800', fontSize: 13 },

  // Eliminated
  eliminatedCard: {
    backgroundColor: Colors.bgCard,
    borderWidth: Borders.width,
    borderColor: Colors.dark,
    borderRadius: Borders.radius,
    padding: 16,
    marginBottom: 12,
    shadowColor: Colors.dark,
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  sectionLabel: {
    color: Colors.muted,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 2,
    marginBottom: 10,
  },
  eliminatedRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  eliminatedName: { color: Colors.dark, fontSize: 18, fontWeight: '900', flex: 1 },

  // Role pill
  rolePill: {
    borderWidth: Borders.width,
    borderRadius: Borders.radiusFull,
    paddingVertical: 4,
    paddingHorizontal: 12,
  },
  rolePillText: { fontSize: 12, fontWeight: '900' },
  rolePillTextWhite: { color: Colors.bgCard, fontSize: 11, fontWeight: '900' },

  // Roster
  rosterSection: { marginBottom: 16 },
  rosterList: { gap: 8 },

  rosterShadow: { borderRadius: Borders.radius },
  rosterItem: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: Borders.width,
    borderRadius: Borders.radius,
    paddingVertical: 12,
    paddingHorizontal: 14,
    transform: [{ translateY: -4 }],
    gap: 10,
  },
  rosterAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: Borders.width,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rosterName: { color: Colors.dark, fontSize: 16, fontWeight: '800' },
  eliminatedTag: {
    backgroundColor: Colors.coral,
    borderRadius: Borders.radiusFull,
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderWidth: 1.5,
    borderColor: Colors.coralDark,
  },
  eliminatedTagText: { color: Colors.bgCard, fontSize: 11, fontWeight: '900' },

  actionsArea: { marginTop: 10 },
});
