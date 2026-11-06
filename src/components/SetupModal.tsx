import React, { useState } from 'react';
import { ArrowLeft, Bot, Play, User, Users } from 'lucide-react';
import { BotDifficulty, Player, PlayerColor, PlayerType } from '../types/game';
import { soundManager } from '../utils/audio';

interface SetupModalProps {
  initialPreset?: 'pass_play' | 'vs_bot';
  onStartGame: (players: Player[]) => void;
  onClose: () => void;
}

interface PlayerConfig {
  id: PlayerColor;
  name: string;
  type: PlayerType;
  botDifficulty: BotDifficulty;
  avatar: string;
  enabled: boolean;
}

const DEFAULT_CONFIGS: PlayerConfig[] = [
  { id: 'red', name: 'Player 1', type: 'human', botDifficulty: 'tactical', avatar: '🔴', enabled: true },
  { id: 'green', name: 'Player 2', type: 'human', botDifficulty: 'tactical', avatar: '🟢', enabled: true },
  { id: 'yellow', name: 'Player 3', type: 'human', botDifficulty: 'tactical', avatar: '🟡', enabled: true },
  { id: 'blue', name: 'Player 4', type: 'human', botDifficulty: 'tactical', avatar: '🔵', enabled: true },
];

export const SetupModal: React.FC<SetupModalProps> = ({
  initialPreset = 'pass_play',
  onStartGame,
  onClose,
}) => {
  const [playerCount, setPlayerCount] = useState<2 | 3 | 4>(4);
  const [twoPlayerMode, setTwoPlayerMode] = useState<'diagonal' | 'adjacent' | 'two_colors'>('diagonal');

  const [players, setPlayers] = useState<PlayerConfig[]>(() => {
    return DEFAULT_CONFIGS.map((c, idx) => {
      if (initialPreset === 'vs_bot' && c.id !== 'red') {
        return { ...c, type: 'bot', name: `Bot ${c.id.charAt(0).toUpperCase() + c.id.slice(1)}` };
      }
      return { ...c, name: `Player ${idx + 1}` };
    });
  });

  const handlePlayerCountChange = (count: 2 | 3 | 4) => {
    soundManager.playClick();
    setPlayerCount(count);
  };

  const updatePlayer = (index: number, changes: Partial<PlayerConfig>) => {
    setPlayers(prev => {
      const copy = [...prev];
      copy[index] = { ...copy[index], ...changes };
      return copy;
    });
  };

  const handleLaunch = () => {
    soundManager.playClick();

    if (playerCount === 2 && twoPlayerMode === 'two_colors') {
      // 2 Players with 2 Colors Each:
      // Player 1 controls Red and Yellow
      // Player 2 controls Green and Blue
      const p1Cfg = players.find(p => p.id === 'red') || players[0];
      const p2Cfg = players.find(p => p.id === 'yellow') || players[1];

      const fullFour: Player[] = [
        {
          id: 'red',
          name: p1Cfg.name || 'Player 1',
          type: p1Cfg.type,
          botDifficulty: p1Cfg.botDifficulty,
          avatar: '🔴',
          tokens: [0, 1, 2, 3].map(tid => ({ id: tid, color: 'red', step: -1, isHome: false, inYard: true })),
          hasWon: false,
          stats: { sixesRolled: 0, tokensCaptured: 0, tokensLost: 0, tokensHome: 0 },
        },
        {
          id: 'green',
          name: p2Cfg.name || 'Player 2',
          type: p2Cfg.type,
          botDifficulty: p2Cfg.botDifficulty,
          avatar: '🟢',
          tokens: [0, 1, 2, 3].map(tid => ({ id: tid, color: 'green', step: -1, isHome: false, inYard: true })),
          hasWon: false,
          stats: { sixesRolled: 0, tokensCaptured: 0, tokensLost: 0, tokensHome: 0 },
        },
        {
          id: 'yellow',
          name: p1Cfg.name ? `${p1Cfg.name} (Yellow)` : 'Player 1 (Yellow)',
          type: p1Cfg.type,
          botDifficulty: p1Cfg.botDifficulty,
          avatar: '🟡',
          tokens: [0, 1, 2, 3].map(tid => ({ id: tid, color: 'yellow', step: -1, isHome: false, inYard: true })),
          hasWon: false,
          stats: { sixesRolled: 0, tokensCaptured: 0, tokensLost: 0, tokensHome: 0 },
        },
        {
          id: 'blue',
          name: p2Cfg.name ? `${p2Cfg.name} (Blue)` : 'Player 2 (Blue)',
          type: p2Cfg.type,
          botDifficulty: p2Cfg.botDifficulty,
          avatar: '🔵',
          tokens: [0, 1, 2, 3].map(tid => ({ id: tid, color: 'blue', step: -1, isHome: false, inYard: true })),
          hasWon: false,
          stats: { sixesRolled: 0, tokensCaptured: 0, tokensLost: 0, tokensHome: 0 },
        },
      ];
      onStartGame(fullFour);
      return;
    }

    // Standard 1v1 / 3-player / 4-player:
    let activeColors: PlayerColor[] = [];
    if (playerCount === 2) {
      activeColors = twoPlayerMode === 'adjacent' ? ['red', 'green'] : ['red', 'yellow'];
    } else if (playerCount === 3) {
      activeColors = ['red', 'green', 'yellow'];
    } else {
      activeColors = ['red', 'green', 'yellow', 'blue'];
    }

    const finalPlayers: Player[] = activeColors.map((color, orderIndex) => {
      const cfg = players.find(p => p.id === color) || {
        id: color,
        name: `Player ${orderIndex + 1}`,
        type: 'human' as PlayerType,
        botDifficulty: 'tactical' as BotDifficulty,
        avatar: '●',
        enabled: true,
      };

      // Assign friendly default name if empty or generic
      let displayName = cfg.name.trim();
      if (!displayName) {
        displayName = cfg.type === 'bot' ? `Bot ${color}` : `Player ${orderIndex + 1}`;
      }

      return {
        id: color,
        name: displayName,
        type: cfg.type,
        botDifficulty: cfg.botDifficulty,
        avatar: cfg.avatar || (color === 'red' ? '🔴' : color === 'green' ? '🟢' : color === 'yellow' ? '🟡' : '🔵'),
        tokens: [0, 1, 2, 3].map(tid => ({
          id: tid,
          color: color,
          step: -1, // in yard
          isHome: false,
          inYard: true,
        })),
        hasWon: false,
        stats: {
          sixesRolled: 0,
          tokensCaptured: 0,
          tokensLost: 0,
          tokensHome: 0,
        },
      };
    });

    onStartGame(finalPlayers);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-5">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                soundManager.playClick();
                onClose();
              }}
              className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <ArrowLeft size={16} />
            </button>
            <h2 className="text-xl font-bold text-white tracking-tight">Match Setup</h2>
          </div>

          <div className="text-xs text-slate-400 font-medium">
            {initialPreset === 'vs_bot' ? 'Vs Computer' : 'Pass & Play'}
          </div>
        </div>

        {/* Player Count Selection */}
        <div className="mb-6">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
            Number of Players
          </label>
          <div className="grid grid-cols-3 gap-2 p-1 bg-slate-950 rounded-xl border border-slate-800">
            {[2, 3, 4].map(count => (
              <button
                key={count}
                type="button"
                onClick={() => handlePlayerCountChange(count as 2 | 3 | 4)}
                className={`py-2 px-3 rounded-lg text-sm font-semibold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                  playerCount === count
                    ? 'bg-amber-500 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Users size={14} />
                <span>{count} Players</span>
              </button>
            ))}
          </div>

          {playerCount === 2 && (
            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-400 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80">
              <span className="font-medium text-slate-300 w-full sm:w-auto">2-Player Style:</span>
              <button
                type="button"
                onClick={() => setTwoPlayerMode('diagonal')}
                className={`px-2.5 py-1 rounded cursor-pointer transition-colors ${
                  twoPlayerMode === 'diagonal'
                    ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/50'
                    : 'text-slate-400 hover:text-white bg-slate-900 border border-slate-800'
                }`}
              >
                1v1: Red vs Yellow (Classic)
              </button>
              <button
                type="button"
                onClick={() => setTwoPlayerMode('adjacent')}
                className={`px-2.5 py-1 rounded cursor-pointer transition-colors ${
                  twoPlayerMode === 'adjacent'
                    ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/50'
                    : 'text-slate-400 hover:text-white bg-slate-900 border border-slate-800'
                }`}
              >
                1v1: Red vs Green
              </button>
              <button
                type="button"
                onClick={() => setTwoPlayerMode('two_colors')}
                className={`px-2.5 py-1 rounded cursor-pointer transition-colors ${
                  twoPlayerMode === 'two_colors'
                    ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/50'
                    : 'text-slate-400 hover:text-white bg-slate-900 border border-slate-800'
                }`}
              >
                2 Colors Each (Full Board)
              </button>
            </div>
          )}
        </div>

        {/* Player Configurations List */}
        <div className="space-y-3 mb-6">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
            Configure Players
          </label>

          {players.map((p, idx) => {
            const isIncluded =
              playerCount === 4 ||
              (playerCount === 3 && idx < 3) ||
              (playerCount === 2 &&
                (twoPlayerMode === 'two_colors'
                  ? idx === 0 || idx === 1 // Player 1 (Red/Yellow) and Player 2 (Green/Blue)
                  : twoPlayerMode === 'diagonal'
                  ? idx === 0 || idx === 2 // Red and Yellow
                  : idx === 0 || idx === 1)); // Red and Green

            if (!isIncluded) return null;

            const colorBadgeClasses: Record<PlayerColor, string> = {
              red: 'bg-red-500/20 text-red-400 border-red-500/40',
              green: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40',
              yellow: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
              blue: 'bg-blue-500/20 text-blue-400 border-blue-500/40',
            };

            const playerNumberLabel =
              playerCount === 2
                ? idx === 0
                  ? twoPlayerMode === 'two_colors'
                    ? 'P1 (Red + Yellow)'
                    : 'Player 1'
                  : twoPlayerMode === 'two_colors'
                  ? 'P2 (Green + Blue)'
                  : 'Player 2'
                : `Player ${idx + 1}`;

            return (
              <div
                key={p.id}
                className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                {/* Left: Color & Name Input */}
                <div className="flex items-center gap-3">
                  <span
                    className={`px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider border shrink-0 ${
                      colorBadgeClasses[p.id]
                    }`}
                  >
                    {p.id}
                  </span>
                  <input
                    type="text"
                    value={p.name}
                    onChange={e => updatePlayer(idx, { name: e.target.value })}
                    className="bg-slate-900 border border-slate-800 focus:border-amber-500 rounded-lg px-2.5 py-1 text-sm text-white outline-none w-36 sm:w-44"
                    placeholder={playerNumberLabel}
                  />
                </div>

                {/* Right: Human vs Bot Toggle */}
                <div className="flex items-center gap-2">
                  <div className="flex items-center p-0.5 bg-slate-900 rounded-lg border border-slate-800">
                    <button
                      type="button"
                      onClick={() => updatePlayer(idx, { type: 'human' })}
                      className={`px-2.5 py-1 rounded text-xs font-medium transition-colors cursor-pointer flex items-center gap-1 ${
                        p.type === 'human'
                          ? 'bg-slate-800 text-white font-bold'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <User size={12} />
                      <span>Human</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => updatePlayer(idx, { type: 'bot' })}
                      className={`px-2.5 py-1 rounded text-xs font-medium transition-colors cursor-pointer flex items-center gap-1 ${
                        p.type === 'bot'
                          ? 'bg-amber-500 text-slate-950 font-bold'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <Bot size={12} />
                      <span>AI Bot</span>
                    </button>
                  </div>

                  {p.type === 'bot' && (
                    <select
                      value={p.botDifficulty}
                      onChange={e =>
                        updatePlayer(idx, { botDifficulty: e.target.value as BotDifficulty })
                      }
                      className="bg-slate-900 border border-slate-800 text-slate-300 text-xs rounded-lg px-2 py-1 outline-none cursor-pointer"
                    >
                      <option value="casual">Casual</option>
                      <option value="tactical">Tactical</option>
                      <option value="master">Master</option>
                    </select>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Start Game CTA */}
        <button
          type="button"
          onClick={handleLaunch}
          className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-red-600 via-amber-500 to-emerald-600 text-white font-bold text-base shadow-lg hover:shadow-amber-500/20 hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer flex items-center justify-center gap-2"
        >
          <Play size={18} className="fill-white" />
          <span>Start Match</span>
        </button>
      </div>
    </div>
  );
};
