import React, { useState, useMemo } from 'react';
import { MatchGroup, GameRecord } from '../types';
import { formatTimeDetailed } from '../utils/time';
import ListIcon from './icons/ListIcon';

interface MatchGroupCardProps {
  group: MatchGroup;
}

const MatchGroupCard: React.FC<MatchGroupCardProps> = ({ group }) => {
  const [showHistory, setShowHistory] = useState(false);

  const winCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    group.representativePlayerNames.forEach(name => {
      // Initialize with original casing, but comparison below is with lowercase
      counts[name.trim().toLowerCase()] = 0; 
    });

    group.games.forEach(game => {
      if (game.winnerName) {
        const winnerKey = game.winnerName.trim().toLowerCase();
        if (counts[winnerKey] !== undefined) {
          counts[winnerKey]++;
        } else {
          // This case might happen if a player name had subtle variations not caught by initial representativePlayerNames
          // For robustness, we find the closest representative name
          const representativeKey = group.representativePlayerNames.find(rn => rn.trim().toLowerCase() === winnerKey);
          if(representativeKey) {
            counts[representativeKey.trim().toLowerCase()]++;
          }
        }
      }
    });
    return counts;
  }, [group]);
  
  // Sort player names for display based on win counts (desc) then alphabetically (asc)
  const sortedPlayerNamesForStats = useMemo(() => {
    return [...group.representativePlayerNames].sort((nameA, nameB) => {
      const winsA = winCounts[nameA.trim().toLowerCase()] || 0;
      const winsB = winCounts[nameB.trim().toLowerCase()] || 0;
      if (winsA !== winsB) {
        return winsB - winsA; // Sort by wins descending
      }
      return nameA.localeCompare(nameB); // Then by name ascending
    });
  }, [group.representativePlayerNames, winCounts]);


  return (
    <div className="bg-gray-700 p-4 md:p-6 rounded-lg shadow-lg">
      <h2 className="text-xl md:text-2xl font-semibold text-sky-300 mb-3 truncate" title={group.representativePlayerNames.join(', ')}>
        Grupo: {group.representativePlayerNames.join(', ')}
      </h2>
      <p className="text-sm text-gray-400 mb-4">Total de Partidas: {group.games.length}</p>

      <div className="mb-4">
        <h3 className="text-lg font-medium text-gray-200 mb-2">Placar de Vitórias:</h3>
        {sortedPlayerNamesForStats.length > 0 ? (
          <ul className="space-y-1">
            {sortedPlayerNamesForStats.map(playerName => (
              <li key={playerName} className="flex justify-between items-center text-gray-300">
                <span className="truncate">{playerName}</span>
                <span className="font-semibold text-teal-400">{winCounts[playerName.trim().toLowerCase()] || 0} vitórias</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-400">Nenhum jogador neste grupo ainda.</p>
        )}
      </div>

      <button
        onClick={() => setShowHistory(!showHistory)}
        className="w-full flex items-center justify-center py-2 px-4 bg-indigo-500 hover:bg-indigo-600 text-white font-semibold rounded-md transition text-sm"
        aria-expanded={showHistory}
        aria-controls={`history-${group.id}`}
      >
        <ListIcon className="w-4 h-4 mr-2"/>
        {showHistory ? 'Ocultar Histórico de Partidas' : 'Mostrar Histórico de Partidas'} ({group.games.length})
      </button>

      {showHistory && (
        <div id={`history-${group.id}`} className="mt-4 space-y-3 max-h-96 overflow-y-auto pr-2">
          {group.games.map((game, index) => (
            <details key={game.id} className="bg-gray-600 p-3 rounded-md group">
              <summary className="text-sm font-medium text-gray-200 cursor-pointer hover:text-sky-300 list-none flex justify-between items-center">
                <span>
                  {game.gameName ? `"${game.gameName}"` : `Partida ${group.games.length - index}`} ({new Date(game.date).toLocaleDateString()})
                  {game.winnerName && <span className="text-xs text-green-400 ml-2">(Vencedor: {game.winnerName})</span>}
                </span>
                <span className="text-xs text-gray-400 group-open:rotate-90 transition-transform duration-200">&#9656;</span>
              </summary>
              <div className="mt-2 text-xs text-gray-300 space-y-1 pl-2 border-l-2 border-gray-500">
                <p><strong>Data:</strong> {new Date(game.date).toLocaleString()}</p>
                <p><strong>Duração:</strong> {formatTimeDetailed(game.gameDuration)}</p>
                <p><strong>Rodadas:</strong> {game.rounds > 1 ? game.rounds -1 : 0}</p>
                {game.winnerName ? <p><strong>Vencedor:</strong> {game.winnerName}</p> : <p><strong>Resultado:</strong> Empate/Sem Vencedor</p>}
                {game.note && <p><strong>Nota:</strong> {game.note}</p>}
                <p className="font-semibold mt-1">Jogadores:</p>
                <ul className="list-disc list-inside ml-2">
                  {game.players.map(p => (
                    <li key={p.id}>{p.name}: {formatTimeDetailed(p.finalTime)}</li>
                  ))}
                </ul>
              </div>
            </details>
          ))}
           {group.games.length === 0 && <p className="text-sm text-gray-400">Nenhuma partida registrada para este grupo.</p>}
        </div>
      )}
    </div>
  );
};

export default MatchGroupCard;
