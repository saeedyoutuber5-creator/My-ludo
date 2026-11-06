import { GridCoord, Player, PlayerColor, Token } from '../types/game';

// 52 Perimeter Track Coordinates (row, col)
export const TRACK_COORDINATES: GridCoord[] = [
  /* 0 - Red Start */  { r: 6, c: 1 },
  /* 1 */              { r: 6, c: 2 },
  /* 2 */              { r: 6, c: 3 },
  /* 3 */              { r: 6, c: 4 },
  /* 4 */              { r: 6, c: 5 },
  /* 5 */              { r: 5, c: 6 },
  /* 6 */              { r: 4, c: 6 },
  /* 7 */              { r: 3, c: 6 },
  /* 8 - Star */       { r: 2, c: 6 },
  /* 9 */              { r: 1, c: 6 },
  /* 10 */             { r: 0, c: 6 },
  /* 11 */             { r: 0, c: 7 },
  /* 12 */             { r: 0, c: 8 },
  /* 13 - Green Start */{ r: 1, c: 8 },
  /* 14 */             { r: 2, c: 8 },
  /* 15 */             { r: 3, c: 8 },
  /* 16 */             { r: 4, c: 8 },
  /* 17 */             { r: 5, c: 8 },
  /* 18 */             { r: 6, c: 9 },
  /* 19 */             { r: 6, c: 10 },
  /* 20 */             { r: 6, c: 11 },
  /* 21 - Star */      { r: 6, c: 12 },
  /* 22 */             { r: 6, c: 13 },
  /* 23 */             { r: 6, c: 14 },
  /* 24 */             { r: 7, c: 14 },
  /* 25 */             { r: 8, c: 14 },
  /* 26 - Yellow Start */{ r: 8, c: 13 },
  /* 27 */             { r: 8, c: 12 },
  /* 28 */             { r: 8, c: 11 },
  /* 29 */             { r: 8, c: 10 },
  /* 30 */             { r: 8, c: 9 },
  /* 31 */             { r: 9, c: 8 },
  /* 32 */             { r: 10, c: 8 },
  /* 33 */             { r: 11, c: 8 },
  /* 34 - Star */      { r: 12, c: 8 },
  /* 35 */             { r: 13, c: 8 },
  /* 36 */             { r: 14, c: 8 },
  /* 37 */             { r: 14, c: 7 },
  /* 38 */             { r: 14, c: 6 },
  /* 39 - Blue Start */{ r: 13, c: 6 },
  /* 40 */             { r: 12, c: 6 },
  /* 41 */             { r: 11, c: 6 },
  /* 42 */             { r: 10, c: 6 },
  /* 43 */             { r: 9, c: 6 },
  /* 44 */             { r: 8, c: 5 },
  /* 45 */             { r: 8, c: 4 },
  /* 46 */             { r: 8, c: 3 },
  /* 47 - Star */      { r: 8, c: 2 },
  /* 48 */             { r: 8, c: 1 },
  /* 49 */             { r: 8, c: 0 },
  /* 50 */             { r: 7, c: 0 },
  /* 51 */             { r: 6, c: 0 },
];

export const SAFE_TRACK_INDICES = new Set([0, 8, 13, 21, 26, 34, 39, 47]);

export const COLOR_START_INDICES: Record<PlayerColor, number> = {
  red: 0,
  green: 13,
  yellow: 26,
  blue: 39,
};

// Home Stretch (steps 51 to 55) coordinates for each color
export const HOME_STRETCH_COORDINATES: Record<PlayerColor, GridCoord[]> = {
  red: [
    { r: 7, c: 1 },
    { r: 7, c: 2 },
    { r: 7, c: 3 },
    { r: 7, c: 4 },
    { r: 7, c: 5 },
  ],
  green: [
    { r: 1, c: 7 },
    { r: 2, c: 7 },
    { r: 3, c: 7 },
    { r: 4, c: 7 },
    { r: 5, c: 7 },
  ],
  yellow: [
    { r: 7, c: 13 },
    { r: 7, c: 12 },
    { r: 7, c: 11 },
    { r: 7, c: 10 },
    { r: 7, c: 9 },
  ],
  blue: [
    { r: 13, c: 7 },
    { r: 12, c: 7 },
    { r: 11, c: 7 },
    { r: 10, c: 7 },
    { r: 9, c: 7 },
  ],
};

