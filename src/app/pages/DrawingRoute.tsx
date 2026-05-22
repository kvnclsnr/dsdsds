import { useState } from "react";
import { useNavigate } from "react-router";
import { LiquidCard } from "../components/LiquidCard";
import { LiquidButton } from "../components/LiquidButton";
import { Search, MapPin, X, Trash2, ArrowRight } from "lucide-react";
import { cn } from "../lib/utils";
import { SantaMartaMap } from "../components/SantaMartaMap";

interface Point {
  lat: number;
  lng: number;
  originalLat?: number;
  originalLng?: number;
  disconnected?: boolean;
  streetName?: string;
}

async function snapPoint(lat: number, lng: number, ambosCarriles: boolean): Promise<Point> {
  try {
    if (ambosCarriles) {
      const res = await fetch(`https://router.project-osrm.org/nearest/v1/driving/${lng},${lat}?number=5`);
      const data = await res.json();
      if (data.code === 'Ok' && data.waypoints && data.waypoints.length > 0) {
        const wp1 = data.waypoints[0];
        
        // Buscar otro punto cercano en la misma vía (misma calle, diferente calzada)
        const wp2 = data.waypoints.find((wp: any, i: number) => {
          if (i === 0) return false;
          if (wp1.name && wp.name !== wp1.name) return false;
          if (!wp1.name && wp.name) return false;
          
          // Calcular distancia aproximada en metros
          const dx = (wp1.location[0] - wp.location[0]) * 111320 * Math.cos(lat * Math.PI / 180);
          const dy = (wp1.location[1] - wp.location[1]) * 111320;
          const dist = Math.sqrt(dx * dx + dy * dy);
          
          // Si está a menos de 4 metros es la misma calzada, si es > 40 es otra calle
          if (dist < 4 || dist > 40) return false;
          return true;
        });
        
        if (wp2) {
          // Es una doble vía, promediamos las posiciones para quedar en el medio de las dos calzadas
          const avgLng = (wp1.location[0] + wp2.location[0]) / 2;
          const avgLat = (wp1.location[1] + wp2.location[1]) / 2;
          return { lat: avgLat, lng: avgLng, originalLat: lat, originalLng: lng, streetName: wp1.name };
        }
        
        return { lat: wp1.location[1], lng: wp1.location[0], originalLat: lat, originalLng: lng, streetName: wp1.name };
      }
    } else {
      const res = await fetch(`https://router.project-osrm.org/nearest/v1/driving/${lng},${lat}?number=1`);
      const data = await res.json();
      if (data.code === 'Ok' && data.waypoints && data.waypoints.length > 0) {
        const wp = data.waypoints[0];
        return { lat: wp.location[1], lng: wp.location[0], originalLat: lat, originalLng: lng, streetName: wp.name };
      }
    }
  } catch (error) {
    console.error("Error al centrar en la vía:", error);
  }
  return { lat, lng, originalLat: lat, originalLng: lng };
}

