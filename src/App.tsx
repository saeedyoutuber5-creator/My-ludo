/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Volume2,
  VolumeX,
  Music,
  RotateCcw,
  BookOpen,
  Pause,
  Play,
  Sparkles,
} from 'lucide-react';
import {
  GamePhase,
  GameSettings,
  GridCoord,
  Player,
  PlayerColor,
  Token,
} from './types/game';
import {
  findCaptures,
  getAnimationPath,
  getMovableTokens,
  getTokenCoordinate,
  isSafeSquare,
  pickBotMove,
} from './utils/ludoBoard';
import { soundManager } from './utils/audio';
import { LudoBoard } from './components/LudoBoard';
import { PlayerDiceStation } from './components/PlayerDiceStation';
import { TitleScreen } from './components/TitleScreen';
import { SetupModal } from './components/SetupModal';
import { VictoryModal } from './components/VictoryModal';
import { RulesModal } from './components/RulesModal';

const DEFAULT_PLAYERS: Player[] = [
  {
    id: 'red',
    name: 'Player 1',
    type: 'human',
    avatar: '🔴',
    tokens: [0, 1, 2, 3].map(id => ({ id, color: 'red', step: -1, isHome: false, inYard: true })),
    hasWon: false,
    stats: { sixesRolled: 0, tokensCaptured: 0, tokensLost: 0, tokensHome: 0 },
  },
  {
    id: 'green',
    name: 'Bot Green',
    type: 'bot',
    botDifficulty: 'tactical',
    avatar: '🟢',
    tokens: [0, 1, 2, 3].map(id => ({ id, color: 'green', step: -1, isHome: false, inYard: true })),
    hasWon: false,
    stats: { sixesRolled: 0, tokensCaptured: 0, tokensLost: 0, tokensHome: 0 },
  },
  {
    id: 'yellow',
    name: 'Bot Yellow',
    type: 'bot',
    botDifficulty: 'tactical',
    avatar: '🟡',
    tokens: [0, 1, 2, 3].map(id => ({ id, color: 'yellow', step: -1, isHome: false, inYard: true })),
    hasWon: false,
    stats: { sixesRolled: 0, tokensCaptured: 0, tokensLost: 0, tokensHome: 0 },
  },
  {
    id: 'blue',
    name: 'Bot Blue',
    type: 'bot',
    botDifficulty: 'tactical',
    avatar: '🔵',
    tokens: [0, 1, 2, 3].map(id => ({ id, color: 'blue', step: -1, isHome: false, inYard: true })),
    hasWon: false,
    stats: { sixesRolled: 0, tokensCaptured: 0, tokensLost: 0, tokensHome: 0 },
  },
];

