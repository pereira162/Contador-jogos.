import React from 'react';
import { View, GameStatus } from '../types';
import ResetIcon from './icons/ResetIcon'; // Assuming ResetIcon is for setup/config
import PlayIcon from './icons/PlayIcon';
import TrophyIcon from './icons/TrophyIcon';

interface AppHeaderProps {
  currentView: View;
  gameStatus: GameStatus; // To know if a game is active/paused for the "Jogo" tab
  onNavigate: (view: View) => void;
  isGameActive: boolean; // Simplified prop: true if gameStatus is playing, paused, or finished but not yet reset
}

const AppHeader: React.FC<AppHeaderProps> = ({ currentView, onNavigate, isGameActive }) => {
  const navButtonClass = (view: View) =>
    `flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-opacity-75 ${
      currentView === view
        ? 'bg-teal-500 text-white'
        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
    }`;

  return (
    <header className="w-full bg-gray-800 shadow-md p-3 mb-4 md:mb-6">
      <nav className="max-w-5xl mx-auto flex justify-center space-x-2 sm:space-x-4">
        <button onClick={() => onNavigate('setup')} className={navButtonClass('setup')} aria-current={currentView === 'setup' ? 'page' : undefined}>
          <ResetIcon className="w-5 h-5 mr-2" />
          Configurar
        </button>
        
        {isGameActive && (
           <button onClick={() => onNavigate('game')} className={navButtonClass('game')} aria-current={currentView === 'game' ? 'page' : undefined}>
             <PlayIcon className="w-5 h-5 mr-2" />
             Jogo
           </button>
        )}

        <button onClick={() => onNavigate('ranking')} className={navButtonClass('ranking')} aria-current={currentView === 'ranking' ? 'page' : undefined}>
          <TrophyIcon className="w-5 h-5 mr-2" />
          Ranking
        </button>
      </nav>
    </header>
  );
};

export default AppHeader;
