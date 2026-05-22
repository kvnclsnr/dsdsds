import { Outlet } from "react-router";

export function MobileLayout() {
  return (
    <div className="min-h-screen bg-black text-slate-100 flex justify-center w-full font-sans selection:bg-cyan-500/30">
      <div className="relative w-full max-w-md bg-[#05050A] min-h-[100dvh] overflow-x-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] border-x border-white/5">
        {/* Multi-point light play / Orbs */}
        <div className="fixed top-[-10%] left-[-20%] w-[50%] h-[40%] bg-cyan-600/20 rounded-full blur-[100px] pointer-events-none mix-blend-screen" />
        <div className="fixed bottom-[-10%] right-[-20%] w-[60%] h-[50%] bg-fuchsia-700/20 rounded-full blur-[120px] pointer-events-none mix-blend-screen" />
        <div className="fixed top-[40%] left-[60%] w-[30%] h-[30%] bg-blue-600/10 rounded-full blur-[80px] pointer-events-none mix-blend-screen" />

        {/* Custom Frosted Scrollbar via CSS injected locally or tailwind utilities */}
        <style>{`
          ::-webkit-scrollbar {
            width: 4px;
          }
          ::-webkit-scrollbar-track {
            background: transparent;
          }
          ::-webkit-scrollbar-thumb {
            background: rgba(255, 255, 255, 0.15);
            border-radius: 10px;
            backdrop-filter: blur(10px);
          }
          ::-webkit-scrollbar-thumb:hover {
            background: rgba(255, 255, 255, 0.25);
          }
        `}</style>
        
        <div className="relative z-10 w-full h-full flex flex-col min-h-[100dvh]">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
