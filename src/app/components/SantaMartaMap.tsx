import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Polyline, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { cn } from '../lib/utils';

// Componente para capturar los clics en el mapa y devolver lat/lng
function MapClickHandler({ onMapClick }: { onMapClick?: (latlng: {lat: number, lng: number}) => void }) {
  useMapEvents({
    click(e) {
      if (onMapClick) {
        onMapClick(e.latlng);
      }
    },
  });
  return null;
}

interface SantaMartaMapProps {
  points?: {lat: number, lng: number, disconnected?: boolean}[];
  onMapClick?: (latlng: {lat: number, lng: number}) => void;
  onPointClick?: (index: number) => void;
  ambosCarriles?: boolean;
}

export function SantaMartaMap({ points = [], onMapClick, onPointClick, ambosCarriles = false }: SantaMartaMapProps) {
  const position: [number, number] = [11.2408, -74.1990];
  const [routeSegments, setRouteSegments] = useState<[number, number][][]>([]);

  useEffect(() => {
    window.dispatchEvent(new Event('resize'));
  }, []);

  // Calcular la ruta siguiendo las calles usando la API pública de OSRM
  useEffect(() => {
    if (points.length < 2) {
      setRouteSegments([]);
      return;
    }

    if (ambosCarriles) {
      // En modo ambos carriles necesitamos la geometría real de la calle PERO 
      // evitando los bucles/retornos cuando los puntos caen en carriles opuestos.
      const fetchSegments = async () => {
        let allSegments: [number, number][][] = [];
        let currentSegmentCoords: [number, number][] = [];
        
        // Función para calcular distancia en línea recta (Haversine)
        const getStraightDist = (lat1: number, lon1: number, lat2: number, lon2: number) => {
          const R = 6371e3;
          const p1 = lat1 * Math.PI / 180;
          const p2 = lat2 * Math.PI / 180;
          const dp = (lat2 - lat1) * Math.PI / 180;
          const dl = (lon2 - lon1) * Math.PI / 180;
          const a = Math.sin(dp/2) * Math.sin(dp/2) + Math.cos(p1) * Math.cos(p2) * Math.sin(dl/2) * Math.sin(dl/2);
          const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
          return R * c;
        };
        
        for (let i = 0; i < points.length - 1; i++) {
          const pA = points[i];
          const pB = points[i + 1];
          
          if (pB.disconnected) {
            // Se corta el trazo continuo
            if (currentSegmentCoords.length > 0) {
              allSegments.push([...currentSegmentCoords]);
            }
            currentSegmentCoords = [];
            continue; // No conectamos pA con pB
          }
          
          const straightDist = getStraightDist(pA.lat, pA.lng, pB.lat, pB.lng);
          
          const urlDir1 = `https://router.project-osrm.org/route/v1/driving/${pA.lng},${pA.lat};${pB.lng},${pB.lat}?geometries=geojson&overview=full`;
          const urlDir2 = `https://router.project-osrm.org/route/v1/driving/${pB.lng},${pB.lat};${pA.lng},${pA.lat}?geometries=geojson&overview=full`;
          
          try {
            const [res1, res2] = await Promise.all([
              fetch(urlDir1).then(r => r.json()), 
              fetch(urlDir2).then(r => r.json())
            ]);
            
            let route1 = (res1.code === 'Ok' && res1.routes) ? res1.routes[0] : null;
            let route2 = (res2.code === 'Ok' && res2.routes) ? res2.routes[0] : null;
            
            const maxAllowedDist = Math.max(straightDist * 2.0, straightDist + 200);
            
            let r1Valid = route1 && route1.distance <= maxAllowedDist;
            let r2Valid = route2 && route2.distance <= maxAllowedDist;
            
            let bestCoords: [number, number][] = [];
            
            if (r1Valid && r2Valid) {
              if (route1.distance <= route2.distance) {
                bestCoords = route1.geometry.coordinates.map((c: number[]) => [c[1], c[0]]);
              } else {
                bestCoords = route2.geometry.coordinates.map((c: number[]) => [c[1], c[0]]).reverse();
              }
            } else if (r1Valid) {
              bestCoords = route1.geometry.coordinates.map((c: number[]) => [c[1], c[0]]);
            } else if (r2Valid) {
              bestCoords = route2.geometry.coordinates.map((c: number[]) => [c[1], c[0]]).reverse();
            } else {
              bestCoords = [[pA.lat, pA.lng], [pB.lat, pB.lng]];
            }
            
            // Ya NO desplazamos los puntos para evitar los triángulos y picos feos (cosas raras).
            // Simplemente usamos la geometría fluida de OSRM tal cual, para un trazo limpio.
            if (bestCoords.length > 0) {
              if (currentSegmentCoords.length > 0) {
                bestCoords.shift(); // Evitamos duplicar el punto de conexión
              }
              currentSegmentCoords = [...currentSegmentCoords, ...bestCoords];
            }
            
          } catch (err) {
            const fallback = [[pA.lat, pA.lng], [pB.lat, pB.lng]] as [number, number][];
            if (currentSegmentCoords.length > 0) fallback.shift();
            currentSegmentCoords = [...currentSegmentCoords, ...fallback];
          }
        }
        if (currentSegmentCoords.length > 0) {
          allSegments.push(currentSegmentCoords);
        }
        setRouteSegments(allSegments);
      };
      
      fetchSegments();
    } else {
      // Rutina normal para un solo carril (respeta sentidos con perfil driving)
      // Pero debemos respetar los cortes (disconnected)
      const fetchNormalSegments = async () => {
        let allSegments: [number, number][][] = [];
        
        let currentChunk: {lat: number, lng: number}[] = [points[0]];
        for (let i = 1; i < points.length; i++) {
          if (points[i].disconnected) {
            // Fetch route for chunk
            if (currentChunk.length > 1) {
              const coordsStr = currentChunk.map(p => `${p.lng},${p.lat}`).join(';');
              const url = `https://router.project-osrm.org/route/v1/driving/${coordsStr}?geometries=geojson&overview=full`;
              try {
                const res = await fetch(url);
                const data = await res.json();
                if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
                  const coords = data.routes[0].geometry.coordinates;
                  allSegments.push(coords.map((c: number[]) => [c[1], c[0]]));
                } else {
                  allSegments.push(currentChunk.map(p => [p.lat, p.lng]));
                }
              } catch (e) {
                allSegments.push(currentChunk.map(p => [p.lat, p.lng]));
              }
            }
            currentChunk = [points[i]]; // Inicia un nuevo chunk
          } else {
            currentChunk.push(points[i]);
          }
        }
        
        // Fetch remaining chunk
        if (currentChunk.length > 1) {
          const coordsStr = currentChunk.map(p => `${p.lng},${p.lat}`).join(';');
          const url = `https://router.project-osrm.org/route/v1/driving/${coordsStr}?geometries=geojson&overview=full`;
          try {
            const res = await fetch(url);
            const data = await res.json();
            if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
              const coords = data.routes[0].geometry.coordinates;
              allSegments.push(coords.map((c: number[]) => [c[1], c[0]]));
            } else {
              allSegments.push(currentChunk.map(p => [p.lat, p.lng]));
            }
          } catch (e) {
            allSegments.push(currentChunk.map(p => [p.lat, p.lng]));
          }
        }
        
        setRouteSegments(allSegments);
      };
      
      fetchNormalSegments();
    }
  }, [points, ambosCarriles]);

  // Crear iconos de marcador personalizados con estilo neón
  const createNeonIcon = (index: number) => {
    return L.divIcon({
      className: 'bg-transparent',
      html: `<div class="w-8 h-8 -ml-4 -mt-4 rounded-full bg-cyan-500/20 border-2 border-cyan-400 flex items-center justify-center backdrop-blur-md shadow-[0_0_15px_rgba(0,240,255,0.6)] text-white text-xs font-bold cursor-pointer hover:bg-cyan-500/40 transition-colors">${index + 1}</div>`,
      iconSize: [0, 0],
    });
  };

  return (
    <div className="w-full h-full relative bg-[#03060D] z-0">
      <MapContainer
        center={position}
        zoom={14}
        style={{ height: '100%', width: '100%', background: '#03060D' }}
        zoomControl={false}
        attributionControl={false}
      >
        <MapClickHandler onMapClick={onMapClick} />
        
        {/* Usamos Stadia Alidade Smooth Dark, el mapa indicado originalmente */}
        <TileLayer
          url="https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png"
          className="map-tiles-smooth-dark"
        />
        
        {/* Trazar la ruta (ya sea ruteada por calles o la línea recta inicial/fallback) */}
        {routeSegments.length > 0 ? (
          routeSegments.map((segment, idx) => (
            <Polyline 
              key={idx}
              positions={segment} 
              pathOptions={{ 
                color: '#00f0ff', 
                weight: ambosCarriles ? 12 : 6,
                opacity: ambosCarriles ? 0.6 : 1,
                lineCap: 'round',
                lineJoin: 'round',
                className: "neon-polyline"
              }} 
            />
          ))
        ) : (
          // Fallback visual si routeSegments falla pero hay puntos conectados
          points.length > 1 && (() => {
            const rawSegments: [number, number][][] = [];
            let currentChunk: [number, number][] = [[points[0].lat, points[0].lng]];
            for (let i = 1; i < points.length; i++) {
              if (points[i].disconnected) {
                if (currentChunk.length > 1) rawSegments.push(currentChunk);
                currentChunk = [[points[i].lat, points[i].lng]];
              } else {
                currentChunk.push([points[i].lat, points[i].lng]);
              }
            }
            if (currentChunk.length > 1) rawSegments.push(currentChunk);
            
            return rawSegments.map((segment, idx) => (
              <Polyline 
                key={idx}
                positions={segment} 
                pathOptions={{ 
                  color: '#00f0ff', 
                  weight: ambosCarriles ? 12 : 6,
                  opacity: ambosCarriles ? 0.6 : 1,
                  lineCap: 'round',
                  lineJoin: 'round',
                  className: "neon-polyline"
                }} 
              />
            ));
          })()
        )}

        {/* Marcadores de puntos */}
        {points.map((p, i) => (
          <Marker 
            key={i} 
            position={[p.lat, p.lng]} 
            icon={createNeonIcon(i)}
            eventHandlers={{
              click: () => {
                if (onPointClick) onPointClick(i);
              }
            }}
          />
        ))}
      </MapContainer>

      <div className="absolute inset-0 pointer-events-none z-[400] shadow-[inset_0_0_80px_40px_#03060D]" />
      
      <style>{`
        .map-tiles-smooth-dark {
          /* Ajuste para escala de grises puros y mantener el estilo Liquid Glass */
          filter: grayscale(1) brightness(0.9) contrast(1.1);
        }
        .leaflet-control-container {
          display: none;
        }
        .neon-polyline {
          filter: drop-shadow(0 0 8px rgba(0, 240, 255, 1));
        }
      `}</style>
    </div>
  );
}