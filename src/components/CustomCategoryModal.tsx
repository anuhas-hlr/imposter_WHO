import React, { useState } from 'react';
import {
  StyleSheet, Text, View, TextInput, Modal,
  Pressable, ScrollView, KeyboardAvoidingView, Platform,
} from 'react-native';
import { ChunkyButton } from './ChunkyButton';
import { triggerHaptic, soundEffects } from '../utils/soundAndHaptics';
import { Colors, Borders } from '../theme/colors';

interface Props {
  visible: boolean;
  onClose: () => void;
  onSave: (categoryData: { name: string; icon: string; words: string[] }) => void;
}

const PRESET_EMOJIS = ['🎯', '🍕', '🚀', '🐶', '🎉', '🧠', '⚡', '👑', '🌈', '💎', '⚽', '🍦', '🎮', '🏖️', '🐱'];

export const CustomCategoryModal: React.FC<Props> = ({ visible, onClose, onSave }) => {
  const [name, setName] = useState('');
  const [selectedEmoji, setSelectedEmoji] = useState('🎯');
  const [rawWords, setRawWords] = useState('');
  const [error, setError] = useState('');

  const parsedWords = rawWords
    .split(/[\n,]+/)
    .map((w) => w.trim())
    .filter((w) => w.length > 0);

  const handleSave = () => {
    if (!name.trim()) {
      setError('Please provide a theme name!');
      triggerHaptic.warning();
      return;
    }
    if (parsedWords.length < 5) {
      setError('Please enter at least 5 words (comma or line separated).');
      triggerHaptic.warning();
      return;
    }
    triggerHaptic.success();
    soundEffects.playFanfare();
    onSave({
      name: name.trim(),
      icon: selectedEmoji,
      words: Array.from(new Set(parsedWords)),
    });
    setName('');
    setRawWords('');
    setError('');
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.overlay}
      >
        {/* Overlay tap to close */}
        <Pressable style={styles.overlayTouch} onPress={onClose} />

        <View style={styles.sheet}>
          {/* Drag handle */}
          <View style={styles.dragHandle} />

          {/* Header */}
          <View style={styles.header}>
            <View style={styles.titleRow}>
              <Text style={{ fontSize: 26 }}>✨</Text>
              <Text style={styles.title}>Create Custom Theme</Text>
            </View>
            <Pressable
              style={styles.closeBtn}
              onPress={() => { triggerHaptic.light(); onClose(); }}
            >
              <Text style={styles.closeBtnText}>✕</Text>
            </Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Name */}
            <Text style={styles.inputLabel}>THEME NAME</Text>
            <TextInput
              style={styles.textInput}
              placeholder="e.g. Disney Movies, Superheroes..."
              placeholderTextColor={Colors.muted}
              value={name}
              onChangeText={(text) => { setName(text); if (error) setError(''); }}
            />

            {/* Emoji Picker */}
            <Text style={styles.inputLabel}>CHOOSE AN ICON</Text>
            <View style={styles.emojiRow}>
              {PRESET_EMOJIS.map((emoji) => (
                <View
                  key={emoji}
                  style={[
                    styles.emojiBtnShadow,
                    { backgroundColor: selectedEmoji === emoji ? Colors.skyDark : Colors.dark },
                  ]}
                >
                  <Pressable
                    style={[
                      styles.emojiBtn,
                      selectedEmoji === emoji && {
                        backgroundColor: Colors.civilian,
                        borderColor: Colors.skyDark,
                      },
                    ]}
                    onPress={() => { triggerHaptic.light(); setSelectedEmoji(emoji); }}
                  >
                    <Text style={styles.emojiText}>{emoji}</Text>
                  </Pressable>
                </View>
              ))}
            </View>

            {/* Words */}
            <View style={styles.wordsHeader}>
              <Text style={styles.inputLabel}>WORD LIST (MIN 5 WORDS)</Text>
              <Text style={[styles.wordCount, parsedWords.length >= 5 && { color: Colors.mint }]}>
                {parsedWords.length} words
              </Text>
            </View>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              placeholder={`Enter words separated by commas:\ne.g. Simba, Elsa, Woody, Pikachu, Goku...`}
              placeholderTextColor={Colors.muted}
              value={rawWords}
              onChangeText={(text) => { setRawWords(text); if (error) setError(''); }}
              multiline
              numberOfLines={5}
              textAlignVertical="top"
            />

            {error ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>⚠️  {error}</Text>
              </View>
            ) : null}

            <View style={styles.buttonRow}>
              <ChunkyButton
                title={
                  !name.trim()
                    ? 'Enter a name first!'
                    : parsedWords.length < 5
                    ? `Add ${5 - parsedWords.length} more words`
                    : `Save Theme! ${selectedEmoji}`
                }
                onPress={handleSave}
                disabled={!name.trim() || parsedWords.length < 5}
                color={Colors.mint}
                shadowColor={Colors.mintDark}
                textColor={Colors.dark}
              />
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
    justifyContent: 'flex-end',
  },
  overlayTouch: {
    flex: 1,
  },
  sheet: {
    backgroundColor: Colors.bgWarm,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    borderTopWidth: Borders.width + 1,
    borderLeftWidth: Borders.width + 1,
    borderRightWidth: Borders.width + 1,
    borderColor: Colors.dark,
    padding: 24,
    paddingTop: 16,
    maxHeight: '90%',
    shadowColor: Colors.dark,
    shadowOffset: { width: 0, height: -5 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 8,
  },
  dragHandle: {
    width: 48,
    height: 5,
    backgroundColor: Colors.dark,
    borderRadius: 3,
    alignSelf: 'center',
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  title: { color: Colors.dark, fontSize: 20, fontWeight: '900' },

  closeBtn: {
    backgroundColor: Colors.bgCard,
    borderWidth: Borders.width,
    borderColor: Colors.dark,
    borderRadius: Borders.radiusFull,
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.dark,
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 2,
  },
  closeBtnText: { color: Colors.slate, fontSize: 14, fontWeight: '900' },

  inputLabel: {
    color: Colors.slate,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1.5,
    marginTop: 14,
    marginBottom: 6,
  },
  textInput: {
    backgroundColor: Colors.bgCard,
    borderWidth: Borders.width,
    borderColor: Colors.dark,
    borderRadius: Borders.radiusSm,
    color: Colors.dark,
    fontSize: 15,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontWeight: '600',
    shadowColor: Colors.dark,
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 3,
  },
  textArea: { minHeight: 110 },

  emojiRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 6,
  },
  emojiBtnShadow: {
    borderRadius: Borders.radiusSm,
  },
  emojiBtn: {
    width: 46,
    height: 46,
    borderRadius: Borders.radiusSm,
    backgroundColor: Colors.bgCard,
    borderWidth: Borders.width,
    borderColor: Colors.dark,
    justifyContent: 'center',
    alignItems: 'center',
    transform: [{ translateY: -3 }],
  },
  emojiText: { fontSize: 22 },

  wordsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  wordCount: {
    color: Colors.muted,
    fontSize: 13,
    fontWeight: '800',
    marginTop: 14,
  },

  errorBox: {
    backgroundColor: Colors.imposter,
    borderWidth: Borders.width,
    borderColor: Colors.coralDark,
    borderRadius: Borders.radiusSm,
    padding: 12,
    marginTop: 10,
    shadowColor: Colors.coralDark,
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 3,
  },
  errorText: { color: Colors.coralDark, fontSize: 13, fontWeight: '800' },

  buttonRow: { marginTop: 22, marginBottom: 24 },
});
