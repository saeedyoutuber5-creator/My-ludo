import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Crown, RotateCcw, Home, Trophy, Swords, Sparkles } from 'lucide-react';
import { Player } from '../types/game';
import { soundManager } from '../utils/audio';

interface VictoryModalProps {
  winner: Player;
  allPlayers: Player[];
  onPlayAgain: () => void;
  onMainMenu: () => void;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({
  winner,
  allPlayers,
  onPlayAgain,
  onMainMenu,
}) => {
  useEffect(() => {
    soundManager.playVictory();

    // Confetti cannon blast
    try {
      const end = Date.now() + 3000;
      const colors = ['#ef4444', '#10b981', '#f59e0b', '#3b82f6'];

      const frame = () => {
        confetti({
          particleCount: 4,
          angle: 60,
          spread: 55,
          origin: { x: 0, y: 0.7 },
          colors,
        });
        confetti({
          particleCount: 4,
          angle: 120,
          spread: 55,
          origin: { x: 1, y: 0.7 },
          colors,
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };
      frame();
    } catch {
      // Ignore if confetti fails in headless env
    }
  }, []);

  // Sort players by home tokens descending
  const rankedPlayers = [...allPlayers].sort((a, b) => {
    const aHome = a.tokens.filter(t => t.isHome).length;
    const bHome = b.tokens.filter(t => t.isHome).length;
    if (a.hasWon && !b.hasWon) return -1;
    if (!a.hasWon && b.hasWon) return 1;
    return bHome - aHome;
  });

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-6 sm:p-8 text-center animate-in fade-in zoom-in-95 duration-200">
        {/* Glowing Trophy Icon */}
        <div className="relative mx-auto w-20 h-20 mb-4 flex items-center justify-center">
          <div className="absolute inset-0 bg-amber-500/20 rounded-full blur-xl animate-pulse" />
          <div className="relative w-20 h-20 rounded-full bg-gradient-to-tr from-amber-600 via-amber-400 to-yellow-200 flex items-center justify-center shadow-lg border-2 border-amber-300">
            <Trophy size={40} className="text-slate-950 fill-slate-950" />
          </div>
        </div>

        <span className="text-xs font-bold uppercase tracking-widest text-amber-400 mb-1 block">
          Match Finished
        </span>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-2">
          {winner.name} Wins!
        </h2>
        <p className="text-sm text-slate-400 max-w-xs mx-auto mb-6">
          All 4 tokens reached home safely! Outstanding strategy and board mastery.
        </p>

        {/* Podium Standings */}
        <div className="bg-slate-950/80 rounded-2xl p-4 border border-slate-800/80 mb-6 text-left">
          <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
            Final Standings
          </span>

          <div className="space-y-2">
            {rankedPlayers.map((player, idx) => {
              const homeCount = player.tokens.filter(t => t.isHome).length;
              return (
                <div
                  key={player.id}
                  className={`flex items-center justify-between p-2.5 rounded-xl border ${
                    idx === 0
                      ? 'bg-amber-500/10 border-amber-500/30'
                      : 'bg-slate-900/60 border-slate-800/80'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        idx === 0
                          ? 'bg-amber-400 text-slate-950'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {idx === 0 ? <Crown size={12} className="fill-slate-950" /> : idx + 1}
                    </span>
                    <span className="font-semibold text-sm text-slate-200">
                      {player.name}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-slate-400 font-mono">
                    <span className="flex items-center gap-1">
                      <Swords size={12} className="text-slate-500" />
                      {player.stats.tokensCaptured} captures
                    </span>
                    <span>·</span>
                    <span className="text-amber-400 font-bold">
                      {homeCount}/4 Home
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => {
              soundManager.playClick();
              onPlayAgain();
            }}
            className="py-3 px-4 rounded-xl bg-gradient-to-r from-red-600 via-amber-500 to-emerald-600 text-white font-bold text-sm shadow-lg hover:shadow-amber-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <RotateCcw size={16} />
            <span>Play Again</span>
          </button>

          <button
            type="button"
            onClick={() => {
              soundManager.playClick();
              onMainMenu();
            }}
            className="py-3 px-4 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 font-semibold text-sm hover:text-white hover:bg-slate-700 transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <Home size={16} />
            <span>Main Menu</span>
          </button>
        </div>
      </div>
    </div>
  );
};
