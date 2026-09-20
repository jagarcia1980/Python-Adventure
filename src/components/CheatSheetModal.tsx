import React, { useState } from 'react';
import { 
  X, 
  BookOpen, 
  Copy, 
  Check, 
  Terminal, 
  Code, 
  ExternalLink,
  Search,
  Scroll,
  Sparkles
} from 'lucide-react';
import { sound } from '../utils/sound';
import { motion } from 'motion/react';

interface CheatSheetModalProps {
  onClose: () => void;
  onOpenSandboxWithCode: (code: string) => void;
}

interface CheatItem {
  category: string;
  title: string;
  desc: string;
  syntax: string;
  example: string;
}

const CHEAT_ITEMS: CheatItem[] = [
  {
    category: 'Básicos',
    title: 'print() y Comentarios',
    desc: 'Muestra mensajes en consola e incluye anotaciones ignoradas por Python con #.',
    syntax: 'print(valor1, valor2, ...)\n# Comentario de una línea',
    example: 'print("Hola Mundo")\n# Esto no se ejecuta',
  },
  {
    category: 'Variables',
    title: 'Variables y Tipos',
    desc: 'Asignación dinámica de enteros (int), decimales (float), texto (str) y booleanos (bool).',
    syntax: 'nombre_variable = valor',
    example: 'edad = 17\nprecio = 19.95\nnombre = "Aura"\nactivo = True',
  },
  {
    category: 'Variables',
    title: 'f-Strings (Formato dinámico)',
    desc: 'Inserta variables dentro de textos anteponiendo una f antes de las comillas y usando {}.',
    syntax: 'f"Texto con {variable} insertada"',
    example: 'puntos = 50\nprint(f"Tienes {puntos} puntos")',
  },
  {
    category: 'Operadores',
    title: 'Operadores Aritméticos',
    desc: 'Suma, resta, multiplicación, división flotante, división entera y resto (módulo).',
    syntax: '+, -, *, /, // (entera), % (módulo), ** (potencia)',
    example: 'cociente = 10 // 3   # Da 3\nresto = 10 % 3        # Da 1\npotencia = 2 ** 3     # Da 8',
  },
  {
    category: 'Lógica',
    title: 'Comparadores y Booleans',
    desc: 'Compara valores para obtener True o False.',
    syntax: '== (igual), != (distinto), >, <, >=, <=',
    example: 'es_mayor = 18 >= 18   # True\nes_distinto = 5 != 5  # False',
  },
  {
    category: 'Lógica',
    title: 'if, elif, else y 4 espacios',
    desc: 'Ejecuta bloques de código condicionales. Recuerda los dos puntos (:) y la sangría.',
    syntax: 'if condicion:\n    bloque\nelif otra_condicion:\n    bloque\nelse:\n    bloque',
    example: 'if nota >= 5:\n    print("Aprobado")\nelse:\n    print("Suspenso")',
  },
  {
    category: 'Lógica',
    title: 'Operadores Lógicos (and, or, not)',
    desc: 'Combina múltiples condiciones lógicas.',
    syntax: 'cond_a and cond_b\ncond_a or cond_b\nnot cond_a',
    example: 'if tiene_llave and nivel >= 2:\n    print("Puerta abierta")',
  },
  {
    category: 'Bucles',
    title: 'Bucle for y range()',
    desc: 'Repite un bloque de código un número determinado de veces.',
    syntax: 'for i in range(inicio, fin, paso):',
    example: 'for i in range(1, 6):\n    print(f"Paso {i}")',
  },
  {
    category: 'Bucles',
    title: 'Bucle while',
    desc: 'Repite un bloque mientras una condición continúe siendo verdadera.',
    syntax: 'while condicion:\n    bloque\n    actualizar_condicion',
    example: 'energia = 3\nwhile energia > 0:\n    print("Picando roca...")\n    energia -= 1',
  },
  {
    category: 'Listas',
    title: 'Listas y Métodos',
    desc: 'Colecciones ordenadas y mutables de elementos.',
    syntax: 'lista = [a, b, c]\nlista.append(x)\nlista.remove(x)\nlen(lista)',
    example: 'mochila = ["espada", "escudo"]\nmochila.append("pocion")\nprint(len(mochila))  # 3',
  },
  {
    category: 'Funciones',
    title: 'def Funciones y return',
    desc: 'Empaqueta lógica reutilizable que recibe argumentos y devuelve un resultado con return.',
    syntax: 'def nombre(arg1, arg2):\n    return resultado',
    example: 'def calcular_dano(fuerza, arma):\n    return fuerza + arma\n\ngolpe = calcular_dano(10, 5)\nprint(golpe)',
  },
];

