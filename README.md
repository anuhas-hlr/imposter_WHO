# Undercover / Imposter Word Game (Pass & Play) - Implementation Guide

An offline, multiplayer pass-and-play party game inspired by *Undercover* and *The Chameleon*. Built with React Native and Expo Go, completely ad-free and without paywalled categories.

---

## 1. Project Overview & Architecture

### Core Gameplay Mechanics
1. **Lobby / Configuration:**
   - Choose total number of players (3 to 20).
   - Choose number of Imposters (default: 1; scalable based on player count).
   - Choose category/theme (Animals, Food, Movies, Video Games, Custom, etc.).
   - Optional: Enter player names or use auto-generated names ("Player 1", "Player 2", ...).

2. **Secret Reveal Phase (Pass & Play):**
   - Phone prompts: *"Pass the phone to [Player Name]"*.
   - Player taps and holds the screen to reveal their role/word.
   - **Civilian:** Sees the secret word (e.g., *"Cheeseburger"*).
   - **Imposter:** Sees only a hint or the general category (e.g., *"Category: Food & Drinks"* or *"You are the Imposter"*).
   - Releasing the hold hides the card again to prevent shoulder-surfing.
   - Screen advances until every player has checked their role.

3. **Discussion & Clue Phase:**
   - A random player is selected to give the first one-word / one-sentence clue.
   - Optional discussion countdown timer (e.g., 2-3 minutes).

4. **Voting & Resolution:**
   - Players debate and vote on who the Imposter is.
   - Vote tally screen: eliminate suspect.
   - Reveal if the eliminated player was indeed the Imposter.
   - If Imposter is caught: Imposter gets a last-chance screen to guess the secret word from a list of 4-6 words to steal the win!

---

## 2. Directory Structure

```text
imposter-game/
├── App.tsx
├── app.json
├── package.json
├── tsconfig.json
├── src/
│   ├── assets/
│   │   └── data/
│   │       └── defaultCategories.json
│   ├── components/
│   │   ├── HoldToRevealCard.tsx
│   │   ├── CategoryPicker.tsx
│   │   ├── CounterButton.tsx
│   │   └── PrimaryButton.tsx
│   ├── screens/
│   │   ├── SetupScreen.tsx
│   │   ├── RevealScreen.tsx
│   │   ├── DiscussionScreen.tsx
│   │   ├── VotingScreen.tsx
│   │   └── ResultScreen.tsx
│   ├── services/
│   │   └── storage.ts        # AsyncStorage for persistent custom categories
│   ├── types/
│   │   └── game.ts
│   └── utils/
│       └── gameEngine.ts     # Core role assignment & word randomization
```

---

## 3. Data Schema & Types

### `src/types/game.ts`
```typescript
export interface Category {
  id: string;
  name: string;
  icon?: string;
  words: string[];
  isCustom?: boolean;
}

export interface Player {
  id: number;
  name: string;
  isImposter: boolean;
  roleTitle: 'Civilian' | 'Imposter';
  word: string;
}

export type GameStage = 'SETUP' | 'REVEAL' | 'DISCUSSION' | 'VOTING' | 'RESULT';

export interface GameState {
  stage: GameStage;
  players: Player[];
  currentTurnIndex: number;
  category: Category | null;
  secretWord: string;
  imposterWordHint: string;
  firstSpeakerIndex: number;
  eliminatedPlayerId?: number;
  imposterWon?: boolean;
}
```

---

## 4. Built-in Categories Data

### `src/assets/data/defaultCategories.json`
```json
[
  {
    "id": "food",
    "name": "Food & Beverages",
    "words": [
      "Pizza", "Sushi", "Croissant", "Tacos", "Lasagna",
      "Hamburger", "Ramen", "Pancakes", "Hot Dog", "Burrito",
      "Waffles", "Dim Sum", "Barbecue", "Ice Cream", "Paella"
    ]
  },
  {
    "id": "animals",
    "name": "Animals & Wildlife",
    "words": [
      "Elephant", "Kangaroo", "Penguin", "Chimpanzee", "Giraffe",
      "Cheetah", "Dolphin", "Octopus", "Platypus", "Koala",
      "Chameleon", "Flamingo", "Polar Bear", "Hedgehog", "Sloth"
    ]
  },
  {
    "id": "places",
    "name": "World Landmarks & Cities",
    "words": [
      "Eiffel Tower", "Colosseum", "Great Wall of China", "Statue of Liberty",
      "Taj Mahal", "Pyramids of Giza", "Sydney Opera House", "Machu Picchu",
      "Tokyo", "Venice", "Rio de Janeiro", "Grand Canyon"
    ]
  },
  {
    "id": "movies",
    "name": "Cinema & Pop Culture",
    "words": [
      "Titanic", "Inception", "Jurassic Park", "Avatar", "The Matrix",
      "Star Wars", "Harry Potter", "The Avengers", "Spider-Man", "Interstellar"
    ]
  },
  {
    "id": "objects",
    "name": "Everyday Objects",
    "words": [
      "Headphones", "Umbrella", "Microwave", "Backpack", "Toothbrush",
      "Sunglasses", "Alarm Clock", "Wristwatch", "Flashlight", "Thermos"
    ]
  }
]
```

