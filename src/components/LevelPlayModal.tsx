import React, { useState, useEffect, useRef } from 'react';
import { Level } from '../types';
import { simulateMiniGame, SimulationOutcome } from '../utils/gameSimulator';
import { MiniGameArena } from './minigames/MiniGameArena';
import { 
  Play, 
  RotateCcw, 
  Lightbulb, 
  CheckCircle2, 
  ArrowRight, 
  X, 
  BookOpen, 
  Code2, 
  Sparkles, 
  Terminal, 
  Eye,
  Scroll,
  Shield,
  Indent,
  Zap,
  Maximize2,
  Minimize2
} from 'lucide-react';
import { sound } from '../utils/sound';
import { motion } from 'motion/react';

interface LevelPlayModalProps {
  level: Level;
  onClose: () => void;
  onCompleteLevel: (level: Level, stars: number, xpEarned: number) => void;
}

export const LevelPlayModal: React.FC<LevelPlayModalProps> = ({
  level,
  onClose,
  onCompleteLevel,
}) => {
  const tut = level.tutorial;
  const cfg = level.gameConfig;

  const [activeTab, setActiveTab] = useState<'tutorial' | 'game'>('tutorial');
  const [userCode, setUserCode] = useState<string>(cfg.starterCode);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [simulationOutcome, setSimulationOutcome] = useState<SimulationOutcome | null>(null);
  const [showHintIndex, setShowHintIndex] = useState<number>(-1);
  const [showSolutionModal, setShowSolutionModal] = useState<boolean>(false);
  const [isVictorious, setIsVictorious] = useState<boolean>(false);
  const [earnedStars, setEarnedStars] = useState<number>(3);
  const [d20BonusXp, setD20BonusXp] = useState<number>(0);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setUserCode(cfg.starterCode);
    setSimulationOutcome(null);
    setShowHintIndex(-1);
    setShowSolutionModal(false);
    setIsVictorious(false);
    setD20BonusXp(0);
  }, [level.id]);

  const handleInsertTab = () => {
    sound.click();
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const value = textarea.value;
    const indent = '    ';
    const newValue = value.substring(0, start) + indent + value.substring(end);
    setUserCode(newValue);
    setTimeout(() => {
      textarea.focus();
      textarea.selectionStart = textarea.selectionEnd = start + indent.length;
    }, 0);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const target = e.currentTarget;
      const start = target.selectionStart;
      const end = target.selectionEnd;
      const value = target.value;
      const indent = '    '; // Standard 4 spaces in Python

      if (e.shiftKey) {
        // Shift+Tab: Unindent current line
        const before = value.substring(0, start);
        const lastNewline = before.lastIndexOf('\n');
        const lineStart = lastNewline === -1 ? 0 : lastNewline + 1;
        const lineSlice = value.substring(lineStart, lineStart + 4);
        const spacesToRemove = lineSlice.match(/^ +/)?.[0].length || 0;
        if (spacesToRemove > 0) {
          const toRemove = Math.min(4, spacesToRemove);
          const newValue = value.substring(0, lineStart) + value.substring(lineStart + toRemove);
          setUserCode(newValue);
          setTimeout(() => {
            target.selectionStart = Math.max(lineStart, start - toRemove);
            target.selectionEnd = Math.max(lineStart, end - toRemove);
          }, 0);
        }
      } else {
        // Tab: Insert 4 spaces
        const newValue = value.substring(0, start) + indent + value.substring(end);
        setUserCode(newValue);
        setTimeout(() => {
          target.selectionStart = target.selectionEnd = start + indent.length;
        }, 0);
      }
    } else if (e.key === 'Enter') {
      // Smart Auto-indentation for Python
      const target = e.currentTarget;
      const start = target.selectionStart;
      const value = target.value;
      const beforeCursor = value.substring(0, start);
      const currentLine = beforeCursor.split('\n').pop() || '';
      
      const matchIndent = currentLine.match(/^(\s*)/);
      const currentIndent = matchIndent ? matchIndent[1] : '';

      // If line ends with ':' (Python block statement: if, else, for, while, def, elif), add 4 extra spaces
      const trimmed = currentLine.trim();
      if (trimmed.endsWith(':')) {
        e.preventDefault();
        const newIndent = currentIndent + '    ';
        const newValue = value.substring(0, start) + '\n' + newIndent + value.substring(start);
        setUserCode(newValue);
        setTimeout(() => {
          target.selectionStart = target.selectionEnd = start + 1 + newIndent.length;
        }, 0);
      } else if (currentIndent.length > 0) {
        // Maintain indentation
        e.preventDefault();
        const newValue = value.substring(0, start) + '\n' + currentIndent + value.substring(start);
        setUserCode(newValue);
        setTimeout(() => {
          target.selectionStart = target.selectionEnd = start + 1 + currentIndent.length;
        }, 0);
      }
    }
  };

  const handleResetCode = () => {
    sound.click();
    setUserCode(cfg.starterCode);
    setSimulationOutcome(null);
  };

  const handleCopyCodeToEditor = (codeSnippet: string) => {
    sound.click();
    setUserCode(codeSnippet);
    setActiveTab('game');
  };

  const handleRunSimulation = () => {
    sound.click();
    setIsPlaying(true);
    setSimulationOutcome(null);

    // Simulate Python environment execution
    setTimeout(() => {
      const outcome = simulateMiniGame(level, userCode);
      setSimulationOutcome(outcome);
      setIsPlaying(false);

      if (outcome.success) {
        sound.levelComplete();
        const stars = showSolutionModal ? 1 : showHintIndex >= 0 ? 2 : 3;
        setEarnedStars(stars);
        // Victory triggers after tactical sequence
      } else {
        sound.wrong();
      }
    }, 450);
  };

  const handleSimulationFinished = () => {
    if (simulationOutcome?.success) {
      setTimeout(() => {
        setIsVictorious(true);
      }, 500);
    }
  };

  const handleAdvanceLevel = () => {
    sound.click();
    const baseReward = Math.round((level.xpReward || 50) * (earnedStars / 3));
    const totalReward = baseReward + d20BonusXp;
    onCompleteLevel(level, earnedStars, totalReward);
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.22, ease: 'easeOut' }}
      className={`fixed inset-0 z-50 bg-[#1a0f08]/85 backdrop-blur-sm flex items-center justify-center overflow-y-auto transition-all ${
        isFullscreen ? 'p-0' : 'p-1.5 sm:p-3 md:p-4'
      }`}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 8 }}
        transition={{ duration: 0.22, ease: 'easeOut' }}
        className={`parchment-sheet shadow-2xl flex flex-col overflow-hidden text-[#292218] transition-all duration-200 ${
          isFullscreen
            ? 'w-full h-full max-w-none max-h-none rounded-none border-0'
            : 'w-full max-w-[97vw] 2xl:max-w-[95vw] max-h-[96vh] border-2 border-[#b8864a] rounded-2xl sm:rounded-3xl'
        }`}
      >
        {/* Modal Header (Leather & Brass Bar) */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b-2 border-[#855d34] bg-[#2d1b10] text-amber-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#442918] border border-[#b8864a] flex items-center justify-center text-amber-300 shadow-sm">
              <Scroll size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-rpg-title font-bold text-amber-200">{level.title}</h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#442918] text-amber-300 border border-[#855d34]">
                  +{level.xpReward} XP
                </span>
                {d20BonusXp > 0 && (
                  <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 text-stone-950 font-bold border border-amber-200 shadow-sm flex items-center gap-1 animate-pulse">
                    <Zap size={11} className="fill-stone-950" />
                    <span>Potenciador D20: +{d20BonusXp} XP</span>
                  </span>
                )}
              </div>
              <p className="text-xs text-stone-300 font-serif hidden sm:block">{level.subtitle}</p>
            </div>
          </div>

          {/* Navigation Tab Bookmarks */}
          <div className="flex items-center gap-1 bg-[#1c1009] p-1 rounded-xl border border-[#855d34]">
            <button
              onClick={() => {
                sound.click();
                setActiveTab('tutorial');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-serif font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'tutorial'
                  ? 'bg-[#b45309] text-amber-100 shadow-sm border border-amber-400/40'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              <BookOpen size={14} />
              <span>1. Grimorio (Tutorial)</span>
            </button>
            <button
              onClick={() => {
                sound.click();
                setActiveTab('game');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-serif font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'game'
                  ? 'bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 text-stone-950 shadow-md'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              <Play size={14} className={activeTab === 'game' ? 'fill-stone-950' : ''} />
              <span>2. Tablero de Rol (Reto)</span>
            </button>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => {
                sound.click();
                setIsFullscreen((prev) => !prev);
              }}
              className="p-1.5 rounded-lg text-stone-300 hover:text-amber-100 hover:bg-[#442918] transition-all cursor-pointer"
              title={isFullscreen ? 'Salir de pantalla completa' : 'Ver a pantalla completa'}
            >
              {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-stone-300 hover:text-amber-100 hover:bg-[#442918] transition-all cursor-pointer"
              title="Cerrar ventana de misión"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* RPG Encounter Briefing Card */}
          {level.rpgContext && (
            <div className="rounded-2xl border-2 border-[#b8864a] bg-[#f5ecdd] overflow-hidden shadow-md w-full">
              <div className="flex flex-col md:flex-row">
                {level.rpgContext.sceneImage && (
                  <div className="md:w-72 lg:w-80 xl:w-96 h-44 md:h-auto relative overflow-hidden shrink-0 border-b md:border-b-0 md:border-r-2 border-[#b8864a]">
                    <img
                      src={level.rpgContext.sceneImage}
                      alt={level.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover object-center hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-[#2a170c]/80 via-transparent to-transparent pointer-events-none" />
                    {level.rpgContext.diceCheck && (
                      <div className="absolute bottom-2 left-2 right-2 bg-[#2a170c]/90 border border-[#b45309] rounded-lg px-2.5 py-1 text-[11px] font-mono text-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-1 shadow">
                        <span>{level.rpgContext.diceCheck}</span>
                        <span className="text-[10px] text-amber-300 font-serif font-bold flex items-center gap-1">
                          ⚡ ¡Supera la tirada D20 para activar un Potenciador Temporal de XP!
                        </span>
                      </div>
                    )}
                  </div>
                )}
                <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3 font-serif">
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className="px-2.5 py-0.5 rounded-md bg-[#eaddc7] border border-[#855d34]/40 text-[#78350f] text-[11px] font-mono font-bold flex items-center gap-1">
                        <span>🛡️</span> {level.rpgContext.partyRole}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-md bg-[#eaddc7] border border-[#855d34]/40 text-[#1e3a8a] text-[11px] font-mono font-bold">
                        🎯 {level.rpgContext.tacticalGoal}
                      </span>
                    </div>
                    <div className="space-y-1.5">
                      <h4 className="text-xs font-rpg-title font-bold text-[#78350f] uppercase tracking-wider flex items-center gap-1.5">
                        <span>🎲</span> Situación de Partida según el Máster:
                      </h4>
                      <p className="text-xs sm:text-sm text-[#2b170c] leading-relaxed italic bg-[#fffcf5] p-3 rounded-xl border border-[#d8c8b0] shadow-inner">
                        "{level.rpgContext.dmNarrative}"
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 1: TUTORIAL DIDÁCTICO (GRIMORIO ARCANO) */}
          {activeTab === 'tutorial' && (
            <div className="w-full space-y-6 animate-fadeIn">
              {/* Theory Concept Card - Grimorio Arcano */}
              <div className="bg-[#fffdf8] rounded-2xl border-2 border-[#cfbeaa] p-5 sm:p-6 lg:p-7 space-y-4 shadow-md relative overflow-hidden font-serif w-full">
                <div className="flex items-center gap-2 text-[#854d0e] text-xs font-rpg-title font-bold tracking-wider uppercase">
                  <Sparkles size={16} className="text-[#b45309]" />
                  <span>Grimorio de Python • Sabiduría y Reglas del Juego</span>
                </div>
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold font-rpg-title text-[#2b170c] tracking-tight">
                  {tut.conceptTitle}
                </h2>
                <p className="text-sm sm:text-base text-[#3b2b1d] leading-relaxed">
                  {tut.conceptSummary}
                </p>

                {/* Syntax Snippet Block */}
                <div className="relative group rounded-xl bg-[#20140b] border border-[#855d34] p-4 font-mono text-xs sm:text-sm text-amber-200 overflow-x-auto shadow-inner">
                  <div className="flex justify-between items-center text-[10px] sm:text-xs text-stone-400 uppercase tracking-wider mb-2 font-serif border-b border-[#855d34]/60 pb-1.5">
                    <span className="flex items-center gap-1 text-amber-300 font-bold">
                      <span>📜</span> Fórmula / Sintaxis Python
                    </span>
                    <span className="font-mono text-stone-400">Regla Estricta</span>
                  </div>
                  <pre className="whitespace-pre text-amber-300 font-mono">{tut.syntaxSnippet}</pre>
                </div>

                <div className="text-sm sm:text-base text-[#3b2b1d] leading-relaxed pt-1">
                  {tut.explanation}
                </div>
              </div>

              {/* Responsive 2-column grid for Code Example & Tactical Master Tips on wider screens */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch w-full">
                {/* Code Example with Action */}
                <div className="bg-[#f7f0e3] rounded-2xl border border-[#cfbeaa] p-5 lg:p-6 space-y-3 font-serif flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs sm:text-sm font-rpg-title font-bold text-[#78350f] uppercase tracking-wider flex items-center gap-2">
                        <span>⚔️</span> Ejemplo de Jugada para la Partida
                      </h4>
                      {level.id === 'w1_l1' && (
                        <button
                          onClick={() => handleCopyCodeToEditor(tut.codeExample)}
                          className="text-xs text-amber-900 hover:text-amber-950 font-bold flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#f0e3cf] border border-[#855d34]/50 hover:bg-[#e4d3ba] transition-all shadow-sm cursor-pointer"
                          title="Copiar hechizo de introducción"
                        >
                          <span>Copiar Hechizo al Editor</span>
                          <ArrowRight size={13} />
                        </button>
                      )}
                    </div>
                    <div className="rounded-xl bg-[#1c120a] p-4 font-mono text-xs sm:text-sm text-emerald-300 border border-[#855d34] overflow-x-auto shadow-inner">
                      <pre className="whitespace-pre">{tut.codeExample}</pre>
                    </div>
                  </div>
                </div>

                {/* Key Takeaway Points */}
                <div className="bg-[#f7f0e3] rounded-2xl border border-[#cfbeaa] p-5 lg:p-6 font-serif flex flex-col justify-between">
                  <div>
                    <h4 className="text-xs sm:text-sm font-rpg-title font-bold text-[#78350f] uppercase tracking-wider mb-3 flex items-center gap-2">
                      <Lightbulb size={16} className="text-[#b45309]" />
                      <span>Consejos Tácticos del Máster</span>
                    </h4>
                    <ul className="space-y-2.5 text-xs sm:text-sm text-[#3b2b1d]">
                      {tut.keyPoints.map((kp, idx) => (
                        <li key={idx} className="flex items-start gap-2.5">
                          <span className="w-2 h-2 rounded-full bg-[#b45309] mt-1.5 shrink-0" />
                          <span>{kp}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Bottom CTA to start the minigame challenge */}
              <div className="flex justify-end pt-2">
                <button
                  onClick={() => {
                    sound.click();
                    setActiveTab('game');
                  }}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#b45309] via-[#d97706] to-[#b45309] text-amber-100 font-serif font-bold text-sm flex items-center gap-2 hover:brightness-110 shadow-lg shadow-amber-950/20 active:scale-95 transition-all cursor-pointer border border-amber-300/30"
                >
                  <span>¡Hechizo Aprendido! Ir al Tablero de Rol</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: RETO TABLERO DE ROL EN MODO TEXTO */}
          {activeTab === 'game' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start animate-fadeIn w-full">
              {/* LEFT COLUMN: CODE EDITOR & CONSOLE */}
              <div className="flex flex-col gap-4 w-full">
                {/* Editor Container */}
                <div className="bg-[#1c1109] rounded-2xl border-2 border-[#855d34] overflow-hidden shadow-xl flex flex-col w-full">
                  {/* Editor Header Toolbar */}
                  <div className="flex items-center justify-between px-4 py-2.5 bg-[#2d1b10] border-b border-[#855d34] text-xs">
                    <div className="flex items-center gap-2 font-mono text-amber-200">
                      <Terminal size={14} className="text-amber-400" />
                      <span>solucion.py</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleInsertTab}
                        className="px-2.5 py-1 rounded-lg text-amber-300 bg-[#3d2514] border border-[#855d34] hover:bg-[#52331c] transition-all flex items-center gap-1 text-[11px] cursor-pointer"
                        title="Insertar sangría de 4 espacios (o pulsa la tecla Tab)"
                      >
                        <Indent size={12} />
                        <span>Tab (4 esp)</span>
                      </button>

                      <button
                        onClick={handleResetCode}
                        className="px-2.5 py-1 rounded-lg text-stone-300 hover:text-amber-100 hover:bg-[#442918] transition-all flex items-center gap-1 text-[11px] cursor-pointer"
                        title="Restablecer código inicial"
                      >
                        <RotateCcw size={12} />
                        <span>Reiniciar</span>
                      </button>

                      {cfg.hints.length > 0 && (
                        <button
                          onClick={() => {
                            sound.click();
                            setShowHintIndex((prev) => (prev + 1) % cfg.hints.length);
                          }}
                          className="px-2.5 py-1 rounded-lg text-amber-200 bg-[#442918] border border-[#b45309]/50 hover:bg-[#57351f] transition-all flex items-center gap-1 text-[11px] cursor-pointer"
                        >
                          <Lightbulb size={12} />
                          <span>Pistas ({cfg.hints.length})</span>
                        </button>
                      )}

                      <button
                        onClick={() => {
                          sound.click();
                          setShowSolutionModal(!showSolutionModal);
                        }}
                        className="px-2 py-1 rounded-lg text-stone-300 hover:text-amber-100 hover:bg-[#442918] transition-all text-[11px] cursor-pointer"
                        title="Consultar solución sugerida"
                      >
                        <Eye size={13} />
                      </button>
                    </div>
                  </div>

                  {/* Progressive Hint Notification */}
                  {showHintIndex >= 0 && (
                    <div className="px-4 py-2.5 bg-[#3a2010] border-b border-[#855d34] text-amber-200 text-xs flex items-start gap-2 animate-fadeIn font-serif">
                      <Lightbulb size={14} className="text-amber-400 shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <span className="font-bold font-rpg-title">Pista {showHintIndex + 1}: </span>
                        <span>{cfg.hints[showHintIndex]}</span>
                      </div>
                      <button
                        onClick={() => setShowHintIndex(-1)}
                        className="text-amber-400 hover:text-amber-200 text-xs cursor-pointer"
                      >
                        ✕
                      </button>
                    </div>
                  )}

                  {/* Solution Preview Drawer */}
                  {showSolutionModal && (
                    <div className="px-4 py-3 bg-[#26150a] border-b border-[#855d34] text-xs space-y-2 animate-fadeIn font-serif">
                      <div className="flex justify-between items-center text-amber-300 font-rpg-title font-bold">
                        <span>Código Solución de Referencia</span>
                        <button
                          onClick={() => setUserCode(cfg.solutionCode)}
                          className="text-[11px] px-2 py-0.5 rounded bg-amber-500 text-stone-950 font-bold hover:brightness-110 cursor-pointer font-sans"
                        >
                          Cargar en Editor
                        </button>
                      </div>
                      <pre className="p-2.5 bg-[#120a05] rounded-lg text-emerald-300 font-mono text-xs overflow-x-auto border border-[#855d34]/50">
                        {cfg.solutionCode}
                      </pre>
                    </div>
                  )}

                  {/* Textarea Code Input */}
                  <div className="relative">
                    <textarea
                      ref={textareaRef}
                      value={userCode}
                      onChange={(e) => setUserCode(e.target.value)}
                      onKeyDown={handleKeyDown}
                      rows={isFullscreen ? 18 : 14}
                      spellCheck={false}
                      className={`w-full bg-[#140c06] p-4 font-mono text-xs sm:text-sm text-amber-100 resize-y focus:outline-none focus:ring-1 focus:ring-amber-500 leading-relaxed transition-all ${
                        isFullscreen ? 'min-h-[340px] 2xl:min-h-[460px]' : 'min-h-[220px]'
                      }`}
                      placeholder="# Escribe aquí tus comandos de Python... (usa la tecla Tab para sangría)"
                    />
                  </div>

                  {/* Bottom Console Terminal */}
                  <div className="border-t border-[#855d34] bg-[#1a0f08] p-3 flex flex-col gap-1">
                    <div className="flex items-center justify-between text-[11px] font-mono text-stone-400">
                      <span className="flex items-center gap-1.5 text-amber-300">
                        <Terminal size={12} />
                        <span>Salida de Consola (print)</span>
                      </span>
                      <span>Python 3.12</span>
                    </div>

                    <div className={`overflow-y-auto rounded-lg bg-[#100804] p-2.5 font-mono text-xs sm:text-sm text-stone-300 border border-[#855d34]/40 transition-all ${
                      isFullscreen ? 'min-h-[85px] max-h-[160px]' : 'min-h-[50px] max-h-[100px]'
                    }`}>
                      {simulationOutcome?.terminalOutput ? (
                        <pre className="whitespace-pre-wrap text-cyan-300">{simulationOutcome.terminalOutput}</pre>
                      ) : (
                        <span className="text-stone-500 italic">
                          Pulsa &quot;Probar Turno de Rol&quot; para ejecutar tu código y ver las salidas...
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Run / Test Button Row */}
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => {
                      sound.click();
                      setActiveTab('tutorial');
                    }}
                    className="text-xs text-stone-700 hover:text-stone-900 font-serif font-bold flex items-center gap-1.5 py-2 px-3 rounded-xl hover:bg-[#ede3d2] transition-all cursor-pointer"
                  >
                    <BookOpen size={14} />
                    <span>Repasar Grimorio</span>
                  </button>

                  <button
                    onClick={handleRunSimulation}
                    disabled={isPlaying}
                    className={`px-6 py-2.5 rounded-xl font-serif font-bold text-sm flex items-center gap-2 shadow-lg transition-all cursor-pointer ${
                      isPlaying
                        ? 'bg-stone-400 text-stone-700 cursor-not-allowed'
                        : 'bg-gradient-to-r from-[#b45309] via-[#d97706] to-[#b45309] text-amber-100 hover:brightness-110 active:scale-95 shadow-amber-950/20 border border-amber-300/30'
                    }`}
                  >
                    <Play size={16} className={isPlaying ? 'animate-spin' : 'fill-amber-100'} />
                    <span>{isPlaying ? 'Lanzando Turno...' : 'Probar Turno de Rol'}</span>
                  </button>
                </div>
              </div>

              {/* RIGHT COLUMN: TEXT & CONSOLE RPG TABLETOP ARENA */}
              <div className="flex flex-col gap-4">
                <MiniGameArena
                  level={level}
                  simulationOutcome={simulationOutcome}
                  isPlaying={isPlaying}
                  onRunSimulation={handleRunSimulation}
                  onSimulationFinished={handleSimulationFinished}
                  onD20BonusChange={(bonus) => setD20BonusXp(bonus)}
                />
              </div>
            </div>
          )}
        </div>

        {/* VICTORY MODAL OVERLAY (PROCLAMATION SCROLL) */}
        {isVictorious && (
          <div className="absolute inset-0 z-50 bg-[#1a0f08]/90 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
            <div className="max-w-md w-full parchment-sheet border-4 border-[#b8864a] rounded-3xl p-6 sm:p-8 text-center space-y-5 shadow-2xl text-[#292218] font-serif">
              <div className="w-16 h-16 rounded-3xl bg-[#f5ecdd] border-2 border-[#b8864a] text-[#b45309] mx-auto flex items-center justify-center text-3xl shadow-md animate-bounce">
                🏆
              </div>

              <div className="space-y-1">
                <span className="text-xs font-rpg-title font-bold tracking-wider text-[#b45309] uppercase">
                  ¡Misión Superada!
                </span>
                <h3 className="text-2xl font-bold font-rpg-title text-[#2b170c]">{level.title}</h3>
                <p className="text-xs sm:text-sm text-[#574838] mt-1">
                  Tu código en Python ha superado la dificultad impuesta por el Máster de Rol.
                </p>
              </div>

              {/* Stars Earned */}
              <div className="flex justify-center items-center gap-3 py-1">
                {Array.from({ length: 3 }).map((_, i) => (
                  <span
                    key={i}
                    className={`text-3xl transition-transform ${
                      i < earnedStars ? 'text-amber-500 scale-110 drop-shadow' : 'text-stone-300'
                    }`}
                  >
                    ★
                  </span>
                ))}
              </div>

              {/* Reward Chips */}
              <div className="flex flex-wrap justify-center gap-2">
                <div className="px-3 py-1.5 rounded-xl bg-[#f5ecdd] border border-[#d8c8b0] text-xs font-mono text-[#854d0e] font-bold">
                  +{Math.round((level.xpReward || 50) * (earnedStars / 3))} XP Misión
                </div>
                {d20BonusXp > 0 && (
                  <div className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-200 via-yellow-100 to-amber-200 border-2 border-amber-500 text-xs font-mono text-amber-950 font-bold flex items-center gap-1.5 shadow-sm">
                    <span>⚡ +{d20BonusXp} XP Potenciador D20</span>
                  </div>
                )}
                <div className="px-3 py-1.5 rounded-xl bg-[#f5ecdd] border border-[#d8c8b0] text-xs font-mono text-emerald-800 font-bold">
                  Progreso Preservado
                </div>
              </div>

              <button
                onClick={handleAdvanceLevel}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-[#b45309] via-[#d97706] to-[#b45309] text-amber-100 font-serif font-bold text-sm hover:brightness-110 active:scale-95 shadow-lg shadow-amber-950/30 transition-all cursor-pointer border border-amber-300/30"
              >
                Registrar en el Grimorio y Continuar
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};
