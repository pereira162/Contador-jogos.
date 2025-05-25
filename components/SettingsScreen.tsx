import React from 'react';
import { PlayerSetting, GameSettings } from '../types';

interface SettingsScreenProps {
  settings: GameSettings;
  onSettingsChange: <K extends keyof GameSettings>(key: K, value: GameSettings[K]) => void;
  onPlayerSettingChange: (index: number, field: keyof PlayerSetting, value: string | number) => void;
  onStartGame: () => void;
}

const SettingsScreen: React.FC<SettingsScreenProps> = ({
  settings,
  onSettingsChange,
  onPlayerSettingChange,
  onStartGame,
}) => {
  const handleNumPlayersChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newNumPlayers = parseInt(e.target.value, 10);
    const currentPlayers = settings.players;
    const newPlayers: PlayerSetting[] = Array.from({ length: newNumPlayers }, (_, i) => {
      return currentPlayers[i] || {
        id: crypto.randomUUID(),
        name: `Jogador ${i + 1}`,
        initialTimeMinutes: 10, // Ensure new players also get 10 min default
        initialTimeSeconds: 0,
      };
    });
    onSettingsChange('numPlayers', newNumPlayers);
    onSettingsChange('players', newPlayers);
  };

  const handlePlayerDetailChange = (
    index: number,
    field: keyof PlayerSetting,
    value: string
  ) => {
    if (field === 'name') {
      onPlayerSettingChange(index, field, value);
    } else {
      const numValue = parseInt(value, 10);
      if (!isNaN(numValue) && numValue >= 0) {
        if ((field === 'initialTimeMinutes' && numValue <= 999) || (field === 'initialTimeSeconds' && numValue <= 59)) {
           onPlayerSettingChange(index, field, numValue);
        }
      } else if (value === '') {
         onPlayerSettingChange(index, field, 0);
      }
    }
  };
  
  const handleIncrementChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
     if (!isNaN(value) && value >= 0 && value <= 300) { // Max 5 mins increment
        onSettingsChange('incrementPerMove', value);
    } else if (e.target.value === '') {
        onSettingsChange('incrementPerMove', 0);
    }
  };

  const canStartGame = settings.players.every(p => p.name.trim() !== '' && (p.initialTimeMinutes * 60 + p.initialTimeSeconds > 0 || settings.incrementPerMove > 0));

  return (
    <div className="p-4 md:p-8 bg-gray-800 text-white rounded-lg shadow-xl max-w-2xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold text-center text-teal-400 mb-6">Configurações do Jogo</h1>

      <div className="space-y-2">
        <label htmlFor="numPlayers" className="block text-sm font-medium text-gray-300">Número de Jogadores:</label>
        <select
          id="numPlayers"
          value={settings.numPlayers}
          onChange={handleNumPlayersChange}
          className="w-full p-3 bg-gray-700 border border-gray-600 rounded-md focus:ring-teal-500 focus:border-teal-500 transition"
        >
          {[2, 3, 4, 5, 6, 7, 8].map(n => <option key={n} value={n}>{n} jogadores</option>)}
        </select>
      </div>

      <div className="space-y-4">
        {settings.players.map((player, index) => (
          <div key={player.id} className="p-4 bg-gray-700 rounded-md border border-gray-600 space-y-3">
            <h3 className="text-lg font-semibold text-teal-300">Jogador {index + 1}</h3>
            <div>
              <label htmlFor={`playerName-${index}`} className="block text-xs font-medium text-gray-400">Nome:</label>
              <input
                type="text"
                id={`playerName-${index}`}
                value={player.name}
                onChange={(e) => handlePlayerDetailChange(index, 'name', e.target.value)}
                className="w-full p-2 bg-gray-600 border border-gray-500 rounded-md focus:ring-teal-500 focus:border-teal-500 transition"
                maxLength={20}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor={`playerTimeMin-${index}`} className="block text-xs font-medium text-gray-400">Minutos Iniciais:</label>
                <input
                  type="number"
                  id={`playerTimeMin-${index}`}
                  value={player.initialTimeMinutes}
                  min="0"
                  max="999"
                  onChange={(e) => handlePlayerDetailChange(index, 'initialTimeMinutes', e.target.value)}
                  className="w-full p-2 bg-gray-600 border border-gray-500 rounded-md focus:ring-teal-500 focus:border-teal-500 transition"
                />
              </div>
              <div>
                <label htmlFor={`playerTimeSec-${index}`} className="block text-xs font-medium text-gray-400">Segundos Iniciais:</label>
                <input
                  type="number"
                  id={`playerTimeSec-${index}`}
                  value={player.initialTimeSeconds}
                  min="0"
                  max="59"
                  onChange={(e) => handlePlayerDetailChange(index, 'initialTimeSeconds', e.target.value)}
                  className="w-full p-2 bg-gray-600 border border-gray-500 rounded-md focus:ring-teal-500 focus:border-teal-500 transition"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="space-y-2">
        <label htmlFor="incrementPerMove" className="block text-sm font-medium text-gray-300">Acréscimo por Jogada (em segundos):</label>
        <input
          type="number"
          id="incrementPerMove"
          value={settings.incrementPerMove}
          min="0"
          max="300"
          onChange={handleIncrementChange}
          className="w-full p-3 bg-gray-700 border border-gray-600 rounded-md focus:ring-teal-500 focus:border-teal-500 transition"
        />
        <p className="text-xs text-gray-400">0 para desabilitar. Adicionado ao tempo do jogador após cada jogada.</p>
      </div>

      <button
        onClick={onStartGame}
        disabled={!canStartGame}
        className={`w-full py-3 px-4 font-semibold rounded-md transition text-lg
                    ${canStartGame 
                      ? 'bg-teal-500 hover:bg-teal-600 text-white' 
                      : 'bg-gray-600 text-gray-400 cursor-not-allowed'}`}
      >
        Iniciar Novo Jogo
      </button>
      {!canStartGame && <p className="text-xs text-red-400 text-center">Todos os jogadores devem ter nome. O tempo inicial pode ser 0 se houver acréscimo.</p>}
    </div>
  );
};

export default SettingsScreen;