export function DrawingRoute() {
  const navigate = useNavigate();
  const [points, setPoints] = useState<Point[]>([]);
  const [ambosCarriles, setAmbosCarriles] = useState(false);
  const [showJoinPrompt, setShowJoinPrompt] = useState<{lat: number, lng: number} | null>(null);
  const [analysisName, setAnalysisName] = useState("");

  // Determinar la vía principal basándonos en los puntos trazados (la que más se repite o la primera con nombre)
  const primaryStreet = points.find(p => p.streetName && p.streetName !== "")?.streetName || "Ninguna vía seleccionada";

  const handleMapClick = async (latlng: {lat: number, lng: number}) => {
    if (points.length > 0) {
      const R = 6371e3; // radio de la Tierra en metros
      const lat2 = latlng.lat * Math.PI / 180;
      
      // Chequear si está muy cerca de ALGÚN punto existente (menos de 80 metros)
      const isCloseToAny = points.some(p => {
        const lat1 = p.lat * Math.PI / 180;
        const dp = (latlng.lat - p.lat) * Math.PI / 180;
        const dl = (latlng.lng - p.lng) * Math.PI / 180;
        const a = Math.sin(dp/2) * Math.sin(dp/2) + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dl/2) * Math.sin(dl/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return (R * c) < 80;
      });

      if (isCloseToAny) {
        setShowJoinPrompt(latlng);
        return; // Esperar a la decisión del usuario
      }
    }

    const newPoint = await snapPoint(latlng.lat, latlng.lng, ambosCarriles);
    setPoints(prev => [...prev, newPoint]);
  };

  const handleJoinAccept = async () => {
    if (showJoinPrompt) {
      const newPoint = await snapPoint(showJoinPrompt.lat, showJoinPrompt.lng, ambosCarriles);
      setPoints(prev => [...prev, newPoint]);
      setShowJoinPrompt(null);
    }
  };

  const handleJoinReject = async () => {
    if (showJoinPrompt) {
      const newPoint = await snapPoint(showJoinPrompt.lat, showJoinPrompt.lng, ambosCarriles);
      // Se coloca pero SIN conectar el trazo con el punto anterior
      setPoints(prev => [...prev, { ...newPoint, disconnected: true }]);
      setShowJoinPrompt(null);
    }
  };

  const toggleAmbosCarriles = async () => {
    const newValue = !ambosCarriles;
    setAmbosCarriles(newValue);
    
    // Si ya hay puntos, reevaluarlos según la nueva configuración
    if (points.length > 0) {
      const updatedPoints = await Promise.all(
        points.map(p => snapPoint(p.originalLat || p.lat, p.originalLng || p.lng, newValue))
      );
      setPoints(updatedPoints);
    }
  };

  const handlePointClick = (index: number) => {
    // Al tocar un punto, eliminamos ese y los siguientes
    setPoints(prev => prev.slice(0, index));
  };

  const clearPoints = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPoints([]);
  };

  return (
    <div className="relative w-full h-full min-h-[100dvh] flex flex-col bg-black overflow-hidden">
      {/* Map Background */}
      <div className="absolute inset-0 z-0 overflow-hidden cursor-crosshair">
        <SantaMartaMap 
          points={points} 
          onMapClick={handleMapClick}
          onPointClick={handlePointClick}
          ambosCarriles={ambosCarriles}
        />
      </div>

      {/* Join Prompt Modal */}
      {showJoinPrompt && (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <LiquidCard className="p-6 max-w-sm w-full border border-cyan-500/30 shadow-[0_0_30px_rgba(0,240,255,0.15)] pointer-events-auto">
            <h3 className="text-lg font-bold text-white mb-2">¿Deseas unir los trazados?</h3>
            <p className="text-sm text-slate-300 mb-6">El sistema detecta cercanía, puedes unificar los puntos para crear una ruta continua.</p>
            
            <div className="flex gap-3">
              <LiquidButton 
                variant="secondary" 
                className="flex-1 text-xs"
                onClick={handleJoinReject}
              >
                Descartar
              </LiquidButton>
              <LiquidButton 
                variant="primary" 
                className="flex-1 text-xs bg-cyan-500/20 text-cyan-300 border-cyan-500/50 hover:bg-cyan-500/30"
                onClick={handleJoinAccept}
              >
                Unificar
              </LiquidButton>
            </div>
          </LiquidCard>
        </div>
      )}

      {/* Top Overlay Card */}
      <div className="relative z-20 p-6 pt-12 space-y-4 pointer-events-none">
        <LiquidCard className="p-5 pointer-events-auto">
          <h2 className="text-xl font-bold mb-1">Dibujar ruta</h2>
          <p className="text-xs text-slate-400 mb-4">Toca en el mapa para marcar puntos...</p>
          
          <div className="space-y-3">
            <div className="relative">
              <input 
                type="text" 
                placeholder="Nombre para el análisis..." 
                value={analysisName}
                onChange={(e) => setAnalysisName(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:border-cyan-500/50 transition-colors placeholder:text-slate-500"
              />
            </div>
            
            <div className="flex items-center gap-3 bg-white/5 rounded-xl p-3 border border-white/5">
              <MapPin className="text-cyan-400" size={18} />
              <div className="flex-1">
                <p className="text-[10px] text-slate-400 uppercase tracking-wider">Nombre de la vía</p>
                <p className="text-sm font-medium">{primaryStreet}</p>
              </div>
            </div>
          </div>
        </LiquidCard>

        {/* Ambos Carriles Toggle */}
        <LiquidCard className="p-4 flex items-center justify-between pointer-events-auto">
          <div>
            <h3 className="text-sm font-semibold">Ambos carriles</h3>
            <p className="text-[11px] text-slate-400">Aplica el cambio en ambas direcciones</p>
          </div>
          <button 
            onClick={toggleAmbosCarriles}
            className={cn(
              "w-12 h-6 rounded-full relative transition-colors duration-300 border",
              ambosCarriles 
                ? "bg-cyan-500/30 border-cyan-400/50 shadow-[0_0_10px_rgba(0,240,255,0.3)]" 
                : "bg-white/10 border-white/10"
            )}
          >
            <div 
              className={cn(
                "absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform duration-300",
                ambosCarriles ? "translate-x-6 shadow-[0_0_10px_rgba(255,255,255,0.8)]" : ""
              )}
            />
          </button>
        </LiquidCard>
      </div>

      <div className="flex-1 pointer-events-none" />

      {/* Bottom Controls */}
      <div className="relative z-20 p-6 space-y-4 pointer-events-none">
        
        {/* Points Counter */}
        {points.length > 0 && (
          <LiquidCard className="p-4 flex items-center justify-between pointer-events-auto animate-in slide-in-from-bottom-4 fade-in">
            <div>
              <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-0.5">Puntos marcados</p>
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-bold text-cyan-400">{points.length} puntos</span>
                <span className="text-xs text-slate-400">{
                  points.reduce((acc, p) => {
                    if (!p.originalLat || !p.originalLng) return acc;
                    const R = 6371e3;
                    const lat1 = p.lat * Math.PI / 180;
                    const lat2 = p.originalLat * Math.PI / 180;
                    const dp = (p.originalLat - p.lat) * Math.PI / 180;
                    const dl = (p.originalLng - p.lng) * Math.PI / 180;
                    const a = Math.sin(dp/2) * Math.sin(dp/2) + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dl/2) * Math.sin(dl/2);
                    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
                    return acc + (R * c);
                  }, 0).toFixed(1)
                } metros ajustados</span>
              </div>
            </div>
            <button 
              onClick={clearPoints}
              className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center border border-red-500/30 text-red-400 hover:bg-red-500/30 transition-colors"
            >
              <Trash2 size={18} />
            </button>
          </LiquidCard>
        )}

        <div className="flex gap-3 pointer-events-auto">
          <LiquidButton 
            variant="secondary" 
            className="flex-1"
            onClick={() => navigate('/')}
          >
            Cancelar
          </LiquidButton>
          <LiquidButton 
            variant="primary" 
            className="flex-1"
            disabled={points.length < 2}
            onClick={() => navigate('/define-change', { state: { analysisName, primaryStreet } })}
          >
            Confirmar
          </LiquidButton>
        </div>
      </div>
    </div>
  );
}
