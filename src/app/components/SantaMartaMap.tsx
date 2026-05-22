import { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Polyline,
  Marker,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Componente para capturar los clics en el mapa y devolver lat/lng
function MapClickHandler({
  onMapClick,
}: {
  onMapClick?: (latlng: { lat: number; lng: number }) => void;
}) {
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
  points?: {
    lat: number;
    lng: number;
    disconnected?: boolean;
  }[];
  onMapClick?: (latlng: { lat: number; lng: number }) => void;
  onPointClick?: (index: number) => void;
  ambosCarriles?: boolean;
}

export function SantaMartaMap({
  points = [],
  onMapClick,
  onPointClick,
  ambosCarriles = false,
}: SantaMartaMapProps) {
  const position: [number, number] = [11.2408, -74.199];
  const [routeSegments, setRouteSegments] = useState<
    [number, number][][]
  >([]);

  const toLatLng = (coords: number[][]): [number, number][] =>
    coords.map((c: number[]) => [c[1], c[0]]);

  const interpolateRoute = (
    route: [number, number][],
    targetLen: number,
  ): [number, number][] => {
    if (route.length <= 1 || targetLen <= 1) return route;
    const out: [number, number][] = [];
    const last = route.length - 1;
    for (let i = 0; i < targetLen; i++) {
      const t = (i / (targetLen - 1)) * last;
      const idx = Math.floor(t);
      const frac = t - idx;
      const p1 = route[idx];
      const p2 = route[Math.min(idx + 1, last)];
      out.push([
        p1[0] + (p2[0] - p1[0]) * frac,
        p1[1] + (p2[1] - p1[1]) * frac,
      ]);
    }
    return out;
  };

  const buildCenterline = (
    routeAB: [number, number][],
    routeBA: [number, number][],
  ): [number, number][] => {
    const baForward = [...routeBA].reverse();
    const targetLen = Math.max(
      routeAB.length,
      baForward.length,
    );
    const abNorm = interpolateRoute(routeAB, targetLen);
    const baNorm = interpolateRoute(baForward, targetLen);

    return abNorm.map((p, i) => [
      (p[0] + baNorm[i][0]) / 2,
      (p[1] + baNorm[i][1]) / 2,
    ]);
  };

  const distMeters = (
    a: [number, number],
    b: [number, number],
  ) => {
    const [lat1, lon1] = a;
    const [lat2, lon2] = b;
    const R = 6371e3;
    const p1 = (lat1 * Math.PI) / 180;
    const p2 = (lat2 * Math.PI) / 180;
    const dp = ((lat2 - lat1) * Math.PI) / 180;
    const dl = ((lon2 - lon1) * Math.PI) / 180;
    const h =
      Math.sin(dp / 2) ** 2 +
      Math.cos(p1) * Math.cos(p2) * Math.sin(dl / 2) ** 2;
    return R * (2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h)));
  };

  const routeLengthMeters = (route: [number, number][]) => {
    let total = 0;
    for (let i = 1; i < route.length; i++) {
      total += distMeters(route[i - 1], route[i]);
    }
    return total;
  };

  const isCenterlineStable = (
    centerline: [number, number][],
    routeAB: [number, number][],
    routeBA: [number, number][],
    straightDist: number,
  ) => {
    if (centerline.length < 2) return false;
    const centerLen = routeLengthMeters(centerline);
    if (centerLen > Math.max(straightDist * 1.45, straightDist + 45)) {
      return false;
    }

    const targetLen = Math.max(routeAB.length, routeBA.length, 12);
    const abNorm = interpolateRoute(routeAB, targetLen);
    const baNorm = interpolateRoute([...routeBA].reverse(), targetLen);
    let avgSep = 0;
    let maxSep = 0;
    for (let i = 0; i < targetLen; i++) {
      const sep = distMeters(abNorm[i], baNorm[i]);
      avgSep += sep;
      if (sep > maxSep) maxSep = sep;
    }
    avgSep /= targetLen;

    // Si las dos rutas están demasiado separadas, no representan dos carriles de la misma vía
    // y el promedio genera trayectos raros.
    return avgSep <= 45 && maxSep <= 85;
  };

  useEffect(() => {
    window.dispatchEvent(new Event("resize"));
  }, []);

  // Calcular la ruta siguiendo las calles usando la API pública de OSRM
  useEffect(() => {
    if (points.length < 2) {
      setRouteSegments([]);
      return;
    }

    if (ambosCarriles) {
      // En ambos carriles no queremos "respetar dirección" visualmente:
      // buscamos la forma de la vía y dibujamos una sola línea central.
      const fetchSegments = async () => {
        const allSegments: [number, number][][] = [];
        let currentSegmentCoords: [number, number][] = [];

        const getStraightDist = (
          lat1: number,
          lon1: number,
          lat2: number,
          lon2: number,
        ) => {
          const R = 6371e3;
          const p1 = (lat1 * Math.PI) / 180;
          const p2 = (lat2 * Math.PI) / 180;
          const dp = ((lat2 - lat1) * Math.PI) / 180;
          const dl = ((lon2 - lon1) * Math.PI) / 180;
          const a =
            Math.sin(dp / 2) ** 2 +
            Math.cos(p1) * Math.cos(p2) * Math.sin(dl / 2) ** 2;
          return (
            R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)))
          );
        };

        for (let i = 0; i < points.length - 1; i++) {
          const pA = points[i];
          const pB = points[i + 1];

          if (pB.disconnected) {
            if (currentSegmentCoords.length > 0) {
              allSegments.push([...currentSegmentCoords]);
            }
            currentSegmentCoords = [];
            continue;
          }

          const straightDist = getStraightDist(
            pA.lat,
            pA.lng,
            pB.lat,
            pB.lng,
          );

          const commonQs =
            "geometries=geojson&overview=full&alternatives=false&steps=false";
          // En modo ambos carriles consultamos driving en ambos sentidos
          // para capturar cada calzada y luego calcular una línea media estable.
          const profile = "driving";
          const urlAB = `https://router.project-osrm.org/route/v1/${profile}/${pA.lng},${pA.lat};${pB.lng},${pB.lat}?${commonQs}`;
          const urlBA = `https://router.project-osrm.org/route/v1/${profile}/${pB.lng},${pB.lat};${pA.lng},${pA.lat}?${commonQs}`;

          try {
            const [resAB, resBA] = await Promise.all([
              fetch(urlAB),
              fetch(urlBA),
            ]);
            const [dataAB, dataBA] = await Promise.all([
              resAB.json(),
              resBA.json(),
            ]);

            const routeAB =
              dataAB.code === "Ok" && dataAB.routes?.length > 0
                ? dataAB.routes[0]
                : null;
            const routeBA =
              dataBA.code === "Ok" && dataBA.routes?.length > 0
                ? dataBA.routes[0]
                : null;

            let coords: [number, number][] = [
              [pA.lat, pA.lng],
              [pB.lat, pB.lng],
            ];
            const maxAllowedDist = Math.max(
              straightDist * 1.7,
              straightDist + 90,
            );

            if (routeAB && routeBA) {
              const distDiff = Math.abs(
                routeAB.distance - routeBA.distance,
              );
              const abCoords = toLatLng(
                routeAB.geometry.coordinates,
              );
              const baCoords = toLatLng(
                routeBA.geometry.coordinates,
              );
              const bothReasonable =
                routeAB.distance <= maxAllowedDist &&
                routeBA.distance <= maxAllowedDist;
              const closeEnough = distDiff <= 140;
              const similarRatio =
                Math.max(routeAB.distance, routeBA.distance) /
                  Math.max(
                    1,
                    Math.min(
                      routeAB.distance,
                      routeBA.distance,
                    ),
                  ) <=
                1.35;

              if (bothReasonable && closeEnough && similarRatio) {
                const centerline = buildCenterline(
                  abCoords,
                  baCoords,
                );
                const centerIsStable = isCenterlineStable(
                  centerline,
                  abCoords,
                  baCoords,
                  straightDist,
                );
                coords = centerIsStable ? centerline : abCoords;
              } else {
                const chooseAB =
                  routeAB.distance <= routeBA.distance;
                const best = chooseAB ? routeAB : routeBA;
                coords = toLatLng(best.geometry.coordinates);
                if (!chooseAB) coords.reverse();
              }
            } else if (routeAB) {
              coords = toLatLng(routeAB.geometry.coordinates);
            } else if (routeBA) {
              coords = toLatLng(
                routeBA.geometry.coordinates,
              ).reverse();
            }

            const segmentToAppend =
              currentSegmentCoords.length > 0
                ? coords.slice(1)
                : coords;
            currentSegmentCoords = [
              ...currentSegmentCoords,
              ...segmentToAppend,
            ];
          } catch (err) {
            const fallback = [
              [pA.lat, pA.lng],
              [pB.lat, pB.lng],
            ] as [number, number][];
            if (currentSegmentCoords.length > 0)
              fallback.shift();
            currentSegmentCoords = [
              ...currentSegmentCoords,
              ...fallback,
            ];
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

        let currentChunk: { lat: number; lng: number }[] = [
          points[0],
        ];
        for (let i = 1; i < points.length; i++) {
          if (points[i].disconnected) {
            // Fetch route for chunk
            if (currentChunk.length > 1) {
              const coordsStr = currentChunk
                .map((p) => `${p.lng},${p.lat}`)
                .join(";");
              const url = `https://router.project-osrm.org/route/v1/driving/${coordsStr}?geometries=geojson&overview=full`;
              try {
                const res = await fetch(url);
                const data = await res.json();
                if (
                  data.code === "Ok" &&
                  data.routes &&
                  data.routes.length > 0
                ) {
                  const coords =
                    data.routes[0].geometry.coordinates;
                  allSegments.push(
                    coords.map((c: number[]) => [c[1], c[0]]),
                  );
                } else {
                  allSegments.push(
                    currentChunk.map((p) => [p.lat, p.lng]),
                  );
                }
              } catch (e) {
                allSegments.push(
                  currentChunk.map((p) => [p.lat, p.lng]),
                );
              }
            }
            currentChunk = [points[i]]; // Inicia un nuevo chunk
          } else {
            currentChunk.push(points[i]);
          }
        }

        // Fetch remaining chunk
        if (currentChunk.length > 1) {
          const coordsStr = currentChunk
            .map((p) => `${p.lng},${p.lat}`)
            .join(";");
          const url = `https://router.project-osrm.org/route/v1/driving/${coordsStr}?geometries=geojson&overview=full`;
          try {
            const res = await fetch(url);
            const data = await res.json();
            if (
              data.code === "Ok" &&
              data.routes &&
              data.routes.length > 0
            ) {
              const coords =
                data.routes[0].geometry.coordinates;
              allSegments.push(
                coords.map((c: number[]) => [c[1], c[0]]),
              );
            } else {
              allSegments.push(
                currentChunk.map((p) => [p.lat, p.lng]),
              );
            }
          } catch (e) {
            allSegments.push(
              currentChunk.map((p) => [p.lat, p.lng]),
            );
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
      className: "bg-transparent",
      html: `<div class="w-8 h-8 -ml-4 -mt-4 rounded-full bg-cyan-500/20 border-2 border-cyan-400 flex items-center justify-center backdrop-blur-md shadow-[0_0_15px_rgba(0,240,255,0.6)] text-white text-xs font-bold cursor-pointer hover:bg-cyan-500/40 transition-colors">${index + 1}</div>`,
      iconSize: [0, 0],
    });
  };

  return (
    <div className="w-full h-full relative bg-[#03060D] z-0">
      <MapContainer
        center={position}
        zoom={14}
        style={{
          height: "100%",
          width: "100%",
          background: "#03060D",
        }}
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
        {routeSegments.length > 0
          ? routeSegments.map((segment, idx) => (
              <Polyline
                key={idx}
                positions={segment}
                pathOptions={{
                  color: "#00f0ff",
                  weight: ambosCarriles ? 12 : 6,
                  opacity: ambosCarriles ? 0.6 : 1,
                  lineCap: "round",
                  lineJoin: "round",
                  className: "neon-polyline",
                }}
              />
            ))
          : // Fallback visual si routeSegments falla pero hay puntos conectados
            points.length > 1 &&
            (() => {
              const rawSegments: [number, number][][] = [];
              let currentChunk: [number, number][] = [
                [points[0].lat, points[0].lng],
              ];
              for (let i = 1; i < points.length; i++) {
                if (points[i].disconnected) {
                  if (currentChunk.length > 1)
                    rawSegments.push(currentChunk);
                  currentChunk = [
                    [points[i].lat, points[i].lng],
                  ];
                } else {
                  currentChunk.push([
                    points[i].lat,
                    points[i].lng,
                  ]);
                }
              }
              if (currentChunk.length > 1)
                rawSegments.push(currentChunk);

              return rawSegments.map((segment, idx) => (
                <Polyline
                  key={idx}
                  positions={segment}
                  pathOptions={{
                    color: "#00f0ff",
                    weight: ambosCarriles ? 12 : 6,
                    opacity: ambosCarriles ? 0.6 : 1,
                    lineCap: "round",
                    lineJoin: "round",
                    className: "neon-polyline",
                  }}
                />
              ));
            })()}

        {/* Marcadores de puntos */}
        {points.map((p, i) => (
          <Marker
            key={i}
            position={[p.lat, p.lng]}
            icon={createNeonIcon(i)}
            eventHandlers={{
              click: () => {
                if (onPointClick) onPointClick(i);
              },
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
