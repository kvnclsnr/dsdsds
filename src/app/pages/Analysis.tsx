import { useNavigate, useLocation } from "react-router";
import { LiquidCard } from "../components/LiquidCard";
import { ChevronLeft, Info, Download, AlertTriangle } from "lucide-react";
import { cn } from "../lib/utils";

export function Analysis() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state || {};
  const analysisName = state.analysisName || "Análisis de Impacto";
  const primaryStreet = state.primaryStreet && state.primaryStreet !== "Ninguna vía seleccionada" 
    ? state.primaryStreet 
    : "Av. del Río"; // Default para Santa Marta
  const selectedType = state.selectedType || "Cierre total";

  const scheduleMode = state.scheduleMode || "24h";
  const intervals = Array.isArray(state.intervals) && state.intervals.length
    ? state.intervals
    : [{ from: "07:00", to: "19:00" }];

  const parseTimeToMinutes = (time: string) => {
    const [h, m] = time.split(":").map(Number);
    return (h * 60 + m) % 1440;
  };

  const isInActiveInterval = (time: string) => {
    if (scheduleMode === "24h") return true;
    const timeMin = parseTimeToMinutes(time);

    return intervals.some((it: { from: string; to: string }) => {
      const from = parseTimeToMinutes(it.from);
      const to = parseTimeToMinutes(it.to);
      if (from === to) return true;
      if (from < to) return timeMin >= from && timeMin <= to;
      return timeMin >= from || timeMin <= to;
    });
  };

  // Curva base representativa (veh/h) por franja horaria en Santa Marta.
  const baseTraffic = [
    { time: "00:00", val: 160 },
    { time: "04:00", val: 70 },
    { time: "06:00", val: 520 },
    { time: "07:30", val: 1480 },
    { time: "09:30", val: 920 },
    { time: "12:30", val: 1620 },
    { time: "15:00", val: 1040 },
    { time: "18:30", val: 1720 },
    { time: "20:30", val: 890 },
    { time: "22:00", val: 420 },
  ];

  const hourFactors = Object.fromEntries(
    baseTraffic.map((row) => {
      const h = parseInt(row.time.slice(0, 2), 10);
      const isPeak = [7, 8, 12, 18, 19].includes(h);
      return [row.time, isPeak ? 1.15 : 1];
    })
  );

  const impactByType: Record<string, { active: number; inactive: number; effect: string; side: string }> = {
    "Cierre total": { active: 0.62, inactive: 0.12, effect: "Colapso Vial", side: "Se saturan (+40%)" },
    "Cambio sentido": { active: -0.14, inactive: 0.03, effect: "Flujo Aceptable", side: "Suben leve (+8%)" },
    Motos: { active: -0.28, inactive: -0.08, effect: "Mejora Moderada", side: "Mejora parcial (-6%)" },
    Particulares: { active: -0.2, inactive: -0.05, effect: "Buena Fluidez", side: "Leve mejora (-4%)" },
    Parqueo: { active: -0.18, inactive: -0.04, effect: "Flujo Constante", side: "Mejora parcial (-3%)" },
  };

  const selectedImpact = impactByType[selectedType] || { active: 0, inactive: 0, effect: "Flujo Normal", side: "Sin impacto" };

  const data = baseTraffic.map((bt) => {
    const active = isInActiveInterval(bt.time);
    const factor = hourFactors[bt.time] ?? 1;
    const impact = (active ? selectedImpact.active : selectedImpact.inactive) * factor;
    const projVal = Math.max(0, bt.val * (1 + impact));

    return {
      time: bt.time,
      base: bt.val,
      proj: Math.round(projVal),
      active,
    };
  });

  const totalBase = data.reduce((acc, d) => acc + d.base, 0);
  const totalProj = data.reduce((acc, d) => acc + d.proj, 0);
  const globalChangePct = ((totalProj - totalBase) / totalBase) * 100;
  const peakData = data.find((d) => d.time === "18:30") || data[data.length - 1];
  const peakChangePct = ((peakData.proj - peakData.base) / peakData.base) * 100;

  const formatImpact = (pct: number, positiveIsWorse = true) => {
    const abs = Math.abs(pct).toFixed(1);
    if (Math.abs(pct) < 0.5) return "Sin cambios";
    if ((positiveIsWorse && pct > 0) || (!positiveIsWorse && pct < 0)) return `Aumenta ${abs}%`;
    return `Disminuye ${abs}%`;
  };

  const globalImpact = globalChangePct <= -1 ? `Mejora ${Math.abs(globalChangePct).toFixed(1)}%` : globalChangePct >= 1 ? `Empeora ${globalChangePct.toFixed(1)}%` : "Igual al actual";
  const peakHourImpact = formatImpact(peakChangePct, true);
  const effectiveness = selectedImpact.effect;
  const sideEffects = selectedImpact.side;

  const coveragePct = scheduleMode === "24h" ? 100 : Math.round((data.filter((d) => d.active).length / data.length) * 100);
  const confidence = Math.max(45, Math.min(88, 60 + (scheduleMode === "24h" ? 15 : 5) + (coveragePct > 50 ? 8 : 0)));

  const analysisText = `El resultado usa una proyección horaria por tramos (00:00–22:00) con mayor peso en horas pico de Santa Marta (07:30, 12:30 y 18:30). Para el cambio '${selectedType}' en ${primaryStreet}, el modelo estima ${globalImpact.toLowerCase()} y ${peakHourImpact.toLowerCase()} en hora crítica. Con cobertura activa del ${coveragePct}% del día, la confiabilidad técnica actual es ${confidence}%. Para acercarse a una confiabilidad operativa >95%, se recomienda calibrar con aforos reales por carril, tiempos semafóricos y velocidad GPS por día laboral/festivo.`;

  // SVG Chart Calculations - Ajustado para ser más grande y legible
  const svgWidth = 600;
  const svgHeight = 350;
  const margin = { top: 40, right: 30, bottom: 50, left: 30 };
  const chartWidth = svgWidth - margin.left - margin.right;
  const chartHeight = svgHeight - margin.top - margin.bottom;

  const allValues = data.flatMap(d => [d.base, d.proj]);
  const maxTraffic = Math.max(100, Math.max(...allValues) * 1.15); // 15% padding top

  const svgData = data.map((d, i) => {
    const x = margin.left + (i / (data.length - 1)) * chartWidth;
    const yBase = margin.top + chartHeight - (d.base / maxTraffic) * chartHeight;
    const yProj = margin.top + chartHeight - (Math.max(0, d.proj) / maxTraffic) * chartHeight;
    return { x, yBase, yProj, ...d };
  });

  const baseLine = svgData.map((d, i) => `${i === 0 ? 'M' : 'L'} ${d.x},${d.yBase}`).join(" ");
  const baseY0 = margin.top + chartHeight;
  const baseArea = `${baseLine} L ${svgData[svgData.length-1].x},${baseY0} L ${svgData[0].x},${baseY0} Z`;

  const projLine = svgData.map((d, i) => `${i === 0 ? 'M' : 'L'} ${d.x},${d.yProj}`).join(" ");
  const projArea = `${projLine} L ${svgData[svgData.length-1].x},${baseY0} L ${svgData[0].x},${baseY0} Z`;

  return (
    <div className="flex-1 flex flex-col min-h-[100dvh] overflow-x-hidden">
      {/* Header */}
      <div className="pt-12 px-6 pb-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/')}
            className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/10 text-slate-300 active:scale-95"
          >
            <ChevronLeft size={20} />
          </button>
          <div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-300 to-purple-400">
              {analysisName}
            </h1>
            <p className="text-[10px] text-slate-400 uppercase tracking-wider">Santa Marta</p>
          </div>
        </div>
        <button className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/10 text-cyan-400">
          <Download size={18} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-24 space-y-6">
        {/* Text Analysis Block */}
        <LiquidCard className="p-5 relative" glow="purple">
          <div className="absolute top-4 right-4 text-purple-400 opacity-50">
            <Info size={40} strokeWidth={1} />
          </div>
          <p className="text-sm leading-relaxed text-slate-300 relative z-10">
            {analysisText}
          </p>
        </LiquidCard>

        {/* Graphical Data Visualization */}
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
            Efectividad Proyectada vs. Tráfico Base
          </h2>
          <LiquidCard className="p-4 pt-8 min-h-[380px] flex flex-col relative">
            {/* Custom Background Gradients for Graph Area */}
            <div className="absolute inset-0 bg-gradient-to-b from-cyan-900/10 to-transparent pointer-events-none rounded-2xl" />
            
            <div className="w-full flex-1 relative text-slate-500 flex items-center justify-center">
               <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} preserveAspectRatio="xMidYMid meet" className="w-full h-full overflow-visible">
                 <defs>
                   <linearGradient id="baseGrad" x1="0" y1="0" x2="0" y2="1">
                     <stop offset="0%" stopColor="#b026ff" stopOpacity="0.4" />
                     <stop offset="100%" stopColor="#b026ff" stopOpacity="0.0" />
                   </linearGradient>
                   <linearGradient id="projGrad" x1="0" y1="0" x2="0" y2="1">
                     <stop offset="0%" stopColor="#00f0ff" stopOpacity="0.4" />
                     <stop offset="100%" stopColor="#00f0ff" stopOpacity="0.0" />
                   </linearGradient>
                 </defs>

                 {/* Grid lines */}
                 {[0, 0.25, 0.5, 0.75, 1].map(ratio => {
                   const y = margin.top + chartHeight * ratio;
                   return (
                     <line 
                       key={ratio}
                       x1={margin.left} y1={y} 
                       x2={margin.left + chartWidth} y2={y} 
                       stroke="rgba(255,255,255,0.05)" 
                       strokeWidth="1"
                     />
                   );
                 })}

                 {/* Horas Pico Highlights */}
                 <rect x={margin.left + (3 / 10) * chartWidth} y={margin.top} width={(1 / 10) * chartWidth} height={chartHeight} fill="rgba(239, 68, 68, 0.1)" />
                 <rect x={margin.left + (8 / 10) * chartWidth} y={margin.top} width={(1 / 10) * chartWidth} height={chartHeight} fill="rgba(239, 68, 68, 0.1)" />

                 {/* Tráfico Base */}
                 <path d={baseArea} fill="url(#baseGrad)" />
                 <path d={baseLine} fill="none" stroke="#b026ff" strokeWidth="2.5" />

                 {/* Proyección del Cambio */}
                 <path d={projArea} fill="url(#projGrad)" />
                 <path d={projLine} fill="none" stroke="#00f0ff" strokeWidth="3" style={{ filter: 'drop-shadow(0 0 6px #00f0ff)' }} />

                 {/* X Axis Labels */}
                 {svgData.map((d, i) => i % 2 === 0 ? (
                   <text key={i} x={d.x} y={baseY0 + 25} fill="#94a3b8" fontSize="12" fontWeight="500" textAnchor="middle">
                     {d.time}
                   </text>
                 ) : null)}
               </svg>
            </div>
            
            {/* Callouts Labels */}
            <div className="absolute top-[10%] right-[15%] bg-black/70 backdrop-blur-md border border-cyan-400/30 px-3 py-2 rounded-lg text-xs font-medium text-cyan-200 shadow-[0_0_15px_rgba(0,240,255,0.2)] z-10 pointer-events-none">
              <span className="block text-[10px] text-cyan-400/80 mb-0.5">En Horas Pico (18:30):</span>
              {peakHourImpact}
            </div>
            <div className="absolute top-[40%] left-[30%] bg-black/70 backdrop-blur-md border border-purple-400/30 px-3 py-2 rounded-lg text-xs font-medium text-purple-200 shadow-[0_0_15px_rgba(176,38,255,0.2)] z-10 pointer-events-none">
              <span className="block text-[10px] text-purple-400/80 mb-0.5">Tráfico Base:</span>
              {data[5].base} veh/h a las 12:30
            </div>
          </LiquidCard>
          
          <div className="flex items-center gap-4 text-[10px] justify-center mt-2">
            <div className="flex items-center gap-1.5 text-cyan-300">
              <div className="w-3 h-1 bg-cyan-400 rounded-full shadow-[0_0_5px_#00f0ff]"></div>
              Proyección del Cambio
            </div>
            <div className="flex items-center gap-1.5 text-purple-300">
              <div className="w-3 h-1 bg-purple-400 rounded-full shadow-[0_0_5px_#b026ff]"></div>
              Tráfico Base
            </div>
            <div className="flex items-center gap-1.5 text-red-300">
              <div className="w-2 h-2 bg-red-500/30 rounded-full border border-red-500/50"></div>
              Horas Pico
            </div>
          </div>
        </div>

        {/* Final Summary Card */}
        <LiquidCard className="p-0 overflow-hidden border-t-2 border-t-cyan-400/50">
          <div className="p-4 bg-gradient-to-r from-cyan-900/30 to-purple-900/30 border-b border-white/5">
            <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-0.5">Tramo Analizado</p>
            <h3 className="text-lg font-bold text-white">{primaryStreet}</h3>
          </div>
          <div className="p-4 grid grid-cols-2 gap-4 bg-black/40">
            <div>
              <p className="text-[10px] text-slate-400 mb-1">Estado General</p>
              <div className={cn("flex items-center gap-1.5 font-semibold", globalImpact.includes("Mejora") || globalImpact.includes("Igual") ? "text-emerald-400" : "text-red-400")}>
                <AlertTriangle size={14} />
                {globalImpact}
              </div>
            </div>
            <div>
              <p className="text-[10px] text-slate-400 mb-1">En Horas Pico</p>
              <div className={cn("flex items-center gap-1.5 font-bold", peakHourImpact.includes("Disminuye") || peakHourImpact.includes("Sin cambios") ? "text-emerald-500 drop-shadow-[0_0_5px_rgba(16,185,129,0.5)]" : "text-red-500 drop-shadow-[0_0_5px_rgba(239,68,68,0.5)]")}>
                {peakHourImpact}
              </div>
            </div>
            <div>
              <p className="text-[10px] text-slate-400 mb-1">Nivel de Fluidez</p>
              <div className={cn("flex items-center gap-1.5 font-semibold", effectiveness.includes("Crítico") ? "text-red-400" : effectiveness.includes("Regular") ? "text-yellow-400" : "text-emerald-400")}>
                {effectiveness}
              </div>
            </div>
            <div>
              <p className="text-[10px] text-slate-400 mb-1">Vías Alternas</p>
              <div className={cn("flex items-center gap-1.5 font-semibold", sideEffects.includes("saturan") || sideEffects.includes("congestionan") ? "text-red-400" : sideEffects.includes("Suben") ? "text-orange-400" : "text-emerald-400")}>
                {sideEffects}
              </div>
            </div>
          </div>
        </LiquidCard>

      </div>
    </div>
  );
}
