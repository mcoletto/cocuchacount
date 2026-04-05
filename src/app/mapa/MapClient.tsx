"use client";

import { ComposableMap, Geographies, Geography, ZoomableGroup, Marker } from "react-simple-maps";
import { useState } from "react";

const GEO_URL = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

const FLAG: Record<string, string> = {
  Argentina: "🇦🇷",
  Uruguay: "🇺🇾",
  Brasil: "🇧🇷",
  "Estados Unidos": "🇺🇸",
};

// ISO numeric codes → country name
const COUNTRY_ISO: Record<number, string> = {
  32: "Argentina",
  858: "Uruguay",
  76: "Brasil",
  840: "Estados Unidos",
};

// Approximate centroids [lon, lat] for marker labels
const COUNTRY_CENTROIDS: Record<string, [number, number]> = {
  Argentina: [-64, -34],
  Uruguay: [-56, -33],
  Brasil: [-52, -14],
  "Estados Unidos": [-98, 38],
};

interface MapClientProps {
  byCountry: Array<{ country: string; total: number }>;
}

export function MapClient({ byCountry }: MapClientProps) {
  const [tooltip, setTooltip] = useState<{ country: string; total: number } | null>(null);
  const maxTotal = byCountry.length > 0 ? byCountry[0].total : 1;
  const totalGlobal = byCountry.reduce((s, c) => s + c.total, 0);

  const dataMap = new Map(byCountry.map((c) => [c.country, c.total]));

  function getColor(numericId: number): string {
    const country = COUNTRY_ISO[numericId];
    if (!country) return "#f0f0f0";
    const total = dataMap.get(country) ?? 0;
    if (total === 0) return "#f0f0f0";
    const intensity = 0.2 + (total / maxTotal) * 0.8;
    return `rgba(232, 25, 44, ${intensity})`;
  }

  return (
    <div className="px-4 pt-8 space-y-4 pb-8">
      <h1 className="text-2xl font-black tracking-tight">Mapa</h1>

      {/* Stats rápidas */}
      {byCountry.length > 0 && (
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-2xl p-4 shadow-soft border border-border/60">
            <p className="text-xs text-muted-foreground">Total global</p>
            <p className="text-3xl font-black text-coca-red">{totalGlobal}</p>
            <p className="text-xs text-muted-foreground">cocas</p>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-soft border border-border/60">
            <p className="text-xs text-muted-foreground">Países visitados</p>
            <p className="text-3xl font-black text-foreground">{byCountry.length}</p>
            <p className="text-xs text-muted-foreground">países</p>
          </div>
        </div>
      )}

      {/* Mapa */}
      <div className="bg-white rounded-3xl overflow-hidden shadow-soft border border-border/60">
        <ComposableMap
          projection="geoMercator"
          projectionConfig={{ scale: 120, center: [-20, 10] }}
          style={{ width: "100%", height: "auto" }}
          viewBox="0 0 800 500"
        >
          <ZoomableGroup zoom={1} minZoom={0.5} maxZoom={8}>
            <Geographies geography={GEO_URL}>
              {({ geographies }) =>
                geographies.map((geo) => {
                  const numericId = parseInt(geo.id, 10);
                  const countryName = COUNTRY_ISO[numericId];
                  const isHighlighted = !!countryName && dataMap.has(countryName);
                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      fill={getColor(numericId)}
                      stroke={isHighlighted ? "#E8192C" : "#d1d5db"}
                      strokeWidth={isHighlighted ? 1.5 : 0.3}
                      onMouseEnter={() => {
                        if (countryName && dataMap.has(countryName)) {
                          setTooltip({ country: countryName, total: dataMap.get(countryName)! });
                        }
                      }}
                      onMouseLeave={() => setTooltip(null)}
                      onClick={() => {
                        if (countryName && dataMap.has(countryName)) {
                          setTooltip({ country: countryName, total: dataMap.get(countryName)! });
                        }
                      }}
                      style={{
                        default: { outline: "none" },
                        hover: { outline: "none", opacity: 0.85, cursor: "pointer" },
                        pressed: { outline: "none" },
                      }}
                    />
                  );
                })
              }
            </Geographies>
            {/* Markers con número */}
            {byCountry.map(({ country, total }) => {
              const coords = COUNTRY_CENTROIDS[country];
              if (!coords) return null;
              return (
                <Marker key={country} coordinates={coords}>
                  <circle r={14} fill="white" stroke="#E8192C" strokeWidth={1.5} />
                  <text
                    textAnchor="middle"
                    dominantBaseline="central"
                    style={{ fontSize: 10, fontWeight: 700, fill: "#E8192C", fontFamily: "system-ui" }}
                  >
                    {total}
                  </text>
                </Marker>
              );
            })}
          </ZoomableGroup>
        </ComposableMap>
      </div>

      {/* Tooltip al tocar en mobile */}
      {tooltip && (
        <div className="bg-white rounded-2xl p-4 shadow-card border border-coca-red/20 flex items-center gap-3">
          <span className="text-3xl">{FLAG[tooltip.country] ?? "🌍"}</span>
          <div>
            <p className="font-semibold">{tooltip.country}</p>
            <p className="text-coca-red font-black text-2xl">{tooltip.total} <span className="text-sm font-normal text-muted-foreground">cocas</span></p>
          </div>
        </div>
      )}

      {/* Ranking países */}
      {byCountry.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide px-1">Ranking</p>
          <div className="space-y-2">
            {byCountry.map(({ country, total }, i) => {
              const pct = (total / maxTotal) * 100;
              return (
                <div key={country} className="bg-white rounded-2xl p-4 shadow-soft border border-border/60 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{FLAG[country] ?? "🌍"}</span>
                      <span className="font-semibold text-sm">
                        {i === 0 ? "🥇 " : i === 1 ? "🥈 " : i === 2 ? "🥉 " : ""}{country}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-coca-red font-black text-lg">{total}</span>
                      <span className="text-xs text-muted-foreground ml-1">
                        ({((total / totalGlobal) * 100).toFixed(0)}%)
                      </span>
                    </div>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-coca-red rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {byCountry.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-12">No hay datos de países aún</p>
      )}
    </div>
  );
}
