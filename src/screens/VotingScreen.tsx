import React, { useState } from 'react';
import {
  StyleSheet, Text, View, SafeAreaView,
  Pressable, ScrollView, Animated,
} from 'react-native';
import { Player } from '../types/game';
import { ChunkyButton } from '../components/ChunkyButton';
import { triggerHaptic, soundEffects } from '../utils/soundAndHaptics';
import { Colors, Borders, PLAYER_AVATARS, AVATAR_COLORS } from '../theme/colors';

interface Props {
  players: Player[];
  onEliminatePlayer: (player: Player) => void;
  onBackToDiscussion: () => void;
}

export const VotingScreen: React.FC<Props> = ({
  players,
  onEliminatePlayer,
  onBackToDiscussion,
}) => {
  const [selectedPlayerId, setSelectedPlayerId] = useState<number | null>(null);
  const selectedPlayer = players.find((p) => p.id === selectedPlayerId) ?? null;

  const handleSelect = (playerId: number) => {
    triggerHaptic.light();
    soundEffects.playClick();
    setSelectedPlayerId(playerId);
  };

  const handleEliminate = () => {
    if (!selectedPlayer) return;
    triggerHaptic.heavy();
    soundEffects.playBuzzer();
    onEliminatePlayer(selectedPlayer);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>

        {/* ── Top row ──────────────────────────────────────── */}
        <View style={styles.topRow}>
          <Pressable style={styles.backBtn} onPress={() => { triggerHaptic.light(); onBackToDiscussion(); }}>
            <Text style={styles.backText}>◀ Discussion</Text>
          </Pressable>
          <View style={styles.phasePill}>
            <Text style={styles.phasePillText}>🗳️  PHASE 3 · VOTE</Text>
          </View>
        </View>

        {/* ── Title ────────────────────────────────────────── */}
        <View style={styles.titleArea}>
          <Text style={styles.title}>Who's the Imposter? 🕵️</Text>
          <Text style={styles.subtitle}>
            Debate together, then tap the most suspicious player!
          </Text>
        </View>

        {/* ── Player Cards ─────────────────────────────────── */}
        <View style={styles.grid}>
          {players.map((player, idx) => {
            const isSelected = player.id === selectedPlayerId;
            const avatarEmoji = PLAYER_AVATARS[idx % PLAYER_AVATARS.length];
            const avatarColor = AVATAR_COLORS[idx % AVATAR_COLORS.length];

            return (
              <View
                key={player.id}
                style={[
                  styles.cardShadow,
                  {
                    backgroundColor: isSelected ? Colors.coralDark : Colors.dark,
                  },
                ]}
              >
                <Pressable
                  style={[
                    styles.playerCard,
                    {
                      backgroundColor: isSelected ? Colors.imposter : Colors.bgCard,
                      borderColor: isSelected ? Colors.coralDark : Colors.dark,
                    },
                  ]}
                  onPress={() => handleSelect(player.id)}
                >
                  {/* Avatar */}
                  <View style={[
                    styles.avatarCircle,
                    {
                      backgroundColor: isSelected ? '#FFD6D6' : avatarColor.bg,
                      borderColor: isSelected ? Colors.coralDark : avatarColor.border,
                    },
                  ]}>
                    <Text style={styles.avatarEmoji}>
                      {isSelected ? '🎯' : avatarEmoji}
                    </Text>
                  </View>

                  <Text style={[styles.playerName, isSelected && { color: Colors.coralDark }]}>
                    {player.name}
                  </Text>

                  {isSelected ? (
                    <View style={styles.selectedBadge}>
                      <Text style={styles.selectedBadgeText}>✓ VOTED</Text>
                    </View>
                  ) : (
                    <Text style={styles.tapHint}>Tap</Text>
                  )}
                </Pressable>
              </View>
            );
          })}
        </View>

        {/* ── Confirm Banner ───────────────────────────────── */}
        {selectedPlayer && (
          <View style={styles.confirmBox}>
            <Text style={styles.confirmEmoji}>⚠️</Text>
            <Text style={styles.confirmText}>
              Ready to eliminate{' '}
              <Text style={{ fontWeight: '900', color: Colors.coralDark }}>
                {selectedPlayer.name}
              </Text>
              ?
            </Text>
          </View>
        )}

        {/* ── Eliminate Button ─────────────────────────────── */}
        <View style={styles.bottomArea}>
          <ChunkyButton
            title={
              selectedPlayer
                ? `Eliminate ${selectedPlayer.name} 💥`
                : 'Tap a Suspect First!'
            }
            onPress={handleEliminate}
            disabled={!selectedPlayer}
            color={Colors.coral}
            shadowColor={Colors.coralDark}
            textColor={Colors.bgCard}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.bgWarm },
  container: { padding: 20, paddingBottom: 48 },

  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  backBtn: {
    backgroundColor: Colors.bgCard,
    borderWidth: Borders.width,
    borderColor: Colors.dark,
    borderRadius: Borders.radiusFull,
    paddingVertical: 7,
    paddingHorizontal: 16,
    shadowColor: Colors.dark,
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 3,
  },
  backText: { color: Colors.slate, fontSize: 13, fontWeight: '900' },

  phasePill: {
    backgroundColor: Colors.coral,
    borderWidth: Borders.width,
    borderColor: Colors.dark,
    borderRadius: Borders.radiusFull,
    paddingVertical: 7,
    paddingHorizontal: 18,
    shadowColor: Colors.dark,
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 3,
  },
  phasePillText: { color: Colors.bgCard, fontWeight: '900', fontSize: 12, letterSpacing: 1 },

  titleArea: { alignItems: 'center', marginBottom: 18 },
  title: { color: Colors.dark, fontSize: 30, fontWeight: '900', textAlign: 'center' },
  subtitle: {
    color: Colors.slate,
    fontSize: 14,
    textAlign: 'center',
    marginTop: 6,
    maxWidth: 300,
    lineHeight: 20,
    fontWeight: '600',
  },

  grid: { gap: 10, marginVertical: 4 },

  cardShadow: {
    borderRadius: Borders.radius,
  },
  playerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: Borders.width,
    borderRadius: Borders.radius,
    padding: 14,
    transform: [{ translateY: -4 }],
    gap: 12,
  },
  avatarCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: Borders.width,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarEmoji: { fontSize: 26 },

  playerName: {
    color: Colors.dark,
    fontSize: 18,
    fontWeight: '900',
    flex: 1,
  },
  selectedBadge: {
    backgroundColor: Colors.coral,
    borderWidth: Borders.width,
    borderColor: Colors.coralDark,
    borderRadius: Borders.radiusFull,
    paddingVertical: 4,
    paddingHorizontal: 12,
  },
  selectedBadgeText: { color: Colors.bgCard, fontSize: 11, fontWeight: '900', letterSpacing: 0.5 },
  tapHint: { color: Colors.muted, fontSize: 12, fontWeight: '700' },

  confirmBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.imposter,
    borderWidth: Borders.width,
    borderColor: Colors.coralDark,
    borderRadius: Borders.radius,
    padding: 16,
    marginTop: 16,
    gap: 12,
    shadowColor: Colors.coralDark,
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  confirmEmoji: { fontSize: 24 },
  confirmText: { color: Colors.coralDark, fontSize: 15, fontWeight: '700', flex: 1 },

  bottomArea: { marginTop: 20 },
});
