import React, { useState } from 'react';
import { MatchGroup } from '../types';
import MatchGroupCard from './MatchGroupCard';

interface RankingScreenProps {
  rankings: MatchGroup[];
  onClearAllRankings: () => void; // Added for clearing data
}

const RankingScreen: React.FC<RankingScreenProps> = ({ rankings, onClearAllRankings }) => {
  const [confirmClear, setConfirmClear] = useState(false);

  const handleClearRankings = () => {
    if (confirmClear) {
      onClearAllRankings();
      setConfirmClear(false);
    } else {
      setConfirmClear(true);
    }
  };
  
  if (rankings.length === 0) {
    return (
      <div className="p-4 md:p-8 bg-gray-800 text-white rounded-lg shadow-xl max-w-3xl mx-auto text-center">
        <h1 className="text-3xl font-bold text-teal-400 mb-6">Ranking de Partidas</h1>
        <p className="text-xl text-gray-300">Nenhuma partida foi salva ainda.</p>
        <p className="text-md text-gray-400 mt-2">Jogue algumas partidas e salve os resultados para ver o ranking aqui!</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 bg-gray-800 text-white rounded-lg shadow-xl max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-teal-400">Ranking de Partidas</h1>
        {rankings.length > 0 && (
            <div className="mt-4 sm:mt-0">
            {confirmClear ? (
                <div className="flex items-center space-x-2">
                    <span className="text-sm text-red-400">Certeza?</span>
                    <button onClick={handleClearRankings} className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-xs rounded-md">Sim, Apagar</button>
                    <button onClick={() => setConfirmClear(false)} className="px-3 py-1 bg-gray-600 hover:bg-gray-500 text-white text-xs rounded-md">Cancelar</button>
                </div>
            ) : (
                <button
                onClick={handleClearRankings}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-md transition text-sm"
                >
                Limpar Todos os Rankings
                </button>
            )}
            </div>
        )}
      </div>


      <div className="space-y-8">
        {rankings.map(group => (
          <MatchGroupCard key={group.id} group={group} />
        ))}
      </div>
    </div>
  );
};

export default RankingScreen;
