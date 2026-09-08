import React, { useState } from 'react';
import { StyleSheet, View, StatusBar } from 'react-native';
import { GameState, Category, Player } from './src/types/game';
import { initializeGame } from './src/utils/gameEngine';
import { SetupScreen } from './src/screens/SetupScreen';
import { RevealScreen } from './src/screens/RevealScreen';
import { DiscussionScreen } from './src/screens/DiscussionScreen';
import { VotingScreen } from './src/screens/VotingScreen';
import { LastChanceScreen } from './src/screens/LastChanceScreen';
import { ResultScreen } from './src/screens/ResultScreen';

export default function App() {
  const [gameState, setGameState] = useState<GameState>({
    stage: 'SETUP',
    players: [],
    currentTurnIndex: 0,
    category: null,
    secretWord: '',
    imposterWordHint: '',
    firstSpeakerIndex: 0,
    distractorWords: [],
  });

  // Keep last round parameters for instant "Play Again"
  const [lastRoundConfig, setLastRoundConfig] = useState<{
    playerCount: number;
    imposterCount: number;
    categories: Category[];
    customNames?: string[];
  }>({
    playerCount: 5,
    imposterCount: 1,
    categories: [],
  });

  // Start new round from Setup
  const handleStartGame = (
    playerCount: number,
    imposterCount: number,
    categories: Category[],
    customNames?: string[]
  ) => {
    setLastRoundConfig({
      playerCount,
      imposterCount,
      categories,
      customNames,
    });

    const newGame = initializeGame(playerCount, imposterCount, categories, customNames);
    setGameState(newGame);
  };

  // Next player in secret reveal phase
  const handleNextPlayer = () => {
    if (gameState.currentTurnIndex < gameState.players.length - 1) {
      setGameState((prev) => ({
        ...prev,
        currentTurnIndex: prev.currentTurnIndex + 1,
      }));
    } else {
      // All players have checked their cards -> Go to Discussion phase
      setGameState((prev) => ({
        ...prev,
        stage: 'DISCUSSION',
      }));
    }
  };

  // Transition to Voting
  const handleProceedToVoting = () => {
    setGameState((prev) => ({
      ...prev,
      stage: 'VOTING',
    }));
  };

  // Back from voting to discussion
  const handleBackToDiscussion = () => {
    setGameState((prev) => ({
      ...prev,
      stage: 'DISCUSSION',
    }));
  };

  // Player eliminated during voting
  const handleEliminatePlayer = (player: Player) => {
    if (player.isImposter) {
      // Imposter caught! Give them the Last Chance guess opportunity
      setGameState((prev) => ({
        ...prev,
        eliminatedPlayerId: player.id,
        stage: 'LAST_CHANCE',
      }));
    } else {
      // Civilian eliminated! Imposter bluffed successfully and wins!
      setGameState((prev) => ({
        ...prev,
        eliminatedPlayerId: player.id,
        imposterWon: true,
        stage: 'RESULT',
      }));
    }
  };

  // Imposter submitted guess in Last Chance screen
  const handleSubmitImposterGuess = (guessedWord: string) => {
    const isCorrect =
      guessedWord.trim().toLowerCase() === gameState.secretWord.trim().toLowerCase();

    setGameState((prev) => ({
      ...prev,
      imposterWon: isCorrect,
      imposterGuessedWord: guessedWord,
      stage: 'RESULT',
    }));
  };

  // Play again with same settings (fresh randomized word and roles)
  const handlePlayAgain = () => {
    if (!lastRoundConfig.categories || lastRoundConfig.categories.length === 0) {
      setGameState((prev) => ({ ...prev, stage: 'SETUP' }));
      return;
    }
    const newGame = initializeGame(
      lastRoundConfig.playerCount,
      lastRoundConfig.imposterCount,
      lastRoundConfig.categories,
      lastRoundConfig.customNames
    );
    setGameState(newGame);
  };

  // Back to setup
  const handleReturnToLobby = () => {
    setGameState((prev) => ({
      ...prev,
      stage: 'SETUP',
    }));
  };

  // Render active stage
  const renderCurrentScreen = () => {
    switch (gameState.stage) {
      case 'SETUP':
        return <SetupScreen onStartGame={handleStartGame} />;

      case 'REVEAL':
        return (
          <RevealScreen
            players={gameState.players}
            currentIndex={gameState.currentTurnIndex}
            onNextPlayer={handleNextPlayer}
            onAbortGame={handleReturnToLobby}
          />
        );

      case 'DISCUSSION':
        return (
          <DiscussionScreen
            players={gameState.players}
            firstSpeakerIndex={gameState.firstSpeakerIndex}
            category={gameState.category!}
            categories={gameState.categories}
            onProceedToVoting={handleProceedToVoting}
          />
        );

      case 'VOTING':
        return (
          <VotingScreen
            players={gameState.players}
            onEliminatePlayer={handleEliminatePlayer}
            onBackToDiscussion={handleBackToDiscussion}
          />
        );

      case 'LAST_CHANCE': {
        const imposter = gameState.players.find(
          (p) => p.id === gameState.eliminatedPlayerId
        )!;
        return (
          <LastChanceScreen
            imposter={imposter}
            category={gameState.category!}
            secretWord={gameState.secretWord}
            distractorWords={gameState.distractorWords || [gameState.secretWord]}
            onSubmitGuess={handleSubmitImposterGuess}
          />
        );
      }

      case 'RESULT': {
        const eliminated = gameState.players.find(
          (p) => p.id === gameState.eliminatedPlayerId
        )!;
        return (
          <ResultScreen
            players={gameState.players}
            category={gameState.category!}
            secretWord={gameState.secretWord}
            eliminatedPlayer={eliminated}
            imposterWon={!!gameState.imposterWon}
            imposterGuessedWord={gameState.imposterGuessedWord}
            onPlayAgain={handlePlayAgain}
            onReturnToLobby={handleReturnToLobby}
          />
        );
      }

      default:
        return <SetupScreen onStartGame={handleStartGame} />;
    }
  };

  return (
    <View style={styles.appContainer}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF9E6" />
      {renderCurrentScreen()}
    </View>
  );
}

const styles = StyleSheet.create({
  appContainer: {
    flex: 1,
    backgroundColor: '#FFF9E6',
  },
});