---

## 5. Core Game Engine Implementation

### `src/utils/gameEngine.ts`
```typescript
import { Category, Player } from '../types/game';

export function initializeGame(
  playerCount: number,
  imposterCount: number,
  category: Category,
  customPlayerNames?: string[]
): { players: Player[]; secretWord: string; imposterHint: string; firstSpeakerIndex: number } {
  if (imposterCount >= playerCount) {
    throw new Error('Imposters must be fewer than total players.');
  }

  // 1. Pick a random secret word
  const randomIndex = Math.floor(Math.random() * category.words.length);
  const secretWord = category.words[randomIndex];
  const imposterHint = `Category: ${category.name}`;

  // 2. Select random imposter indices
  const imposterIndices = new Set<number>();
  while (imposterIndices.size < imposterCount) {
    const candidate = Math.floor(Math.random() * playerCount);
    imposterIndices.add(candidate);
  }

  // 3. Construct players
  const players: Player[] = Array.from({ length: playerCount }, (_, i) => {
    const isImposter = imposterIndices.has(i);
    const name = customPlayerNames && customPlayerNames[i]?.trim()
      ? customPlayerNames[i].trim()
      : `Player ${i + 1}`;

    return {
      id: i + 1,
      name,
      isImposter,
      roleTitle: isImposter ? 'Imposter' : 'Civilian',
      word: isImposter ? imposterHint : secretWord,
    };
  });

  // 4. Determine random starter
  const firstSpeakerIndex = Math.floor(Math.random() * playerCount);

  return {
    players,
    secretWord,
    imposterHint,
    firstSpeakerIndex,
  };
}
```

---

## 6. Step-by-Step Build Instructions

### Step 1: Initialize Project
```bash
npx create-expo-app@latest imposter-party-game --template blank-typescript
cd imposter-party-game
```

### Step 2: Install Supporting Dependencies
```bash
# Lucide icons for clean minimalist UI
npx expo install lucide-react-native react-native-svg

# Async storage for saving unlimited custom user categories locally
npx expo install @react-native-async-storage/async-storage

# Haptic feedback for tactile buzzes on hold & reveal
npx expo install expo-haptics
```

### Step 3: Implement Custom Categories Storage (`src/services/storage.ts`)
Enable users to add, edit, or delete categories without restrictions:
```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Category } from '../types/game';
import defaultCategories from '../assets/data/defaultCategories.json';

const CUSTOM_CATEGORIES_KEY = '@imposter_custom_categories_v1';

export async function getAllCategories(): Promise<Category[]> {
  try {
    const raw = await AsyncStorage.getItem(CUSTOM_CATEGORIES_KEY);
    const custom: Category[] = raw ? JSON.parse(raw) : [];
    return [...(defaultCategories as Category[]), ...custom];
  } catch (error) {
    return defaultCategories as Category[];
  }
}

export async function saveCustomCategory(category: Category): Promise<void> {
  const raw = await AsyncStorage.getItem(CUSTOM_CATEGORIES_KEY);
  const custom: Category[] = raw ? JSON.parse(raw) : [];
  custom.push({ ...category, isCustom: true });
  await AsyncStorage.setItem(CUSTOM_CATEGORIES_KEY, JSON.stringify(custom));
}
```

