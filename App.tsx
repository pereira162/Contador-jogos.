import React, { useState, useEffect, useCallback, useRef } from 'react';
import { PlayerSetting, PlayerState, GameStatus, GameSettings, GameHistoryEntry, View, MatchGroup, GameCompletionData } from './types';
import { parseTimeToSeconds } from './utils/time';
import { loadRankingsFromStorage, saveRankingsToStorage } from './utils/localStorage';
import { createGameRecord, addRecordToRankings } from './utils/ranking';
import SettingsScreen from './components/SettingsScreen';
import GameScreen from './components/GameScreen';
import RankingScreen from './components/RankingScreen';
import AppHeader from './components/AppHeader';
import GameCompletionModal from './components/GameCompletionModal';


const EXTRA_TIME_ON_TIMEOUT_SECONDS = 600; 
const BULK_TIME_ADJUSTMENT_SECONDS = 30;
const INDIVIDUAL_TIME_ADJUSTMENT_SECONDS = 30;
const TICK_SOUND_THRESHOLD_SECONDS = 10;
const MIN_TICK_VOLUME_FRACTION = 0.2; 
const MAX_UNDO_HISTORY = 10;
const APP_VERSION = "v3.0";


const App: React.FC = () => {
  const initialNumPlayers = 3; 
  const initialPlayerSettings: PlayerSetting[] = Array.from({ length: initialNumPlayers }, (_, i) => ({
    id: crypto.randomUUID(),
    name: `Jogador ${i + 1}`,
    initialTimeMinutes: 10, 
    initialTimeSeconds: 0,
  }));

  const [currentView, setCurrentView] = useState<View>('setup');
  const [gameSettings, setGameSettings] = useState<GameSettings>({
    numPlayers: initialNumPlayers,
    players: initialPlayerSettings,
    incrementPerMove: 5,
  });

  const [playerStates, setPlayerStates] = useState<PlayerState[]>([]);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState<number | null>(null);
  const [gameStatus, setGameStatus] = useState<GameStatus>('setup');
  const [winner, setWinner] = useState<PlayerState | null>(null);
  const [volume, setVolume] = useState<number>(0.5);
  
  const [elapsedGameTime, setElapsedGameTime] = useState<number>(0);
  const [currentRound, setCurrentRound] = useState<number>(1);

  const [awaitingTimeOutDecisionForPlayerId, setAwaitingTimeOutDecisionForPlayerId] = useState<string | null>(null);
  const [gameHistory, setGameHistory] = useState<GameHistoryEntry[]>([]);
  const [isResetConfirmationVisible, setIsResetConfirmationVisible] = useState<boolean>(false);

  // Ranking and Game Completion States
  const [rankings, setRankings] = useState<MatchGroup[]>([]);
  const [isGameCompletionModalOpen, setIsGameCompletionModalOpen] = useState(false);
  const [gameCompletionData, setGameCompletionData] = useState<GameCompletionData | null>(null);

  const alarmSoundRef = useRef<HTMLAudioElement>(null);
  const tickSoundRef = useRef<HTMLAudioElement>(null);
  const completeSoundRef = useRef<HTMLAudioElement>(null); // For game completion
  const gameTimerIntervalRef = useRef<number | null>(null);
  const gameStatusRef = useRef(gameStatus); // To access current gameStatus in callbacks

  useEffect(() => {
    gameStatusRef.current = gameStatus;
  }, [gameStatus]);

  useEffect(() => {
    setRankings(loadRankingsFromStorage());
  }, []);

  const playCompleteSound = useCallback(() => {
    if (completeSoundRef.current) {
        completeSoundRef.current.volume = volume;
        completeSoundRef.current.play().catch(error => console.warn("Complete sound play failed:", error));
    }
  }, [volume]);

  const stopTickSound = useCallback(() => {
    if (tickSoundRef.current) {
      tickSoundRef.current.pause();
      tickSoundRef.current.currentTime = 0; 
    }
  }, []);

  const playAlarm = useCallback(() => {
    stopTickSound(); 
    if (alarmSoundRef.current) {
      alarmSoundRef.current.volume = volume;
      alarmSoundRef.current.play().catch(error => console.warn("Alarm play failed:", error));
    }
  }, [volume, stopTickSound]);


  const handleSettingsChange = <K extends keyof GameSettings>(key: K, value: GameSettings[K]) => {
    setGameSettings(prev => ({ ...prev, [key]: value }));
  };

  const handlePlayerSettingChange = (index: number, field: keyof PlayerSetting, value: string | number) => {
    setGameSettings(prev => {
      const newPlayers = [...prev.players];
      newPlayers[index] = { ...newPlayers[index], [field]: value };
      return { ...prev, players: newPlayers };
    });
  };
  
  const initializeGame = useCallback((switchToGameView = true) => {
    const newPlayerStates: PlayerState[] = gameSettings.players.map(p => ({
      id: p.id,
      name: p.name,
      mainTimeRemaining: parseTimeToSeconds(p.initialTimeMinutes, p.initialTimeSeconds),
      isEliminated: false,
    }));
    
    setPlayerStates(newPlayerStates);
    const firstPlayerIdx = newPlayerStates.findIndex(p => !p.isEliminated);
    setCurrentPlayerIndex(firstPlayerIdx !== -1 ? firstPlayerIdx : null);
    setGameStatus('playing');
    setWinner(null);
    setElapsedGameTime(0);
    setCurrentRound(1);
    setAwaitingTimeOutDecisionForPlayerId(null);
    setGameHistory([]); 
    stopTickSound();
    setIsResetConfirmationVisible(false);
    setIsGameCompletionModalOpen(false);
    setGameCompletionData(null);
    if (switchToGameView) {
        setCurrentView('game');
    }
  }, [gameSettings, stopTickSound]);

  const handleStartGame = () => {
    initializeGame();
  };

  const handleNavigate = (view: View) => {
    if (view === 'game' && gameStatus === 'setup' && playerStates.length === 0) {
        // If trying to navigate to game but no game is active, start one (or go to setup)
        // For now, let's assume if 'game' is clickable, a game is active or can be resumed.
        // This logic might need refinement based on AppHeader's isGameActive prop.
        // If no game has been set up, perhaps redirect to 'setup'.
        setCurrentView('setup'); // Or handleStartGame() then setCurrentView('game')
    } else {
        setCurrentView(view);
    }
  };
  
  const concludeGame = useCallback((naturalWinner: PlayerState | null, manuallyEnded: boolean = false) => {
    setGameStatus('completing'); // New status to signify modal is up
    playCompleteSound();
    stopTickSound();
    if (gameTimerIntervalRef.current) clearInterval(gameTimerIntervalRef.current);
    
    setGameCompletionData({
        playerStates: playerStates.map(p=> ({...p})), // snapshot
        winner: naturalWinner,
        manuallyEnded,
        gameDuration: elapsedGameTime,
        rounds: currentRound
    });
    setIsGameCompletionModalOpen(true);
  }, [playerStates, elapsedGameTime, currentRound, playCompleteSound, stopTickSound]);


  const switchToNextPlayer = useCallback(() => {
    setPlayerStates(prevStates => { 
      if (currentPlayerIndex === null) return prevStates;

      let nextPlayerIdx = (currentPlayerIndex + 1) % prevStates.length;
      let attempts = 0;
      while (prevStates[nextPlayerIdx].isEliminated && attempts < prevStates.length) {
        nextPlayerIdx = (nextPlayerIdx + 1) % prevStates.length;
        attempts++;
      }
      
      const activePlayers = prevStates.filter(p => !p.isEliminated);

      if (activePlayers.length === 0 && prevStates.length > 0) {
        setWinner(null); // Draw
        concludeGame(null);
        setCurrentPlayerIndex(null);
        return prevStates;
      }
      if (activePlayers.length === 1) {
        const gameWinner = activePlayers[0];
        setWinner(gameWinner);
        concludeGame(gameWinner);
        setCurrentPlayerIndex(null);
        return prevStates;
      }
      
      if (prevStates[nextPlayerIdx].isEliminated && activePlayers.length > 1) {
         // This should not happen if logic is correct, means all remaining are eliminated but more than one.
        setWinner(null); 
        concludeGame(null);
        setCurrentPlayerIndex(null);
        return prevStates;
      }
      
      const firstActivePlayerOverallIdx = prevStates.findIndex(p => !p.isEliminated);
      if (firstActivePlayerOverallIdx !== -1 && 
          nextPlayerIdx === firstActivePlayerOverallIdx &&
          (currentPlayerIndex + 1) % prevStates.length === firstActivePlayerOverallIdx && 
          gameStatusRef.current === 'playing') { 
            setCurrentRound(prevRound => prevRound + 1);
      }
      
      setCurrentPlayerIndex(nextPlayerIdx);
      return prevStates; 
    });
  }, [currentPlayerIndex, concludeGame]); 


  useEffect(() => {
    if (gameStatus !== 'playing' || currentPlayerIndex === null || awaitingTimeOutDecisionForPlayerId || isResetConfirmationVisible || isGameCompletionModalOpen) {
      if (tickSoundRef.current && !tickSoundRef.current.paused) stopTickSound();
      return;
    }

    const timerId = setInterval(() => {
      setPlayerStates(prevPlayerStates => {
        let playerTimedOutId: string | null = null;
        const updatedPlayerStates = prevPlayerStates.map((p, index) => {
          if (index === currentPlayerIndex && !p.isEliminated) {
            const newMainTime = p.mainTimeRemaining - 1;
            if (newMainTime < 0) {
              playerTimedOutId = p.id;
              return { ...p, mainTimeRemaining: 0 };
            }
            return { ...p, mainTimeRemaining: newMainTime };
          }
          return p;
        });

        if (playerTimedOutId) {
          playAlarm();
          setGameStatus('paused'); 
          setAwaitingTimeOutDecisionForPlayerId(playerTimedOutId);
        }
        return updatedPlayerStates;
      });
    }, 1000);

    return () => clearInterval(timerId);
  }, [gameStatus, currentPlayerIndex, playAlarm, awaitingTimeOutDecisionForPlayerId, isResetConfirmationVisible, stopTickSound, isGameCompletionModalOpen]);
  
  useEffect(() => {
    if (gameStatus === 'playing' && currentPlayerIndex !== null && !awaitingTimeOutDecisionForPlayerId && !isResetConfirmationVisible && playerStates[currentPlayerIndex]) {
      const activePlayer = playerStates[currentPlayerIndex];
      const timeRemaining = activePlayer.mainTimeRemaining;

      if (!activePlayer.isEliminated && timeRemaining > 0 && timeRemaining <= TICK_SOUND_THRESHOLD_SECONDS) {
        if (tickSoundRef.current) {
          const progress = (TICK_SOUND_THRESHOLD_SECONDS - timeRemaining) / (TICK_SOUND_THRESHOLD_SECONDS -1); 
          const calculatedTickVolume = volume * (MIN_TICK_VOLUME_FRACTION + (1 - MIN_TICK_VOLUME_FRACTION) * Math.min(1, Math.max(0,progress)) );
          tickSoundRef.current.volume = calculatedTickVolume;
          
          if (tickSoundRef.current.paused) {
             tickSoundRef.current.loop = true;
             tickSoundRef.current.play().catch(error => console.warn("Tick play failed:", error));
          }
        }
      } else {
        if (tickSoundRef.current && !tickSoundRef.current.paused) stopTickSound();
      }
    } else {
      if (tickSoundRef.current && !tickSoundRef.current.paused) stopTickSound();
    }
  }, [playerStates, currentPlayerIndex, gameStatus, volume, awaitingTimeOutDecisionForPlayerId, isResetConfirmationVisible, stopTickSound]);


  useEffect(() => {
    if (gameStatusRef.current === 'playing' && currentPlayerIndex !== null && playerStates.length > 0 && playerStates[currentPlayerIndex]) {
      const currentPlayer = playerStates[currentPlayerIndex];
      if (currentPlayer && currentPlayer.isEliminated) {
         switchToNextPlayer();
      }
    }
  }, [playerStates, currentPlayerIndex, switchToNextPlayer]);


  useEffect(() => {
    if (gameStatus === 'playing' && !awaitingTimeOutDecisionForPlayerId && !isResetConfirmationVisible && !isGameCompletionModalOpen) {
      gameTimerIntervalRef.current = setInterval(() => {
        setElapsedGameTime(prevTime => prevTime + 1);
      }, 1000);
    } else {
      if (gameTimerIntervalRef.current) {
        clearInterval(gameTimerIntervalRef.current);
        gameTimerIntervalRef.current = null;
      }
    }
    return () => {
      if (gameTimerIntervalRef.current) {
        clearInterval(gameTimerIntervalRef.current);
      }
    };
  }, [gameStatus, awaitingTimeOutDecisionForPlayerId, isResetConfirmationVisible, isGameCompletionModalOpen]);


  const handlePlayerAction = () => {
    if (gameStatus !== 'playing' || currentPlayerIndex === null || awaitingTimeOutDecisionForPlayerId || isResetConfirmationVisible || isGameCompletionModalOpen) return;

    const currentSnapshotPlayerStates = playerStates.map(p => ({ ...p })); 
    const newHistoryEntry: GameHistoryEntry = {
      playerStates: currentSnapshotPlayerStates,
      activePlayerIndexBeforeSwitch: currentPlayerIndex,
      currentRoundBeforeSwitch: currentRound,
      elapsedGameTimeBeforeSwitch: elapsedGameTime,
    };
    setGameHistory(prevHistory => [newHistoryEntry, ...prevHistory].slice(0, MAX_UNDO_HISTORY));
    
    stopTickSound();

    setPlayerStates(prevStates => {
      return prevStates.map((p, index) => {
        if (index === currentPlayerIndex && !p.isEliminated) {
          return { ...p, mainTimeRemaining: p.mainTimeRemaining + gameSettings.incrementPerMove };
        }
        return p;
      });
    });
    switchToNextPlayer();
  };

  const handlePauseResume = () => {
    if (awaitingTimeOutDecisionForPlayerId || isResetConfirmationVisible || isGameCompletionModalOpen) return; 

    setGameStatus(prevStatus => {
      if (prevStatus === 'playing') {
        if (tickSoundRef.current && !tickSoundRef.current.paused) stopTickSound();
        return 'paused';
      }
      if (prevStatus === 'paused') return 'playing'; 
      return prevStatus;
    });
  };

  const handleShowResetConfirmation = () => {
    if (tickSoundRef.current && !tickSoundRef.current.paused) stopTickSound();
    setGameStatus('paused'); 
    setIsResetConfirmationVisible(true);
  };

  const confirmResetGame = () => {
    if (tickSoundRef.current && !tickSoundRef.current.paused) stopTickSound();
    setGameStatus('setup');
    setCurrentPlayerIndex(null);
    setPlayerStates([]);
    setWinner(null);
    setElapsedGameTime(0);
    setCurrentRound(1);
    setAwaitingTimeOutDecisionForPlayerId(null);
    setGameHistory([]); 
    if (gameTimerIntervalRef.current) {
      clearInterval(gameTimerIntervalRef.current);
      gameTimerIntervalRef.current = null;
    }
    setIsResetConfirmationVisible(false);
    setCurrentView('setup'); // Navigate to setup after reset
  };

  const cancelResetGame = () => {
    setIsResetConfirmationVisible(false);
    // If game was active, potentially resume or stay paused based on state before confirmation
    if (playerStates.length > 0 && winner === null && gameStatus === 'paused' && !awaitingTimeOutDecisionForPlayerId && !isGameCompletionModalOpen) {
      // Do nothing, game remains paused. User can resume.
    }
  };
  
  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
  };

  const handleEliminatePlayerDecision = () => {
    if (!awaitingTimeOutDecisionForPlayerId) return;
    const playerToEliminateId = awaitingTimeOutDecisionForPlayerId;
    if (tickSoundRef.current && !tickSoundRef.current.paused) stopTickSound();

    let lastActivePlayer: PlayerState | null = null;

    const updatedStates = playerStates.map(p => {
        if (p.id === playerToEliminateId) {
            return { ...p, isEliminated: true, mainTimeRemaining: 0 };
        }
        return p;
    });
    
    const remainingActivePlayers = updatedStates.filter(p => !p.isEliminated);
    
    setPlayerStates(updatedStates);
    setAwaitingTimeOutDecisionForPlayerId(null);
    
    if (remainingActivePlayers.length <= 1) {
        const gameWinner = remainingActivePlayers.length === 1 ? remainingActivePlayers[0] : null;
        setWinner(gameWinner);
        concludeGame(gameWinner); // Triggers completion modal
    } else {
        setGameStatus('playing'); 
        switchToNextPlayer(); 
    }
  };

  const handleAddExtraTimeToAllDecision = () => {
    if (!awaitingTimeOutDecisionForPlayerId) return;
    
    setPlayerStates(prevStates =>
      prevStates.map(p =>
        !p.isEliminated 
          ? { ...p, mainTimeRemaining: p.mainTimeRemaining + EXTRA_TIME_ON_TIMEOUT_SECONDS } 
          : p
      )
    );
    setAwaitingTimeOutDecisionForPlayerId(null);
    setGameStatus('playing'); 
  };

  const handleAddBulkTime = () => {
    if (awaitingTimeOutDecisionForPlayerId || isResetConfirmationVisible || isGameCompletionModalOpen) return;
    setPlayerStates(prevStates => 
      prevStates.map(p => 
        !p.isEliminated 
        ? { ...p, mainTimeRemaining: p.mainTimeRemaining + BULK_TIME_ADJUSTMENT_SECONDS } 
        : p
      )
    );
  };

  const handleRemoveBulkTime = () => {
    if (awaitingTimeOutDecisionForPlayerId || isResetConfirmationVisible || isGameCompletionModalOpen) return;
    setPlayerStates(prevStates => 
      prevStates.map(p => 
        !p.isEliminated 
        ? { ...p, mainTimeRemaining: Math.max(0, p.mainTimeRemaining - BULK_TIME_ADJUSTMENT_SECONDS) } 
        : p
      )
    );
  };
  
  const handleAdjustIndividualPlayerTime = (playerId: string, amountInSeconds: number) => {
    if (gameStatus !== 'paused' || awaitingTimeOutDecisionForPlayerId || isResetConfirmationVisible || isGameCompletionModalOpen) return; 
    
    setPlayerStates(prevStates =>
      prevStates.map(p =>
        p.id === playerId && !p.isEliminated
          ? { ...p, mainTimeRemaining: Math.max(0, p.mainTimeRemaining + amountInSeconds) }
          : p
      )
    );
  };

  const handleUndoAction = () => {
    if (gameHistory.length === 0 || awaitingTimeOutDecisionForPlayerId || isResetConfirmationVisible || isGameCompletionModalOpen) return;

    if (tickSoundRef.current && !tickSoundRef.current.paused) stopTickSound();

    const [lastState, ...restHistory] = gameHistory;
    
    setPlayerStates(lastState.playerStates.map(p => ({...p}))); 
    setCurrentPlayerIndex(lastState.activePlayerIndexBeforeSwitch);
    setCurrentRound(lastState.currentRoundBeforeSwitch);
    setElapsedGameTime(lastState.elapsedGameTimeBeforeSwitch);
    setGameHistory(restHistory);
    
    setGameStatus('paused'); 
    setAwaitingTimeOutDecisionForPlayerId(null); 
    setWinner(null); 
  };

  const handleManualEndGame = () => {
    if (gameStatus === 'playing' || gameStatus === 'paused') {
      setGameStatus('paused'); // Ensure game is paused
      if (tickSoundRef.current && !tickSoundRef.current.paused) stopTickSound();
      concludeGame(null, true); // Manually ended, no natural winner
    }
  };
  
  const handleSaveCompletedGame = (gameName?: string, note?: string, winnerId?: string | null) => {
    if (!gameCompletionData) return;

    let actualWinnerName: string | undefined = undefined;
    if (gameCompletionData.manuallyEnded) {
        const selectedWinner = gameCompletionData.playerStates.find(p => p.id === winnerId);
        actualWinnerName = selectedWinner?.name;
    } else {
        actualWinnerName = gameCompletionData.winner?.name;
    }
    
    const record = createGameRecord(
      gameCompletionData.playerStates,
      actualWinnerName,
      gameName,
      note,
      gameCompletionData.gameDuration,
      gameCompletionData.rounds
    );
    const updatedRankings = addRecordToRankings(rankings, record);
    setRankings(updatedRankings);
    saveRankingsToStorage(updatedRankings);

    setIsGameCompletionModalOpen(false);
    setGameCompletionData(null);
    // Reset for a new game
    confirmResetGame(); // This also navigates to 'setup'
  };

  const handleDiscardCompletedGame = () => {
    setIsGameCompletionModalOpen(false);
    setGameCompletionData(null);
    // Reset for a new game
    confirmResetGame(); // This also navigates to 'setup'
  };
  
  const handleClearAllRankings = () => {
    setRankings([]);
    saveRankingsToStorage([]);
  };


  const isGameInteractionDisabled = !!awaitingTimeOutDecisionForPlayerId || isResetConfirmationVisible || isGameCompletionModalOpen;
  const isGameEffectivelyActive = playerStates.length > 0 && (gameStatus === 'playing' || gameStatus === 'paused' || gameStatus === 'completing');


  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col items-center justify-start p-2 sm:p-4">
      <audio ref={alarmSoundRef} id="alarm-sound" src="/alarm.mp3" preload="auto"></audio>
      <audio ref={tickSoundRef} id="tick-sound" src="/tick.mp3" preload="auto"></audio>
      <audio ref={completeSoundRef} id="complete-sound" src="/complete.mp3" preload="auto"></audio>
      
      <AppHeader currentView={currentView} onNavigate={handleNavigate} gameStatus={gameStatus} isGameActive={isGameEffectivelyActive} />

      <main className="w-full max-w-5xl mx-auto flex-grow">
        {currentView === 'setup' && (
          <SettingsScreen
            settings={gameSettings}
            onSettingsChange={handleSettingsChange}
            onPlayerSettingChange={handlePlayerSettingChange}
            onStartGame={handleStartGame}
          />
        )}
        {currentView === 'game' && playerStates.length > 0 && gameStatus !== 'setup' && (
          <GameScreen
            playerStates={playerStates}
            currentPlayerIndex={currentPlayerIndex}
            gameStatus={gameStatus}
            onPlayerAction={handlePlayerAction}
            onPauseResume={handlePauseResume}
            onShowResetConfirmation={handleShowResetConfirmation}
            /* // Reset confirmation is handled by App.tsx now
            onConfirmReset={confirmResetGame} 
            onCancelReset={cancelResetGame}
            isResetConfirmationVisible={isResetConfirmationVisible}
            */
            onUndoAction={handleUndoAction}
            isUndoDisabled={gameHistory.length === 0 || gameStatus === 'completing'}
            // winner={winner} // Winner info now part of completion modal
            volume={volume}
            onVolumeChange={handleVolumeChange}
            elapsedGameTime={elapsedGameTime}
            currentRound={currentRound}
            awaitingTimeOutDecisionForPlayerId={awaitingTimeOutDecisionForPlayerId}
            onEliminatePlayerDecision={handleEliminatePlayerDecision}
            onAddExtraTimeToAllDecision={handleAddExtraTimeToAllDecision}
            onAddBulkTime={handleAddBulkTime}
            onRemoveBulkTime={handleRemoveBulkTime}
            extraTimeAmount={EXTRA_TIME_ON_TIMEOUT_SECONDS}
            bulkTimeAmount={BULK_TIME_ADJUSTMENT_SECONDS}
            onAdjustIndividualPlayerTime={handleAdjustIndividualPlayerTime}
            individualTimeAdjustmentAmount={INDIVIDUAL_TIME_ADJUSTMENT_SECONDS}
            isGameInteractionDisabled={isGameInteractionDisabled}
            onManualEndGame={handleManualEndGame} // New prop
          />
        )}
        {currentView === 'ranking' && (
          <RankingScreen rankings={rankings} onClearAllRankings={handleClearAllRankings} />
        )}
      </main>
      
      <GameCompletionModal 
        isOpen={isGameCompletionModalOpen}
        gameData={gameCompletionData}
        onSave={handleSaveCompletedGame}
        onDiscard={handleDiscardCompletedGame}
      />
       {isResetConfirmationVisible && ( // Keep ResetConfirmationModal rendering logic here if it's global
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4" aria-modal="true" role="dialog">
            <div className="bg-gray-800 p-6 md:p-8 rounded-lg shadow-xl text-center space-y-6 max-w-md w-full">
              <h2 className="text-2xl md:text-3xl font-bold text-yellow-400">Confirmar Reinício</h2>
              <p className="text-lg md:text-xl text-gray-200">
                Tem certeza que deseja reiniciar o jogo? Todo o progresso atual será perdido e não será salvo.
              </p>
              <div className="space-y-3 sm:space-y-0 sm:space-x-4 flex flex-col sm:flex-row justify-center">
                <button onClick={cancelResetGame} className="py-3 px-5 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-md transition text-base md:text-lg">Cancelar</button>
                <button onClick={confirmResetGame} className="py-3 px-5 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-md transition text-base md:text-lg">Confirmar Reinício</button>
              </div>
            </div>
          </div>
        )}

      <footer className="text-center py-4 mt-auto">
        <p className="text-xs text-gray-500">Multi-Player Timer App {APP_VERSION}</p>
      </footer>
    </div>
  );
};

export default App;
