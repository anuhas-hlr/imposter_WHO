import { Category, Player, GameState } from '../types/game';

export function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function generateDistractors(category: Category, secretWord: string, totalOptions = 5): string[] {
  const otherWords = category.words.filter(
    (w) => w.toLowerCase() !== secretWord.toLowerCase()
  );
  const shuffledOthers = shuffleArray(otherWords);
  const selectedDistractors = shuffledOthers.slice(0, Math.min(totalOptions - 1, shuffledOthers.length));
  return shuffleArray([secretWord, ...selectedDistractors]);
}

export function initializeGame(
  playerCount: number,
  imposterCount: number,
  categoriesInput: Category | Category[],
  customPlayerNames?: string[]
): GameState {
  const selectedCategories = Array.isArray(categoriesInput) ? categoriesInput : [categoriesInput];
  const validCategories = selectedCategories.filter((c) => c && c.words && c.words.length > 0);

  if (playerCount < 3) {
    throw new Error('Minimum 3 players required.');
  }
  if (imposterCount >= playerCount) {
    throw new Error('Imposters must be fewer than total players.');
  }
  if (validCategories.length === 0) {
    throw new Error('At least one valid category with words must be selected.');
  }

  // 1. Pick a random category from the selected categories
  const chosenCategory = validCategories[Math.floor(Math.random() * validCategories.length)];
  const randomIndex = Math.floor(Math.random() * chosenCategory.words.length);
  const secretWord = chosenCategory.words[randomIndex];

  const isMulti = validCategories.length > 1;
  const imposterWordHint = isMulti
    ? `Category: ${chosenCategory.name} (${validCategories.length} themes active)`
    : `Category: ${chosenCategory.name}`;

  // 2. Select random imposter indices
  const imposterIndices = new Set<number>();
  while (imposterIndices.size < imposterCount) {
    const candidate = Math.floor(Math.random() * playerCount);
    imposterIndices.add(candidate);
  }

  // 3. Construct players
  const players: Player[] = Array.from({ length: playerCount }, (_, i) => {
    const isImposter = imposterIndices.has(i);
    const customName = customPlayerNames && customPlayerNames[i]?.trim();
    const name = customName || `Player ${i + 1}`;

    return {
      id: i + 1,
      name,
      isImposter,
      roleTitle: isImposter ? 'Imposter' : 'Civilian',
      word: isImposter ? imposterWordHint : secretWord,
    };
  });

  // 4. Random first speaker
  const firstSpeakerIndex = Math.floor(Math.random() * playerCount);

  // 5. Generate distractors for the last chance guess
  const distractorWords = generateDistractors(chosenCategory, secretWord, 5);

  return {
    stage: 'REVEAL',
    players,
    currentTurnIndex: 0,
    category: chosenCategory,
    categories: validCategories,
    secretWord,
    imposterWordHint,
    firstSpeakerIndex,
    distractorWords,
  };
}
