import { NavLink } from "react-router";
import { Home, Activity, Clock, User } from "lucide-react";
import { cn } from "../lib/utils";

export function BottomNav() {
  const navItems = [
    { name: "Inicio", path: "/", icon: Home },
    { name: "Análisis", path: "/new-route", icon: Activity },
    { name: "Historial", path: "/history", icon: Clock },
    { name: "Perfil", path: "/profile", icon: User },
  ];

  return (
    <div className="fixed bottom-0 w-full max-w-md pb-safe">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-2xl border-t border-white/10" />
      <div className="relative flex justify-around items-center px-2 py-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  "flex flex-col items-center gap-1.5 transition-colors duration-300",
                  isActive ? "text-cyan-400 drop-shadow-[0_0_8px_rgba(0,240,255,0.6)]" : "text-slate-400 hover:text-slate-300"
                )
              }
            >
              {({ isActive }) => (
                <>
                  <Icon size={22} className={isActive ? "animate-pulse" : ""} strokeWidth={isActive ? 2.5 : 2} />
                  <span className="text-[10px] font-medium tracking-wide">
                    {item.name}
                  </span>
                </>
              )}
            </NavLink>
          );
        })}
      </div>
    </div>
  );
}
