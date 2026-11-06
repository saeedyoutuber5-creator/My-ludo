import React, { useMemo } from 'react';
import { BoardTheme, GridCoord, Player, PlayerColor, Token } from '../types/game';
import {
  COLOR_START_INDICES,
  getTokenCoordinate,
  SAFE_TRACK_INDICES,
  TRACK_COORDINATES,
} from '../utils/ludoBoard';
import { LudoPawn } from './LudoPawn';

interface LudoBoardProps {
  players: Player[];
  activeColor: PlayerColor;
  movableTokenIds: number[];
  animatingToken: { color: PlayerColor; tokenId: number; coord: GridCoord } | null;
  onTokenClick: (tokenId: number) => void;
  theme?: BoardTheme;
}

// 52 Track index lookup from (row, col)
const CELL_TO_TRACK_INDEX: Map<string, number> = new Map();
TRACK_COORDINATES.forEach((coord, idx) => {
  CELL_TO_TRACK_INDEX.set(`${coord.r},${coord.c}`, idx);
});

// Pedestal styling for each corner
const PEDESTAL_CONFIGS: Record<
  PlayerColor,
  {
    border: string;
    bg: string;
  }
> = {
  red: {
    border: 'border-rose-500/60 bg-rose-950/70 shadow-[inset_0_2px_8px_rgba(244,63,94,0.4)]',
    bg: 'radial-gradient(circle, rgba(225,29,72,0.35) 0%, rgba(15,23,42,0.9) 100%)',
  },
  green: {
    border: 'border-emerald-500/60 bg-emerald-950/70 shadow-[inset_0_2px_8px_rgba(16,185,129,0.4)]',
    bg: 'radial-gradient(circle, rgba(16,185,129,0.35) 0%, rgba(15,23,42,0.9) 100%)',
  },
  yellow: {
    border: 'border-amber-500/60 bg-amber-950/70 shadow-[inset_0_2px_8px_rgba(245,158,11,0.4)]',
    bg: 'radial-gradient(circle, rgba(245,158,11,0.35) 0%, rgba(15,23,42,0.9) 100%)',
  },
  blue: {
    border: 'border-sky-500/60 bg-sky-950/70 shadow-[inset_0_2px_8px_rgba(14,165,233,0.4)]',
    bg: 'radial-gradient(circle, rgba(14,165,233,0.35) 0%, rgba(15,23,42,0.9) 100%)',
  },
};

