import React, { useState, useRef } from 'react';
import { 
  Award, 
  Download, 
  Sparkles, 
  X, 
  Shield, 
  Star, 
  CheckCircle2, 
  Calendar, 
  Scroll, 
  Trophy, 
  User,
  ExternalLink,
  Flame
} from 'lucide-react';
import { UserProgress } from '../types';
import { WORLDS } from '../data/curriculum';
import { sound } from '../utils/sound';
import confetti from 'canvas-confetti';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface AdventurerLicenseModalProps {
  progress: UserProgress;
  onClose: () => void;
  onUpdateName: (newName: string) => void;
}

export const AdventurerLicenseModal: React.FC<AdventurerLicenseModalProps> = ({
  progress,
  onClose,
  onUpdateName,
}) => {
  const [userNameInput, setUserNameInput] = useState<string>(progress.userName || 'Aventurero');
  const [isGeneratingPdf, setIsGeneratingPdf] = useState<boolean>(false);
  const [downloadSuccess, setDownloadSuccess] = useState<boolean>(false);
  const certificateRef = useRef<HTMLDivElement>(null);

  // Calculate statistics and rank
  const totalLevelsCount = WORLDS.reduce((acc, w) => acc + w.levels.length, 0);
  const completedCount = progress.completedLevels.length;
  const isAllCompleted = completedCount >= totalLevelsCount;

  const totalStars: number = (Object.values(progress.levelScores || {}) as Array<{ stars?: number }>).reduce(
    (acc: number, curr) => acc + (curr?.stars || 0), 
    0
  );

  // Criteria for Rank S vs Rank A
  // Rank S: 800+ XP or at least 28 stars / 8 perfect levels
  const isRankS = progress.xp >= 750 && (totalStars >= 27 || progress.stats.perfectLevels >= 7);
  const rankLetter = isRankS ? 'S' : 'A';
  const rankTitle = isRankS 
    ? 'Archimago Legendario' 
    : 'Heroe de Python';
  const rankBadgeText = isRankS 
    ? 'LICENCIA OFICIAL • RANGO S ' 
    : 'LICENCIA OFICIAL • RANGO A (VETERANO DISTINGUIDO)';

  const issueDate = new Intl.DateTimeFormat('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date());

  const certificateId = `LIC-PY-${new Date().getFullYear()}-${rankLetter}-${Math.abs(
    (progress.xp * 97 + totalStars * 13) % 99999
  ).toString().padStart(5, '0')}`;

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setUserNameInput(val);
    onUpdateName(val.trim() || 'Aventurero');
  };

  const triggerCelebrationConfetti = () => {
    try {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: isRankS 
          ? ['#f59e0b', '#d97706', '#fbbf24', '#7c3aed', '#ef4444'] 
          : ['#3b82f6', '#10b981', '#f59e0b', '#6366f1'],
      });
    } catch {
      // Ignore confetti error if canvas is not ready
    }
  };

  const handleDownloadPDF = async () => {
    sound.click();
    setIsGeneratingPdf(true);
    triggerCelebrationConfetti();

    try {
      const element = certificateRef.current;
      if (!element) throw new Error('Certificado no encontrado');

      // Capture element with html2canvas
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#faf6ee',
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      // Create A4 Landscape PDF (297mm x 210mm)
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4',
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
      
      const cleanName = userNameInput.trim().replace(/\s+/g, '_') || 'Aventurero';
      pdf.save(`Licencia_Aventurero_Python_${cleanName}_Rango_${rankLetter}.pdf`);

      sound.levelComplete();
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 4000);
    } catch (err) {
      console.error('Error generando PDF con html2canvas, usando generador de respaldo:', err);
      // Fallback: Generate native PDF with jsPDF directly
      generateFallbackNativePdf();
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // Resilient fallback: direct jsPDF drawing in case DOM capture is restricted
  const generateFallbackNativePdf = () => {
    try {
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4',
      });

      // Background parchment tone
      pdf.setFillColor(250, 246, 238);
      pdf.rect(0, 0, 297, 210, 'F');

      // Ornate double border
      pdf.setDrawColor(133, 93, 52);
      pdf.setLineWidth(2);
      pdf.rect(10, 10, 277, 190);
      pdf.setLineWidth(0.8);
      pdf.rect(13, 13, 271, 184);

      // Institution header
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(13);
      pdf.setTextColor(120, 53, 15);
      pdf.text('REINO DE PYTHIA • GREMIO OFICIAL DE HECHICEROS Y AVENTUREROS', 148.5, 25, { align: 'center' });

      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(10);
      pdf.setTextColor(80, 60, 40);
      pdf.text('I.E.S. Nuestra señora de la Victoria • CDPC 1º Bachillerato', 148.5, 31, { align: 'center' });

      // Title
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(22);
      pdf.setTextColor(60, 30, 10);
      pdf.text('LICENCIA DE AVENTURERO', 148.5, 46, { align: 'center' });

      // Rank text
      pdf.setFontSize(14);
      if (isRankS) {
        pdf.setTextColor(180, 83, 9);
        pdf.text('  RANGO S — HEROE LEGENDARIO  ', 148.5, 55, { align: 'center' });
      } else {
        pdf.setTextColor(30, 58, 138);
        pdf.text(' RANGO A — MAESTRO DE LA ESPADA', 148.5, 55, { align: 'center' });
      }

      // Main proclamation
      pdf.setFont('helvetica', 'italic');
      pdf.setFontSize(11);
      pdf.setTextColor(60, 45, 30);
      pdf.text('Por la presente, el Consejo Arcano y el director del gremio certifican que:', 148.5, 68, { align: 'center' });

      // Student Name
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(24);
      pdf.setTextColor(120, 53, 15);
      pdf.text(userNameInput.toUpperCase(), 148.5, 82, { align: 'center' });

      // Description text
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(11);
      pdf.setTextColor(50, 40, 30);
      const descLine1 = `Ha superado con éxito las 11 misiones de la campaña de Python: variables, operadores, condicionales if/elif/else,`;
      const descLine2 = `bucles for y while, estructuras de listas, funciones y la batalla final contra el Dragón de Sintaxis.`;
      pdf.text(descLine1, 148.5, 93, { align: 'center' });
      pdf.text(descLine2, 148.5, 99, { align: 'center' });

      // Stats Box
      pdf.setDrawColor(180, 140, 100);
      pdf.setFillColor(242, 233, 218);
      pdf.roundedRect(35, 108, 227, 28, 3, 3, 'FD');

      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(11);
      pdf.setTextColor(80, 50, 20);
      pdf.text(`EXPERIENCIA: ${progress.xp} XP`, 55, 122, { align: 'center' });
      pdf.text(`MISIONES: ${completedCount}/${totalLevelsCount} (100%)`, 112, 122, { align: 'center' });
      pdf.text(`ESTRELLAS: ${totalStars}/33 ⭐`, 170, 122, { align: 'center' });
      pdf.text(`PERFECTAS: ${progress.stats.perfectLevels}`, 230, 122, { align: 'center' });

      // Signatures
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(10);
      pdf.setTextColor(60, 40, 20);

      pdf.line(45, 168, 105, 168);
      pdf.text('El Dungeon Master', 75, 173, { align: 'center' });
      pdf.setFont('helvetica', 'italic');
      pdf.setFontSize(8);
      pdf.text('Tribunal de Rol y Algoritmia', 75, 178, { align: 'center' });

      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(10);
      pdf.line(192, 168, 252, 168);
      pdf.text('Director del gremio', 222, 173, { align: 'center' });
      pdf.setFont('helvetica', 'italic');
      pdf.setFontSize(8);
      pdf.text('I.E.S. Virgen de la Victoria', 222, 178, { align: 'center' });

      // Seal text in center
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(9);
      pdf.setTextColor(180, 83, 9);
      pdf.text(`[ SELLO OFICIAL ]`, 148.5, 165, { align: 'center' });
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(8);
      pdf.setTextColor(100, 80, 60);
      pdf.text(`Emitido el ${issueDate}`, 148.5, 172, { align: 'center' });
      pdf.text(`ID: ${certificateId}`, 148.5, 177, { align: 'center' });

      const cleanName = userNameInput.trim().replace(/\s+/g, '_') || 'Aventurero';
      pdf.save(`Licencia_Aventurero_Python_${cleanName}_Rango_${rankLetter}.pdf`);

      sound.levelComplete();
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 4000);
    } catch (e2) {
      console.error('Error en fallback nativo:', e2);
      alert('No se pudo descargar el PDF automáticamente. Puedes imprimir esta pantalla.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-5xl my-auto rounded-3xl bg-[#f5ecdd] border-4 border-[#855d34] shadow-2xl overflow-hidden font-serif">
        
        {/* Modal Header */}
        <div className="p-4 sm:p-6 bg-[#2d1b10] border-b-2 border-[#855d34] text-amber-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-600/30 border border-amber-400/50 flex items-center justify-center text-amber-300">
              <Trophy size={22} className="animate-bounce" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-rpg-title font-bold text-amber-300 tracking-wide flex items-center gap-2">
                <span>¡ENHORABUENA, HÉROE!</span>
                <Sparkles size={18} className="text-yellow-400" />
              </h2>
              <p className="text-xs sm:text-sm text-stone-300 font-sans">
                Has completado la campaña entera de Python MMRPG en el I.E.S. Virgen de la Victoria.
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              sound.click();
              onClose();
            }}
            className="p-2 rounded-xl text-stone-400 hover:text-amber-200 hover:bg-[#3f2718] transition cursor-pointer"
            aria-label="Cerrar"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          
          {/* Customization Banner: Name Input */}
          <div className="bg-[#ebdcc4] p-4 sm:p-5 rounded-2xl border-2 border-[#855d34] shadow-inner space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <User size={18} className="text-[#854d0e]" />
                <h3 className="font-rpg-title font-bold text-sm sm:text-base text-[#52290d]">
                  Personaliza tu Carnet de Aventurero / Alumno:
                </h3>
              </div>
              <span className="text-xs font-mono text-stone-600">
                Se actualizará automáticamente en el certificado
              </span>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={userNameInput}
                  onChange={handleNameChange}
                  maxLength={40}
                  placeholder="Ej: Alejandro Pérez - Hechicero del Código"
                  className="w-full px-4 py-2.5 rounded-xl bg-[#fffdf9] border-2 border-[#855d34]/60 text-[#3d2008] font-bold text-base focus:outline-none focus:border-[#b45309] shadow-sm font-sans"
                />
              </div>

              <button
                onClick={handleDownloadPDF}
                disabled={isGeneratingPdf}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-700 via-amber-600 to-yellow-600 hover:from-amber-600 hover:to-yellow-500 text-stone-950 font-bold text-sm sm:text-base font-rpg-title tracking-wider shadow-lg flex items-center justify-center gap-2 transition transform active:scale-95 cursor-pointer disabled:opacity-50 shrink-0 border border-amber-300"
              >
                <Download size={18} />
                <span>{isGeneratingPdf ? 'Generando PDF...' : 'Descargar Certificado en PDF'}</span>
              </button>
            </div>

            {downloadSuccess && (
              <div className="p-2.5 bg-emerald-100 border border-emerald-400 text-emerald-800 rounded-xl text-xs sm:text-sm font-sans flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                <span>¡Certificado PDF descargado con éxito! Puedes guardarlo o imprimirlo.</span>
              </div>
            )}
          </div>

          {/* Rank Evaluation Highlights Banner */}
          <div className={`p-4 rounded-2xl border-2 flex flex-col md:flex-row items-center justify-between gap-4 ${
            isRankS 
              ? 'bg-gradient-to-r from-amber-950/90 via-yellow-950/80 to-amber-900/90 border-amber-400 text-amber-200 shadow-xl shadow-amber-950/30'
              : 'bg-gradient-to-r from-slate-900/90 via-blue-950/80 to-slate-900/90 border-blue-400 text-blue-100 shadow-xl'
          }`}>
            <div className="flex items-center gap-3.5 text-center md:text-left">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-rpg-title font-black text-2xl shrink-0 shadow-lg border-2 ${
                isRankS 
                  ? 'bg-gradient-to-br from-yellow-400 to-amber-600 text-stone-950 border-amber-200' 
                  : 'bg-gradient-to-br from-blue-400 to-indigo-600 text-white border-blue-200'
              }`}>
                {rankLetter}
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center justify-center md:justify-start gap-2 font-mono text-xs uppercase tracking-widest font-bold">
                  {isRankS ? (
                    <span className="text-amber-400 flex items-center gap-1">
                      <Sparkles size={13} /> CLASIFICACIÓN SUPREMA
                    </span>
                  ) : (
                    <span className="text-cyan-300 flex items-center gap-1">
                      <Shield size={13} /> CLASIFICACIÓN DISTINGUIDA
                    </span>
                  )}
                </div>
                <h3 className="text-lg font-rpg-title font-bold text-white tracking-wide">
                  {rankBadgeText}
                </h3>
                <p className="text-xs text-stone-300 font-sans max-w-xl">
                  {isRankS 
                    ? '¡Tu dominio de los bucles, condicionales y funciones ha rozado la perfección! Has alcanzado el rango más codiciado de todo el gremio.' 
                    : '¡Has demostrado una gran tenacidad resolviendo cada misterio algorítmico y conquistando las 11 misiones de combate!'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 bg-black/40 px-4 py-2 rounded-xl border border-white/10 font-mono text-xs text-center shrink-0">
              <div>
                <div className="text-stone-400 text-[10px]">XP TOTAL</div>
                <div className="text-amber-300 font-bold text-sm">{progress.xp} XP</div>
              </div>
              <div className="w-px h-6 bg-stone-700" />
              <div>
                <div className="text-stone-400 text-[10px]">ESTRELLAS</div>
                <div className="text-yellow-400 font-bold text-sm">{totalStars} / 33 ⭐</div>
              </div>
              <div className="w-px h-6 bg-stone-700" />
              <div>
                <div className="text-stone-400 text-[10px]">PERFECTAS</div>
                <div className="text-emerald-400 font-bold text-sm">{progress.stats.perfectLevels}</div>
              </div>
            </div>
          </div>

          {/* Real Parchment Printable Certificate Card (A4 Aspect Ratio) */}
          <div className="overflow-x-auto pb-2">
            <div 
              ref={certificateRef}
              id="adventurer-certificate-node"
              className="w-full min-w-[760px] p-8 sm:p-10 rounded-2xl bg-[#faf6ee] text-[#2c170c] border-[6px] border-[#855d34] shadow-2xl relative select-none"
              style={{
                backgroundImage: 'radial-gradient(#e9dac3 1px, transparent 1px)',
                backgroundSize: '24px 24px',
              }}
            >
              {/* Inner Decorative Golden Border */}
              <div className="absolute inset-3 border-2 border-[#b8864a]/80 pointer-events-none rounded-xl" />
              <div className="absolute inset-4 border border-[#855d34]/40 pointer-events-none rounded-lg" />

              {/* Header */}
              <div className="text-center space-y-1 relative z-10">
                <div className="flex items-center justify-center gap-3 text-xs font-serif uppercase tracking-[0.2em] text-[#854d0e] font-bold">
                  <span>✦ REINO DE ALGORITMIA</span>
                  <span>•</span>
                  <span>GREMIO REAL DE AVENTUREROS Y PROGRAMADORES ✦</span>
                </div>
                <h4 className="text-xs font-mono text-stone-600 font-bold">
                  I.E.S. VIRGEN DE LA VICTORIA • Computación y Digitalización (CDPC 1º Bachillerato)
                </h4>

                {/* Main Heading */}
                <div className="pt-3 pb-1">
                  <h1 className="text-2xl sm:text-3xl font-rpg-title font-extrabold text-[#4a2408] tracking-wider uppercase drop-shadow-sm">
                    Licencia Oficial de Aventurero Programador
                  </h1>
                  <div className="w-48 h-1 bg-gradient-to-r from-transparent via-[#b45309] to-transparent mx-auto mt-2" />
                </div>

                {/* Rank Banner in certificate */}
                <div className="inline-block my-2 px-5 py-1 rounded-full bg-gradient-to-r from-[#2a170c] via-[#432311] to-[#2a170c] border border-amber-500 text-amber-300 font-mono text-xs font-bold tracking-widest shadow-md">
                  {isRankS ? '⭐ LICENCIA OFICIAL: RANGO S (MAESTRÍA SUPREMA) ⭐' : '🛡️ LICENCIA OFICIAL: RANGO A (VETERANO DEL GREMIO) 🛡️'}
                </div>
              </div>

              {/* Central Proclamation */}
              <div className="text-center my-6 space-y-3 relative z-10">
                <p className="text-xs sm:text-sm font-serif italic text-stone-700">
                  Por decreto del Máster de la Mazmorra y el Claustro de Profesores, se otorga con honores este reconocimiento a:
                </p>

                {/* Student / Adventurer Name */}
                <div className="py-2">
                  <div className="text-2xl sm:text-3xl font-serif font-black text-[#66320a] tracking-wide border-b-2 border-[#b45309]/50 inline-block px-8 pb-1">
                    {userNameInput.trim() || 'Aventurero Anónimo'}
                  </div>
                  <div className="text-xs font-mono text-[#854d0e] font-bold mt-1">
                    {rankTitle}
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-stone-800 max-w-2xl mx-auto font-serif leading-relaxed">
                  Por haber conquistado exitosamente las <strong>11 misiones</strong> de la comitiva, demostrando maestría en 
                  <strong> sintaxis de combate, variables arcanas, condicionales lógicos if/elif/else, bucles for/while, listas e inventarios, 
                  y conjuración de funciones def</strong> hasta la derrota del Dragón de la Mazmorra.
                </p>
              </div>

              {/* Mission Feats Grid */}
              <div className="grid grid-cols-4 gap-3 max-w-2xl mx-auto my-6 p-3 rounded-xl bg-[#f0e3cc]/80 border border-[#b8864a] text-center font-mono text-xs relative z-10">
                <div className="p-1">
                  <span className="text-[10px] text-stone-600 block">XP TOTAL</span>
                  <span className="text-sm font-bold text-[#78350f]">{progress.xp} XP</span>
                </div>
                <div className="p-1 border-l border-[#b8864a]/50">
                  <span className="text-[10px] text-stone-600 block">MISIONES</span>
                  <span className="text-sm font-bold text-emerald-800">11 / 11 (100%)</span>
                </div>
                <div className="p-1 border-l border-[#b8864a]/50">
                  <span className="text-[10px] text-stone-600 block">ESTRELLAS</span>
                  <span className="text-sm font-bold text-amber-700">{totalStars} / 33 ⭐</span>
                </div>
                <div className="p-1 border-l border-[#b8864a]/50">
                  <span className="text-[10px] text-stone-600 block">INSIGNIAS</span>
                  <span className="text-sm font-bold text-purple-800">{progress.unlockedBadges.length} Trofeos</span>
                </div>
              </div>

              {/* Signatures & Seal Section */}
              <div className="flex items-end justify-between pt-6 border-t border-[#855d34]/40 relative z-10">
                {/* Left Signature: DM */}
                <div className="text-center w-52 space-y-1">
                  <div className="font-serif italic text-base text-[#4a2408] font-bold border-b border-stone-600 pb-1">
                    El Máster de la Mazmorra
                  </div>
                  <div className="text-[10px] font-mono text-stone-600 uppercase">
                    Director de Partida & Reglas
                  </div>
                </div>

                {/* Central Wax Seal */}
                <div className="flex flex-col items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-red-800 via-red-700 to-amber-900 border-2 border-amber-300 shadow-lg flex flex-col items-center justify-center text-amber-200 font-rpg-title text-[9px] font-bold text-center leading-tight">
                    <span>SELLO</span>
                    <span>REAL</span>
                    <span className="text-[8px]">PYTHON</span>
                  </div>
                  <span className="text-[9px] font-mono text-stone-500 mt-1">
                    {certificateId}
                  </span>
                </div>

                {/* Right Signature: Department */}
                <div className="text-center w-52 space-y-1">
                  <div className="font-serif italic text-base text-[#4a2408] font-bold border-b border-stone-600 pb-1">
                    Dpto. de Informática
                  </div>
                  <div className="text-[10px] font-mono text-stone-600 uppercase">
                    I.E.S. Virgen de la Victoria
                  </div>
                </div>
              </div>

              {/* Bottom Date Note */}
              <div className="text-center text-[10px] font-serif text-stone-500 pt-4">
                Expedido y registrado en las Crónicas de Algoritmia el {issueDate}.
              </div>
            </div>
          </div>

          {/* Action buttons footer */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <span className="text-xs text-stone-600 font-mono">
              Tip: Puedes descargar el certificado en PDF todas las veces que quieras.
            </span>

            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  sound.click();
                  onClose();
                }}
                className="px-4 py-2 rounded-xl bg-[#e6d6be] hover:bg-[#d8c5aa] border border-[#855d34] text-stone-800 text-xs font-bold cursor-pointer transition"
              >
                Volver al Mapa
              </button>
              <button
                onClick={handleDownloadPDF}
                disabled={isGeneratingPdf}
                className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-stone-950 text-xs font-bold font-rpg-title tracking-wide shadow-md flex items-center gap-2 cursor-pointer transition disabled:opacity-50"
              >
                <Download size={15} />
                <span>{isGeneratingPdf ? 'Preparando...' : 'Descargar PDF'}</span>
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
