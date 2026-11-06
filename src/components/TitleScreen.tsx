import React, { useEffect } from 'react';
import { Volume2, VolumeX, Sparkles, Users, Bot, Zap, BookOpen, Settings } from 'lucide-react';
import { BoardTheme, GameSettings } from '../types/game';
import { soundManager } from '../utils/audio';

interface TitleScreenProps {
  onStartQuickPlay: () => void;
  onStartTwoPlayerVsBot: () => void;
  onStartTwoPlayerPassPlay: () => void;
  onOpenSetup: (preset?: 'pass_play' | 'vs_bot') => void;
  onOpenRules: () => void;
  settings: GameSettings;
  onUpdateSettings: (newSettings: Partial<GameSettings>) => void;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({
  onStartQuickPlay,
  onStartTwoPlayerVsBot,
  onStartTwoPlayerPassPlay,
  onOpenSetup,
  onOpenRules,
  settings,
  onUpdateSettings,
}) => {
  // Support Space / Enter keyboard shortcut to start immediately
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'Enter') {
        soundManager.playClick();
        onStartTwoPlayerVsBot();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onStartTwoPlayerVsBot]);

  return (
    <div className="relative w-full h-full min-h-screen bg-slate-950 flex flex-col items-center justify-between p-6 overflow-hidden select-none">
      {/* Ambient background decoration with subtle quadrant color glows */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-red-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -top-32 -right-32 w-96 h-96 bg-emerald-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />

      {/* Top Bar Utilities */}
      <div className="w-full max-w-4xl flex items-center justify-between z-10">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
          <span>Offline Multiplayer</span>
          <span>·</span>
          <span>Authentic Rules</span>
        </div>

        <div className="flex items-center gap-3">
          {/* Audio toggle */}
          <button
            type="button"
            onClick={() => {
              const next = !settings.soundEnabled;
              soundManager.setMuted(!next);
              onUpdateSettings({ soundEnabled: next });
              soundManager.playClick();
            }}
            className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition-colors cursor-pointer"
            title={settings.soundEnabled ? 'Mute Sound' : 'Enable Sound'}
          >
            {settings.soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
          </button>

          {/* Rules Button */}
          <button
            type="button"
            onClick={() => {
              soundManager.playClick();
              onOpenRules();
            }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-medium text-slate-300 hover:text-white hover:border-slate-700 transition-colors cursor-pointer"
          >
            <BookOpen size={15} />
            <span>Rules</span>
          </button>
        </div>
      </div>

      {/* Hero Centerpiece: Bespoke Title Lockup with 30-40% negative space */}
      <div className="flex flex-col items-center justify-center my-auto z-10 text-center max-w-xl">
        {/* Animated Board Miniature Icon */}
        <div className="relative mb-6">
          <div className="w-24 h-24 rounded-2xl bg-slate-900 border border-slate-800 p-2 shadow-2xl grid grid-cols-2 grid-rows-2 gap-1.5">
            <div className="rounded-lg bg-red-500 shadow-sm flex items-center justify-center text-xs font-black text-white">●</div>
            <div className="rounded-lg bg-emerald-500 shadow-sm flex items-center justify-center text-xs font-black text-white">●</div>
            <div className="rounded-lg bg-blue-500 shadow-sm flex items-center justify-center text-xs font-black text-white">●</div>
            <div className="rounded-lg bg-amber-400 shadow-sm flex items-center justify-center text-xs font-black text-slate-900">●</div>
          </div>
          <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-amber-400 text-slate-950 font-black flex items-center justify-center shadow-lg text-xs animate-bounce">
            🎲
          </div>
        </div>

        {/* Bespoke inline SVG Title Lockup */}
        <div className="relative mb-2">
          <svg className="w-72 sm:w-88 h-16 sm:h-20" viewBox="0 0 360 80">
            <defs>
              <linearGradient id="ludoGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#ef4444" />
                <stop offset="35%" stopColor="#10b981" />
                <stop offset="70%" stopColor="#f59e0b" />
                <stop offset="100%" stopColor="#3b82f6" />
              </linearGradient>
            </defs>
            <text
              x="50%"
              y="58"
              textAnchor="middle"
              className="font-extrabold text-[44px] sm:text-[50px] tracking-tight"
              fill="url(#ludoGradient)"
              style={{
                fontFamily: 'Outfit, system-ui, sans-serif',
                filter: 'drop-shadow(0 4px 16px rgba(245, 158, 11, 0.3))',
              }}
            >
              MY LUDO
            </text>
          </svg>
        </div>

        <p className="text-slate-400 text-sm sm:text-base max-w-md mx-auto mb-6 font-normal">
          The ultimate offline board game. Real 2-player 1v1 duels, 4-player matches, tactical AI bots, and authentic 3D Ludo pawns.
        </p>

        {/* Primary Action Buttons */}
        <div className="w-full max-w-sm flex flex-col gap-2.5">
          {/* Quick 2-Player (You vs Bot) Primary CTA */}
          <button
            type="button"
            onClick={() => {
              soundManager.playClick();
              onStartTwoPlayerVsBot();
            }}
            className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-red-600 via-amber-500 to-yellow-500 text-slate-950 font-extrabold text-base shadow-xl hover:shadow-amber-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2 group"
          >
            <Zap size={18} className="fill-slate-950 group-hover:rotate-12 transition-transform" />
            <span>2 Players: You vs Bot (1v1)</span>
          </button>

          {/* 2-Player Pass & Play (Local 2 Humans) */}
          <button
            type="button"
            onClick={() => {
              soundManager.playClick();
              onStartTwoPlayerPassPlay();
            }}
            className="w-full py-3 px-6 rounded-xl bg-slate-900 border border-amber-500/40 text-amber-300 font-bold text-sm hover:border-amber-400 hover:text-white transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <Users size={16} />
            <span>2 Players: Pass & Play (1v1)</span>
          </button>

          {/* Quick 4-Player Match */}
          <button
            type="button"
            onClick={() => {
              soundManager.playClick();
              onStartQuickPlay();
            }}
            className="w-full py-3 px-6 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 font-semibold text-sm hover:border-slate-700 hover:text-white transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <span>🎲 4 Players (You vs 3 Bots)</span>
          </button>

          {/* Custom Match Setup */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              type="button"
              onClick={() => {
                soundManager.playClick();
                onOpenSetup('vs_bot');
              }}
              className="py-2.5 px-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 font-medium text-xs hover:border-slate-700 hover:text-white transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Bot size={14} />
              <span>Custom Bot Match</span>
            </button>
            <button
              type="button"
              onClick={() => {
                soundManager.playClick();
                onOpenSetup('pass_play');
              }}
              className="py-2.5 px-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 font-medium text-xs hover:border-slate-700 hover:text-white transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Users size={14} />
              <span>Custom Setup</span>
            </button>
          </div>
        </div>

        {/* Theme & Speed Quick Selectors */}
        <div className="flex items-center gap-4 mt-8 pt-4 border-t border-slate-900 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span>Board Theme:</span>
            <select
              value={settings.theme}
              onChange={e => {
                soundManager.playClick();
                onUpdateSettings({ theme: e.target.value as BoardTheme });
              }}
              className="bg-slate-900 border border-slate-800 text-slate-200 text-xs rounded-lg px-2.5 py-1 outline-none cursor-pointer"
            >
              <option value="classic">Classic Board</option>
              <option value="royal">Royal Wood</option>
              <option value="neon">Neon Arcade</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span>Speed:</span>
            <button
              type="button"
              onClick={() => {
                soundManager.playClick();
                onUpdateSettings({ fastMode: !settings.fastMode });
              }}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                settings.fastMode
                  ? 'bg-amber-400 text-slate-950'
                  : 'bg-slate-900 text-slate-300 border border-slate-800'
              }`}
            >
              {settings.fastMode ? '⚡ Fast' : 'Normal'}
            </button>
          </div>
        </div>
      </div>

      {/* Flat Control-Hint Line as required by game guidelines */}
      <div className="w-full max-w-md text-center py-2 z-10">
        <p className="text-xs text-slate-500 font-mono tracking-wide">
          Space / Enter Quick Start · Click / Space Roll Dice · Click Token to Move
        </p>
      </div>
    </div>
  );
};
