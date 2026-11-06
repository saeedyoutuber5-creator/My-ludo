import React, { useEffect, useState } from 'react';
import { PlayerColor } from '../types/game';
import { soundManager } from '../utils/audio';

interface Dice3DProps {
  value: number;
  isRolling: boolean;
  canRoll: boolean;
  activeColor: PlayerColor;
  onRoll: () => void;
  size?: number; // size in px, defaults to 52
  showLabel?: boolean;
}

// Target rotations for each face (in degrees) to face the viewer
const FACE_ROTATIONS: Record<number, { x: number; y: number }> = {
  1: { x: 0, y: 0 },
  6: { x: 0, y: 180 },
  2: { x: 0, y: -90 },
  5: { x: 0, y: 90 },
  3: { x: -90, y: 0 },
  4: { x: 90, y: 0 },
};

const COLOR_ACCENTS: Record<PlayerColor, { ring: string; shadow: string; dot: string; glow: string }> = {
  red: {
    ring: 'border-rose-400 shadow-rose-500/50',
    shadow: '0 8px 24px rgba(244, 63, 94, 0.5)',
    dot: 'bg-rose-600',
    glow: 'rgba(244, 63, 94, 0.8)',
  },
  green: {
    ring: 'border-emerald-400 shadow-emerald-500/50',
    shadow: '0 8px 24px rgba(16, 185, 129, 0.5)',
    dot: 'bg-emerald-600',
    glow: 'rgba(16, 185, 129, 0.8)',
  },
  yellow: {
    ring: 'border-amber-300 shadow-amber-400/50',
    shadow: '0 8px 24px rgba(245, 158, 11, 0.5)',
    dot: 'bg-amber-600',
    glow: 'rgba(245, 158, 11, 0.8)',
  },
  blue: {
    ring: 'border-sky-400 shadow-sky-500/50',
    shadow: '0 8px 24px rgba(14, 165, 233, 0.5)',
    dot: 'bg-sky-600',
    glow: 'rgba(14, 165, 233, 0.8)',
  },
};