export const LudoBoard: React.FC<LudoBoardProps> = ({
  players,
  activeColor,
  movableTokenIds,
  animatingToken,
  onTokenClick,
  theme = 'classic',
}) => {
  // Group tokens by rendered board cell coordinates to handle stacking
  const tokensOnBoard = useMemo(() => {
    const list: {
      playerColor: PlayerColor;
      token: Token;
      coord: GridCoord;
      isMovable: boolean;
      isAnimating: boolean;
    }[] = [];

    players.forEach(p => {
      p.tokens.forEach(tok => {
        const isAnim =
          animatingToken !== null &&
          animatingToken.color === p.id &&
          animatingToken.tokenId === tok.id;

        const coord = isAnim
          ? animatingToken.coord
          : getTokenCoordinate(p.id, tok.step, tok.id);

        const isMovable =
          p.id === activeColor &&
          movableTokenIds.includes(tok.id) &&
          !isAnim;

        list.push({
          playerColor: p.id,
          token: tok,
          coord,
          isMovable,
          isAnimating: isAnim,
        });
      });
    });

    return list;
  }, [players, activeColor, movableTokenIds, animatingToken]);

  // Cluster map for tokens on the same cell
  const tokenClusters = useMemo(() => {
    const map = new Map<string, typeof tokensOnBoard>();
    tokensOnBoard.forEach(item => {
      const key = `${Math.round(item.coord.r)},${Math.round(item.coord.c)}`;
      const existing = map.get(key) || [];
      existing.push(item);
      map.set(key, existing);
    });
    return map;
  }, [tokensOnBoard]);

  // 3D Embossed Golden Star Medallion
  const renderSafeStarMedallion = (size: number = 22) => (
    <div
      className="relative flex items-center justify-center animate-star-medallion select-none"
      style={{ width: size, height: size }}
    >
      <svg
        viewBox="0 0 24 24"
        className="w-full h-full drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]"
      >
        <defs>
          <radialGradient id="starGoldGrad" cx="40%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#fef08a" />
            <stop offset="50%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#b45309" />
          </radialGradient>
        </defs>
        <path
          d="M12 1.5L14.9 8.26L22.2 9.27L16.8 14.34L18.2 21.62L12 18.07L5.8 21.62L7.2 14.34L1.8 9.27L9.1 8.26L12 1.5Z"
          fill="url(#starGoldGrad)"
          stroke="#78350f"
          strokeWidth="0.8"
        />
        <polygon
          points="12,4 13.8,8.5 18.5,9.2 15,12.7 16,17.5 12,15 8,17.5 9,12.7 5.5,9.2 10.2,8.5"
          fill="#fef9c3"
          opacity="0.85"
        />
      </svg>
    </div>
  );

  // Center Home (3x3 grid from row 6..8, col 6..8)
  const renderCenterTriangles = () => {
    return (
      <div
        className="absolute inset-0 overflow-hidden rounded-md shadow-2xl"
        style={{
          gridRow: '7 / span 3',
          gridColumn: '7 / span 3',
        }}
      >
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <defs>
            <linearGradient id="centerGreen" x1="0%" y1="0%" x2="50%" y2="50%">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#047857" />
            </linearGradient>
            <linearGradient id="centerYellow" x1="100%" y1="0%" x2="50%" y2="50%">
              <stop offset="0%" stopColor="#fbbf24" />
              <stop offset="100%" stopColor="#d97706" />
            </linearGradient>
            <linearGradient id="centerBlue" x1="100%" y1="100%" x2="50%" y2="50%">
              <stop offset="0%" stopColor="#0ea5e9" />
              <stop offset="100%" stopColor="#0369a1" />
            </linearGradient>
            <linearGradient id="centerRed" x1="0%" y1="100%" x2="50%" y2="50%">
              <stop offset="0%" stopColor="#f43f5e" />
              <stop offset="100%" stopColor="#be123c" />
            </linearGradient>
            <radialGradient id="goldMedal" cx="40%" cy="40%" r="60%">
              <stop offset="0%" stopColor="#fef08a" />
              <stop offset="60%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#92400e" />
            </radialGradient>
          </defs>

          {/* Top Triangle: Green */}
          <polygon points="0,0 100,0 50,50" fill="url(#centerGreen)" stroke="#065f46" strokeWidth="0.5" />
          {/* Right Triangle: Yellow */}
          <polygon points="100,0 100,100 50,50" fill="url(#centerYellow)" stroke="#b45309" strokeWidth="0.5" />
          {/* Bottom Triangle: Blue */}
          <polygon points="100,100 0,100 50,50" fill="url(#centerBlue)" stroke="#075985" strokeWidth="0.5" />
          {/* Left Triangle: Red */}
          <polygon points="0,100 0,0 50,50" fill="url(#centerRed)" stroke="#881337" strokeWidth="0.5" />

          {/* Central 3D Victory Medallion */}
          <circle cx="50" cy="50" r="17" fill="url(#goldMedal)" stroke="#451a03" strokeWidth="1.5" />
          <circle cx="50" cy="50" r="13" fill="#0f172a" stroke="#fef08a" strokeWidth="1" />
          
          {/* Royal Crown Icon in Center */}
          <path
            d="M44 54L43 47L47 50L50 44L53 50L57 47L56 54Z"
            fill="#fbbf24"
            stroke="#f59e0b"
            strokeWidth="0.6"
          />
          <circle cx="50" cy="53" r="1" fill="#ffffff" />
        </svg>
      </div>
    );
  };

  // Render individual track grid cells (15x15)
  const renderCells = () => {
    const cells: React.ReactNode[] = [];

    for (let r = 0; r < 15; r++) {
      for (let c = 0; c < 15; c++) {
        // Skip yard zones (0..5, 0..5), (0..5, 9..14), (9..14, 0..5), (9..14, 9..14) and center (6..8, 6..8)
        const isRedYard = r < 6 && c < 6;
        const isGreenYard = r < 6 && c >= 9;
        const isBlueYard = r >= 9 && c < 6;
        const isYellowYard = r >= 9 && c >= 9;
        const isCenter = r >= 6 && r <= 8 && c >= 6 && c <= 8;

        if (isRedYard || isGreenYard || isBlueYard || isYellowYard || isCenter) {
          continue;
        }

        const trackIdx = CELL_TO_TRACK_INDEX.get(`${r},${c}`);
        const isSafe = trackIdx !== undefined && SAFE_TRACK_INDICES.has(trackIdx);

        // Check if home stretch
        const isRedHomeStretch = r === 7 && c >= 1 && c <= 5;
        const isGreenHomeStretch = c === 7 && r >= 1 && r <= 5;
        const isYellowHomeStretch = r === 7 && c >= 9 && c <= 13;
        const isBlueHomeStretch = c === 7 && r >= 9 && r <= 13;

        // Check if start square
        const isRedStart = r === 6 && c === 1;
        const isGreenStart = r === 1 && c === 8;
        const isYellowStart = r === 8 && c === 13;
        const isBlueStart = r === 13 && c === 6;

        let cellBgClass = 'bg-slate-900/90';
        let arrowContent: React.ReactNode = null;

        if (isRedStart || isRedHomeStretch) {
          cellBgClass = 'bg-gradient-to-br from-rose-600 via-rose-700 to-red-900 border-rose-500/70 shadow-[inset_0_1px_4px_rgba(255,255,255,0.3)]';
          if (isRedHomeStretch && c === 5) {
            arrowContent = <span className="text-white font-black text-xs sm:text-sm drop-shadow-sm">➔</span>;
          }
        } else if (isGreenStart || isGreenHomeStretch) {
          cellBgClass = 'bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-900 border-emerald-500/70 shadow-[inset_0_1px_4px_rgba(255,255,255,0.3)]';
          if (isGreenHomeStretch && r === 5) {
            arrowContent = <span className="text-white font-black text-xs sm:text-sm drop-shadow-sm">⬇</span>;
          }
        } else if (isYellowStart || isYellowHomeStretch) {
          cellBgClass = 'bg-gradient-to-br from-amber-400 via-amber-500 to-amber-700 border-amber-400/80 shadow-[inset_0_1px_4px_rgba(255,255,255,0.4)]';
          if (isYellowHomeStretch && c === 9) {
            arrowContent = <span className="text-slate-950 font-black text-xs sm:text-sm drop-shadow-sm">⬅</span>;
          }
        } else if (isBlueStart || isBlueHomeStretch) {
          cellBgClass = 'bg-gradient-to-br from-sky-500 via-blue-600 to-blue-900 border-sky-400/70 shadow-[inset_0_1px_4px_rgba(255,255,255,0.3)]';
          if (isBlueHomeStretch && r === 9) {
            arrowContent = <span className="text-white font-black text-xs sm:text-sm drop-shadow-sm">⬆</span>;
          }
        } else {
          // Standard track square with smooth ivory/slate bevel
          cellBgClass = 'bg-gradient-to-b from-slate-800 to-slate-900/95 border-slate-700/80 text-slate-400';
        }

        cells.push(
          <div
            key={`cell-${r}-${c}`}
            style={{
              gridRow: r + 1,
              gridColumn: c + 1,
            }}
            className={`relative flex items-center justify-center border ${cellBgClass} track-cell-3d transition-colors select-none`}
          >
            {/* Safe Star Icon */}
            {isSafe && renderSafeStarMedallion(16)}
            {arrowContent}
          </div>
        );
      }
    }

    return cells;
  };

  // Render Integrated Corner Player Home Base (Visual group companion)
  const renderCornerHomeBase = (color: PlayerColor, rowStart: number, colStart: number) => {
    const isCurrentActive = activeColor === color;
    const player = players.find(p => p.id === color);
    const isSlotInGame = !!player;
    const pedCfg = PEDESTAL_CONFIGS[color];

    // Corner thematic backdrops
    const cornerThemes: Record<
      PlayerColor,
      {
        outerBox: string;
        innerWell: string;
        borderGlow: string;
        badgeColor: string;
      }
    > = {
      red: {
        outerBox: 'bg-gradient-to-br from-rose-950 via-slate-950 to-red-950 border-rose-600/70',
        innerWell: 'bg-gradient-to-b from-rose-950/90 to-slate-950 shadow-[inset_0_4px_12px_rgba(0,0,0,0.8)] border border-rose-700/50',
        borderGlow: 'ring-4 ring-rose-500 shadow-[0_0_30px_rgba(244,63,94,0.7)] animate-corner-active',
        badgeColor: 'text-rose-400',
      },
      green: {
        outerBox: 'bg-gradient-to-br from-emerald-950 via-slate-950 to-teal-950 border-emerald-600/70',
        innerWell: 'bg-gradient-to-b from-emerald-950/90 to-slate-950 shadow-[inset_0_4px_12px_rgba(0,0,0,0.8)] border border-emerald-700/50',
        borderGlow: 'ring-4 ring-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.7)] animate-corner-active',
        badgeColor: 'text-emerald-400',
      },
      yellow: {
        outerBox: 'bg-gradient-to-br from-amber-950 via-slate-950 to-yellow-950 border-amber-500/70',
        innerWell: 'bg-gradient-to-b from-amber-950/90 to-slate-950 shadow-[inset_0_4px_12px_rgba(0,0,0,0.8)] border border-amber-600/50',
        borderGlow: 'ring-4 ring-amber-400 shadow-[0_0_30px_rgba(245,158,11,0.7)] animate-corner-active',
        badgeColor: 'text-amber-300',
      },
      blue: {
        outerBox: 'bg-gradient-to-br from-sky-950 via-slate-950 to-blue-950 border-sky-600/70',
        innerWell: 'bg-gradient-to-b from-sky-950/90 to-slate-950 shadow-[inset_0_4px_12px_rgba(0,0,0,0.8)] border border-sky-700/50',
        borderGlow: 'ring-4 ring-sky-500 shadow-[0_0_30px_rgba(14,165,233,0.7)] animate-corner-active',
        badgeColor: 'text-sky-400',
      },
    };

    const ct = cornerThemes[color];

    return (
      <div
        key={`corner-home-${color}`}
        style={{
          gridRow: `${rowStart} / span 6`,
          gridColumn: `${colStart} / span 6`,
        }}
        className={`relative p-1.5 sm:p-2 rounded-2xl border-2 flex flex-col justify-between transition-all duration-300 select-none ${
          isSlotInGame ? ct.outerBox : 'bg-slate-950/80 border-slate-800/60 opacity-45'
        } ${isCurrentActive && isSlotInGame ? ct.borderGlow : 'shadow-lg'}`}
      >
        {/* Subtle decorative gold corner rivets */}
        <div className="absolute top-1 left-1 w-1.5 h-1.5 rounded-full bg-amber-400/70 shadow-sm pointer-events-none" />
        <div className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-amber-400/70 shadow-sm pointer-events-none" />
        <div className="absolute bottom-1 left-1 w-1.5 h-1.5 rounded-full bg-amber-400/70 shadow-sm pointer-events-none" />
        <div className="absolute bottom-1 right-1 w-1.5 h-1.5 rounded-full bg-amber-400/70 shadow-sm pointer-events-none" />

        {/* Yard Token Pit with 4 Large Crystal Pedestals for Pawn Bases */}
        <div
          className={`relative z-10 w-full h-full rounded-xl p-2 grid grid-cols-2 grid-rows-2 gap-2.5 items-center justify-center ${
            isSlotInGame ? ct.innerWell : 'bg-slate-900/60 border border-slate-800/40 shadow-inner'
          }`}
        >
          {/* 4 Crystal Pedestals where the 4 large pawns stand */}
          {[0, 1, 2, 3].map(pocketIdx => (
            <div
              key={`pocket-${color}-${pocketIdx}`}
              className={`rounded-full border-2 aspect-square flex items-center justify-center relative shadow-inner ${
                isSlotInGame ? pedCfg.border : 'border-slate-800/50 bg-slate-950/60'
              }`}
              style={{
                background: isSlotInGame ? pedCfg.bg : undefined,
              }}
            >
              <div
                className={`w-3 h-3 rounded-full ${
                  isSlotInGame ? 'bg-white/25 blur-[0.5px]' : 'bg-slate-700/20'
                }`}
              />
            </div>
          ))}

          {/* Central subtle home progress or inactive watermark */}
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            <span
              className={`text-[9px] sm:text-[10px] font-black uppercase tracking-wider select-none ${
                isSlotInGame ? 'text-white/20' : 'text-slate-600/40'
              }`}
            >
              {color} {isSlotInGame ? '' : '· INACTIVE'}
            </span>
          </div>
        </div>
      </div>
    );
  };

  // Render Traditional Large 3D Ludo Pawns (Gotis)
  const renderTokens = () => {
    return tokensOnBoard.map((item, index) => {
      const { playerColor, token, coord, isMovable, isAnimating } = item;

      const cellPercent = 100 / 15;
      // Center of the cell in board percentage coordinates
      const centerX = coord.c * cellPercent + cellPercent / 2;
      const centerY = coord.r * cellPercent + cellPercent / 2;

      // Cluster offset when multiple pawns share a single track square
      const clusterKey = `${Math.round(coord.r)},${Math.round(coord.c)}`;
      const cluster = tokenClusters.get(clusterKey) || [item];
      const clusterSize = cluster.length;
      const clusterIndex = cluster.findIndex(
        t => t.token.id === token.id && t.playerColor === playerColor
      );

      let offsetX = 0;
      let offsetY = 0;
      let tokenScale = 1.0;

      if (!token.inYard && !token.isHome && clusterSize > 1) {
        tokenScale = clusterSize > 2 ? 0.8 : 0.88;
        if (clusterSize === 2) {
          offsetX = clusterIndex === 0 ? -11 : 11;
          offsetY = clusterIndex === 0 ? -6 : 6;
        } else if (clusterSize >= 3) {
          const positions = [
            { x: -10, y: -9 },
            { x: 10, y: -9 },
            { x: -10, y: 9 },
            { x: 10, y: 9 },
          ];
          const pos = positions[clusterIndex % 4];
          offsetX = pos.x;
          offsetY = pos.y;
        }
      }

      // Large pawn size: 34px on track, 30px in yard
      const pawnPixelSize = token.inYard ? 30 : 34;

      return (
        <div
          key={`pawn-tok-${playerColor}-${token.id}-${index}`}
          style={{
            position: 'absolute',
            left: `${centerX}%`,
            top: `${centerY}%`,
            transform: `translate(-50%, -62%) translate(${offsetX}px, ${offsetY}px) scale(${tokenScale})`,
            transition: isAnimating
              ? 'none'
              : 'left 0.22s ease-out, top 0.22s ease-out, transform 0.18s ease-out',
            zIndex: isMovable ? 55 : isAnimating ? 65 : 25 + clusterIndex * 2,
            pointerEvents: isMovable ? 'auto' : 'none',
          }}
          className="flex items-center justify-center select-none"
        >
          <button
            type="button"
            onClick={() => {
              if (isMovable) {
                onTokenClick(token.id);
              }
            }}
            disabled={!isMovable}
            className={`relative flex items-center justify-center outline-none transition-transform ${
              isMovable
                ? 'cursor-pointer hover:scale-115 active:scale-95'
                : 'cursor-default'
            }`}
            aria-label={`${playerColor} pawn ${token.id + 1} at step ${token.step}`}
          >
            {/* Proper Traditional 3D Ludo Pawn */}
            <LudoPawn
              color={playerColor}
              isMovable={isMovable}
              isHome={token.isHome}
              size={pawnPixelSize}
            />
          </button>
        </div>
      );
    });
  };

  return (
    <div className="relative w-full aspect-square mx-auto flex items-center justify-center select-none">
      {/* 3D Wooden / Mahogany Luxury Board Frame with Chamfered Gold Inlays */}
      <div
        className="relative w-full h-full rounded-3xl p-1.5 sm:p-2.5 border-[6px] border-[#2e190e] bg-slate-950 grid grid-cols-15 grid-rows-15 gap-[1px] select-none shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9),inset_0_2px_4px_rgba(255,255,255,0.2)] ring-4 ring-amber-600/30"
      >
        {/* Four Integrated Corner Player Home Bases */}
        {renderCornerHomeBase('red', 1, 1)}
        {renderCornerHomeBase('green', 1, 10)}
        {renderCornerHomeBase('blue', 10, 1)}
        {renderCornerHomeBase('yellow', 10, 10)}

        {/* 15x15 Track & Home Stretch Cells */}
        {renderCells()}

        {/* Majestic 3D Center Victory Zone */}
        {renderCenterTriangles()}

        {/* Traditional Large 3D Ludo Pawns */}
        {renderTokens()}
      </div>
    </div>
  );
};
