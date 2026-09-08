import React, { useState, useEffect } from 'react';
import {
  StyleSheet, Text, View, ScrollView,
  SafeAreaView, TextInput, Pressable,
} from 'react-native';
import { Category } from '../types/game';
import { getAllCategories, saveCustomCategory, deleteCustomCategory } from '../services/storage';
import { CategoryPicker } from '../components/CategoryPicker';
import { CounterButton } from '../components/CounterButton';
import { ChunkyButton } from '../components/ChunkyButton';
import { CustomCategoryModal } from '../components/CustomCategoryModal';
import { triggerHaptic, soundEffects } from '../utils/soundAndHaptics';
import { Colors, Borders } from '../theme/colors';

interface Props {
  onStartGame: (
    playerCount: number,
    imposterCount: number,
    categories: Category[],
    customNames?: string[]
  ) => void;
}

export const SetupScreen: React.FC<Props> = ({ onStartGame }) => {
  const [playerCount, setPlayerCount] = useState(5);
  const [imposterCount, setImposterCount] = useState(1);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<Category[]>([]);
  const [customNames, setCustomNames] = useState<string[]>([]);
  const [showNamesList, setShowNamesList] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const maxImposters = Math.max(1, Math.floor((playerCount - 1) / 2));

  useEffect(() => {
    if (imposterCount > maxImposters) setImposterCount(maxImposters);
  }, [playerCount, maxImposters, imposterCount]);

  useEffect(() => { loadCategories(); }, []);

  const loadCategories = async () => {
    const list = await getAllCategories();
    setCategories(list);
    if (list.length > 0 && selectedCategories.length === 0) {
      setSelectedCategories([list[0]]);
    }
  };

  const handleToggleCategory = (category: Category) => {
    setSelectedCategories((prev) => {
      const exists = prev.some((c) => c.id === category.id);
      return exists ? prev.filter((c) => c.id !== category.id) : [...prev, category];
    });
  };

  const handleSelectAll = () => {
    setSelectedCategories(
      selectedCategories.length === categories.length ? [] : [...categories]
    );
  };

  const handlePlayerNameChange = (index: number, text: string) => {
    const updated = [...customNames];
    updated[index] = text;
    setCustomNames(updated);
  };

  const handleSaveCustomCategory = async (catData: { name: string; icon: string; words: string[] }) => {
    const updated = await saveCustomCategory({ id: `custom_${Date.now()}`, ...catData });
    setCategories(updated);
    const newCat = updated.find((c) => c.name === catData.name);
    if (newCat) setSelectedCategories((prev) => [...prev, newCat]);
  };

  const handleDeleteCategory = async (id: string) => {
    const updated = await deleteCustomCategory(id);
    setCategories(updated);
    setSelectedCategories((prev) => prev.filter((c) => c.id !== id));
  };

  const handleStart = () => {
    if (selectedCategories.length === 0) return;
    triggerHaptic.heavy();
    soundEffects.playFanfare();
    onStartGame(playerCount, imposterCount, selectedCategories, customNames);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>

        {/* ── Hero Header ─────────────────────────────── */}
        <View style={styles.header}>
          <View style={styles.tagShadow}>
            <View style={styles.tag}>
              <Text style={styles.tagText}>🎉  PARTY GAME FOR FRIENDS & FAMILY</Text>
            </View>
          </View>

          <Text style={styles.title}>UNDERCOVER</Text>
          <Text style={styles.titleAccent}>WHO'S THE IMPOSTER?</Text>
          <Text style={styles.subtitle}>
            Find the sneaky Imposter before they guess the secret word! 🤫
          </Text>
        </View>

        {/* ── How Many Playing? ───────────────────────── */}
        <View style={styles.section}>
          <Text style={styles.sectionHeading}>👥  HOW MANY ARE PLAYING?</Text>
          <CounterButton
            iconEmoji="👥"
            label="Total Players"
            subtitle="At least 3 players"
            value={playerCount}
            min={3}
            max={20}
            onChange={setPlayerCount}
            accentColor={Colors.sky}
          />
          <View style={{ height: 10 }} />
          <CounterButton
            iconEmoji="🕵️‍♂️"
            label="Imposters"
            subtitle={`Max ${maxImposters} sneaky players`}
            value={imposterCount}
            min={1}
            max={maxImposters}
            onChange={setImposterCount}
            accentColor={Colors.coral}
          />
        </View>

        {/* ── Category Picker ─────────────────────────── */}
        <View style={styles.section}>
          <CategoryPicker
            categories={categories}
            selectedCategories={selectedCategories}
            onToggleCategory={handleToggleCategory}
            onSelectAll={handleSelectAll}
            onOpenCreateModal={() => setIsCreateModalOpen(true)}
            onDeleteCategory={handleDeleteCategory}
          />
        </View>

        {/* ── Player Names ────────────────────────────── */}
        <View style={styles.section}>
          <Pressable
            style={styles.namesToggle}
            onPress={() => {
              triggerHaptic.light();
              setShowNamesList(!showNamesList);
            }}
          >
            <View style={styles.namesToggleLeft}>
              <Text style={{ fontSize: 20 }}>✏️</Text>
              <Text style={styles.namesToggleTitle}>Edit Player Names ({playerCount})</Text>
            </View>
            <Text style={styles.chevron}>{showNamesList ? '▲' : '▼'}</Text>
          </Pressable>

          {showNamesList && (
            <View style={styles.namesListContainer}>
              {Array.from({ length: playerCount }).map((_, idx) => (
                <View key={idx} style={styles.nameRow}>
                  <View style={styles.nameIndexBadge}>
                    <Text style={styles.nameIndex}>#{idx + 1}</Text>
                  </View>
                  <TextInput
                    style={styles.nameInput}
                    placeholder={`Player ${idx + 1}`}
                    placeholderTextColor={Colors.muted}
                    value={customNames[idx] || ''}
                    onChangeText={(text) => handlePlayerNameChange(idx, text)}
                  />
                </View>
              ))}
            </View>
          )}
        </View>

        {/* ── Start Button ────────────────────────────── */}
        <View style={styles.startArea}>
          <ChunkyButton
            title={
              selectedCategories.length === 0
                ? 'Select at least 1 Theme!'
                : `Start Game! 🎮 (${selectedCategories.length} Theme${selectedCategories.length > 1 ? 's' : ''})`
            }
            onPress={handleStart}
            disabled={selectedCategories.length === 0}
            color={Colors.mint}
            shadowColor={Colors.mintDark}
            textColor={Colors.dark}
          />
          <Text style={styles.disclaimer}>
            📱 1 Phone · Pass and play together in the same room!
          </Text>
        </View>
      </ScrollView>

      <CustomCategoryModal
        visible={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSave={handleSaveCustomCategory}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.bgWarm },
  container: { padding: 20, paddingBottom: 48 },

  // Header
  header: { alignItems: 'center', marginVertical: 14 },

  tagShadow: {
    backgroundColor: Colors.dark,
    borderRadius: Borders.radiusFull,
    marginBottom: 12,
  },
  tag: {
    backgroundColor: Colors.gold,
    borderWidth: Borders.width,
    borderColor: Colors.dark,
    borderRadius: Borders.radiusFull,
    paddingVertical: 8,
    paddingHorizontal: 20,
    transform: [{ translateY: -4 }],
  },
  tagText: { color: Colors.dark, fontWeight: '900', fontSize: 12, letterSpacing: 0.8 },

  title: {
    color: Colors.dark,
    fontSize: 46,
    fontWeight: '900',
    letterSpacing: 2,
    textAlign: 'center',
    lineHeight: 50,
  },
  titleAccent: {
    color: Colors.coral,
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 2,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    color: Colors.slate,
    fontSize: 14,
    textAlign: 'center',
    maxWidth: 300,
    lineHeight: 20,
    fontWeight: '600',
  },

  section: { marginVertical: 10 },

  sectionHeading: {
    color: Colors.dark,
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 1,
    marginBottom: 10,
  },

  // Names accordion
  namesToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.bgCard,
    borderWidth: Borders.width,
    borderColor: Colors.dark,
    borderRadius: Borders.radius,
    padding: 16,
    shadowColor: Colors.dark,
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  namesToggleLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  namesToggleTitle: { color: Colors.dark, fontSize: 15, fontWeight: '800' },
  chevron: { color: Colors.slate, fontSize: 14, fontWeight: '900' },

  namesListContainer: {
    backgroundColor: Colors.bgCard,
    borderWidth: Borders.width,
    borderColor: Colors.dark,
    borderRadius: Borders.radius,
    padding: 16,
    marginTop: 10,
    gap: 10,
    shadowColor: Colors.dark,
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  nameIndexBadge: {
    backgroundColor: Colors.bgWarm,
    borderWidth: Borders.width,
    borderColor: Colors.dark,
    width: 40,
    height: 40,
    borderRadius: Borders.radiusSm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nameIndex: { color: Colors.sky, fontSize: 13, fontWeight: '900' },
  nameInput: {
    flex: 1,
    backgroundColor: Colors.bgWarm,
    borderWidth: Borders.width,
    borderColor: Colors.dark,
    borderRadius: Borders.radiusSm,
    color: Colors.dark,
    fontSize: 15,
    fontWeight: '700',
    paddingHorizontal: 14,
    paddingVertical: 10,
  },

  startArea: { marginTop: 22 },
  disclaimer: {
    color: Colors.muted,
    fontSize: 13,
    textAlign: 'center',
    marginTop: 12,
    fontWeight: '700',
  },
});