export const CheatSheetModal: React.FC<CheatSheetModalProps> = ({
  onClose,
  onOpenSandboxWithCode,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const filtered = CHEAT_ITEMS.filter((item) => {
    const q = searchTerm.toLowerCase();
    return (
      item.title.toLowerCase().includes(q) ||
      item.desc.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q) ||
      item.example.toLowerCase().includes(q)
    );
  });

  const handleCopy = (code: string, idx: number) => {
    sound.click();
    navigator.clipboard.writeText(code);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
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
        className="parchment-sheet border-2 border-[#b8864a] rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] w-full max-w-4xl text-[#292218] font-serif"
      >
        {/* Header */}
        <div className="px-6 py-5 border-b-2 border-[#855d34] bg-[#2d1b10] text-amber-100 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#442918] text-amber-300 border border-[#b8864a] flex items-center justify-center shadow-md">
              <Scroll className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-rpg-title font-bold text-amber-200">Grimorio de Hechizos & Sintaxis Python</h2>
              <p className="text-xs text-stone-300">
                Guía de referencia rápida con las reglas del lenguaje y ejemplos listos para copiar y probar.
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

        {/* Search Filter */}
        <div className="px-6 py-3 bg-[#f5ecdd] border-b border-[#d8c8b0]">
          <div className="relative">
            <Search className="w-4 h-4 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar fórmula o regla (ej: if, while, listas, f-string)..."
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#fffdfa] border border-[#d8c8b0] text-sm text-[#2b170c] placeholder-stone-400 focus:outline-none focus:border-[#b45309] font-serif"
            />
          </div>
        </div>

        {/* List of Cheat Items */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {filtered.map((item, idx) => (
            <div
              key={idx}
              className="rounded-2xl border-2 border-[#d8c8b0] bg-[#fffdf8] p-4 sm:p-5 transition hover:border-[#b8864a] shadow-sm"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase font-mono font-bold px-2.5 py-0.5 rounded bg-[#f3ecde] text-[#78350f] border border-[#855d34]/40">
                    {item.category}
                  </span>
                  <h3 className="text-base font-rpg-title font-bold text-[#2b170c]">{item.title}</h3>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <button
                    onClick={() => handleCopy(item.example, idx)}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#f3ecde] hover:bg-[#ebdcc7] text-[#78350f] text-xs font-serif font-bold transition border border-[#d8c8b0] cursor-pointer"
                    title="Copiar ejemplo"
                  >
                    {copiedIndex === idx ? (
                      <Check className="w-3.5 h-3.5 text-emerald-700 stroke-[3]" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                    <span>{copiedIndex === idx ? 'Copiado' : 'Copiar'}</span>
                  </button>

                  <button
                    onClick={() => {
                      sound.playClick();
                      onOpenSandboxWithCode(item.example);
                    }}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#b45309] hover:bg-[#92400e] text-amber-100 text-xs font-serif font-bold transition shadow-sm cursor-pointer"
                    title="Probar en el Taller Arcano"
                  >
                    <Terminal className="w-3.5 h-3.5" />
                    <span>Probar</span>
                  </button>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-[#574838] mb-3">{item.desc}</p>

              {/* Code preview block */}
              <div className="rounded-xl bg-[#1a1008] border border-[#855d34] p-3 overflow-x-auto shadow-inner">
                <pre className="font-mono text-xs text-amber-200 leading-relaxed">
                  <code>{item.example}</code>
                </pre>
              </div>
            </div>
          ))}

          {filtered.length === 0 && (
            <div className="text-center py-12 text-stone-500 text-sm">
              No se encontraron hechizos ni reglas para &quot;{searchTerm}&quot;.
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};
