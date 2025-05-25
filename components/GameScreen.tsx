import React from 'react';
import { PlayerState, GameStatus } from '../types';
import PlayerCard from './PlayerCard';
import PlayIcon from './icons/PlayIcon';
import PauseIcon from './icons/PauseIcon';
import ResetIcon from './icons/ResetIcon';
import UndoIcon from './icons/UndoIcon';
import StopIcon from './icons/StopIcon'; // For "Finalizar Jogo"
import { formatTimeDetailed } from '../utils/time';
import PlusIcon from './icons/PlusIcon'; 
import MinusIcon from './icons/MinusIcon'; 

interface GameScreenProps {
  playerStates: PlayerState[];
  currentPlayerIndex: number | null;
  gameStatus: GameStatus;
  onPlayerAction: () => void;
  onPauseResume: () => void;
  onShowResetConfirmation: () => void; 
  onUndoAction: () => void;
  isUndoDisabled: boolean;
  volume: number;
  onVolumeChange: (volume: number) => void;
  elapsedGameTime: number;
  currentRound: number;
  awaitingTimeOutDecisionForPlayerId: string | null;
  onEliminatePlayerDecision: () => void;
  onAddExtraTimeToAllDecision: () => void;
  onAddBulkTime: () => void;
  onRemoveBulkTime: () => void;
  extraTimeAmount: number;
  bulkTimeAmount: number;
  onAdjustIndividualPlayerTime: (playerId: string, amount: number) => void;
  individualTimeAdjustmentAmount: number;
  isGameInteractionDisabled: boolean;
  onManualEndGame: () => void; // New prop
}

const TimeOutDecisionModal: React.FC<{
  playerName: string;
  onEliminate: () => void;
  onAddTime: () => void;
  extraTimeAmount: number;
}> = ({ playerName, onEliminate, onAddTime, extraTimeAmount }) => (
  <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4" aria-modal="true" role="dialog">
    <div className="bg-gray-800 p-6 md:p-8 rounded-lg shadow-xl text-center space-y-6 max-w-md w-full">
      <h2 className="text-2xl md:text-3xl font-bold text-yellow-400">Tempo Esgotado!</h2>
      <p className="text-lg md:text-xl text-gray-200">
        O tempo de <span className="font-semibold">{playerName}</span> acabou.
      </p>
      <div className="space-y-3 sm:space-y-0 sm:space-x-4 flex flex-col sm:flex-row justify-center">
        <button
          onClick={onEliminate}
          className="py-3 px-5 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-md transition text-base md:text-lg"
          aria-label={`Eliminar ${playerName}`}
        >
          Eliminar {playerName}
        </button>
        <button
          onClick={onAddTime}
          className="py-3 px-5 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-md transition text-base md:text-lg"
          aria-label={`Adicionar ${extraTimeAmount}s para todos e continuar`}
        >
          + {extraTimeAmount}s para Todos & Continuar
        </button>
      </div>
    </div>
  </div>
);

// ResetConfirmationModal is now managed globally in App.tsx

