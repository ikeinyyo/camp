export const MAP_ZONES = [
  { id: "pool", name: "Piscina", shortName: "Piscina", description: "Zona de baño y descanso.", aliases: ["Piscina"] },
  { id: "gazebo", name: "Cenador", shortName: "Cenador", description: "Espacio cubierto para reuniones y actividades.", aliases: ["Cenador"] },
  { id: "house", name: "Casa", shortName: "Casa", description: "Casa principal y punto de referencia del recinto.", aliases: ["Casa", "La casa"] },
  { id: "central-plaza", name: "Plaza Central", shortName: "Plaza", description: "Punto de encuentro principal para actuaciones, cenas y celebraciones.", aliases: ["Plaza Central", "Barbacoa"] },
  { id: "west-grove", name: "Pinada Oeste", shortName: "Pinada Oeste", description: "Pinada junto al lado oeste del recinto.", aliases: ["Pinada Oeste"] },
  { id: "south-grove", name: "Pinada Sur", shortName: "Pinada Sur", description: "Zona arbolada junto al cenador y la pista.", aliases: ["Pinada Sur", "Pinada sur"] },
  { id: "court", name: "Pista polideportiva", shortName: "Pista", description: "Zona deportiva para juegos y actividades de movimiento.", aliases: ["Pista polideportiva"] },
] as const;

export type MapZoneId = (typeof MAP_ZONES)[number]["id"];

function normalizeLocation(value: string) {
  return value.trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("es");
}

export function getMapZone(location: string) {
  const normalized = normalizeLocation(location);
  return MAP_ZONES.find((zone) => zone.aliases.some((alias) => normalizeLocation(alias) === normalized));
}