### Step 4: Implement Pass-and-Hold Reveal Component (`src/components/HoldToRevealCard.tsx`)
```tsx
import React, { useState } from 'react';
import { StyleSheet, Text, View, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Player } from '../types/game';

interface Props {
  player: Player;
  onFinished: () => void;
  isLast: boolean;
}

export const HoldToRevealCard: React.FC<Props> = ({ player, onFinished, isLast }) => {
  const [isRevealed, setIsRevealed] = useState(false);
  const [hasRevealedOnce, setHasRevealedOnce] = useState(false);

  const handlePressIn = () => {
    setIsRevealed(true);
    setHasRevealedOnce(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  };

  const handlePressOut = () => {
    setIsRevealed(false);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.passPrompt}>Pass device to:</Text>
      <Text style={styles.playerName}>{player.name}</Text>

      <Pressable
        style={[styles.card, isRevealed && (player.isImposter ? styles.cardImposter : styles.cardCivilian)]}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        {isRevealed ? (
          <View style={styles.secretBox}>
            <Text style={styles.roleTag}>
              {player.isImposter ? 'YOU ARE THE IMPOSTER' : 'YOUR SECRET WORD'}
            </Text>
            <Text style={styles.wordDisplay}>{player.word}</Text>
            <Text style={styles.roleSubtext}>
              {player.isImposter
                ? 'Blend in! Don\'t let them know you don\'t know the exact word.'
                : 'Give a clue that proves you know it without giving it away.'}
            </Text>
          </View>
        ) : (
          <View style={styles.hiddenBox}>
            <Text style={styles.hiddenInstruction}>PRESS & HOLD</Text>
            <Text style={styles.hiddenSubtext}>Only you should see this screen</Text>
          </View>
        )}
      </Pressable>

      {hasRevealedOnce && (
        <Pressable style={styles.nextButton} onPress={onFinished}>
          <Text style={styles.nextButtonText}>
            {isLast ? 'Begin Discussion →' : 'Next Player →'}
          </Text>
        </Pressable>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, backgroundColor: '#0f172a' },
  passPrompt: { color: '#94a3b8', fontSize: 16, textTransform: 'uppercase', letterSpacing: 1.5 },
  playerName: { color: '#f8fafc', fontSize: 32, fontWeight: '800', marginTop: 4, marginBottom: 36 },
  card: {
    width: '100%',
    height: 280,
    backgroundColor: '#1e293b',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#334155',
    padding: 24,
  },
  cardCivilian: { borderColor: '#38bdf8', backgroundColor: '#0c4a6e' },
  cardImposter: { borderColor: '#f43f5e', backgroundColor: '#881337' },
  hiddenBox: { alignItems: 'center' },
  hiddenInstruction: { color: '#e2e8f0', fontSize: 22, fontWeight: '700', letterSpacing: 2 },
  hiddenSubtext: { color: '#64748b', fontSize: 13, marginTop: 8 },
  secretBox: { alignItems: 'center' },
  roleTag: { color: '#fbbf24', fontSize: 13, fontWeight: '800', letterSpacing: 1.2, marginBottom: 12 },
  wordDisplay: { color: '#ffffff', fontSize: 30, fontWeight: '900', textAlign: 'center' },
  roleSubtext: { color: '#e2e8f0', fontSize: 13, textAlign: 'center', marginTop: 14, lineHeight: 18 },
  nextButton: {
    marginTop: 36,
    backgroundColor: '#3b82f6',
    paddingVertical: 16,
    paddingHorizontal: 36,
    borderRadius: 14,
    width: '100%',
    alignItems: 'center',
  },
  nextButtonText: { color: '#ffffff', fontSize: 18, fontWeight: '700' },
});
```

---

## 7. Execution Checklist for Anti-Gravity Agent

1. [ ] **Run initialization script:** `npx create-expo-app@latest . --template blank-typescript`
2. [ ] **Install dependencies:** `expo-haptics`, `@react-native-async-storage/async-storage`, `lucide-react-native`, `react-native-svg`
3. [ ] **Create folder structure:** Ensure `src/components`, `src/types`, `src/services`, `src/screens`, `src/assets/data` exist.
4. [ ] **Populate JSON:** Copy `defaultCategories.json` with 50+ diverse words per pack.
5. [ ] **Assemble Navigation:** Plug `App.tsx` state machine toggling between `SETUP`, `REVEAL`, `DISCUSSION`, and `VOTING`.
6. [ ] **Add Custom Category Form:** Provide an intuitive screen where users can name a category and paste comma-separated words.
7. [ ] **Test with Expo Go:** Run `npx expo start` and verify on mobile device.
