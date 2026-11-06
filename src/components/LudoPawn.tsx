import React from 'react';
import { PlayerColor } from '../types/game';

interface LudoPawnProps {
  color: PlayerColor;
  isMovable?: boolean;
  isHome?: boolean;
  size?: number; // width in pixels, defaults to 34
  className?: string;
}

const PAWN_CONFIGS: Record<
  PlayerColor,
  {
    name: string;
    headColors: { start: string; mid: string; end: string };
    bodyColors: { start: string; mid: string; end: string };
    baseColors: { top: string; mid: string; bot: string };
    collarColors: { top: string; bot: string };
    strokeColor: string;
    glowColor: string;
    ringColor: string;
  }
> = {
  red: {
    name: 'Red',
    headColors: { start: '#fecdd3', mid: '#f43f5e', end: '#9f1239' },
    bodyColors: { start: '#fda4af', mid: '#e11d48', end: '#4c0519' },
    baseColors: { top: '#f43f5e', mid: '#be123c', bot: '#4c0519' },
    collarColors: { top: '#fef08a', bot: '#b45309' },
    strokeColor: '#4c0519',
    glowColor: 'rgba(244, 63, 94, 0.95)',
    ringColor: '#f43f5e',
  },
  green: {
    name: 'Green',
    headColors: { start: '#a7f3d0', mid: '#10b981', end: '#065f46' },
    bodyColors: { start: '#6ee7b7', mid: '#059669', end: '#022c22' },
    baseColors: { top: '#10b981', mid: '#047857', bot: '#022c22' },
    collarColors: { top: '#fef08a', bot: '#b45309' },
    strokeColor: '#022c22',
    glowColor: 'rgba(16, 185, 129, 0.95)',
    ringColor: '#10b981',
  },
  yellow: {
    name: 'Yellow',
    headColors: { start: '#fef9c3', mid: '#fbbf24', end: '#b45309' },
    bodyColors: { start: '#fef08a', mid: '#f59e0b', end: '#78350f' },
    baseColors: { top: '#fbbf24', mid: '#d97706', bot: '#451a03' },
    collarColors: { top: '#ffffff', bot: '#b45309' },
    strokeColor: '#78350f',
    glowColor: 'rgba(245, 158, 11, 0.95)',
    ringColor: '#fbbf24',
  },
  blue: {
    name: 'Blue',
    headColors: { start: '#bae6fd', mid: '#0ea5e9', end: '#0369a1' },
    bodyColors: { start: '#7dd3fc', mid: '#0284c7', end: '#082f49' },
    baseColors: { top: '#0ea5e9', mid: '#0284c7', bot: '#082f49' },
    collarColors: { top: '#fef08a', bot: '#b45309' },
    strokeColor: '#082f49',
    glowColor: 'rgba(14, 165, 233, 0.95)',
    ringColor: '#0ea5e9',
  },
};