export const Dice3D: React.FC<Dice3DProps> = ({
  value,
  isRolling,
  canRoll,
  activeColor,
  onRoll,
  size = 52,
  showLabel = true,
}) => {
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const halfSize = size / 2;

  useEffect(() => {
    if (isRolling) {
      soundManager.playDiceRoll();
      // Add extra full spins (360 * 3) plus random wobble while rolling
      const extraX = 720 + Math.floor(Math.random() * 3) * 360;
      const extraY = 1080 + Math.floor(Math.random() * 3) * 360;
      const target = FACE_ROTATIONS[value] || FACE_ROTATIONS[1];
      setRotation({
        x: extraX + target.x,
        y: extraY + target.y,
      });
    } else {
      const target = FACE_ROTATIONS[value] || FACE_ROTATIONS[1];
      setRotation(target);
      if (value === 6) {
        soundManager.playSixRoll();
      }
    }
  }, [value, isRolling]);

  const accent = COLOR_ACCENTS[activeColor];

  // Helper to render pips for each face
  const renderPips = (faceNum: number) => {
    const isOne = faceNum === 1;
    const dotColor = isOne ? accent.dot : 'bg-slate-900';

    switch (faceNum) {
      case 1:
        return (
          <div className="w-full h-full flex items-center justify-center">
            <span className={`w-3.5 h-3.5 rounded-full ${accent.dot} shadow-inner animate-pulse`} />
          </div>
        );
      case 2:
        return (
          <div className="w-full h-full p-1.5 flex flex-col justify-between">
            <div className="flex justify-start"><span className={`w-2 h-2 rounded-full ${dotColor}`} /></div>
            <div className="flex justify-end"><span className={`w-2 h-2 rounded-full ${dotColor}`} /></div>
          </div>
        );
      case 3:
        return (
          <div className="w-full h-full p-1.5 flex flex-col justify-between">
            <div className="flex justify-start"><span className={`w-2 h-2 rounded-full ${dotColor}`} /></div>
            <div className="flex justify-center"><span className={`w-2 h-2 rounded-full ${dotColor}`} /></div>
            <div className="flex justify-end"><span className={`w-2 h-2 rounded-full ${dotColor}`} /></div>
          </div>
        );
      case 4:
        return (
          <div className="w-full h-full p-1.5 flex flex-col justify-between">
            <div className="flex justify-between"><span className={`w-2 h-2 rounded-full ${dotColor}`} /><span className={`w-2 h-2 rounded-full ${dotColor}`} /></div>
            <div className="flex justify-between"><span className={`w-2 h-2 rounded-full ${dotColor}`} /><span className={`w-2 h-2 rounded-full ${dotColor}`} /></div>
          </div>
        );
      case 5:
        return (
          <div className="w-full h-full p-1.5 flex flex-col justify-between">
            <div className="flex justify-between"><span className={`w-2 h-2 rounded-full ${dotColor}`} /><span className={`w-2 h-2 rounded-full ${dotColor}`} /></div>
            <div className="flex justify-center"><span className={`w-2 h-2 rounded-full ${dotColor}`} /></div>
            <div className="flex justify-between"><span className={`w-2 h-2 rounded-full ${dotColor}`} /><span className={`w-2 h-2 rounded-full ${dotColor}`} /></div>
          </div>
        );
      case 6:
        return (
          <div className="w-full h-full p-1.5 flex flex-col justify-between">
            <div className="flex justify-between"><span className={`w-2 h-2 rounded-full ${dotColor}`} /><span className={`w-2 h-2 rounded-full ${dotColor}`} /></div>
            <div className="flex justify-between"><span className={`w-2 h-2 rounded-full ${dotColor}`} /><span className={`w-2 h-2 rounded-full ${dotColor}`} /></div>
            <div className="flex justify-between"><span className={`w-2 h-2 rounded-full ${dotColor}`} /><span className={`w-2 h-2 rounded-full ${dotColor}`} /></div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="relative flex flex-col items-center justify-center">
      {/* Special "6!" celebratory burst badge */}
      {value === 6 && !isRolling && (
        <div className="absolute -top-6 -right-2 z-30 animate-six-burst pointer-events-none">
          <span className="px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 text-slate-950 font-black text-[11px] shadow-lg border border-white flex items-center gap-0.5">
            ✨ SIX!
          </span>
        </div>
      )}

      <button
        type="button"
        onClick={e => {
          e.stopPropagation();
          if (canRoll && !isRolling) {
            onRoll();
          }
        }}
        disabled={!canRoll || isRolling}
        style={{
          width: size + 12,
          height: size + 12,
        }}
        className={`relative flex items-center justify-center rounded-2xl p-1.5 transition-all duration-200 outline-none select-none ${
          canRoll && !isRolling
            ? 'cursor-pointer hover:scale-110 active:scale-95 shadow-xl ' + accent.ring + ' ring-2 ring-white/60'
            : 'cursor-default opacity-85'
        }`}
        aria-label={`Dice showing ${value}. ${canRoll ? 'Tap to roll' : ''}`}
      >
        {/* Glow ambient background aura behind dice */}
        <div
          className={`absolute inset-0 rounded-2xl opacity-40 blur-md transition-opacity duration-300 ${
            canRoll ? 'opacity-90 animate-pulse' : 'opacity-20'
          }`}
          style={{ background: accent.glow }}
        />

        {/* 3D Dice Viewport */}
        <div
          className="dice-scene relative"
          style={{ width: size, height: size }}
        >
          <div
            className={`dice-cube ${isRolling ? 'animate-dice-rolling' : ''}`}
            style={{
              transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
              transition: isRolling
                ? 'transform 0.55s cubic-bezier(0.2, 0.9, 0.3, 1.2)'
                : 'transform 0.4s ease-out',
            }}
          >
            {/* Face 1: Front */}
            <div
              className="dice-face bg-gradient-to-br from-white via-slate-50 to-slate-200 border border-slate-300"
              style={{ transform: `translateZ(${halfSize}px)` }}
            >
              {renderPips(1)}
            </div>

            {/* Face 6: Back */}
            <div
              className="dice-face bg-gradient-to-br from-white via-slate-50 to-slate-200 border border-slate-300"
              style={{ transform: `rotateY(180deg) translateZ(${halfSize}px)` }}
            >
              {renderPips(6)}
            </div>

            {/* Face 2: Right */}
            <div
              className="dice-face bg-gradient-to-br from-white via-slate-50 to-slate-200 border border-slate-300"
              style={{ transform: `rotateY(90deg) translateZ(${halfSize}px)` }}
            >
              {renderPips(2)}
            </div>

            {/* Face 5: Left */}
            <div
              className="dice-face bg-gradient-to-br from-white via-slate-50 to-slate-200 border border-slate-300"
              style={{ transform: `rotateY(-90deg) translateZ(${halfSize}px)` }}
            >
              {renderPips(5)}
            </div>

            {/* Face 3: Top */}
            <div
              className="dice-face bg-gradient-to-br from-white via-slate-50 to-slate-200 border border-slate-300"
              style={{ transform: `rotateX(90deg) translateZ(${halfSize}px)` }}
            >
              {renderPips(3)}
            </div>

            {/* Face 4: Bottom */}
            <div
              className="dice-face bg-gradient-to-br from-white via-slate-50 to-slate-200 border border-slate-300"
              style={{ transform: `rotateX(-90deg) translateZ(${halfSize}px)` }}
            >
              {renderPips(4)}
            </div>
          </div>
        </div>
      </button>

      {/* Optional micro label */}
      {showLabel && (
        <span
          className={`text-[10px] font-bold tracking-wider uppercase mt-1 transition-colors ${
            canRoll ? 'text-amber-300 animate-pulse' : 'text-slate-400'
          }`}
        >
          {isRolling ? 'Rolling...' : canRoll ? 'Tap Dice' : `Rolled ${value}`}
        </span>
      )}
    </div>
  );
};
