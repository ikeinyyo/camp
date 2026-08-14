export const SECTION_DEFINITIONS = [
  {
    id: "agenda",
    name: "Agenda",
    description: "Agenda del evento y detalle de las actividades.",
    paths: ["/agenda"],
    defaultEnabled: true,
  },
  {
    id: "profile",
    name: "Perfil",
    description: "Perfil activo, puntos, puesto y código QR del participante.",
    paths: ["/perfil"],
    defaultEnabled: true,
  },
  {
    id: "ranking",
    name: "Ranking",
    description: "Clasificación general de todos los participantes.",
    paths: ["/ranking"],
    defaultEnabled: true,
  },
  {
    id: "access",
    name: "Acceso",
    description: "Inicio de sesión, registro y selector de usuarios activos.",
    paths: ["/login", "/registro"],
    defaultEnabled: true,
  },
] as const;

export type SectionId = (typeof SECTION_DEFINITIONS)[number]["id"];
export type SectionAvailability = Record<SectionId, boolean>;

export function getDefaultSectionAvailability(): SectionAvailability {
  return Object.fromEntries(
    SECTION_DEFINITIONS.map((section) => [section.id, section.defaultEnabled]),
  ) as SectionAvailability;
}
