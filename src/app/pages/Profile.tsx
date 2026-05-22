import { Link } from "react-router";
import { ArrowLeft, User, Settings, Bell, Shield, LogOut } from "lucide-react";
import { BottomNav } from "../components/BottomNav";

export function Profile() {
  const menuItems = [
    { icon: Settings, label: "Configuración", desc: "Ajustes de la aplicación" },
    { icon: Bell, label: "Notificaciones", desc: "Alertas de tráfico" },
    { icon: Shield, label: "Privacidad", desc: "Datos y permisos" },
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
              <User className="w-6 h-6 text-fuchsia-400" />
              Perfil
            </h1>
          </div>
        </header>

        <main className="p-6 space-y-6">
          <div className="flex flex-col items-center justify-center py-6 border-b border-white/10">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-cyan-500/20 to-fuchsia-500/20 border border-white/20 p-1 mb-4 relative">
              <div className="w-full h-full rounded-full bg-[#05050A] flex items-center justify-center overflow-hidden">
                <User className="w-10 h-10 text-white/50" />
              </div>
              <div className="absolute bottom-0 right-0 w-6 h-6 bg-cyan-500 rounded-full border-2 border-[#05050A] shadow-[0_0_10px_rgba(0,240,255,0.8)]" />
            </div>
            <h2 className="text-xl font-medium text-white mb-1">Administrador</h2>
            <p className="text-white/50 text-sm">Tránsito de Santa Marta</p>
          </div>

          <div className="space-y-3">
            {menuItems.map((item, i) => (
              <button key={i} className="w-full flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center">
                    <item.icon className="w-5 h-5 text-cyan-400" />
                  </div>
                  <div className="text-left">
                    <p className="text-white font-medium text-sm">{item.label}</p>
                    <p className="text-white/50 text-xs">{item.desc}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>

          <button className="w-full flex items-center justify-center gap-2 p-4 rounded-xl border border-rose-500/30 text-rose-400 hover:bg-rose-500/10 transition-colors mt-8">
            <LogOut className="w-5 h-5" />
            <span>Cerrar Sesión</span>
          </button>
        </main>
      </div>
      <BottomNav />
    </>
  );
}