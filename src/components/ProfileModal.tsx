import React, { useState, useRef } from 'react';
import { 
  X, 
  User, 
  Sparkles, 
  Flame, 
  Heart, 
  Download, 
  Upload, 
  RotateCcw, 
  Check, 
  AlertTriangle, 
  Clock, 
  Award,
  Zap,
  Shield,
  Scroll
} from 'lucide-react';
import { UserProgress } from '../types';
import { getUserLevelTitle, exportProgressJSON, importProgressJSON, resetProgress } from '../utils/storage';
import { sound } from '../utils/sound';
import { motion } from 'motion/react';

interface ProfileModalProps {
  progress: UserProgress;
  onClose: () => void;
  onUpdateProgress: (updated: UserProgress) => void;
  isAllCompleted?: boolean;
  onOpenLicense?: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  progress,
  onClose,
  onUpdateProgress,
  isAllCompleted,
  onOpenLicense,
}) => {
  const [nameInput, setNameInput] = useState<string>(progress.userName);
  const [nameSaved, setNameSaved] = useState<boolean>(false);
  const [confirmReset, setConfirmReset] = useState<boolean>(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState<boolean>(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const userLevel = getUserLevelTitle(progress.xp);

  const handleSaveName = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameInput.trim()) return;
    sound.playClick();
    const updated = { ...progress, userName: nameInput.trim() };
    onUpdateProgress(updated);
    setNameSaved(true);
    setTimeout(() => setNameSaved(false), 2000);
  };

  const handleExportJSON = () => {
    sound.playClick();
    const jsonStr = exportProgressJSON(progress);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `python_adventure_ficha_${progress.userName.toLowerCase()}_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const imported = importProgressJSON(text);
        if (imported) {
          sound.playCorrect();
          onUpdateProgress(imported);
          setImportSuccess(true);
          setImportError(null);
          setTimeout(() => setImportSuccess(false), 3000);
        } else {
          sound.playWrong();
          setImportError('El pergamino de guardado no es válido o está dañado.');
        }
      } catch {
        sound.playWrong();
        setImportError('Error al leer el archivo de guardado JSON.');
      }
    };
    reader.readAsText(file);
  };

  const handleReset = () => {
    sound.playWrong();
    const fresh = resetProgress();
    onUpdateProgress(fresh);
    setConfirmReset(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.22, ease: 'easeOut' }}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#1a0f08]/85 backdrop-blur-sm"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ duration: 0.22, ease: 'easeOut' }}
        className="parchment-sheet border-2 border-[#b8864a] rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] w-full max-w-2xl text-[#292218] font-serif"
      >
        {/* Header */}
        <div className="px-6 py-5 border-b-2 border-[#855d34] bg-[#2d1b10] text-amber-100 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#442918] text-amber-300 border border-[#b8864a] flex items-center justify-center shadow-md">
              <Scroll className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-rpg-title font-bold text-amber-200">Ficha de Personaje & Expediente de Campaña</h2>
              <p className="text-xs text-stone-300">
                Atributos de tu personaje, estadísticas de partida y preservación del progreso.
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="p-1.5 rounded-lg text-stone-300 hover:text-amber-100 hover:bg-[#442918] transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* User Rank Card */}
          <div className="p-5 rounded-2xl bg-[#fffdf8] border-2 border-[#b8864a] shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-2xl bg-[#b45309] text-amber-100 border-2 border-[#78350f] flex items-center justify-center font-bold text-2xl shadow-md font-mono">
                  {userLevel.level}
                </div>
                <div>
                  <span className="text-[10px] font-mono text-[#854d0e] font-bold uppercase tracking-wider block">
                    Rango de Personaje (Nivel {userLevel.level})
                  </span>
                  <h3 className="text-lg font-rpg-title font-bold text-[#2b170c]">
                    {userLevel.title}
                  </h3>
                  <span className="text-xs text-[#574838]">
                    {progress.xp} XP de sabiduría acumulados
                  </span>
                </div>
              </div>
            </div>

            {/* XP progress bar */}
            <div>
              <div className="flex items-center justify-between text-xs font-mono text-[#786450] mb-1.5">
                <span>Progreso hacia el siguiente rango de rol</span>
                <span className="text-[#854d0e] font-bold">{userLevel.progressPercent}%</span>
              </div>
              <div className="w-full h-2.5 bg-[#ebdcc7] rounded-full overflow-hidden border border-[#d8c8b0]">
                <div 
                  className="h-full bg-gradient-to-r from-[#b45309] to-emerald-600 transition-all duration-500"
                  style={{ width: `${userLevel.progressPercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* Nickname Form */}
          <form onSubmit={handleSaveName} className="p-4 rounded-2xl bg-[#f5ecdd] border border-[#d8c8b0] flex flex-col sm:flex-row items-center gap-3">
            <div className="flex-1 w-full">
              <label className="text-xs font-rpg-title font-bold text-[#78350f] block mb-1">
                Nombre de tu Aventurero / Alias:
              </label>
              <input
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                maxLength={24}
                className="w-full px-3.5 py-2 rounded-xl bg-[#fffdfa] border border-[#d8c8b0] text-sm text-[#2b170c] focus:outline-none focus:border-[#b45309] font-serif"
              />
            </div>
            <button
              type="submit"
              className="w-full sm:w-auto px-5 py-2 rounded-xl bg-[#b45309] hover:bg-[#92400e] text-amber-100 text-xs font-serif font-bold transition flex items-center justify-center gap-1.5 self-end cursor-pointer shadow-sm"
            >
              {nameSaved ? <Check className="w-4 h-4 text-amber-200 stroke-[3]" /> : null}
              <span>{nameSaved ? 'Preservado' : 'Grabar Nombre'}</span>
            </button>
          </form>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-2xl bg-[#fffdf8] border border-[#d8c8b0] text-center shadow-xs">
              <Flame className="w-5 h-5 text-amber-600 mx-auto mb-1" />
              <div className="text-lg font-bold text-[#2b170c] font-mono">{progress.streak}</div>
              <div className="text-[11px] text-[#786450]">Días de Racha</div>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#fffdf8] border border-[#d8c8b0] text-center shadow-xs">
              <Sparkles className="w-5 h-5 text-[#b45309] mx-auto mb-1" />
              <div className="text-lg font-bold text-[#2b170c] font-mono">{progress.stats.totalChallengesSolved}</div>
              <div className="text-[11px] text-[#786450]">Retos Resueltos</div>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#fffdf8] border border-[#d8c8b0] text-center shadow-xs">
              <Award className="w-5 h-5 text-amber-700 mx-auto mb-1" />
              <div className="text-lg font-bold text-[#2b170c] font-mono">{progress.stats.perfectLevels}</div>
              <div className="text-[11px] text-[#786450]">Misiones Perfectas</div>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#fffdf8] border border-[#d8c8b0] text-center shadow-xs">
              <Shield className="w-5 h-5 text-emerald-800 mx-auto mb-1" />
              <div className="text-lg font-bold text-[#2b170c] font-mono">{progress.completedLevels.length}</div>
              <div className="text-[11px] text-[#786450]">Misiones Totales</div>
            </div>
          </div>

          {/* Adventurer License & Certificate button */}
          {isAllCompleted && onOpenLicense && (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-950 via-[#3d2311] to-amber-950 border-2 border-amber-400 text-amber-100 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400 flex items-center justify-center text-amber-300 shrink-0">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-mono text-amber-400 font-bold uppercase">Campaña Completada</div>
                  <h4 className="font-rpg-title font-bold text-sm text-white">Licencia Oficial & Certificado Real</h4>
                </div>
              </div>
              <button
                onClick={() => {
                  sound.playClick();
                  onClose();
                  onOpenLicense();
                }}
                className="w-full sm:w-auto px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:brightness-110 text-stone-950 font-bold text-xs font-rpg-title shadow-md flex items-center justify-center gap-2 cursor-pointer shrink-0 transition"
              >
                <span>Ver y Descargar PDF</span>
              </button>
            </div>
          )}

          {/* Persistence & Data Management (Export / Import Save) */}
          <div className="p-5 rounded-2xl bg-[#f5ecdd] border border-[#d8c8b0] space-y-3">
            <h4 className="text-xs font-rpg-title font-bold uppercase tracking-wider text-[#78350f] flex items-center gap-2">
              <Download className="w-3.5 h-3.5 text-[#b45309]" />
              Copia de Seguridad y Transferencia de Partida
            </h4>
            <p className="text-xs text-[#574838] leading-relaxed">
              Tu progreso se guarda automáticamente en este navegador. Si vas a cambiar de ordenador (por ejemplo, del aula de informática del I.E.S Virgen de la Victoria a tu casa), puedes exportar tu archivo de guardado y cargarlo en cualquier momento.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button
                onClick={handleExportJSON}
                className="px-4 py-2 rounded-xl bg-[#fffdfa] hover:bg-[#ede3d2] text-[#78350f] border border-[#b8864a] text-xs font-serif font-bold flex items-center gap-2 transition cursor-pointer shadow-xs"
              >
                <Download className="w-3.5 h-3.5 text-[#b45309]" />
                <span>Descargar Guardado (.json)</span>
              </button>

              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 rounded-xl bg-[#fffdfa] hover:bg-[#ede3d2] text-[#78350f] border border-[#b8864a] text-xs font-serif font-bold flex items-center gap-2 transition cursor-pointer shadow-xs"
              >
                <Upload className="w-3.5 h-3.5 text-emerald-700" />
                <span>Cargar Guardado (.json)</span>
              </button>

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImportFile}
                accept=".json"
                className="hidden"
              />
            </div>

            {importSuccess && (
              <div className="p-2.5 rounded-xl bg-emerald-100 border border-emerald-600/40 text-emerald-900 text-xs flex items-center gap-2">
                <Check className="w-4 h-4 stroke-[3]" />
                <span>¡Progreso cargado con éxito desde el archivo de guardado!</span>
              </div>
            )}

            {importError && (
              <div className="p-2.5 rounded-xl bg-rose-100 border border-rose-600/40 text-rose-900 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 stroke-[3]" />
                <span>{importError}</span>
              </div>
            )}
          </div>

          {/* Reset Danger Zone */}
          <div className="pt-2 border-t border-[#d8c8b0] flex items-center justify-between text-xs">
            <span className="text-[#8c745f]">¿Deseas reiniciar toda la aventura desde cero?</span>
            {confirmReset ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleReset}
                  className="px-3 py-1 rounded-lg bg-rose-700 hover:bg-rose-800 text-white font-bold transition cursor-pointer"
                >
                  Sí, borrar todo
                </button>
                <button
                  onClick={() => setConfirmReset(false)}
                  className="px-3 py-1 rounded-lg bg-stone-300 text-stone-800 hover:bg-stone-400 transition cursor-pointer"
                >
                  Cancelar
                </button>
              </div>
            ) : (
              <button
                onClick={() => setConfirmReset(true)}
                className="text-rose-800 hover:text-rose-950 underline transition cursor-pointer font-bold"
              >
                Reiniciar Progreso
              </button>
            )}
          </div>

        </div>
      </motion.div>
    </motion.div>
  );
};
