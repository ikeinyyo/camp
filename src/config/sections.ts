export const SECTION_DEFINITIONS = [
  {
    id: "agenda",
    name: "Agenda",
    description: "Agenda del evento y detalle de las actividades.",
    paths: ["/agenda"],
    defaultEnabled: true,
    defaultRequiresAuth: false,
  },
  {
    id: "profile",
    name: "Perfil",
    description: "Perfil activo, puntos, puesto e historial del participante.",
    paths: ["/perfil"],
    defaultEnabled: true,
    defaultRequiresAuth: true,
  },
  {
    id: "ranking",
    name: "Ranking",
    description: "Clasificación general de todos los participantes.",
    paths: ["/ranking"],
    defaultEnabled: true,
    defaultRequiresAuth: true,
  },
  {
    id: "games",
    name: "Minijuegos",
    description: "Trivia, palabra y encuesta diaria para ganar puntos antes del evento.",
    paths: ["/juegos"],
    defaultEnabled: true,
    defaultRequiresAuth: true,
  },
  {
    id: "domino",
    name: "Dominó",
    description: "Inscripción y clasificación del campeonato de dominó.",
    paths: ["/domino"],
    defaultEnabled: true,
    defaultRequiresAuth: true,
  },
  {
    id: "vouchers",
    name: "Vales",
    description: "Catálogo de tareas con recompensa y solicitud mediante QR.",
    paths: ["/vales"],
    defaultEnabled: true,
    defaultRequiresAuth: true,
  },
  {
    id: "map",
    name: "Mapa",
    description: "Plano interactivo de las zonas y sus actividades.",
    paths: ["/mapa"],
    defaultEnabled: true,
    defaultRequiresAuth: false,
  },
  {
    id: "information",
    name: "Información",
    description: "Preparativos, funcionamiento de la aplicación e información práctica.",
    paths: ["/informacion"],
    defaultEnabled: true,
    defaultRequiresAuth: false,
  },
  {
    id: "tapas",
    name: "Concurso de tapas",
    description: "Catálogo, votación y clasificación del concurso de tapas.",
    paths: ["/tapas"],
    defaultEnabled: true,
    defaultRequiresAuth: true,
  },
  {
    id: "talents",
    name: "Concurso de talentos",
    description: "Actuaciones, votación y clasificación del concurso de talentos.",
    paths: ["/talentos"],
    defaultEnabled: true,
    defaultRequiresAuth: true,
  },
  {
    id: "access",
    name: "Acceso",
    description: "Inicio de sesión, registro y selector de usuarios activos.",
    paths: ["/login", "/registro"],
    defaultEnabled: true,
    defaultRequiresAuth: false,
  },
] as const;

export type SectionId = (typeof SECTION_DEFINITIONS)[number]["id"];
export type SectionAvailability = Record<SectionId, boolean>;
export type SectionAuthentication = Record<SectionId, boolean>;

export function getDefaultSectionAvailability(): SectionAvailability {
  return Object.fromEntries(
    SECTION_DEFINITIONS.map((section) => [section.id, section.defaultEnabled]),
  ) as SectionAvailability;
}

export function getDefaultSectionAuthentication(): SectionAuthentication {
  return Object.fromEntries(
    SECTION_DEFINITIONS.map((section) => [section.id, section.defaultRequiresAuth]),
  ) as SectionAuthentication;
}