const BulkTimeAdjustmentControls: React.FC<{
  onAddTime: () => void;
  onRemoveTime: () => void;
  isDisabled: boolean;
  bulkTimeAmount: number;
}> = ({ onAddTime, onRemoveTime, isDisabled, bulkTimeAmount }) => (
  <div className="mt-4 md:mt-6 flex flex-col sm:flex-row justify-center items-center space-y-3 sm:space-y-0 sm:space-x-3">
    <p className="text-sm text-gray-400 sm:mr-2">Ajustar tempo de todos:</p>
    <div className="flex space-x-3">
      <button
        onClick={onRemoveTime}
        disabled={isDisabled}
        className={`py-2 px-4 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-md transition text-sm flex items-center justify-center ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        aria-label={`Remover ${bulkTimeAmount} segundos do tempo de todos os jogadores ativos`}
      >
        <MinusIcon className="w-4 h-4 mr-1" /> {bulkTimeAmount}s
      </button>
      <button
        onClick={onAddTime}
        disabled={isDisabled}
        className={`py-2 px-4 bg-sky-500 hover:bg-sky-600 text-white font-semibold rounded-md transition text-sm flex items-center justify-center ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        aria-label={`Adicionar ${bulkTimeAmount} segundos ao tempo de todos os jogadores ativos`}
      >
        <PlusIcon className="w-4 h-4 mr-1" /> {bulkTimeAmount}s
      </button>
    </div>
  </div>
);


const GameScreen: React.FC<GameScreenProps> = ({
  playerStates,
  currentPlayerIndex,
  gameStatus,
  onPlayerAction,
  onPauseResume,
  onShowResetConfirmation,
  onUndoAction,
  isUndoDisabled,
  volume,
  onVolumeChange,
  elapsedGameTime,
  currentRound,
  awaitingTimeOutDecisionForPlayerId,
  onEliminatePlayerDecision,
  onAddExtraTimeToAllDecision,
  onAddBulkTime,
  onRemoveBulkTime,
  extraTimeAmount,
  bulkTimeAmount,
  onAdjustIndividualPlayerTime,
  individualTimeAdjustmentAmount,
  isGameInteractionDisabled,
  onManualEndGame,
}) => {
  const numPlayers = playerStates.length;
  let dynamicGridClasses: string;

  if (numPlayers === 1) {
    dynamicGridClasses = "grid-cols-1";
  } else if (numPlayers === 2) {
    dynamicGridClasses = "grid-cols-1 sm:grid-cols-2"; 
  } else if (numPlayers === 3) {
    dynamicGridClasses = "grid-cols-1 sm:grid-cols-2 md:grid-cols-3"; 
  } else if (numPlayers === 4) {
    dynamicGridClasses = "grid-cols-2 md:grid-cols-4"; 
  } else if (numPlayers === 5) {
    dynamicGridClasses = "grid-cols-2 md:grid-cols-3"; 
  } else if (numPlayers === 6) {
    dynamicGridClasses = "grid-cols-2 sm:grid-cols-3"; 
  } else if (numPlayers === 7) {
    dynamicGridClasses = "grid-cols-2 md:grid-cols-4";
  } else if (numPlayers >= 8) { 
    dynamicGridClasses = "grid-cols-2 sm:grid-cols-4"; 
  } else { 
    dynamicGridClasses = "grid-cols-1 md:grid-cols-3";
  }

  const playerOutOfTime = awaitingTimeOutDecisionForPlayerId
    ? playerStates.find(p => p.id === awaitingTimeOutDecisionForPlayerId)
    : null;

  // The 'finished' state is now handled by the GameCompletionModal triggered from App.tsx
  // No specific UI needed here for 'finished' anymore. The GameScreen will typically not be shown
  // or will be overlaid when gameStatus is 'completing' or 'finished' (handled by App.tsx view logic).

  return (
    <div className="p-2 md:p-4 space-y-4 md:space-y-6 w-full">
      {playerOutOfTime && (
        <TimeOutDecisionModal
          playerName={playerOutOfTime.name}
          onEliminate={onEliminatePlayerDecision}
          onAddTime={onAddExtraTimeToAllDecision}
          extraTimeAmount={extraTimeAmount}
        />
      )}
      {/* ResetConfirmationModal is now rendered in App.tsx */}

      <div className="mb-4 text-center space-y-1">
        <p className="text-xl md:text-2xl text-teal-300 font-semibold">
          Tempo de Jogo: <span className="font-mono">{formatTimeDetailed(elapsedGameTime)}</span>
        </p>
        <p className="text-lg md:text-xl text-sky-300">
          Rodada: <span className="font-mono">{currentRound}</span>
        </p>
      </div>

      <div className={`grid ${dynamicGridClasses} gap-2 md:gap-4`}>
        {playerStates.map((player, index) => (
          <PlayerCard
            key={player.id}
            player={player}
            isActive={index === currentPlayerIndex && gameStatus === 'playing'}
            isCurrentGamePlayer={index === currentPlayerIndex}
            onPlayerAction={onPlayerAction}
            gameStatus={gameStatus}
            isOverlayModalActive={isGameInteractionDisabled} // This prop now covers all modals
            onAdjustPlayerTime={onAdjustIndividualPlayerTime}
            individualTimeAdjustmentAmount={individualTimeAdjustmentAmount}
            numPlayers={numPlayers}
          />
        ))}
      </div>
      <div className="flex flex-wrap justify-center items-center gap-3 mt-4 md:mt-6">
        <button
          onClick={onPauseResume}
          disabled={isGameInteractionDisabled || gameStatus === 'completing'}
          className={`py-3 px-5 bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-semibold rounded-md transition text-lg flex items-center justify-center ${(isGameInteractionDisabled || gameStatus === 'completing') ? 'opacity-50 cursor-not-allowed' : ''}`}
          aria-label={gameStatus === 'playing' ? 'Pausar jogo' : 'Continuar jogo'}
        >
          {gameStatus === 'playing' ? <PauseIcon className="w-5 h-5 mr-2" /> : <PlayIcon className="w-5 h-5 mr-2" />}
          {gameStatus === 'playing' ? 'Pausar' : (gameStatus === 'paused' ? 'Continuar' : 'Pausado')}
        </button>
        <button
          onClick={onShowResetConfirmation}
          disabled={isGameInteractionDisabled}
          className={`py-3 px-5 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-md transition text-lg flex items-center justify-center ${isGameInteractionDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          aria-label="Reiniciar jogo e voltar para configurações"
        >
          <ResetIcon className="w-5 h-5 mr-2" />
          Reiniciar
        </button>
      </div>

      <BulkTimeAdjustmentControls
        onAddTime={onAddBulkTime}
        onRemoveTime={onRemoveBulkTime}
        isDisabled={isGameInteractionDisabled || gameStatus === 'completing'}
        bulkTimeAmount={bulkTimeAmount}
      />
      
      <div className="mt-4 md:mt-6 flex flex-col sm:flex-row justify-center items-center gap-3">
         <button
          onClick={onUndoAction}
          disabled={isUndoDisabled || isGameInteractionDisabled || gameStatus === 'completing'}
          className={`py-3 px-5 bg-indigo-500 hover:bg-indigo-600 text-white font-semibold rounded-md transition text-lg flex items-center justify-center ${(isUndoDisabled || isGameInteractionDisabled || gameStatus === 'completing') ? 'opacity-50 cursor-not-allowed' : ''}`}
          aria-label="Desfazer última jogada"
        >
          <UndoIcon className="w-5 h-5 mr-2" />
          Desfazer Jogada
        </button>
        <button
          onClick={onManualEndGame}
          disabled={isGameInteractionDisabled || gameStatus === 'completing' || playerStates.length === 0}
          className={`py-3 px-5 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-md transition text-lg flex items-center justify-center ${(isGameInteractionDisabled || gameStatus === 'completing' || playerStates.length === 0) ? 'opacity-50 cursor-not-allowed' : ''}`}
          aria-label="Finalizar jogo manualmente e salvar resultado"
        >
          <StopIcon className="w-5 h-5 mr-2" />
          Finalizar Jogo
        </button>
      </div>

      <div className="mt-6 flex flex-col items-center space-y-2">
        <label htmlFor="volumeControl" className="text-sm font-medium text-gray-300">Volume dos Alarmes:</label>
        <input
            type="range"
            id="volumeControl"
            min="0"
            max="1"
            step="0.05"
            value={volume}
            onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
            disabled={isGameInteractionDisabled || gameStatus === 'completing'}
            className={`w-full max-w-xs h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-teal-500 ${(isGameInteractionDisabled || gameStatus === 'completing') ? 'opacity-50 cursor-not-allowed' : ''}`}
            aria-label="Controlar volume do alarme"
        />
         <span className="text-xs text-gray-400">{(volume * 100).toFixed(0)}%</span>
      </div>
    </div>
  );
};

export default GameScreen;
