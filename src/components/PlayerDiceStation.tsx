import React from 'react';
import { Bot, Crown, User } from 'lucide-react';
import { Player, PlayerColor } from '../types/game';
import { Dice3D } from './Dice3D';

interface PlayerDiceStationProps {
  player: Player;
  isActive: boolean;
  canRoll: boolean;
  isRolling: boolean;
  diceValue: number;
  onRoll: () => void;
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
}

const STATION_THEMES: Record<
  PlayerColor,
  {
    bg: string;
    border: string;
    activeBorder: string;
    glow: string;
    accentText: string;
    avatarBg: string;
    avatarBorder: string;
  }
> = {
  red: {
    bg: 'bg-gradient-to-r from-rose-950/95 via-slate-950 to-red-950/90',
    border: 'border-rose-800/60',
    activeBorder: 'border-rose-400 ring-2 ring-rose-400 shadow-[0_0_25px_rgba(244,63,94,0.75)] animate-corner-active',
    glow: 'rgba(244, 63, 94, 0.5)',
    accentText: 'text-rose-300',
    avatarBg: 'bg-gradient-to-br from-rose-500 to-red-700',
    avatarBorder: 'border-rose-300',
  },
  green: {
    bg: 'bg-gradient-to-r from-emerald-950/95 via-slate-950 to-teal-950/90',
    border: 'border-emerald-800/60',
    activeBorder: 'border-emerald-400 ring-2 ring-emerald-400 shadow-[0_0_25px_rgba(16,185,129,0.75)] animate-corner-active',
    glow: 'rgba(16, 185, 129, 0.5)',
    accentText: 'text-emerald-300',
    avatarBg: 'bg-gradient-to-br from-emerald-500 to-teal-700',
    avatarBorder: 'border-emerald-300',
  },
  yellow: {
    bg: 'bg-gradient-to-r from-amber-950/95 via-slate-950 to-yellow-950/90',
    border: 'border-amber-800/60',
    activeBorder: 'border-amber-300 ring-2 ring-amber-300 shadow-[0_0_25px_rgba(245,158,11,0.75)] animate-corner-active',
    glow: 'rgba(245, 158, 11, 0.5)',
    accentText: 'text-amber-200',
    avatarBg: 'bg-gradient-to-br from-amber-400 to-yellow-600',
    avatarBorder: 'border-amber-200',
  },
  blue: {
    bg: 'bg-gradient-to-r from-sky-950/95 via-slate-950 to-blue-950/90',
    border: 'border-sky-800/60',
    activeBorder: 'border-sky-400 ring-2 ring-sky-400 shadow-[0_0_25px_rgba(14,165,233,0.75)] animate-corner-active',
    glow: 'rgba(14, 165, 233, 0.5)',
    accentText: 'text-sky-300',
    avatarBg: 'bg-gradient-to-br from-sky-500 to-blue-700',
    avatarBorder: 'border-sky-300',
  },
};

export const PlayerDiceStation: React.FC<PlayerDiceStationProps> = ({
  player,
  isActive,
  canRoll,
  isRolling,
  diceValue,
  onRoll,
  position,
}) => {
  const theme = STATION_THEMES[player.id];
  const isRightSide = position === 'top-right' || position === 'bottom-right';

  const inHomeCount = player.tokens.filter(t => t.isHome).length;

  return (
    <div
      onClick={() => {
        if (canRoll && !isRolling) {
          onRoll();
        }
      }}
      className={`relative w-full h-[58px] sm:h-[62px] px-2 py-1 rounded-2xl border flex items-center justify-between transition-all duration-300 select-none backdrop-blur-md ${
        theme.bg
      } ${
        isActive
          ? `${theme.activeBorder} scale-[1.02] z-30 cursor-pointer`
          : `${theme.border} opacity-85 hover:opacity-100 cursor-default`
      } ${isRightSide ? 'flex-row-reverse text-right' : 'flex-row text-left'}`}
      style={{
        boxShadow: isActive
          ? `0 0 25px ${theme.glow}, 0 4px 14px rgba(0,0,0,0.7)`
          : '0 2px 10px rgba(0,0,0,0.5)',
      }}
      aria-label={`${player.name} Dice station. ${isActive ? 'Active player' : 'Inactive'}`}
    >
      {/* 3D Dice Component - positioned on inner side facing the board */}
      <div className="shrink-0 relative">
        <Dice3D
          value={diceValue}
          isRolling={isRolling}
          canRoll={canRoll}
          activeColor={player.id}
          onRoll={onRoll}
          size={44}
          showLabel={false}
        />
      </div>

      {/* Player Identity & Status */}
      <div className="min-w-0 flex-1 px-1.5 flex flex-col justify-center">
        {/* Name and Badges */}
        <div className={`flex items-center gap-1.5 ${isRightSide ? 'justify-end' : 'justify-start'}`}>
          {!isRightSide && (
            <div
              className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black border text-white shadow-sm shrink-0 ${theme.avatarBg} ${theme.avatarBorder}`}
            >
              {player.avatar || player.name.slice(0, 1)}
            </div>
          )}

          <span className="font-extrabold text-xs sm:text-sm text-slate-100 truncate max-w-[85px] sm:max-w-[120px]">
            {player.name}
          </span>

          <div
            className="w-3.5 h-3.5 rounded-full bg-slate-900/90 border border-slate-700 flex items-center justify-center text-[7px] text-slate-300 shrink-0"
            title={player.type === 'bot' ? 'AI Bot' : 'Human Player'}
          >
            {player.type === 'bot' ? <Bot size={8} /> : <User size={8} />}
          </div>

          {player.hasWon && (
            <span className="text-[10px] text-amber-400 font-bold flex items-center shrink-0">
              <Crown size={11} className="fill-amber-400" />
            </span>
          )}

          {isRightSide && (
            <div
              className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black border text-white shadow-sm shrink-0 ${theme.avatarBg} ${theme.avatarBorder}`}
            >
              {player.avatar || player.name.slice(0, 1)}
            </div>
          )}
        </div>

        {/* Turn Status Message */}
        <div
          className={`text-[10px] sm:text-[11px] font-medium tracking-wide mt-0.5 flex items-center gap-1.5 ${
            isRightSide ? 'justify-end' : 'justify-start'
          } ${theme.accentText}`}
        >
          {isActive ? (
            isRolling ? (
              <span className="animate-pulse font-bold">Rolling...</span>
            ) : canRoll ? (
              <span className="font-black text-amber-300 underline animate-pulse">Tap to Roll</span>
            ) : (
              <span className="font-semibold">Move Pawn!</span>
            )
          ) : (
            <span className="text-slate-400 font-mono text-[10px]">
              Last: <strong className="text-slate-200">{diceValue}</strong> · 🏆{inHomeCount}/4
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
