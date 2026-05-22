import { LiquidCard } from "../components/LiquidCard";
import { LiquidButton } from "../components/LiquidButton";
import { BottomNav } from "../components/BottomNav";
import { Plus, TrendingUp, Map, BarChart3, Navigation, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";

export function Dashboard() {
  const navigate = useNavigate();

  return (
    <div className="flex-1 pb-24 overflow-y-auto">
      {/* Header */}
      <div className="pt-12 px-6 pb-6 relative">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-300 to-purple-400 drop-shadow-[0_0_10px_rgba(0,240,255,0.4)]">
              DesVía
            </h1>
            <p className="text-xs text-slate-400 font-medium tracking-wider mt-1 uppercase">
              Planificación de Tráfico Urbano
            </p>
          </div>
          <div className="w-12 h-12 rounded-full p-0.5 bg-gradient-to-br from-cyan-400 to-purple-500 shadow-[0_0_15px_rgba(176,38,255,0.4)]">
            <ImageWithFallback 
              src="https://images.unsplash.com/photo-1511367461989-f85a21fda167?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9maWxlJTIwcGljdHVyZSUyMGZhY2V8ZW58MXx8fHwxNzc5NDIzMDcxfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral" 
              alt="Perfil" 
              className="w-full h-full rounded-full object-cover border border-black"
            />
          </div>
        </div>
      </div>

      <div className="px-6 space-y-6">
        {/* Metrics */}
        <div className="grid grid-cols-3 gap-3">
          <LiquidCard className="p-4 flex flex-col items-center justify-center text-center">
            <BarChart3 size={20} className="text-cyan-400 mb-2" />
            <span className="text-2xl font-bold">12</span>
            <span className="text-[10px] text-slate-400 mt-1 uppercase tracking-wider">Análisis</span>
          </LiquidCard>
          <LiquidCard className="p-4 flex flex-col items-center justify-center text-center" glow="cyan">
            <TrendingUp size={20} className="text-emerald-400 mb-2 drop-shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
            <span className="text-2xl font-bold text-emerald-400 drop-shadow-[0_0_5px_rgba(52,211,153,0.5)]">18.5%</span>
            <span className="text-[10px] text-slate-400 mt-1 uppercase tracking-wider">Mejora</span>
          </LiquidCard>
          <LiquidCard className="p-4 flex flex-col items-center justify-center text-center">
            <Map size={20} className="text-purple-400 mb-2" />
            <span className="text-2xl font-bold">8</span>
            <span className="text-[10px] text-slate-400 mt-1 uppercase tracking-wider">Vías</span>
          </LiquidCard>
        </div>

        {/* Main Action */}
        <button 
          onClick={() => navigate('/new-route')}
          className="w-full text-left relative overflow-hidden rounded-[2rem] p-6 group transition-transform active:scale-[0.98]"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-600/30 via-purple-600/20 to-transparent backdrop-blur-xl border border-white/20" />
          <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-cyan-500/20 blur-[50px] rounded-full" />
          
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center mb-4 border border-white/20 shadow-[0_0_20px_rgba(0,240,255,0.2)] group-hover:shadow-[0_0_30px_rgba(0,240,255,0.4)] transition-shadow">
                <Plus size={24} className="text-cyan-300" />
              </div>
              <h2 className="text-2xl font-semibold mb-1">Nuevo análisis</h2>
              <p className="text-sm text-slate-300">Simular cambios en vías</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/10 group-hover:bg-white/10 transition-colors">
              <ArrowRight size={20} className="text-cyan-400" />
            </div>
          </div>
        </button>

        {/* Recent Analysis List */}
        <div>
          <h3 className="text-sm font-semibold tracking-wider uppercase text-slate-400 mb-4 px-1">
            Análisis Recientes
          </h3>
          <div className="space-y-3">
            {[
              { name: "Av. del Río", desc: "Cierre total - Tramo 1", time: "Hace 2 horas", impact: "+35%" },
              { name: "Cra 5ta Centro", desc: "Cambio de sentido", time: "Ayer", impact: "-15%" }
            ].map((item, idx) => (
              <LiquidCard key={idx} className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                    <Navigation size={18} className="text-purple-400" />
                  </div>
                  <div>
                    <h4 className="font-medium text-slate-100">{item.name}</h4>
                    <p className="text-[11px] text-slate-400">{item.desc} • {item.time}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`text-sm font-semibold ${item.impact.startsWith('-') ? 'text-emerald-400' : 'text-red-400'}`}>
                    {item.impact}
                  </span>
                </div>
              </LiquidCard>
            ))}
          </div>
        </div>
      </div>
      
      <BottomNav />
    </div>
  );
}
