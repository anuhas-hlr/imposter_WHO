import React from 'react';
import { StyleSheet, Text, View, Pressable, ScrollView } from 'react-native';
import { Category } from '../types/game';
import { triggerHaptic, soundEffects } from '../utils/soundAndHaptics';
import { Colors, Borders } from '../theme/colors';

interface Props {
  categories: Category[];
  selectedCategories: Category[];
  onToggleCategory: (category: Category) => void;
  onSelectAll: () => void;
  onOpenCreateModal: () => void;
  onDeleteCategory?: (categoryId: string) => void;
}

export const CategoryPicker: React.FC<Props> = ({
  categories,
  selectedCategories,
  onToggleCategory,
  onSelectAll,
  onOpenCreateModal,
  onDeleteCategory,
}) => {
  const selectedIds = new Set(selectedCategories.map((c) => c.id));
  const isAllSelected = categories.length > 0 && selectedCategories.length === categories.length;
  const totalWords = selectedCategories.reduce((acc, cat) => acc + (cat.words?.length || 0), 0);

  return (
    <View style={styles.container}>
      {/* ── Header Row ─────────────────────────────── */}
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.sectionTitle}>✨  CHOOSE THEMES</Text>
          <Text style={styles.subtitle}>
            {selectedCategories.length === 0
              ? 'Tap cards to select themes'
              : `${selectedCategories.length} selected · ${totalWords} words ready!`}
          </Text>
        </View>

        <View style={styles.headerActions}>
          {/* Select All pill */}
          <View style={styles.pillShadow}>
            <Pressable
              style={styles.actionPill}
              onPress={() => {
                triggerHaptic.light();
                soundEffects.playClick();
                onSelectAll();
              }}
            >
              <Text style={styles.actionPillText}>
                {isAllSelected ? '✕ All' : '✓ All'}
              </Text>
            </Pressable>
          </View>

          {/* Custom pill */}
          <View style={[styles.pillShadow, { backgroundColor: Colors.skyDark }]}>
            <Pressable
              style={[styles.actionPill, { backgroundColor: Colors.sky }]}
              onPress={() => {
                triggerHaptic.light();
                soundEffects.playClick();
                onOpenCreateModal();
              }}
            >
              <Text style={[styles.actionPillText, { color: Colors.bgCard }]}>+ Custom</Text>
            </Pressable>
          </View>
        </View>
      </View>

      {/* ── Horizontal Scroll ──────────────────────── */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollList}
      >
        {categories.map((category) => {
          const isSelected = selectedIds.has(category.id);

          return (
            <View
              key={category.id}
              style={[
                styles.cardShadow,
                {
                  backgroundColor: isSelected ? Colors.skyDark : Colors.dark,
                },
              ]}
            >
              <Pressable
                style={[
                  styles.categoryCard,
                  {
                    backgroundColor: isSelected ? Colors.civilian : Colors.bgCard,
                    borderColor: isSelected ? Colors.skyDark : Colors.dark,
                  },
                ]}
                onPress={() => {
                  triggerHaptic.light();
                  soundEffects.playClick();
                  onToggleCategory(category);
                }}
              >
                {/* Checkmark */}
                <View style={[
                  styles.checkBadge,
                  isSelected && { backgroundColor: Colors.sky, borderColor: Colors.skyDark },
                ]}>
                  <Text style={{ fontSize: 13 }}>{isSelected ? '✓' : ''}</Text>
                </View>

                {/* Delete for custom */}
                {category.isCustom && onDeleteCategory && (
                  <Pressable
                    style={styles.deleteBadge}
                    onPress={(e) => {
                      e.stopPropagation?.();
                      triggerHaptic.medium();
                      onDeleteCategory(category.id);
                    }}
                  >
                    <Text style={styles.deleteBadgeText}>✕</Text>
                  </Pressable>
                )}

                <Text style={styles.emoji}>{category.icon || '🎯'}</Text>

                <Text
                  style={[
                    styles.categoryName,
                    isSelected && { color: Colors.skyDark },
                  ]}
                  numberOfLines={2}
                >
                  {category.name}
                </Text>

                <View style={styles.metaRow}>
                  <View style={[
                    styles.countBadge,
                    isSelected && { backgroundColor: Colors.sky, borderColor: Colors.skyDark },
                  ]}>
                    <Text style={[
                      styles.countText,
                      isSelected && { color: Colors.bgCard },
                    ]}>
                      {category.words.length} words
                    </Text>
                  </View>
                  {category.isCustom && (
                    <View style={styles.customBadge}>
                      <Text style={styles.customBadgeText}>✦ Custom</Text>
                    </View>
                  )}
                </View>
              </Pressable>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginVertical: 12 },

  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
    paddingHorizontal: 2,
  },
  sectionTitle: {
    color: Colors.dark,
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 1,
  },
  subtitle: {
    color: Colors.sky,
    fontSize: 12,
    fontWeight: '700',
    marginTop: 2,
  },

  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },

  pillShadow: {
    backgroundColor: Colors.dark,
    borderRadius: Borders.radiusFull,
  },
  actionPill: {
    backgroundColor: Colors.bgCard,
    borderWidth: Borders.width,
    borderColor: Colors.dark,
    borderRadius: Borders.radiusFull,
    paddingVertical: 6,
    paddingHorizontal: 12,
    transform: [{ translateY: -3 }],
  },
  actionPillText: {
    color: Colors.dark,
    fontSize: 12,
    fontWeight: '900',
  },

  scrollList: {
    paddingVertical: 8,
    paddingHorizontal: 2,
    gap: 12,
  },

  cardShadow: {
    width: 148,
    borderRadius: Borders.radius,
  },
  categoryCard: {
    width: 148,
    minHeight: 150,
    borderRadius: Borders.radius,
    borderWidth: Borders.width,
    padding: 14,
    justifyContent: 'space-between',
    position: 'relative',
    transform: [{ translateY: -5 }],
  },

  checkBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: Borders.width,
    borderColor: Colors.dark,
    backgroundColor: Colors.bgWarm,
    justifyContent: 'center',
    alignItems: 'center',
  },

  deleteBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.imposter,
    borderWidth: Borders.width,
    borderColor: Colors.coralDark,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteBadgeText: { color: Colors.coralDark, fontSize: 11, fontWeight: '900' },

  emoji: { fontSize: 34, marginBottom: 4, marginTop: 10 },

  categoryName: {
    color: Colors.dark,
    fontSize: 14,
    fontWeight: '800',
    lineHeight: 18,
  },

  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
    flexWrap: 'wrap',
  },
  countBadge: {
    backgroundColor: Colors.bgWarm,
    borderWidth: 1.5,
    borderColor: Colors.dark,
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  countText: { color: Colors.slate, fontSize: 11, fontWeight: '700' },

  customBadge: {
    backgroundColor: Colors.gold,
    borderWidth: 1.5,
    borderColor: Colors.goldDark,
    paddingVertical: 2,
    paddingHorizontal: 7,
    borderRadius: 8,
  },
  customBadgeText: { color: Colors.dark, fontSize: 10, fontWeight: '900' },
});
