import React, { useState } from 'react';
import {
  StyleSheet, Text, View, SafeAreaView,
  Pressable, ScrollView,
} from 'react-native';
import { Player, Category } from '../types/game';
import { ChunkyButton } from '../components/ChunkyButton';
import { triggerHaptic, soundEffects } from '../utils/soundAndHaptics';
import { Colors, Borders } from '../theme/colors';

interface Props {
  imposter: Player;
  category: Category;
  secretWord: string;
  distractorWords: string[];
  onSubmitGuess: (guessedWord: string) => void;
}

export const LastChanceScreen: React.FC<Props> = ({
  imposter,
  category,
  secretWord,
  distractorWords,
  onSubmitGuess,
}) => {
  const [selectedWord, setSelectedWord] = useState<string | null>(null);

  const handleSelect = (word: string) => {
    triggerHaptic.light();
    soundEffects.playClick();
    setSelectedWord(word);
  };

  const handleConfirm = () => {
    if (!selectedWord) return;
    triggerHaptic.heavy();
    onSubmitGuess(selectedWord);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>

        {/* ── Dramatic Header ─────────────────────────── */}
        <View style={styles.badgeShadow}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>🎯  LAST CHANCE TO STEAL THE WIN!</Text>
          </View>
        </View>

        {/* Imposter caught emoji display */}
        <View style={styles.caughtCard}>
          <Text style={styles.caughtEmoji}>🎭</Text>
          <Text style={styles.caughtTitle}>Imposter Caught!</Text>
          <Text style={styles.caughtSub}>
            <Text style={{ fontWeight: '900', color: Colors.coralDark }}>{imposter.name}</Text>
            {' '}was voted out! But guess the secret word to{' '}
            <Text style={{ fontWeight: '900', color: Colors.coralDark }}>steal the victory! 🏆</Text>
          </Text>

          {/* Category Pill */}
          <View style={styles.catPill}>
            <Text style={styles.catPillText}>
              {category.icon ?? '🎯'}  {category.name}
            </Text>
          </View>
        </View>

        {/* ── Word Options ────────────────────────────── */}
        <Text style={styles.chooseLabel}>🤔 WHICH WORD WAS THE SECRET?</Text>

        <View style={styles.optionsList}>
          {distractorWords.map((word, idx) => {
            const isSelected = selectedWord === word;
            return (
              <View
                key={word}
                style={[
                  styles.wordShadow,
                  { backgroundColor: isSelected ? Colors.goldDark : Colors.dark },
                ]}
              >
                <Pressable
                  style={[
                    styles.wordBtn,
                    {
                      backgroundColor: isSelected ? Colors.gold : Colors.bgCard,
                      borderColor: isSelected ? Colors.goldDark : Colors.dark,
                    },
                  ]}
                  onPress={() => handleSelect(word)}
                >
                  <View style={[
                    styles.letterBadge,
                    { backgroundColor: isSelected ? Colors.goldDark : Colors.bgWarm },
                  ]}>
                    <Text style={[
                      styles.letterText,
                      { color: isSelected ? Colors.bgCard : Colors.slate },
                    ]}>
                      {String.fromCharCode(65 + idx)}
                    </Text>
                  </View>
                  <Text style={[
                    styles.wordText,
                    isSelected && { color: Colors.dark, fontWeight: '900' },
                  ]}>
                    {word}
                  </Text>
                  {isSelected && <Text style={styles.checkMark}>✓</Text>}
                </Pressable>
              </View>
            );
          })}
        </View>

        {/* ── Submit Button ───────────────────────────── */}
        <View style={styles.bottomArea}>
          <ChunkyButton
            title={selectedWord ? `Lock in "${selectedWord}"! 🏆` : 'Tap Your Guess!'}
            onPress={handleConfirm}
            disabled={!selectedWord}
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
  container: { padding: 20, paddingBottom: 48, alignItems: 'center' },

  badgeShadow: {
    backgroundColor: Colors.dark,
    borderRadius: Borders.radiusFull,
    marginVertical: 12,
  },
  badge: {
    backgroundColor: Colors.gold,
    borderWidth: Borders.width,
    borderColor: Colors.dark,
    borderRadius: Borders.radiusFull,
    paddingVertical: 8,
    paddingHorizontal: 22,
    transform: [{ translateY: -4 }],
  },
  badgeText: { color: Colors.dark, fontWeight: '900', fontSize: 13, letterSpacing: 0.8 },

  caughtCard: {
    backgroundColor: Colors.bgCard,
    borderWidth: Borders.width + 1,
    borderColor: Colors.dark,
    borderRadius: Borders.radiusLg,
    padding: 26,
    alignItems: 'center',
    width: '100%',
    marginBottom: 20,
    shadowColor: Colors.dark,
    shadowOffset: { width: 5, height: 5 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 5,
  },
  caughtEmoji: { fontSize: 52, marginBottom: 8 },
  caughtTitle: { fontSize: 30, fontWeight: '900', color: Colors.dark, marginBottom: 8 },
  caughtSub: {
    color: Colors.slate,
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    fontWeight: '600',
    maxWidth: 300,
    marginBottom: 14,
  },
  catPill: {
    backgroundColor: Colors.bgWarm,
    borderWidth: Borders.width,
    borderColor: Colors.dark,
    borderRadius: Borders.radiusFull,
    paddingVertical: 6,
    paddingHorizontal: 18,
    shadowColor: Colors.dark,
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 2,
  },
  catPillText: { color: Colors.sky, fontSize: 13, fontWeight: '800' },

  chooseLabel: {
    color: Colors.dark,
    fontWeight: '900',
    fontSize: 13,
    letterSpacing: 1,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },

  optionsList: { width: '100%', gap: 10 },

  wordShadow: {
    borderRadius: Borders.radius,
  },
  wordBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Borders.radius,
    borderWidth: Borders.width,
    padding: 16,
    transform: [{ translateY: -4 }],
    gap: 14,
  },
  letterBadge: {
    width: 36,
    height: 36,
    borderRadius: 10,
    borderWidth: Borders.width,
    borderColor: Colors.dark,
    justifyContent: 'center',
    alignItems: 'center',
  },
  letterText: { fontSize: 16, fontWeight: '900' },
  wordText: { color: Colors.dark, fontSize: 18, fontWeight: '800', flex: 1 },
  checkMark: { fontSize: 20, color: Colors.dark, fontWeight: '900' },

  bottomArea: { marginTop: 28, width: '100%' },
});
