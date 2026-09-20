import React, { useState } from 'react';
import { 
  X, 
  Play, 
  Trash2, 
  Terminal, 
  Code, 
  Sparkles, 
  Copy, 
  Check, 
  ChevronRight, 
  BookOpen,
  Scroll
} from 'lucide-react';
import { runPythonCode, ExecutionResult } from '../utils/pythonRunner';
import { sound } from '../utils/sound';
import { motion } from 'motion/react';

interface SandboxModalProps {
  initialCode?: string | null;
  onClose: () => void;
  onCodeExecuted: () => void;
}

const TEMPLATES = [
  {
    name: 'Cálculo de Daño de Espada',
    desc: 'Uso de variables numéricas, operaciones y f-strings',
    code: `# Cálculo de daño de arma rúnica
fuerza_base = 18
bono_magico = 5
modificador_critico = 1.5

dano_total = (fuerza_base + bono_magico) * modificador_critico

print("--- BITÁCORA DE COMBATE ---")
print(f"Fuerza del Aventurero: {fuerza_base}")
print(f"Bono Mágico de Espada: +{bono_magico}")
print(f"¡Impacto Crítico! Daño infligido: {dano_total} puntos")`,
  },
  {
    name: 'Evaluador de Trampa (if / elif / else)',
    desc: 'Estructura condicional if, elif, else',
    code: `# Chequeo de salvación de trampa de foso
tirada_d20 = 14
dificultad = 12

print(f"Tirada en el dado: {tirada_d20} (Dificultad requerida: {dificultad})")

if tirada_d20 >= 20:
    print("¡ÉXITO CRÍTICO! Esquivas la trampa y encuentras 10 monedas de oro.")
elif tirada_d20 >= dificultad:
    print("Éxito. Saltas ágilmente sobre los pinchos sin rasguño.")
elif tirada_d20 >= 8:
    print("Fallo parcial. Te raspas el brazo: pierdes 5 PV.")
else:
    print("¡Pifia! Caes en el foso. Requiere rescate de la comitiva.")`,
  },
  {
    name: 'Inventario de Alforja (Listas y Bucles)',
    desc: 'Recorrer listas con bucles for y filtrar valores',
    code: `# Inspección de la bolsa de contención
mochila = ["Poción Menor", "Daga de Plata", "Gema de Maná", "Poción Menor", "Antorcha"]
pociones_encontradas = 0

print("Buscando pociones de curación en la alforja...")

for objeto in mochila:
    if "Poción" in objeto:
        pociones_encontradas += 1
        print(f"-> Hallada: {objeto}")

print(f"Total de brebajes listos para combate: {pociones_encontradas}")`,
  },
  {
    name: 'Grimorio de Hechizos (def y return)',
    desc: 'Definición de funciones con def, parámetros y return',
    code: `# Módulo de encantamientos arcanos
def lanzar_rayo_arcano(nivel_mago, elemento="Rayo"):
    poder = nivel_mago * 12 + 10
    hechizo = f"⚡ [HECHIZO: {elemento.upper()}] | Nivel: {nivel_mago} | Daño: {poder} PV"
    return hechizo

# Probamos nuestra función en combate
hechizo_1 = lanzar_rayo_arcano(3, "Relámpago")
hechizo_2 = lanzar_rayo_arcano(5, "Tormenta Ancestral")

print(hechizo_1)
print(hechizo_2)`,
  },
];

