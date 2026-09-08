import React from 'react';
import { StyleSheet, View, SafeAreaView, Pressable, Text } from 'react-native';
import { Player } from '../types/game';
import { HoldToRevealCard } from '../components/HoldToRevealCard';
import { triggerHaptic } from '../utils/soundAndHaptics';
import { Colors, Borders } from '../theme/colors';

interface Props {
  players: Player[];
  currentIndex: number;
  onNextPlayer: () => void;
  onAbortGame: () => void;
}

export const RevealScreen: React.FC<Props> = ({
  players,
  currentIndex,
  onNextPlayer,
  onAbortGame,
}) => {
  const currentPlayer = players[currentIndex];
  const isLast = currentIndex === players.length - 1;

  const handleAbort = () => {
    triggerHaptic.light();
    onAbortGame();
  };

  if (!currentPlayer) return null;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.topBar}>
        <Pressable style={styles.abortButton} onPress={handleAbort}>
          <Text style={styles.abortText}>✕ Exit</Text>
        </Pressable>
      </View>

      <HoldToRevealCard
        key={currentPlayer.id}
        player={currentPlayer}
        onFinished={onNextPlayer}
        isLast={isLast}
        playerIndex={currentIndex}
        totalPlayers={players.length}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.bgWarm,
  },
  topBar: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 4,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  abortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bgCard,
    borderWidth: Borders.width,
    borderColor: Colors.dark,
    borderRadius: Borders.radiusFull,
    paddingVertical: 6,
    paddingHorizontal: 16,
    shadowColor: Colors.dark,
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 3,
  },
  abortText: {
    color: Colors.slate,
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
});
