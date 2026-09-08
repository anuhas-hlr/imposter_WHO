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

