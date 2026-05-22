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

  // Lógica del tráfico dinámica y real
  const isRestriction = selectedType === "Motos" || selectedType === "Particulares" || selectedType === "Parqueo";
  
  // Tráfico base de un día típico en Santa Marta (Medido en Vehículos equivalentes por Hora - veh/h)
  const baseTraffic = [
    { time: "00:00", val: 120 }, // Noche / Vacío
    { time: "04:00", val: 50 },  // Madrugada
    { time: "06:00", val: 450 }, // Inicio de jornada
    { time: "07:30", val: 1350 }, // Pico mañana (trabajo/colegios)
    { time: "09:30", val: 850 },  // Valle intermedio
    { time: "12:30", val: 1550 }, // Pico mediodía (muy marcado en la Costa, salida colegios y almuerzo)
    { time: "15:00", val: 950 },  // Valle tarde
    { time: "18:30", val: 1650 }, // Pico tarde (retorno a casa)
    { time: "20:30", val: 800 },  // Noche temprana
    { time: "22:00", val: 350 },  // Noche
  ];

  let analysisText = "";
  let peakHourImpact = "";
  let globalImpact = "";
  let effectiveness = "";
  let sideEffects = "";

  const data = baseTraffic.map(bt => {
    let projVal = bt.val;
    
    if (selectedType === "Cierre total") {
      projVal = bt.val + (bt.val * 0.65); // Congestión severa en vías alternas
      analysisText = `El cierre total en la ${primaryStreet} anulará la capacidad de esta arteria. Al ser Santa Marta una ciudad con conectividad vial muy limitada y grandes embudos (ej. Troncal del Caribe o Carrera 5ta), el tráfico se desviará colapsando las vías alternas. Los tiempos de viaje se duplicarán.`;
      peakHourImpact = "Aumenta 65%";
      globalImpact = "Empeora 55%";
      effectiveness = "Colapso Vial"; 
      sideEffects = "Se saturan (+65%)";
    } else if (selectedType === "Cambio sentido") {
      projVal = bt.val > 1000 ? bt.val * 0.85 : bt.val * 1.05; // Reduce cuellos de botella pesados
      analysisText = `Convertir la ${primaryStreet} a un único sentido optimizará los tiempos semafóricos y reducirá los conflictos de giro, algo crucial en arterias estrechas del Distrito. Disminuye los embotellamientos pico, aunque recarga ligeramente el par vial paralelo.`;
      peakHourImpact = "Disminuye 15%";
      globalImpact = "Mejora 10%";
      effectiveness = "Flujo Aceptable";
      sideEffects = "Suben leve (+10%)";
    } else if (selectedType === "Motos") {
      projVal = bt.val * 0.55; // Reducción masiva (las motos son más de la mitad del parque automotor)
      analysisText = `En Santa Marta, las motocicletas representan más del 55% del parque automotor. Restringirlas en la ${primaryStreet} eliminaría la mayor fuente de fricción lateral y siniestralidad, logrando una fluidez constante casi ideal para el transporte público.`;
      peakHourImpact = "Disminuye 45%";
      globalImpact = "Mejora 35%";
      effectiveness = "Excelente Fluidez";
      sideEffects = "Mejoran también (-15%)";
    } else if (selectedType === "Particulares") {
      projVal = bt.val > 1000 ? bt.val * 0.70 : bt.val * 0.85;
      analysisText = `Extender el 'Pico y Placa' para vehículos particulares en la ${primaryStreet} aliviará la carga estructural en horas críticas (07:30, 12:30 y 18:30). Fomentará el uso del transporte público y reducirá las colas en las glorietas e intersecciones principales.`;
      peakHourImpact = "Disminuye 30%";
      globalImpact = "Mejora 20%";
      effectiveness = "Buena Fluidez";
      sideEffects = "Leve mejora (-5%)";
    } else if (selectedType === "Parqueo") {
      projVal = bt.val * 0.75;
      analysisText = `La invasión del espacio público es uno de los mayores problemas viales en Santa Marta (especialmente en Centro Histórico y Mercado). Prohibir y controlar el parqueo en la ${primaryStreet} recuperará la capacidad de carril y eliminará frenados bruscos.`;
      peakHourImpact = "Disminuye 25%";
      globalImpact = "Mejora 25%";
      effectiveness = "Flujo Constante";
      sideEffects = "Se congestionan (+15%)";
    } else {
      projVal = bt.val;
      analysisText = `El cambio propuesto en la ${primaryStreet} generará modificaciones en los patrones de movilidad locales, requiere un análisis de micro-simulación detallado.`;
      peakHourImpact = "Sin cambios";
      globalImpact = "Igual al actual";
      effectiveness = "Flujo Normal";
      sideEffects = "Sin impacto";
    }

    return {
      time: bt.time,
      base: bt.val,
      proj: Math.round(projVal)
    };
  });

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
