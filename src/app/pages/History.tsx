import { Link } from "react-router";
import { ArrowLeft, Clock, Map as MapIcon, Calendar, ArrowRight, Activity, AlertTriangle } from "lucide-react";
import { BottomNav } from "../components/BottomNav";

export function History() {
  const pastAnalyses = [
    {
      id: 1,
      title: "Cierre Av. Libertador",
      date: "Hoy, 10:30 AM",
      status: "Crítico",
      impact: "Alto",
      icon: AlertTriangle,
      color: "text-rose-400"
    },
    {
      id: 2,
      title: "Desvío Troncal Caribe",
      date: "Ayer, 14:15 PM",
      status: "Moderado",
      impact: "Medio",
      icon: Activity,
      color: "text-amber-400"
    },
    {
      id: 3,
      title: "Mantenimiento Carrera 5ta",
      date: "May 18, 08:00 AM",
      status: "Leve",
      impact: "Bajo",
      icon: Activity,
      color: "text-emerald-400"
    }
  ];

  return (
    <>
      <div className="flex-1 pb-24 overflow-y-auto">
        <header className="p-6 pb-2 relative z-20">
          <div className="flex items-center gap-4 mb-6">
            <Link to="/" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center backdrop-blur-md text-white/70 hover:text-white transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-2xl font-light text-white tracking-wide flex items-center gap-3">
              <Clock className="w-6 h-6 text-cyan-400" />
              Historial
            </h1>
          </div>
          <p className="text-white/60 text-sm font-light leading-relaxed">
            Tus análisis de impacto previos en la ciudad de Santa Marta.
          </p>
        </header>

        <main className="p-6 space-y-4">
          {pastAnalyses.map((item) => (
            <div key={item.id} className="group relative bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-md overflow-hidden hover:bg-white/10 transition-colors cursor-pointer">
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              
              <div className="relative z-10 flex items-center justify-between">
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center ${item.color}`}>
                    <item.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-white font-medium mb-1">{item.title}</h3>
                    <div className="flex items-center gap-3 text-xs text-white/50">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {item.date}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapIcon className="w-3 h-3" />
                        Santa Marta
                      </span>
                    </div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-white/30 group-hover:text-cyan-400 transition-colors transform group-hover:translate-x-1" />
              </div>
            </div>
          ))}
        </main>
      </div>
      <BottomNav />
    </>
  );
}
