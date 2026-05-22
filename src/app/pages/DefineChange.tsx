import { useState } from "react";
import { useNavigate, useLocation } from "react-router";
import { LiquidCard } from "../components/LiquidCard";
import { LiquidButton } from "../components/LiquidButton";
import { 
  Construction, 
  ArrowRightLeft, 
  Bike, 
  CarFront, 
  Ban, 
  Clock, 
  Calendar,
  Plus,
  ArrowRight,
  ChevronLeft
} from "lucide-react";
import { cn } from "../lib/utils";

export function DefineChange() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state || {};
  const { analysisName = "Nuevo Análisis", primaryStreet = "Vía seleccionada" } = state;
  
  const [selectedType, setSelectedType] = useState<string>("Cierre total");
  const [scheduleMode, setScheduleMode] = useState<"24h" | "specific">("24h");
  const [intervals, setIntervals] = useState([{ from: "07:00", to: "19:00" }]);

  const changeTypes = [
    { id: "Cierre total", label: "Cierre total por construcción", icon: Construction },
    { id: "Cambio sentido", label: "Cambio de sentido (doble a único)", icon: ArrowRightLeft },
    { id: "Motos", label: "Restricción: Motos", icon: Bike },
    { id: "Particulares", label: "Restricción: Vehículos Particulares", icon: CarFront },
    { id: "Parqueo", label: "Zona de parqueo prohibido", icon: Ban },
  ];

  const addInterval = () => {
    setIntervals([...intervals, { from: "12:00", to: "14:00" }]);
  };

  return (
    <div className="flex-1 flex flex-col min-h-[100dvh]">
      {/* Header */}
      <div className="pt-12 px-6 pb-4 flex items-center gap-4">
        <button 
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/10 text-slate-300 active:scale-95"
        >
          <ChevronLeft size={20} />
        </button>
        <h1 className="text-xl font-bold text-white tracking-wide">
          Definir Cambio
        </h1>
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-32 space-y-8">
        {/* Step 1 */}
        <section>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-xs font-bold border border-cyan-500/30">
              1
            </div>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-300">
              Tipo de Cambio
            </h2>
          </div>
          
          <div className="grid gap-3">
            {changeTypes.map((type) => {
              const Icon = type.icon;
              const isSelected = selectedType === type.id;
              
              return (
                <button
                  key={type.id}
                  onClick={() => setSelectedType(type.id)}
                  className={cn(
                    "relative overflow-hidden w-full text-left rounded-2xl p-4 transition-all duration-300 border",
                    isSelected 
                      ? "bg-cyan-500/10 border-cyan-400/50 shadow-[0_0_15px_rgba(0,240,255,0.15)]" 
                      : "bg-white/5 border-white/10 hover:bg-white/10"
                  )}
                >
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center transition-colors",
                      isSelected ? "bg-cyan-400 text-black shadow-[0_0_10px_rgba(0,240,255,0.8)]" : "bg-black/30 text-slate-400"
                    )}>
                      <Icon size={18} />
                    </div>
                    <span className={cn(
                      "font-medium text-sm",
                      isSelected ? "text-cyan-100" : "text-slate-300"
                    )}>
                      {type.label}
                    </span>
                  </div>
                </button>
              )
            })}
          </div>
        </section>

        {/* Step 2 */}
        <section>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-6 h-6 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center text-xs font-bold border border-purple-500/30">
              2
            </div>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-300">
              Horario del Cambio
            </h2>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setScheduleMode("24h")}
              className={cn(
                "p-4 rounded-2xl flex flex-col items-center justify-center gap-2 border transition-all duration-300",
                scheduleMode === "24h"
                  ? "bg-purple-500/10 border-purple-400/50 shadow-[0_0_15px_rgba(176,38,255,0.15)] text-purple-200"
                  : "bg-white/5 border-white/10 text-slate-400 hover:bg-white/10"
              )}
            >
              <Calendar size={24} className={scheduleMode === "24h" ? "text-purple-400" : ""} />
              <span className="text-xs font-medium text-center">Las 24 horas<br/>del día</span>
            </button>
            <button
              onClick={() => setScheduleMode("specific")}
              className={cn(
                "p-4 rounded-2xl flex flex-col items-center justify-center gap-2 border transition-all duration-300",
                scheduleMode === "specific"
                  ? "bg-purple-500/10 border-purple-400/50 shadow-[0_0_15px_rgba(176,38,255,0.15)] text-purple-200"
                  : "bg-white/5 border-white/10 text-slate-400 hover:bg-white/10"
              )}
            >
              <Clock size={24} className={scheduleMode === "specific" ? "text-purple-400" : ""} />
              <span className="text-xs font-medium text-center">Ciertas horas<br/>específicas</span>
            </button>
          </div>
        </section>

        {/* Step 3 - Conditional */}
        {scheduleMode === "specific" && (
          <section className="animate-in fade-in slide-in-from-top-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-6 h-6 rounded-full bg-slate-700/50 text-slate-300 flex items-center justify-center text-xs font-bold border border-white/10">
                3
              </div>
              <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-300">
                Intervalos de Tiempo
              </h2>
            </div>

            <div className="space-y-3">
              {intervals.map((interval, idx) => (
                <LiquidCard key={idx} className="p-4 flex items-center gap-4">
                  <div className="flex-1">
                    <label className="text-[10px] text-slate-400 uppercase tracking-wider mb-1 block">Desde</label>
                    <input 
                      type="time" 
                      defaultValue={interval.from}
                      className="bg-black/30 border border-white/10 rounded-lg px-3 py-2 w-full text-sm focus:outline-none focus:border-cyan-400/50 [color-scheme:dark]"
                    />
                  </div>
                  <div className="w-4 h-px bg-white/20 mt-4"></div>
                  <div className="flex-1">
                    <label className="text-[10px] text-slate-400 uppercase tracking-wider mb-1 block">Hasta</label>
                    <input 
                      type="time" 
                      defaultValue={interval.to}
                      className="bg-black/30 border border-white/10 rounded-lg px-3 py-2 w-full text-sm focus:outline-none focus:border-cyan-400/50 [color-scheme:dark]"
                    />
                  </div>
                </LiquidCard>
              ))}
              
              <button 
                onClick={addInterval}
                className="w-full py-4 border border-dashed border-white/20 rounded-2xl flex items-center justify-center gap-2 text-sm font-medium text-slate-400 hover:text-cyan-400 hover:border-cyan-400/50 hover:bg-cyan-500/5 transition-all"
              >
                <Plus size={16} />
                Añadir otro intervalo
              </button>
            </div>
          </section>
        )}
      </div>

      <div className="fixed bottom-0 w-full max-w-md p-6 bg-gradient-to-t from-black via-black/80 to-transparent pointer-events-none">
        <LiquidButton 
          className="w-full pointer-events-auto shadow-[0_10px_40px_rgba(0,0,0,0.8)]"
          onClick={() => navigate('/analysis', { state: { analysisName, primaryStreet, selectedType } })}
        >
          Generar Análisis
          <ArrowRight size={18} />
        </LiquidButton>
      </div>
    </div>
  );
}
