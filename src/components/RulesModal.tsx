import React from 'react';
import { X, CheckCircle2, Shield, Swords, Sparkles, Trophy } from 'lucide-react';
import { soundManager } from '../utils/audio';

interface RulesModalProps {
  onClose: () => void;
}

export const RulesModal: React.FC<RulesModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-6 sm:p-7 max-h-[88vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-5">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">How to Play My Ludo</h2>
            <p className="text-xs text-slate-400">Authentic international board rules</p>
          </div>
          <button
            type="button"
            onClick={() => {
              soundManager.playClick();
              onClose();
            }}
            className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Rules Grid */}
        <div className="space-y-4 text-sm text-slate-300">
          {/* Rule 1: Getting Started */}
          <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800/80 flex items-start gap-3">
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 shrink-0 mt-0.5">
              <Sparkles size={18} />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm mb-1">Rolling a 6</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                To move a token out of your Yard onto the starting tile, you must roll a <strong className="text-amber-400">6</strong>. Rolling a 6 also gives you an <strong className="text-amber-400">extra bonus turn</strong>!
              </p>
            </div>
          </div>

          {/* Rule 2: Safe Squares */}
          <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800/80 flex items-start gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 shrink-0 mt-0.5">
              <Shield size={18} />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm mb-1">Safe Star Squares (⭐)</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                The 8 starred squares (each player's starting square + 4 milestone stars) are safe zones. Tokens on safe squares can never be captured by opponents.
              </p>
            </div>
          </div>

          {/* Rule 3: Capturing Opponents */}
          <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800/80 flex items-start gap-3">
            <div className="p-2 rounded-lg bg-red-500/10 text-red-400 shrink-0 mt-0.5">
              <Swords size={18} />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm mb-1">Capturing & Knockouts</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                If your token lands on an opponent's token on a normal square, their token is knocked out and returned to their Yard. Capturing grants you an <strong className="text-emerald-400">extra roll</strong>!
              </p>
            </div>
          </div>

          {/* Rule 4: Home Stretch & Reaching Center */}
          <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800/80 flex items-start gap-3">
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 shrink-0 mt-0.5">
              <CheckCircle2 size={18} />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm mb-1">Home Stretch & Exact Roll</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                After completing the 52-tile circuit, tokens enter their color-coded Home Stretch. To reach the central Home triangle, you need an exact roll. Entering Home awards an <strong className="text-blue-400">extra roll</strong>!
              </p>
            </div>
          </div>

          {/* Rule 5: Winning the Game */}
          <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800/80 flex items-start gap-3">
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 shrink-0 mt-0.5">
              <Trophy size={18} />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm mb-1">Victory Condition</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                The first player to safely navigate all <strong className="text-white">4 tokens</strong> into the center Home triangle wins 1st place!
              </p>
            </div>
          </div>
        </div>

        {/* Close CTA */}
        <div className="mt-6 pt-4 border-t border-slate-800">
          <button
            type="button"
            onClick={() => {
              soundManager.playClick();
              onClose();
            }}
            className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs transition-colors cursor-pointer"
          >
            Got It!
          </button>
        </div>
      </div>
    </div>
  );
};