export default function App() {
  const [phase, setPhase] = useState<GamePhase>('MENU');
  const [players, setPlayers] = useState<Player[]>(DEFAULT_PLAYERS);
  const [currentTurnIndex, setCurrentTurnIndex] = useState<number>(0);

  // Dice state
  const [diceValue, setDiceValue] = useState<number>(1);
  const [isRolling, setIsRolling] = useState<boolean>(false);
  const [canRoll, setCanRoll] = useState<boolean>(true);
  const [consecutiveSixes, setConsecutiveSixes] = useState<number>(0);
  const [lastRolls, setLastRolls] = useState<Record<PlayerColor, number>>({
    red: 1,
    green: 1,
    yellow: 1,
    blue: 1,
  });

  // Movable tokens highlight
  const [movableTokenIds, setMovableTokenIds] = useState<number[]>([]);

  // Token hopping animation
  const [animatingToken, setAnimatingToken] = useState<{
    color: PlayerColor;
    tokenId: number;
    coord: GridCoord;
  } | null>(null);

  // Game commentary & logs
  const [statusMessage, setStatusMessage] = useState<string>('Tap active dice to start!');
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [winner, setWinner] = useState<Player | null>(null);

  // Sound and BGM states
  const [soundEnabled, setSoundEnabled] = useState<boolean>(!soundManager.getMuted());
  const [bgmEnabled, setBgmEnabled] = useState<boolean>(soundManager.getBgm());

  // Settings
  const [settings, setSettings] = useState<GameSettings>({
    soundEnabled: true,
    fastMode: false,
    theme: 'classic',
    autoRollBot: true,
    consecutiveSixLimit: true,
  });

  // Modal states
  const [setupPreset, setSetupPreset] = useState<'pass_play' | 'vs_bot'>('pass_play');
  const [showRulesModal, setShowRulesModal] = useState<boolean>(false);

  const isExecutingMoveRef = useRef(false);
  const isRollingRef = useRef(false);
  const botTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Synchronized refs to prevent stale closure bugs in async timeouts
  const playersRef = useRef<Player[]>(players);
  const currentTurnIndexRef = useRef<number>(currentTurnIndex);
  const diceValueRef = useRef<number>(diceValue);

  useEffect(() => {
    playersRef.current = players;
  }, [players]);

  useEffect(() => {
    currentTurnIndexRef.current = currentTurnIndex;
  }, [currentTurnIndex]);

  useEffect(() => {
    diceValueRef.current = diceValue;
  }, [diceValue]);

  const activePlayer = players[currentTurnIndex] || players[0];

  const redPlayer = players.find(p => p.id === 'red');
  const greenPlayer = players.find(p => p.id === 'green');
  const bluePlayer = players.find(p => p.id === 'blue');
  const yellowPlayer = players.find(p => p.id === 'yellow');

  // Pass turn to next eligible player
  const advanceTurn = useCallback((reason?: string) => {
    setMovableTokenIds([]);
    setConsecutiveSixes(0);
    isExecutingMoveRef.current = false;
    isRollingRef.current = false;

    const currentPlayers = playersRef.current;
    if (currentPlayers.length === 0) return;

    // Find next player who hasn't won
    let nextIndex = (currentTurnIndexRef.current + 1) % currentPlayers.length;
    let loopCount = 0;
    while (currentPlayers[nextIndex]?.hasWon && loopCount < currentPlayers.length) {
      nextIndex = (nextIndex + 1) % currentPlayers.length;
      loopCount++;
    }

    currentTurnIndexRef.current = nextIndex;
    setCurrentTurnIndex(nextIndex);
    setCanRoll(true);

    const nextPlayer = currentPlayers[nextIndex];
    if (nextPlayer) {
      setStatusMessage(
        reason ? `${reason}. ${nextPlayer.name}'s turn!` : `${nextPlayer.name}'s turn to roll!`
      );
    }
  }, []);

  // Handle step-by-step movement
  const executeTokenMove = useCallback(
    (tokenId: number, overrideRoll?: number) => {
      if (isExecutingMoveRef.current) return;
      isExecutingMoveRef.current = true;
      setCanRoll(false);
      setMovableTokenIds([]);

      const player = playersRef.current[currentTurnIndexRef.current];
      if (!player) {
        isExecutingMoveRef.current = false;
        return;
      }
      const token = player.tokens[tokenId];
      if (!token) {
        isExecutingMoveRef.current = false;
        return;
      }

      const roll = overrideRoll !== undefined ? overrideRoll : diceValueRef.current;

      const fromStep = token.step;
      const targetStep = fromStep === -1 ? 0 : fromStep + roll;

      if (fromStep === -1) {
        soundManager.playTokenOut();
      }

      // Generate step-by-step path
      const path = getAnimationPath(player.id, fromStep, targetStep, tokenId);
      const stepDuration = settings.fastMode ? 65 : 120;

      let stepIdx = 0;
      const animateNextStep = () => {
        if (stepIdx < path.length) {
          setAnimatingToken({
            color: player.id,
            tokenId,
            coord: path[stepIdx],
          });
          soundManager.playTokenStep(stepIdx);
          stepIdx++;
          setTimeout(animateNextStep, stepDuration);
        } else {
          // Reached destination!
          setAnimatingToken(null);

          // Update player tokens state
          const isHome = targetStep === 56;
          let earnedBonusTurn = roll === 6;
          let commentary = `${player.name} moved a pawn!`;

          if (isHome) {
            soundManager.playHome();
            earnedBonusTurn = true;
            commentary = `🎉 ${player.name}'s pawn reached Home!`;
          }

          let gameWonPlayer: Player | null = null;

          setPlayers(prevPlayers => {
            const updated = prevPlayers.map(p => {
              if (p.id !== player.id) return p;

              const updatedTokens = p.tokens.map(t => {
                if (t.id === tokenId) {
                  return {
                    ...t,
                    step: targetStep,
                    inYard: false,
                    isHome: isHome,
                  };
                }
                return t;
              });

              const allHome = updatedTokens.every(t => t.isHome);
              const rank =
                allHome && !p.hasWon
                  ? prevPlayers.filter(pl => pl.hasWon).length + 1
                  : p.rank;

              const upPlayer = {
                ...p,
                tokens: updatedTokens,
                hasWon: p.hasWon || allHome,
                rank: rank,
                stats: {
                  ...p.stats,
                  tokensHome: isHome ? p.stats.tokensHome + 1 : p.stats.tokensHome,
                },
              };

              if (allHome && !p.hasWon) {
                gameWonPlayer = upPlayer;
              }

              return upPlayer;
            });

            // Check if captures occurred
            const captures = findCaptures(player.id, targetStep, updated);
            if (captures.length > 0) {
              soundManager.playCapture();
              earnedBonusTurn = true;
              commentary = `⚔️ ${player.name} knocked out an opponent! Bonus turn!`;

              captures.forEach(cap => {
                const targetPlayer = updated.find(p => p.id === cap.playerColor);
                if (targetPlayer) {
                  const targetTok = targetPlayer.tokens.find(t => t.id === cap.tokenId);
                  if (targetTok) {
                    targetTok.step = -1;
                    targetTok.inYard = true;
                    targetPlayer.stats.tokensLost++;
                  }
                }
              });

              // Credit capture stat
              const mover = updated.find(p => p.id === player.id);
              if (mover) {
                mover.stats.tokensCaptured += captures.length;
              }
            } else if (!isHome && targetStep <= 50) {
              // Check safe star
              const startIdx = [0, 13, 26, 39][['red', 'green', 'yellow', 'blue'].indexOf(player.id)];
              const trackIdx = (startIdx + targetStep) % 52;
              if (isSafeSquare(trackIdx)) {
                soundManager.playSafeStar();
              }
            }

            return updated;
          });

          if (gameWonPlayer) {
            setWinner(gameWonPlayer);
            setPhase('VICTORY');
          }

          setStatusMessage(commentary);
          isExecutingMoveRef.current = false;

          // Decide next turn
          setTimeout(() => {
            const currentHasWon = playersRef.current[currentTurnIndexRef.current]?.hasWon;
            if (earnedBonusTurn && !currentHasWon) {
              setCanRoll(true);
              setStatusMessage(`⭐ Bonus Roll for ${player.name}! Roll again.`);
            } else {
              advanceTurn();
            }
          }, 450);
        }
      };

      animateNextStep();
    },
    [settings.fastMode, advanceTurn]
  );

  // Roll Dice handler
  const handleRollDice = useCallback(() => {
    if (!canRoll || isRollingRef.current || isRolling || isPaused || isExecutingMoveRef.current) return;

    isRollingRef.current = true;
    setIsRolling(true);
    setCanRoll(false);
    setMovableTokenIds([]);

    const player = playersRef.current[currentTurnIndexRef.current];
    if (!player) {
      isRollingRef.current = false;
      setIsRolling(false);
      return;
    }

    // Roll random 1..6
    const roll = Math.floor(Math.random() * 6) + 1;

    setTimeout(() => {
      setDiceValue(roll);
      diceValueRef.current = roll;
      setIsRolling(false);
      isRollingRef.current = false;
      setLastRolls(prev => ({ ...prev, [player.id]: roll }));

      // Track consecutive sixes
      let newSixCount = roll === 6 ? consecutiveSixes + 1 : 0;
      setConsecutiveSixes(newSixCount);

      if (roll === 6) {
        setPlayers(prev =>
          prev.map(p =>
            p.id === player.id
              ? { ...p, stats: { ...p.stats, sixesRolled: p.stats.sixesRolled + 1 } }
              : p
          )
        );
      }

      // Check 3 consecutive sixes penalty
      if (settings.consecutiveSixLimit && newSixCount === 3) {
        setStatusMessage(`⚠️ 3 consecutive sixes! ${player.name} forfeits turn.`);
        setTimeout(() => {
          advanceTurn('Turn forfeited');
        }, 1100);
        return;
      }

      // Find movable tokens
      const movable = getMovableTokens(player, roll);

      if (movable.length === 0) {
        setStatusMessage(`${player.name} rolled a ${roll}. No moves possible!`);
        setTimeout(() => {
          advanceTurn();
        }, 1000);
      } else {
        setMovableTokenIds(movable);
        setStatusMessage(`${player.name} rolled a ${roll}! Pick a pawn to move.`);

        // If it's a Bot's turn, bot automatically picks its best move!
        if (player.type === 'bot') {
          const chosenTokenId = pickBotMove(player, roll, playersRef.current, player.botDifficulty);
          if (chosenTokenId !== null) {
            botTimeoutRef.current = setTimeout(
              () => {
                executeTokenMove(chosenTokenId, roll);
              },
              settings.fastMode ? 350 : 650
            );
          }
        }
      }
    }, 600);
  }, [
    canRoll,
    isRolling,
    isPaused,
    consecutiveSixes,
    settings,
    advanceTurn,
    executeTokenMove,
  ]);

  // Handle Bot Turn automatically when canRoll is true
  useEffect(() => {
    if (phase !== 'PLAYING' || isPaused || isRolling || !canRoll) return;

    const player = players[currentTurnIndex];
    if (player && player.type === 'bot' && !player.hasWon) {
      if (botTimeoutRef.current) clearTimeout(botTimeoutRef.current);
      botTimeoutRef.current = setTimeout(
        () => {
          handleRollDice();
        },
        settings.fastMode ? 400 : 750
      );
    }

    return () => {
      if (botTimeoutRef.current) {
        clearTimeout(botTimeoutRef.current);
      }
    };
  }, [phase, currentTurnIndex, canRoll, isRolling, isPaused, players, handleRollDice, settings.fastMode]);

  // Keyboard shortcut: Space / Enter to roll dice
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (phase !== 'PLAYING') return;

      if ((e.code === 'Space' || e.code === 'Enter') && canRoll && !isRolling) {
        const player = players[currentTurnIndex];
        if (player && player.type === 'human') {
          e.preventDefault();
          handleRollDice();
        }
      } else if (e.code === 'Escape') {
        setIsPaused(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [phase, canRoll, isRolling, currentTurnIndex, players, handleRollDice]);

  // Start Quick 2-Player Match (You vs Bot Yellow)
  const startTwoPlayerVsBot = () => {
    const twoPlayers: Player[] = [
      {
        id: 'red',
        name: 'You',
        type: 'human',
        avatar: '🔴',
        tokens: [0, 1, 2, 3].map(id => ({ id, color: 'red', step: -1, isHome: false, inYard: true })),
        hasWon: false,
        stats: { sixesRolled: 0, tokensCaptured: 0, tokensLost: 0, tokensHome: 0 },
      },
      {
        id: 'yellow',
        name: 'Bot Yellow',
        type: 'bot',
        botDifficulty: 'tactical',
        avatar: '🟡',
        tokens: [0, 1, 2, 3].map(id => ({ id, color: 'yellow', step: -1, isHome: false, inYard: true })),
        hasWon: false,
        stats: { sixesRolled: 0, tokensCaptured: 0, tokensLost: 0, tokensHome: 0 },
      },
    ];

    setPlayers(twoPlayers);
    setCurrentTurnIndex(0);
    setCanRoll(true);
    setMovableTokenIds([]);
    setDiceValue(1);
    setLastRolls({ red: 1, green: 1, yellow: 1, blue: 1 });
    setWinner(null);
    setPhase('PLAYING');
    setStatusMessage('2-Player match started! Tap your Red Dice to roll.');
  };

  // Start Quick 2-Player Pass & Play (2 Humans)
  const startTwoPlayerPassPlay = () => {
    const twoPlayers: Player[] = [
      {
        id: 'red',
        name: 'Player 1',
        type: 'human',
        avatar: '🔴',
        tokens: [0, 1, 2, 3].map(id => ({ id, color: 'red', step: -1, isHome: false, inYard: true })),
        hasWon: false,
        stats: { sixesRolled: 0, tokensCaptured: 0, tokensLost: 0, tokensHome: 0 },
      },
      {
        id: 'yellow',
        name: 'Player 2',
        type: 'human',
        avatar: '🟡',
        tokens: [0, 1, 2, 3].map(id => ({ id, color: 'yellow', step: -1, isHome: false, inYard: true })),
        hasWon: false,
        stats: { sixesRolled: 0, tokensCaptured: 0, tokensLost: 0, tokensHome: 0 },
      },
    ];

    setPlayers(twoPlayers);
    setCurrentTurnIndex(0);
    setCanRoll(true);
    setMovableTokenIds([]);
    setDiceValue(1);
    setLastRolls({ red: 1, green: 1, yellow: 1, blue: 1 });
    setWinner(null);
    setPhase('PLAYING');
    setStatusMessage('2-Player Pass & Play! Player 1 (Red) tap your Dice.');
  };

  // Start Quick Play (1 Human vs 3 Bots)
  const startQuickPlay = () => {
    const quickPlayers: Player[] = [
      {
        id: 'red',
        name: 'You',
        type: 'human',
        avatar: '🔴',
        tokens: [0, 1, 2, 3].map(id => ({ id, color: 'red', step: -1, isHome: false, inYard: true })),
        hasWon: false,
        stats: { sixesRolled: 0, tokensCaptured: 0, tokensLost: 0, tokensHome: 0 },
      },
      {
        id: 'green',
        name: 'Bot Green',
        type: 'bot',
        botDifficulty: 'tactical',
        avatar: '🟢',
        tokens: [0, 1, 2, 3].map(id => ({ id, color: 'green', step: -1, isHome: false, inYard: true })),
        hasWon: false,
        stats: { sixesRolled: 0, tokensCaptured: 0, tokensLost: 0, tokensHome: 0 },
      },
      {
        id: 'yellow',
        name: 'Bot Yellow',
        type: 'bot',
        botDifficulty: 'tactical',
        avatar: '🟡',
        tokens: [0, 1, 2, 3].map(id => ({ id, color: 'yellow', step: -1, isHome: false, inYard: true })),
        hasWon: false,
        stats: { sixesRolled: 0, tokensCaptured: 0, tokensLost: 0, tokensHome: 0 },
      },
      {
        id: 'blue',
        name: 'Bot Blue',
        type: 'bot',
        botDifficulty: 'tactical',
        avatar: '🔵',
        tokens: [0, 1, 2, 3].map(id => ({ id, color: 'blue', step: -1, isHome: false, inYard: true })),
        hasWon: false,
        stats: { sixesRolled: 0, tokensCaptured: 0, tokensLost: 0, tokensHome: 0 },
      },
    ];

    setPlayers(quickPlayers);
    setCurrentTurnIndex(0);
    setCanRoll(true);
    setMovableTokenIds([]);
    setDiceValue(1);
    setLastRolls({ red: 1, green: 1, yellow: 1, blue: 1 });
    setWinner(null);
    setPhase('PLAYING');
    setStatusMessage('Match started! Tap Red’s Dice outside to roll.');
  };

  // Start Custom match from Setup Modal
  const startCustomGame = (configuredPlayers: Player[]) => {
    setPlayers(configuredPlayers);
    setCurrentTurnIndex(0);
    setCanRoll(true);
    setMovableTokenIds([]);
    setDiceValue(1);
    setLastRolls({ red: 1, green: 1, yellow: 1, blue: 1 });
    setWinner(null);
    setPhase('PLAYING');
    setStatusMessage(`${configuredPlayers[0].name}’s turn! Tap their outer Dice to roll.`);
  };

  const restartMatch = () => {
    soundManager.playClick();
    const resetPlayers = players.map(p => ({
      ...p,
      hasWon: false,
      rank: undefined,
      tokens: [0, 1, 2, 3].map(tid => ({
        id: tid,
        color: p.id,
        step: -1,
        isHome: false,
        inYard: true,
      })),
      stats: { sixesRolled: 0, tokensCaptured: 0, tokensLost: 0, tokensHome: 0 },
    }));

    setPlayers(resetPlayers);
    setCurrentTurnIndex(0);
    setCanRoll(true);
    setMovableTokenIds([]);
    setLastRolls({ red: 1, green: 1, yellow: 1, blue: 1 });
    setWinner(null);
    setPhase('PLAYING');
    setStatusMessage('Match reset! Tap active player dice to start.');
  };

  // Render Title Screen
  if (phase === 'MENU') {
    return (
      <>
        <TitleScreen
          onStartQuickPlay={startQuickPlay}
          onStartTwoPlayerVsBot={startTwoPlayerVsBot}
          onStartTwoPlayerPassPlay={startTwoPlayerPassPlay}
          onOpenSetup={preset => {
            setSetupPreset(preset || 'pass_play');
            setPhase('SETUP');
          }}
          onOpenRules={() => setShowRulesModal(true)}
          settings={settings}
          onUpdateSettings={newS => setSettings(prev => ({ ...prev, ...newS }))}
        />
        {showRulesModal && <RulesModal onClose={() => setShowRulesModal(false)} />}
      </>
    );
  }

  // Active Game Playfield (With 4 Separate Outer Dice Stations!)
  return (
    <div className="relative w-full h-[100dvh] max-h-[100dvh] bg-slate-950 flex flex-col justify-between overflow-hidden select-none">
      {/* Sleek Top Bar */}
      <header className="w-full px-3 py-2 sm:px-4 sm:py-2.5 bg-slate-900/95 border-b border-slate-800/80 backdrop-blur-md flex items-center justify-between z-30 shrink-0">
        {/* Left: Brand Wordmark */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              soundManager.playClick();
              setPhase('MENU');
            }}
            className="flex items-center gap-1.5 group cursor-pointer"
            title="Return to Main Menu"
          >
            <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-gradient-to-tr from-amber-500 to-yellow-300 text-slate-950 font-black flex items-center justify-center text-xs shadow-md">
              🎲
            </div>
            <span className="font-extrabold text-sm sm:text-base tracking-tight text-white group-hover:text-amber-400 transition-colors">
              MY LUDO
            </span>
          </button>
        </div>

        {/* Center: Live Turn Status Banner */}
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-950/90 border border-slate-800 text-[11px] sm:text-xs max-w-[50%] sm:max-w-none truncate">
          <span
            className={`w-2 h-2 rounded-full shrink-0 ${
              activePlayer.id === 'red'
                ? 'bg-rose-500'
                : activePlayer.id === 'green'
                ? 'bg-emerald-500'
                : activePlayer.id === 'yellow'
                ? 'bg-amber-400'
                : 'bg-sky-500'
            } animate-pulse`}
          />
          <span className="font-semibold text-slate-200 truncate">
            {statusMessage}
          </span>
        </div>

        {/* Right: Music, SFX, Rules, Restart, Pause */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* BGM Music Toggle */}
          <button
            type="button"
            onClick={() => {
              const next = !bgmEnabled;
              soundManager.setBgm(next);
              setBgmEnabled(next);
              soundManager.playClick();
            }}
            className={`p-1.5 sm:p-2 rounded-lg border transition-colors cursor-pointer ${
              bgmEnabled
                ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                : 'bg-slate-800 border-slate-700 text-slate-500 hover:text-slate-300'
            }`}
            title={bgmEnabled ? 'Turn Music Off' : 'Turn Music On'}
          >
            <Music size={15} />
          </button>

          {/* Sound FX Toggle */}
          <button
            type="button"
            onClick={() => {
              const next = !soundEnabled;
              soundManager.setMuted(!next);
              setSoundEnabled(next);
              soundManager.playClick();
            }}
            className="p-1.5 sm:p-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title={soundEnabled ? 'Mute SFX' : 'Unmute SFX'}
          >
            {soundEnabled ? <Volume2 size={15} /> : <VolumeX size={15} />}
          </button>

          {/* Rules */}
          <button
            type="button"
            onClick={() => {
              soundManager.playClick();
              setShowRulesModal(true);
            }}
            className="p-1.5 sm:p-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer hidden xs:flex"
            title="Rules"
          >
            <BookOpen size={15} />
          </button>

          {/* Restart */}
          <button
            type="button"
            onClick={restartMatch}
            className="p-1.5 sm:p-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Restart Match"
          >
            <RotateCcw size={15} />
          </button>

          {/* Pause / Resume */}
          <button
            type="button"
            onClick={() => {
              soundManager.playClick();
              setIsPaused(prev => !prev);
            }}
            className="p-1.5 sm:p-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title={isPaused ? 'Resume' : 'Pause'}
          >
            {isPaused ? <Play size={15} /> : <Pause size={15} />}
          </button>
        </div>
      </header>

      {/* Main Game Arena: Perfectly Aligned 4 Player Areas + 15x15 Luxury Ludo Board */}
      <main className="flex-1 w-full max-w-[480px] mx-auto flex flex-col justify-between items-center px-2 py-1 overflow-hidden select-none">
        {/* Top Outer Dice Row: Aligned directly above Red Home (left 42%) and Green Home (right 42%) */}
        <div className="w-full flex items-center justify-between shrink-0 py-0.5">
          <div className="w-[42%] min-h-[58px] sm:min-h-[62px]">
            {redPlayer ? (
              <PlayerDiceStation
                player={redPlayer}
                isActive={activePlayer.id === 'red'}
                canRoll={canRoll && activePlayer.id === 'red' && redPlayer.type === 'human' && !isPaused}
                isRolling={isRolling && activePlayer.id === 'red'}
                diceValue={activePlayer.id === 'red' ? diceValue : lastRolls.red}
                onRoll={handleRollDice}
                position="top-left"
              />
            ) : (
              <div className="w-full h-[58px] sm:h-[62px] px-2 py-1 rounded-2xl border border-slate-800/40 bg-slate-950/40 backdrop-blur-sm flex items-center justify-center select-none text-slate-600">
                <span className="text-[10px] sm:text-[11px] text-slate-600 font-mono tracking-wider uppercase">Inactive</span>
              </div>
            )}
          </div>

          {/* 16% Gap matching center track arm */}
          <div className="w-[16%]" />

          <div className="w-[42%] min-h-[58px] sm:min-h-[62px]">
            {greenPlayer ? (
              <PlayerDiceStation
                player={greenPlayer}
                isActive={activePlayer.id === 'green'}
                canRoll={canRoll && activePlayer.id === 'green' && greenPlayer.type === 'human' && !isPaused}
                isRolling={isRolling && activePlayer.id === 'green'}
                diceValue={activePlayer.id === 'green' ? diceValue : lastRolls.green}
                onRoll={handleRollDice}
                position="top-right"
              />
            ) : (
              <div className="w-full h-[58px] sm:h-[62px] px-2 py-1 rounded-2xl border border-slate-800/40 bg-slate-950/40 backdrop-blur-sm flex items-center justify-center select-none text-slate-600">
                <span className="text-[10px] sm:text-[11px] text-slate-600 font-mono tracking-wider uppercase">Inactive</span>
              </div>
            )}
          </div>
        </div>

        {/* Center: The 15x15 Luxury Ludo Board with Traditional Large 3D Pawns */}
        <div className="w-full flex-1 flex items-center justify-center min-h-0 my-0.5">
          <LudoBoard
            players={players}
            activeColor={activePlayer.id}
            movableTokenIds={movableTokenIds}
            animatingToken={animatingToken}
            onTokenClick={executeTokenMove}
            theme={settings.theme}
          />
        </div>

        {/* Bottom Outer Dice Row: Aligned directly below Blue Home (left 42%) and Yellow Home (right 42%) */}
        <div className="w-full flex items-center justify-between shrink-0 py-0.5">
          <div className="w-[42%] min-h-[58px] sm:min-h-[62px]">
            {bluePlayer ? (
              <PlayerDiceStation
                player={bluePlayer}
                isActive={activePlayer.id === 'blue'}
                canRoll={canRoll && activePlayer.id === 'blue' && bluePlayer.type === 'human' && !isPaused}
                isRolling={isRolling && activePlayer.id === 'blue'}
                diceValue={activePlayer.id === 'blue' ? diceValue : lastRolls.blue}
                onRoll={handleRollDice}
                position="bottom-left"
              />
            ) : (
              <div className="w-full h-[58px] sm:h-[62px] px-2 py-1 rounded-2xl border border-slate-800/40 bg-slate-950/40 backdrop-blur-sm flex items-center justify-center select-none text-slate-600">
                <span className="text-[10px] sm:text-[11px] text-slate-600 font-mono tracking-wider uppercase">Inactive</span>
              </div>
            )}
          </div>

          {/* 16% Gap matching center track arm */}
          <div className="w-[16%]" />

          <div className="w-[42%] min-h-[58px] sm:min-h-[62px]">
            {yellowPlayer ? (
              <PlayerDiceStation
                player={yellowPlayer}
                isActive={activePlayer.id === 'yellow'}
                canRoll={canRoll && activePlayer.id === 'yellow' && yellowPlayer.type === 'human' && !isPaused}
                isRolling={isRolling && activePlayer.id === 'yellow'}
                diceValue={activePlayer.id === 'yellow' ? diceValue : lastRolls.yellow}
                onRoll={handleRollDice}
                position="bottom-right"
              />
            ) : (
              <div className="w-full h-[58px] sm:h-[62px] px-2 py-1 rounded-2xl border border-slate-800/40 bg-slate-950/40 backdrop-blur-sm flex items-center justify-center select-none text-slate-600">
                <span className="text-[10px] sm:text-[11px] text-slate-600 font-mono tracking-wider uppercase">Inactive</span>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer Minimal Control Hint Line */}
      <footer className="w-full py-1.5 px-3 text-center border-t border-slate-900 bg-slate-950/90 text-[10px] sm:text-[11px] text-slate-400 font-mono shrink-0">
        Tap Your Active Dice or Press Space to Roll · Traditional Ludo Pawns Move on Valid Roll
      </footer>

      {/* Pause Screen Overlay */}
      {isPaused && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-xs w-full text-center shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-xl font-bold text-white mb-2">Game Paused</h3>
            <p className="text-xs text-slate-400 mb-6">Match progress is safely held.</p>

            <div className="space-y-2.5">
              <button
                type="button"
                onClick={() => {
                  soundManager.playClick();
                  setIsPaused(false);
                }}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-bold text-sm hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer shadow-lg shadow-amber-500/20"
              >
                Resume Match
              </button>
              <button
                type="button"
                onClick={restartMatch}
                className="w-full py-2.5 rounded-xl bg-slate-800 text-slate-200 font-semibold text-sm hover:text-white transition-colors cursor-pointer"
              >
                Restart Match
              </button>
              <button
                type="button"
                onClick={() => {
                  soundManager.playClick();
                  setPhase('MENU');
                }}
                className="w-full py-2.5 rounded-xl bg-slate-800 text-slate-400 font-semibold text-sm hover:text-white transition-colors cursor-pointer"
              >
                Quit to Menu
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Match Setup Modal */}
      {phase === 'SETUP' && (
        <SetupModal
          initialPreset={setupPreset}
          onStartGame={startCustomGame}
          onClose={() => setPhase('MENU')}
        />
      )}

      {/* Rules Modal */}
      {showRulesModal && <RulesModal onClose={() => setShowRulesModal(false)} />}

      {/* Victory Celebration Modal */}
      {phase === 'VICTORY' && winner && (
        <VictoryModal
          winner={winner}
          allPlayers={players}
          onPlayAgain={restartMatch}
          onMainMenu={() => {
            soundManager.playClick();
            setPhase('MENU');
          }}
        />
      )}
    </div>
  );
}
