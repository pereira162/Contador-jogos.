import React from 'react';
import { PlayerState, GameStatus } from '../types';
import { formatTime } from '../utils/time';
import StopIcon from './icons/StopIcon';
import PlusIcon from './icons/PlusIcon';
import MinusIcon from './icons/MinusIcon';

interface PlayerCardProps {
  player: PlayerState;
  isActive: boolean; 
  isCurrentGamePlayer: boolean; 
  onPlayerAction: () => void;
  gameStatus: GameStatus;
  isOverlayModalActive: boolean; // This prop now covers all overlay modals including GameCompletionModal
  onAdjustPlayerTime?: (playerId: string, amount: number) => void;
  individualTimeAdjustmentAmount?: number;
  numPlayers: number;
}

const PlayerCard: React.FC<PlayerCardProps> = ({
  player,
  isActive,
  isCurrentGamePlayer,
  onPlayerAction,
  gameStatus,
  isOverlayModalActive, // Used to disable actions when any modal is open
  onAdjustPlayerTime,
  individualTimeAdjustmentAmount,
  numPlayers,
}) => {
  const timeRemaining = player.mainTimeRemaining;
  const isLowTime = !player.isEliminated && timeRemaining <= 60 && timeRemaining > 0;
  const isVeryLowTime = !player.isEliminated && timeRemaining <= 10 && timeRemaining > 0;

  const isDenseLayout = numPlayers >= 7;

  let cardBgColor = 'bg-gray-700';
  let textColor = 'text-white';

  if (player.isEliminated) {
    cardBgColor = 'bg-red-800 opacity-70';
    textColor = 'text-red-300';
  } else if (isActive && gameStatus === 'playing') { // Only green/orange/red if it's their turn and game is playing
    if (isVeryLowTime) {
      cardBgColor = 'bg-red-600 animate-pulse';
    } else if (isLowTime) {
      cardBgColor = 'bg-orange-600';
    } else {
      cardBgColor = 'bg-green-600';
    }
  } else { // Not active turn or game not playing
    if (isLowTime && !player.isEliminated) { // Low time indication even if not active
      cardBgColor = 'bg-yellow-700'; 
    } else {
        cardBgColor = 'bg-gray-700'; // Default for non-active, non-eliminated, not low time
    }
  }

  const canPerformAction = isActive && !player.isEliminated && gameStatus === 'playing' && !isOverlayModalActive; 

  const handleCardClick = () => {
    if (canPerformAction) {
      onPlayerAction();
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (canPerformAction && (event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault();
      onPlayerAction();
    }
  };

  const showIndividualTimeAdjustControls = 
    gameStatus === 'paused' && 
    !player.isEliminated && 
    onAdjustPlayerTime && 
    typeof individualTimeAdjustmentAmount === 'number' &&
    !isOverlayModalActive; // isOverlayModalActive will disable this if any modal is up

  const cardPadding = isDenseLayout ? 'p-2 md:p-4' : 'p-4 md:p-6';
  const cardMinHeight = isDenseLayout ? 'min-h-[150px] md:min-h-[220px]' : 'min-h-[220px] md:min-h-[280px]';
  
  const playerNameSize = isDenseLayout ? 'text-lg md:text-xl' : 'text-xl md:text-2xl';
  const timeTextSize = isDenseLayout ? 'text-4xl md:text-5xl' : 'text-5xl md:text-7xl';
  
  const passTurnButtonPadding = isDenseLayout ? 'py-2 px-2 md:py-3' : 'py-3 px-2';
  const passTurnButtonTextSize = isDenseLayout ? 'text-base md:text-lg' : 'text-lg';
  const passTurnButtonIconSize = isDenseLayout ? 'w-4 h-4 md:w-5 md:h-5' : 'w-5 h-5 sm:w-6 sm:h-6';

  const adjustControlsLabelSize = 'text-xs';
  const adjustControlsButtonPadding = isDenseLayout ? 'p-1 md:p-1.5' : 'p-1.5';
  const adjustControlsIconSize = isDenseLayout ? 'w-3 h-3 md:w-4 md:h-4' : 'w-4 h-4';
  const adjustControlsTimeTextSize = isDenseLayout ? 'text-xs md:text-sm' : 'text-sm';
  const adjustControlsTimeTextWidth = isDenseLayout ? 'w-8 md:w-10' : 'w-10';

  // Determine border based on current game player, but only if game is not in 'completing' status
  // And also ensure player is not eliminated.
  const displayActiveBorder = isCurrentGamePlayer && !player.isEliminated && gameStatus !== 'completing';

  return (
    <div
      className={`rounded-lg shadow-xl transition-all duration-300 ${cardBgColor} flex flex-col justify-between border-2 ${displayActiveBorder ? 'border-yellow-400' : 'border-transparent'} ${canPerformAction ? 'cursor-pointer hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-opacity-75' : ''} ${cardPadding} ${cardMinHeight}`}
      onClick={handleCardClick}
      onKeyDown={handleKeyDown}
      role={canPerformAction ? "button" : "region"}
      tabIndex={canPerformAction ? 0 : -1}
      aria-live="polite"
      aria-atomic="true"
      aria-label={canPerformAction 
        ? `Terminar turno de ${player.name} e passar a vez. Tempo restante: ${formatTime(timeRemaining)}` 
        : player.isEliminated 
          ? `${player.name} (Eliminado)` 
          : `Jogador ${player.name}. Tempo restante: ${formatTime(timeRemaining)}${isCurrentGamePlayer ? '. Jogador atual.' : ''}${gameStatus === 'paused' && isCurrentGamePlayer ? ' Jogo pausado.' : ''}`}
    >
      <div>
        <h2 className={`${playerNameSize} font-bold truncate mb-1 md:mb-2 ${player.isEliminated ? 'line-through ' + textColor : textColor}`}>
          {player.name}
        </h2>
        {player.isEliminated ? (
          <p className={`${timeTextSize} font-mono font-bold ${textColor}`}>ELIMINADO</p>
        ) : (
          <>
            <p className={`${timeTextSize} font-mono font-extrabold my-2 md:my-3 ${textColor} tabular-nums`}>
              {formatTime(timeRemaining)}
            </p>
            {isActive && gameStatus === 'playing' && isLowTime && timeRemaining > 0 && (
                <p className={`text-xs md:text-sm font-semibold ${isVeryLowTime ? 'text-red-200' : 'text-orange-200'} animate-pulse`}>Tempo Baixo!</p>
            )}
          </>
        )}
      </div>
      
      {showIndividualTimeAdjustControls && individualTimeAdjustmentAmount !== undefined && (
        <div className="mt-1 md:mt-2 py-1 md:py-2 border-t border-gray-600 flex justify-evenly items-center space-x-1 md:space-x-2">
          <span className={`${adjustControlsLabelSize} text-gray-300 hidden sm:inline`}>Ajustar:</span>
          <button
            onClick={(e) => { e.stopPropagation(); onAdjustPlayerTime!(player.id, -individualTimeAdjustmentAmount);}}
            className={`${adjustControlsButtonPadding} bg-red-500 hover:bg-red-600 text-white rounded-md transition disabled:opacity-50 flex items-center`}
            aria-label={`Remover ${individualTimeAdjustmentAmount} segundos de ${player.name}`}
            disabled={player.mainTimeRemaining === 0 || isOverlayModalActive} // isOverlayModalActive disables this
          >
            <MinusIcon className={adjustControlsIconSize} />
          </button>
          <span className={`${adjustControlsTimeTextSize} font-mono text-gray-200 tabular-nums ${adjustControlsTimeTextWidth} text-center`}>{individualTimeAdjustmentAmount}s</span>
          <button
            onClick={(e) => { e.stopPropagation(); onAdjustPlayerTime!(player.id, individualTimeAdjustmentAmount);}}
            className={`${adjustControlsButtonPadding} bg-sky-500 hover:bg-sky-600 text-white rounded-md transition disabled:opacity-50 flex items-center`}
            aria-label={`Adicionar ${individualTimeAdjustmentAmount} segundos para ${player.name}`}
            disabled={isOverlayModalActive} // isOverlayModalActive disables this
          >
            <PlusIcon className={adjustControlsIconSize} />
          </button>
        </div>
      )}

      {canPerformAction && (
        <div 
          className={`w-full mt-auto bg-blue-600/90 text-white font-bold rounded-md transition duration-150 ease-in-out flex items-center justify-center shadow-inner ${passTurnButtonPadding} ${passTurnButtonTextSize}`}
          aria-hidden="true" 
        >
          <StopIcon className={`${passTurnButtonIconSize} mr-1 md:mr-2 flex-shrink-0`} />
          <span className="truncate">Passar Vez</span>
        </div>
      )}
       {isActive && !player.isEliminated && gameStatus === 'paused' && !isOverlayModalActive && (
        <div className={`w-full mt-auto ${passTurnButtonPadding} ${passTurnButtonTextSize} bg-gray-500 text-gray-300 font-semibold rounded-md text-center`}>
          Pausado (Turno de {player.name})
        </div>
      )}
       {!isActive && isCurrentGamePlayer && !player.isEliminated && gameStatus === 'paused' && !isOverlayModalActive && (
        <div className={`w-full mt-auto ${passTurnButtonPadding} ${passTurnButtonTextSize} bg-gray-600 text-gray-200 font-semibold rounded-md text-center`}>
          Próximo: {player.name} (Pausado)
        </div>
      )}
    </div>
  );
};

export default PlayerCard;