// Yard pockets (where tokens sit when not active)
export const YARD_POCKETS: Record<PlayerColor, GridCoord[]> = {
  red: [
    { r: 1.5, c: 1.5 },
    { r: 1.5, c: 3.5 },
    { r: 3.5, c: 1.5 },
    { r: 3.5, c: 3.5 },
  ],
  green: [
    { r: 1.5, c: 10.5 },
    { r: 1.5, c: 12.5 },
    { r: 3.5, c: 10.5 },
    { r: 3.5, c: 12.5 },
  ],
  yellow: [
    { r: 10.5, c: 10.5 },
    { r: 10.5, c: 12.5 },
    { r: 12.5, c: 10.5 },
    { r: 12.5, c: 12.5 },
  ],
  blue: [
    { r: 10.5, c: 1.5 },
    { r: 10.5, c: 3.5 },
    { r: 12.5, c: 1.5 },
    { r: 12.5, c: 3.5 },
  ],
};

// Final home triangle position for each color (step 56)
export const HOME_CENTER_COORDINATES: Record<PlayerColor, GridCoord> = {
  red: { r: 7, c: 6.2 },
  green: { r: 6.2, c: 7 },
  yellow: { r: 7, c: 7.8 },
  blue: { r: 7.8, c: 7 },
};

/**
 * Returns exact board coordinates for a token at a given step.
 */
export function getTokenCoordinate(color: PlayerColor, step: number, tokenId: number): GridCoord {
  if (step === -1) {
    // In Yard
    return YARD_POCKETS[color][tokenId] || { r: 0, c: 0 };
  }

  if (step === 56) {
    // At Home center
    const center = HOME_CENTER_COORDINATES[color];
    // Offset slightly by token ID inside home
    const offsets = [
      { r: -0.2, c: -0.2 },
      { r: -0.2, c: 0.2 },
      { r: 0.2, c: -0.2 },
      { r: 0.2, c: 0.2 },
    ];
    return {
      r: center.r + offsets[tokenId].r * 0.4,
      c: center.c + offsets[tokenId].c * 0.4,
    };
  }

  if (step >= 51 && step <= 55) {
    // In Home Stretch
    const stretchIndex = step - 51;
    return HOME_STRETCH_COORDINATES[color][stretchIndex];
  }

  // On outer track (steps 0 to 50)
  const startIndex = COLOR_START_INDICES[color];
  const trackIndex = (startIndex + step) % 52;
  return TRACK_COORDINATES[trackIndex];
}

/**
 * Returns the track index (0..51) if the token is on the outer track, or null if in yard/home stretch.
 */
export function getTrackIndex(color: PlayerColor, step: number): number | null {
  if (step < 0 || step > 50) return null;
  const start = COLOR_START_INDICES[color];
  return (start + step) % 52;
}

/**
 * Checks whether a track position is a safe square.
 */
export function isSafeSquare(trackIndex: number): boolean {
  return SAFE_TRACK_INDICES.has(trackIndex);
}

/**
 * Returns list of token IDs that are legally movable with the given dice roll.
 */
export function getMovableTokens(player: Player, diceRoll: number): number[] {
  if (player.hasWon) return [];
  const movable: number[] = [];

  player.tokens.forEach(token => {
    if (token.isHome) return;

    if (token.inYard) {
      // Yard token can only move out on a 6
      if (diceRoll === 6) {
        movable.push(token.id);
      }
    } else {
      // Token on board: can advance if step + diceRoll <= 56 (exact roll for home)
      if (token.step + diceRoll <= 56) {
        movable.push(token.id);
      }
    }
  });

  return movable;
}

/**
 * Checks if moving to targetStep captures an opponent token.
 * Returns array of captured tokens { playerColor, tokenId }.
 */