export const SandboxModal: React.FC<SandboxModalProps> = ({
  initialCode,
  onClose,
  onCodeExecuted,
}) => {
  const [code, setCode] = useState<string>(initialCode || TEMPLATES[0].code);
  const [result, setResult] = useState<ExecutionResult | null>(null);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  const handleRun = () => {
    sound.playClick();
    setIsRunning(true);
    const exec = runPythonCode(code);
    setResult(exec);
    setIsRunning(false);
    onCodeExecuted();
    if (exec.success) {
      sound.playCorrect();
    } else {
      sound.playWrong();
    }
  };

  const handleCopy = () => {
    sound.playClick();
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const target = e.currentTarget;
      const start = target.selectionStart;
      const end = target.selectionEnd;
      const value = target.value;
      const indent = '    ';

      if (e.shiftKey) {
        const before = value.substring(0, start);
        const lastNewline = before.lastIndexOf('\n');
        const lineStart = lastNewline === -1 ? 0 : lastNewline + 1;
        const lineSlice = value.substring(lineStart, lineStart + 4);
        const spacesToRemove = lineSlice.match(/^ +/)?.[0].length || 0;
        if (spacesToRemove > 0) {
          const toRemove = Math.min(4, spacesToRemove);
          const newValue = value.substring(0, lineStart) + value.substring(lineStart + toRemove);
          setCode(newValue);
          setTimeout(() => {
            target.selectionStart = Math.max(lineStart, start - toRemove);
            target.selectionEnd = Math.max(lineStart, end - toRemove);
          }, 0);
        }
      } else {
        const newValue = value.substring(0, start) + indent + value.substring(end);
        setCode(newValue);
        setTimeout(() => {
          target.selectionStart = target.selectionEnd = start + indent.length;
        }, 0);
      }
    } else if (e.key === 'Enter') {
      const target = e.currentTarget;
      const start = target.selectionStart;
      const value = target.value;
      const beforeCursor = value.substring(0, start);
      const currentLine = beforeCursor.split('\n').pop() || '';
      const matchIndent = currentLine.match(/^(\s*)/);
      const currentIndent = matchIndent ? matchIndent[1] : '';

      const trimmed = currentLine.trim();
      if (trimmed.endsWith(':')) {
        e.preventDefault();
        const newIndent = currentIndent + '    ';
        const newValue = value.substring(0, start) + '\n' + newIndent + value.substring(start);
        setCode(newValue);
        setTimeout(() => {
          target.selectionStart = target.selectionEnd = start + 1 + newIndent.length;
        }, 0);
      } else if (currentIndent.length > 0) {
        e.preventDefault();
        const newValue = value.substring(0, start) + '\n' + currentIndent + value.substring(start);
        setCode(newValue);
        setTimeout(() => {
          target.selectionStart = target.selectionEnd = start + 1 + currentIndent.length;
        }, 0);
      }
    }
  };

  const handleClear = () => {
    sound.playClick();
    setCode('');
    setResult(null);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.22, ease: 'easeOut' }}
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-[#1a0f08]/85 backdrop-blur-sm"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ duration: 0.22, ease: 'easeOut' }}
        className="parchment-sheet border-2 border-[#b8864a] rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[94vh] w-full max-w-5xl text-[#292218] font-serif"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b-2 border-[#855d34] bg-[#2d1b10] text-amber-100 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#442918] text-amber-300 border border-[#b8864a] flex items-center justify-center shadow-md">
              <Scroll className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-rpg-title font-bold text-amber-200 flex items-center gap-2">
                Taller Arcano de Pruebas (Sandbox)
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#442918] text-amber-300 border border-[#855d34] uppercase">
                  Consola Libre
                </span>
              </h2>
              <p className="text-xs text-stone-300">
                Experimenta libremente, prueba algoritmos y observa la crónica en vivo en consola de texto.
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

        {/* Templates Picker Bar */}
        <div className="px-6 py-2.5 bg-[#f5ecdd] border-b border-[#d8c8b0] flex items-center gap-2 overflow-x-auto text-xs">
          <span className="text-[#78350f] font-bold font-rpg-title shrink-0 flex items-center gap-1">
            <BookOpen className="w-3.5 h-3.5 text-[#b45309]" />
            Manuscritos:
          </span>
          {TEMPLATES.map((tmpl, idx) => (
            <button
              key={idx}
              onClick={() => {
                sound.playClick();
                setCode(tmpl.code);
                setResult(null);
              }}
              className="px-3 py-1 rounded-lg bg-[#fffdf8] hover:bg-[#efe5d5] text-[#2b170c] border border-[#d8c8b0] transition whitespace-nowrap font-serif font-semibold cursor-pointer shadow-xs"
            >
              {tmpl.name}
            </button>
          ))}
        </div>

        {/* Editor & Console Split Body */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 min-h-0 divide-y lg:divide-y-0 lg:divide-x divide-[#855d34]">
          
          {/* Left Column: Code Editor */}
          <div className="lg:col-span-7 flex flex-col min-h-[300px] bg-[#140c06]">
            <div className="px-4 py-2 bg-[#2d1b10] border-b border-[#855d34] flex items-center justify-between text-xs text-amber-200 font-mono">
              <span className="flex items-center gap-1.5 text-amber-300">
                <Code className="w-3.5 h-3.5" />
                hechizo.py
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1 text-stone-300 hover:text-amber-200 cursor-pointer"
                  title="Copiar código"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400 stroke-[3]" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copiado' : 'Copiar'}</span>
                </button>
                <button
                  onClick={handleClear}
                  className="flex items-center gap-1 text-stone-300 hover:text-rose-400 cursor-pointer"
                  title="Borrar editor"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Limpiar</span>
                </button>
              </div>
            </div>

            <div className="flex-1 p-2 bg-[#140c06] relative">
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="# Escribe tu código Python aquí..."
                rows={14}
                className="w-full h-full p-3 font-mono text-sm bg-transparent text-amber-100 placeholder-stone-600 focus:outline-none leading-relaxed resize-none selection:bg-[#b45309]"
                spellCheck={false}
              />
            </div>
          </div>

          {/* Right Column: Console / Terminal Output */}
          <div className="lg:col-span-5 flex flex-col min-h-[220px] bg-[#100804]">
            <div className="px-4 py-2 bg-[#24150b] border-b border-[#855d34] flex items-center justify-between text-xs text-amber-200 font-mono">
              <span className="flex items-center gap-1.5 text-amber-400">
                <Terminal className="w-3.5 h-3.5" />
                Consola stdout (Modo Texto)
              </span>
              {result && (
                <span className={`text-[11px] ${result.success ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}`}>
                  {result.success ? '● Turno Completado' : '● Error Rúnico'}
                </span>
              )}
            </div>

            <div className="flex-1 p-4 font-mono text-xs overflow-y-auto leading-relaxed">
              {result ? (
                result.success ? (
                  result.output ? (
                    <pre className="text-cyan-300 whitespace-pre-wrap">{result.output}</pre>
                  ) : (
                    <span className="text-stone-500 italic">El script se ejecutó sin errores pero no generó ninguna salida con print().</span>
                  )
                ) : (
                  <div className="text-rose-400 space-y-2">
                    <p className="font-bold">{result.error}</p>
                    <p className="text-[11px] text-rose-300/80">
                      Revisa la sintaxis de Python, los dos puntos (:) tras estructuras de control o las comillas.
                    </p>
                  </div>
                )
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center text-stone-500 space-y-2 py-8">
                  <Play className="w-8 h-8 stroke-[1.5] text-stone-600" />
                  <p className="text-xs">
                    Pulsa <strong className="text-amber-300">Ejecutar Código</strong> para ver la respuesta del intérprete en consola.
                  </p>
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Footer Run Bar */}
        <div className="px-6 py-4 bg-[#2d1b10] border-t-2 border-[#855d34] flex items-center justify-between">
          <div className="text-xs text-stone-300 font-serif hidden sm:block">
            <span>Compatible con: </span>
            <span className="font-mono text-amber-300">print, variables, if/elif/else, while, for/range, listas, def/return</span>
          </div>

          <button
            id="btn-run-sandbox"
            onClick={handleRun}
            disabled={isRunning || !code.trim()}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#b45309] via-[#d97706] to-[#b45309] hover:brightness-110 text-amber-100 font-serif font-bold text-sm shadow-lg shadow-amber-950/40 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 border border-amber-300/30"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>{isRunning ? 'Ejecutando...' : 'Ejecutar Código de Rol'}</span>
          </button>
        </div>

      </motion.div>
    </motion.div>
  );
};