export const LudoPawn: React.FC<LudoPawnProps> = ({
  color,
  isMovable = false,
  isHome = false,
  size = 34,
  className = '',
}) => {
  const cfg = PAWN_CONFIGS[color];
  const height = Math.round(size * 1.38);

  const headId = `pawn-head-${color}`;
  const bodyId = `pawn-body-${color}`;
  const baseId = `pawn-base-${color}`;
  const collarId = `pawn-collar-${color}`;

  return (
    <div
      style={{
        width: size,
        height: height,
      }}
      className={`relative flex items-center justify-center select-none ${className} ${
        isMovable ? 'animate-token-glow cursor-pointer' : 'cursor-default'
      }`}
    >
      <svg
        viewBox="0 0 38 52"
        className="w-full h-full overflow-visible"
        style={{
          filter: isMovable
            ? `drop-shadow(0 0 8px ${cfg.glowColor}) drop-shadow(0 4px 10px rgba(0,0,0,0.8))`
            : 'drop-shadow(0 4px 6px rgba(0,0,0,0.7))',
        }}
      >
        <defs>
          {/* Spherical Head Radial Gradient */}
          <radialGradient id={headId} cx="36%" cy="32%" r="68%">
            <stop offset="0%" stopColor={cfg.headColors.start} />
            <stop offset="45%" stopColor={cfg.headColors.mid} />
            <stop offset="100%" stopColor={cfg.headColors.end} />
          </radialGradient>

          {/* Conical Body Stem Gradient */}
          <linearGradient id={bodyId} x1="10%" y1="20%" x2="90%" y2="80%">
            <stop offset="0%" stopColor={cfg.bodyColors.start} />
            <stop offset="40%" stopColor={cfg.bodyColors.mid} />
            <stop offset="100%" stopColor={cfg.bodyColors.end} />
          </linearGradient>

          {/* Base Rim Gradient */}
          <radialGradient id={baseId} cx="40%" cy="25%" r="75%">
            <stop offset="0%" stopColor={cfg.baseColors.top} />
            <stop offset="60%" stopColor={cfg.baseColors.mid} />
            <stop offset="100%" stopColor={cfg.baseColors.bot} />
          </radialGradient>

          {/* Golden Collar Ring Gradient */}
          <linearGradient id={collarId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={cfg.collarColors.top} />
            <stop offset="100%" stopColor={cfg.collarColors.bot} />
          </linearGradient>
        </defs>

        {/* 1. Deep Contact Ground Shadow */}
        <ellipse cx="19" cy="48" rx="15" ry="3.5" fill="rgba(0,0,0,0.6)" />

        {/* 2. Wide Pawn Skirt / Flared Base */}
        <path
          d="M 4 45 C 4 49.5 34 49.5 34 45 L 30 38 C 26 35 22 30 22 25 L 16 25 C 16 30 12 35 8 38 Z"
          fill={`url(#${bodyId})`}
          stroke={cfg.strokeColor}
          strokeWidth="0.8"
        />

        {/* 3. Base Beveled Plate Rim */}
        <ellipse
          cx="19"
          cy="45"
          rx="15"
          ry="3.8"
          fill={`url(#${baseId})`}
          stroke={cfg.strokeColor}
          strokeWidth="1"
        />
        {/* Base Specular Highlight Curve */}
        <ellipse
          cx="19"
          cy="44"
          rx="13.5"
          ry="2.5"
          fill="none"
          stroke="rgba(255,255,255,0.6)"
          strokeWidth="0.8"
        />

        {/* 4. Conical Body / Waist */}
        <path
          d="M 9 39 C 13 35.5 15 30 15 25 L 23 25 C 23 30 25 35.5 29 39 C 25 41.5 13 41.5 9 39 Z"
          fill={`url(#${bodyId})`}
          stroke={cfg.strokeColor}
          strokeWidth="0.8"
        />

        {/* 5. Cylindrical Glossy Specular Streak along left curve */}
        <path
          d="M 13 27 Q 11 34 8.5 39"
          stroke="rgba(255,255,255,0.7)"
          strokeWidth="1.8"
          strokeLinecap="round"
          fill="none"
        />

        {/* 6. Narrow Neck Collar Ring (Golden Toroid) */}
        <ellipse
          cx="19"
          cy="24"
          rx="7"
          ry="2.2"
          fill={`url(#${collarId})`}
          stroke="rgba(0,0,0,0.4)"
          strokeWidth="0.8"
        />
        <ellipse
          cx="19"
          cy="23.4"
          rx="6"
          ry="1.4"
          fill="none"
          stroke="rgba(255,255,255,0.85)"
          strokeWidth="0.8"
        />

        {/* 7. Rounded Dome Head (Sphere) */}
        <circle
          cx="19"
          cy="13"
          r="9.5"
          fill={`url(#${headId})`}
          stroke={cfg.strokeColor}
          strokeWidth="0.9"
        />

        {/* 8. Gloss Specular Glare on Head Dome */}
        <ellipse
          cx="15.5"
          cy="9.5"
          rx="4"
          ry="2.2"
          fill="rgba(255,255,255,0.85)"
          transform="rotate(-25 15.5 9.5)"
        />
        <circle cx="14.5" cy="8.2" r="1.3" fill="#ffffff" />

        {/* 9. Crown on Top If Home */}
        {isHome && (
          <g>
            <path
              d="M 13.5 4 L 15 7.5 L 19 3 L 23 7.5 L 24.5 4 L 23.5 9 L 14.5 9 Z"
              fill="#fbbf24"
              stroke="#b45309"
              strokeWidth="0.8"
            />
            <circle cx="19" cy="2.2" r="1.2" fill="#ffffff" />
          </g>
        )}
      </svg>
    </div>
  );
};