export function findCaptures(
  moverColor: PlayerColor,
  targetStep: number,
  allPlayers: Player[]
): { playerColor: PlayerColor; tokenId: number }[] {
  // If target step is in yard, home stretch, or home center, captures are impossible
  if (targetStep < 0 || targetStep > 50) return [];

  const moverTrackIdx = getTrackIndex(moverColor, targetStep);
  if (moverTrackIdx === null) return [];

  // Safe squares cannot have captures!
  if (isSafeSquare(moverTrackIdx)) return [];

  const captures: { playerColor: PlayerColor; tokenId: number }[] = [];

  allPlayers.forEach(p => {
    if (p.id === moverColor || p.hasWon) return;

    p.tokens.forEach(tok => {
      if (tok.inYard || tok.isHome) return;
      const tokTrackIdx = getTrackIndex(tok.color, tok.step);
      if (tokTrackIdx === moverTrackIdx) {
        captures.push({ playerColor: p.id, tokenId: tok.id });
      }
    });
  });

  return captures;
}

/**
 * AI Bot Move Selector: Evaluates all legal moves and picks the best one based on strategic priorities.
 */
export function pickBotMove(
  player: Player,
  diceRoll: number,
  allPlayers: Player[],
  difficulty: 'casual' | 'tactical' | 'master' = 'tactical'
): number | null {
  const movable = getMovableTokens(player, diceRoll);
  if (movable.length === 0) return null;
  if (movable.length === 1) return movable[0];

  if (difficulty === 'casual' && Math.random() < 0.35) {
    // Casual bots occasionally pick a random legal move
    return movable[Math.floor(Math.random() * movable.length)];
  }

  let bestScore = -Infinity;
  let bestTokenId = movable[0];

  for (const tokenId of movable) {
    const token = player.tokens[tokenId];
    let score = 0;

    if (token.inYard) {
      // Bringing token out of yard is very valuable
      score += 55;
    } else {
      const nextStep = token.step + diceRoll;

      // 1. Reaching Home
      if (nextStep === 56) {
        score += 120; // Highest priority: score a point!
      } else if (nextStep >= 51) {
        // Entering home stretch (safe zone)
        score += 70 + (nextStep - 50) * 5;
      } else {
        const nextTrackIdx = getTrackIndex(player.id, nextStep)!;

        // 2. Capturing an opponent!
        const captures = findCaptures(player.id, nextStep, allPlayers);
        if (captures.length > 0) {
          score += 100 * captures.length; // Huge reward for capturing
        }

        // 3. Landing on a safe star square
        if (isSafeSquare(nextTrackIdx)) {
          score += 45;
        }

        // 4. Progress towards home
        score += nextStep * 0.8;

        // 5. Threat avoidance: Check if any opponent is behind within 1-6 steps
        const currentTrackIdx = getTrackIndex(player.id, token.step);
        if (currentTrackIdx !== null && !isSafeSquare(currentTrackIdx)) {
          let underThreat = false;
          for (const opp of allPlayers) {
            if (opp.id === player.id || opp.hasWon) continue;
            for (const oppTok of opp.tokens) {
              if (oppTok.inYard || oppTok.isHome) continue;
              const oppTrack = getTrackIndex(opp.id, oppTok.step);
              if (oppTrack !== null) {
                const dist = (currentTrackIdx - oppTrack + 52) % 52;
                if (dist >= 1 && dist <= 6) {
                  underThreat = true;
                }
              }
            }
          }
          if (underThreat) {
            score += 40; // Escaping danger is a good move!
          }
        }
      }
    }

    // Add tiny random jitter to break ties naturally
    score += Math.random() * 2;

    if (score > bestScore) {
      bestScore = score;
      bestTokenId = tokenId;
    }
  }

  return bestTokenId;
}

/**
 * Calculates step-by-step path coordinates for smooth animated hopping from start to destination.
 */
export function getAnimationPath(color: PlayerColor, fromStep: number, toStep: number, tokenId: number): GridCoord[] {
  const path: GridCoord[] = [];

  if (fromStep === -1) {
    // Coming out of yard: hop from yard pocket straight to start tile (step 0)
    path.push(YARD_POCKETS[color][tokenId]);
    path.push(getTokenCoordinate(color, 0, tokenId));
    return path;
  }

  for (let s = fromStep; s <= toStep; s++) {
    path.push(getTokenCoordinate(color, s, tokenId));
  }

  return path;
}
