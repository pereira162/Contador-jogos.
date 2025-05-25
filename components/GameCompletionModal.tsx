import React, { useState, useEffect } from 'react';
import { PlayerState, GameCompletionData } from '../types';
import SaveIcon from './icons/SaveIcon';
import ResetIcon from './icons/ResetIcon'; // For "Descartar"

interface GameCompletionModalProps {
  isOpen: boolean;
  gameData: GameCompletionData | null;
  onSave: (gameName?: string, note?: string, winnerId?: string | null) => void; // winnerId null for draw, undefined if pre-determined
  onDiscard: () => void;
}

const GameCompletionModal: React.FC<GameCompletionModalProps> = ({
  isOpen,
  gameData,
  onSave,
  onDiscard,
}) => {
  const [gameName, setGameName] = useState('');
  const [note, setNote] = useState('');
  const [selectedWinnerId, setSelectedWinnerId] = useState<string | null | undefined>(undefined); // string for player, null for draw/no winner

  useEffect(() => {
    if (gameData) {
      setGameName('');
      setNote('');
      if (gameData.manuallyEnded) {
        setSelectedWinnerId(null); // Default to "No Winner" for manual end
      } else {
        setSelectedWinnerId(gameData.winner?.id); // Pre-select if winner is known
      }
    }
  }, [gameData]);

  if (!isOpen || !gameData) return null;

  const { playerStates, winner, manuallyEnded, gameDuration, rounds } = gameData;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(gameName, note, manuallyEnded ? selectedWinnerId : winner?.id);
  };
  
  const naturalWinnerName = !manuallyEnded && winner ? winner.name : ( !manuallyEnded && !winner ? "Empate" : null);


  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4" aria-modal="true" role="dialog">
      <form onSubmit={handleSubmit} className="bg-gray-800 p-6 md:p-8 rounded-lg shadow-xl space-y-6 max-w-lg w-full">
        <h2 className="text-2xl md:text-3xl font-bold text-teal-400 text-center">Partida Concluída!</h2>
        
        <div className="text-center text-gray-300">
            <p>Duração: {new Date(gameDuration * 1000).toISOString().substr(11, 8)}</p>
            <p>Rodadas: {rounds > 1 ? rounds -1 : 0 }</p>
        </div>

        {manuallyEnded ? (
          <div>
            <label htmlFor="winnerSelect" className="block text-sm font-medium text-gray-300 mb-1">Selecionar Vencedor:</label>
            <select
              id="winnerSelect"
              value={selectedWinnerId === null ? 'no_winner' : selectedWinnerId || ''}
              onChange={(e) => setSelectedWinnerId(e.target.value === 'no_winner' ? null : e.target.value)}
              className="w-full p-3 bg-gray-700 border border-gray-600 rounded-md focus:ring-teal-500 focus:border-teal-500 transition"
            >
              <option value="no_winner">Sem Vencedor / Empate</option>
              {playerStates.filter(p => !p.isEliminated || p.mainTimeRemaining > 0).map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
        ) : (
          naturalWinnerName && <p className="text-xl text-center font-semibold text-green-400">Vencedor: {naturalWinnerName}</p>
        )}

        <div>
          <label htmlFor="gameName" className="block text-sm font-medium text-gray-300 mb-1">Nome da Partida (Opcional):</label>
          <input
            type="text"
            id="gameName"
            value={gameName}
            onChange={(e) => setGameName(e.target.value)}
            className="w-full p-3 bg-gray-700 border border-gray-600 rounded-md focus:ring-teal-500 focus:border-teal-500 transition"
            placeholder="Ex: Xadrez Semanal"
            maxLength={50}
          />
        </div>

        <div>
          <label htmlFor="note" className="block text-sm font-medium text-gray-300 mb-1">Anotações (Opcional):</label>
          <textarea
            id="note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            className="w-full p-3 bg-gray-700 border border-gray-600 rounded-md focus:ring-teal-500 focus:border-teal-500 transition"
            placeholder="Ex: Jogada incrível do Lucas na rodada 5!"
            maxLength={200}
          />
        </div>

        <div className="flex flex-col sm:flex-row justify-around space-y-3 sm:space-y-0 sm:space-x-4 pt-2">
          <button
            type="button"
            onClick={onDiscard}
            className="py-3 px-5 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-md transition text-base md:text-lg flex items-center justify-center"
            aria-label="Descartar informações e iniciar novo jogo"
          >
            <ResetIcon className="w-5 h-5 mr-2" />
            Descartar e Novo Jogo
          </button>
          <button
            type="submit"
            className="py-3 px-5 bg-teal-500 hover:bg-teal-600 text-white font-semibold rounded-md transition text-base md:text-lg flex items-center justify-center"
            aria-label="Salvar informações da partida"
          >
            <SaveIcon className="w-5 h-5 mr-2" />
            Salvar Partida
          </button>
        </div>
      </form>
    </div>
  );
};

export default GameCompletionModal;
